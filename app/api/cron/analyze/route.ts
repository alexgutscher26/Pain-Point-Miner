import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const tables = [
  "pain_point",
  "pain_point_embedding",
  "scraper",
  "scraper_run",
  "user",
  "workspace",
];

export async function GET(request: Request) {
  // Use a secret header for security
  const authHeader = request.headers.get("Authorization");
  const expectedToken = process.env.CRON_SECRET || "rpp-maintenance-token";

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("🚀 Starting database maintenance via CRON...");
  const results: Record<string, string> = {};

  for (const table of tables) {
    try {
      await db.execute(sql.raw(`ANALYZE ${table}`));
      results[table] = "success";
    } catch (err: any) {
      console.error(`❌ Failed to analyze ${table}:`, err);
      results[table] = `error: ${err.message}`;
    }
  }

  return NextResponse.json({ message: "Maintenance complete.", results });
}
