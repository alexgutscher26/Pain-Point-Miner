"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Sparkles } from "lucide-react";

const SEARCH_DRAFT_STORAGE_KEY = "rpp-search-draft-v1";

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
    <div className="relative group">
      <div className="relative overflow-hidden border-2 border-white/15 bg-[#0c0c0c] p-12 flex flex-col items-center text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

        <div className="relative mb-8">
          <div className="relative w-14 h-14 bg-[#0a0a0a] flex items-center justify-center text-[#ff4500] border border-[#ff4500]/45 shadow-[2px_2px_0px_0px_rgba(255,69,0,0.35)] group-hover:border-[#ff4500] transition-colors duration-500">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>

        <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">
          Scale your validation with{" "}
          <span className="bg-linear-to-r from-[#ff4500] to-[#ff8c00] bg-clip-text text-transparent italic">
            Reddit Intel
          </span>
        </h3>
        <p className="text-zinc-500 max-w-lg mb-10 text-[15px] font-medium leading-relaxed">
          Uncover high-intent pain points and &quot;workarounds&quot; that
          signal profitable SaaS opportunities in minutes, not weeks.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl relative group/search"
        >
          <div className="relative flex items-center bg-[#111] border-2 border-white/20 p-1.5 focus-within:border-[#ff4500]/70 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)]">
            <span className="pl-4 pr-2 text-zinc-500 shrink-0">
              <Search className="w-5 h-5 group-focus-within/search:text-[#ff4500] transition-colors" />
            </span>
            <input
              className="w-full bg-transparent border-none text-white px-2 py-3.5 focus:ring-0 outline-none text-base font-medium placeholder-zinc-700"
              placeholder="Search niche, e.g. 'cold email deliverability'..."
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              required
            />
            <button
              type="submit"
              className="shrink-0 whitespace-nowrap border border-[#ff8a57] bg-[#ff4500] hover:bg-[#ff571a] text-white px-7 py-3.5 font-mono font-black text-[12px] uppercase tracking-wider transition-colors flex items-center gap-2.5"
            >
              Begin Analysis{" "}
              <ArrowRight className="w-4 h-4 group-hover/search:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <p className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Trending:
            </p>
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="border border-white/10 px-2 py-1 font-mono text-[10px] font-bold text-zinc-400 hover:text-white hover:border-[#ff4500]/70 transition-colors uppercase tracking-widest"
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
