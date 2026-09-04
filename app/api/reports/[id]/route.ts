/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  scraper,
  scraperRun,
  workspace,
  workspaceMember,
} from "@/lib/db/schema";
import { and, eq, desc, isNull } from "drizzle-orm";
import { z } from "zod";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext } from "@/lib/api-auth";
import {
  buildLatestTrendInsights,
  formatTrendChangePercent,
} from "@/lib/trend-detection";
import { toOpportunityScore, toValidationScore } from "@/lib/dashboard-metrics";
import {
  hasWillingnessToPaySignals,
  normalizeBudgetSignals,
  summarizeBudgetSignal,
  type BudgetSignal,
} from "@/lib/budget-signals";
import { getPlanEntitlements } from "@/lib/plan-gating";
import { resolveCurrentPlan, resolvePlanContext } from "@/lib/plan-resolver";
import { getTimeWindowLabel, normalizeTimeWindow } from "@/lib/time-window";
import { getModelForDepth, AI_MODEL_LABELS } from "@/lib/ai";
import type { MiningDepth } from "@/lib/mining-presets";
import { isDemoReportId, getDemoReport } from "@/lib/demo-data";

const reportParamsSchema = z.object({
  id: z.string().trim().min(1, "Invalid report id"),
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

type UserLanguageSection = {
  label: string;
  summary: string;
  examples: string[];
};

type UserLanguageReport = {
  overview: string;
  sections: UserLanguageSection[];
};

function cleanQuote(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function dedupeQuotes(quotes: string[], max = 4) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const quote of quotes) {
    const normalized = quote.toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(quote);
    if (result.length >= max) break;
  }
  return result;
}

function buildUserLanguageReport(
  point: Pick<DBPainPoint, "title" | "body" | "triedSolutions"> & {
    quotes: string[];
  },
): UserLanguageReport {
  const primary = cleanQuote(point.body || "");
  const rawQuotes = point.quotes.map((q) => cleanQuote(q)).filter(Boolean);

  const allQuotes = dedupeQuotes([primary, ...rawQuotes], 10);

  const problemKeywords =
    /(can't|cannot|struggl|frustrat|pain|hard|manual|annoy|hate|broken|stuck|time[- ]consuming|tedious)/i;
  const outcomeKeywords =
    /(need|want|wish|looking for|would pay|save time|faster|automate|easier|streamline|simpler)/i;
  const workaroundKeywords =
    /(tried|using|used|tool|workaround|alternative|not working|still|switch)/i;

  const problemExamples = dedupeQuotes(
    allQuotes.filter((q) => problemKeywords.test(q)),
    3,
  );
  const outcomeExamples = dedupeQuotes(
    allQuotes.filter((q) => outcomeKeywords.test(q)),
    3,
  );
  const workaroundExamples = dedupeQuotes(
    [
      ...allQuotes.filter((q) => workaroundKeywords.test(q)),
      ...(point.triedSolutions ?? []).map((s) => `Tried: ${s}`),
    ],
    3,
  );

  return {
    overview:
      problemExamples[0] ??
      outcomeExamples[0] ??
      primary ??
      "Users describe this issue as repeated workflow friction.",
    sections: [
      {
        label: "How Users Describe The Pain",
        summary:
          "Exact language users use when describing what is broken or frustrating.",
        examples:
          problemExamples.length > 0
            ? problemExamples
            : dedupeQuotes(allQuotes, 3),
      },
      {
        label: "Desired Outcome Language",
        summary: "Phrases showing what users actually want to happen.",
        examples:
          outcomeExamples.length > 0
            ? outcomeExamples
            : dedupeQuotes(allQuotes.slice(0, 3), 3),
      },
      {
        label: "Current Workarounds",
        summary: "Mentions of attempted tools, hacks, and failed alternatives.",
        examples:
          workaroundExamples.length > 0
            ? workaroundExamples
            : point.triedSolutions && point.triedSolutions.length > 0
              ? point.triedSolutions.slice(0, 3).map((s) => `Tried: ${s}`)
              : ["No clear workaround language captured yet."],
      },
    ],
  };
}

interface DBPainPoint {
  id: string;
  title: string;
  body: string;
  postUrl: string | null;
  score: number;
  urgency: number;
  monetizationScore: number;
  marketMaturity: number;
  subreddit: string;
  sentiment: string;
  mentionCount: number;
  commentCount: number;
  budget?: BudgetSignal[] | string | null;
  switchingCosts?: string;
  triedSolutions?: string[];
  difficulty?: string;
  painPointCluster?: {
    id: string;
    estimatedTamUsdAnnual: number | null;
    budgetSignalCount: number;
    competitorIntel?: any;
  } | null;
  painPointComments?: Array<{
    body: string;
    score: number;
  }>;
  painPointFeedback?: Array<{
    vote: number;
  }>;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, userEmail, workspaceId } = authContext.context;

  const parsedParams = reportParamsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid route parameters",
      parsedParams.error.flatten(),
      correlationId,
    );
  }
  const { id } = parsedParams.data;

  try {
    if (isDemoReportId(id)) {
      const demo = getDemoReport();
      return apiJson(
        {
          id: demo.id,
          title: demo.title,
          subreddits: demo.subreddits,
          createdAt: demo.createdAt,
          reportId: demo.id,
          saved: demo.saved,
          category: demo.category,
          customPatterns: [],
          miningDepth: demo.miningDepth,
          aiModel: "OpenAI GPT-4o",
          timeWindow: "90d",
          timeWindowLabel: "Last 90d",
          trend: null,
          metrics: [
            {
              label: "Pain Points",
              value: "2",
              sub: "Extracted by AI",
              icon: "AlertTriangle",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "Posts Analyzed",
              value: "142",
              sub: `Across ${demo.subreddits.length} subreddits`,
              icon: "MessageSquare",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              label: "Opportunity Score",
              value: "84/100",
              sub: "High Viability",
              icon: "Flame",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
          ],
          saasOpportunities: [],
          topPainPoints: demo.topPainPoints,
          isTeaser: false,
          isDemo: true,
        },
        200,
        correlationId,
      );
    }

    const planContext = await resolvePlanContext({
      userId,
      email: userEmail,
      requestHeaders: req.headers,
    });
    const isTeaser = planContext.planPurchaseRequired;
    const plan = await resolveCurrentPlan({
      userId,
      email: userEmail,
      requestHeaders: req.headers,
    });
    const entitlements = getPlanEntitlements(plan);

    let targetScraperId = id;
    let currentScraper = await db.query.scraper.findFirst({
      where: and(eq(scraper.id, targetScraperId), isNull(scraper.deletedAt)),
      with: {
        scraperRuns: {
          orderBy: [desc(scraperRun.startedAt)],
          limit: 1,
        },
        painPoints: {
          with: {
            painPointCluster: {
              columns: {
                id: true,
                estimatedTamUsdAnnual: true,
                budgetSignalCount: true,
                competitorIntel: true,
              },
            },
            painPointComments: {
              columns: {
                body: true,
                score: true,
              },
              orderBy: (comment, { desc }) => [desc(comment.score)],
              limit: 12,
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

    if (!currentScraper) {
      // Check if `id` was a scraperRun id
      const runRecord = await db.query.scraperRun.findFirst({
        where: eq(scraperRun.id, id),
        columns: { id: true, scraperId: true },
      });
      if (runRecord?.scraperId) {
        targetScraperId = runRecord.scraperId;
        currentScraper = await db.query.scraper.findFirst({
          where: and(
            eq(scraper.id, targetScraperId),
            isNull(scraper.deletedAt),
          ),
          with: {
            scraperRuns: {
              orderBy: [desc(scraperRun.startedAt)],
              limit: 1,
            },
            painPoints: {
              with: {
                painPointCluster: {
                  columns: {
                    id: true,
                    estimatedTamUsdAnnual: true,
                    budgetSignalCount: true,
                    competitorIntel: true,
                  },
                },
                painPointComments: {
                  columns: {
                    body: true,
                    score: true,
                  },
                  orderBy: (comment, { desc }) => [desc(comment.score)],
                  limit: 12,
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
      }
    }

    if (!currentScraper) {
      return apiError(
        404,
        "NOT_FOUND",
        "Report not found",
        undefined,
        correlationId,
      );
    }

    // Authorize: User must be report owner OR member/owner of the report's workspace
    let hasAccess = currentScraper.userId === userId;
    if (!hasAccess && currentScraper.workspaceId) {
      const member = await db.query.workspaceMember.findFirst({
        where: and(
          eq(workspaceMember.workspaceId, currentScraper.workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      });
      if (member) {
        hasAccess = true;
      } else {
        const ownedWorkspace = await db.query.workspace.findFirst({
          where: and(
            eq(workspace.id, currentScraper.workspaceId),
            eq(workspace.ownerId, userId),
          ),
        });
        if (ownedWorkspace) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return apiError(
        404,
        "NOT_FOUND",
        "Report not found",
        undefined,
        correlationId,
      );
    }

    const latestRun = currentScraper.scraperRuns?.[0];
    const currentKeyword = (currentScraper.keywords?.[0] || "")
      .trim()
      .toLowerCase();

    const painPoints = currentScraper.painPoints as unknown as DBPainPoint[];

    const trendHistoryRows = await db.query.scraper.findMany({
      where: and(eq(scraper.userId, userId), isNull(scraper.deletedAt)),
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
        .filter((row): row is { key: string; value: number; createdAt: Date } =>
          Boolean(row),
        ),
    ).find((trend) => trend.key === currentKeyword);

    const enrichedPainPoints = painPoints.map((point) => {
      const budgetSignals = normalizeBudgetSignals(point.budget);
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
        budgetSignals,
        hasWillingnessToPay: hasWillingnessToPaySignals(budgetSignals),
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

    const scoreLabel =
      opportunityScore >= 80
        ? "High Growth Potential"
        : opportunityScore >= 50
          ? "Solid Opportunity"
          : "Niche Requirement";
    const totalMentions = painPoints.reduce(
      (sum, point) => sum + Math.max(1, point.mentionCount || 0),
      0,
    );
    const saasOpportunities: SaaSOpportunity[] = painPoints
      .map((pp) => {
        const weightedScore = Math.round(
          ((pp.score || 0) * 0.35 +
            (pp.urgency || 0) * 0.25 +
            (pp.monetizationScore || 0) * 0.3 +
            (pp.marketMaturity || 0) * 0.1) *
            10,
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
    const scraperMiningDepth = (currentScraper.miningDepth ??
      "basic") as MiningDepth;
    const aiModelId = getModelForDepth(scraperMiningDepth);
    const response = {
      isTeaser,
      title: currentScraper.keywords?.[0] || "Unknown Investigation",
      date: new Date(currentScraper.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      reportId: currentScraper.id,
      saved: currentScraper.reportSaved ?? false,
      category: currentScraper.reportCategory || "Uncategorized",
      customPatterns: currentScraper.customPatterns || [],
      miningDepth: scraperMiningDepth,
      aiModel: AI_MODEL_LABELS[aiModelId] ?? aiModelId,
      timeWindow: normalizeTimeWindow(currentScraper.timeWindow),
      timeWindowLabel: getTimeWindowLabel(
        normalizeTimeWindow(currentScraper.timeWindow),
      ),
      trend: trendInsight
        ? entitlements.hasTrendDetection
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
          : null
        : null,
      metrics: [
        {
          label: "Pain Points",
          value: painPoints.length.toString(),
          sub: "Extracted by AI",
          icon: "AlertTriangle",
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        },
        {
          label: "Posts Analyzed",
          value: latestRun?.postsFetched?.toString() || "0",
          sub: `Across ${currentScraper.subreddits?.length || 0} subreddits`,
          icon: "MessageSquare",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        },
        {
          label: "Opportunity Score",
          value: `${opportunityScore}/100`,
          sub: scoreLabel,
          icon: "Star",
          color: "text-[#ff4500]",
          bg: "bg-[#ff4500]/10",
        },
        {
          label: "Mentions",
          value: totalMentions.toString(),
          sub: "Mention count insights",
          icon: "Users",
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        },
        {
          label: "Validation",
          value: `${validationScore}/100`,
          sub: "Upvotes + comments + mentions",
          icon: "BarChart3",
          color: "text-sky-500",
          bg: "bg-sky-500/10",
        },
      ],
      topPainPoints: enrichedPainPoints
        .sort(
          (a, b) =>
            toValidationScore(b) - toValidationScore(a) ||
            (b.urgency ?? 0) - (a.urgency ?? 0) ||
            (b.score ?? 0) - (a.score ?? 0),
        )
        .map((pp, idx) => {
          if (isTeaser && idx >= 2) {
            return {
              userLanguage: null,
              id: pp.id,
              title: `Unlock Frustration #${idx + 1}`,
              validationScore: 0,
              urgency: "Locked",
              intensity: 0,
              monetization: 0,
              maturity: 0,
              mentions: 0,
              description:
                "Upgrade to a paid plan to unlock full AI description, intensity/urgency breakdown, and Golden Quotes.",
              subreddits: pp.subreddit ? [pp.subreddit] : [],
              sentiment: "Neutral",
              budgetSignals: [],
              hasWillingnessToPay: false,
              budgetSignalSummary: "Locked",
              cluster: null,
              switchingCosts: "Locked",
              triedSolutions: [],
              difficulty: "side_project",
              communityVoices: [
                "Upgrade to a paid plan to unlock user comments and golden quotes.",
              ],
              language: [],
              postUrl: null,
              angles: [],
            };
          }
          return {
            userLanguage: buildUserLanguageReport({
              title: pp.title,
              body: pp.body,
              triedSolutions: pp.triedSolutions,
              quotes: (pp.painPointComments ?? []).map(
                (comment) => comment.body,
              ),
            }),
            id: pp.id,
            title: pp.title,
            validationScore: toValidationScore(pp),
            urgency:
              pp.urgency >= 8
                ? "Extreme Urgency"
                : pp.urgency >= 5
                  ? "High Urgency"
                  : "Medium/Low",
            intensity: pp.score,
            monetization: pp.monetizationScore,
            maturity: pp.marketMaturity,
            mentions: Math.max(1, pp.mentionCount || 0),
            description: pp.body,
            subreddits: [pp.subreddit],
            sentiment: pp.sentiment,
            budgetSignals: pp.budgetSignals,
            hasWillingnessToPay: pp.hasWillingnessToPay,
            budgetSignalSummary:
              pp.budgetSignals.length > 0
                ? summarizeBudgetSignal(pp.budgetSignals[0])
                : null,
            cluster: pp.painPointCluster
              ? {
                  id: pp.painPointCluster.id,
                  estimatedTamUsdAnnual:
                    pp.painPointCluster.estimatedTamUsdAnnual ?? null,
                  budgetSignalCount: pp.painPointCluster.budgetSignalCount ?? 0,
                  competitorIntel: isTeaser
                    ? []
                    : (pp.painPointCluster.competitorIntel ?? []),
                }
              : null,
            switchingCosts: pp.switchingCosts,
            triedSolutions: pp.triedSolutions || [],
            difficulty: pp.difficulty || "weekend_project",
            communityVoices:
              (pp.painPointComments ?? [])
                .map((comment) => cleanQuote(comment.body))
                .filter(Boolean)
                .slice(0, 3).length > 0
                ? (pp.painPointComments ?? [])
                    .map((comment) => cleanQuote(comment.body))
                    .filter(Boolean)
                    .slice(0, 3)
                : [pp.body],
            language: pp.triedSolutions || [],
            postUrl: pp.postUrl,
            angles: [
              "Solution for " + pp.title,
              "Cost-effective alternative to existing tools",
            ],
          };
        }),
      saasOpportunities: entitlements.hasSaasOpportunities
        ? saasOpportunities
        : [],
    };

    return apiJson(response, 200, correlationId);
  } catch (error) {
    console.error("Report Detail API Error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, userEmail, workspaceId } = authContext.context;

  const parsedParams = reportParamsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid route parameters",
      parsedParams.error.flatten(),
      correlationId,
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
      correlationId,
    );
  }

  const { id } = parsedParams.data;
  const { saved, category } = parsedBody.data;

  try {
    const plan = await resolveCurrentPlan({
      userId,
      email: userEmail,
      requestHeaders: req.headers,
    });
    const entitlements = getPlanEntitlements(plan);

    if (saved && !entitlements.canSaveReports) {
      return apiError(
        403,
        "PLAN_UPGRADE_REQUIRED",
        `Saving reports is available on Growth and Pro plans. Current plan: ${plan}.`,
        {
          plan,
          canSaveReports: entitlements.canSaveReports,
        },
        correlationId,
      );
    }

    let targetScraperId = id;
    let existingScraper = await db.query.scraper.findFirst({
      where: and(eq(scraper.id, targetScraperId), isNull(scraper.deletedAt)),
    });

    if (!existingScraper) {
      const runRecord = await db.query.scraperRun.findFirst({
        where: eq(scraperRun.id, id),
        columns: { id: true, scraperId: true },
      });
      if (runRecord?.scraperId) {
        targetScraperId = runRecord.scraperId;
        existingScraper = await db.query.scraper.findFirst({
          where: and(
            eq(scraper.id, targetScraperId),
            isNull(scraper.deletedAt),
          ),
        });
      }
    }

    if (!existingScraper) {
      return apiError(
        404,
        "NOT_FOUND",
        "Report not found",
        undefined,
        correlationId,
      );
    }

    let hasAccess = existingScraper.userId === userId;
    if (!hasAccess && existingScraper.workspaceId) {
      const member = await db.query.workspaceMember.findFirst({
        where: and(
          eq(workspaceMember.workspaceId, existingScraper.workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      });
      if (member) {
        hasAccess = true;
      } else {
        const ownedWorkspace = await db.query.workspace.findFirst({
          where: and(
            eq(workspace.id, existingScraper.workspaceId),
            eq(workspace.ownerId, userId),
          ),
        });
        if (ownedWorkspace) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return apiError(
        404,
        "NOT_FOUND",
        "Report not found",
        undefined,
        correlationId,
      );
    }

    const updated = await db
      .update(scraper)
      .set({
        reportSaved: saved,
        reportSavedAt: saved ? new Date() : null,
        reportCategory: category ?? "Uncategorized",
        updatedAt: new Date(),
      })
      .where(eq(scraper.id, targetScraperId))
      .returning({
        id: scraper.id,
        reportSaved: scraper.reportSaved,
        reportSavedAt: scraper.reportSavedAt,
        reportCategory: scraper.reportCategory,
      });

    if (updated.length === 0) {
      return apiError(
        404,
        "NOT_FOUND",
        "Report not found",
        undefined,
        correlationId,
      );
    }

    return apiJson(updated[0], 200, correlationId);
  } catch (error) {
    console.error("Report update API Error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}
