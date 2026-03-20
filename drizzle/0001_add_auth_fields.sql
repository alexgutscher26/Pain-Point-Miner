ALTER TABLE "user" ADD COLUMN "anonymizeRedditUsernames" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deletedAt" timestamp (3);