"use client";

import Link from "next/link";
import {
  Flame,
  ArrowRight,
  DollarSign,
  Zap,
  TrendingUp,
  Sparkles,
  Layers,
} from "lucide-react";
import { TopOpportunityItem } from "@/lib/dashboard-analytics";

interface DashboardTopOpportunitiesProps {
  opportunities: TopOpportunityItem[];
  className?: string;
}

export function DashboardTopOpportunities({
  opportunities,
  className = "",
}: DashboardTopOpportunitiesProps) {
  if (opportunities.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-mono text-sm font-black tracking-tight text-zinc-950 uppercase dark:text-white">
                Top Opportunities This Week
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Highest-conviction market signals
              </p>
            </div>
          </div>
        </div>
        <div className="py-8 text-center">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-zinc-400 opacity-60 dark:text-zinc-500" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            No opportunities identified yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            Launch a scan across subreddits to surface high-intent problems and
            willingness to pay.
          </p>
          <Link
            href="/dashboard/search"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#ff4500] px-4 py-2 font-mono text-xs font-bold text-white uppercase shadow-xs transition-colors hover:bg-[#e03d00]"
          >
            Launch First Scan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-mono text-sm font-black tracking-tight text-zinc-950 uppercase dark:text-white">
                Top Opportunities This Week
              </h4>
              <span className="rounded-full bg-[#ff4500]/10 px-2 py-0.5 font-mono text-[9px] font-black text-[#ff4500] uppercase">
                AI Scored
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ranked by validation signal, urgency & monetization potential
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/reports"
          className="font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase transition-colors hover:text-[#ff4500] dark:text-zinc-400 dark:hover:text-[#ff4500]"
        >
          All Dossiers →
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {opportunities.map((opp, index) => {
          const isTop = index === 0;
          return (
            <Link
              key={opp.id}
              href={`/dashboard/reports/${opp.reportId}`}
              className={`group block rounded-xl border p-3.5 transition-all hover:border-[#ff4500]/40 hover:shadow-md ${
                isTop
                  ? "border-[#ff4500]/30 bg-gradient-to-r from-[#ff4500]/5 via-white to-amber-500/5 dark:from-[#ff4500]/10 dark:via-zinc-900 dark:to-amber-500/5"
                  : "border-zinc-100 bg-zinc-50/50 hover:bg-white dark:border-zinc-800/60 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-black ${
                      isTop
                        ? "bg-[#ff4500] text-white shadow-[0_2px_8px_rgba(255,69,0,0.3)]"
                        : index === 1
                          ? "bg-zinc-800 text-white dark:bg-zinc-700"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <h5 className="line-clamp-1 text-xs font-bold text-zinc-900 transition-colors group-hover:text-[#ff4500] sm:text-sm dark:text-zinc-100">
                      {opp.title}
                    </h5>
                    <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {opp.body}
                    </p>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex shrink-0 flex-col items-end">
                  <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-black text-emerald-700 dark:text-emerald-400">
                    <Zap className="h-3 w-3" />
                    <span>{opp.opportunityScore}</span>
                  </div>
                  <span className="mt-0.5 font-mono text-[9px] text-zinc-400 uppercase">
                    Score
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-black/[0.04] pt-2 font-mono text-[10px] dark:border-white/[0.06]">
                {opp.subreddit && (
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-200/70 px-1.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <Layers className="h-2.5 w-2.5 text-[#ff4500]" />
                    r/{opp.subreddit}
                  </span>
                )}
                <span className="text-zinc-400">
                  Keyword:{" "}
                  <strong className="text-zinc-600 dark:text-zinc-300">
                    {opp.reportKeyword}
                  </strong>
                </span>
                {opp.budgetSignalsCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-3 w-3" />
                    {opp.budgetSignalsCount} Budget Signal
                    {opp.budgetSignalsCount > 1 ? "s" : ""}
                  </span>
                )}
                {opp.urgency >= 7 && (
                  <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600 dark:text-amber-400">
                    <TrendingUp className="h-3 w-3" />
                    High Urgency
                  </span>
                )}

                <span className="ml-auto inline-flex items-center gap-1 font-bold text-[#ff4500] opacity-0 transition-opacity group-hover:opacity-100">
                  View Dossier <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
