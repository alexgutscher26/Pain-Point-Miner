import { getServerSession } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { scraper } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, Scale } from "lucide-react";
import { ComparisonView } from "@/components/dashboard/comparison-view";
import { ComparisonReport } from "@/lib/comparison";
import { toOpportunityScore, DEFAULT_WEIGHTS } from "@/lib/dashboard-metrics";

export default async function DashboardComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const requestHeaders = await headers();
  const session = await getServerSession(requestHeaders);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const resolvedParams = await searchParams;

  const rawScrapers = await db.query.scraper.findMany({
    where: eq(scraper.userId, session.user.id),
    with: {
      painPoints: {
        with: {
          painPointFeedback: true,
        },
      },
    },
    orderBy: [desc(scraper.createdAt)],
  });

  const fullReportsData: ComparisonReport[] = rawScrapers.map((s) => ({
    id: s.id,
    keyword: s.keywords?.[0] || "Untitled Investigation",
    subreddits: Array.isArray(s.subreddits) ? s.subreddits : [],
    createdAt: s.createdAt,
    painPoints: s.painPoints.map((p) => {
      const upvotes = (p.painPointFeedback || []).filter(
        (v) => v.vote === 1,
      ).length;
      const downvotes = (p.painPointFeedback || []).filter(
        (v) => v.vote === -1,
      ).length;
      return {
        id: p.id,
        title: p.title,
        score: p.score,
        urgency: p.urgency,
        monetizationScore: p.monetizationScore,
        marketMaturity: p.marketMaturity,
        sentiment: p.sentiment ?? null,
        subreddit: p.subreddit,
        userUpvotes: upvotes,
        userDownvotes: downvotes,
        commentCount: p.commentCount,
        mentionCount: p.mentionCount,
        budget:
          (p.budget as Array<{
            amount?: number;
            currency?: string;
            period?: string;
          }>) || [],
      };
    }),
  }));

  const availableReports = fullReportsData.map((r) => ({
    id: r.id,
    keyword: r.keyword,
    date: new Date(r.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    painPointsCount: r.painPoints.length,
    score: toOpportunityScore(r.painPoints, DEFAULT_WEIGHTS),
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-7xl space-y-8 p-4 duration-500 sm:p-6 lg:p-8">
      {/* Header with Navigation */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-500 transition-colors hover:text-[#ff4500]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back to Research Dossiers</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff4500]/10 text-[#ff4500]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Side-by-Side Comparison
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Benchmark commercial viability, audience friction, and market
                quadrant positioning
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Workspace View */}
      <ComparisonView
        initialReportAId={resolvedParams.a}
        initialReportBId={resolvedParams.b}
        availableReports={availableReports}
        fullReportsData={fullReportsData}
      />
    </div>
  );
}
