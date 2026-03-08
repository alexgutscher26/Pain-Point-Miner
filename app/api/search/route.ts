
import { db } from "@/lib/db";
import { scraper, scraperRun } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext, workspaceScope } from "@/lib/api-auth";
import { runWithIdempotency } from "@/lib/idempotency";
import { normalizeRunStatus } from "@/lib/run-status";
import { executeMiningRun } from "@/lib/mining-runner";

const KEYWORD_MIN_LENGTH = 2;
const KEYWORD_MAX_LENGTH = 120;
const CUSTOM_PATTERN_MAX_COUNT = 20;
const CUSTOM_PATTERN_MAX_LENGTH = 120;
const MAX_SUBREDDITS_BY_DEPTH = {
  basic: 10,
  deep: 10,
  advanced: 15,
} as const;
const DUPLICATE_SUBMISSION_WINDOW_MS = 30_000;
const IDEMPOTENCY_KEY_HEADER = "idempotency-key";

const subredditTokenSchema = z
  .string()
  .trim()
  .transform((value) =>
    value
      .replace(/^https?:\/\/(www\.)?reddit\.com\//i, "")
      .replace(/^\/?r\//i, "")
      .replace(/^r\//i, "")
      .replace(/^@+/, "")
      .replace(/[^\w]/g, "")
      .toLowerCase()
  )
  .pipe(z.string().regex(/^[a-z0-9_]{2,21}$/, "Invalid subreddit name"));

const customPatternItemSchema = z
  .string()
  .trim()
  .min(1, "Pattern cannot be empty")
  .max(
    CUSTOM_PATTERN_MAX_LENGTH,
    `Pattern must be at most ${CUSTOM_PATTERN_MAX_LENGTH} characters`
  );

const searchPayloadSchema = z.object({
  keyword: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, " "))
    .min(KEYWORD_MIN_LENGTH, `Keyword must be at least ${KEYWORD_MIN_LENGTH} characters`)
    .max(KEYWORD_MAX_LENGTH, `Keyword must be at most ${KEYWORD_MAX_LENGTH} characters`),
  subreddits: z
    .string()
    .optional()
    .default("")
    .refine((value) => value.length <= 500, "Subreddits input is too long"),
  customPatterns: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .default([])
    .transform((value) => {
      if (Array.isArray(value)) return value;
      if (!value) return [];
      return value.split(",");
    })
    .transform((patterns) => patterns.map((pattern) => pattern.trim()).filter(Boolean))
    .pipe(
      z
        .array(customPatternItemSchema)
        .max(CUSTOM_PATTERN_MAX_COUNT, `Too many custom patterns (max ${CUSTOM_PATTERN_MAX_COUNT})`)
    ),
  miningDepth: z.enum(["basic", "deep", "advanced"]).optional().default("basic"),
});

const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8, "Idempotency key must be at least 8 characters")
  .max(128, "Idempotency key must be at most 128 characters")
  .regex(/^[A-Za-z0-9._-]+$/, "Invalid idempotency key format");

function arraysEqual(a: string[] | null | undefined, b: string[]) {
  const left = a ?? [];
  if (left.length !== b.length) return false;
  return left.every((value, idx) => value === b[idx]);
}

export async function POST(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;
  const rawIdempotencyKey = req.headers.get(IDEMPOTENCY_KEY_HEADER);
  let idempotencyKey: string | null = null;

  if (rawIdempotencyKey) {
    const parsedIdempotencyKey = idempotencyKeySchema.safeParse(rawIdempotencyKey);
    if (!parsedIdempotencyKey.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        "Invalid idempotency key",
        parsedIdempotencyKey.error.flatten(),
        correlationId
      );
    }
    idempotencyKey = parsedIdempotencyKey.data;
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return apiError(400, "INVALID_JSON", "Invalid JSON payload", undefined, correlationId);
    }

    const parsedPayload = searchPayloadSchema.safeParse(rawBody);

    if (!parsedPayload.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        "Invalid request payload",
        parsedPayload.error.flatten(),
        correlationId
      );
    }

    const { keyword, subreddits, customPatterns, miningDepth } = parsedPayload.data;

    const rawSubreddits = subreddits
      .split(",")
      .map((sub) => sub.trim())
      .filter(Boolean);

    const maxSubredditsForDepth = MAX_SUBREDDITS_BY_DEPTH[miningDepth];
    const normalizedSubreddits = z
      .array(subredditTokenSchema)
      .max(
        maxSubredditsForDepth,
        `Too many subreddits (max ${maxSubredditsForDepth})`
      )
      .safeParse(rawSubreddits);

    if (!normalizedSubreddits.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        "Invalid subreddits input",
        normalizedSubreddits.error.flatten(),
        correlationId
      );
    }

    const targetSubreddits =
      normalizedSubreddits.data.length > 0
        ? normalizedSubreddits.data
        : ["entrepreneur", "saas", "sales", "startups"];

    const patterns = customPatterns.map((pattern) => pattern.trim()).filter(Boolean);

    const executeSearch = async () => {
      // 1. Create a Scraping Job record
      const scraperId = crypto.randomUUID();

      try {
        const latestMatchingScraper = await db.query.scraper.findFirst({
          where: and(
            eq(scraper.userId, userId),
            workspaceScope(scraper.workspaceId, workspaceId)
          ),
          orderBy: [desc(scraper.createdAt)],
          with: {
            scraperRuns: {
              orderBy: [desc(scraperRun.startedAt)],
              limit: 1,
            },
          },
        });

        if (latestMatchingScraper) {
          const isWithinDuplicateWindow =
            Date.now() - new Date(latestMatchingScraper.createdAt).getTime() <=
            DUPLICATE_SUBMISSION_WINDOW_MS;
          const isSameKeyword = latestMatchingScraper.keywords?.[0] === keyword;
          const isSameDepth = latestMatchingScraper.miningDepth === miningDepth;
          const isSameSubreddits = arraysEqual(latestMatchingScraper.subreddits, targetSubreddits);
          const isSamePatterns = arraysEqual(latestMatchingScraper.customPatterns, patterns);

          if (
            isWithinDuplicateWindow &&
            isSameKeyword &&
            isSameDepth &&
            isSameSubreddits &&
            isSamePatterns
          ) {
            const latestRun = latestMatchingScraper.scraperRuns?.[0];
            return {
              success: true as const,
              duplicate: true,
              scraperId: latestMatchingScraper.id,
              runId: latestRun?.id ?? null,
              count: latestRun?.newPainPoints ?? 0,
              status: normalizeRunStatus(latestRun?.status),
            };
          }
        }

        // We'll create the scraper and first run metadata
        await db.insert(scraper).values({
          id: scraperId,
          keywords: [keyword],
          subreddits: targetSubreddits,
          customPatterns: patterns,
          miningDepth,
          userId,
          workspaceId,
          updatedAt: new Date(),
        });

        const runResult = await executeMiningRun({
          scraperId,
          keyword,
          subreddits: targetSubreddits,
          customPatterns: patterns,
          miningDepth,
          userId,
          workspaceId,
          maxPostsPerSubreddit:
            miningDepth === "advanced" ? 40 : miningDepth === "deep" ? 25 : 15,
          processingLimit:
            miningDepth === "advanced" ? 20 : miningDepth === "deep" ? 10 : 3,
        });

        return {
          success: true as const,
          duplicate: false,
          scraperId,
          runId: runResult.runId,
          count: runResult.newPainPoints,
        };
      } catch (error) {
        throw error;
      }
    };

    const result = idempotencyKey
      ? await runWithIdempotency(
          `${userId}:${workspaceId ?? "personal"}:${idempotencyKey}`,
          executeSearch
        )
      : { result: await executeSearch(), replayed: false };

    const response = apiJson(result.result, 200, correlationId);
    response.headers.set("x-idempotency-replayed", result.replayed ? "true" : "false");
    return response;

  } catch (error) {
    console.error("Search API Error:", error);
    return apiError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", undefined, correlationId);
  }
}
