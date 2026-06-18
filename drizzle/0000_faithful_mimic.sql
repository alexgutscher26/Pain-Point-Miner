CREATE TYPE "public"."LtdTier" AS ENUM('none', 'founder', 'professional');--> statement-breakpoint
CREATE TYPE "public"."PainPointDifficulty" AS ENUM('weekend_project', 'side_project', 'startup_mvp', 'vc_scale_moat');--> statement-breakpoint
CREATE TYPE "public"."ScraperStatus" AS ENUM('running', 'paused', 'error');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"password" text,
	"createdAt" timestamp (3) NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_eval_log" (
	"id" text PRIMARY KEY NOT NULL,
	"modelId" text NOT NULL,
	"f1Score" double precision NOT NULL,
	"precision" double precision NOT NULL,
	"recall" double precision NOT NULL,
	"runDate" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"switched" boolean DEFAULT false NOT NULL,
	"flaggedForReview" boolean DEFAULT false NOT NULL,
	"reasoning" text NOT NULL,
	"comparisonModelId" text,
	"improvementPercentage" double precision,
	"evalMetadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "ai_golden_dataset" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"selftext" text,
	"subreddit" text NOT NULL,
	"comments" jsonb NOT NULL,
	"expectedPainPoints" jsonb NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "db_maintenance_log" (
	"id" text PRIMARY KEY NOT NULL,
	"taskName" text NOT NULL,
	"indexName" text,
	"sizeBeforeBytes" double precision,
	"sizeAfterBytes" double precision,
	"durationMs" integer,
	"latencyBeforeMs" double precision,
	"latencyAfterMs" double precision,
	"alertTriggered" boolean DEFAULT false NOT NULL,
	"error" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discovery_cache" (
	"keyword" text PRIMARY KEY NOT NULL,
	"suggestions" jsonb NOT NULL,
	"cachedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword_stat" (
	"id" text PRIMARY KEY NOT NULL,
	"keyword" text NOT NULL,
	"painPointsFound" integer DEFAULT 0 NOT NULL,
	"lastMatchedAt" timestamp (3),
	"scraperId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pain_point" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"postUrl" text,
	"author" text,
	"score" integer DEFAULT 0 NOT NULL,
	"urgency" integer DEFAULT 0,
	"monetizationScore" integer DEFAULT 0,
	"marketMaturity" integer DEFAULT 0,
	"budget" jsonb,
	"switchingCosts" text,
	"triedSolutions" text[] DEFAULT '{}'::text[],
	"category" text,
	"scraperId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"sentiment" text,
	"subreddit" text,
	"commentCount" integer DEFAULT 0 NOT NULL,
	"mentionCount" integer DEFAULT 0 NOT NULL,
	"tags" text[] DEFAULT '{}'::text[],
	"workspaceId" text,
	"deletedAt" timestamp (3),
	"flair" text,
	"isSelf" boolean,
	"subredditDisplayName" text,
	"thumbnailUrl" text,
	"clusterId" text,
	"clusterSimilarity" double precision,
	"scoreExplanation" text,
	"difficulty" "PainPointDifficulty" DEFAULT 'weekend_project'
);
--> statement-breakpoint
CREATE TABLE "pain_point_cluster" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"workspaceId" text,
	"embeddingProvider" text NOT NULL,
	"embeddingModel" text NOT NULL,
	"embedding" double precision[],
	"canonicalTitle" text NOT NULL,
	"canonicalBody" text NOT NULL,
	"sourceCount" integer DEFAULT 1 NOT NULL,
	"estimatedTamUsdAnnual" integer,
	"competitorIntel" jsonb,
	"budgetSignalCount" integer DEFAULT 0 NOT NULL,
	"lastMatchedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pain_point_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"body" text NOT NULL,
	"author" text,
	"score" integer DEFAULT 0 NOT NULL,
	"commentUrl" text,
	"painScore" integer DEFAULT 0 NOT NULL,
	"painPointId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pain_point_embedding" (
	"painPointId" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"workspaceId" text,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"dimensions" integer NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pain_point_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"painPointId" text NOT NULL,
	"userId" text NOT NULL,
	"vote" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
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
CREATE TABLE "reddit_ai_idempotency" (
	"redditPostId" text PRIMARY KEY NOT NULL,
	"lastProcessedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"lastProcessedBy" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reddit_rate_limit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"subreddit" text,
	"userAgent" text NOT NULL,
	"url" text NOT NULL,
	"statusCode" integer NOT NULL,
	"retryAfter" integer,
	"error" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scraper" (
	"id" text PRIMARY KEY NOT NULL,
	"keywords" text[],
	"frequency" integer DEFAULT 15 NOT NULL,
	"status" "ScraperStatus" DEFAULT 'running' NOT NULL,
	"postsScanned" integer DEFAULT 0 NOT NULL,
	"painPointsFound" integer DEFAULT 0 NOT NULL,
	"lastRunAt" timestamp (3),
	"userId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"errorCount" integer DEFAULT 0 NOT NULL,
	"lastError" text,
	"sortModes" text[] DEFAULT '{"new","hot","top_week"}',
	"subreddits" text[],
	"customPatterns" text[] DEFAULT '{}'::text[],
	"miningDepth" text DEFAULT 'basic' NOT NULL,
	"timeWindow" text DEFAULT '90d' NOT NULL,
	"reportSaved" boolean DEFAULT false NOT NULL,
	"reportCategory" text DEFAULT 'Uncategorized' NOT NULL,
	"reportSavedAt" timestamp (3),
	"workspaceId" text,
	"deletedAt" timestamp (3),
	"cost" double precision DEFAULT 1 NOT NULL
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
CREATE TABLE "scraper_run" (
	"id" text PRIMARY KEY NOT NULL,
	"scraperId" text NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"startedAt" timestamp (3) NOT NULL,
	"finishedAt" timestamp (3) NOT NULL,
	"postsFetched" integer DEFAULT 0 NOT NULL,
	"postsMatched" integer DEFAULT 0 NOT NULL,
	"commentsFetched" integer DEFAULT 0 NOT NULL,
	"newPainPoints" integer DEFAULT 0 NOT NULL,
	"fromComments" integer DEFAULT 0 NOT NULL,
	"error" text,
	"throttleWarnings" text[] DEFAULT '{}'::text[],
	"postsSkipped" integer DEFAULT 0 NOT NULL,
	"cost" double precision DEFAULT 0 NOT NULL,
	"workspaceId" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scraper_run_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"scraperId" text NOT NULL,
	"workspaceId" text,
	"month" text NOT NULL,
	"runsCount" integer DEFAULT 0 NOT NULL,
	"totalPostsFetched" integer DEFAULT 0 NOT NULL,
	"totalPostsMatched" integer DEFAULT 0 NOT NULL,
	"totalCommentsFetched" integer DEFAULT 0 NOT NULL,
	"totalNewPainPoints" integer DEFAULT 0 NOT NULL,
	"totalCost" double precision DEFAULT 0 NOT NULL,
	"updatedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp (3) NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL
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
CREATE TABLE "subreddit_cache" (
	"name" text PRIMARY KEY NOT NULL,
	"subscriberCount" integer,
	"description" text,
	"activeUsers" integer,
	"category" text,
	"cachedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" text NOT NULL,
	"referenceId" text NOT NULL,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"status" text DEFAULT 'incomplete' NOT NULL,
	"periodStart" timestamp (3),
	"periodEnd" timestamp (3),
	"trialStart" timestamp (3),
	"trialEnd" timestamp (3),
	"cancelAtPeriodEnd" boolean DEFAULT false,
	"cancelAt" timestamp (3),
	"canceledAt" timestamp (3),
	"endedAt" timestamp (3),
	"seats" integer,
	"billingInterval" text,
	"stripeScheduleId" text,
	"limits" jsonb,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
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
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"username" text,
	"displayUsername" text,
	"stripeCustomerId" text,
	"image" text,
	"createdAt" timestamp (3) NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"anonymizeRedditUsernames" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp (3),
	"role" text DEFAULT 'user' NOT NULL,
	"ltdTier" "LtdTier" DEFAULT 'none' NOT NULL,
	"ltdPricePaid" double precision DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"defaultAiModel" text DEFAULT 'google/gemini-2.0-flash-001' NOT NULL,
	"emailNotifications" boolean DEFAULT true NOT NULL,
	"timezone" text,
	"anniversaryDate" timestamp (3),
	"onboardingComplete" boolean DEFAULT false NOT NULL,
	"dashboardLayout" jsonb,
	"scoringWeights" jsonb
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3),
	"updatedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"ownerId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"deletedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "workspace_member" (
	"id" text PRIMARY KEY NOT NULL,
	"workspaceId" text NOT NULL,
	"userId" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "keyword_stat" ADD CONSTRAINT "keyword_stat_scraperId_fkey" FOREIGN KEY ("scraperId") REFERENCES "public"."scraper"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "keyword_stat" ADD CONSTRAINT "keyword_stat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point" ADD CONSTRAINT "pain_point_scraperId_fkey" FOREIGN KEY ("scraperId") REFERENCES "public"."scraper"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point" ADD CONSTRAINT "pain_point_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point" ADD CONSTRAINT "pain_point_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point" ADD CONSTRAINT "pain_point_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "public"."pain_point_cluster"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_cluster" ADD CONSTRAINT "pain_point_cluster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_cluster" ADD CONSTRAINT "pain_point_cluster_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_comment" ADD CONSTRAINT "pain_point_comment_painPointId_fkey" FOREIGN KEY ("painPointId") REFERENCES "public"."pain_point"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_embedding" ADD CONSTRAINT "pain_point_embedding_painPointId_fkey" FOREIGN KEY ("painPointId") REFERENCES "public"."pain_point"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_embedding" ADD CONSTRAINT "pain_point_embedding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_embedding" ADD CONSTRAINT "pain_point_embedding_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_feedback" ADD CONSTRAINT "pain_point_feedback_painPointId_fkey" FOREIGN KEY ("painPointId") REFERENCES "public"."pain_point"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_feedback" ADD CONSTRAINT "pain_point_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchased_credits" ADD CONSTRAINT "purchased_credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraper" ADD CONSTRAINT "scraper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraper" ADD CONSTRAINT "scraper_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraper_post" ADD CONSTRAINT "scraper_post_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."scraper_run"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraper_run" ADD CONSTRAINT "scraper_run_scraperId_fkey" FOREIGN KEY ("scraperId") REFERENCES "public"."scraper"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraper_run_summary" ADD CONSTRAINT "scraper_run_summary_scraperId_fkey" FOREIGN KEY ("scraperId") REFERENCES "public"."scraper"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "keyword_stat_scraperId_keyword_key" ON "keyword_stat" USING btree ("scraperId" text_ops,"keyword" text_ops);--> statement-breakpoint
CREATE INDEX "keyword_stat_userId_painPointsFound_idx" ON "keyword_stat" USING btree ("userId" text_ops,"painPointsFound" int4_ops);--> statement-breakpoint
CREATE INDEX "pain_point_userId_clusterId_createdAt_idx" ON "pain_point" USING btree ("userId" text_ops,"clusterId" text_ops,"createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "pain_point_userId_createdAt_idx" ON "pain_point" USING btree ("userId" text_ops,"createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "pain_point_scraperId_idx" ON "pain_point" USING btree ("scraperId");--> statement-breakpoint
CREATE INDEX "pain_point_workspaceId_scraperId_createdAt_idx" ON "pain_point" USING btree ("workspaceId","scraperId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pain_point_cluster_userId_embeddingProvider_embeddingModel_idx" ON "pain_point_cluster" USING btree ("userId" text_ops,"embeddingProvider" text_ops,"embeddingModel" text_ops);--> statement-breakpoint
CREATE INDEX "pain_point_cluster_userId_lastMatchedAt_idx" ON "pain_point_cluster" USING btree ("userId" text_ops,"lastMatchedAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "pain_point_embedding_userId_createdAt_idx" ON "pain_point_embedding" USING btree ("userId" text_ops,"createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "pain_point_embedding_userId_provider_model_idx" ON "pain_point_embedding" USING btree ("userId" text_ops,"provider" text_ops,"model" text_ops);--> statement-breakpoint
CREATE INDEX "pain_point_embedding_hnsw_idx" ON "pain_point_embedding" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "pain_point_feedback_painPointId_userId_key" ON "pain_point_feedback" USING btree ("painPointId","userId");--> statement-breakpoint
CREATE INDEX "purchased_credits_userId_idx" ON "purchased_credits" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "reddit_ai_idempotency_lastProcessedAt_idx" ON "reddit_ai_idempotency" USING btree ("lastProcessedAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "scraper_userId_workspaceId_createdAt_idx" ON "scraper" USING btree ("userId","workspaceId","createdAt");--> statement-breakpoint
CREATE INDEX "scraper_createdAt_idx" ON "scraper" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "scraper_post_runId_idx" ON "scraper_post" USING btree ("runId");--> statement-breakpoint
CREATE INDEX "scraper_post_postId_idx" ON "scraper_post" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "scraper_run_scraperId_startedAt_idx" ON "scraper_run" USING btree ("scraperId","startedAt");--> statement-breakpoint
CREATE INDEX "scraper_run_workspaceId_status_createdAt_idx" ON "scraper_run" USING btree ("workspaceId","status","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "scraper_run_summary_scraperId_month_key" ON "scraper_run_summary" USING btree ("scraperId","month");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_key" ON "session" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_referenceId_idx" ON "subscription" USING btree ("referenceId" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_stripeCustomerId_idx" ON "subscription" USING btree ("stripeCustomerId" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_stripeSubscriptionId_idx" ON "subscription" USING btree ("stripeSubscriptionId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_key" ON "user" USING btree ("username" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_slug_key" ON "workspace" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_member_workspaceId_userId_key" ON "workspace_member" USING btree ("workspaceId" text_ops,"userId" text_ops);