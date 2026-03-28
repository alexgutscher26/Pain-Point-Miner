/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "@/lib/db";
import { scraper, scraperRun } from "@/lib/db/schema";
import { and, eq, desc, gte } from "drizzle-orm";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext, workspaceScope } from "@/lib/api-auth";
import { normalizeRunStatus } from "@/lib/run-status";
import {
  buildLatestTrendInsights,
  formatTrendChangePercent,
} from "@/lib/trend-detection";
import { toOpportunityScore, toValidationScore } from "@/lib/dashboard-metrics";
import { getPlanEntitlements } from "@/lib/plan-gating";
import { resolveCurrentPlan } from "@/lib/plan-resolver";

export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, userEmail, workspaceId } = authContext.context;
  const { searchParams } = new URL(req.url);

  const days = searchParams.get("days");
  const statusParam = searchParams.get("status");
  const savedOnly = searchParams.get("savedOnly") === "true";
  const categoryParam = searchParams.get("category");
  const minScore = parseInt(searchParams.get("minScore") || "0");

  try {
    const plan = await resolveCurrentPlan({
      userId,
      email: userEmail,
      requestHeaders: req.headers,
    });
    const entitlements = getPlanEntitlements(plan);

    let whereClause = and(
      eq(scraper.userId, userId),
      workspaceScope(scraper.workspaceId, workspaceId),
    );

    if (days && days !== "all") {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      whereClause = and(whereClause, gte(scraper.createdAt, date));
    }

    // Get all scrapers for the user
    const reportsRes = await db.query.scraper.findMany({
      where: whereClause,
      orderBy: [desc(scraper.createdAt)],
      with: {
        scraperRuns: {
          orderBy: [desc(scraperRun.startedAt)],
          limit: 1,
        },
        painPoints: {
          columns: {
            id: true,
            score: true,
            urgency: true,
            monetizationScore: true,
            marketMaturity: true,
            sentiment: true,
            commentCount: true,
            mentionCount: true,
          },
          with: {
            painPointComments: {
              columns: {
                score: true,
              },
              orderBy: (comment, { desc }) => [desc(comment.score)],
              limit: 5,
            },
            painPointFeedback: {
              columns: {
                vote: true,
              },
            },
          },
        },
      },
    });

    const trendHistoryRows = await db.query.scraper.findMany({
      where: and(
        eq(scraper.userId, userId),
        workspaceScope(scraper.workspaceId, workspaceId),
      ),
      orderBy: [desc(scraper.createdAt)],
      with: {
        painPoints: {
          columns: { id: true },
        },
      },
    });

    const trendInsights = buildLatestTrendInsights(
      trendHistoryRows
        .map((row) => {
          const keyword = row.keywords?.[0]?.trim().toLowerCase();
          if (!keyword) return null;
          return {
            key: keyword,
            value: row.painPoints.length,
            createdAt: row.createdAt,
          };
        })
        .filter((row): row is { key: string; value: number; createdAt: Date } =>
          Boolean(row),
        ),
    );
    const trendByKeyword = new Map(
      trendInsights.map((trend) => [trend.key, trend]),
    );

    let formattedReports = (reportsRes as any[]).map((r) => {
      const latestRun = r.scraperRuns?.[0];
      const pps = (r.painPoints || []) as Array<{
        score: number;
        urgency: number;
        monetizationScore: number;
        marketMaturity: number;
        sentiment: string | null;
        commentCount: number;
        mentionCount: number;
        painPointComments?: Array<{ score: number }>;
        painPointFeedback?: Array<{ vote: number }>;
      }>;
      const keywordKey = (r.keywords?.[0] || "").trim().toLowerCase();
      const trend = keywordKey ? trendByKeyword.get(keywordKey) : undefined;
      const enrichedPainPoints = pps.map((point) => {
        const topCommentScores = (point.painPointComments ?? [])
          .map((comment) => comment.score ?? 0)
          .slice(0, 3);
        const upvoteSignal =
          topCommentScores.length > 0
            ? Math.round(
                topCommentScores.reduce(
                  (sum, score) => sum + Math.max(0, score),
                  0,
                ) / topCommentScores.length,
              )
            : 0;
        const userUpvotes = (point.painPointFeedback ?? []).filter(
          (v) => v.vote === 1,
        ).length;
        const userDownvotes = (point.painPointFeedback ?? []).filter(
          (v) => v.vote === -1,
        ).length;

        return {
          ...point,
          upvoteSignal,
          userUpvotes,
          userDownvotes,
        };
      });

      const opportunityScore = toOpportunityScore(enrichedPainPoints);
      const validationScore =
        enrichedPainPoints.length > 0
          ? Math.round(
              enrichedPainPoints.reduce(
                (sum, point) => sum + toValidationScore(point),
                0,
              ) / enrichedPainPoints.length,
            )
          : 0;

      return {
        id: r.id,
        niche: r.keywords?.[0] || "Unknown Investigation",
        date: new Date(r.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        painPoints: pps.length,
        score: opportunityScore,
        validationScore,
        saved: r.reportSaved ?? false,
        category: r.reportCategory || "Uncategorized",
        savedAt: r.reportSavedAt
          ? new Date(r.reportSavedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null,
        trend: trend
          ? entitlements.hasTrendDetection
            ? {
                direction: trend.direction,
                delta: trend.delta,
                percentChange: Math.round(trend.percentChange),
                label:
                  trend.direction === "new"
                    ? "New signal"
                    : trend.direction === "up"
                      ? `${formatTrendChangePercent(trend.percentChange)} momentum`
                      : trend.direction === "down"
                        ? `${formatTrendChangePercent(trend.percentChange)} cooling`
                        : "Stable trend",
              }
            : null
          : null,
        status: (() => {
          const normalized = normalizeRunStatus(latestRun?.status);
          if (normalized === "completed") return "Completed";
          if (normalized === "failed" || normalized === "canceled")
            return "Failed";
          return "In Progress";
        })(),
      };
    });

    formattedReports = formattedReports.sort(
      (a, b) =>
        b.score - a.score ||
        b.validationScore - a.validationScore ||
        b.painPoints - a.painPoints,
    );

    // Apply status filter
    if (statusParam && statusParam !== "all") {
      formattedReports = formattedReports.filter((r) =>
        statusParam === "completed"
          ? r.status === "Completed"
          : r.status === "In Progress",
      );
    }

    // Apply score filter
    if (minScore > 0) {
      formattedReports = formattedReports.filter((r) => r.score >= minScore);
    }
    if (savedOnly) {
      formattedReports = formattedReports.filter((r) => r.saved);
    }
    if (categoryParam && categoryParam !== "all") {
      formattedReports = formattedReports.filter(
        (r) => r.category.toLowerCase() === categoryParam.toLowerCase(),
      );
    }

    return apiJson(formattedReports, 200, correlationId);
  } catch (error) {
    console.error("Reports API Error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}
