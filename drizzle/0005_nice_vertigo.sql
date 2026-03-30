CREATE TYPE "public"."LtdTier" AS ENUM('none', 'founder', 'professional');--> statement-breakpoint
CREATE TYPE "public"."PainPointDifficulty" AS ENUM('weekend_project', 'side_project', 'startup_mvp', 'vc_scale_moat');--> statement-breakpoint
CREATE TABLE "discovery_cache" (
	"keyword" text PRIMARY KEY NOT NULL,
	"suggestions" jsonb NOT NULL,
	"cachedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchased_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scraper_post" (
	"id" text PRIMARY KEY NOT NULL,
	"runId" text NOT NULL,
	"postId" text NOT NULL,
	"commentCount" integer DEFAULT 0 NOT NULL,
	"qualityScore" double precision DEFAULT 0 NOT NULL,
	"skipReason" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slow_query_log" (
	"id" text PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"params" text,
	"durationMs" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"url" text,
	"description" text,
	"category" text,
	"iconUrl" text,
	"lastCrawledAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "tool_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "defaultAiModel" SET DEFAULT 'google/gemini-2.0-flash-001';--> statement-breakpoint
ALTER TABLE "pain_point" ADD COLUMN "difficulty" "PainPointDifficulty" DEFAULT 'weekend_project';--> statement-breakpoint
ALTER TABLE "pain_point_cluster" ADD COLUMN "competitorIntel" jsonb;--> statement-breakpoint
ALTER TABLE "reddit_rate_limit_log" ADD COLUMN "subreddit" text;--> statement-breakpoint
ALTER TABLE "reddit_rate_limit_log" ADD COLUMN "retryAfter" integer;--> statement-breakpoint
ALTER TABLE "scraper" ADD COLUMN "cost" double precision DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "scraper_run" ADD COLUMN "throttleWarnings" text[] DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "scraper_run" ADD COLUMN "postsSkipped" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "scraper_run" ADD COLUMN "cost" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "scraper_run" ADD COLUMN "workspaceId" text;--> statement-breakpoint
ALTER TABLE "scraper_run" ADD COLUMN "createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ltdTier" "LtdTier" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ltdPricePaid" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "anniversaryDate" timestamp (3);--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "onboardingComplete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "purchased_credits" ADD CONSTRAINT "purchased_credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraper_post" ADD CONSTRAINT "scraper_post_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."scraper_run"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "purchased_credits_userId_idx" ON "purchased_credits" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "scraper_post_runId_idx" ON "scraper_post" USING btree ("runId");--> statement-breakpoint
CREATE INDEX "scraper_post_postId_idx" ON "scraper_post" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "pain_point_workspaceId_scraperId_createdAt_idx" ON "pain_point" USING btree ("workspaceId","scraperId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pain_point_embedding_hnsw_idx" ON "pain_point_embedding" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "scraper_run_workspaceId_status_createdAt_idx" ON "scraper_run" USING btree ("workspaceId","status","createdAt" DESC NULLS LAST);