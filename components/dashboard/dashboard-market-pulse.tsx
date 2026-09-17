import React from "react";
import Link from "next/link";
import { TrendingUp, Sparkles, AlertCircle, Database, ArrowUpRight } from "lucide-react";
import {
  formatTrendChangePercent,
  type TrendInsight,
} from "@/lib/trend-detection";

interface DashboardMarketPulseProps {
  trendingInsight: TrendInsight | null;
  trendingReportId?: string;
  urgentPainPoint: { title: string } | null;
  urgentPainPointReportId?: string;
  urgentPainPointMentions: number;
}

export function DashboardMarketPulse({
  trendingInsight,
  trendingReportId,
  urgentPainPoint,
  urgentPainPointReportId,
  urgentPainPointMentions,
}: DashboardMarketPulseProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs sm:p-7 dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
        <h4 className="flex items-center gap-2.5 text-base font-extrabold tracking-tight text-zinc-950 dark:text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
            <TrendingUp className="h-4 w-4" />
          </div>
          Market Pulse
        </h4>
        <span className="font-mono text-[10px] font-bold tracking-widest text-[#ff4500] uppercase">
          Live Signals
        </span>
      </div>

      <div className="space-y-6">
        {/* Trending Niche */}
        <div>
          <p className="mb-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
            Top Trending Topic
          </p>
          <Link
            href={
              trendingReportId
                ? `/dashboard/reports/${trendingReportId}`
                : `/dashboard/search?keyword=${encodeURIComponent(trendingInsight?.key || "")}`
            }
            className="group/item flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 transition-all hover:border-[#ff4500]/40 hover:bg-white hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-[#ff4500]/40 dark:hover:bg-zinc-900"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#ff4500]/20 bg-[#ff4500]/10 text-[#ff4500] transition-colors group-hover/item:bg-[#ff4500] group-hover/item:text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-extrabold text-zinc-900 transition-colors group-hover/item:text-[#ff4500] dark:text-zinc-100">
                  {trendingInsight?.key || "No active trend yet"}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {trendingInsight
                    ? trendingInsight.direction === "new"
                      ? "New velocity surge detected"
                      : `${formatTrendChangePercent(trendingInsight.percentChange)} volume spike`
                    : "Run searches to detect velocity trends"}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:text-[#ff4500]" />
          </Link>
        </div>

        {/* Urgent Pain Point */}
        <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
            High-Urgency Buyer Frustration
          </p>
          <Link
            href={
              urgentPainPointReportId
                ? `/dashboard/reports/${urgentPainPointReportId}`
                : "/dashboard/reports"
            }
            className="group/item block rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 transition-all hover:border-[#ff4500]/40 hover:bg-white hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-[#ff4500]/40 dark:hover:bg-zinc-900"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                <span className="font-mono text-[11px] font-bold text-zinc-900 dark:text-zinc-200">
                  Urgent Friction
                </span>
              </div>
              <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                Critical
              </span>
            </div>
            <p className="text-[12px] leading-relaxed font-medium italic text-zinc-700 transition-colors group-hover/item:text-zinc-950 dark:text-zinc-300 dark:group-hover/item:text-white">
              &ldquo;
              {urgentPainPoint?.title ||
                "No high-urgency pain point detected in recent scans."}
              &rdquo;
            </p>
          </Link>
          <p className="mt-3.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
            <Database className="h-3 w-3" /> Cited across{" "}
            <span className="font-bold text-zinc-600 dark:text-zinc-300">{urgentPainPointMentions || 0}</span> discussions
          </p>
        </div>
      </div>
    </div>
  );
}

