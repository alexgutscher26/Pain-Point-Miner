import { requireApiContext } from "@/lib/api-auth";
import { apiError, apiJson } from "@/lib/api-error";
import { reExtractOutdatedOpportunities } from "@/lib/re-extract-job";
import { db } from "@/lib/db";
import { painPoint } from "@/lib/db/schema";
import { and, eq, lt, sql } from "drizzle-orm";
import { CURRENT_EXTRACTION_SCHEMA_VERSION } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/re-extract
 * Returns the count of opportunities needing schema upgrade.
 */
export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;

  try {
    const conditions = [
      lt(painPoint.schemaVersion, CURRENT_EXTRACTION_SCHEMA_VERSION),
      eq(painPoint.userId, userId),
    ];
    if (workspaceId) {
      conditions.push(eq(painPoint.workspaceId, workspaceId));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(painPoint)
      .where(and(...conditions));

    const outdatedCount = Number(countResult[0]?.count ?? 0);

    return apiJson(
      {
        currentSchemaVersion: CURRENT_EXTRACTION_SCHEMA_VERSION,
        outdatedCount,
        requiresUpgrade: outdatedCount > 0,
      },
      200,
      correlationId,
    );
  } catch (error) {
    console.error("[GET /api/admin/re-extract] error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Failed to check outdated opportunities count",
      undefined,
      correlationId,
    );
  }
}

/**
 * POST /api/admin/re-extract
 * Triggers batch re-extraction on outdated cached opportunities.
 */
export async function POST(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;

  try {
    let batchSize = 10;
    try {
      const body = await req.json().catch(() => ({}));
      if (typeof body.batchSize === "number" && body.batchSize > 0) {
        batchSize = Math.min(50, body.batchSize);
      }
    } catch {
      // default batchSize
    }

    const result = await reExtractOutdatedOpportunities({
      userId,
      workspaceId,
      batchSize,
    });

    return apiJson(
      {
        success: true,
        ...result,
      },
      200,
      correlationId,
    );
  } catch (error) {
    console.error("[POST /api/admin/re-extract] error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Failed to re-extract outdated opportunities",
      undefined,
      correlationId,
    );
  }
}
