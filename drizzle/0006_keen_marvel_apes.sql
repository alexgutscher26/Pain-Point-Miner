CREATE TABLE "subreddit_cache" (
	"name" text PRIMARY KEY NOT NULL,
	"subscriberCount" integer,
	"description" text,
	"activeUsers" integer,
	"category" text,
	"cachedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
