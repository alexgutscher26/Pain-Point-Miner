import { inngest } from "../client";
import { db } from "@/lib/db";
import { scraperRun, scraperRunSummary, dbMaintenanceLog } from "@/lib/db/schema";
import { sql, lt } from "drizzle-orm";
import crypto from "node:crypto";
import { subDays, format } from "date-fns";

/**
 * Monthly Log Truncation
 * 
 * 1. Identify scraper_run records older than 60 days.
 * 2. Aggregate metrics by scraperId and month.
 * 3. Upsert into scraper_run_summary.
 * 4. Delete old records.
 */
export const monthlyLogTruncation = inngest.createFunction(
  { 
    id: "monthly-log-truncation",
    name: "Monthly Log Truncation",
    triggers: [{ cron: "0 0 * * 0" }] // Every Sunday at midnight
  },
  async ({ step }) => {
    // Check if it's the first Sunday of the month
    const isFirstSunday = await step.run("check-schedule", () => {
      const today = new Date();
      return today.getDate() <= 7;
    });

    if (!isFirstSunday) {
      return { message: "Skipping: Not the first Sunday of the month" };
    }

    const results = await step.run("truncate-logs", async () => {
      const sixtyDaysAgo = subDays(new Date(), 60);
      const startTime = Date.now();
      let error: string | undefined;
      let recordsProcessed = 0;

      try {
        // 1. Get records to truncate
        const oldRuns = await db
          .select()
          .from(scraperRun)
          .where(lt(scraperRun.createdAt, sixtyDaysAgo));

        if (oldRuns.length === 0) {
          return { recordsProcessed: 0, durationMs: 0, error: undefined };
        }

        // 2. Aggregate by scraperId and month
        const aggregations: Record<string, any> = {};

        for (const run of oldRuns) {
          const month = format(run.startedAt, "yyyy-MM");
          const key = `${run.scraperId}_${month}`;

          if (!aggregations[key]) {
            aggregations[key] = {
              scraperId: run.scraperId,
              workspaceId: run.workspaceId,
              month,
              runsCount: 0,
              totalPostsFetched: 0,
              totalPostsMatched: 0,
              totalCommentsFetched: 0,
              totalNewPainPoints: 0,
              totalCost: 0,
            };
          }

          const agg = aggregations[key];
          agg.runsCount += 1;
          agg.totalPostsFetched += run.postsFetched;
          agg.totalPostsMatched += run.postsMatched;
          agg.totalCommentsFetched += run.commentsFetched;
          agg.totalNewPainPoints += run.newPainPoints;
          agg.totalCost += Number(run.cost);
        }

        // 3. Upsert into summary table
        for (const key in aggregations) {
          const agg = aggregations[key];
          
          await db.insert(scraperRunSummary)
            .values({
              id: crypto.randomUUID(),
              scraperId: agg.scraperId,
              workspaceId: agg.workspaceId,
              month: agg.month,
              runsCount: agg.runsCount,
              totalPostsFetched: agg.totalPostsFetched,
              totalPostsMatched: agg.totalPostsMatched,
              totalCommentsFetched: agg.totalCommentsFetched,
              totalNewPainPoints: agg.totalNewPainPoints,
              totalCost: agg.totalCost,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [scraperRunSummary.scraperId, scraperRunSummary.month],
              set: {
                runsCount: sql`${scraperRunSummary.runsCount} + ${agg.runsCount}`,
                totalPostsFetched: sql`${scraperRunSummary.totalPostsFetched} + ${agg.totalPostsFetched}`,
                totalPostsMatched: sql`${scraperRunSummary.totalPostsMatched} + ${agg.totalPostsMatched}`,
                totalCommentsFetched: sql`${scraperRunSummary.totalCommentsFetched} + ${agg.totalCommentsFetched}`,
                totalNewPainPoints: sql`${scraperRunSummary.totalNewPainPoints} + ${agg.totalNewPainPoints}`,
                totalCost: sql`${scraperRunSummary.totalCost} + ${agg.totalCost}`,
                updatedAt: new Date(),
              },
            });
        }

        // 4. Delete old records
        const deleteResult = await db.delete(scraperRun)
          .where(lt(scraperRun.createdAt, sixtyDaysAgo))
          .returning({ id: scraperRun.id });
        
        recordsProcessed = deleteResult.length;

      } catch (e: any) {
        error = e.message;
        console.error(`[LOG TRUNCATION ERROR] ${error}`);
      }

      const durationMs = Date.now() - startTime;

      // 5. Log to db_maintenance_log
      await db.insert(dbMaintenanceLog).values({
        id: crypto.randomUUID(),
        taskName: "monthly_log_truncation",
        durationMs,
        error,
        createdAt: new Date(),
      });

      return { recordsProcessed, durationMs, error };
    });

    return {
      message: results.error ? "Truncation failed" : "Truncation completed",
      stats: results,
    };
  }
);
