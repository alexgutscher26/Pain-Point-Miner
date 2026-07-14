import postgres from "postgres";
import fs from "fs";
import "dotenv/config";

const sql = postgres(process.env.DATABASE_URL);

const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pain_point'`;
console.log("pain_point table exists:", tables.length > 0);

if (tables.length === 0) {
  for (const file of ["drizzle/0000_faithful_mimic.sql", "drizzle/0001_ai_usage.sql", "drizzle/0002_hnsw_index_tuning.sql", "drizzle/0003_pain_point_tags_gin_idx.sql", "drizzle/0004_create_dashboard_opportunity_mv.sql", "drizzle/0005_schema_columns_and_triggers.sql", "drizzle/0006_schema_partition_tables.sql"]) {
    const migration = fs.readFileSync(file, "utf8");
    const statements = migration.split("--> statement-breakpoint");
    console.log(`Applying ${statements.length} statements from ${file}...`);
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (trimmed) {
        try {
          await sql.unsafe(trimmed);
          console.log("OK");
        } catch (e) {
          console.log(`Skipped (likely already exists): ${e.message.substring(0, 100)}`);
        }
      }
    }
  }
  console.log("Migration complete");
}

const tables2 = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pain_point'`;
console.log("pain_point table exists now:", tables2.length > 0);

await sql.end();
