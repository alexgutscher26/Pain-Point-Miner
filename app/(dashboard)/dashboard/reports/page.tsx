"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Calendar,
  Filter,
  Star,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

interface Report {
  id: string;
  niche: string;
  date: string;
  painPoints: number;
  score: number;
  status: string;
  saved: boolean;
  category: string;
  savedAt: string | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [days, setDays] = useState("30");
  const [status, setStatus] = useState("all");
  const [minScore, setMinScore] = useState("0");
  const [savedOnly, setSavedOnly] = useState("false");
  const [category, setCategory] = useState("all");

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        days,
        status,
        minScore,
        savedOnly,
        category,
      });
      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [days, status, minScore, savedOnly, category]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Real-time polling while active scans exist
  useEffect(() => {
    const hasActiveScans = reports.some(
      (report) => report.status === "In Progress",
    );
    if (!hasActiveScans) return;

    const pollInterval = setInterval(() => {
      fetchReports();
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [reports, fetchReports]);

  const isInitialLoading = isLoading && reports.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      {/* Header Area */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px w-8 bg-[#ff4500]"></div>
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
              Investigation Archives
            </p>
          </div>
          <h2 className="mb-3 text-3xl leading-none font-black tracking-tight text-zinc-900">
            Reports History
          </h2>
          <p className="text-sm font-medium text-zinc-500">
            Manage and analyze your past Reddit mining sessions.
          </p>
        </div>
        <Link
          href="/dashboard/search"
          className="group flex items-center justify-center gap-2 rounded-xl border border-[#ff8a57] bg-[#ff4500] px-6 py-3 font-mono text-[12px] font-black tracking-wider text-white uppercase shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          New Search
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200/50 bg-white/60 p-3 shadow-sm backdrop-blur-md">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 rounded-xl border border-zinc-200/50 bg-white/40 px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white/80 hover:text-zinc-900">
              <Calendar className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-[#ff4500]" />
              {days === "all" ? "All Time" : `Last ${days} Days`}
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200/50 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Date Range
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200/50" />
            <DropdownMenuRadioGroup value={days} onValueChange={setDays}>
              <DropdownMenuRadioItem
                value="7"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Last 7 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="30"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Last 30 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="90"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Last 90 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="all"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                All Time
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 rounded-xl border border-zinc-200/50 bg-white/40 px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white/80 hover:text-zinc-900">
              <Filter className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-[#ff4500]" />
              Status:{" "}
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200/50 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Scraper Status
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200/50" />
            <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
              <DropdownMenuRadioItem
                value="all"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                All Statuses
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="completed"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Completed
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="in-progress"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                In Progress
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 rounded-xl border border-zinc-200/50 bg-white/40 px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white/80 hover:text-zinc-900">
              <Star className="text-zinc-555 h-4 w-4 transition-colors group-hover:text-[#ff4500]" />
              Min Score: {minScore}+
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200/50 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Minimum Opportunity Score
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200/50" />
            <DropdownMenuRadioGroup
              value={minScore}
              onValueChange={setMinScore}
            >
              <DropdownMenuRadioItem
                value="0"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Any Score
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="50"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                50+
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="70"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                70+
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="85"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                85+ (High Potential)
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 rounded-xl border border-zinc-200/50 bg-white/40 px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white/80 hover:text-zinc-900">
              <Star className="text-zinc-555 h-4 w-4 transition-colors group-hover:text-[#ff4500]" />
              {savedOnly === "true" ? "Saved Only" : "All Reports"}
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200/50 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Saved Filter
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200/50" />
            <DropdownMenuRadioGroup
              value={savedOnly}
              onValueChange={setSavedOnly}
            >
              <DropdownMenuRadioItem
                value="false"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                All Reports
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="true"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Saved Only
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 rounded-xl border border-zinc-200/50 bg-white/40 px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white/80 hover:text-zinc-900">
              <Filter className="text-zinc-555 h-4 w-4 transition-colors group-hover:text-[#ff4500]" />
              Category: {category === "all" ? "All" : category}
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200/50 bg-white/95 text-zinc-700 shadow-lg backdrop-blur-md">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Category
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200/50" />
            <DropdownMenuRadioGroup
              value={category}
              onValueChange={setCategory}
            >
              <DropdownMenuRadioItem
                value="all"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                All Categories
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Uncategorized"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Uncategorized
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Product"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Product
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Marketing"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Marketing
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Growth"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Growth
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Operations"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Operations
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Customer Success"
                className="cursor-pointer rounded-lg text-zinc-800 focus:bg-[#ff4500]/10 focus:text-zinc-900"
              >
                Customer Success
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto hidden px-4 sm:block">
          <p className="text-zinc-450 font-mono text-[11px] font-bold tracking-widest uppercase">
            {isInitialLoading
              ? "Counting records..."
              : isLoading
                ? "Refreshing records..."
                : `Showing ${reports.length} results`}
          </p>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/60 shadow-sm backdrop-blur-md">
        <div className="scrollbar-thin min-h-[300px] overflow-x-auto">
          {isInitialLoading ? (
            <ReportsTableSkeleton />
          ) : reports.length === 0 ? (
            <EmptyState
              title="No Investigations Found"
              description="You haven't run any mining sessions yet. Start a scan to uncover SaaS opportunities from Reddit, or explore a preloaded sample report."
              actionLabel="Run First Scan"
              actionHref="/dashboard/search"
              secondaryActionLabel="Explore Sample Demo"
              secondaryActionHref="/dashboard/reports/demo-sample-report-v1"
              icon="reports"
              variant="card"
              className="border-none bg-transparent py-24"
            />
          ) : (
            <table className="w-full min-w-[880px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200/50 bg-white/30">
                  <th className="sticky left-0 z-10 bg-white/95 px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] backdrop-blur-sm">
                    Keyword / Niche
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                    Created Date
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                    Pain Points
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                    Top Score
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                    Category
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                    Status
                  </th>
                  <th className="px-8 py-5 text-right font-mono text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="group transition-all duration-200 hover:bg-white/45"
                  >
                    <td className="sticky left-0 z-10 bg-white/95 px-8 py-6 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] backdrop-blur-sm group-hover:bg-white/95">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/50 bg-white/50 text-[#ff4500] shadow-sm">
                          <Search className="h-4 w-4" />
                        </div>
                        <p className="text-zinc-850 min-w-0 text-[15px] font-black tracking-tight break-words uppercase transition-all duration-200 group-hover:text-[#ff4500]">
                          {report.niche}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-zinc-500">
                        {report.date}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-zinc-800">
                          {report.painPoints}
                        </p>
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-300"></div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[12px] font-black tracking-tighter ${
                          report.score >= 90
                            ? "border-emerald-250 bg-emerald-50 text-emerald-600"
                            : "border-amber-250 bg-amber-50 text-amber-600"
                        }`}
                      >
                        {report.score}/100
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <span className="text-zinc-655 font-mono text-[11px] font-black tracking-widest uppercase">
                          {report.category}
                        </span>
                        {report.saved && (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-black tracking-widest text-emerald-600 uppercase">
                            Saved
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        {report.status === "Completed" ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="font-mono text-[10px] font-black tracking-widest uppercase">
                              Analyzed
                            </span>
                          </div>
                        ) : report.status === "Failed" ? (
                          <div className="flex items-center gap-2 text-rose-600">
                            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                            <span className="font-mono text-[10px] font-black tracking-widest uppercase">
                              Failed
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[#ff4500]">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="animate-pulse font-mono text-[10px] font-black tracking-widest uppercase">
                              Mining...
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/reports/${report.id}`}
                          className="group/btn rounded-xl border border-zinc-200 bg-white px-5 py-2.5 font-mono text-[11px] font-black tracking-widest text-zinc-700 uppercase shadow-sm transition-all duration-300 hover:border-[#ff4500]/60 hover:bg-[#ff4500] hover:text-white active:scale-95"
                        >
                          <span className="flex items-center gap-2">
                            View Report
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                          </span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-zinc-200/50 bg-white/20 px-8 py-6">
          <p className="text-zinc-450 font-mono text-[11px] font-bold tracking-widest uppercase">
            Showing {reports.length} of {reports.length} reports
          </p>
          <div className="flex items-center gap-1.5">
            <PaginationButton
              disabled
              icon={<ChevronLeft className="h-4 w-4" />}
            />
            <PaginationButton active label="1" />
            <PaginationButton icon={<ChevronRight className="h-4 w-4" />} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsTableSkeleton() {
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <thead>
        <tr className="border-b border-zinc-200/50 bg-white/30">
          {[
            "Keyword / Niche",
            "Created Date",
            "Pain Points",
            "Top Score",
            "Category",
            "Status",
            "Actions",
          ].map((label) => (
            <th
              key={label}
              className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-200/50">
        {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((skId) => (
          <tr key={skId} className="group">
            <td className="px-8 py-6">
              <div className="flex min-w-0 items-center gap-4">
                <Skeleton className="skeleton-shimmer h-10 w-10 rounded-xl border border-zinc-200 bg-zinc-200/40" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="skeleton-shimmer h-5 w-32 rounded-xl bg-zinc-200/60" />
                  <Skeleton className="skeleton-shimmer h-3 w-20 rounded-xl bg-zinc-200/40" />
                </div>
              </div>
            </td>
            <td className="px-8 py-6">
              <Skeleton className="skeleton-shimmer h-4 w-24 rounded-xl bg-zinc-200/40" />
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2">
                <Skeleton className="skeleton-shimmer h-5 w-8 rounded-xl bg-zinc-200/60" />
                <div className="h-1.5 w-1.5 bg-zinc-200"></div>
                <Skeleton className="skeleton-shimmer h-3 w-12 rounded-xl bg-zinc-200/40" />
              </div>
            </td>
            <td className="px-8 py-6">
              <Skeleton className="skeleton-shimmer h-8 w-20 rounded-full bg-zinc-200/40" />
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2.5">
                <Skeleton className="skeleton-shimmer h-4 w-24 rounded-xl bg-zinc-200/40" />
                <Skeleton className="skeleton-shimmer h-5 w-14 rounded-full bg-zinc-200/40" />
              </div>
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-2 w-2 rounded-full bg-zinc-200/40" />
                <Skeleton className="skeleton-shimmer h-4 w-20 rounded-xl bg-zinc-200/40" />
              </div>
            </td>
            <td className="px-8 py-6 text-right">
              <div className="flex items-center justify-end gap-3">
                <Skeleton className="skeleton-shimmer h-10 w-28 rounded-xl bg-zinc-200/40" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PaginationButton({
  label,
  icon,
  active = false,
  disabled = false,
}: {
  label?: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center font-mono text-[12px] font-black transition-colors ${
        active
          ? "rounded-xl border border-[#ff8a57] bg-[#ff4500] text-white shadow-sm"
          : disabled
            ? "text-zinc-350 cursor-not-allowed rounded-xl border-zinc-200/40 opacity-40"
            : "rounded-xl border border-zinc-200/60 bg-white text-zinc-500 shadow-sm hover:border-[#ff4500]/40 hover:bg-white hover:text-zinc-800"
      }`}
    >
      {icon || label}
    </button>
  );
}
