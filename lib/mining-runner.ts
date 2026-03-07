import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { painPoint, scraper, scraperRun } from "@/lib/db/schema";
import { extractPainPoints } from "@/lib/ai";
import { fetchComments, fetchSubredditPostsBatched, type RedditPost } from "@/lib/reddit";

export type MiningDepth = "basic" | "deep";

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

/**
 * Execute a mining run to fetch and analyze posts from specified subreddits.
 *
 * This function orchestrates the mining process by generating a unique run ID, determining the limits for subreddit and post fetching based on the mining depth, and fetching posts from the specified subreddits. It then deduplicates the posts, filters them based on the mining depth, and extracts pain points from the comments of the posts. Finally, it logs the results of the mining run to the database and updates the scraper's status. In case of an error, it logs the failure and updates the scraper's error count.
 *
 * @param scraperId - The ID of the scraper initiating the mining run.
 * @param keyword - The keyword to search for in the posts.
 * @param subreddits - An array of subreddit names to fetch posts from.
 * @param customPatterns - An array of custom patterns to identify pain points.
 * @param miningDepth - The depth of mining, which can be "deep" or another value.
 * @param userId - The ID of the user initiating the mining run.
 * @param workspaceId - The ID of the workspace associated with the mining run.
 * @param maxSubreddits - The maximum number of subreddits to fetch posts from.
 * @param maxPostsPerSubreddit - The maximum number of posts to fetch from each subreddit.
 * @param processingLimit - The limit on the number of posts to analyze for pain points.
 * @returns A promise that resolves to the result of the mining run, including the run ID, number of posts fetched, comments fetched, and new pain points identified.
 * @throws Error If an error occurs during the mining process.
 */
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
  const isDeep = miningDepth === "deep";
  const subLimit = maxSubreddits ?? (isDeep ? 10 : 5);
  const postsPerSub = maxPostsPerSubreddit ?? (isDeep ? 250 : 120);
  const analyzeLimit = processingLimit ?? (isDeep ? 10 : 3);

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

    if (!isDeep) {
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
