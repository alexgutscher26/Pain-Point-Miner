import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { cleanupDeadData } from "@/lib/inngest/functions/cleanup-dead-data";
import { weeklyPgVectorReindex } from "@/lib/inngest/functions/db-maintenance";
import { monthlyLogTruncation } from "@/lib/inngest/functions/log-truncation";
import { clusterMergeJob } from "@/lib/inngest/functions/cluster-maintenance";

// Create an API that serves inngest background jobs
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    cleanupDeadData,
    weeklyPgVectorReindex,
    monthlyLogTruncation,
    clusterMergeJob,
  ],
});

