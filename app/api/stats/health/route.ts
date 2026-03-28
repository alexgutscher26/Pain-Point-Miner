import { requireApiContext } from "@/lib/api-auth";
import { getScraperHealthStats } from "@/lib/health-metrics";
import { apiError, apiJson } from "@/lib/api-error";

export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId } = authContext.context;

  try {
    const stats = await getScraperHealthStats(userId);
    return apiJson(stats, 200, correlationId);
  } catch (error) {
    console.error("Scraper health API error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Failed to fetch health metrics",
      undefined,
      correlationId,
    );
  }
}
