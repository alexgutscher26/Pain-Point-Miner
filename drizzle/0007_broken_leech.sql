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
