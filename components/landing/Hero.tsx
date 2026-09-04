"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const SEARCH_DRAFT_STORAGE_KEY = "threddiq-search-draft-v1";

export function Hero() {
  const router = useRouter();
  const { data: session } = useSession();
  const [keyword, setKeyword] = useState("");
  const [painPointCount, setPainPointCount] = useState<string>("48,920");

  useEffect(() => {
    fetch("/api/stats/pain-points")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setPainPointCount(data.count.toLocaleString());
        }
      })
      .catch(() => {
        setPainPointCount("48,920");
      });
  }, []);

  const handleHeroSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = keyword.trim();
    if (!query) return;

    try {
      localStorage.setItem(
        SEARCH_DRAFT_STORAGE_KEY,
        JSON.stringify({
          keyword: query,
          subreddits: "",
          customPatterns: "",
          miningDepth: "basic",
          savedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Continue without draft persistence
    }

    if (session) {
      router.push("/dashboard/search");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 pt-36 pb-20 sm:px-6 sm:pt-48 sm:pb-28">
      <div className="flex max-w-[680px] flex-col items-center text-center">
        {/* Live Signal Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs backdrop-blur-md dark:bg-zinc-900/80 dark:text-zinc-300">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <span>
            {painPointCount} pain points extracted across 1,240 subreddits
          </span>
        </div>

        {/* Hero Title with Gradient Text */}
        <h1 className="mb-6 bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-600 bg-clip-text text-4xl leading-[1.08] font-bold tracking-tight text-balance text-transparent sm:text-5xl md:text-6xl dark:from-white dark:via-zinc-200 dark:to-zinc-500">
          Find paying SaaS ideas hidden in Reddit complaints
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-lg leading-relaxed font-normal text-pretty text-zinc-600 sm:text-xl dark:text-zinc-300">
          Stop building features users ignore. ThreddIQ analyzes real customer
          frustrations, willingness to pay, and competitor gaps to uncover
          validated demand before you code.
        </p>

        {/* Interactive Search Bar */}
        <form onSubmit={handleHeroSubmit} className="mb-6 w-full max-w-[560px]">
          <div className="relative flex w-full flex-col gap-2 rounded-2xl border border-black/10 bg-white/90 p-2 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 focus-within:border-[#ff4500]/50 focus-within:ring-2 focus-within:ring-[#ff4500]/20 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full dark:bg-zinc-900/90">
            <div className="flex h-10 w-auto flex-none items-center pr-2 pl-3 text-zinc-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search niche (e.g. accounting, dev tools, hiring)..."
              className="w-full min-w-0 flex-1 border-none bg-transparent px-2 py-2 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-hidden sm:text-base dark:text-white"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="flex h-11 flex-none cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ff4500] px-5 py-2 text-base font-semibold text-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#e03d00] active:scale-[0.98]"
            >
              <span>Start free scan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Reassurance list */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Instant AI clustering</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Direct Reddit source links</span>
          </div>
        </div>

        {/* Proof Strip */}
        <div className="flex w-full flex-col items-center gap-3 border-t border-zinc-200/60 pt-8 dark:border-zinc-800">
          <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            Recognized by founders on
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-80 transition-opacity hover:opacity-100">
            <a
              href="https://www.producthunt.com/products/threddiq?embed=true"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                suppressHydrationWarning
                alt="ThreddIQ | Product Hunt"
                width="130"
                height="28"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1108630&theme=light"
                className="h-7 w-auto"
              />
            </a>
            <a
              href="https://startupdirectory.net"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                suppressHydrationWarning
                src="https://startupdirectory.net/badge/featured-light.svg"
                alt="Featured on Startup Directory"
                width="100"
                height="28"
                className="h-7 w-auto"
              />
            </a>
            <a
              href="https://findly.tools/threddiq"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img
                suppressHydrationWarning
                src="https://findly.tools/badges/findly-tools-badge-light.svg"
                alt="Featured on Findly"
                width="90"
                height="28"
                className="h-7 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
