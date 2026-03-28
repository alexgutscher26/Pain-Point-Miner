import { db } from "@/lib/db";
import { painPoint } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  DEFAULT_WEIGHTS,
  generateScoreExplanation,
  ScoringWeights,
  toOpportunityScore,
} from "@/lib/dashboard-metrics";

/**
 * Re-scores all opportunities for a user based on their custom scoring weights.
 * This is designed to be run as a "background job" (fire-and-forget).
 */
export async function reScoreUserOpportunities(
  userId: string,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
) {
  const startTime = Date.now();
  console.log(`[Re-Score Job] Starting for user ${userId}...`);

  try {
    // 1. Fetch all pain points for the user
    // We only need the columns used for scoring
    const allPoints = await db.query.painPoint.findMany({
      where: eq(painPoint.userId, userId),
      columns: {
        id: true,
        score: true,
        urgency: true,
        monetizationScore: true,
        marketMaturity: true,
        sentiment: true,
        mentionCount: true,
        commentCount: true,
        // user feedback might be needed if toOpportunityScore uses it
      },
      with: {
        painPointFeedback: true, // Need this for upvotes/downvotes
      },
    });

    if (allPoints.length === 0) {
      console.log(`[Re-Score Job] No points found for user ${userId}.`);
      return;
    }

    console.log(`[Re-Score Job] Re-scoring ${allPoints.length} points...`);

    // 2. Calculate new scores and explanations
    // Note: in a real production app with millions of records, we'd batch this.
    // For this context, we'll process them in memory and bulk update.
    const updates = allPoints.map((point) => {
      const dashboardPoint = {
        score: point.score || 0,
        urgency: point.urgency,
        monetizationScore: point.monetizationScore,
        marketMaturity: point.marketMaturity,
        sentiment: point.sentiment,
        mentionCount: point.mentionCount,
        commentCount: point.commentCount,
        upvoteSignal: 0, // placeholder if not available directly
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

    // 3. Bulk update (using a transaction for safety if needed, but simple loop or batch is fine)
    // Drizzle doesn't have a built-in "bulkUpdate" for multiple rows with different data effortlessly in one query yet
    // so we'll do it in parallel with limited concurrency.
    const CONCURRENCY = 10;
    for (let i = 0; i < updates.length; i += CONCURRENCY) {
      const batch = updates.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map((upd) =>
          db
            .update(painPoint)
            .set({
              score: upd.score,
              scoreExplanation: upd.scoreExplanation,
              updatedAt: new Date(),
            })
            .where(eq(painPoint.id, upd.id)),
        ),
      );
    }

    const duration = Date.now() - startTime;
    console.log(
      `[Re-Score Job] Finished in ${duration}ms. ${allPoints.length} points processed for ${userId}.`,
    );
  } catch (error) {
    console.error(`[Re-Score Job] Failed for user ${userId}:`, error);
  }
}
