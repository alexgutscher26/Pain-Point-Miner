"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Radio,
  Sparkles,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  Search,
  Activity,
  Layers,
} from "lucide-react";

export interface ActiveRun {
  id: string;
  scraperId: string;
  scraperName: string;
  keyword: string;
  subreddits: string[];
  status: string;
  startedAt: string;
  postsFetched: number;
  postsMatched: number;
  commentsFetched: number;
  newPainPoints: number;
}

interface ActiveScansResponse {
  activeScansCount: number;
  activeRuns: ActiveRun[];
}

export function ActiveScansIndicator() {
  const [data, setData] = useState<ActiveScansResponse>({
    activeScansCount: 0,
    activeRuns: [],
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchActiveScans = async () => {
    try {
      const res = await fetch("/api/scans/active");
      if (res.ok) {
        const json: ActiveScansResponse = await res.json();
        setData(json);
      }
    } catch {
      // silently ignore polling errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveScans();

    const intervalMs = data.activeScansCount > 0 ? 3500 : 12000;
    const timer = setInterval(fetchActiveScans, intervalMs);

    const handleFocus = () => {
      fetchActiveScans();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
    };
  }, [data.activeScansCount]);

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hasActiveScans = data.activeScansCount > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-all select-none ${
          hasActiveScans
            ? "border-[#ff4500]/40 bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/15 shadow-[0_0_12px_rgba(255,69,0,0.2)]"
            : "border-black/[0.08] bg-white/70 text-zinc-600 hover:border-black/15 hover:bg-white dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-400 dark:hover:bg-zinc-800"
        }`}
        aria-expanded={isOpen}
        title={
          hasActiveScans
            ? `${data.activeScansCount} active scan(s) running`
            : "No active scans currently running"
        }
      >
        {hasActiveScans ? (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4500]"></span>
          </span>
        ) : (
          <span className="h-2 w-2 rounded-full bg-emerald-500 opacity-80" />
        )}

        <span>
          {hasActiveScans
            ? `${data.activeScansCount} ${data.activeScansCount === 1 ? "Active Scan" : "Active Scans"}`
            : "Scanners Idle"}
        </span>

        <ChevronDown
          className={`h-3 w-3 text-zinc-400 transition-transform duration-200 group-hover:text-zinc-600 dark:text-zinc-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-4 shadow-xl backdrop-blur-xl z-50 dark:border-white/15 dark:bg-zinc-900/95">
          <div className="mb-3 flex items-center justify-between border-b border-black/5 pb-2.5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#ff4500]" />
              <span className="font-mono text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                Live Scraper Activity
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                fetchActiveScans();
              }}
              className="flex items-center gap-1 font-mono text-[10px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              title="Refresh scan status"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading ? "animate-spin text-[#ff4500]" : ""}`}
              />
            </button>
          </div>

          {hasActiveScans ? (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {data.activeRuns.map((run) => (
                <div
                  key={run.id}
                  className="rounded-xl border border-black/5 bg-zinc-50/90 p-3 text-left transition-all hover:border-[#ff4500]/30 hover:bg-white dark:border-white/5 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 line-clamp-1 dark:text-zinc-100">
                        {run.scraperName || run.keyword || "Reddit Intelligence Scan"}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                        Keyword: <span className="font-semibold text-zinc-700 dark:text-zinc-300">"{run.keyword}"</span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        run.status === "extracting"
                          ? "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                          : run.status === "clustering"
                            ? "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                            : "bg-[#ff4500]/15 text-[#ff4500] dark:bg-[#ff4500]/20 dark:text-orange-400"
                      }`}
                    >
                      <Radio className="h-2 w-2 animate-pulse" />
                      {run.status}
                    </span>
                  </div>

                  {run.subreddits && run.subreddits.length > 0 && (
                    <div className="mb-2 flex items-center gap-1 overflow-hidden font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                      <Layers className="h-3 w-3 shrink-0 text-zinc-400" />
                      <span className="truncate">
                        {run.subreddits.map((s) => `r/${s}`).join(", ")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-black/5 pt-2 text-[11px] font-mono text-zinc-600 dark:border-white/5 dark:text-zinc-400">
                    <div className="flex items-center gap-3">
                      <span>
                        <strong className="text-zinc-900 dark:text-zinc-200">
                          {run.postsFetched}
                        </strong>{" "}
                        posts
                      </span>
                      <span>
                        <strong className="text-[#ff4500] dark:text-orange-400">
                          {run.newPainPoints}
                        </strong>{" "}
                        insights
                      </span>
                    </div>
                    <Link
                      href="/dashboard/search"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ff4500] hover:underline"
                    >
                      View <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Search className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                All scrapers are currently idle
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                Start a scan to mine pain points from subreddits
              </p>
              <Link
                href="/dashboard/search"
                onClick={() => setIsOpen(false)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#ff4500] px-3.5 py-1.5 font-mono text-[11px] font-bold text-white uppercase shadow-xs transition-colors hover:bg-[#e03d00]"
              >
                <Sparkles className="h-3 w-3" />
                <span>Start New Scan</span>
              </Link>
            </div>
          )}

          <div className="mt-3 border-t border-black/5 pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:border-white/5">
            <span>ThreddIQ Realtime Ingestion</span>
            <Link
              href="/dashboard/health"
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            >
              System Health
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
