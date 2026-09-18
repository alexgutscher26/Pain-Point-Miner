"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Search,
  FileText,
  Flame,
  Compass,
  Activity,
  ArrowRight,
} from "lucide-react";

interface DashboardQuickActionsProps {
  latestReportId?: string | null;
  latestReportKeyword?: string | null;
  topOpportunityReportId?: string | null;
  topOpportunityTitle?: string | null;
  className?: string;
}

export function DashboardQuickActions({
  latestReportId,
  latestReportKeyword,
  topOpportunityReportId,
  topOpportunityTitle,
  className = "",
}: DashboardQuickActionsProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight text-zinc-950 dark:text-white uppercase font-mono">
              Quick Actions Panel
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              One-click shortcuts to key workflows
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Action 1: Launch New Scan */}
        <Link
          href="/dashboard/search"
          className="group relative overflow-hidden rounded-xl border border-[#ff4500]/30 bg-gradient-to-br from-[#ff4500]/10 via-[#ff4500]/5 to-transparent p-4 transition-all hover:border-[#ff4500] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff4500] text-white shadow-[0_2px_10px_rgba(255,69,0,0.3)]">
              <Search className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-[#ff4500] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h5 className="mt-3 text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-white">
            Start Live Scan
          </h5>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Mine Reddit posts & comments
          </p>
        </Link>

        {/* Action 2: View Latest Report */}
        <Link
          href={latestReportId ? `/dashboard/reports/${latestReportId}` : "/dashboard/reports"}
          className="group rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:border-black/20 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/60"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h5 className="mt-3 text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-white">
            Latest Dossier
          </h5>
          <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-1 dark:text-zinc-400">
            {latestReportKeyword ? `"${latestReportKeyword}"` : "View all saved reports"}
          </p>
        </Link>

        {/* Action 3: Jump to Top Opportunity */}
        <Link
          href={
            topOpportunityReportId
              ? `/dashboard/reports/${topOpportunityReportId}`
              : "/dashboard/reports"
          }
          className="group rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:border-black/20 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/60"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h5 className="mt-3 text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-white">
            #1 Opportunity
          </h5>
          <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-1 dark:text-zinc-400">
            {topOpportunityTitle || "Highest-scored friction point"}
          </p>
        </Link>

        {/* Action 4: Explore Pre-Mined Niches */}
        <Link
          href="/niches"
          className="group rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:border-black/20 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/60"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Compass className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h5 className="mt-3 text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-white">
            Pre-Mined Niches
          </h5>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Curated industry intelligence
          </p>
        </Link>
      </div>
    </div>
  );
}
