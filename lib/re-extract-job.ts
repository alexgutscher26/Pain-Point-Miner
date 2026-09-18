import { db } from "@/lib/db";
import { painPoint, painPointComment } from "@/lib/db/schema";
import { and, eq, lt, sql } from "drizzle-orm";
import {
  CURRENT_EXTRACTION_SCHEMA_VERSION,
  extractPainPointsBatch,
} from "@/lib/ai";
import { cleanCommentBody } from "@/lib/mining/discovery";

export interface ReExtractOptions {
  userId?: string;
  workspaceId?: string | null;
  batchSize?: number;
  targetVersion?: number;
  customApiKey?: string | null;
}

export interface ReExtractResult {
  scanned: number;
  updated: number;
  remaining: number;
}

/**
 * Re-runs AI extraction on cached posts/pain points whose extraction schema is outdated
 * (schemaVersion < CURRENT_EXTRACTION_SCHEMA_VERSION).
 */
export async function reExtractOutdatedOpportunities({
  userId,
  workspaceId,
  batchSize = 10,
  targetVersion = CURRENT_EXTRACTION_SCHEMA_VERSION,
  customApiKey,
}: ReExtractOptions = {}): Promise<ReExtractResult> {
  const conditions = [lt(painPoint.schemaVersion, targetVersion)];
  if (userId) {
    conditions.push(eq(painPoint.userId, userId));
  }
  if (workspaceId) {
    conditions.push(eq(painPoint.workspaceId, workspaceId));
  }

  // 1. Fetch outdated pain points
  const outdatedPoints = await db.query.painPoint.findMany({
    where: and(...conditions),
    limit: batchSize,
    with: {
      painPointComments: true,
    },
  });

  if (outdatedPoints.length === 0) {
    return { scanned: 0, updated: 0, remaining: 0 };
  }

  // 2. Count total remaining outdated records
  const totalOutdatedCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(painPoint)
    .where(and(...conditions));
  const remaining = Math.max(
    0,
    Number(totalOutdatedCount[0]?.count ?? 0) - outdatedPoints.length,
  );

  // 3. Format into posts for batch extraction
  const batchPosts = outdatedPoints.map((point) => ({
    title: point.title,
    selftext: point.body,
    url: point.postUrl || "",
    author: point.author || "unknown",
    subreddit: point.subreddit || "saas",
    comments: (point.painPointComments || []).map((c) => ({
      body: cleanCommentBody(c.body),
    })),
  }));

  try {
    const extractedResults = await extractPainPointsBatch(
      batchPosts,
      [],
      undefined,
      "deep",
      userId ? { userId } : undefined,
      customApiKey,
    );

    let updatedCount = 0;

    for (let i = 0; i < outdatedPoints.length; i++) {
      const originalPoint = outdatedPoints[i];
      const matchingExtracted = extractedResults.find(
        (ext) =>
          ext.url === originalPoint.postUrl ||
          (ext.title && ext.title.toLowerCase() === originalPoint.title.toLowerCase()),
      );

      const tags = [...(originalPoint.tags || [])];

      if (matchingExtracted) {
        if (matchingExtracted.targetUser) {
          tags.push(`persona:${matchingExtracted.targetUser}`);
        }
        if (
          matchingExtracted.willingnessToPay &&
          matchingExtracted.willingnessToPay !== "unknown"
        ) {
          tags.push(`wtp:${matchingExtracted.willingnessToPay}`);
        }
        if (
          matchingExtracted.competingProducts &&
          matchingExtracted.competingProducts.length > 0
        ) {
          for (const comp of matchingExtracted.competingProducts) {
            tags.push(`competitor:${comp}`);
          }
        }

        const explanationParts: string[] = [];
        if (matchingExtracted.confidenceScore !== undefined) {
          explanationParts.push(
            `Confidence: ${(matchingExtracted.confidenceScore * 100).toFixed(0)}%`,
          );
        }
        if (matchingExtracted.targetUser) {
          explanationParts.push(`Persona: ${matchingExtracted.targetUser}`);
        }
        if (
          matchingExtracted.willingnessToPay &&
          matchingExtracted.willingnessToPay !== "unknown"
        ) {
          explanationParts.push(`WTP: ${matchingExtracted.willingnessToPay}`);
        }
        if (matchingExtracted.featureRequested) {
          explanationParts.push(`Feature: ${matchingExtracted.featureRequested}`);
        }

        await db
          .update(painPoint)
          .set({
            title: matchingExtracted.title || originalPoint.title,
            body: matchingExtracted.body || originalPoint.body,
            score: matchingExtracted.painIntensity || originalPoint.score,
            urgency: matchingExtracted.urgency || originalPoint.urgency,
            monetizationScore:
              matchingExtracted.monetizationScore ||
              originalPoint.monetizationScore,
            marketMaturity:
              matchingExtracted.marketMaturity || originalPoint.marketMaturity,
            budget: matchingExtracted.budget || originalPoint.budget,
            tags: Array.from(new Set(tags)),
            scoreExplanation:
              explanationParts.length > 0
                ? explanationParts.join(" | ")
                : originalPoint.scoreExplanation,
            schemaVersion: targetVersion,
            promptVersion: matchingExtracted.promptVersion || "v1",
            rawResponse: matchingExtracted.rawResponse
              ? matchingExtracted.rawResponse.slice(0, 10000)
              : null,
            originalLanguage: matchingExtracted.originalLanguage || "en",
            updatedAt: new Date(),
          })
          .where(eq(painPoint.id, originalPoint.id));

        updatedCount++;
      } else {
        // Mark as updated to targetVersion so it's not reprocessed repeatedly
        await db
          .update(painPoint)
          .set({
            schemaVersion: targetVersion,
            updatedAt: new Date(),
          })
          .where(eq(painPoint.id, originalPoint.id));
      }
    }

    return {
      scanned: outdatedPoints.length,
      updated: updatedCount,
      remaining,
    };
  } catch (error) {
    console.error("[reExtractOutdatedOpportunities] Error during re-extraction:", error);
    // Mark the batch as updated with current schema version to prevent infinite error loops
    await Promise.all(
      outdatedPoints.map((p) =>
        db
          .update(painPoint)
          .set({ schemaVersion: targetVersion, updatedAt: new Date() })
          .where(eq(painPoint.id, p.id)),
      ),
    );
    return {
      scanned: outdatedPoints.length,
      updated: 0,
      remaining,
    };
  }
}
