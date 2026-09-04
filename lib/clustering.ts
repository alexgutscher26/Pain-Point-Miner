import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { painPoint, painPointCluster } from "@/lib/db/schema";
import { embedPainPoint } from "@/lib/embeddings";
import {
  aggregateBudgetSignals,
  normalizeBudgetSignals,
} from "@/lib/budget-signals";
import { aggregateCompetitorIntel } from "@/lib/competitor-intel";
import { num } from "@/lib/env";

const CLUSTER_SIMILARITY_THRESHOLD = num("PGVECTOR_COSINE_THRESHOLD", 0.82);
const EMBEDDING_PROVIDER = "openrouter";
const EMBEDDING_MODEL = "openai/text-embedding-3-small";

/**
 * Embed a pain point and assign it to the nearest existing cluster,
 * or create a new cluster if no close match is found.
 */
export async function clusterPainPoint(
  painPointId: string,
  userId: string,
  workspaceId: string | null,
  apiKeyOverride?: string | null,
): Promise<{ clusterId: string; isNew: boolean }> {
  // 1. Generate / retrieve the embedding
  const embedding = await embedPainPoint(
    painPointId,
    userId,
    workspaceId,
    apiKeyOverride,
  );

  // 2. Search for existing cluster centroids that are close enough
  const candidates = await findSimilarClusterCentroids(
    embedding,
    userId,
    workspaceId,
  );

  const point = await db.query.painPoint.findFirst({
    where: eq(painPoint.id, painPointId),
  });

  if (!point) {
    throw new Error(`Pain point ${painPointId} not found`);
  }

  // 3. Assign to closest cluster or create a new one
  if (candidates.length > 0) {
    const best = candidates[0];
    return assignToCluster(painPointId, best.clusterId, best.similarity);
  }

  return createNewCluster(painPointId, userId, workspaceId, embedding, point);
}

// ── Internal helpers ────────────────────────────────────────────────

type ClusterCandidate = {
  clusterId: string;
  similarity: number;
};

/**
 * Find cluster centroids close to the given embedding using raw SQL
 * against the painPointCluster.embedding vector(1536) column using the <=> operator.
 */
async function findSimilarClusterCentroids(
  embedding: number[],
  userId: string,
  workspaceId: string | null,
): Promise<ClusterCandidate[]> {
  const vectorLiteral = `[${embedding.join(",")}]`;

  const workspaceClause = workspaceId
    ? sql`AND c."workspaceId" = ${workspaceId}`
    : sql`AND c."workspaceId" IS NULL`;

  const results = await db.execute<{
    clusterId: string;
    similarity: number;
  }>(
    sql`SELECT
          c.id AS "clusterId",
          1 - (c.embedding <=> ${vectorLiteral}::vector) AS similarity
        FROM pain_point_cluster c
        WHERE c."userId" = ${userId}
          ${workspaceClause}
          AND c.embedding IS NOT NULL
          AND 1 - (c.embedding <=> ${vectorLiteral}::vector) >= ${CLUSTER_SIMILARITY_THRESHOLD}
        ORDER BY similarity DESC
        LIMIT 1`,
  );

  return Array.from(results) as ClusterCandidate[];
}

async function assignToCluster(
  painPointId: string,
  clusterId: string,
  similarity: number,
): Promise<{ clusterId: string; isNew: boolean }> {
  await db
    .update(painPoint)
    .set({
      clusterId,
      clusterSimilarity: similarity,
      updatedAt: new Date(),
    })
    .where(eq(painPoint.id, painPointId));

  await db
    .update(painPointCluster)
    .set({
      lastMatchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(painPointCluster.id, clusterId));

  await refreshClusterRollups(clusterId);

  return { clusterId, isNew: false };
}

async function createNewCluster(
  painPointId: string,
  userId: string,
  workspaceId: string | null,
  embedding: number[],
  point: { title: string; body: string },
): Promise<{ clusterId: string; isNew: boolean }> {
  const clusterId = crypto.randomUUID();

  await db.insert(painPointCluster).values({
    id: clusterId,
    userId,
    workspaceId,
    embeddingProvider: EMBEDDING_PROVIDER,
    embeddingModel: EMBEDDING_MODEL,
    embedding,
    canonicalTitle: point.title,
    canonicalBody: point.body.slice(0, 2_000),
    sourceCount: 1,
    updatedAt: new Date(),
  });

  await db
    .update(painPoint)
    .set({
      clusterId,
      clusterSimilarity: 1.0,
      updatedAt: new Date(),
    })
    .where(eq(painPoint.id, painPointId));

  await refreshClusterRollups(clusterId);

  return { clusterId, isNew: true };
}

export async function refreshClusterRollups(clusterId: string) {
  const clusterPoints = await db.query.painPoint.findMany({
    where: eq(painPoint.clusterId, clusterId),
    columns: {
      id: true,
      budget: true,
      triedSolutions: true,
    },
  });

  const budgetSignals = clusterPoints.flatMap((point) =>
    normalizeBudgetSignals(point.budget),
  );
  const { budgetSignalCount, estimatedTamUsdAnnual } =
    aggregateBudgetSignals(budgetSignals);

  const triedSolutions = clusterPoints
    .map((point) => point.triedSolutions)
    .filter((s): s is string[] => s !== null);
  const competitorIntel = await aggregateCompetitorIntel(triedSolutions);

  await db
    .update(painPointCluster)
    .set({
      sourceCount: clusterPoints.length,
      budgetSignalCount,
      estimatedTamUsdAnnual,
      competitorIntel,
      lastMatchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(painPointCluster.id, clusterId));
}
