import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { scraper, scraperRun, userPreferences } from "@/lib/db/schema";
import { and, desc, eq, gte, isNull } from "drizzle-orm";
import {
  TrendingUp,
  Search,
  Sparkles,
  Database,
  BarChart3,
  AlertCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { normalizeRunStatus } from "@/lib/run-status";
import {
  getMarketBadge,
  toOpportunityScore,
  DEFAULT_WEIGHTS,
  ScoringWeights,
} from "@/lib/dashboard-metrics";
import {
  buildLatestTrendInsights,
  formatTrendChangePercent,
} from "@/lib/trend-detection";
import { DashboardSearchHero } from "@/components/dashboard/dashboard-search-hero";
import { getMonthlyScanUsage, getMonthlyUsageSummary } from "@/lib/plan-gating";
import { resolvePlanContext } from "@/lib/plan-resolver";
import { buildCommunityMapNodes } from "@/lib/community-map";
import { unstable_cache } from "next/cache";
import dynamicLoader from "next/dynamic";
import { EmptyState } from "@/components/dashboard/empty-state";

const LazyCommunityMapPanel = dynamicLoader(
  () =>
    import("@/components/dashboard/community-map-panel").then(
      (mod) => mod.CommunityMapPanel,
    ),
  {
    loading: () => (
      <div className="h-[400px] w-full animate-pulse border-2 border-white/10 bg-white/5" />
    ),
  },
);

const getCachedDashboardData = unstable_cache(
  async (userId: string, workspaceId: string | null, windowDateMs: number) => {
    const fromDate = new Date(windowDateMs);
    const whereClause = and(
      eq(scraper.userId, userId),
      workspaceId
        ? eq(scraper.workspaceId, workspaceId)
        : isNull(scraper.workspaceId),
      gte(scraper.createdAt, fromDate),
    );

    return await db.query.scraper.findMany({
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
            title: true,
            score: true,
            urgency: true,
            monetizationScore: true,
            marketMaturity: true,
            sentiment: true,
            mentionCount: true,
            commentCount: true,
            subreddit: true,
            subredditDisplayName: true,
            scoreExplanation: true,
          },
          with: {
            painPointFeedback: {
              columns: {
                vote: true,
              },
            },
          },
        },
      },
    });
  },
  ["dashboard-metrics-cache"],
  { revalidate: 30, tags: ["dashboard"] },
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
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

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
        (v) => v.vote === 1,
      ).length;
      const userDownvotes = (point.painPointFeedback ?? []).filter(
        (v) => v.vote === -1,
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
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {planContext.planPurchaseRequired ? (
        <div className="flex items-center justify-between gap-4 border border-amber-400/35 bg-amber-500/8 px-5 py-4">
          <div>
            <p className="mb-1 font-mono text-[11px] font-black tracking-widest text-amber-300 uppercase">
              Action Required
            </p>
            <p className="text-sm font-semibold text-amber-100">
              Start your 2-day trial with a credit card to unlock new scans and AI suggestions.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 border border-[#ff8a57] bg-[#ff4500] px-4 py-2 font-mono text-xs font-black tracking-widest text-white uppercase"
          >
            Start Free Trial
          </Link>
        </div>
      ) : null}
      {planContext.trialActive && (planContext.trialDaysRemaining ?? 0) <= 1 ? (
        <div className="flex items-center justify-between gap-4 border-2 border-amber-400/60 bg-amber-500/10 px-5 py-4">
          <div>
            <p className="mb-1 font-mono text-[11px] font-black tracking-widest text-amber-300 uppercase">
              Trial Ending Soon
            </p>
            <p className="text-sm font-semibold text-amber-100">
              Your free trial ends in 1 day. Purchase a paid plan to continue using all features.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 border border-[#ff8a57] bg-[#ff4500] px-4 py-2 font-mono text-xs font-black tracking-widest text-white uppercase"
          >
            Purchase Plan
          </Link>
        </div>
      ) : null}
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px w-8 bg-[#ff4500]"></div>
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
              Dashboard Overview
            </p>
          </div>
          <h2 className="mb-3 text-3xl leading-none font-black tracking-tight text-white">
            Welcome, {userFirstName}
          </h2>
          <p className="text-sm font-medium text-zinc-400">
            Your market research engine has analyzed{" "}
            <span className="font-bold text-white">
              {reportsSaved} investigations
            </span>
            .
          </p>
        </div>
        <div className="hidden items-center gap-3 border border-white/15 bg-[#161616] p-1.5 lg:flex">
          <Link
            href="/dashboard?window=realtime"
            className={`border px-4 py-2 font-mono text-[11px] font-bold tracking-wider uppercase ${
              selectedWindow === "realtime"
                ? "border-[#ff8a57] bg-[#ff4500] text-white"
                : "border-transparent text-zinc-500 transition-colors hover:text-zinc-300"
            }`}
          >
            Realtime
          </Link>
          <Link
            href="/dashboard?window=30d"
            className={`border px-4 py-2 font-mono text-[11px] font-bold tracking-wider uppercase ${
              selectedWindow === "30d"
                ? "border-[#ff8a57] bg-[#ff4500] text-white"
                : "border-transparent text-zinc-500 transition-colors hover:text-zinc-300"
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
          icon={<Search className="h-4 w-4 text-white" />}
          progress={searchesProgress}
          subtext={searchesSubtext}
        />
        <MetricCard
          title="Reports Saved"
          value={reportsSaved.toString()}
          icon={<BarChart3 className="h-4 w-4 text-white" />}
          trendSub="Total investigations"
        />
        <MetricCard
          title="Pain Points Found"
          value={painPointsFound.toString()}
          icon={<AlertCircle className="h-4 w-4 text-white" />}
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
        <div className="overflow-hidden border-2 border-white/10 bg-[#111] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] lg:col-span-2">
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
              <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-[#ff4500]"></div>
                  <h4 className="text-lg font-black tracking-tight text-white">
                    Recent Investigations
                  </h4>
                </div>
                <Link
                  className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase transition-colors hover:text-[#ff4500]"
                  href="/dashboard/reports"
                >
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
                  <thead>
                    <tr className="bg-white/2 text-zinc-500">
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
                  <tbody className="divide-y divide-white/5">
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
          <div className="relative overflow-hidden border-2 border-white/10 bg-[#111] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
            <h4 className="mb-8 flex items-center gap-3 text-lg font-black text-white">
              <TrendingUp className="h-6 w-6 text-[#ff4500]" />
              Market Pulse
            </h4>
            <div className="space-y-8">
              <div>
                <p className="mb-4 font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                  Trending Niche
                </p>
                <Link
                  href={
                    trendingReport
                      ? `/dashboard/reports/${trendingReport.id}`
                      : `/dashboard/search?keyword=${encodeURIComponent(trendingInsight?.key || "")}`
                  }
                  className="flex items-center gap-4 border border-white/15 bg-white/3 p-4 transition-colors hover:border-[#ff4500]/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center border border-[#ff4500]/40 bg-[#ff4500]/10 text-[#ff4500]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-white">
                      {trendingInsight?.key || "No trend yet"}
                    </p>
                    <p className="text-[12px] text-zinc-500">
                      {trendingInsight
                        ? trendingInsight.direction === "new"
                          ? "New trend detected"
                          : `${formatTrendChangePercent(trendingInsight.percentChange)} mention volume`
                        : "Run more searches to detect trend"}
                    </p>
                  </div>
                </Link>
              </div>
              <div className="border-t border-white/10 pt-6">
                <p className="mb-4 font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                  Urgent Pain Point
                </p>
                <Link
                  href={
                    urgentPainPointReport
                      ? `/dashboard/reports/${urgentPainPointReport.id}`
                      : "/dashboard/reports"
                  }
                  className="block border-y border-r border-l-4 border-[#ff4500] border-white/10 bg-zinc-900 p-5 transition-colors hover:bg-zinc-800/60"
                >
                  <p className="text-[14px] leading-relaxed font-medium text-zinc-200 italic">
                    &quot;
                    {urgentPainPoint?.title ||
                      "No high-urgency pain point detected yet."}
                    &quot;
                  </p>
                </Link>
                <p className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold tracking-wide text-zinc-500 uppercase">
                  <Database className="h-3.5 w-3.5" /> Found in{" "}
                  {urgentPainPointMentions || 0} investigations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  progress,
  subtext,
  trend,
  trendSub,
  badge,
  isHighlight,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  progress?: number;
  subtext?: string;
  trend?: string;
  trendSub?: string;
  badge?: string;
  isHighlight?: boolean;
}) {
  return (
    <div
      className={`border-2 bg-[#111] p-5 ${isHighlight ? "border-[#ff4500]/60" : "border-white/12"} group relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.65)]`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="border border-white/15 bg-white/5 p-2 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
          {icon}
        </div>
        {badge && (
          <span className="border border-[#ff4500]/35 bg-[#ff4500]/12 px-2 py-0.5 font-mono text-[9px] font-black tracking-widest text-[#ff4500] uppercase">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-2xl font-black ${isHighlight ? "text-[#ff4500]" : "text-white"} tracking-tight`}
          >
            {value}
          </p>
          {trend && (
            <p className="flex items-center gap-0.5 text-[12px] font-black text-emerald-400">
              <TrendingUp className="h-3 w-3" /> {trend}
            </p>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden border border-white/10 bg-white/5">
              <div
                className="h-full bg-[#ff4500] shadow-[0_0_10px_rgba(255,69,0,0.65)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-2 font-mono text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
              {subtext}
            </p>
          </div>
        )}
        {trendSub && (
          <p className="mt-0.5 font-mono text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
            {trendSub}
          </p>
        )}
      </div>
    </div>
  );
}

function ReportRow({
  id,
  keyword,
  date,
  painPoint,
  score,
  status,
  explanation,
}: {
  id: string;
  keyword: string;
  date: string;
  painPoint: string;
  score: number;
  status: string;
  explanation?: string | null;
}) {
  return (
    <tr className="group cursor-pointer transition-colors hover:bg-white/4">
      <td className="px-8 py-6">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="mb-1 text-[15px] font-bold break-words text-white transition-colors group-hover:text-[#ff4500]">
            {keyword}
          </p>
          <p className="font-mono text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
            {date}
          </p>
        </Link>
      </td>
      <td className="px-8 py-6">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="mb-1 max-w-[250px] truncate text-[14px] font-medium text-zinc-400">
            {painPoint}
          </p>
          {explanation && (
            <p className="max-w-[250px] truncate text-[11px] font-medium text-zinc-600 italic">
              {explanation}
            </p>
          )}
        </Link>
      </td>
      <td className="px-8 py-6 text-center">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <span className="border border-white/20 bg-white/5 px-3 py-1 text-lg font-black text-white">
            {score}
          </span>
        </Link>
      </td>
      <td className="px-8 py-6">
        <Link
          href={`/dashboard/reports/${id}`}
          className="flex items-center gap-2.5"
        >
          <div
            className={`h-2.5 w-2.5 ${
              status === "Live"
                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                : status === "Failed"
                  ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.65)]"
                  : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]"
            }`}
          ></div>
          <span
            className={`border px-2 py-1 font-mono text-[10px] font-black tracking-widest uppercase ${
              status === "Live"
                ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                : status === "Failed"
                  ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
                  : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {status}
          </span>
        </Link>
      </td>
    </tr>
  );
}
