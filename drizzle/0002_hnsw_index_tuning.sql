DROP INDEX IF EXISTS "pain_point_embedding_hnsw_idx";--> statement-breakpoint
CREATE INDEX "pain_point_embedding_hnsw_idx" ON "pain_point_embedding" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 24, ef_construction = 200);
