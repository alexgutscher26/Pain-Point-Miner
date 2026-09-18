import { db } from "@/lib/db";
import { painPoint } from "@/lib/db/schema";
import { and, asc, eq, gt } from "drizzle-orm";
import {
  DEFAULT_WEIGHTS,
  generateScoreExplanation,
  ScoringWeights,
  toOpportunityScore,
} from "@/lib/dashboard-metrics";

export interface ReScoreJobOptions {
  batchSize?: number;
  maxRecords?: number;
}

export interface ReScoreJobResult {
  totalProcessed: number;
  totalUpdated: number;
  durationMs: number;
}

const DEFAULT_BATCH_SIZE = 100;

/**
 * Re-scores opportunities for a user in production-ready batches with cursor-based pagination.
 * Guarantees bounded memory footprint with high-throughput batching and transactional consistency.
 */
export async function reScoreUserOpportunities(
  userId: string,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  options: ReScoreJobOptions = {},
): Promise<ReScoreJobResult> {
  const startTime = Date.now();
  const batchSize = Math.max(1, options.batchSize ?? DEFAULT_BATCH_SIZE);
  const maxRecords = options.maxRecords ?? Infinity;

  console.log(
    `[Re-Score Job] Starting for user ${userId} (batchSize: ${batchSize})...`,
  );

  let totalProcessed = 0;
  let totalUpdated = 0;
  let lastId: string | undefined = undefined;
  let hasMore = true;

  try {
    while (hasMore && totalProcessed < maxRecords) {
      const currentBatchLimit = Math.min(batchSize, maxRecords - totalProcessed);

      // Cursor-based pagination on indexed ID
      const whereConditions = [eq(painPoint.userId, userId)];
      if (lastId) {
        whereConditions.push(gt(painPoint.id, lastId));
      }

      const batchPoints = await db.query.painPoint.findMany({
        where: and(...whereConditions),
        orderBy: [asc(painPoint.id)],
        limit: currentBatchLimit,
        columns: {
          id: true,
          score: true,
          urgency: true,
          monetizationScore: true,
          marketMaturity: true,
          sentiment: true,
          mentionCount: true,
          commentCount: true,
        },
        with: {
          painPointFeedback: true,
        },
      });

      if (batchPoints.length === 0) {
        hasMore = false;
        break;
      }

      // Calculate new score and explanation per point
      const updates = batchPoints.map((point) => {
        const dashboardPoint = {
          score: point.score || 0,
          urgency: point.urgency,
          monetizationScore: point.monetizationScore,
          marketMaturity: point.marketMaturity,
          sentiment: point.sentiment,
          mentionCount: point.mentionCount,
          commentCount: point.commentCount,
          upvoteSignal: 0,
          userUpvotes:
            point.painPointFeedback?.filter((f) => f.vote === 1).length || 0,
          userDownvotes:
            point.painPointFeedback?.filter((f) => f.vote === -1).length || 0,
        };

        const newScore = toOpportunityScore([dashboardPoint], weights);
        const newExplanation = generateScoreExplanation(dashboardPoint, weights);

        return {
          id: point.id,
          score: newScore,
          scoreExplanation: newExplanation,
        };
      });

      // Execute updates for the current batch
      const executeBatchUpdates = async (client: typeof db) => {
        await Promise.all(
          updates.map((upd) =>
            client
              .update(painPoint)
              .set({
                score: upd.score,
                scoreExplanation: upd.scoreExplanation,
                updatedAt: new Date(),
              })
              .where(eq(painPoint.id, upd.id)),
          ),
        );
      };

      if (typeof db.transaction === "function") {
        await db.transaction(async (tx) => {
          await executeBatchUpdates(tx as any);
        });
      } else {
        await executeBatchUpdates(db);
      }

      totalProcessed += batchPoints.length;
      totalUpdated += updates.length;
      lastId = batchPoints[batchPoints.length - 1].id;

      if (batchPoints.length < currentBatchLimit) {
        hasMore = false;
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(
      `[Re-Score Job] Finished in ${durationMs}ms. ${totalProcessed} points processed, ${totalUpdated} updated for user ${userId}.`,
    );

    return { totalProcessed, totalUpdated, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(
      `[Re-Score Job] Failed for user ${userId} after ${durationMs}ms:`,
      error,
    );
    throw error;
  }
}
