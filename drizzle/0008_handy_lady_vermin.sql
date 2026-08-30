ALTER TABLE "scraper_run" DROP CONSTRAINT "scraper_run_pkey";--> statement-breakpoint
ALTER TABLE "scraper_run" ADD PRIMARY KEY ("id");