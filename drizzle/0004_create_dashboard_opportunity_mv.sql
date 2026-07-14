CREATE MATERIALIZED VIEW IF NOT EXISTS "dashboard_opportunity_mv" AS
SELECT
  s."id" AS scraper_id,
  s."userId" AS user_id,
  s."workspaceId" AS workspace_id,
  s."keywords",
  s."createdAt" AS created_at,
  s."updatedAt" AS updated_at,
  s."reportSaved" AS report_saved,
  s."reportCategory" AS report_category,
  s."reportSavedAt" AS report_saved_at,
  (SELECT "status" FROM "scraper_run" WHERE "scraperId" = s."id" ORDER BY "startedAt" DESC LIMIT 1) AS latest_run_status,
  (SELECT "startedAt" FROM "scraper_run" WHERE "scraperId" = s."id" ORDER BY "startedAt" DESC LIMIT 1) AS latest_run_started_at,
  (SELECT "postsFetched" FROM "scraper_run" WHERE "scraperId" = s."id" ORDER BY "startedAt" DESC LIMIT 1) AS latest_posts_fetched,
  COUNT(pp."id") FILTER (WHERE pp."deletedAt" IS NULL) AS pain_point_count,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', pp."id",
        'title', pp."title",
        'score', pp."score",
        'urgency', pp."urgency",
        'monetizationScore', pp."monetizationScore",
        'marketMaturity', pp."marketMaturity",
        'sentiment', pp."sentiment",
        'commentCount', pp."commentCount",
        'mentionCount', pp."mentionCount",
        'subreddit', pp."subreddit",
        'subredditDisplayName', pp."subredditDisplayName",
        'scoreExplanation', pp."scoreExplanation",
        'createdAt', pp."createdAt"
      )
      ORDER BY pp."createdAt" DESC
    ) FILTER (WHERE pp."id" IS NOT NULL AND pp."deletedAt" IS NULL),
    '[]'::jsonb
  ) AS pain_points
FROM "scraper" s
LEFT JOIN "pain_point" pp ON pp."scraperId" = s."id"
WHERE s."deletedAt" IS NULL
GROUP BY s."id";--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "dashboard_opportunity_mv_pkey" ON "dashboard_opportunity_mv" ("scraper_id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "dashboard_opportunity_mv_user_workspace_created" ON "dashboard_opportunity_mv" ("user_id", "workspace_id", "created_at" DESC);--> statement-breakpoint

-- Index for batch feedback/comment lookups by painPointId
CREATE INDEX IF NOT EXISTS "pain_point_comment_painPointId_score_idx" ON "pain_point_comment" ("painPointId", "score" DESC);
