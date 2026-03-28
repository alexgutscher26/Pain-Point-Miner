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
  Database,
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
          <h2 className="mb-3 text-3xl leading-none font-black tracking-tight text-white">
            Reports History
          </h2>
          <p className="text-sm font-medium text-zinc-400">
            Manage and analyze your past Reddit mining sessions.
          </p>
        </div>
        <Link
          href="/dashboard/search"
          className="group flex items-center justify-center gap-2 border border-[#ff8a57] bg-[#ff4500] px-6 py-3 font-mono text-[12px] font-black tracking-wider text-white uppercase transition-colors hover:bg-[#ff571a] active:scale-95"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          New Search
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 border-2 border-white/15 bg-[#0c0c0c] p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 border border-white/20 bg-[#111] px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-300 uppercase transition-colors outline-none hover:border-white/35 hover:text-white">
              <Calendar className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-[#ff4500]" />
              {days === "all" ? "All Time" : `Last ${days} Days`}
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-[#0c0c0c] text-zinc-400">
            <DropdownMenuLabel className="text-zinc-500">
              Date Range
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuRadioGroup value={days} onValueChange={setDays}>
              <DropdownMenuRadioItem
                value="7"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Last 7 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="30"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Last 30 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="90"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Last 90 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="all"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                All Time
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 border border-white/20 bg-[#111] px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-300 uppercase transition-colors outline-none hover:border-white/35 hover:text-white">
              <Filter className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-[#ff4500]" />
              Status:{" "}
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-[#0c0c0c] text-zinc-400">
            <DropdownMenuLabel className="text-zinc-500">
              Scraper Status
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
              <DropdownMenuRadioItem
                value="all"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                All Statuses
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="completed"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Completed
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="in-progress"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                In Progress
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 border border-white/20 bg-[#111] px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-300 uppercase transition-colors outline-none hover:border-white/35 hover:text-white">
              <Star className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-[#ff4500]" />
              Min Score: {minScore}+
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-[#0c0c0c] text-zinc-400">
            <DropdownMenuLabel className="text-zinc-500">
              Minimum Opportunity Score
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuRadioGroup
              value={minScore}
              onValueChange={setMinScore}
            >
              <DropdownMenuRadioItem
                value="0"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Any Score
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="50"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                50+
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="70"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                70+
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="85"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                85+ (High Potential)
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 border border-white/20 bg-[#111] px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-300 uppercase transition-colors outline-none hover:border-white/35 hover:text-white">
              <Star className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-[#ff4500]" />
              {savedOnly === "true" ? "Saved Only" : "All Reports"}
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-[#0c0c0c] text-zinc-400">
            <DropdownMenuLabel className="text-zinc-500">
              Saved Filter
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuRadioGroup
              value={savedOnly}
              onValueChange={setSavedOnly}
            >
              <DropdownMenuRadioItem
                value="false"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                All Reports
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="true"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Saved Only
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 border border-white/20 bg-[#111] px-4 py-2.5 font-mono text-[11px] font-bold tracking-wide text-zinc-300 uppercase transition-colors outline-none hover:border-white/35 hover:text-white">
              <Filter className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-[#ff4500]" />
              Category: {category === "all" ? "All" : category}
              <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90 opacity-40 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-[#0c0c0c] text-zinc-400">
            <DropdownMenuLabel className="text-zinc-500">
              Category
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuRadioGroup
              value={category}
              onValueChange={setCategory}
            >
              <DropdownMenuRadioItem
                value="all"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                All Categories
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Uncategorized"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Uncategorized
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Product"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Product
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Marketing"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Marketing
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Growth"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Growth
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Operations"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Operations
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="Customer Success"
                className="focus:bg-[#ff4500]/10 focus:text-white"
              >
                Customer Success
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto hidden px-4 sm:block">
          <p className="font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
            {isInitialLoading
              ? "Counting records..."
              : isLoading
                ? "Refreshing records..."
                : `Showing ${reports.length} results`}
          </p>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="overflow-hidden border-2 border-white/15 bg-[#0c0c0c] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="min-h-[300px] overflow-x-hidden">
          {isInitialLoading ? (
            <ReportsTableSkeleton />
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center border border-white/20 bg-zinc-900">
                <Database className="h-8 w-8 text-zinc-700" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black tracking-tight text-white">
                  No investigations found.
                </p>
                <p className="mx-auto max-w-[300px] text-sm font-medium text-zinc-500">
                  Start your first mining session to see high-value SaaS
                  opportunities here.
                </p>
              </div>
              <Link
                href="/dashboard/search"
                className="border border-[#ff4500]/45 px-6 py-2.5 font-mono text-[12px] font-black tracking-widest text-[#ff4500] uppercase transition-colors hover:bg-[#ff4500]/10"
              >
                Start Mining
              </Link>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                    Keyword / Niche
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                    Created Date
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                    Pain Points
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                    Top Score
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                    Category
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                    Status
                  </th>
                  <th className="px-8 py-5 text-right font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="group transition-colors hover:bg-white/2"
                  >
                    <td className="px-8 py-6">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center border border-white/20 bg-[#ff4500]/8 text-[#ff4500]`}
                        >
                          <Search className="h-4 w-4" />
                        </div>
                        <p className="min-w-0 text-[15px] font-black tracking-tight break-words text-white uppercase transition-colors group-hover:text-[#ff4500]">
                          {report.niche}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-zinc-400">
                        {report.date}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white">
                          {report.painPoints}
                        </p>
                        <div className="h-1.5 w-1.5 bg-zinc-700"></div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className={`inline-flex items-center border px-2.5 py-1 font-mono text-[12px] font-black tracking-tighter ${
                          report.score >= 90
                            ? "border-emerald-400/45 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-400/45 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {report.score}/100
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] font-black tracking-widest text-zinc-300 uppercase">
                          {report.category}
                        </span>
                        {report.saved && (
                          <span className="inline-flex items-center border border-emerald-400/45 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                            Saved
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        {report.status === "Completed" ? (
                          <div className="flex items-center gap-2 text-emerald-500">
                            <div className="h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]"></div>
                            <span className="font-mono text-[10px] font-black tracking-widest uppercase">
                              Analyzed
                            </span>
                          </div>
                        ) : report.status === "Failed" ? (
                          <div className="flex items-center gap-2 text-rose-500">
                            <div className="h-2 w-2 bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.65)]"></div>
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
                          className="group/btn border border-white/20 bg-zinc-900 px-5 py-2.5 font-mono text-[11px] font-black tracking-widest text-white uppercase transition-colors hover:border-[#ff8a57] hover:bg-[#ff4500] active:scale-95"
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
        <div className="flex items-center justify-between border-t border-white/10 bg-white/1 px-8 py-6">
          <p className="font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
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
        <tr className="border-b border-white/5 bg-white/2">
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
              className="px-8 py-5 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {Array.from({ length: 6 }).map((_, index) => (
          <tr key={index} className="group">
            <td className="px-8 py-6">
              <div className="flex min-w-0 items-center gap-4">
                <Skeleton className="skeleton-shimmer h-10 w-10 rounded-none border border-white/20 bg-[#ff4500]/8" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="skeleton-shimmer h-5 w-32 rounded-none bg-white/10" />
                  <Skeleton className="skeleton-shimmer h-3 w-20 rounded-none bg-white/8" />
                </div>
              </div>
            </td>
            <td className="px-8 py-6">
              <Skeleton className="skeleton-shimmer h-4 w-24 rounded-none bg-white/8" />
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2">
                <Skeleton className="skeleton-shimmer h-5 w-8 rounded-none bg-white/10" />
                <div className="h-1.5 w-1.5 bg-zinc-800"></div>
                <Skeleton className="skeleton-shimmer h-3 w-12 rounded-none bg-white/8" />
              </div>
            </td>
            <td className="px-8 py-6">
              <Skeleton className="skeleton-shimmer h-8 w-20 rounded-none bg-amber-500/10" />
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2.5">
                <Skeleton className="skeleton-shimmer h-4 w-24 rounded-none bg-white/8" />
                <Skeleton className="skeleton-shimmer h-5 w-14 rounded-none bg-emerald-500/10" />
              </div>
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-2 w-2 animate-pulse rounded-full bg-[#ff4500]/60" />
                <Skeleton className="skeleton-shimmer h-4 w-20 rounded-none bg-white/8" />
              </div>
            </td>
            <td className="px-8 py-6 text-right">
              <div className="flex items-center justify-end gap-3">
                <Skeleton className="skeleton-shimmer h-10 w-28 rounded-none bg-white/8" />
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
      className={`flex h-9 w-9 items-center justify-center border font-mono text-[12px] font-black transition-colors ${
        active
          ? "border-[#ff8a57] bg-[#ff4500] text-white"
          : disabled
            ? "cursor-not-allowed border-white/10 text-zinc-800 opacity-50"
            : "border-white/20 text-zinc-500 hover:border-white/35 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon || label}
    </button>
  );
}
