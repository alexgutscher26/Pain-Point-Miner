import { inngest } from "../client";
import { db } from "@/lib/db";
import { painPoint, painPointEmbedding, painPointCluster, scraper } from "@/lib/db/schema";
import { eq, notExists } from "drizzle-orm";

/**
 * Weekly Maintenance: Dead Data Cleanup
 * 
 * 1. Pain points with no parent scraperId (orphaned by hard-delete bugs)
 * 2. Embeddings in pain_point_embedding with no corresponding pain_point row
 * 3. Empty clusters where sourceCount = 0
 */
export const cleanupDeadData = inngest.createFunction(
  { 
    id: "cleanup-dead-data", 
    name: "Cleanup Dead Data",
    triggers: [{ cron: "0 0 * * 0" }]
  },
  async ({ step }) => {
    const results = await step.run("purge-orphans", async () => {
      return await db.transaction(async (tx) => {
        // 1. Clean up orphaned pain points (no parent scraper)
        // Using notExists for a correlated subquery cleanup
        const orphanedPP = await tx
          .delete(painPoint)
          .where(
            notExists(
              tx.select()
                .from(scraper)
                .where(eq(scraper.id, painPoint.scraperId))
            )
          )
          .returning({ id: painPoint.id });

        // 2. Clean up orphaned embeddings (no parent pain point)
        const orphanedEmbeddings = await tx
          .delete(painPointEmbedding)
          .where(
            notExists(
              tx.select()
                .from(painPoint)
                .where(eq(painPoint.id, painPointEmbedding.painPointId))
            )
          )
          .returning({ painPointId: painPointEmbedding.painPointId });

        // 3. Clean up empty clusters (sourceCount = 0)
        const emptyClusters = await tx
          .delete(painPointCluster)
          .where(eq(painPointCluster.sourceCount, 0))
          .returning({ id: painPointCluster.id });

        return {
          painPointsDeleted: orphanedPP.length,
          embeddingsDeleted: orphanedEmbeddings.length,
          clustersDeleted: emptyClusters.length,
        };
      });
    });

    return {
      message: "Cleanup completed successfully",
      stats: results,
    };
  }
);
