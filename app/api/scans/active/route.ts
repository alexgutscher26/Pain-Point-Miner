import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { scraper, scraperRun } from "@/lib/db/schema";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(req.headers);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const activeStatuses = ["scanning", "extracting", "clustering", "running"];

    const activeRuns = (
      await db
        .select({
          id: scraperRun.id,
          scraperId: scraperRun.scraperId,
          keywords: scraper.keywords,
          subreddits: scraper.subreddits,
          status: scraperRun.status,
          startedAt: scraperRun.startedAt,
          postsFetched: scraperRun.postsFetched,
          postsMatched: scraperRun.postsMatched,
          commentsFetched: scraperRun.commentsFetched,
          newPainPoints: scraperRun.newPainPoints,
        })
        .from(scraperRun)
        .innerJoin(scraper, eq(scraperRun.scraperId, scraper.id))
        .where(
          and(
            eq(scraper.userId, session.user.id),
            inArray(scraperRun.status, activeStatuses),
            isNull(scraperRun.finishedAt),
          ),
        )
        .orderBy(desc(scraperRun.startedAt))
        .limit(10)
    ).map((run) => ({
      id: run.id,
      scraperId: run.scraperId,
      scraperName: run.keywords?.[0] || "Active Scan",
      keyword: run.keywords?.[0] || "Active Scan",
      subreddits: Array.isArray(run.subreddits) ? run.subreddits : [],
      status: run.status,
      startedAt: run.startedAt,
      postsFetched: run.postsFetched,
      postsMatched: run.postsMatched,
      commentsFetched: run.commentsFetched,
      newPainPoints: run.newPainPoints,
    }));

    return NextResponse.json({
      activeScansCount: activeRuns.length,
      activeRuns,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Active Scans Query Error]", message);
    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }
}
