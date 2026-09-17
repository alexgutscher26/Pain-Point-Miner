"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const SEARCH_DRAFT_STORAGE_KEY = "threddiq-search-draft-v1";

const QUICK_TAGS = [
  { label: "HubSpot Churn", query: "hubspot alternative pricing" },
  { label: "Stripe Billing Gaps", query: "stripe invoice reconciliation custom" },
  { label: "Ahrefs Price Jump", query: "ahrefs too expensive rank tracker" },
  { label: "Notion Lag", query: "notion slow database offline" },
];

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

  const executeSearch = (queryText: string) => {
    const query = queryText.trim();
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

  const handleHeroSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executeSearch(keyword);
  };

  return (
    <section className="relative mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 pt-32 pb-16 sm:px-6 sm:pt-44 sm:pb-24">
      {/* Background warm radial aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="h-[500px] w-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.06),transparent_70%)] blur-2xl" />
      </div>

      <div className="flex max-w-[820px] flex-col items-center text-center">
        {/* Live Signal Badge */}
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4500]" />
          </div>
          <span className="font-mono text-[11px] font-medium tracking-tight text-zinc-500 uppercase dark:text-zinc-400">
            Live Feed
          </span>
          <span className="h-3 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
          <span>
            <strong className="font-semibold text-zinc-900 dark:text-white">
              {painPointCount}
            </strong>{" "}
            active buyer pain points mined across 1,240+ subreddits
          </span>
        </div>

        {/* Editorial Headline */}
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl lg:text-[64px] lg:leading-[1.08] dark:text-white">
          Find what your competitors' customers hate—
          <span className="block bg-gradient-to-r from-[#ff4500] via-[#ea580c] to-[#c2410c] bg-clip-text text-transparent">
            and build what they'll pay for.
          </span>
        </h1>

        {/* Subtitle geared towards Founders, Product Leads & Marketers */}
        <p className="mb-9 max-w-[640px] text-lg leading-relaxed font-normal text-zinc-600 sm:text-xl dark:text-zinc-300">
          Stop guessing your next roadmap item or marketing angle. ThreddIQ mines
          thousands of unfiltered Reddit complaints to surface verified churn signals,
          pricing willingness, and exact customer words.
        </p>

        {/* Tactile Search Bar */}
        <form
          onSubmit={handleHeroSubmit}
          className="mb-4 w-full max-w-[620px]"
        >
          <div className="relative flex w-full flex-col gap-2 rounded-2xl border border-zinc-300/90 bg-white/95 p-2 shadow-xl shadow-zinc-900/5 backdrop-blur-xl transition-all duration-300 focus-within:border-[#ff4500] focus-within:ring-4 focus-within:ring-[#ff4500]/10 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full dark:border-zinc-800 dark:bg-zinc-900/95">
            <div className="flex h-10 w-auto flex-none items-center pr-2 pl-3 text-zinc-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search competitor, niche, or pain point (e.g. HubSpot, invoicing, CRM)..."
              className="w-full min-w-0 flex-1 border-none bg-transparent px-2 py-2 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-hidden sm:text-base dark:text-white"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="flex h-11 flex-none cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ff4500] px-6 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff4500]/20 transition-all duration-200 hover:bg-[#e03d00] hover:shadow-lg hover:shadow-[#ff4500]/25 active:scale-[0.98]"
            >
              <span>Scan Live Signals</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Quick Tag Suggestion Chips */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="font-mono text-zinc-400">Trending scans:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                setKeyword(tag.query);
                executeSearch(tag.query);
              }}
              className="cursor-pointer rounded-full border border-zinc-200 bg-white px-3 py-1 font-medium text-zinc-700 shadow-2xs transition-all hover:border-[#ff4500]/40 hover:bg-zinc-50 hover:text-[#ff4500] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-[#ff4500]/40 dark:hover:text-[#ff4500]"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Value Reassurance */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
            <span>1 Free sample scan (No credit card)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
            <span>14-day 100% money-back guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
            <span>Direct Reddit thread permalinks</span>
          </div>
        </div>

        {/* Proof Strip */}
        <div className="flex w-full flex-col items-center gap-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
            Trusted by founders and product leaders on
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-85 transition-opacity hover:opacity-100">
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
