import React from "react";
import Link from "next/link";
import { TrendingUp, Sparkles, AlertCircle, Database } from "lucide-react";
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
    <div className="glass-card relative overflow-hidden rounded-2xl p-8 shadow-xs">
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
              trendingReportId
                ? `/dashboard/reports/${trendingReportId}`
                : `/dashboard/search?keyword=${encodeURIComponent(trendingInsight?.key || "")}`
            }
            className="group/item flex items-center gap-4 rounded-2xl border border-black/[0.05] bg-white/50 p-4 transition-all duration-300 hover:border-[#ff4500]/15 hover:bg-white hover:shadow-2xs"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ff4500]/15 bg-[#ff4500]/5 text-[#ff4500] transition-colors duration-300 group-hover/item:bg-[#ff4500] group-hover/item:text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-extrabold text-zinc-900 transition-colors group-hover/item:text-[#ff4500]">
                {trendingInsight?.key || "No trend yet"}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-zinc-400">
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
              urgentPainPointReportId
                ? `/dashboard/reports/${urgentPainPointReportId}`
                : "/dashboard/reports"
            }
            className="group/item block rounded-2xl border border-black/[0.05] bg-white/50 p-5 transition-all duration-300 hover:border-[#ff4500]/15 hover:bg-white hover:shadow-2xs"
          >
            <div className="mb-3 flex items-center justify-between border-b border-black/[0.03] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4500]/10 text-[#ff4500]">
                  <AlertCircle className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-extrabold text-zinc-900">
                  Urgent Signal
                </span>
              </div>
              <span className="rounded-full bg-[#ff4500]/5 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#ff4500] uppercase">
                Mined
              </span>
            </div>
            <p className="text-zinc-650 text-[12px] leading-relaxed font-medium italic transition-colors group-hover/item:text-zinc-900">
              &ldquo;
              {urgentPainPoint?.title ||
                "No high-urgency pain point detected yet."}
              &rdquo;
            </p>
          </Link>
          <p className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold tracking-wide text-zinc-400 uppercase">
            <Database className="h-3.5 w-3.5" /> Found in{" "}
            {urgentPainPointMentions || 0} investigations
          </p>
        </div>
      </div>
    </div>
  );
}
