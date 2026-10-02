import { NextResponse } from "next/server";
import { requireApiContext } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { subredditCache } from "@/lib/db/schema";
import { inArray, sql } from "drizzle-orm";
import { getSubredditMetadataBulk } from "@/lib/reddit";

export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) return authContext.response;

  const url = new URL(req.url);
  const namesQuery = url.searchParams.get("names");
  if (!namesQuery) return NextResponse.json({ subreddits: [] });

  const SUBREDDIT_NAME_RE = /^[a-z0-9_]{3,21}$/;
  const names = namesQuery
    .split(",")
    .map((n) => n.trim().toLowerCase().replace(/^r\//i, ""))
    .filter((n) => SUBREDDIT_NAME_RE.test(n));

  if (names.length === 0) return NextResponse.json({ subreddits: [] });

  // 1. fetch from DB
  const cachedDbRecords = await db.query.subredditCache.findMany({
    where: inArray(subredditCache.name, names),
  });

  const validCache = new Map();
  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  for (const cachedRecord of cachedDbRecords) {
    if (now - new Date(cachedRecord.cachedAt).getTime() < SEVEN_DAYS_MS) {
      validCache.set(cachedRecord.name, cachedRecord);
    }
  }

  const missing = names.filter((n) => !validCache.has(n));
  if (missing.length > 0) {
    // 2. Fetch from reddit
    const freshData = await getSubredditMetadataBulk(missing);

    for (const data of freshData) {
      const normalizedName = data.name.toLowerCase();

      const record = {
        name: normalizedName,
        subscriberCount: data.subscribers,
        description: data.description,
        activeUsers: data.activeUsers,
        category: null, // could extract from metadata if reddit provides it
        cachedAt: new Date(),
      };

      validCache.set(normalizedName, record);
      recordsToInsert.push(record);
    }

    if (recordsToInsert.length > 0) {
      try {
        await db
          .insert(subredditCache)
          .values(recordsToInsert)
          .onConflictDoUpdate({
            target: subredditCache.name,
            set: {
              subscriberCount: sql`EXCLUDED."subscriberCount"`,
              description: sql`EXCLUDED.description`,
              activeUsers: sql`EXCLUDED."activeUsers"`,
              cachedAt: sql`EXCLUDED."cachedAt"`,
            },
          });
      } catch (err) {
        console.error("Failed to bulk upsert subredditCache", err);
      }
    }
  }

  return NextResponse.json({ subreddits: Array.from(validCache.values()) });
}
