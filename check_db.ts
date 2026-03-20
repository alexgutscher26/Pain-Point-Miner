import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function check() {
  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'session';
    `);
    console.log("Columns in 'session' table:");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Error checking columns:", e);
  } finally {
    process.exit();
  }
}

check();
