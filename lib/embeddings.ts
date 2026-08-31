import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { painPoint, painPointEmbedding } from "@/lib/db/schema";
import { str, num } from "@/lib/env";

const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const EMBEDDING_PROVIDER = "openrouter";
const EMBEDDING_DIMENSIONS = 1536;
export const EMBEDDING_BATCH_SIZE = num("EMBEDDING_BATCH_SIZE", 10);

export function generateLocalFallbackEmbedding(
  text: string,
  dimensions = EMBEDDING_DIMENSIONS,
): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (words.length === 0) {
    vector[0] = 1;
    return vector;
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let h1 = 0;
    for (let j = 0; j < word.length; j++) {
      h1 = (Math.imul(31, h1) + word.charCodeAt(j)) | 0;
    }
    const idx1 = Math.abs(h1) % dimensions;
    vector[idx1] += 1.0;

    if (i < words.length - 1) {
      const bigram = word + "_" + words[i + 1];
      let h2 = 0;
      for (let j = 0; j < bigram.length; j++) {
        h2 = (Math.imul(31, h2) + bigram.charCodeAt(j)) | 0;
      }
      const idx2 = Math.abs(h2) % dimensions;
      vector[idx2] += 1.5;
    }
  }

  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Generate a vector embedding for the given text using OpenRouter's embeddings API.
 */
export async function generateEmbedding(
  text: string,
  apiKeyOverride?: string | null,
): Promise<number[]> {
  const apiKey = apiKeyOverride?.trim() || process.env.OPENROUTER_API_KEY;
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
 * Falls back to local deterministic embedding on remote API failure.
 */
export async function embedPainPoint(
  painPointId: string,
  userId: string,
  workspaceId: string | null,
  apiKeyOverride?: string | null,
): Promise<number[]> {
  const point = await db.query.painPoint.findFirst({
    where: eq(painPoint.id, painPointId),
  });

  if (!point) {
    throw new Error(`Pain point ${painPointId} not found`);
  }

  const text = `${point.title}\n${point.body}`;
  let embedding: number[];
  let provider = EMBEDDING_PROVIDER;

  try {
    embedding = await generateEmbedding(text, apiKeyOverride);
  } catch (err) {
    console.warn(
      `[Embeddings] Remote embedding unavailable (${err instanceof Error ? err.message : String(err)}). Using local fallback embedding.`,
    );
    embedding = generateLocalFallbackEmbedding(text);
    provider = "local-hash";
  }

  await db
    .insert(painPointEmbedding)
    .values({
      painPointId,
      userId,
      workspaceId,
      provider,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      embedding,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: painPointEmbedding.painPointId,
      set: {
        embedding,
        provider,
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
