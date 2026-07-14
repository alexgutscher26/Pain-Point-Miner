/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "@/lib/db";
import {
  dashboardOpportunityMv,
  painPointComment,
  painPointFeedback,
} from "@/lib/db/schema";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
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

    let mvFilter = and(
      eq(dashboardOpportunityMv.userId, userId),
      workspaceScope(dashboardOpportunityMv.workspaceId, workspaceId),
    );

    if (days && days !== "all") {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      mvFilter = and(mvFilter, gte(dashboardOpportunityMv.createdAt, date));
    }

    // Query materialized view (avoids joins across scraper + scraper_run + pain_point)
    const mvRows = await db
      .select()
      .from(dashboardOpportunityMv)
      .where(mvFilter)
      .orderBy(desc(dashboardOpportunityMv.createdAt));

    // Batch fetch feedback votes for all pain points across all scrapers
    const allPainPointIds = mvRows.flatMap(
      (r) => (r.painPoints as Array<{ id: string }> | null)?.map((pp) => pp.id) ?? [],
    );
    const feedbackRows = allPainPointIds.length > 0
      ? await db
          .select()
          .from(painPointFeedback)
          .where(inArray(painPointFeedback.painPointId, allPainPointIds))
      : [];
    const feedbackByPainPointId = new Map<string, Array<{ vote: number }>>();
    for (const fb of feedbackRows) {
      const arr = feedbackByPainPointId.get(fb.painPointId) ?? [];
      arr.push({ vote: fb.vote });
      feedbackByPainPointId.set(fb.painPointId, arr);
    }

    // Batch fetch top comment scores for all pain points
    const commentRows = allPainPointIds.length > 0
      ? await db
          .select()
          .from(painPointComment)
          .where(inArray(painPointComment.painPointId, allPainPointIds))
          .orderBy(desc(painPointComment.score))
      : [];
    const commentsByPainPointId = new Map<string, Array<{ score: number }>>();
    for (const c of commentRows) {
      const arr = commentsByPainPointId.get(c.painPointId) ?? [];
      if (arr.length < 5) {
        arr.push({ score: c.score });
        commentsByPainPointId.set(c.painPointId, arr);
      }
    }

    // Trend history: use MV for pain point count per scraper
    const trendHistoryRows = await db
      .select({
        keywords: dashboardOpportunityMv.keywords,
        painPointCount: dashboardOpportunityMv.painPointCount,
        createdAt: dashboardOpportunityMv.createdAt,
      })
      .from(dashboardOpportunityMv)
      .where(and(
        eq(dashboardOpportunityMv.userId, userId),
        workspaceScope(dashboardOpportunityMv.workspaceId, workspaceId),
      ))
      .orderBy(desc(dashboardOpportunityMv.createdAt));

    const trendInsights = buildLatestTrendInsights(
      trendHistoryRows
        .map((row) => {
          const keyword = row.keywords?.[0]?.trim().toLowerCase();
          if (!keyword) return null;
          return {
            key: keyword,
            value: row.painPointCount,
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

    let formattedReports = (mvRows as any[]).map((r) => {
      const pps: Array<{
        id: string;
        score: number;
        urgency: number;
        monetizationScore: number;
        marketMaturity: number;
        sentiment: string | null;
        commentCount: number;
        mentionCount: number;
      }> = (r.painPoints as any[]) || [];
      const keywordKey = (r.keywords?.[0] || "").trim().toLowerCase();
      const trend = keywordKey ? trendByKeyword.get(keywordKey) : undefined;
      const enrichedPainPoints = pps.map((point: any) => {
        const pointComments = commentsByPainPointId.get(point.id) ?? [];
        const pointFeedback = feedbackByPainPointId.get(point.id) ?? [];
        const topCommentScores = pointComments
          .map((c) => c.score ?? 0)
          .slice(0, 3);
        const upvoteSignal =
          topCommentScores.length > 0
            ? Math.round(
                topCommentScores.reduce(
                  (sum, s) => sum + Math.max(0, s),
                  0,
                ) / topCommentScores.length,
              )
            : 0;
        const userUpvotes = pointFeedback.filter(
          (v) => v.vote === 1,
        ).length;
        const userDownvotes = pointFeedback.filter(
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
        id: r.scraperId,
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
          const normalized = normalizeRunStatus(r.latestRunStatus);
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
