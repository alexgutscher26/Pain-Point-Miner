import { client, db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function runAnalyze() {
  console.log("🚀 Starting database maintenance: ANALYZE...");
  
  const tables = [
    "pain_point",
    "pain_point_embedding",
    "scraper",
    "scraper_run",
    "user",
    "workspace"
  ];

  for (const table of tables) {
    try {
      console.log(`Analyzing table: ${table}...`);
      await db.execute(sql.raw(`ANALYZE ${table}`));
      console.log(`✅ ${table} analyzed.`);
    } catch (err) {
      console.error(`❌ Failed to analyze ${table}:`, err);
    }
  }

  console.log("✨ Maintenance complete.");
}

runAnalyze()
  .catch(console.error)
  .finally(() => process.exit(0));
