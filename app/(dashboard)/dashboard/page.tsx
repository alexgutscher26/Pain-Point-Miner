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
      <div className="h-[400px] w-full animate-pulse border border-black/[0.05] bg-black/[0.01] rounded-2xl" />
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
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {planContext.planPurchaseRequired ? (
        <div className="flex items-center justify-between gap-4 border border-[#ff4500]/25 bg-[#ff4500]/5 px-5 py-4 rounded-2xl">
          <div>
            <p className="mb-1 font-mono text-[11px] font-black tracking-widest text-[#ff4500] uppercase">
              Action Required
            </p>
            <p className="text-sm font-semibold text-[#ff4500]/95">
              Upgrade to a paid plan to unlock new scans, deep mining, and AI suggestions.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 rounded-full bg-[#ff4500] hover:bg-[#e03d00] px-4 py-2 font-mono text-xs font-black tracking-widest text-white uppercase shadow-xs transition-colors"
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
            Your semantic insights engine has analyzed <strong className="text-zinc-850">{reportsSaved} investigations</strong>.
          </p>
        </div>
        <div className="hidden items-center gap-1.5 border border-black/[0.05] bg-white/50 p-1 rounded-full lg:flex shadow-xs backdrop-blur-md">
          <Link
            href="/dashboard?window=realtime"
            className={`px-4 py-2 rounded-full font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-300 ${
              selectedWindow === "realtime"
                ? "bg-[#ff4500] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Realtime
          </Link>
          <Link
            href="/dashboard?window=30d"
            className={`px-4 py-2 rounded-full font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-300 ${
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
        <div className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white/60 backdrop-blur-md shadow-xs lg:col-span-2">
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
                  className="font-mono text-[11px] font-bold tracking-widest text-zinc-550 uppercase transition-colors hover:text-[#ff4500]"
                  href="/dashboard/reports"
                >
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
                  <thead>
                    <tr className="bg-black/[0.01] text-zinc-400 border-b border-black/[0.03]">
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
          <div className="glass-card relative overflow-hidden p-8 rounded-2xl shadow-xs">
            <h4 className="mb-8 flex items-center gap-3 text-lg font-black text-zinc-900">
              <TrendingUp className="h-6 w-6 text-[#ff4500]" />
              Market Pulse
            </h4>
            <div className="space-y-8">
              <div>
                <p className="mb-4 font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                  Trending Niche
                </p>
                <Link
                  href={
                    trendingReport
                      ? `/dashboard/reports/${trendingReport.id}`
                      : `/dashboard/search?keyword=${encodeURIComponent(trendingInsight?.key || "")}`
                  }
                  className="group/item flex items-center gap-4 border border-black/[0.05] bg-white/50 p-4 rounded-2xl transition-all hover:bg-white hover:border-[#ff4500]/15 hover:shadow-2xs duration-300"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ff4500]/15 bg-[#ff4500]/5 text-[#ff4500] transition-colors duration-300 group-hover/item:bg-[#ff4500] group-hover/item:text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-extrabold text-zinc-900 group-hover/item:text-[#ff4500] transition-colors truncate">
                      {trendingInsight?.key || "No trend yet"}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                      {trendingInsight
                        ? trendingInsight.direction === "new"
                          ? "New trend detected"
                          : `${formatTrendChangePercent(trendingInsight.percentChange)} mention volume`
                        : "Run searches to detect trend"}
                    </p>
                  </div>
                </Link>
              </div>
              <div className="border-t border-black/[0.05] pt-6">
                <p className="mb-4 font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                  Urgent Pain Point
                </p>
                <Link
                  href={
                    urgentPainPointReport
                      ? `/dashboard/reports/${urgentPainPointReport.id}`
                      : "/dashboard/reports"
                  }
                  className="group/item block border border-black/[0.05] bg-white/50 p-5 rounded-2xl transition-all hover:bg-white hover:border-[#ff4500]/15 hover:shadow-2xs duration-300"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.03]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4500]/10 text-[#ff4500]">
                        <AlertCircle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-extrabold text-zinc-900">Urgent Signal</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#ff4500] uppercase bg-[#ff4500]/5 px-2 py-0.5 rounded-full">
                      Mined
                    </span>
                  </div>
                  <p className="text-[12px] font-medium leading-relaxed text-zinc-650 italic group-hover/item:text-zinc-900 transition-colors">
                    &ldquo;{urgentPainPoint?.title || "No high-urgency pain point detected yet."}&rdquo;
                  </p>
                </Link>
                <p className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold tracking-wide text-zinc-400 uppercase">
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
      className={`p-5 rounded-2xl relative overflow-hidden group transition-all duration-400 ${
        isHighlight
          ? "border border-[#ff4500]/25 bg-gradient-to-br from-white/95 to-orange-50/20 hover:scale-[1.01] hover:border-[#ff4500]/40 hover:shadow-md"
          : "glass-card glass-card-hover"
      }`}
    >
      {isHighlight && (
        <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-[#ff4500] opacity-[0.03] blur-[40px]"></div>
      )}
      <div className="mb-4 flex items-start justify-between">
        <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-105 ${
          isHighlight 
            ? "bg-[#ff4500]/10 text-[#ff4500]" 
            : "bg-black/[0.02] border border-black/[0.04] text-zinc-700"
        }`}>
          {icon}
        </div>
        {badge && (
          <span className="border border-[#ff4500]/10 bg-[#ff4500]/5 px-2.5 py-0.5 font-mono text-[9px] font-black tracking-widest text-[#ff4500] uppercase rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="mb-1 font-mono text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p
            className={`font-extrabold tracking-tight text-[28px] leading-none ${isHighlight ? "text-[#ff4500]" : "text-zinc-950"}`}
          >
            {value}
          </p>
          {trend && (
            <p className="flex items-center gap-0.5 text-[12px] font-black text-emerald-600">
              <TrendingUp className="h-3 w-3" /> {trend}
            </p>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden bg-zinc-200/80 rounded-full">
              <div
                className="h-full bg-[#ff4500] rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-2 font-mono text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase">
              {subtext}
            </p>
          </div>
        )}
        {trendSub && (
          <p className="mt-1.5 font-mono text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase">
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
    <tr className="group cursor-pointer transition-all duration-300 hover:bg-zinc-50/50">
      <td className="px-8 py-6">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="mb-1 text-[15px] font-extrabold break-words text-zinc-850 transition-colors group-hover:text-[#ff4500]">
            {keyword}
          </p>
          <p className="font-mono text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            {date}
          </p>
        </Link>
      </td>
      <td className="px-8 py-6">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <p className="mb-1 max-w-[250px] truncate text-[14px] font-medium text-zinc-650">
            {painPoint}
          </p>
          {explanation && (
            <p className="max-w-[250px] truncate text-[11px] font-medium text-zinc-400 italic">
              {explanation}
            </p>
          )}
        </Link>
      </td>
      <td className="px-8 py-6 text-center">
        <Link href={`/dashboard/reports/${id}`} className="block">
          <span className="border border-zinc-200/60 bg-white/80 px-2.5 py-1 rounded-lg text-[14px] font-extrabold text-zinc-800 shadow-3xs">
            {score}
          </span>
        </Link>
      </td>
      <td className="px-8 py-6">
        <Link
          href={`/dashboard/reports/${id}`}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex h-2 w-2">
            {status === "Live" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                status === "Live"
                  ? "bg-amber-400"
                  : status === "Failed"
                    ? "bg-rose-500"
                    : "bg-emerald-500"
              }`}
            ></span>
          </div>
          <span
            className={`border px-2 py-0.5 rounded-full font-mono text-[10px] font-black tracking-widest uppercase ${
              status === "Live"
                ? "border-amber-500/20 bg-amber-500/5 text-amber-700"
                : status === "Failed"
                  ? "border-rose-500/20 bg-rose-500/5 text-rose-700"
                  : "border-emerald-500/20 bg-emerald-500/5 text-emerald-700"
            }`}
          >
            {status}
          </span>
        </Link>
      </td>
    </tr>
  );
}
