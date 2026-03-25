import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { scraper, scraperRun } from "@/lib/db/schema";
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
import { getMarketBadge, toOpportunityScore } from "@/lib/dashboard-metrics";
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

const LazyCommunityMapPanel = dynamicLoader(
  () =>
    import("@/components/dashboard/community-map-panel").then(
      (mod) => mod.CommunityMapPanel,
    ),
  {
    loading: () => (
      <div className="h-[400px] w-full animate-pulse bg-white/5 border-2 border-white/10" />
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

  const reports = await getCachedDashboardData(
    session.user.id,
    workspaceId,
    stableWindowDateMs,
  );

  const painPointsFound = reports.reduce(
    (sum, report) => sum + report.painPoints.length,
    0,
  );
  const allPainPoints = reports.flatMap((report) => report.painPoints);
  const marketScore = toOpportunityScore(allPainPoints);
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
        <div className="border border-amber-400/35 bg-amber-500/8 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-black uppercase tracking-widest text-amber-300 mb-1">
              Read-Only After Trial
            </p>
            <p className="text-sm text-amber-100 font-semibold">
              You can still review past results and explore the app. New scans
              and AI actions require a paid plan.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 px-4 py-2 border border-[#ff8a57] bg-[#ff4500] text-white font-mono text-xs font-black uppercase tracking-widest"
          >
            Purchase Plan
          </Link>
        </div>
      ) : null}
      {planContext.trialActive && (planContext.trialDaysRemaining ?? 0) <= 1 ? (
        <div className="border-2 border-amber-400/60 bg-amber-500/10 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-black uppercase tracking-widest text-amber-300 mb-1">
              Trial Ending Soon
            </p>
            <p className="text-sm text-amber-100 font-semibold">
              Your free trial ends in 1 day. Purchase a paid plan to continue
              using all features.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 px-4 py-2 border border-[#ff8a57] bg-[#ff4500] text-white font-mono text-xs font-black uppercase tracking-widest"
          >
            Purchase Plan
          </Link>
        </div>
      ) : null}
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-[#ff4500]"></div>
            <p className="font-mono text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">
              Dashboard Overview
            </p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
            Welcome, {userFirstName}
          </h2>
          <p className="text-zinc-400 font-medium text-sm">
            Your market research engine has analyzed{" "}
            <span className="text-white font-bold">
              {reportsSaved} investigations
            </span>
            .
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3 bg-[#161616] p-1.5 border border-white/15">
          <Link
            href="/dashboard?window=realtime"
            className={`px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider border ${
              selectedWindow === "realtime"
                ? "bg-[#ff4500] border-[#ff8a57] text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300 transition-colors"
            }`}
          >
            Realtime
          </Link>
          <Link
            href="/dashboard?window=30d"
            className={`px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider border ${
              selectedWindow === "30d"
                ? "bg-[#ff4500] border-[#ff8a57] text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300 transition-colors"
            }`}
          >
            Past 30 Days
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Scans"
          value={searchesRemainingLabel}
          icon={<Search className="w-4 h-4 text-white" />}
          progress={searchesProgress}
          subtext={searchesSubtext}
        />
        <MetricCard
          title="Reports Saved"
          value={reportsSaved.toString()}
          icon={<BarChart3 className="w-4 h-4 text-white" />}
          trendSub="Total investigations"
        />
        <MetricCard
          title="Pain Points Found"
          value={painPointsFound.toString()}
          icon={<AlertCircle className="w-4 h-4 text-white" />}
          trendSub="Across all reports"
        />
        <MetricCard
          title="Market Score"
          value={marketScore.toString()}
          icon={<Zap className="w-4 h-4 text-[#ff4500]" />}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports Table */}
        <div className="lg:col-span-2 bg-[#111] border-2 border-white/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#ff4500]"></div>
              <h4 className="font-black text-white text-lg tracking-tight">
                Recent Investigations
              </h4>
            </div>
            <Link
              className="font-mono text-[11px] font-bold text-zinc-400 hover:text-[#ff4500] transition-colors uppercase tracking-widest"
              href="/dashboard/reports"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="bg-white/2 text-zinc-500">
                  <th className="px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em]">
                    Investigation
                  </th>
                  <th className="px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em]">
                    Key Insight
                  </th>
                  <th className="px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-center">
                    Score
                  </th>
                  <th className="px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-10 text-center text-zinc-500 font-mono text-sm font-medium"
                    >
                      No investigations yet. Run your first analysis to populate
                      this table.
                    </td>
                  </tr>
                ) : (
                  reports.slice(0, 3).map((report) => {
                    const reportScore = toOpportunityScore(report.painPoints);
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
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insight Panel */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#111] border-2 border-white/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] p-8 relative overflow-hidden">
            <h4 className="font-black text-white text-lg mb-8 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#ff4500]" />
              Market Pulse
            </h4>
            <div className="space-y-8">
              <div>
                <p className="font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                  Trending Niche
                </p>
                <Link
                  href={
                    trendingReport
                      ? `/dashboard/reports/${trendingReport.id}`
                      : `/dashboard/search?keyword=${encodeURIComponent(trendingInsight?.key || "")}`
                  }
                  className="flex items-center gap-4 bg-white/3 p-4 border border-white/15 hover:border-[#ff4500]/40 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#ff4500]/10 border border-[#ff4500]/40 flex items-center justify-center text-[#ff4500]">
                    <Sparkles className="w-6 h-6" />
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
              <div className="pt-6 border-t border-white/10">
                <p className="font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                  Urgent Pain Point
                </p>
                <Link
                  href={
                    urgentPainPointReport
                      ? `/dashboard/reports/${urgentPainPointReport.id}`
                      : "/dashboard/reports"
                  }
                  className="block bg-zinc-900 p-5 border-l-4 border-[#ff4500] border-y border-r border-white/10 hover:bg-zinc-800/60 transition-colors"
                >
                  <p className="text-[14px] text-zinc-200 font-medium italic leading-relaxed">
                    &quot;
                    {urgentPainPoint?.title ||
                      "No high-urgency pain point detected yet."}
                    &quot;
                  </p>
                </Link>
                <p className="font-mono text-[11px] text-zinc-500 mt-4 font-bold flex items-center gap-2 uppercase tracking-wide">
                  <Database className="w-3.5 h-3.5" /> Found in{" "}
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
      className={`bg-[#111] p-5 border-2 ${isHighlight ? "border-[#ff4500]/60" : "border-white/12"} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.65)] relative overflow-hidden group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 border border-white/15 group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 transition-transform">
          {icon}
        </div>
        {badge && (
          <span className="font-mono text-[9px] font-black px-2 py-0.5 bg-[#ff4500]/12 text-[#ff4500] uppercase tracking-widest border border-[#ff4500]/35">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-2xl font-black ${isHighlight ? "text-[#ff4500]" : "text-white"} tracking-tight`}
          >
            {value}
          </p>
          {trend && (
            <p className="text-emerald-400 text-[12px] font-black flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {trend}
            </p>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full bg-white/5 overflow-hidden border border-white/10">
              <div
                className="h-full bg-[#ff4500] shadow-[0_0_10px_rgba(255,69,0,0.65)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="font-mono text-[9px] text-zinc-500 mt-2 font-bold uppercase tracking-widest">
              {subtext}
            </p>
          </div>
        )}
        {trendSub && (
          <p className="font-mono text-[9px] text-zinc-500 mt-0.5 font-bold uppercase tracking-widest">
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
}: {
  id: string;
  keyword: string;
  date: string;
  painPoint: string;
  score: number;
  status: string;
}) {
  return (
    <tr className="hover:bg-white/4 transition-colors cursor-pointer group">
      <td className="px-8 py-6">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="text-[15px] font-bold text-white mb-1 break-words group-hover:text-[#ff4500] transition-colors">
            {keyword}
          </p>
          <p className="font-mono text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
            {date}
          </p>
        </Link>
      </td>
      <td className="px-8 py-6">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="text-[14px] text-zinc-400 font-medium truncate max-w-[250px]">
            {painPoint}
          </p>
        </Link>
      </td>
      <td className="px-8 py-6 text-center">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <span className="text-lg font-black text-white px-3 py-1 bg-white/5 border border-white/20">
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
            className={`w-2.5 h-2.5 ${
              status === "Live"
                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                : status === "Failed"
                  ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.65)]"
                  : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]"
            }`}
          ></div>
          <span
            className={`font-mono text-[10px] font-black uppercase tracking-widest px-2 py-1 border ${
              status === "Live"
                ? "text-amber-200 border-amber-400/40 bg-amber-500/10"
                : status === "Failed"
                  ? "text-rose-200 border-rose-400/40 bg-rose-500/10"
                  : "text-emerald-200 border-emerald-400/40 bg-emerald-500/10"
            }`}
          >
            {status}
          </span>
        </Link>
      </td>
    </tr>
  );
}
