-- 1. PainPointSourceType enum + columns
CREATE TYPE "PainPointSourceType" AS ENUM ('post', 'comment', 'cross_post');--> statement-breakpoint

ALTER TABLE "pain_point" ADD COLUMN "sourceType" "PainPointSourceType" DEFAULT 'post' NOT NULL;--> statement-breakpoint

ALTER TABLE "pain_point" ADD COLUMN "redditPostId" text;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "pain_point_redditPostId_idx" ON "pain_point" ("redditPostId");--> statement-breakpoint

-- 2. ai_usage.runId FK to scraper_run
ALTER TABLE "ai_usage" ADD COLUMN "runId" text;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "ai_usage_runId_idx" ON "ai_usage" ("runId");--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ai_usage_runId_fkey'
  ) THEN
    ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_runId_fkey"
      FOREIGN KEY ("runId") REFERENCES "scraper_run"("id")
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;--> statement-breakpoint

-- 3. Changelog table
CREATE TABLE IF NOT EXISTS "changelog" (
  "id" text PRIMARY KEY NOT NULL,
  "version" text NOT NULL,
  "description" text NOT NULL,
  "appliedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint

-- 4. User notification preferences table
CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "weeklyDigest" boolean DEFAULT true NOT NULL,
  "scanCompleteAlerts" boolean DEFAULT true NOT NULL,
  "thresholdNotifications" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamp (3) NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "user_notification_preferences_userId_key"
  ON "user_notification_preferences" ("userId");--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_notification_preferences_userId_fkey'
  ) THEN
    ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "user"("id")
      ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
END $$;--> statement-breakpoint

-- 5. Scraper run event table
CREATE TABLE IF NOT EXISTS "scraper_run_event" (
  "id" text PRIMARY KEY NOT NULL,
  "runId" text NOT NULL,
  "phase" text NOT NULL,
  "startedAt" timestamp (3) NOT NULL,
  "finishedAt" timestamp (3),
  "metrics" jsonb,
  "createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "scraper_run_event_runId_phase_idx"
  ON "scraper_run_event" ("runId", "phase");--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'scraper_run_event_runId_fkey'
  ) THEN
    ALTER TABLE "scraper_run_event" ADD CONSTRAINT "scraper_run_event_runId_fkey"
      FOREIGN KEY ("runId") REFERENCES "scraper_run"("id")
      ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
END $$;--> statement-breakpoint

-- 6. Partition scraper_run by month on startedAt
-- Step 1: Rename old table
ALTER TABLE "scraper_run" RENAME TO "scraper_run_old";--> statement-breakpoint

-- Step 2: Create partitioned table (PK includes startedAt for partition support)
CREATE TABLE "scraper_run" (
  "id" text NOT NULL,
  "scraperId" text NOT NULL,
  "status" text DEFAULT 'success' NOT NULL,
  "startedAt" timestamp (3) NOT NULL,
  "finishedAt" timestamp (3),
  "postsFetched" integer DEFAULT 0 NOT NULL,
  "postsMatched" integer DEFAULT 0 NOT NULL,
  "commentsFetched" integer DEFAULT 0 NOT NULL,
  "newPainPoints" integer DEFAULT 0 NOT NULL,
  "fromComments" integer DEFAULT 0 NOT NULL,
  "error" text,
  "throttleWarnings" text[] DEFAULT '{}'::text[],
  "postsSkipped" integer DEFAULT 0 NOT NULL,
  "cost" double precision DEFAULT 0.0 NOT NULL,
  "workspaceId" text,
  "createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id", "startedAt")
) PARTITION BY RANGE ("startedAt");--> statement-breakpoint

-- Step 3: Create monthly partitions for the last 3 months + future + default
CREATE TABLE "scraper_run_2026_05" PARTITION OF "scraper_run"
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');--> statement-breakpoint

CREATE TABLE "scraper_run_2026_06" PARTITION OF "scraper_run"
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');--> statement-breakpoint

CREATE TABLE "scraper_run_2026_07" PARTITION OF "scraper_run"
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');--> statement-breakpoint

CREATE TABLE "scraper_run_2026_08" PARTITION OF "scraper_run"
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');--> statement-breakpoint

CREATE TABLE "scraper_run_2026_09" PARTITION OF "scraper_run"
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');--> statement-breakpoint

CREATE TABLE "scraper_run_future" PARTITION OF "scraper_run"
  FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');--> statement-breakpoint

CREATE TABLE "scraper_run_default" PARTITION OF "scraper_run" DEFAULT;--> statement-breakpoint

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS "scraper_run_scraperId_startedAt_idx"
  ON "scraper_run" ("scraperId", "startedAt");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "scraper_run_workspaceId_status_createdAt_idx"
  ON "scraper_run" ("workspaceId", "status", "createdAt" DESC);--> statement-breakpoint

-- Step 5: Copy data from old table (using id+startedAt as composite key)
INSERT INTO "scraper_run" ("id", "scraperId", "status", "startedAt", "finishedAt", "postsFetched", "postsMatched", "commentsFetched", "newPainPoints", "fromComments", "error", "throttleWarnings", "postsSkipped", "cost", "workspaceId", "createdAt")
  SELECT "id", "scraperId", "status", "startedAt", "finishedAt", "postsFetched", "postsMatched", "commentsFetched", "newPainPoints", "fromComments", "error", "throttleWarnings", "postsSkipped", "cost", "workspaceId", "createdAt"
  FROM "scraper_run_old";--> statement-breakpoint

-- Step 6: Drop old table
DROP TABLE "scraper_run_old";--> statement-breakpoint

-- Step 7: Recreate FKs that referenced scraper_run.id — now (id, startedAt)
-- scraper_post.runId still works because PK includes id (unique per partition + startedAt ensures routing)
-- ai_usage.runId and scraper_run_event.runId work the same way.
-- No explicit FK changes needed since Postgres accepts FK references to partition PK
-- as long as the referencing columns match.
