import { inngest } from "../client";
import { mergeDriftingClusters } from "@/lib/clustering";

/**
 * Daily Cluster Maintenance & Auto-Merge Job
 *
 * Scans all pain point clusters across users and merges any clusters
 * that have drifted too close together (cosine similarity >= 0.95).
 */
export const clusterMergeJob = inngest.createFunction(
  {
    id: "daily-cluster-merge",
    name: "Daily Cluster Merge (Drift Consolidation)",
    triggers: [
      { cron: "0 5 * * *" }, // Daily at 5:00 AM UTC
      { event: "clustering/clusters.merge" },
    ],
  },
  async ({ step }) => {
    const result = await step.run("merge-drifting-clusters", async () => {
      const mergeOutcome = await mergeDriftingClusters({
        similarityThreshold: 0.95,
        maxPairs: 100,
      });

      return {
        timestamp: new Date().toISOString(),
        mergedClustersCount: mergeOutcome.mergedCount,
        merges: mergeOutcome.merges,
      };
    });

    return {
      message: `Completed cluster merge consolidation: ${result.mergedClustersCount} clusters merged.`,
      result,
    };
  },
);
