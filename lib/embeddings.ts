import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { painPoint, painPointEmbedding } from "@/lib/db/schema";
import { str, num } from "@/lib/env";

const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const EMBEDDING_PROVIDER = "openrouter";
const EMBEDDING_DIMENSIONS = 1536;
export const EMBEDDING_BATCH_SIZE = num("EMBEDDING_BATCH_SIZE", 10);

/**
 * Generate a vector embedding for the given text using OpenRouter's embeddings API.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const truncated = text.slice(0, 8_000);
  const baseUrl = str("OPENROUTER_BASE_URL", "https://openrouter.ai");

  const response = await fetch(`${baseUrl}/api/v1/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "ThreddIQ - Reddit Intelligence Engine",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: truncated,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Embedding API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  const embedding: number[] = data?.data?.[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Unexpected embedding dimensions: got ${embedding?.length ?? 0}, expected ${EMBEDDING_DIMENSIONS}`,
    );
  }

  return embedding;
}

/**
 * Generate and persist an embedding for a given pain point.
 * Upserts into the `painPointEmbedding` table.
 */
export async function embedPainPoint(
  painPointId: string,
  userId: string,
  workspaceId: string | null,
): Promise<number[]> {
  const point = await db.query.painPoint.findFirst({
    where: eq(painPoint.id, painPointId),
  });

  if (!point) {
    throw new Error(`Pain point ${painPointId} not found`);
  }

  const text = `${point.title}\n${point.body}`;
  const embedding = await generateEmbedding(text);

  await db
    .insert(painPointEmbedding)
    .values({
      painPointId,
      userId,
      workspaceId,
      provider: EMBEDDING_PROVIDER,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      embedding,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: painPointEmbedding.painPointId,
      set: {
        embedding,
        provider: EMBEDDING_PROVIDER,
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
        updatedAt: new Date(),
      },
    });

  return embedding;
}

type SimilarPainPointResult = {
  painPointId: string;
  similarity: number;
};

/**
 * Find the most similar pain points to the given embedding using PGVector cosine distance.
 */
export async function findSimilarPainPoints(
  embedding: number[],
  userId: string,
  opts?: {
    workspaceId?: string | null;
    limit?: number;
    threshold?: number;
    excludeIds?: string[];
  },
): Promise<SimilarPainPointResult[]> {
  const limit = opts?.limit ?? 10;
  const threshold = opts?.threshold ?? 0.75;
  const excludeIds = opts?.excludeIds ?? [];

  const vectorLiteral = `[${embedding.join(",")}]`;

  const excludeClause =
    excludeIds.length > 0
      ? sql`AND pe."painPointId" NOT IN (${sql.join(
          excludeIds.map((id) => sql`${id}`),
          sql`, `,
        )})`
      : sql``;

  const workspaceClause = opts?.workspaceId
    ? sql`AND pe."workspaceId" = ${opts.workspaceId}`
    : sql`AND pe."workspaceId" IS NULL`;

  const results = await db.execute<{
    painPointId: string;
    similarity: number;
  }>(
    sql`SELECT
          pe."painPointId",
          1 - (pe.embedding <=> ${vectorLiteral}::vector) AS similarity
        FROM pain_point_embedding pe
        WHERE pe."userId" = ${userId}
          ${workspaceClause}
          ${excludeClause}
          AND 1 - (pe.embedding <=> ${vectorLiteral}::vector) >= ${threshold}
        ORDER BY similarity DESC
        LIMIT ${limit}`,
  );

  return Array.from(results) as SimilarPainPointResult[];
}
