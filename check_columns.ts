import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

async function check() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
      console.error("No DATABASE_URL found");
      return;
  }
  const sql = postgres(connectionString);
  try {
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'session'
    `;
    console.log("Current columns in 'session' table:", columns.map(c => c.column_name).join(", "));
  } catch (e) {
    console.error("Error querying information_schema:", e);
  } finally {
    await sql.end();
  }
}

check();
