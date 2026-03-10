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
      <div className="absolute inset-0 bg-linear-to-b from-[#ff4500]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[32px] blur-3xl -z-10"></div>
      <div className="relative overflow-hidden rounded-[32px] bg-[#0c0c0c] border border-white/5 p-12 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/15 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4500]/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-[#ff4500]/10 transition-colors duration-1000"></div>

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#ff4500] blur-2xl opacity-20 scale-150 animate-pulse"></div>
          <div className="relative w-14 h-14 bg-[#0a0a0a] rounded-2xl flex items-center justify-center text-[#ff4500] border border-[#ff4500]/30 shadow-[0_0_20px_rgba(255,69,0,0.15)] group-hover:border-[#ff4500] transition-colors duration-500">
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
          <div className="absolute -inset-0.5 bg-linear-to-r from-[#ff4500] to-[#ff8c00] rounded-2xl opacity-0 group-focus-within/search:opacity-10 blur-md transition-opacity duration-500"></div>
          <div className="relative flex items-center bg-[#111] border border-white/10 rounded-2xl p-1.5 focus-within:border-[#ff4500]/30 transition-all shadow-2xl">
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
              className="shrink-0 whitespace-nowrap bg-[#ff4500] hover:bg-[#ff571a] active:scale-[0.98] text-white px-7 py-3.5 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-lg shadow-[#ff4500]/20"
            >
              Begin Analysis{" "}
              <ArrowRight className="w-4 h-4 group-hover/search:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Trending:
            </p>
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
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
