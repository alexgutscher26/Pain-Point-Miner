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
  const [defaultsHydrated, setDefaultsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateDefaults() {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) return;
        const data = (await response.json()) as {
          minimumOpportunityScore?: number;
        };
        if (cancelled) return;

        const score = data.minimumOpportunityScore;
        if (typeof score === "number") {
          const normalized = Math.max(
            0,
            Math.min(100, Math.round(score)),
          ).toString();
          setMinScore(normalized);
        }
      } catch {
        // Ignore hydration errors and continue with baseline filter defaults.
      } finally {
        if (!cancelled) {
          setDefaultsHydrated(true);
        }
      }
    }

    void hydrateDefaults();
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!defaultsHydrated) return;
    fetchReports();
  }, [fetchReports, defaultsHydrated]);

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

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-[#ff4500]"></div>
            <p className="font-mono text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">
              Investigation Archives
            </p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
            Reports History
          </h2>
          <p className="text-zinc-400 font-medium text-sm">
            Manage and analyze your past Reddit mining sessions.
          </p>
        </div>
        <Link
          href="/dashboard/search"
          className="border border-[#ff8a57] bg-[#ff4500] hover:bg-[#ff571a] text-white px-6 py-3 font-mono font-black text-[12px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-95 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          New Search
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#0c0c0c] p-2 border-2 border-white/15">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-4 py-2.5 bg-[#111] border border-white/20 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/35 transition-colors flex items-center gap-2 group outline-none">
              <Calendar className="w-4 h-4 text-zinc-500 group-hover:text-[#ff4500] transition-colors" />
              {days === "all" ? "All Time" : `Last ${days} Days`}
              <ChevronRight className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 rotate-90" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0c0c0c] border-white/10 text-zinc-400">
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
            <button className="px-4 py-2.5 bg-[#111] border border-white/20 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/35 transition-colors flex items-center gap-2 group outline-none">
              <Filter className="w-4 h-4 text-zinc-500 group-hover:text-[#ff4500] transition-colors" />
              Status:{" "}
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
              <ChevronRight className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 rotate-90" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0c0c0c] border-white/10 text-zinc-400">
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
            <button className="px-4 py-2.5 bg-[#111] border border-white/20 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/35 transition-colors flex items-center gap-2 group outline-none">
              <Star className="w-4 h-4 text-zinc-500 group-hover:text-[#ff4500] transition-colors" />
              Min Score: {minScore}+
              <ChevronRight className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 rotate-90" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0c0c0c] border-white/10 text-zinc-400">
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
            <button className="px-4 py-2.5 bg-[#111] border border-white/20 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/35 transition-colors flex items-center gap-2 group outline-none">
              <Star className="w-4 h-4 text-zinc-500 group-hover:text-[#ff4500] transition-colors" />
              {savedOnly === "true" ? "Saved Only" : "All Reports"}
              <ChevronRight className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 rotate-90" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0c0c0c] border-white/10 text-zinc-400">
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
            <button className="px-4 py-2.5 bg-[#111] border border-white/20 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/35 transition-colors flex items-center gap-2 group outline-none">
              <Filter className="w-4 h-4 text-zinc-500 group-hover:text-[#ff4500] transition-colors" />
              Category: {category === "all" ? "All" : category}
              <ChevronRight className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 rotate-90" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0c0c0c] border-white/10 text-zinc-400">
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

        <div className="ml-auto px-4 hidden sm:block">
          <p className="font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
            {isLoading
              ? "Counting records..."
              : `Showing ${reports.length} results`}
          </p>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="bg-[#0c0c0c] border-2 border-white/15 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="overflow-x-hidden min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-[#ff4500] animate-spin" />
              <p className="font-mono text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Decrypting Archives...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
              <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center border border-white/20">
                <Database className="w-8 h-8 text-zinc-700" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-black text-xl tracking-tight">
                  No investigations found.
                </p>
                <p className="text-zinc-500 text-sm max-w-[300px] font-medium mx-auto">
                  Start your first mining session to see high-value SaaS
                  opportunities here.
                </p>
              </div>
              <Link
                href="/dashboard/search"
                className="px-6 py-2.5 border border-[#ff4500]/45 text-[#ff4500] font-mono font-black text-[12px] uppercase tracking-widest hover:bg-[#ff4500]/10 transition-colors"
              >
                Start Mining
              </Link>
            </div>
          ) : (
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-8 py-5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Keyword / Niche
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Created Date
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Pain Points
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Top Score
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Category
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Status
                  </th>
                  <th className="px-8 py-5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="group hover:bg-white/2 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`w-10 h-10 flex items-center justify-center border border-white/20 bg-[#ff4500]/8 text-[#ff4500]`}
                        >
                          <Search className="w-4 h-4" />
                        </div>
                        <p className="min-w-0 break-words font-black text-white text-[15px] tracking-tight group-hover:text-[#ff4500] transition-colors uppercase">
                          {report.niche}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-zinc-400 text-sm font-medium">
                        {report.date}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-black text-sm">
                          {report.painPoints}
                        </p>
                        <div className="w-1.5 h-1.5 bg-zinc-700"></div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className={`inline-flex items-center px-2.5 py-1 border font-mono text-[12px] font-black tracking-tighter ${
                          report.score >= 90
                            ? "bg-emerald-500/10 border-emerald-400/45 text-emerald-300"
                            : "bg-amber-500/10 border-amber-400/45 text-amber-300"
                        }`}
                      >
                        {report.score}/100
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] font-black uppercase tracking-widest text-zinc-300">
                          {report.category}
                        </span>
                        {report.saved && (
                          <span className="inline-flex items-center px-2 py-0.5 border border-emerald-400/45 bg-emerald-500/10 text-emerald-300 font-mono text-[9px] font-black uppercase tracking-widest">
                            Saved
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        {report.status === "Completed" ? (
                          <div className="flex items-center gap-2 text-emerald-500">
                            <div className="w-2 h-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]"></div>
                            <span className="font-mono text-[10px] font-black uppercase tracking-widest">
                              Analyzed
                            </span>
                          </div>
                        ) : report.status === "Failed" ? (
                          <div className="flex items-center gap-2 text-rose-500">
                            <div className="w-2 h-2 bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.65)]"></div>
                            <span className="font-mono text-[10px] font-black uppercase tracking-widest">
                              Failed
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[#ff4500]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="font-mono text-[10px] font-black uppercase tracking-widest animate-pulse">
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
                          className="px-5 py-2.5 bg-zinc-900 border border-white/20 font-mono text-[11px] font-black text-white uppercase tracking-widest hover:bg-[#ff4500] hover:border-[#ff8a57] transition-colors active:scale-95 group/btn"
                        >
                          <span className="flex items-center gap-2">
                            View Report
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
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
        <div className="px-8 py-6 bg-white/1 border-t border-white/10 flex items-center justify-between">
          <p className="font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
            Showing {reports.length} of {reports.length} reports
          </p>
          <div className="flex items-center gap-1.5">
            <PaginationButton
              disabled
              icon={<ChevronLeft className="w-4 h-4" />}
            />
            <PaginationButton active label="1" />
            <PaginationButton icon={<ChevronRight className="w-4 h-4" />} />
          </div>
        </div>
      </div>
    </div>
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
      className={`w-9 h-9 flex items-center justify-center font-mono text-[12px] font-black transition-colors border ${
        active
          ? "bg-[#ff4500] border-[#ff8a57] text-white"
          : disabled
            ? "border-white/10 text-zinc-800 opacity-50 cursor-not-allowed"
            : "border-white/20 text-zinc-500 hover:text-white hover:bg-white/5 hover:border-white/35"
      }`}
    >
      {icon || label}
    </button>
  );
}
