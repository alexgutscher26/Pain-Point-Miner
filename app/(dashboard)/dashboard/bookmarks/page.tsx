"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  ArrowUpRight,
  Loader2,
  Search,
  Trash2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

interface SavedReport {
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

export default function BookmarksPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [unbookmarkingId, setUnbookmarkingId] = useState<string | null>(null);

  const fetchSavedReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        days: "all",
        status: "all",
        minScore: "0",
        savedOnly: "true",
        category: selectedCategory,
      });
      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch bookmarks");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast.error("Failed to load saved bookmarks");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchSavedReports();
  }, [fetchSavedReports]);

  async function handleRemoveBookmark(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setUnbookmarkingId(id);
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: false }),
      });
      if (!response.ok) throw new Error("Failed to remove bookmark");
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Removed from bookmarks");
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Unable to remove bookmark");
    } finally {
      setUnbookmarkingId(null);
    }
  }

  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    return r.niche.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const categories = [
    "all",
    ...Array.from(
      new Set(
        reports
          .map((r) => r.category)
          .filter((c) => Boolean(c) && c !== "Uncategorized"),
      ),
    ),
  ];

  return (
    <div className="animate-in fade-in mx-auto w-full max-w-7xl space-y-8 p-4 duration-500 sm:p-6 lg:p-8">
      {/* Header Area */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-6 bg-[#2563eb]"></div>
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#2563eb] uppercase">
              Curated Vault
            </p>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-zinc-950 sm:text-4xl">
            Bookmarked Ideas & Reports
          </h1>
          <p className="mt-1 text-sm font-medium text-zinc-500">
            Access your saved high-signal SaaS opportunities and deep research
            briefs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 font-sans text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
          >
            <BookOpen className="h-4 w-4 text-zinc-400" />
            <span>All Reports</span>
          </Link>
          <Link
            href="/dashboard/search"
            className="flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition-all hover:bg-[#1d4ed8]"
          >
            <Plus className="h-4 w-4" />
            <span>New Search</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-2xs sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved ideas & niches..."
            className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50 py-1.5 pr-4 pl-9 text-xs font-medium text-zinc-800 transition-colors placeholder:text-zinc-400 focus:border-[#2563eb] focus:outline-none"
          />
        </div>

        {categories.length > 1 && (
          <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-zinc-900 font-semibold text-white shadow-2xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Saved Reports */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="animate-pulse space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs"
            >
              <Skeleton className="h-6 w-3/4 rounded bg-zinc-200" />
              <Skeleton className="h-4 w-1/2 rounded bg-zinc-200" />
              <div className="flex justify-between border-t border-zinc-100 pt-4">
                <Skeleton className="h-4 w-20 rounded bg-zinc-200" />
                <Skeleton className="h-4 w-16 rounded bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="No Bookmarks Found"
          description={
            searchQuery
              ? "No saved reports match your search query."
              : "You haven't saved any reports yet. Click 'Bookmark' on any report to save it here for quick access."
          }
          icon="search"
          variant="inline"
          className="rounded-2xl border border-zinc-200 bg-white py-16"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => {
            const isUnbookmarking = unbookmarkingId === report.id;

            return (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 transition-all duration-200 hover:border-[#2563eb]/40 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#2563eb] uppercase">
                      {report.category || "General SaaS"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveBookmark(report.id, e)}
                      disabled={isUnbookmarking}
                      className="cursor-pointer rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      title="Remove Bookmark"
                    >
                      {isUnbookmarking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-serif text-xl leading-snug font-normal text-zinc-900 transition-colors group-hover:text-[#2563eb]">
                    {report.niche}
                  </h3>

                  <p className="font-sans text-xs text-zinc-500">
                    Saved on {report.savedAt || report.date}
                  </p>
                </div>

                <div className="border-zinc-150 mt-6 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-xs font-bold text-amber-600">
                      ★ {((report.score || 75) / 10).toFixed(1)}/10
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {report.painPoints} ideas
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] transition-transform group-hover:translate-x-0.5">
                    <span>View Idea</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
