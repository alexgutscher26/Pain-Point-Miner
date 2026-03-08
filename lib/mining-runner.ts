import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { keywordStat, painPoint, scraper, scraperRun } from "@/lib/db/schema";
import { extractPainPoints } from "@/lib/ai";
import { fetchComments, fetchSubredditPostsBatched, type RedditPost } from "@/lib/reddit";

export type MiningDepth = "basic" | "deep" | "advanced";

type ExecuteMiningRunInput = {
  scraperId: string;
  keyword: string;
  subreddits: string[];
  customPatterns: string[];
  miningDepth: MiningDepth;
  userId: string;
  workspaceId: string | null;
  maxSubreddits?: number;
  maxPostsPerSubreddit?: number;
  processingLimit?: number;
};

type ExecuteMiningRunResult = {
  runId: string;
  postsFetched: number;
  commentsFetched: number;
  newPainPoints: number;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

function dedupePosts(posts: RedditPost[]) {
  const seen = new Set<string>();
  const deduped: RedditPost[] = [];
  for (const post of posts) {
    if (seen.has(post.id)) continue;
    seen.add(post.id);
    deduped.push(post);
  }
  return deduped;
}

export async function executeMiningRun({
  scraperId,
  keyword,
  subreddits,
  customPatterns,
  miningDepth,
  userId,
  workspaceId,
  maxSubreddits,
  maxPostsPerSubreddit,
  processingLimit,
}: ExecuteMiningRunInput): Promise<ExecuteMiningRunResult> {
  const runId = crypto.randomUUID();
  const startTime = new Date();
  const isBasic = miningDepth === "basic";
  const isAdvanced = miningDepth === "advanced";
  const subLimit = maxSubreddits ?? (isAdvanced ? 15 : miningDepth === "deep" ? 10 : 5);
  const postsPerSub = maxPostsPerSubreddit ?? (isAdvanced ? 350 : miningDepth === "deep" ? 250 : 120);
  const analyzeLimit = processingLimit ?? (isAdvanced ? 20 : miningDepth === "deep" ? 10 : 3);

  try {
    let allPosts: RedditPost[] = [];
    const targetSubreddits = subreddits.slice(0, Math.max(1, subLimit));

    for (const sub of targetSubreddits) {
      const posts = await fetchSubredditPostsBatched(sub, keyword, {
        maxPosts: postsPerSub,
        time: "year",
      });
      allPosts.push(...posts);
    }

    allPosts = dedupePosts(allPosts);

    if (isBasic) {
      const nowSeconds = Math.floor(Date.now() / 1_000);
      const threeMonthsAgo = nowSeconds - 90 * 24 * 60 * 60;
      allPosts = allPosts.filter((post) => post.created_utc >= threeMonthsAgo);
    }

    let commentsFetched = 0;
    let newPainPoints = 0;
    const patterns = customPatterns.map((pattern) => pattern.trim()).filter(Boolean);

    for (const post of allPosts.slice(0, Math.max(1, analyzeLimit))) {
      const comments = await fetchComments(post.id, post.subreddit);
      commentsFetched += comments.length;

      const points = await extractPainPoints(
        {
          title: post.title,
          selftext: post.selftext,
          url: post.url,
          author: post.author,
          subreddit: post.subreddit,
          comments: comments.map((comment) => ({ body: comment.body })),
        },
        patterns
      );

      if (!points || points.length === 0) continue;

      for (const point of points) {
        await db.insert(painPoint).values({
          id: crypto.randomUUID(),
          title: point.title,
          body: point.body,
          score: point.painIntensity,
          urgency: point.urgency,
          monetizationScore: point.monetizationScore,
          marketMaturity: point.marketMaturity,
          budget: point.budget,
          switchingCosts: point.switchingCosts,
          triedSolutions: point.triedSolutions,
          userId,
          scraperId,
          subreddit: post.subreddit,
          postUrl: post.url,
          author: post.author,
          sentiment: point.sentiment,
          commentCount: comments.length,
          mentionCount: 1,
          workspaceId,
          updatedAt: new Date(),
        });
        newPainPoints += 1;
      }
    }

    await db.insert(scraperRun).values({
      id: runId,
      scraperId,
      status: "completed",
      startedAt: startTime,
      finishedAt: new Date(),
      postsFetched: allPosts.length,
      postsMatched: allPosts.length,
      commentsFetched,
      newPainPoints,
    });

    await db
      .insert(keywordStat)
      .values({
        id: crypto.randomUUID(),
        keyword: keyword.toLowerCase(),
        painPointsFound: newPainPoints,
        lastMatchedAt: newPainPoints > 0 ? new Date() : null,
        scraperId,
        userId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [keywordStat.scraperId, keywordStat.keyword],
        set: {
          painPointsFound: newPainPoints,
          lastMatchedAt: newPainPoints > 0 ? new Date() : null,
          updatedAt: new Date(),
        },
      });

    await db
      .update(scraper)
      .set({
        lastRunAt: new Date(),
        updatedAt: new Date(),
        postsScanned: sql`${scraper.postsScanned} + ${allPosts.length}`,
        painPointsFound: sql`${scraper.painPointsFound} + ${newPainPoints}`,
        errorCount: 0,
        lastError: null,
      })
      .where(eq(scraper.id, scraperId));

    return {
      runId,
      postsFetched: allPosts.length,
      commentsFetched,
      newPainPoints,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error).slice(0, 2_000);
    await db.insert(scraperRun).values({
      id: runId,
      scraperId,
      status: "failed",
      startedAt: startTime,
      finishedAt: new Date(),
      postsFetched: 0,
      postsMatched: 0,
      commentsFetched: 0,
      newPainPoints: 0,
      error: errorMessage,
    });

    await db
      .update(scraper)
      .set({
        updatedAt: new Date(),
        errorCount: sql`${scraper.errorCount} + 1`,
        lastError: errorMessage,
      })
      .where(eq(scraper.id, scraperId));

    throw error;
  }
}
