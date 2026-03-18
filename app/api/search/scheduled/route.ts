import { timingSafeEqual } from "node:crypto";
import { and, asc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { apiError, apiJson, getCorrelationId } from "@/lib/api-error";
import { db } from "@/lib/db";
import { scraper } from "@/lib/db/schema";
import { executeMiningRun } from "@/lib/mining-runner";
import { isScraperDue, parsePositiveIntFromEnv } from "@/lib/scheduler";
import type { MiningDepth } from "@/lib/mining-runner";
import { normalizeTimeWindow } from "@/lib/time-window";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/**
 * Compares two strings in a timing-safe manner.
 */
function safeSecretEquals(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = req.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const direct = req.headers.get("x-cron-secret")?.trim() ?? "";
  const provided = bearer || direct;
  if (!provided) return false;

  return safeSecretEquals(secret, provided);
}

function normalizeMiningDepth(depth: string | null | undefined): MiningDepth {
  if (depth === "advanced") return "advanced";
  if (depth === "deep") return "deep";
  return "basic";
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  if (!isAuthorized(req)) {
    return apiError(
      401,
      "UNAUTHORIZED",
      "Unauthorized scheduler trigger",
      undefined,
      correlationId,
    );
  }

  const { searchParams } = new URL(req.url);
  const parsedQuery = querySchema.safeParse({
    limit: searchParams.get("limit"),
  });

  if (!parsedQuery.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid query parameters",
      parsedQuery.error.flatten(),
      correlationId,
    );
  }

  const batchLimit =
    parsedQuery.data.limit ??
    parsePositiveIntFromEnv(process.env.SCHEDULED_BATCH_LIMIT, 5, 1, 50);
  const maxPostsPerSubreddit = parsePositiveIntFromEnv(
    process.env.SCHEDULED_MAX_POSTS_PER_SUBREDDIT,
    180,
    10,
    500,
  );
  const processingLimit = parsePositiveIntFromEnv(
    process.env.SCHEDULED_PROCESSING_LIMIT,
    8,
    1,
    40,
  );
  const maxSubreddits = parsePositiveIntFromEnv(
    process.env.SCHEDULED_MAX_SUBREDDITS,
    10,
    1,
    20,
  );

  try {
    const allRunning = await db
      .select({
        id: scraper.id,
        userId: scraper.userId,
        workspaceId: scraper.workspaceId,
        status: scraper.status,
        keywords: scraper.keywords,
        subreddits: scraper.subreddits,
        customPatterns: scraper.customPatterns,
        miningDepth: scraper.miningDepth,
        timeWindow: scraper.timeWindow,
        frequency: scraper.frequency,
        lastRunAt: scraper.lastRunAt,
      })
      .from(scraper)
      .where(and(eq(scraper.status, "running"), isNull(scraper.deletedAt)))
      .orderBy(asc(scraper.lastRunAt));

    const now = new Date();
    const dueScrapers = allRunning
      .filter((row) => {
        const keyword = row.keywords?.[0];
        return (
          Boolean(keyword) && isScraperDue(row.lastRunAt, row.frequency, now)
        );
      })
      .slice(0, batchLimit);

    const summary = {
      scannedScrapers: 0,
      attemptedScrapers: dueScrapers.length,
      postsFetched: 0,
      commentsFetched: 0,
      painPointsFound: 0,
      failures: 0,
    };

    for (const row of dueScrapers) {
      const keyword = row.keywords?.[0];
      if (!keyword) continue;

      const subreddits = (row.subreddits ?? []).slice(0, maxSubreddits);
      if (subreddits.length === 0) continue;

      try {
        const run = await executeMiningRun({
          scraperId: row.id,
          keyword,
          subreddits,
          customPatterns: row.customPatterns ?? [],
          miningDepth: normalizeMiningDepth(row.miningDepth),
          timeWindow: normalizeTimeWindow(row.timeWindow),
          userId: row.userId,
          workspaceId: row.workspaceId,
          maxSubreddits,
          maxPostsPerSubreddit,
          processingLimit,
        });

        summary.scannedScrapers += 1;
        summary.postsFetched += run.postsFetched;
        summary.commentsFetched += run.commentsFetched;
        summary.painPointsFound += run.newPainPoints;
      } catch (error) {
        summary.failures += 1;
        console.error(`Scheduled scraper run failed for ${row.id}`, error);
      }
    }

    return apiJson(
      {
        ok: true,
        ...summary,
      },
      200,
      correlationId,
    );
  } catch (error) {
    console.error("Scheduled scan API error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}
