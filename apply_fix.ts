import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

async function apply() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
      console.error("No DATABASE_URL found");
      return;
  }
  const sql = postgres(connectionString);
  try {
    console.log("Applying columns to 'user' table...");
    await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "anonymizeRedditUsernames" boolean DEFAULT false NOT NULL`;
    await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deletedAt" timestamp (3)`;
    console.log("SUCCESS: Columns added.");
  } catch (e) {
    console.error("Error applying SQL:", e);
  } finally {
    await sql.end();
  }
}

apply();
