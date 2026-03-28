/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { redditRateLimitLog, scraperRun, scraper } from "@/lib/db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";

export async function getScraperHealthStats(userId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 1. Per-Subreddit Success Rate
  // We look at the rate limit logs to see how many successful requests vs 429s/errors we got
  const subredditStats = await db
    .select({
      subreddit: redditRateLimitLog.subreddit,
      total: sql<number>`count(*)`,
      errors: sql<number>`count(case when ${redditRateLimitLog.statusCode} >= 400 then 1 end)`,
    })
    .from(redditRateLimitLog)
    .where(gte(redditRateLimitLog.createdAt, sevenDaysAgo))
    .groupBy(redditRateLimitLog.subreddit)
    .orderBy(desc(sql`count(*)`));

  const subHealth = subredditStats
    .filter((s: any) => s.subreddit)
    .map((s: any) => ({
      subreddit: s.subreddit as string,
      successRate: Math.round(((s.total - s.errors) / s.total) * 100),
      totalRequests: s.total,
    }));

  // 2. Avg Posts Per Scan
  const runs = await db
    .select({
      postsFetched: scraperRun.postsFetched,
      newPainPoints: scraperRun.newPainPoints,
      startedAt: scraperRun.startedAt,
      status: scraperRun.status,
    })
    .from(scraperRun)
    .innerJoin(scraper, eq(scraperRun.scraperId, scraper.id))
    .where(
      and(eq(scraper.userId, userId), gte(scraperRun.startedAt, sevenDaysAgo)),
    );

  const completedRuns = runs.filter((r: any) => r.status === "completed");
  const avgPostsPerScan =
    completedRuns.length > 0
      ? Math.round(
          completedRuns.reduce(
            (acc: number, r: any) => acc + (r.postsFetched || 0),
            0,
          ) / completedRuns.length,
        )
      : 0;

  // 3. 7-Day Trend Chart
  // We Group by day
  const dailyTrend = new Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];

    const dayRuns = runs.filter(
      (r: any) => r.startedAt.toISOString().split("T")[0] === dateStr,
    );
    const daySuccess = dayRuns.filter(
      (r: any) => r.status === "completed",
    ).length;
    const dayDiscovery = dayRuns.reduce(
      (acc: number, r: any) => acc + (r.newPainPoints || 0),
      0,
    );

    return {
      date: dateStr,
      runs: dayRuns.length,
      successRate:
        dayRuns.length > 0
          ? Math.round((daySuccess / dayRuns.length) * 100)
          : 100,
      discovery: dayDiscovery,
    };
  });

  return {
    subHealth: subHealth.slice(0, 10), // Top 10 subreddits
    avgPostsPerScan,
    dailyTrend,
    totalScans: runs.length,
    successRate:
      runs.length > 0
        ? Math.round((completedRuns.length / runs.length) * 100)
        : 100,
  };
}
