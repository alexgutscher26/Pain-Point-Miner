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

export interface MergeDriftingClustersOptions {
  userId?: string;
  workspaceId?: string | null;
  similarityThreshold?: number; // default 0.95
  maxPairs?: number;
}

export interface ClusterMergeDetail {
  sourceClusterId: string;
  targetClusterId: string;
  similarity: number;
  painPointsMoved: number;
}

export interface ClusterMergeResult {
  mergedCount: number;
  merges: ClusterMergeDetail[];
}

/**
 * Identify pairs of clusters that are too close in embedding space
 * (cosine similarity >= threshold, default 0.95) and merge them automatically.
 */
export async function mergeDriftingClusters(
  options: MergeDriftingClustersOptions = {},
): Promise<ClusterMergeResult> {
  const threshold = options.similarityThreshold ?? 0.95;
  const maxPairs = options.maxPairs ?? 50;

  const conditions = [
    sql`c1.id < c2.id`,
    sql`c1.embedding IS NOT NULL AND c2.embedding IS NOT NULL`,
    sql`1 - (c1.embedding <=> c2.embedding) >= ${threshold}`,
  ];

  if (options.userId) {
    conditions.push(
      sql`c1."userId" = ${options.userId} AND c2."userId" = ${options.userId}`,
    );
  }

  if (options.workspaceId !== undefined) {
    if (options.workspaceId === null) {
      conditions.push(
        sql`c1."workspaceId" IS NULL AND c2."workspaceId" IS NULL`,
      );
    } else {
      conditions.push(
        sql`c1."workspaceId" = ${options.workspaceId} AND c2."workspaceId" = ${options.workspaceId}`,
      );
    }
  }

  const whereSql = sql.join(conditions, sql` AND `);

  // Find close cluster pairs
  const pairs = await db.execute<{
    c1Id: string;
    c1Count: number;
    c1Embedding: number[] | string | null;
    c2Id: string;
    c2Count: number;
    c2Embedding: number[] | string | null;
    similarity: number;
  }>(
    sql`SELECT
          c1.id AS "c1Id",
          c1."sourceCount" AS "c1Count",
          c1.embedding AS "c1Embedding",
          c2.id AS "c2Id",
          c2."sourceCount" AS "c2Count",
          c2.embedding AS "c2Embedding",
          1 - (c1.embedding <=> c2.embedding) AS similarity
        FROM pain_point_cluster c1
        INNER JOIN pain_point_cluster c2
          ON c1."userId" = c2."userId"
          AND ((c1."workspaceId" IS NULL AND c2."workspaceId" IS NULL) OR (c1."workspaceId" = c2."workspaceId"))
        WHERE ${whereSql}
        ORDER BY similarity DESC
        LIMIT ${maxPairs}`,
  );

  const deletedClusters = new Set<string>();
  const merges: ClusterMergeDetail[] = [];

  for (const pair of Array.from(pairs)) {
    if (deletedClusters.has(pair.c1Id) || deletedClusters.has(pair.c2Id)) {
      continue;
    }

    // Retain cluster with higher source count as target; break tie with c1
    const isC1Target = (pair.c1Count || 0) >= (pair.c2Count || 0);
    const targetClusterId = isC1Target ? pair.c1Id : pair.c2Id;
    const sourceClusterId = isC1Target ? pair.c2Id : pair.c1Id;
    const targetCount = isC1Target ? pair.c1Count || 1 : pair.c2Count || 1;
    const sourceCount = isC1Target ? pair.c2Count || 1 : pair.c1Count || 1;

    // 1. Move all pain points to target cluster
    await db
      .update(painPoint)
      .set({
        clusterId: targetClusterId,
        updatedAt: new Date(),
      })
      .where(eq(painPoint.clusterId, sourceClusterId));

    // 2. Compute blended centroid embedding if both are available
    const rawEmb1 = pair.c1Embedding;
    const rawEmb2 = pair.c2Embedding;
    const emb1 = Array.isArray(rawEmb1)
      ? rawEmb1
      : typeof rawEmb1 === "string"
        ? JSON.parse(rawEmb1)
        : null;
    const emb2 = Array.isArray(rawEmb2)
      ? rawEmb2
      : typeof rawEmb2 === "string"
        ? JSON.parse(rawEmb2)
        : null;

    if (emb1 && emb2 && emb1.length === emb2.length) {
      const blended: number[] = new Array(emb1.length);
      let sumSq = 0;
      for (let i = 0; i < emb1.length; i++) {
        const v =
          (Number(emb1[i]) * (pair.c1Count || 1) +
            Number(emb2[i]) * (pair.c2Count || 1)) /
          ((pair.c1Count || 1) + (pair.c2Count || 1));
        blended[i] = v;
        sumSq += v * v;
      }
      const norm = Math.sqrt(sumSq) || 1;
      const normalizedEmbedding = blended.map((v) => v / norm);

      await db
        .update(painPointCluster)
        .set({
          embedding: normalizedEmbedding,
          updatedAt: new Date(),
        })
        .where(eq(painPointCluster.id, targetClusterId));
    }

    // 3. Refresh rollups for target cluster
    await refreshClusterRollups(targetClusterId);

    // 4. Delete the source cluster
    await db
      .delete(painPointCluster)
      .where(eq(painPointCluster.id, sourceClusterId));

    deletedClusters.add(sourceClusterId);
    merges.push({
      sourceClusterId,
      targetClusterId,
      similarity: Number(pair.similarity),
      painPointsMoved: sourceCount,
    });
  }

  return {
    mergedCount: merges.length,
    merges,
  };
}
