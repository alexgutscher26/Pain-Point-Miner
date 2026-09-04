import pMap from "p-map";
import { eq, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  keywordStat,
  painPoint,
  scraper,
  scraperRun,
  scraperPost,
  user,
  userPreferences,
} from "@/lib/db/schema";
import { num } from "@/lib/env";
import {
  fetchComments,
  fetchSubredditPostsMultiSort,
  rankRedditPosts,
  resolveProblemPatterns,
  isSubredditThrottled,
  getGlobal429Rate,
  validateSubredditsBulk,
  type RedditPost,
} from "@/lib/reddit";
import { MINING_PRESETS, type MiningDepth } from "@/lib/mining-presets";
import {
  getRedditTimeRangeForWindow,
  type TimeWindow,
} from "@/lib/time-window";
import {
  getErrorMessage,
  dedupePosts,
  calculatePostQualityScore,
  filterPostsByTimeAndQuality,
} from "./discovery";
import { processSinglePost } from "./extraction";

export type ExecuteMiningRunInput = {
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

export type ExecuteMiningRunResult = {
  runId: string;
  postsFetched: number;
  postsMatched: number;
  commentsFetched: number;
  newPainPoints: number;
};

/**
 * Execute a mining run to fetch and analyze posts from specified subreddits.
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
    const prefsRecord = db.query.userPreferences
      ? await db.query.userPreferences.findFirst({
          where: eq(userPreferences.userId, userId),
          columns: { customApiKey: true },
        })
      : null;
    const anonymize = userRecord?.anonymizeRedditUsernames ?? false;
    const customApiKey = prefsRecord?.customApiKey || null;

    // Insert a scraperRun record upfront so SSE can track progress
    await db.insert(scraperRun).values({
      id: runId,
      scraperId,
      status: "scanning",
      startedAt: startTime,
      finishedAt: null,
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

    const candidateSubreddits = nonThrottledSubreddits.slice(
      0,
      Math.max(1, subLimit),
    );

    // Validate subreddit existence and minimum subscriber threshold prior to scanning
    const minSubscribers = num("MIN_SUBREDDIT_SUBSCRIBERS", 1000);
    const validationResult = await validateSubredditsBulk(candidateSubreddits, {
      minSubscribers,
    });
    for (const invalidSub of validationResult.invalid) {
      if (invalidSub.reason === "low_subscribers") {
        throttleWarnings.push(
          `⚠️ r/${invalidSub.name} has only ${invalidSub.subscribers ?? 0} subscribers (< ${minSubscribers} min threshold), skipping due to low signal`,
        );
      } else {
        throttleWarnings.push(
          `⚠️ r/${invalidSub.name} does not exist or is inaccessible (${invalidSub.reason ?? "404"}), skipping`,
        );
      }
    }
    const targetSubreddits = validationResult.valid;

    const maxAiExtractions = num("MAX_CONCURRENT_AI_EXTRACTIONS", 5);
    const baseSubConcurrency = maxAiExtractions;
    const baseCommentConcurrency = maxAiExtractions;

    const global429Rate = await getGlobal429Rate();
    const adaptiveSubConcurrency = global429Rate > 0.2 ? 1 : baseSubConcurrency;
    const adaptiveCommentConcurrency =
      global429Rate > 0.2 ? 2 : baseCommentConcurrency;

    if (global429Rate > 0.2) {
      throttleWarnings.push(
        `⚠️ Detected high 429 rate (${(global429Rate * 100).toFixed(0)}%), lowering parallelism to ${adaptiveSubConcurrency}...`,
      );
    }

    const subredditFetchResults = await pMap(
      targetSubreddits,
      async (sub) => {
        try {
          const res = await fetchSubredditPostsMultiSort(
            sub,
            keyword,
            miningDepth,
            {
              maxPosts: postsPerSub,
              time: getRedditTimeRangeForWindow(timeWindow),
            },
          );
          return { status: "fulfilled" as const, value: res };
        } catch (err) {
          return { status: "rejected" as const, reason: err };
        }
      },
      { concurrency: adaptiveSubConcurrency },
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

    // Apply time window and post quality filters
    const { filteredPosts, postsSkipped } = filterPostsByTimeAndQuality(
      allPosts,
      timeWindow,
    );
    allPosts = rankRedditPosts(filteredPosts, keyword, problemPatterns);

    // Update phase: scanning → extracting
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
      { concurrency: adaptiveCommentConcurrency },
    );

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
      const comments = commentsByPostId.get(post.id) ?? [];
      const count = await processSinglePost({
        post,
        comments,
        scraperId,
        userId,
        workspaceId,
        anonymize,
        customPatterns: patterns,
        miningDepth,
        customApiKey,
      });
      newPainPoints += count;
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

    if (userRecord?.email) {
      console.log(
        `[Mining] Generating and sending report_ready email for ${userRecord.email}...`,
      );
      try {
        const { sendReportReadyEmailProgrammatically } =
          await import("../loops/service");

        // Fetch top 3 pain points for this report to include in email
        const topPts = await db.query.painPoint.findMany({
          where: eq(painPoint.scraperId, scraperId),
          orderBy: [desc(painPoint.score)],
          limit: 3,
        });

        const topPainPoints = topPts.map((pt) => ({
          title: pt.title,
          excerpt: pt.body,
          score: Number(pt.score || 0),
        }));

        const reportUrl = process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reports/${scraperId}`
          : `https://painpointminer.com/dashboard/reports/${scraperId}`;

        await sendReportReadyEmailProgrammatically(
          userRecord.email,
          keyword,
          newPainPoints,
          reportUrl,
          topPainPoints,
        );
      } catch (e) {
        console.error("[Mining] Failed to send report ready email:", e);
      }
    } else {
      console.warn("[Mining] Skipping Loops: No user email found.");
    }

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

    // Trigger Loops scan_failed notification if we have an email
    const userOnErr = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });
    if (userOnErr?.email) {
      const { sendScanFailedNotification } =
        await import("@/lib/loops/service");
      await sendScanFailedNotification(userOnErr.email, keyword, errorMessage);
    }

    throw error;
  }
}
