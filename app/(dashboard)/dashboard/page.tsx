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
    const fromDate = new Date(windowDateMs);
    const scraperRows = await db.query.scraper.findMany({
      where: and(
        eq(scraper.userId, userId),
        workspaceScope(scraper.workspaceId, workspaceId),
        isNull(scraper.deletedAt),
        gte(scraper.createdAt, fromDate),
      ),
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
const dashboardWindowSchema = z.enum(["realtime", "30d"]).default("realtime");

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
  const selectedWindow = parsedWindow.success ? parsedWindow.data : "realtime";
  const windowFromDate = new Date();
  if (selectedWindow === "30d") {
    windowFromDate.setDate(windowFromDate.getDate() - 30);
  } else {
    windowFromDate.setHours(windowFromDate.getHours() - 24);
  }

  // Ensure stable cache keys by rounding the timestamp to 30s intervals
  const stableWindowDateMs =
    Math.floor(windowFromDate.getTime() / 30000) * 30000;

  const selectedWindowLabel =
    selectedWindow === "30d" ? "the past 30 days" : "the last 24 hours";

  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
    columns: { scoringWeights: true },
  });
  const scoringWeights =
    (preferences?.scoringWeights as ScoringWeights) || DEFAULT_WEIGHTS;

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-7xl space-y-8 p-4 duration-500 sm:p-6 lg:p-8">
      {planContext.planPurchaseRequired ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#ff4500]/25 bg-[#ff4500]/5 px-5 py-4">
          <div>
            <p className="mb-1 font-mono text-[11px] font-black tracking-widest text-[#ff4500] uppercase">
              Action Required
            </p>
            <p className="text-sm font-semibold text-[#ff4500]/95">
              Upgrade to a paid plan to unlock new scans, deep mining, and AI
              suggestions.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 rounded-full bg-[#ff4500] px-4 py-2 font-mono text-xs font-black tracking-widest text-white uppercase shadow-xs transition-colors hover:bg-[#e03d00]"
          >
            Upgrade Now
          </Link>
        </div>
      ) : null}
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff4500]/10 bg-[#ff4500]/5 px-3 py-1 text-[11px] font-bold text-[#ff4500] shadow-2xs">
            <div className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff4500]"></span>
            </div>
            Market Research Active
          </div>
          <h2 className="mb-3 text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-zinc-950 sm:text-[44px]">
            Welcome, {userFirstName}
          </h2>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
            Your semantic insights engine has analyzed{" "}
            <strong className="text-zinc-850">
              {reportsSaved} investigations
            </strong>
            .
          </p>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border border-black/[0.05] bg-white/50 p-1 shadow-xs backdrop-blur-md lg:flex">
          <Link
            href="/dashboard?window=realtime"
            className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-300 ${
              selectedWindow === "realtime"
                ? "bg-[#ff4500] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Realtime
          </Link>
          <Link
            href="/dashboard?window=30d"
            className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-300 ${
              selectedWindow === "30d"
                ? "bg-[#ff4500] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Past 30 Days
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Scans"
          value={searchesRemainingLabel}
          icon={<Search className="h-4 w-4 text-zinc-700" />}
          progress={searchesProgress}
          subtext={searchesSubtext}
        />
        <MetricCard
          title="Reports Saved"
          value={reportsSaved.toString()}
          icon={<BarChart3 className="h-4 w-4 text-zinc-700" />}
          trendSub="Total investigations"
        />
        <MetricCard
          title="Pain Points Found"
          value={painPointsFound.toString()}
          icon={<AlertCircle className="h-4 w-4 text-zinc-700" />}
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

      {/* Main Action Block */}
      <DashboardSearchHero trendingTags={trendingTags} />

      <LazyCommunityMapPanel
        nodes={communityMapNodes}
        selectedWindowLabel={selectedWindowLabel}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Reports Table */}
        <div className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white/60 shadow-xs backdrop-blur-md lg:col-span-2">
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
              <div className="flex items-center justify-between border-b border-black/[0.05] px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#ff4500]"></div>
                  <h4 className="text-lg font-black tracking-tight text-zinc-900">
                    Recent Investigations
                  </h4>
                </div>
                <Link
                  className="text-zinc-550 font-mono text-[11px] font-bold tracking-widest uppercase transition-colors hover:text-[#ff4500]"
                  href="/dashboard/reports"
                >
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
                  <thead>
                    <tr className="border-b border-black/[0.03] bg-black/[0.01] text-zinc-400">
                      <th className="px-8 py-4 font-mono text-[11px] font-bold tracking-[0.15em] uppercase">
                        Investigation
                      </th>
                      <th className="px-8 py-4 font-mono text-[11px] font-bold tracking-[0.15em] uppercase">
                        Key Insight
                      </th>
                      <th className="px-8 py-4 text-center font-mono text-[11px] font-bold tracking-[0.15em] uppercase">
                        Score
                      </th>
                      <th className="px-8 py-4 font-mono text-[11px] font-bold tracking-[0.15em] uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03]">
                    {reports.slice(0, 3).map((report) => {
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
                          date={new Date(report.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                          painPoint={
                            report.painPoints[0]?.title ||
                            "No pain points extracted yet"
                          }
                          score={reportScore}
                          status={statusLabel}
                          explanation={report.painPoints[0]?.scoreExplanation}
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
    </div>
  );
}
