import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env" });
config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

const db = await sql`SELECT current_database()`;
console.log("Database:", db[0].current_database);

const tables = await sql`SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name`;
console.log(`\nTables (${tables.length}):`);
for (const t of tables) {
  console.log(`  ${t.table_schema}.${t.table_name}`);
}

await sql.end();
