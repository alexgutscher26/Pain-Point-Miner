"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Sparkles } from "lucide-react";

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
    trendingTags.length > 0 ? trendingTags : ["#saas", "#marketing", "#devops"];

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
    <div className="group relative">
      <div className="glass-card relative flex flex-col items-center overflow-hidden rounded-3xl p-12 text-center shadow-xs">
        <div className="relative mb-8">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff4500]/10 bg-[#ff4500]/5 text-[#ff4500] transition-colors duration-500 group-hover:border-[#ff4500]/30">
            <Sparkles className="h-7 w-7" />
          </div>
        </div>

        <h3 className="mb-4 text-3xl leading-none font-black tracking-tighter text-zinc-900">
          Scale your validation with{" "}
          <span className="bg-linear-to-r from-[#ff4500] to-[#ff8c00] bg-clip-text text-transparent italic">
            Reddit Intel
          </span>
        </h3>
        <p className="mb-10 max-w-lg text-[15px] leading-relaxed font-medium text-zinc-500">
          Uncover high-intent pain points and &quot;workarounds&quot; that
          signal profitable SaaS opportunities in minutes, not weeks.
        </p>

        <form
          onSubmit={handleSubmit}
          className="group/search relative w-full max-w-xl"
        >
          <div className="relative flex items-center rounded-full border border-black/[0.08] bg-white/80 p-1.5 pl-3 shadow-xs transition-colors focus-within:border-[#ff4500]/40">
            <span className="shrink-0 pr-2 pl-4 text-zinc-400">
              <Search className="h-5 w-5 transition-colors group-focus-within/search:text-[#ff4500]" />
            </span>
            <input
              className="w-full border-none bg-transparent px-2 py-3.5 text-base font-medium text-zinc-800 placeholder-zinc-400 outline-none focus:ring-0"
              placeholder="Search niche, e.g. 'cold email deliverability'..."
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              required
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-2.5 rounded-full bg-[#ff4500] px-7 py-3.5 font-mono text-[12px] font-black tracking-wider whitespace-nowrap text-white uppercase shadow-xs transition-colors hover:bg-[#e03d00]"
            >
              Begin Analysis{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover/search:translate-x-1" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Trending:
            </p>
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full border border-black/[0.06] bg-white/50 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase transition-colors hover:border-[#ff4500]/25 hover:bg-[#ff4500]/5 hover:text-[#ff4500]"
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
