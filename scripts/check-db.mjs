import { config } from "dotenv";
import postgres from "postgres";

console.log("BEFORE config - DATABASE_URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 60) + "..." : "NOT SET");

config({ path: ".env" });

console.log("AFTER .env - DATABASE_URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 60) + "..." : "NOT SET");

config({ path: ".env.local" });

console.log("AFTER .env.local - DATABASE_URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 60) + "..." : "NOT SET");

const url = process.env.DATABASE_URL;

const sql = postgres(url, { ssl: "require" });

const schemas = await sql`SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name`;
console.log(`\nSchemas: ${schemas.map(s => '  ' + s.schema_name).join('\n')}`);

for (const s of schemas) {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema=${s.schema_name} ORDER BY table_name`;
  if (tables.length > 0) {
    console.log(`\n${s.schema_name} (${tables.length} tables):`);
    for (const t of tables) {
      console.log("  -", t.table_name);
    }
  }
}

await sql.end();
