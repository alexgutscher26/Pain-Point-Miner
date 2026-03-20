/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const token = "nGLU9AdkJHYkSUEjquspFFhiPj1ESI7v";
    console.log(`Running Failing Query for token: ${token}`);
    const res = await sql`
      select "id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId" 
      from "session" 
      where "session"."token" = ${token}
    `;
    console.log("Success! Query returned:", res.length, "rows.");
  } catch (e: any) {
    console.error("FAILED EXACT QUERY:", e.message);
  } finally {
    await sql.end();
  }
}

check();
