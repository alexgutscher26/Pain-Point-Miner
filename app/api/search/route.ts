
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
    .min(KEYWORD_MIN_LENGTH, `Keyword must be at least ${KEYWORD_MIN_LENGTH} characters`)
    .max(KEYWORD_MAX_LENGTH, `Keyword must be at most ${KEYWORD_MAX_LENGTH} characters`)
    .transform((value) => value.replace(/\s+/g, " "))
    .pipe(
      z
        .string()
        .min(KEYWORD_MIN_LENGTH, `Keyword must be at least ${KEYWORD_MIN_LENGTH} characters`)
        .max(KEYWORD_MAX_LENGTH, `Keyword must be at most ${KEYWORD_MAX_LENGTH} characters`)
    ),
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

/**
 * Handles the POST request for initiating a search operation.
 *
 * This function first validates the API context and checks for an idempotency key. It then parses the JSON payload and validates the request structure.
 * If the payload is valid, it checks for existing scraper jobs to prevent duplicate submissions within a specified time window.
 * If no duplicates are found, it creates a new scraping job and executes the mining run, returning the results or an error response as necessary.
 *
 * @param req - The incoming request object containing the search parameters and headers.
 * @returns A response object containing the result of the search operation or an error response.
 * @throws Error If an internal error occurs during the processing of the request.
 */
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

    /**
     * Execute a search operation for scraping data.
     *
     * This function creates a Scraping Job record and checks for existing scrapers to avoid duplicates within a specified time window.
     * If a matching scraper is found, it verifies various parameters such as keywords, mining depth, subreddits, and patterns.
     * If no duplicates are found, it inserts a new scraper record and initiates a mining run, returning the results of the operation.
     *
     * @param {string} userId - The ID of the user initiating the search.
     * @param {string} workspaceId - The ID of the workspace associated with the search.
     * @param {string} keyword - The keyword to search for.
     * @param {string[]} targetSubreddits - The list of subreddits to target for scraping.
     * @param {string[]} patterns - The custom patterns to use for scraping.
     * @param {string} miningDepth - The depth of mining to perform (e.g., "deep" or "shallow").
     * @returns {Promise<{ success: true, duplicate: boolean, scraperId: string, runId: string | null, count: number }>} The result of the search operation.
     * @throws {Error} If an error occurs during the execution of the search.
     */
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
