"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Sparkles, Flame } from "lucide-react";

const SEARCH_DRAFT_STORAGE_KEY = "threddiq-search-draft-v1";

type DashboardSearchHeroProps = {
  trendingTags: string[];
};

function normalizeTagToKeyword(tag: string) {
  return tag.replace(/^#/, "").replace(/-/g, " ").trim();
}

export function DashboardSearchHero({
  trendingTags,
}: DashboardSearchHeroProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const visibleTags =
    trendingTags.length > 0
      ? trendingTags
      : ["#cold-email-deliverability", "#hubspot-churn", "#stripe-billing-gaps", "#notion-performance", "#ai-workflow-fatigue"];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedKeyword = keyword.trim();
    if (!cleanedKeyword) return;

    try {
      localStorage.setItem(
        SEARCH_DRAFT_STORAGE_KEY,
        JSON.stringify({
          keyword: cleanedKeyword,
          subreddits: "",
          customPatterns: "",
          miningDepth: "basic",
          savedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Continue without persistence.
    }

    router.push(
      `/dashboard/search?keyword=${encodeURIComponent(cleanedKeyword)}`,
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/50 to-zinc-100/40 p-8 text-center shadow-xs backdrop-blur-md transition-all duration-300 sm:p-12 dark:border-zinc-800 dark:from-zinc-900/90 dark:via-zinc-900/50 dark:to-zinc-950/80">
      {/* Background Subtle Grid Accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] dark:opacity-30" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Signal Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/5 px-3.5 py-1 text-[11px] font-mono font-bold tracking-widest text-[#ff4500] uppercase shadow-2xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Semantic Intent Mining Engine</span>
        </div>

        {/* Title */}
        <h3 className="mb-3 max-w-2xl text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl dark:text-white">
          Extract Unmet Market Needs from{" "}
          <span className="text-[#ff4500]">Reddit Conversations</span>
        </h3>

        {/* Subtitle */}
        <p className="mb-8 max-w-xl text-[14px] leading-relaxed font-medium text-zinc-600 sm:text-[15px] dark:text-zinc-400">
          Scan discussions across thousands of niche subreddits to pinpoint competitor churn triggers, exact customer friction points, and verified willingness to pay.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="group/search relative w-full max-w-2xl"
        >
          <div className="relative flex items-center rounded-2xl border border-zinc-200 bg-white p-2 pl-3 shadow-md shadow-zinc-900/5 transition-all focus-within:border-[#ff4500] focus-within:ring-4 focus-within:ring-[#ff4500]/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
            <span className="shrink-0 pr-2 pl-3 text-zinc-400">
              <Search className="h-5 w-5 transition-colors group-focus-within/search:text-[#ff4500]" />
            </span>
            <input
              className="w-full border-none bg-transparent px-2 py-3 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 dark:text-white"
              placeholder="Search niche, competitor, or problem (e.g. 'cold email deliverability', 'HubSpot pricing')..."
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              required
            />
            <button
              type="submit"
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#ff4500] px-6 py-3 font-mono text-xs font-black tracking-wider text-white uppercase shadow-xs transition-all hover:bg-[#e03d00] hover:shadow-md active:scale-95"
            >
              <span>Scan Radar</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/search:translate-x-1" />
            </button>
          </div>

          {/* Quick Trending Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              <Flame className="h-3 w-3 text-[#ff4500]" />
              <span>Trending Niches:</span>
            </div>
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="cursor-pointer rounded-lg border border-zinc-200/80 bg-white/80 px-2.5 py-1 font-mono text-[10px] font-semibold text-zinc-600 transition-all hover:border-[#ff4500]/40 hover:bg-[#ff4500]/5 hover:text-[#ff4500] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-[#ff4500]/40 dark:hover:text-[#ff4500]"
                onClick={() => setKeyword(normalizeTagToKeyword(tag))}
              >
                {tag}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}

