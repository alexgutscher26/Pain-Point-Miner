"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const SEARCH_DRAFT_STORAGE_KEY = "threddiq-search-draft-v1";

export function Hero() {
  const router = useRouter();
  const { data: session } = useSession();
  const [website, setWebsite] = useState("");
  const [variant, setVariant] = useState<"a" | "b">("a");
  const [painPointCount, setPainPointCount] = useState<number | string>("...");

  useEffect(() => {
    // Handle A/B variant selection on client side only to avoid hydration mismatch
    const variantFromStorage = localStorage.getItem("hero-ab-variant");
    const stableVariant =
      variantFromStorage === "a" || variantFromStorage === "b"
        ? (variantFromStorage as "a" | "b")
        : Math.random() > 0.5
          ? "b"
          : "a";

    if (!variantFromStorage) {
      localStorage.setItem("hero-ab-variant", stableVariant);
    }

    setVariant(stableVariant);

    // Fetch live counter
    fetch("/api/stats/pain-points")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setPainPointCount(data.count);
        }
      })
      .catch(() => {
        setPainPointCount(1243); // Fallback
      });
  }, []);

  const handleHeroSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyword = website.trim();
    if (!keyword) return;

    // Save search draft in localStorage
    try {
      localStorage.setItem(
        SEARCH_DRAFT_STORAGE_KEY,
        JSON.stringify({
          keyword,
          subreddits: "",
          customPatterns: "",
          miningDepth: "basic",
          savedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Continue without draft persistence if storage is unavailable.
    }

    if (session) {
      router.push("/dashboard/search");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 pt-40 pb-24 sm:px-6 sm:pt-52 sm:pb-36">
      <div className="flex flex-col items-center text-center max-w-4xl">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/[0.04] bg-white/60 backdrop-blur-xs px-4 py-1.5 text-[12px] font-bold text-zinc-700 shadow-xs">
          <div className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
          </div>
          {painPointCount} pain points mined this week
        </div>

        <h1 className="mb-8 text-[44px] leading-[1.04] font-extrabold tracking-[-0.03em] text-zinc-950 sm:text-[60px] md:text-[68px] lg:text-[76px] text-balance">
          {variant === "a" ? (
            <>
              Discover <span className="text-[#ff4500]">validated</span> SaaS ideas in Reddit comments
            </>
          ) : (
            <>
              Find your next <span className="text-[#ff4500]">profitable idea</span> by listening to user complaints
            </>
          )}
        </h1>

        <p className="mb-10 max-w-[680px] text-[17px] leading-relaxed font-medium text-zinc-650 md:text-[20px]">
          ThreddIQ scans targeted communities in real-time, using semantic filters to isolate noise and surface high-intent problems worth paying to solve.
        </p>

        <form
          onSubmit={handleHeroSubmit}
          className="mb-12 w-full max-w-[560px]"
        >
          <div className="relative flex w-full flex-col gap-2 overflow-hidden rounded-2xl border border-black/[0.05] bg-white/80 backdrop-blur-md p-2 shadow-sm transition-all focus-within:border-zinc-300 focus-within:bg-white sm:flex-row sm:items-center sm:gap-0 sm:rounded-full">
            <div className="flex h-11 w-auto flex-none items-center gap-2 pr-1 pl-4 text-zinc-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="e.g. SEO tools, property management..."
              className="w-full min-w-0 flex-1 border-none bg-transparent px-2 py-2 text-[15px] font-semibold text-zinc-900 placeholder-zinc-400 focus:ring-0 focus:outline-none sm:py-3.5"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
            />
            <button
              type="submit"
              className="flex h-11 flex-none items-center justify-center gap-2 rounded-full bg-[#ff4500] px-7 text-[14px] font-bold text-white transition-all hover:bg-[#e03d00] sm:h-12 sm:w-auto"
            >
              Mine insights <ArrowRight className="ml-0.5 h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Featured In / Badges */}
        <div className="flex flex-col items-center gap-4 border-t border-zinc-200/50 pt-10 w-full max-w-xl">
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Featured on:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="https://www.producthunt.com/products/threddiq?embed=true"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              <img
                suppressHydrationWarning
                alt="ThreddIQ | Product Hunt"
                width="130"
                height="28"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1108630&theme=light"
                className="h-[28px] w-[130px]"
              />
            </a>
            <a
              href="https://startupdirectory.net"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              <img
                suppressHydrationWarning
                src="https://startupdirectory.net/badge/featured-light.svg"
                alt="Featured on Startup Directory"
                width="100"
                height="28"
                className="h-[28px] w-auto"
              />
            </a>
            <a
              href="https://findly.tools/threddiq"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              <img
                suppressHydrationWarning
                src="https://findly.tools/badges/findly-tools-badge-light.svg"
                alt="Featured on Findly"
                width="90"
                height="28"
                className="h-[28px] w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
