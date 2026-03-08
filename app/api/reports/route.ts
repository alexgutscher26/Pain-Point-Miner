/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "@/lib/db";
import { scraper, scraperRun } from "@/lib/db/schema";
import { and, eq, desc, gte } from "drizzle-orm";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext, workspaceScope } from "@/lib/api-auth";
import { normalizeRunStatus } from "@/lib/run-status";
import { buildLatestTrendInsights, formatTrendChangePercent } from "@/lib/trend-detection";

export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;
  const { searchParams } = new URL(req.url);
  
  const days = searchParams.get("days");
  const statusParam = searchParams.get("status");
  const savedOnly = searchParams.get("savedOnly") === "true";
  const categoryParam = searchParams.get("category");
  const minScore = parseInt(searchParams.get("minScore") || "0");

  try {
    let whereClause = and(
      eq(scraper.userId, userId),
      workspaceScope(scraper.workspaceId, workspaceId)
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
                sentiment: true
            }
        }
      }
    });

    const trendHistoryRows = await db.query.scraper.findMany({
      where: and(
        eq(scraper.userId, userId),
        workspaceScope(scraper.workspaceId, workspaceId)
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
        .filter((row): row is { key: string; value: number; createdAt: Date } => Boolean(row))
    );
    const trendByKeyword = new Map(trendInsights.map((trend) => [trend.key, trend]));

    let formattedReports = (reportsRes as any[]).map(r => {
      const latestRun = r.scraperRuns?.[0];
      const pps = (r.painPoints || []) as { score: number, urgency: number, monetizationScore: number, marketMaturity: number, sentiment: string | null }[];
      const keywordKey = (r.keywords?.[0] || "").trim().toLowerCase();
      const trend = keywordKey ? trendByKeyword.get(keywordKey) : undefined;
      
      // Calculate VERY SMART Opportunity Score (Weighted Multi-Factor)
      let opportunityScore = 0;
      if (pps.length > 0) {
          const factors = pps.map(p => {
              const pain = (p.score || 0) * 0.35;
              const urgency = (p.urgency || 0) * 0.25;
              const monetization = (p.monetizationScore || 0) * 0.30;
              
              let maturityBonus = 0;
              if ((p.marketMaturity || 0) <= 3) maturityBonus = 10;
              else if ((p.marketMaturity || 0) >= 8) maturityBonus = 8;
              else maturityBonus = 4;
              
              const sentimentMap: Record<string, number> = { 'desperate': 1.1, 'frustrated': 1.05, 'angry': 1.15, 'neutral': 1.0, 'curious': 0.95 };
              const modifier = sentimentMap[p.sentiment || ''] || 1.0;
              
              return ((pain + urgency + monetization) * 10 + maturityBonus) * modifier;
          });

          opportunityScore = Math.round(factors.reduce((a, b) => a + b, 0) / factors.length);
          opportunityScore = Math.min(Math.max(opportunityScore, 0), 100);
      }

      return {
        id: r.id,
        niche: r.keywords?.[0] || "Unknown Investigation",
        date: new Date(r.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        painPoints: pps.length,
        score: opportunityScore,
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
          : null,
        status: (() => {
          const normalized = normalizeRunStatus(latestRun?.status);
          if (normalized === "completed") return "Completed";
          if (normalized === "failed" || normalized === "canceled") return "Failed";
          return "In Progress";
        })()
      };
    });

    // Apply status filter
    if (statusParam && statusParam !== "all") {
        formattedReports = formattedReports.filter(r => 
            statusParam === "completed" ? r.status === "Completed" : r.status === "In Progress"
        );
    }

    // Apply score filter
    if (minScore > 0) {
        formattedReports = formattedReports.filter(r => r.score >= minScore);
    }
    if (savedOnly) {
      formattedReports = formattedReports.filter((r) => r.saved);
    }
    if (categoryParam && categoryParam !== "all") {
      formattedReports = formattedReports.filter(
        (r) => r.category.toLowerCase() === categoryParam.toLowerCase()
      );
    }

    return apiJson(formattedReports, 200, correlationId);
  } catch (error) {
    console.error("Reports API Error:", error);
    return apiError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", undefined, correlationId);
  }
}
