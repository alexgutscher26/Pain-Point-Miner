import { getServerSession } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  painPointFeedback,
  scraper,
  scraperRun,
  userPreferences,
} from "@/lib/db/schema";
import { and, desc, eq, gte, inArray, isNull } from "drizzle-orm";
import { Search, BarChart3, AlertCircle, Zap } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { normalizeRunStatus } from "@/lib/run-status";
import {
  getMarketBadge,
  toOpportunityScore,
  DEFAULT_WEIGHTS,
  ScoringWeights,
} from "@/lib/dashboard-metrics";
import { buildLatestTrendInsights } from "@/lib/trend-detection";
import { DashboardSearchHero } from "@/components/dashboard/dashboard-search-hero";
import { getMonthlyScanUsage, getMonthlyUsageSummary } from "@/lib/plan-gating";
import { resolvePlanContext } from "@/lib/plan-resolver";
import { buildCommunityMapNodes } from "@/lib/community-map";
import { unstable_cache } from "next/cache";
import dynamicLoader from "next/dynamic";
import { EmptyState } from "@/components/dashboard/empty-state";
import { workspaceScope } from "@/lib/api-auth";
import { MetricCard } from "@/components/dashboard/dashboard-metric-card";
import { ReportRow } from "@/components/dashboard/dashboard-report-row";
import { DashboardMarketPulse } from "@/components/dashboard/dashboard-market-pulse";
import { DashboardTopOpportunities } from "@/components/dashboard/dashboard-top-opportunities";
import { DashboardActivityHeatmap } from "@/components/dashboard/dashboard-activity-heatmap";
import { DashboardClusterGrowth } from "@/components/dashboard/dashboard-cluster-growth";
import { DashboardMarketRadar } from "@/components/dashboard/dashboard-market-radar";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardTimeRangeSelector } from "@/components/dashboard/dashboard-time-range-selector";
import {
  DashboardGrid,
  DashboardCardId,
} from "@/components/dashboard/dashboard-grid";
import {
  getTopOpportunities,
  calculateActivityHeatmap,
  calculateClusterGrowth,
  calculateMarketRadarPoints,
} from "@/lib/dashboard-analytics";
import { painPointCluster } from "@/lib/db/schema";

const LazyCommunityMapPanel = dynamicLoader(
  () =>
    import("@/components/dashboard/community-map-panel").then(
      (mod) => mod.CommunityMapPanel,
    ),
  {
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-black/[0.06] bg-white/60 text-sm text-zinc-400">
        Loading community map...
      </div>
    ),
  },
);

const getCachedDashboardData = unstable_cache(
  async (userId: string, workspaceId: string | null, windowDateMs: number) => {
    const conditions = [
      eq(scraper.userId, userId),
      workspaceScope(scraper.workspaceId, workspaceId),
      isNull(scraper.deletedAt),
    ];
    if (windowDateMs > 0) {
      conditions.push(gte(scraper.createdAt, new Date(windowDateMs)));
    }

    const scraperRows = await db.query.scraper.findMany({
      where: and(...conditions),
      orderBy: [desc(scraper.createdAt)],
      with: {
        scraperRuns: {
          orderBy: [desc(scraperRun.startedAt)],
          limit: 1,
        },
        painPoints: true,
      },
    });

    const allPainPointIds = scraperRows.flatMap(
      (r) => r.painPoints?.map((pp) => pp.id) ?? [],
    );
    const feedbackRows =
      allPainPointIds.length > 0
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

    return scraperRows.map((r) => ({
      id: r.id,
      keywords: r.keywords,
      createdAt: r.createdAt,
      reportSaved: r.reportSaved,
      scraperRuns: r.scraperRuns,
      painPoints: (r.painPoints || []).map((pp) => ({
        ...pp,
        painPointFeedback: feedbackByPainPointId.get(pp.id) ?? [],
      })),
    }));
  },
  ["dashboard-metrics-cache"],
  { revalidate: 10, tags: ["dashboard"] },
);

const workspaceHeaderSchema = z.string().uuid().nullable();
const dashboardWindowSchema = z
  .enum(["24h", "realtime", "7d", "30d", "90d", "1y", "all"])
  .default("30d");

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const resolvedSearchParams = (await searchParams) ?? {};
  const session = await getServerSession(requestHeaders);

  if (!session) {
    redirect("/sign-in");
  }

  const userFirstName = session.user.name?.split(" ")[0] || "Founder";
  const planContext = await resolvePlanContext({
    userId: session.user.id,
    email: session.user.email,
    requestHeaders,
  });
  const plan = planContext.plan;
  const usageSummary = getMonthlyUsageSummary(
    plan,
    await getMonthlyScanUsage(session.user.id),
  );
  const searchesRemainingLabel = planContext.planPurchaseRequired
    ? "Read Only"
    : usageSummary.monthlyScansLimit === null
      ? "Unlimited"
      : `${usageSummary.monthlyScansUsed}/${usageSummary.monthlyScansLimit}`;
  const searchesProgress =
    planContext.planPurchaseRequired || usageSummary.monthlyScansLimit === null
      ? 0
      : Math.min(
          100,
          Math.round(
            (usageSummary.monthlyScansUsed / usageSummary.monthlyScansLimit) *
              100,
          ),
        );
  const searchesSubtext = planContext.planPurchaseRequired
    ? "Past results stay available. New scans require a paid plan"
    : usageSummary.monthlyScansLimit === null
      ? "No monthly cap on Pro"
      : `${usageSummary.monthlyScansRemaining ?? 0} scans remaining this month`;
  const parsedWorkspaceId = workspaceHeaderSchema.safeParse(
    requestHeaders.get("x-workspace-id"),
  );
  const workspaceId = parsedWorkspaceId.success ? parsedWorkspaceId.data : null;
  const parsedWindow = dashboardWindowSchema.safeParse(
    typeof resolvedSearchParams.window === "string"
      ? resolvedSearchParams.window
      : undefined,
  );
  const selectedWindow = parsedWindow.success ? parsedWindow.data : "30d";

  let stableWindowDateMs = 0;
  let selectedWindowLabel = "all time";

  if (selectedWindow === "24h" || selectedWindow === "realtime") {
    const d = new Date();
    d.setHours(d.getHours() - 24);
    stableWindowDateMs = Math.floor(d.getTime() / 30000) * 30000;
    selectedWindowLabel = "the last 24 hours";
  } else if (selectedWindow === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    stableWindowDateMs = Math.floor(d.getTime() / 30000) * 30000;
    selectedWindowLabel = "the past 7 days";
  } else if (selectedWindow === "30d") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    stableWindowDateMs = Math.floor(d.getTime() / 30000) * 30000;
    selectedWindowLabel = "the past 30 days";
  } else if (selectedWindow === "90d") {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    stableWindowDateMs = Math.floor(d.getTime() / 30000) * 30000;
    selectedWindowLabel = "the past 90 days";
  } else if (selectedWindow === "1y") {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    stableWindowDateMs = Math.floor(d.getTime() / 30000) * 30000;
    selectedWindowLabel = "the past year";
  } else {
    // "all"
    stableWindowDateMs = 0;
    selectedWindowLabel = "all time";
  }

  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
    columns: { scoringWeights: true, dashboardLayout: true },
  });
  const scoringWeights =
    (preferences?.scoringWeights as ScoringWeights) || DEFAULT_WEIGHTS;

  const userClusters = await db.query.painPointCluster.findMany({
    where: eq(painPointCluster.userId, session.user.id),
    columns: {
      id: true,
      canonicalTitle: true,
      sourceCount: true,
      createdAt: true,
    },
  });

  const layoutData = preferences?.dashboardLayout as
    | Record<string, unknown>
    | undefined;
  const initialCardOrder = Array.isArray(layoutData?.cardOrder)
    ? (layoutData.cardOrder as DashboardCardId[])
    : undefined;

  const reports = (
    await getCachedDashboardData(
      session.user.id,
      workspaceId,
      stableWindowDateMs,
    )
  ).map((report) => ({
    ...report,
    painPoints: report.painPoints.map((point) => {
      const userUpvotes = (point.painPointFeedback ?? []).filter(
        (v: { vote: number }) => v.vote === 1,
      ).length;
      const userDownvotes = (point.painPointFeedback ?? []).filter(
        (v: { vote: number }) => v.vote === -1,
      ).length;
      return {
        ...point,
        userUpvotes,
        userDownvotes,
      };
    }),
  }));

  const painPointsFound = reports.reduce(
    (sum, report) => sum + report.painPoints.length,
    0,
  );
  const allPainPoints = reports.flatMap((report) => report.painPoints);
  const allPainPointsWithReport = reports.flatMap((report) =>
    report.painPoints.map((point) => ({
      ...point,
      reportId: report.id,
      reportKeyword: report.keywords?.[0] || "General Investigation",
    })),
  );

  const topOpportunities = getTopOpportunities(
    allPainPointsWithReport,
    scoringWeights,
    5,
  );

  const allActivities: Array<{
    createdAt: Date | string;
    type?: "painPoint" | "scan";
  }> = [
    ...allPainPointsWithReport.map((p) => ({
      createdAt: p.createdAt,
      type: "painPoint" as const,
    })),
    ...reports.flatMap((r) =>
      (r.scraperRuns || []).map((run) => ({
        createdAt: run.startedAt,
        type: "scan" as const,
      })),
    ),
  ];

  const activityHeatmapData = calculateActivityHeatmap(allActivities, 91);
  const clusterGrowthData = calculateClusterGrowth(
    userClusters,
    allPainPointsWithReport,
    30,
  );

  const marketScore = toOpportunityScore(allPainPoints, scoringWeights);
  const reportsSaved = reports.length;
  const marketBadge = getMarketBadge(marketScore);
  const communityMapNodes = buildCommunityMapNodes(
    reports.flatMap((report) =>
      report.painPoints.map((point) => ({
        id: point.id,
        title: point.title,
        reportId: report.id,
        reportTitle: report.keywords?.[0] || "Unknown Investigation",
        score: point.score,
        urgency: point.urgency,
        sentiment: point.sentiment,
        mentionCount: point.mentionCount,
        commentCount: point.commentCount,
        subreddit: point.subreddit,
        subredditDisplayName: point.subredditDisplayName,
      })),
    ),
  );
  const keywordTrendInsights = buildLatestTrendInsights(
    reports
      .map((report) => {
        const keyword = report.keywords?.[0]?.trim().toLowerCase();
        if (!keyword) return null;
        return {
          key: keyword,
          value: report.painPoints.length,
          createdAt: report.createdAt,
        };
      })
      .filter((row): row is { key: string; value: number; createdAt: Date } =>
        Boolean(row),
      ),
  );
  const trendingInsight = keywordTrendInsights[0] ?? null;
  const trendingTags = keywordTrendInsights
    .slice(0, 3)
    .map((trend) => `#${trend.key.replace(/\s+/g, "-")}`);
  const urgentPainPoint =
    [...allPainPoints].sort(
      (left, right) =>
        (right.urgency ?? 0) - (left.urgency ?? 0) || right.score - left.score,
    )[0] ?? null;
  const urgentPainPointMentions = urgentPainPoint
    ? allPainPoints.filter((point) => point.title === urgentPainPoint.title)
        .length
    : 0;
  const trendingReport = trendingInsight
    ? reports.find(
        (report) =>
          report.keywords?.[0]?.trim().toLowerCase() === trendingInsight.key,
      )
    : null;
  const urgentPainPointReport = urgentPainPoint
    ? reports.find((report) =>
        report.painPoints.some(
          (point) => point.title === urgentPainPoint.title,
        ),
      )
    : null;

  const marketRadarPoints = calculateMarketRadarPoints(
    allPainPointsWithReport,
    scoringWeights,
  );
  const latestReport = reports[0]
    ? { id: reports[0].id, keyword: reports[0].keywords?.[0] }
    : null;
  const topOpportunity = topOpportunities[0]
    ? {
        reportId: topOpportunities[0].reportId,
        title: topOpportunities[0].title,
      }
    : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-7xl space-y-8 p-4 duration-500 sm:p-6 lg:p-8">
      {planContext.planPurchaseRequired ? (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#ff4500]/25 bg-[#ff4500]/5 px-6 py-4.5 sm:flex-row sm:items-center dark:bg-[#ff4500]/10">
          <div>
            <p className="mb-1 font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
              Action Required
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Your account is currently in read-only mode. Claim a Lifetime Deal
              to unlock unlimited search depth and AI teardowns.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#ff4500] px-5 py-2.5 font-mono text-xs font-black tracking-widest text-white uppercase shadow-xs transition-colors hover:bg-[#e03d00]"
          >
            Claim LTD Deal
          </Link>
        </div>
      ) : null}

      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/5 px-3 py-1 font-mono text-[10px] font-bold text-[#ff4500] uppercase shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4500]"></span>
            </span>
            Market Research Radar Active
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Welcome back, {userFirstName}
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed font-medium text-zinc-500 sm:text-[15px] dark:text-zinc-400">
            Your semantic insights engine has indexed{" "}
            <strong className="font-bold text-zinc-900 dark:text-zinc-100">
              {reportsSaved} investigations
            </strong>{" "}
            across {selectedWindowLabel}.
          </p>
        </div>

        {/* Global Time Range Selector */}
        <DashboardTimeRangeSelector currentWindow={selectedWindow} />
      </div>

      {/* Modular Drag-and-Drop Reorderable Dashboard Grid */}
      <DashboardGrid
        initialCardOrder={initialCardOrder}
        metricsSlot={
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Monthly Scans"
              value={searchesRemainingLabel}
              icon={
                <Search className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              }
              progress={searchesProgress}
              subtext={searchesSubtext}
            />
            <MetricCard
              title="Reports Saved"
              value={reportsSaved.toString()}
              icon={
                <BarChart3 className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              }
              trendSub="Total investigations"
            />
            <MetricCard
              title="Pain Points Found"
              value={painPointsFound.toString()}
              icon={
                <AlertCircle className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              }
              trendSub="Across all reports"
            />
            <MetricCard
              title="Market Score"
              value={marketScore.toString()}
              icon={<Zap className="h-4 w-4 text-[#ff4500]" />}
              badge={marketBadge}
              isHighlight
            />
          </div>
        }
        quickActionsSlot={
          <DashboardQuickActions
            latestReportId={latestReport?.id}
            latestReportKeyword={latestReport?.keyword}
            topOpportunityReportId={topOpportunity?.reportId}
            topOpportunityTitle={topOpportunity?.title}
          />
        }
        searchHeroSlot={<DashboardSearchHero trendingTags={trendingTags} />}
        topOpportunitiesSlot={
          <DashboardTopOpportunities opportunities={topOpportunities} />
        }
        marketRadarSlot={<DashboardMarketRadar points={marketRadarPoints} />}
        heatmapSlot={<DashboardActivityHeatmap data={activityHeatmapData} />}
        clusterGrowthSlot={<DashboardClusterGrowth data={clusterGrowthData} />}
        communityMapSlot={
          <LazyCommunityMapPanel
            nodes={communityMapNodes}
            selectedWindowLabel={selectedWindowLabel}
          />
        }
        recentReportsSlot={
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Recent Reports Table */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/70">
              {reports.length === 0 ? (
                <EmptyState
                  title="Start Your First Investigation"
                  description="Uncover high-intent pain points and signal profitable SaaS opportunities in minutes by mining Reddit's richest conversations."
                  actionLabel="Launch New Investigation"
                  actionHref="/dashboard/search"
                  icon="dashboard"
                  variant="hero"
                  className="border-none bg-transparent shadow-none"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4.5 sm:px-8 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-[#ff4500]"></div>
                      <h4 className="text-base font-extrabold tracking-tight text-zinc-950 dark:text-white">
                        Recent Investigations
                      </h4>
                    </div>
                    <Link
                      className="font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase transition-colors hover:text-[#ff4500] dark:text-zinc-400 dark:hover:text-[#ff4500]"
                      href="/dashboard/reports"
                    >
                      View All Dossiers →
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/50 text-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-500">
                          <th className="px-6 py-3 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                            Investigation
                          </th>
                          <th className="px-6 py-3 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                            Top Friction Point
                          </th>
                          <th className="px-6 py-3 text-center font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                            Score
                          </th>
                          <th className="px-6 py-3 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                        {reports.slice(0, 4).map((report) => {
                          const reportScore = toOpportunityScore(
                            report.painPoints,
                            scoringWeights,
                          );
                          const latestRunStatus = normalizeRunStatus(
                            report.scraperRuns?.[0]?.status,
                          );
                          const statusLabel =
                            latestRunStatus === "completed"
                              ? "Ready"
                              : latestRunStatus === "failed" ||
                                  latestRunStatus === "canceled"
                                ? "Failed"
                                : "Live";

                          return (
                            <ReportRow
                              key={report.id}
                              id={report.id}
                              keyword={
                                report.keywords?.[0] || "Unknown Investigation"
                              }
                              date={new Date(
                                report.createdAt,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                              painPoint={
                                report.painPoints[0]?.title ||
                                "No pain points extracted yet"
                              }
                              score={reportScore}
                              status={statusLabel}
                              explanation={
                                report.painPoints[0]?.scoreExplanation
                              }
                            />
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Insight Panel */}
            <div className="flex flex-col gap-8">
              <DashboardMarketPulse
                trendingInsight={trendingInsight}
                trendingReportId={trendingReport?.id}
                urgentPainPoint={urgentPainPoint}
                urgentPainPointReportId={urgentPainPointReport?.id}
                urgentPainPointMentions={urgentPainPointMentions}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
