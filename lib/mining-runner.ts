import pMap from "p-map";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  keywordStat,
  painPoint,
  painPointComment,
  scraper,
  scraperRun,
  user,
} from "@/lib/db/schema";
import { extractPainPoints } from "@/lib/ai";
import {
  filterPostsByProblemPatterns,
  fetchComments,
  fetchSubredditPostsBatched,
  rankRedditPosts,
  resolveProblemPatterns,
  type RedditPost,
} from "@/lib/reddit";
import { clusterPainPoint } from "@/lib/clustering";
import { claimRedditPostForAiProcessing } from "@/lib/reddit-idempotency";
import {
  getRedditTimeRangeForWindow,
  getTimeWindowAgeSeconds,
  type TimeWindow,
} from "@/lib/time-window";

export type MiningDepth = "basic" | "deep" | "advanced";

type ExecuteMiningRunInput = {
  scraperId: string;
  keyword: string;
  subreddits: string[];
  customPatterns: string[];
  miningDepth: MiningDepth;
  timeWindow: TimeWindow;
  userId: string;
  workspaceId: string | null;
  maxSubreddits?: number;
  maxPostsPerSubreddit?: number;
  processingLimit?: number;
};

type ExecuteMiningRunResult = {
  runId: string;
  postsFetched: number;
  postsMatched: number;
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

function cleanCommentBody(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
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
  timeWindow,
  userId,
  workspaceId,
  maxSubreddits,
  maxPostsPerSubreddit,
  processingLimit,
}: ExecuteMiningRunInput): Promise<ExecuteMiningRunResult> {
  const runId = crypto.randomUUID();
  const startTime = new Date();
  const isAdvanced = miningDepth === "advanced";
  const subLimit =
    maxSubreddits ?? (isAdvanced ? 15 : miningDepth === "deep" ? 10 : 5);
  const postsPerSub =
    maxPostsPerSubreddit ??
    (isAdvanced ? 350 : miningDepth === "deep" ? 250 : 120);
  const analyzeLimit =
    processingLimit ?? (isAdvanced ? 20 : miningDepth === "deep" ? 10 : 3);

  try {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });
    const anonymize = userRecord?.anonymizeRedditUsernames ?? false;

    // Insert a scraperRun record upfront so SSE can track progress
    await db.insert(scraperRun).values({
      id: runId,
      scraperId,
      status: "scanning",
      startedAt: startTime,
      finishedAt: startTime, // placeholder, updated on completion
      postsFetched: 0,
      postsMatched: 0,
      commentsFetched: 0,
      newPainPoints: 0,
    });

    let allPosts: RedditPost[] = [];
    const targetSubreddits = subreddits.slice(0, Math.max(1, subLimit));

    const subredditFetchResults = await Promise.allSettled(
      targetSubreddits.map((sub) =>
        fetchSubredditPostsBatched(sub, keyword, {
          maxPosts: postsPerSub,
          time: getRedditTimeRangeForWindow(timeWindow),
        }),
      ),
    );

    for (const result of subredditFetchResults) {
      if (result.status === "fulfilled") {
        allPosts.push(...result.value);
      } else {
        console.error("Subreddit fetch failed:", result.reason);
      }
    }

    const problemPatterns = resolveProblemPatterns(customPatterns);
    const fetchedPosts = dedupePosts(allPosts);
    const rankedPosts = rankRedditPosts(fetchedPosts, keyword, problemPatterns);
    allPosts = filterPostsByProblemPatterns(rankedPosts, problemPatterns);

    // Update phase: scanning → extracting
    const nowSeconds = Math.floor(Date.now() / 1_000);
    const oldestAllowedUtc = nowSeconds - getTimeWindowAgeSeconds(timeWindow);
    allPosts = allPosts.filter((post) => post.created_utc >= oldestAllowedUtc);
    allPosts = rankRedditPosts(allPosts, keyword, problemPatterns);

    await db
      .update(scraperRun)
      .set({
        status: "extracting",
        postsFetched: fetchedPosts.length,
        postsMatched: allPosts.length,
      })
      .where(eq(scraperRun.id, runId));

    let commentsFetched = 0;
    let newPainPoints = 0;
    const patterns = customPatterns
      .map((pattern) => pattern.trim())
      .filter(Boolean);
    const postsToAnalyze = allPosts.slice(0, Math.max(1, analyzeLimit));
    const commentsByPostId = new Map<
      string,
      Awaited<ReturnType<typeof fetchComments>>
    >();

    const commentFetchResults = await pMap(
      postsToAnalyze,
      async (post) => {
        try {
          const comments = await fetchComments(post.id, post.subreddit);
          return {
            status: "fulfilled" as const,
            value: { postId: post.id, comments },
          };
        } catch (error) {
          return { status: "rejected" as const, reason: error };
        }
      },
      { concurrency: 5 },
    );

    for (const result of commentFetchResults) {
      if (result.status !== "fulfilled") {
        console.error(
          "Comment scrape failed for one analyzed post:",
          result.reason,
        );
        continue;
      }

      commentsByPostId.set(result.value.postId, result.value.comments);
      commentsFetched += result.value.comments.length;
    }

    for (const post of postsToAnalyze) {
      const shouldProcessWithAi = await claimRedditPostForAiProcessing(
        post.id,
        userId,
      );
      if (!shouldProcessWithAi) {
        continue;
      }

      const comments = commentsByPostId.get(post.id) ?? [];

      const points = await extractPainPoints(
        {
          title: post.title,
          selftext: post.selftext,
          url: post.url,
          author: post.author,
          subreddit: post.subreddit,
          comments: comments.map((comment) => ({ body: comment.body })),
        },
        patterns,
      );

      if (!points || points.length === 0) continue;

      const painPointsToInsert = [];
      const commentsToInsert = [];
      const clusterJobs = [];

      for (const point of points) {
        const painPointId = crypto.randomUUID();
        painPointsToInsert.push({
          id: painPointId,
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
          author: anonymize ? "[Anonymized]" : post.author,
          sentiment: point.sentiment,
          commentCount: comments.length,
          mentionCount: 1,
          workspaceId,
          updatedAt: new Date(),
        });

        const commentRows = comments
          .filter((comment) => {
            const body = cleanCommentBody(comment.body ?? "");
            if (!body) return false;
            const normalized = body.toLowerCase();
            return normalized !== "[deleted]" && normalized !== "[removed]";
          })
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, 12)
          .map((comment) => ({
            id: crypto.randomUUID(),
            body: cleanCommentBody(comment.body),
            author: anonymize ? "[Anonymized]" : comment.author || "unknown",
            score: comment.score ?? 0,
            commentUrl: comment.permalink || null,
            painScore: point.painIntensity ?? 0,
            painPointId,
          }));

        if (commentRows.length > 0) {
          commentsToInsert.push(...commentRows);
        }
        newPainPoints += 1;

        clusterJobs.push(painPointId);
      }

      if (painPointsToInsert.length > 0) {
        await db.insert(painPoint).values(painPointsToInsert);
      }

      if (commentsToInsert.length > 0) {
        await db.insert(painPointComment).values(commentsToInsert);
      }

      for (const painPointId of clusterJobs) {
        // Fire-and-forget: embed + cluster this pain point
        void clusterPainPoint(painPointId, userId, workspaceId).catch((err) =>
          console.error(`Embedding/clustering failed for ${painPointId}:`, err),
        );
      }
    }

    // Update phase: extracting → clustering
    await db
      .update(scraperRun)
      .set({
        status: "clustering",
        commentsFetched,
        newPainPoints,
      })
      .where(eq(scraperRun.id, runId));

    // Update phase: clustering → completed
    await db
      .update(scraperRun)
      .set({
        status: "completed",
        finishedAt: new Date(),
        postsFetched: fetchedPosts.length,
        postsMatched: allPosts.length,
        commentsFetched,
        newPainPoints,
      })
      .where(eq(scraperRun.id, runId));

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
        postsScanned: sql`${scraper.postsScanned} + ${fetchedPosts.length}`,
        painPointsFound: sql`${scraper.painPointsFound} + ${newPainPoints}`,
        errorCount: 0,
        lastError: null,
      })
      .where(eq(scraper.id, scraperId));

    return {
      runId,
      postsFetched: fetchedPosts.length,
      postsMatched: allPosts.length,
      commentsFetched,
      newPainPoints,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error).slice(0, 2_000);
    // Upsert: update if the scanning row already exists, insert otherwise
    await db
      .insert(scraperRun)
      .values({
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
      })
      .onConflictDoUpdate({
        target: scraperRun.id,
        set: {
          status: "failed",
          finishedAt: new Date(),
          error: errorMessage,
        },
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
