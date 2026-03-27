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
