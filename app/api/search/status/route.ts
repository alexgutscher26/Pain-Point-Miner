import { db } from "@/lib/db";
import { scraper, scraperRun, painPoint } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext, workspaceScope } from "@/lib/api-auth";
import { normalizeRunStatus } from "@/lib/run-status";

const searchStatusQuerySchema = z.object({
  id: z.string().uuid("Invalid scraper id"),
});

export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;

  const { searchParams } = new URL(req.url);
  const parsedQuery = searchStatusQuerySchema.safeParse({
    id: searchParams.get("id"),
  });
  if (!parsedQuery.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid query parameters",
      parsedQuery.error.flatten(),
      correlationId,
    );
  }
  const { id: scraperId } = parsedQuery.data;

  try {
    const currentScraper = await db.query.scraper.findFirst({
      where: and(
        eq(scraper.id, scraperId),
        eq(scraper.userId, userId),
        workspaceScope(scraper.workspaceId, workspaceId),
      ),
    });

    if (!currentScraper) {
      return apiError(
        404,
        "NOT_FOUND",
        "Scraper not found",
        undefined,
        correlationId,
      );
    }

    // Get the latest run for stats
    const latestRun = await db.query.scraperRun.findFirst({
      where: eq(scraperRun.scraperId, scraperId),
      orderBy: [desc(scraperRun.startedAt)],
    });

    const results = await db.query.painPoint.findMany({
      where: and(
        eq(painPoint.scraperId, scraperId),
        eq(painPoint.userId, userId),
        workspaceScope(painPoint.workspaceId, workspaceId),
      ),
    });

    return apiJson(
      {
        scraper: currentScraper,
        latestRun,
        painPointCount: results.length,
        status: normalizeRunStatus(latestRun?.status),
      },
      200,
      correlationId,
    );
  } catch (error) {
    console.error("Status API Error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}
