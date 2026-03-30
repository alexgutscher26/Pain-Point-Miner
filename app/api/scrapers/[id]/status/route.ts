import { db } from "@/lib/db";
import { scraper, scraperRun } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext } from "@/lib/api-auth";
import { normalizeRunStatus } from "@/lib/run-status";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId } = authContext.context;
  const { id } = await params;

  console.log(`[Onboarding-Status] Checking scraper ${id} for user ${userId}`);

  try {
    const currentScraper = await db.query.scraper.findFirst({
      where: and(eq(scraper.id, id), eq(scraper.userId, userId)),
      with: {
        scraperRuns: {
          orderBy: [desc(scraperRun.startedAt)],
          limit: 1,
        },
      },
    });

    if (!currentScraper) {
      console.warn(`[Onboarding-Status] Scraper ${id} not found for user ${userId}`);
      return apiError(404, "NOT_FOUND", "Scraper not found", undefined, correlationId);
    }

    const latestRun = currentScraper.scraperRuns?.[0];
    const rawStatus = latestRun?.status;
    const status = normalizeRunStatus(rawStatus);

    console.log(`[Onboarding-Status] Scraper ${id} raw status: ${rawStatus}, normalized: ${status}`);

    return apiJson({
      status, // 'completed', 'failed', 'running', etc.
      count: latestRun?.newPainPoints || 0,
      finishedAt: latestRun?.finishedAt,
    }, 200, correlationId);
  } catch (error) {
    console.error("Scraper status API Error:", error);
    return apiError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", undefined, correlationId);
  }
}
