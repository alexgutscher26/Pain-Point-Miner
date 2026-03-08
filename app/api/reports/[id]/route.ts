
import { db } from "@/lib/db";
import { scraper, scraperRun } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext, workspaceScope } from "@/lib/api-auth";
import { buildLatestTrendInsights, formatTrendChangePercent } from "@/lib/trend-detection";

const reportParamsSchema = z.object({
  id: z.string().uuid("Invalid report id"),
});
const updateReportSchema = z.object({
  saved: z.boolean(),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category must be 50 characters or less")
    .optional(),
});

interface SaaSOpportunity {
  title: string;
  problemStatement: string;
  targetCustomer: string;
  valueProposition: string;
  launchAngle: string;
  score: number;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;

  const parsedParams = reportParamsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid route parameters",
      parsedParams.error.flatten(),
      correlationId
    );
  }
  const { id } = parsedParams.data;

  try {
    const currentScraper = await db.query.scraper.findFirst({
      where: and(
        eq(scraper.id, id),
        eq(scraper.userId, userId),
        workspaceScope(scraper.workspaceId, workspaceId)
      ),
      with: {
        scraperRuns: {
          orderBy: [desc(scraperRun.startedAt)],
          limit: 1,
        },
        painPoints: true,
      }
    });

    if (!currentScraper) {
      return apiError(404, "NOT_FOUND", "Report not found", undefined, correlationId);
    }

    const latestRun = currentScraper.scraperRuns?.[0];
    const currentKeyword = (currentScraper.keywords?.[0] || "").trim().toLowerCase();

    interface DBPainPoint {
      id: string;
      title: string;
      body: string;
      score: number; // painIntensity
      urgency: number;
      monetizationScore: number;
      marketMaturity: number;
      subreddit: string;
      sentiment: string;
      mentionCount: number;
      commentCount: number;
      budget?: string;
      switchingCosts?: string;
      triedSolutions?: string[];
    }

    const painPoints = currentScraper.painPoints as unknown as DBPainPoint[];

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

    const trendInsight = buildLatestTrendInsights(
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
    ).find((trend) => trend.key === currentKeyword);
    
    // Calculate VERY SMART Opportunity Score (Weighted Multi-Factor)
    let opportunityScore = 0;
    if (painPoints.length > 0) {
        const factors = painPoints.map(p => {
          const pain = (p.score || 0) * 0.35;
          const urgency = (p.urgency || 0) * 0.25;
          const monetization = (p.monetizationScore || 0) * 0.30;
          
          let maturityBonus = 0;
          if ((p.marketMaturity || 0) <= 3) maturityBonus = 10;
          else if ((p.marketMaturity || 0) >= 8) maturityBonus = 8;
          else maturityBonus = 4;
          
          const sentimentMap: Record<string, number> = { 'desperate': 1.1, 'frustrated': 1.05, 'angry': 1.15, 'neutral': 1.0, 'curious': 0.95 };
          const modifier = sentimentMap[p.sentiment] || 1.0;
          
          return ((pain + urgency + monetization) * 10 + maturityBonus) * modifier;
        });

        opportunityScore = Math.round(factors.reduce((a, b) => a + b, 0) / factors.length);
        opportunityScore = Math.min(Math.max(opportunityScore, 0), 100);
    }

    const scoreLabel = opportunityScore >= 80 ? "High Growth Potential" : opportunityScore >= 50 ? "Solid Opportunity" : "Niche Requirement";
    const totalMentions = painPoints.reduce(
      (sum, point) => sum + Math.max(1, point.mentionCount || 0),
      0
    );
    const saasOpportunities: SaaSOpportunity[] = painPoints
      .map((pp) => {
        const weightedScore = Math.round(
          ((pp.score || 0) * 0.35 +
            (pp.urgency || 0) * 0.25 +
            (pp.monetizationScore || 0) * 0.3 +
            (pp.marketMaturity || 0) * 0.1) * 10
        );

        const stageLabel =
          (pp.marketMaturity || 0) <= 3
            ? "Blue-ocean niche"
            : (pp.marketMaturity || 0) >= 8
              ? "Disrupt existing incumbents"
              : "Focused category entrant";

        return {
          title: `${pp.title} Copilot`,
          problemStatement: pp.body,
          targetCustomer: `Users active in r/${pp.subreddit} reporting ${pp.sentiment} workflow friction`,
          valueProposition: `Reduce manual effort around "${pp.title}" with an automation-first workflow and measurable time savings`,
          launchAngle: `${stageLabel} with urgency ${pp.urgency || 0}/10 and monetization signal ${pp.monetizationScore || 0}/10`,
          score: Math.min(Math.max(weightedScore, 0), 100),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Format the response to match what the frontend expects
    const response = {
      title: currentScraper.keywords?.[0] || "Unknown Investigation",
      date: new Date(currentScraper.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
      }),
      reportId: currentScraper.id,
      saved: currentScraper.reportSaved ?? false,
      category: currentScraper.reportCategory || "Uncategorized",
      customPatterns: currentScraper.customPatterns || [],
      trend: trendInsight
        ? {
            direction: trendInsight.direction,
            delta: trendInsight.delta,
            percentChange: Math.round(trendInsight.percentChange),
            previous: trendInsight.previous,
            current: trendInsight.current,
            label:
              trendInsight.direction === "new"
                ? "New demand signal"
                : trendInsight.direction === "up"
                  ? `${formatTrendChangePercent(trendInsight.percentChange)} vs previous run`
                  : trendInsight.direction === "down"
                    ? `${formatTrendChangePercent(trendInsight.percentChange)} vs previous run`
                    : "No major change vs previous run",
          }
        : null,
      metrics: [
        { 
            label: "Pain Points", 
            value: (painPoints.length).toString(), 
            sub: "Extracted by AI", 
            icon: "AlertTriangle", 
            color: "text-blue-500", 
            bg: "bg-blue-500/10" 
        },
        { 
            label: "Posts Analyzed", 
            value: latestRun?.postsFetched?.toString() || "0", 
            sub: `Across ${currentScraper.subreddits?.length || 0} subreddits`, 
            icon: "MessageSquare", 
            color: "text-purple-500", 
            bg: "bg-purple-500/10" 
        },
        { 
            label: "Opportunity Score", 
            value: `${opportunityScore}/100`, 
            sub: scoreLabel, 
            icon: "Star", 
            color: "text-[#ff4500]", 
            bg: "bg-[#ff4500]/10" 
        },
        { 
            label: "Mentions", 
            value: totalMentions.toString(), 
            sub: "Mention count insights", 
            icon: "Users",
            color: "text-emerald-500", 
            bg: "bg-emerald-500/10" 
        },
      ],
      topPainPoints: painPoints.map((pp) => ({
        id: pp.id,
        title: pp.title,
        urgency: pp.urgency >= 8 ? "Extreme Urgency" : pp.urgency >= 5 ? "High Urgency" : "Medium/Low",
        intensity: pp.score,
        monetization: pp.monetizationScore,
        maturity: pp.marketMaturity,
        mentions: Math.max(1, pp.mentionCount || 0),
        description: pp.body,
        subreddits: [pp.subreddit],
        sentiment: pp.sentiment,
        budget: pp.budget,
        switchingCosts: pp.switchingCosts,
        triedSolutions: pp.triedSolutions || [],
        communityVoices: [pp.body], 
        language: pp.triedSolutions || [],
        angles: [
            "Solution for " + pp.title,
            "Cost-effective alternative to existing tools"
        ]
      })),
      saasOpportunities,
    };

    return apiJson(response, 200, correlationId);
  } catch (error) {
    console.error("Report Detail API Error:", error);
    return apiError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", undefined, correlationId);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;

  const parsedParams = reportParamsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid route parameters",
      parsedParams.error.flatten(),
      correlationId
    );
  }
  const body = await req.json().catch(() => null);
  const parsedBody = updateReportSchema.safeParse(body);
  if (!parsedBody.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid request body",
      parsedBody.error.flatten(),
      correlationId
    );
  }

  const { id } = parsedParams.data;
  const { saved, category } = parsedBody.data;

  try {
    const updated = await db
      .update(scraper)
      .set({
        reportSaved: saved,
        reportSavedAt: saved ? new Date() : null,
        reportCategory: category ?? "Uncategorized",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(scraper.id, id),
          eq(scraper.userId, userId),
          workspaceScope(scraper.workspaceId, workspaceId)
        )
      )
      .returning({
        id: scraper.id,
        reportSaved: scraper.reportSaved,
        reportSavedAt: scraper.reportSavedAt,
        reportCategory: scraper.reportCategory,
      });

    if (updated.length === 0) {
      return apiError(404, "NOT_FOUND", "Report not found", undefined, correlationId);
    }

    return apiJson(updated[0], 200, correlationId);
  } catch (error) {
    console.error("Report update API Error:", error);
    return apiError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", undefined, correlationId);
  }
}
