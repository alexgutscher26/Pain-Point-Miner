CREATE TABLE "pain_point_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"painPointId" text NOT NULL,
	"userId" text NOT NULL,
	"vote" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reddit_rate_limit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"userAgent" text NOT NULL,
	"url" text NOT NULL,
	"statusCode" integer NOT NULL,
	"error" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "defaultAiModel" SET DEFAULT 'anthropic/claude-3.5-sonnet';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "scoringWeights" jsonb;--> statement-breakpoint
ALTER TABLE "pain_point_feedback" ADD CONSTRAINT "pain_point_feedback_painPointId_fkey" FOREIGN KEY ("painPointId") REFERENCES "public"."pain_point"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pain_point_feedback" ADD CONSTRAINT "pain_point_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "pain_point_feedback_painPointId_userId_key" ON "pain_point_feedback" USING btree ("painPointId","userId");