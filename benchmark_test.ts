import { db } from "@/lib/db";
import { subredditCache } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  const records = [];
  for (let i = 0; i < 50; i++) {
    records.push({
      name: `bench_subreddit_${i}`,
      subscriberCount: 1000 + i,
      description: `bench description ${i}`,
      activeUsers: 10 + i,
      category: null,
      cachedAt: new Date(),
    });
  }

  // 1. Loop insert
  const startLoop = performance.now();
  for (const record of records) {
    await db
      .insert(subredditCache)
      .values(record)
      .onConflictDoUpdate({
        target: subredditCache.name,
        set: {
          subscriberCount: record.subscriberCount,
          description: record.description,
          activeUsers: record.activeUsers,
          cachedAt: record.cachedAt,
        },
      });
  }
  const endLoop = performance.now();
  console.log(`Loop insert took ${endLoop - startLoop} ms`);

  // Update dates for next bulk insert
  const records2 = records.map(r => ({ ...r, cachedAt: new Date() }));

  // 2. Bulk insert
  const startBulk = performance.now();
  await db
    .insert(subredditCache)
    .values(records2)
    .onConflictDoUpdate({
      target: subredditCache.name,
      set: {
        subscriberCount: sql`EXCLUDED."subscriberCount"`,
        description: sql`EXCLUDED.description`,
        activeUsers: sql`EXCLUDED."activeUsers"`,
        cachedAt: sql`EXCLUDED."cachedAt"`,
      },
    });
  const endBulk = performance.now();
  console.log(`Bulk insert took ${endBulk - startBulk} ms`);

  console.log(`Improvement: ${((endLoop - startLoop) / (endBulk - startBulk)).toFixed(2)}x faster`);

  // Cleanup
  await db.execute(sql`DELETE FROM ${subredditCache} WHERE name LIKE 'bench_subreddit_%'`);
}

main().catch(console.error).finally(() => process.exit(0));
