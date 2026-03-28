import pMap from "p-map";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  keywordStat,
  painPoint,
  painPointComment,
  scraper,
  scraperRun,
  scraperPost,
  user,
} from "@/lib/db/schema";
import { extractPainPoints } from "@/lib/ai";
import {
  fetchComments,
  fetchSubredditPostsMultiSort,
  rankRedditPosts,
  resolveProblemPatterns,
  isSubredditThrottled,
  type RedditPost,
} from "@/lib/reddit";
import { MINING_PRESETS, type MiningDepth } from "@/lib/mining-presets";
import { clusterPainPoint } from "@/lib/clustering";
import { claimRedditPostForAiProcessing } from "@/lib/reddit-idempotency";
import {
  getRedditTimeRangeForWindow,
  getTimeWindowAgeSeconds,
  type TimeWindow,
} from "@/lib/time-window";

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
  const preset = MINING_PRESETS[miningDepth];

  const subLimit = maxSubreddits ?? preset.subreddits;
  const postsPerSub = maxPostsPerSubreddit ?? preset.postsPerSub;
  const analyzeLimit = processingLimit ?? preset.analyzeLimit;

  const commentOptions = {
    maxDepth: preset.maxDepth,
    maxComments: preset.maxComments,
  };

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
      cost: preset.estimatedCredits,
    });

    let allPosts: RedditPost[] = [];
    const throttleWarnings: string[] = [];

    const throttledSubredditsList = subreddits.filter(isSubredditThrottled);
    const nonThrottledSubreddits = subreddits.filter(
      (s) => !isSubredditThrottled(s),
    );

    for (const sub of throttledSubredditsList) {
      throttleWarnings.push(`⚠️ r/${sub} is rate-limited, skipping for 15 min`);
    }

    const targetSubreddits = nonThrottledSubreddits.slice(
      0,
      Math.max(1, subLimit),
    );

    // Fetch posts concurrently across all subreddits.
    // Each subreddit call internally fans out across all sort modes for the
    // given mining depth (basic=1, deep=2, advanced=4) and deduplicates.
    const subredditFetchResults = await Promise.allSettled(
      targetSubreddits.map((sub) =>
        fetchSubredditPostsMultiSort(sub, keyword, miningDepth, {
          maxPosts: postsPerSub,
          time: getRedditTimeRangeForWindow(timeWindow),
        }),
      ),
    );

    for (let i = 0; i < subredditFetchResults.length; i++) {
      const result = subredditFetchResults[i]!;
      const sub = targetSubreddits[i]!;
      if (result.status === "fulfilled") {
        allPosts.push(...result.value);
      } else {
        const errorMsg = getErrorMessage(result.reason);
        if (
          errorMsg.toLowerCase().includes("rate-limited") ||
          errorMsg.includes("429") ||
          errorMsg.includes("403")
        ) {
          throttleWarnings.push(`⚠️ r/${sub} returned rate-limit, skipping...`);
        }
        console.error(`Subreddit fetch failed for r/${sub}:`, result.reason);
      }
    }

    const problemPatterns = resolveProblemPatterns(customPatterns);
    const fetchedPosts = dedupePosts(allPosts);
    allPosts = rankRedditPosts(fetchedPosts, keyword, problemPatterns);

    // Filter by age first
    const nowSeconds = Math.floor(Date.now() / 1_000);
    const oldestAllowedUtc = nowSeconds - getTimeWindowAgeSeconds(timeWindow);
    allPosts = allPosts.filter((post) => post.created_utc >= oldestAllowedUtc);

    /**
     * POST QUALITY PRE-FILTER
     * Implement the criteria for dropping low-value noise BEFORE AI analysis.
     */
    const hasSelfPosts = allPosts.some((p) => p.is_self !== false);
    const preFiltered = allPosts.filter((post) => {
      // 1. Skip removed/deleted content
      const body = (post.selftext || "").toLowerCase();
      if (body === "[removed]" || body === "[deleted]") return false;

      // 2. Score threshold for basic depth
      if (miningDepth === "basic" && post.score < 2 && post.num_comments < 3) {
        return false;
      }

      // 3. Skip link posts unless no self-posts exist
      if (post.is_self === false && hasSelfPosts) {
        return false;
      }

      return true;
    });

    const postsSkipped = allPosts.length - preFiltered.length;
    allPosts = preFiltered;

    // Update phase: scanning → extracting
    allPosts = rankRedditPosts(allPosts, keyword, problemPatterns);

    await db
      .update(scraperRun)
      .set({
        status: "extracting",
        postsFetched: fetchedPosts.length,
        postsMatched: allPosts.length,
        postsSkipped,
        throttleWarnings,
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
          const comments = await fetchComments(
            post.id,
            post.subreddit,
            commentOptions,
          );
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

function calculatePostQualityScore(post: RedditPost): number {
  let score = 1.0;
  const body = (post.selftext || "").toLowerCase();

  // Low engagement penalty
  if (post.score < 5 && post.num_comments < 10) score -= 0.2;
  
  // High engagement boost
  if (post.score > 100 || post.num_comments > 50) score += 0.2;

  // Link post penalty if the body is very sparse
  if (post.is_self === false && body.length < 50) score -= 0.3;

  return Math.max(0, Math.min(1.0, Number(score.toFixed(2))));
}

    // Track every post analyzed in this run
    if (postsToAnalyze.length > 0) {
      const scraperPostsBatch = commentFetchResults
        .filter((r) => r.status === "fulfilled")
        .map((r) => {
          const post = postsToAnalyze.find((p) => p.id === r.value.postId);
          const qScore = post ? calculatePostQualityScore(post) : 0;
          return {
            id: crypto.randomUUID(),
            runId,
            postId: r.value.postId,
            commentCount: r.value.comments.length,
            qualityScore: qScore,
          };
        });

      if (scraperPostsBatch.length > 0) {
        await db.insert(scraperPost).values(scraperPostsBatch);
      }
    }

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
