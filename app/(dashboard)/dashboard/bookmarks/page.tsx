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
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-6 bg-[#2563eb]"></div>
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#2563eb] uppercase">
              Curated Vault
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-zinc-950 tracking-tight">
            Bookmarked Ideas & Reports
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Access your saved high-signal SaaS opportunities and deep research briefs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 px-5 py-2.5 font-sans text-xs font-semibold text-zinc-700 transition-colors shadow-2xs"
          >
            <BookOpen className="h-4 w-4 text-zinc-400" />
            <span>All Reports</span>
          </Link>
          <Link
            href="/dashboard/search"
            className="flex items-center gap-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] px-5 py-2.5 font-sans text-xs font-bold text-white transition-all shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Search</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved ideas & niches..."
            className="w-full pl-9 pr-4 py-1.5 text-xs font-medium text-zinc-800 bg-zinc-50 border border-zinc-200/80 rounded-xl focus:outline-none focus:border-[#2563eb] transition-colors placeholder:text-zinc-400"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-zinc-900 text-white font-semibold shadow-2xs"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 shadow-2xs animate-pulse"
            >
              <Skeleton className="h-6 w-3/4 bg-zinc-200 rounded" />
              <Skeleton className="h-4 w-1/2 bg-zinc-200 rounded" />
              <div className="pt-4 border-t border-zinc-100 flex justify-between">
                <Skeleton className="h-4 w-20 bg-zinc-200 rounded" />
                <Skeleton className="h-4 w-16 bg-zinc-200 rounded" />
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
          className="py-16 bg-white border border-zinc-200 rounded-2xl"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-[10px] font-bold text-[#2563eb] uppercase tracking-wider font-mono">
                      {report.category || "General SaaS"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveBookmark(report.id, e)}
                      disabled={isUnbookmarking}
                      className="cursor-pointer p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove Bookmark"
                    >
                      {isUnbookmarking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-zinc-900 leading-snug group-hover:text-[#2563eb] transition-colors">
                    {report.niche}
                  </h3>

                  <p className="text-xs text-zinc-500 font-sans">
                    Saved on {report.savedAt || report.date}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-150 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
                      ★ {((report.score || 75) / 10).toFixed(1)}/10
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {report.painPoints} ideas
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] group-hover:translate-x-0.5 transition-transform">
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
