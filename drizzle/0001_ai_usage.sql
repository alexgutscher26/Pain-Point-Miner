CREATE TABLE "ai_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"modelId" text NOT NULL,
	"inputTokens" integer DEFAULT 0 NOT NULL,
	"outputTokens" integer DEFAULT 0 NOT NULL,
	"costUsd" double precision DEFAULT 0 NOT NULL,
	"scraperId" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "ai_usage_userId_createdAt_idx" ON "ai_usage" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "ai_usage_modelId_createdAt_idx" ON "ai_usage" USING btree ("modelId","createdAt");
