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
      <div className="relative flex flex-col items-center overflow-hidden border-2 border-white/15 bg-[#0c0c0c] p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

        <div className="relative mb-8">
          <div className="relative flex h-14 w-14 items-center justify-center border border-[#ff4500]/45 bg-[#0a0a0a] text-[#ff4500] shadow-[2px_2px_0px_0px_rgba(255,69,0,0.35)] transition-colors duration-500 group-hover:border-[#ff4500]">
            <Sparkles className="h-7 w-7" />
          </div>
        </div>

        <h3 className="mb-4 text-3xl leading-none font-black tracking-tighter text-white">
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
          <div className="relative flex items-center border-2 border-white/20 bg-[#111] p-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] transition-colors focus-within:border-[#ff4500]/70">
            <span className="shrink-0 pr-2 pl-4 text-zinc-500">
              <Search className="h-5 w-5 transition-colors group-focus-within/search:text-[#ff4500]" />
            </span>
            <input
              className="w-full border-none bg-transparent px-2 py-3.5 text-base font-medium text-white placeholder-zinc-700 outline-none focus:ring-0"
              placeholder="Search niche, e.g. 'cold email deliverability'..."
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              required
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-2.5 border border-[#ff8a57] bg-[#ff4500] px-7 py-3.5 font-mono text-[12px] font-black tracking-wider whitespace-nowrap text-white uppercase transition-colors hover:bg-[#ff571a]"
            >
              Begin Analysis{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover/search:translate-x-1" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              Trending:
            </p>
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="border border-white/10 px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase transition-colors hover:border-[#ff4500]/70 hover:text-white"
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
