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
  Scale,
  CheckSquare,
  Square,
  X,
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
import { SavedFiltersMenu } from "@/components/dashboard/saved-filters-menu";

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

  // Comparison selection state
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleReportSelection = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

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
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Area */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-[#ff4500] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff4500]"></span>
            Investigation Archives
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Research Dossiers
          </h2>
          <p className="mt-1 text-[14px] font-medium text-zinc-500 dark:text-zinc-400">
            Browse, filter, and export all past Reddit mining runs and market
            teardowns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/compare"
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-xs font-bold tracking-wider text-zinc-700 uppercase shadow-xs transition-all hover:border-[#ff4500] hover:text-[#ff4500] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-[#ff4500]"
          >
            <Scale className="h-4 w-4" />
            <span>Comparison Mode</span>
          </Link>
          <Link
            href="/dashboard/search"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff4500] px-5 py-3 font-mono text-xs font-black tracking-wider text-white uppercase shadow-xs transition-all hover:bg-[#e03d00] hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>New Investigation</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
        <SavedFiltersMenu
          currentFilters={{
            days,
            status,
            minScore,
            savedOnly,
            category,
          }}
          onApplyPreset={(preset) => {
            if (preset.days) setDays(preset.days);
            if (preset.status) setStatus(preset.status);
            if (preset.minScore) setMinScore(preset.minScore);
            if (preset.savedOnly) setSavedOnly(preset.savedOnly);
            if (preset.category) setCategory(preset.category);
          }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300 dark:hover:bg-zinc-900">
              <Calendar className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-[#ff4500]" />
              {days === "all" ? "All Time" : `Last ${days} Days`}
              <ChevronRight className="ml-0.5 h-3.5 w-3.5 rotate-90 text-zinc-400 transition-transform group-hover:text-[#ff4500]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Date Range
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-zinc-850 bg-zinc-100" />
            <DropdownMenuRadioGroup value={days} onValueChange={setDays}>
              <DropdownMenuRadioItem
                value="7"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                Last 7 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="30"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                Last 30 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="90"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                Last 90 Days
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="all"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                All Time
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300 dark:hover:bg-zinc-900">
              <Filter className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-[#ff4500]" />
              Status:{" "}
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
              <ChevronRight className="ml-0.5 h-3.5 w-3.5 rotate-90 text-zinc-400 transition-transform group-hover:text-[#ff4500]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Scraper Status
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-zinc-850 bg-zinc-100" />
            <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
              <DropdownMenuRadioItem
                value="all"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                All Statuses
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="completed"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                Completed
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="in-progress"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                In Progress
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300 dark:hover:bg-zinc-900">
              <Star className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-[#ff4500]" />
              Min Score: {minScore}+
              <ChevronRight className="ml-0.5 h-3.5 w-3.5 rotate-90 text-zinc-400 transition-transform group-hover:text-[#ff4500]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Minimum Score
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-zinc-850 bg-zinc-100" />
            <DropdownMenuRadioGroup
              value={minScore}
              onValueChange={setMinScore}
            >
              <DropdownMenuRadioItem
                value="0"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                Any Score
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="50"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                50+
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="70"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                70+
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="85"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                85+ (High Potential)
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300 dark:hover:bg-zinc-900">
              <Star className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-[#ff4500]" />
              {savedOnly === "true" ? "Saved Only" : "All Dossiers"}
              <ChevronRight className="ml-0.5 h-3.5 w-3.5 rotate-90 text-zinc-400 transition-transform group-hover:text-[#ff4500]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <DropdownMenuLabel className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Saved Filter
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-zinc-850 bg-zinc-100" />
            <DropdownMenuRadioGroup
              value={savedOnly}
              onValueChange={setSavedOnly}
            >
              <DropdownMenuRadioItem
                value="false"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                All Dossiers
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="true"
                className="cursor-pointer rounded-lg text-xs font-medium focus:bg-[#ff4500]/10 focus:text-[#ff4500]"
              >
                Saved Only
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto hidden px-3 sm:block">
          <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
            {isInitialLoading
              ? "Counting..."
              : isLoading
                ? "Refreshing..."
                : `${reports.length} Dossiers`}
          </p>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="min-h-[300px] overflow-x-auto">
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
            <table className="w-full min-w-[840px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-500">
                  <th className="w-12 px-3 py-3.5 text-center font-mono text-[10px] font-bold tracking-[0.15em] uppercase">
                    <Scale className="mx-auto h-3.5 w-3.5 text-zinc-400" />
                  </th>
                  <th className="px-6 py-3.5 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                    Investigation
                  </th>
                  <th className="px-6 py-3.5 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                    Created Date
                  </th>
                  <th className="px-6 py-3.5 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                    Pain Points
                  </th>
                  <th className="px-6 py-3.5 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                    Top Score
                  </th>
                  <th className="px-6 py-3.5 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                    Category
                  </th>
                  <th className="px-6 py-3.5 font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right font-mono text-[10px] font-bold tracking-[0.15em] uppercase sm:px-8">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {reports.map((report) => {
                  const isSelected = selectedForCompare.includes(report.id);
                  return (
                    <tr
                      key={report.id}
                      className={`group transition-colors ${
                        isSelected
                          ? "bg-[#ff4500]/5 dark:bg-[#ff4500]/10"
                          : "hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60"
                      }`}
                    >
                      <td className="w-12 px-3 py-4.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleReportSelection(report.id)}
                          className="cursor-pointer text-zinc-400 transition-colors hover:text-[#ff4500]"
                          title={
                            isSelected
                              ? "Deselect for comparison"
                              : "Select for side-by-side comparison"
                          }
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-[#ff4500]" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4.5 sm:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-[#ff4500] dark:border-zinc-800 dark:bg-zinc-950">
                            <Search className="h-4 w-4" />
                          </div>
                          <p className="min-w-0 truncate text-[14px] font-extrabold text-zinc-950 transition-colors group-hover:text-[#ff4500] dark:text-zinc-100">
                            {report.niche}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 sm:px-8">
                        <p className="font-mono text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                          {report.date}
                        </p>
                      </td>
                      <td className="px-6 py-4.5 sm:px-8">
                        <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {report.painPoints} signals
                        </span>
                      </td>
                      <td className="px-6 py-4.5 sm:px-8">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2 py-0.5 font-mono text-[11px] font-black ${
                            report.score >= 80
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {report.score}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 sm:px-8">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-zinc-600 uppercase dark:text-zinc-400">
                            {report.category}
                          </span>
                          {report.saved && (
                            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
                              Saved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 sm:px-8">
                        <div className="flex items-center gap-2">
                          {report.status === "Completed" ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                              <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                                Analyzed
                              </span>
                            </div>
                          ) : report.status === "Failed" ? (
                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                              <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
                              <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                                Failed
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[#ff4500]">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                                Mining
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-right sm:px-8">
                        <Link
                          href={`/dashboard/reports/${report.id}`}
                          className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 font-mono text-[11px] font-bold text-zinc-700 uppercase transition-all hover:border-[#ff4500] hover:bg-[#ff4500] hover:text-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-[#ff4500]"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/40 px-6 py-4 sm:px-8 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <p className="font-mono text-[10px] font-semibold text-zinc-400 uppercase dark:text-zinc-500">
            Showing {reports.length} of {reports.length} investigations
          </p>
          <div className="flex items-center gap-1">
            <PaginationButton
              disabled
              icon={<ChevronLeft className="h-3.5 w-3.5" />}
            />
            <PaginationButton active label="1" />
            <PaginationButton icon={<ChevronRight className="h-3.5 w-3.5" />} />
          </div>
        </div>
      </div>

      {/* Floating Sticky Comparison Bar */}
      {selectedForCompare.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 lg:left-60">
          <div className="animate-in slide-in-from-bottom-5 pointer-events-auto flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/20 text-[#ff4500]">
                <Scale className="h-4 w-4" />
              </div>
              <span className="font-mono text-xs font-bold text-zinc-200">
                {selectedForCompare.length === 1
                  ? "1 report selected (pick 1 more to compare)"
                  : "2 reports selected"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedForCompare.length === 2 ? (
                <Link
                  href={`/dashboard/compare?a=${selectedForCompare[0]}&b=${selectedForCompare[1]}`}
                  className="rounded-xl bg-[#ff4500] px-4 py-2 font-mono text-xs font-black text-white uppercase shadow-sm transition-colors hover:bg-[#e03d00]"
                >
                  Compare Head-to-Head →
                </Link>
              ) : (
                <Link
                  href={`/dashboard/compare?a=${selectedForCompare[0]}`}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 font-mono text-xs font-bold text-zinc-300 uppercase transition-colors hover:text-white"
                >
                  Open Compare Page
                </Link>
              )}

              <button
                type="button"
                onClick={() => setSelectedForCompare([])}
                className="cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsTableSkeleton() {
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <thead>
        <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/40">
          {[
            "Investigation",
            "Created Date",
            "Pain Points",
            "Top Score",
            "Category",
            "Status",
            "Action",
          ].map((label) => (
            <th
              key={label}
              className="px-6 py-3 font-mono text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase sm:px-8"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {["sk1", "sk2", "sk3", "sk4"].map((skId) => (
          <tr key={skId}>
            <td className="px-6 py-4.5 sm:px-8">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg bg-zinc-200/60 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-32 rounded-md bg-zinc-200/60 dark:bg-zinc-800" />
              </div>
            </td>
            <td className="px-6 py-4.5 sm:px-8">
              <Skeleton className="h-4 w-20 rounded-md bg-zinc-200/60 dark:bg-zinc-800" />
            </td>
            <td className="px-6 py-4.5 sm:px-8">
              <Skeleton className="h-4 w-12 rounded-md bg-zinc-200/60 dark:bg-zinc-800" />
            </td>
            <td className="px-6 py-4.5 sm:px-8">
              <Skeleton className="h-6 w-10 rounded-lg bg-zinc-200/60 dark:bg-zinc-800" />
            </td>
            <td className="px-6 py-4.5 sm:px-8">
              <Skeleton className="h-4 w-16 rounded-md bg-zinc-200/60 dark:bg-zinc-800" />
            </td>
            <td className="px-6 py-4.5 sm:px-8">
              <Skeleton className="h-4 w-16 rounded-md bg-zinc-200/60 dark:bg-zinc-800" />
            </td>
            <td className="px-6 py-4.5 text-right sm:px-8">
              <Skeleton className="ml-auto h-8 w-16 rounded-lg bg-zinc-200/60 dark:bg-zinc-800" />
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
      className={`flex h-8 w-8 items-center justify-center font-mono text-[11px] font-bold transition-all ${
        active
          ? "rounded-lg bg-[#ff4500] text-white shadow-2xs"
          : disabled
            ? "cursor-not-allowed text-zinc-300 opacity-40 dark:text-zinc-600"
            : "cursor-pointer rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white"
      }`}
    >
      {icon || label}
    </button>
  );
}
