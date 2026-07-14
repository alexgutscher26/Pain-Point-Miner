-- 1. Add pain_point.upvoteCount (denormalized count of upvotes from pain_point_feedback)
ALTER TABLE "pain_point" ADD COLUMN "upvoteCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- 2. Add scraper.lastSuccessfulRunAt (separate from lastRunAt which is set even on failure)
ALTER TABLE "scraper" ADD COLUMN "lastSuccessfulRunAt" timestamp (3);--> statement-breakpoint

-- 3. Add pain_point_cluster.memberCount (denormalized to avoid COUNT(*) on every cluster render)
ALTER TABLE "pain_point_cluster" ADD COLUMN "memberCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- 4. Add workspace.plan (workspace-level plan override for entitlements)
ALTER TABLE "workspace" ADD COLUMN "plan" text;--> statement-breakpoint

-- 5. Soft-delete cascade trigger: when scraper.deletedAt is set, cascade to pain_point.deletedAt
CREATE OR REPLACE FUNCTION cascade_scraper_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "pain_point" SET "deletedAt" = NEW."deletedAt" WHERE "scraperId" = NEW."id" AND "deletedAt" IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER trg_cascade_scraper_soft_delete
  AFTER UPDATE OF "deletedAt" ON "scraper"
  FOR EACH ROW
  WHEN (NEW."deletedAt" IS NOT NULL AND OLD."deletedAt" IS NULL)
  EXECUTE FUNCTION cascade_scraper_soft_delete();--> statement-breakpoint

-- Backfill memberCount on pain_point_cluster from existing pain_points
UPDATE "pain_point_cluster" ppc
SET "memberCount" = (
  SELECT COUNT(*) FROM "pain_point" pp
  WHERE pp."clusterId" = ppc."id" AND pp."deletedAt" IS NULL
)
WHERE EXISTS (
  SELECT 1 FROM "pain_point" pp
  WHERE pp."clusterId" = ppc."id" AND pp."deletedAt" IS NULL
);--> statement-breakpoint

-- Backfill upvoteCount on pain_point from existing feedback
UPDATE "pain_point" pp
SET "upvoteCount" = (
  SELECT COUNT(*) FROM "pain_point_feedback" ppf
  WHERE ppf."painPointId" = pp."id" AND ppf."vote" = 1
);--> statement-breakpoint

-- Index on pain_point.deletedAt for soft-delete filter queries
CREATE INDEX IF NOT EXISTS "pain_point_deletedAt_idx" ON "pain_point" ("deletedAt");
