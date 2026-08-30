CREATE TYPE "public"."PainPointSourceType" AS ENUM('post', 'comment', 'cross_post');--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"modelId" text NOT NULL,
	"inputTokens" integer DEFAULT 0 NOT NULL,
	"outputTokens" integer DEFAULT 0 NOT NULL,
	"costUsd" double precision DEFAULT 0 NOT NULL,
	"scraperId" text,
	"runId" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changelog" (
	"id" text PRIMARY KEY NOT NULL,
	"version" text NOT NULL,
	"description" text NOT NULL,
	"appliedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scraper_run_event" (
	"id" text PRIMARY KEY NOT NULL,
	"runId" text NOT NULL,
	"phase" text NOT NULL,
	"startedAt" timestamp (3) NOT NULL,
	"finishedAt" timestamp (3),
	"metrics" jsonb,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"weeklyDigest" boolean DEFAULT true NOT NULL,
	"scanCompleteAlerts" boolean DEFAULT true NOT NULL,
	"thresholdNotifications" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";
--> statement-breakpoint
DROP INDEX "pain_point_embedding_hnsw_idx";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'scraper_run'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "scraper_run" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "scraper_run" ADD CONSTRAINT "scraper_run_pkey" PRIMARY KEY("id","startedAt");--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "account_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "provider_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "access_token_expires_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refresh_token_expires_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "created_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updated_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "pain_point" ADD COLUMN "upvoteCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pain_point" ADD COLUMN "sourceType" "PainPointSourceType" DEFAULT 'post';--> statement-breakpoint
ALTER TABLE "pain_point" ADD COLUMN "redditPostId" text;--> statement-breakpoint
ALTER TABLE "pain_point_cluster" ADD COLUMN "memberCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "scraper" ADD COLUMN "lastSuccessfulRunAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "expires_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "created_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "updated_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "anonymize_reddit_usernames" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deleted_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ltd_tier" "LtdTier" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ltd_price_paid" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_login_method" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "plan" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referred_by_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_activated_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "custom_api_key" text;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "expires_at" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "created_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "updated_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "plan" text;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."scraper_run"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scraper_run_event" ADD CONSTRAINT "scraper_run_event_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."scraper_run"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "ai_usage_userId_createdAt_idx" ON "ai_usage" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "ai_usage_modelId_createdAt_idx" ON "ai_usage" USING btree ("modelId","createdAt");--> statement-breakpoint
CREATE INDEX "ai_usage_runId_idx" ON "ai_usage" USING btree ("runId");--> statement-breakpoint
CREATE INDEX "scraper_run_event_runId_phase_idx" ON "scraper_run_event" USING btree ("runId","phase");--> statement-breakpoint
CREATE UNIQUE INDEX "user_notification_preferences_userId_key" ON "user_notification_preferences" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "pain_point_tags_idx" ON "pain_point" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "pain_point_embedding_hnsw_idx" ON "pain_point_embedding" USING hnsw ("embedding" vector_cosine_ops) WITH (m=24,ef_construction=200);--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "accountId";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "providerId";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "accessToken";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "refreshToken";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "idToken";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "accessTokenExpiresAt";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "refreshTokenExpiresAt";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "expiresAt";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "ipAddress";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "userAgent";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "emailVerified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "displayUsername";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "stripeCustomerId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "anonymizeRedditUsernames";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "deletedAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "ltdTier";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "ltdPricePaid";--> statement-breakpoint
ALTER TABLE "verification" DROP COLUMN "expiresAt";--> statement-breakpoint
ALTER TABLE "verification" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "verification" DROP COLUMN "updatedAt";