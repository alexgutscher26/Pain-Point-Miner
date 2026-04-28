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
ALTER TABLE "scraper_run_summary" ADD CONSTRAINT "scraper_run_summary_scraperId_fkey" FOREIGN KEY ("scraperId") REFERENCES "public"."scraper"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "scraper_run_summary_scraperId_month_key" ON "scraper_run_summary" USING btree ("scraperId","month");