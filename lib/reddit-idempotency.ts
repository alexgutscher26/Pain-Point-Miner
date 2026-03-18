import { client } from "@/lib/db";

const REDDIT_AI_IDEMPOTENCY_WINDOW_HOURS = 24;
let ensureRedditAiIdempotencyTablePromise: Promise<void> | null = null;

async function ensureRedditAiIdempotencyTable() {
  if (!ensureRedditAiIdempotencyTablePromise) {
    ensureRedditAiIdempotencyTablePromise = (async () => {
      await client`
        CREATE TABLE IF NOT EXISTS "reddit_ai_idempotency" (
          "redditPostId" text PRIMARY KEY NOT NULL,
          "lastProcessedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
          "lastProcessedBy" text,
          "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
          "updatedAt" timestamp(3) NOT NULL
        );
      `;

      await client`
        CREATE INDEX IF NOT EXISTS "reddit_ai_idempotency_lastProcessedAt_idx"
          ON "reddit_ai_idempotency" USING btree ("lastProcessedAt");
      `;
    })().catch((error) => {
      ensureRedditAiIdempotencyTablePromise = null;
      throw error;
    });
  }

  await ensureRedditAiIdempotencyTablePromise;
}

/**
 * Atomically claim a Reddit post ID for AI processing.
 * Returns true only when this call is allowed to perform AI work.
 */
export async function claimRedditPostForAiProcessing(
  redditPostId: string,
  userId: string,
): Promise<boolean> {
  const normalizedRedditPostId = redditPostId.trim();
  if (!normalizedRedditPostId) return false;
  await ensureRedditAiIdempotencyTable();

  const rows = await client<{ redditPostId: string }[]>`
    INSERT INTO "reddit_ai_idempotency" ("redditPostId", "lastProcessedAt", "lastProcessedBy", "createdAt", "updatedAt")
    VALUES (${normalizedRedditPostId}, CURRENT_TIMESTAMP, ${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT ("redditPostId")
    DO UPDATE SET
      "lastProcessedAt" = CURRENT_TIMESTAMP,
      "lastProcessedBy" = EXCLUDED."lastProcessedBy",
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "reddit_ai_idempotency"."lastProcessedAt" <= CURRENT_TIMESTAMP - (${REDDIT_AI_IDEMPOTENCY_WINDOW_HOURS} * INTERVAL '1 hour')
    RETURNING "redditPostId";
  `;

  return rows.length > 0;
}
