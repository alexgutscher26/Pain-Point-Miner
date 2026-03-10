CREATE TABLE IF NOT EXISTS "reddit_ai_idempotency" (
  "redditPostId" text PRIMARY KEY NOT NULL,
  "lastProcessedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "lastProcessedBy" text,
  "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "reddit_ai_idempotency_lastProcessedAt_idx"
  ON "reddit_ai_idempotency" USING btree ("lastProcessedAt");
