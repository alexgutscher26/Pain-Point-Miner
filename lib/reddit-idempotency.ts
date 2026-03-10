import { client } from "@/lib/db";

const REDDIT_AI_IDEMPOTENCY_WINDOW_HOURS = 24;

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

  const rows = await client<{ redditPostId: string }[]>`
    INSERT INTO "reddit_ai_idempotency" ("redditPostId", "lastProcessedAt", "lastProcessedBy", "createdAt", "updatedAt")
    VALUES (${normalizedRedditPostId}, CURRENT_TIMESTAMP, ${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT ("redditPostId")
    DO UPDATE SET
      "lastProcessedAt" = CURRENT_TIMESTAMP,
      "lastProcessedBy" = EXCLUDED."lastProcessedBy",
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "reddit_ai_idempotency"."lastProcessedAt" <= CURRENT_TIMESTAMP - INTERVAL '${REDDIT_AI_IDEMPOTENCY_WINDOW_HOURS} hours'
    RETURNING "redditPostId";
  `;

  return rows.length > 0;
}
