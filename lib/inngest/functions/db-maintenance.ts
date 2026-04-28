import { inngest } from "../client";
import { db } from "@/lib/db";
import { dbMaintenanceLog, painPointEmbedding } from "@/lib/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import crypto from "node:crypto";

/**
 * Weekly PGVector HNSW Index Maintenance
 * 
 * 1. Measure index size and similarity search latency before maintenance.
 * 2. Run REINDEX INDEX CONCURRENTLY to defragment the index.
 * 3. Measure size and latency after maintenance.
 * 4. Log results to db_maintenance_log.
 * 5. Alert if index growth exceeds 20% week-over-week.
 */
export const weeklyPgVectorReindex = inngest.createFunction(
  { 
    id: "weekly-pgvector-reindex",
    name: "Weekly PGVector Reindex",
    triggers: [{ cron: "0 3 * * 0" }] // Every Sunday at 3 AM
  },
  async ({ step }) => {
    const taskName = "weekly_pgvector_reindex";
    const indexName = "pain_point_embedding_hnsw_idx";

    const results = await step.run("maintenance-execution", async () => {
      const startTime = Date.now();
      let error: string | undefined;
      
      let sizeBefore = 0;
      let latencyBefore = 0;
      let sizeAfter = 0;
      let latencyAfter = 0;

      try {
        // 1. Measure size before
        const sizeBeforeQuery = await db.execute(
          sql`SELECT pg_relation_size(${indexName}) as size`
        );
        sizeBefore = Number(sizeBeforeQuery[0]?.size) || 0;

        // 2. Measure latency before (average of 5 runs)
        let latencyBeforeTotal = 0;
        for (let i = 0; i < 5; i++) {
          const start = performance.now();
          // Sample similarity search using an existing embedding
          await db.execute(
            sql`SELECT "painPointId" FROM ${painPointEmbedding} ORDER BY embedding <=> (SELECT embedding FROM ${painPointEmbedding} LIMIT 1) LIMIT 10`
          );
          latencyBeforeTotal += performance.now() - start;
        }
        latencyBefore = latencyBeforeTotal / 5;

        // 3. REINDEX INDEX CONCURRENTLY
        // Note: Raw SQL is needed because CONCURRENTLY cannot be parameterized for index names in some drivers,
        // and we must ensure it's not in a transaction.
        await db.execute(sql.raw(`REINDEX INDEX CONCURRENTLY ${indexName}`));

        // 4. Measure size after
        const sizeAfterQuery = await db.execute(
          sql`SELECT pg_relation_size(${indexName}) as size`
        );
        sizeAfter = Number(sizeAfterQuery[0]?.size) || 0;

        // 5. Measure latency after
        let latencyAfterTotal = 0;
        for (let i = 0; i < 5; i++) {
          const start = performance.now();
          await db.execute(
            sql`SELECT "painPointId" FROM ${painPointEmbedding} ORDER BY embedding <=> (SELECT embedding FROM ${painPointEmbedding} LIMIT 1) LIMIT 10`
          );
          latencyAfterTotal += performance.now() - start;
        }
        latencyAfter = latencyAfterTotal / 5;

      } catch (e: any) {
        error = e.message;
        console.error(`[DB MAINTENANCE ERROR] ${error}`);
      }

      const durationMs = Date.now() - startTime;

      // 6. Check for growth alert
      const prevRuns = await db
        .select()
        .from(dbMaintenanceLog)
        .where(eq(dbMaintenanceLog.taskName, taskName))
        .orderBy(desc(dbMaintenanceLog.createdAt))
        .limit(1);
      
      let alertTriggered = false;
      if (prevRuns.length > 0 && prevRuns[0].sizeAfterBytes && sizeAfter > 0) {
        const prevSize = prevRuns[0].sizeAfterBytes;
        if (sizeAfter > prevSize * 1.2) {
          alertTriggered = true;
          console.warn(`🚨 [DB MAINTENANCE] Index ${indexName} grew by >20% week-over-week! Current: ${sizeAfter}, Previous: ${prevSize}`);
        }
      }

      // 7. Log to DB
      await db.insert(dbMaintenanceLog).values({
        id: crypto.randomUUID(),
        taskName,
        indexName,
        sizeBeforeBytes: sizeBefore,
        sizeAfterBytes: sizeAfter,
        durationMs,
        latencyBeforeMs: latencyBefore,
        latencyAfterMs: latencyAfter,
        alertTriggered,
        error,
        createdAt: new Date(),
      });

      return {
        sizeBefore,
        sizeAfter,
        latencyBefore,
        latencyAfter,
        durationMs,
        alertTriggered,
        error
      };
    });

    return {
      message: results.error ? "Maintenance failed" : "Maintenance completed successfully",
      metrics: results,
    };
  }
);
