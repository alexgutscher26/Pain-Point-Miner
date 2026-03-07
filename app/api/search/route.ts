
import { fetchSubredditPosts, fetchComments } from "@/lib/reddit";
import { extractPainPoints } from "@/lib/ai";
import { db } from "@/lib/db";
import { painPoint, scraper, scraperRun } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext, workspaceScope } from "@/lib/api-auth";
import { runWithIdempotency } from "@/lib/idempotency";
import { normalizeRunStatus } from "@/lib/run-status";

const KEYWORD_MIN_LENGTH = 2;
const KEYWORD_MAX_LENGTH = 120;
const CUSTOM_PATTERN_MAX_COUNT = 20;
const CUSTOM_PATTERN_MAX_LENGTH = 120;
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
  miningDepth: z.enum(["basic", "deep"]).optional().default("basic"),
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
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

    const normalizedSubreddits = z.array(subredditTokenSchema).max(10, "Too many subreddits (max 10)").safeParse(rawSubreddits);

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
      const runId = crypto.randomUUID();
      const startTime = new Date();
      let scraperCreated = false;
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
        scraperCreated = true;

        // 2. Determine scan parameters
        const isDeep = miningDepth === "deep";
        const subLimit = isDeep ? 10 : 5;
        const postsPerSub = isDeep ? 25 : 15;
        const now = Math.floor(Date.now() / 1000);
        const threeMonthsAgo = now - (90 * 24 * 60 * 60);

        // 3. Start fetching
        let allPosts = [];
        for (const sub of targetSubreddits.slice(0, subLimit)) { 
          const posts = await fetchSubredditPosts(sub, keyword, postsPerSub, 'year'); 
          allPosts.push(...posts);
        }

        // Strictly enforce the "3 months" rule for Basic Scan
        if (!isDeep) {
          allPosts = allPosts.filter(p => p.created_utc >= threeMonthsAgo);
        }

        // Let's process the first few posts as a sample for the live response
        const processingResults = [];
        const processingLimit = isDeep ? 10 : 3;
        
        for (const post of allPosts.slice(0, processingLimit)) { 
          const comments = await fetchComments(post.id, post.subreddit);
          const points = await extractPainPoints({
            title: post.title,
            selftext: post.selftext,
            url: post.url,
            author: post.author,
            subreddit: post.subreddit,
            comments: comments.map(c => ({ body: c.body }))
          }, patterns);

          if (points && points.length > 0) {
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
                scraperId: scraperId,
                subreddit: post.subreddit,
                postUrl: post.url,
                author: post.author,
                sentiment: point.sentiment,
                workspaceId,
                updatedAt: new Date(),
              });
              processingResults.push(point);
            }
          }
        }

        // Insert Scraper Run record
        await db.insert(scraperRun).values({
          id: runId,
          scraperId: scraperId,
          status: "completed",
          startedAt: startTime,
          finishedAt: new Date(),
          postsFetched: allPosts.length,
          postsMatched: allPosts.length,
          newPainPoints: processingResults.length,
          commentsFetched: allPosts.reduce((acc, p) => acc + (p.num_comments || 0), 0),
        });

        return {
          success: true as const,
          duplicate: false,
          scraperId,
          runId,
          count: processingResults.length,
        };
      } catch (error) {
        // Persist failure reason for observability/debugging when a job fails after creation.
        if (scraperCreated) {
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
            error: getErrorMessage(error).slice(0, 2000),
          });
        }
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
