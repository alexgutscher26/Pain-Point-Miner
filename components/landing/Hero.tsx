"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
} from "lucide-react";
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

    // eslint-disable-next-line
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
      return;
    }

    router.push("/sign-up");
  };

  return (
    <section className="flex w-full flex-col items-center bg-[#0a0a0a] px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20">
      <div className="mb-16 grid w-full max-w-7xl grid-cols-1 items-center gap-12 xl:grid-cols-12">
        {/* Centered Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center xl:col-span-12">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0a0a0a]/50 px-3 py-1.5 text-[13px] font-bold text-zinc-100 shadow-sm">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            {painPointCount} pain points discovered this week
          </div>

          <h1 className="mb-6 inline-block text-center text-[38px] leading-[1.1] font-extrabold tracking-[-0.02em] text-[#f4f4f5] sm:text-[52px] md:text-[68px] lg:text-[76px]">
            {variant === "a" ? (
              <>
                Discover <span className="text-[#ff4500]">validated</span>
                <br />
                software ideas from{" "}
              </>
            ) : (
              <>
                Find your next <span className="text-[#ff4500]">SaaS idea</span>
                <br />
                in the comments of{" "}
              </>
            )}
            <span className="relative mx-1.5 mb-2 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10 px-3 py-1.5 align-middle md:-mt-2 md:rounded-[20px] md:px-4 md:py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8 text-[#ff4500] md:h-11 md:w-11"
              >
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.248-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.248 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
              <span className="mt-0.5 pr-1 text-[#ff4500]">Reddit</span>
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-[700px] text-[16px] leading-relaxed font-medium text-zinc-400 md:text-[20px]">
            ThreddIQ analyzes real conversations to extract underlying problems
            so you can validate ideas and find underserved niches.
          </p>

          <form
            onSubmit={handleHeroSubmit}
            className="mx-auto mb-10 w-full max-w-[560px]"
          >
            <div className="relative flex w-full flex-col items-stretch gap-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 shadow-sm transition-colors focus-within:border-zinc-700 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5">
              <div className="flex h-10 w-auto flex-none items-center gap-2 pr-3 pl-4 text-zinc-400 opacity-80">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="e.g. SEO tools, property management..."
                className="w-full min-w-0 flex-1 border-none bg-transparent px-1 py-2 text-[16px] font-medium text-white placeholder-zinc-500 focus:ring-0 focus:outline-none sm:py-3"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
              <button
                type="submit"
                className="flex h-11 flex-none items-center justify-center gap-2 rounded-full bg-[#7a281c] px-6 text-[15px] font-bold text-[#ff8e75] transition-colors hover:bg-[#8c3123] sm:mr-1 sm:h-12 sm:w-auto"
              >
                Mine insights <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </form>

          {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-90 mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&auto=format&fit=crop",
                ].map((img, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-black relative overflow-hidden"
                    style={{ zIndex: 10 - i }}
                  >
                    <Image
                      src={img}
                      fill
                      className="object-cover"
                      alt="User avatar"
                    />
                  </div>
                ))}
              </div>
              <div className="text-[14px] font-medium text-zinc-400 tracking-wide mt-0.5">
                Loved by{" "}
                <span className="font-bold text-white tracking-normal">
                  616+
                </span>{" "}
                founders & marketers
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Video Section centered below */}
      <div className="relative flex w-full justify-center py-10 sm:py-16">
        {/* Floating Badges Left */}
        <div className="absolute top-1/2 left-8 z-0 hidden -translate-y-1/2 flex-col gap-12 xl:flex">
          {[1, 2, 3].map((i) => (
            <div
              key={`left-${i}`}
              className={`flex items-center gap-2 rounded-full border border-white/5 bg-[#111] px-3 py-2 shadow-lg ${i === 2 ? "ml-8" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-[#ff4500]"
              >
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.248-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.248 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
              <div className="flex w-12 flex-col gap-1">
                <div className="h-1 w-full rounded-full bg-zinc-700"></div>
                <div className="h-1 w-2/3 rounded-full bg-zinc-800"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Badges Right */}
        <div className="absolute top-1/2 right-8 z-0 hidden -translate-y-1/2 flex-col gap-16 xl:flex">
          {[1, 2, 3].map((i) => (
            <div
              key={`right-${i}`}
              className={`flex items-center gap-2 rounded-full border border-white/5 bg-[#111] px-3 py-2 shadow-lg ${i === 2 ? "mr-8 self-end" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-[#ff4500]"
              >
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.248-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.248 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
              <div className="flex w-12 flex-col gap-1">
                <div className="h-1 w-full rounded-full bg-zinc-700"></div>
                <div className="h-1 w-2/3 rounded-full bg-zinc-800"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[900px] flex-1">
          {/* Drawn Arrow and Text */}
          <div className="absolute -top-10 right-4 hidden items-center gap-2 sm:flex md:right-12">
            <svg
              width="60"
              height="40"
              viewBox="0 0 60 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mt-4"
            >
              <path
                d="M58 2C45 5 25 15 5 35M5 35C12 33 18 35 22 40M5 35C2 28 -1 20 2 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-500"
              />
            </svg>
            <span className="-mt-6 font-serif text-zinc-400 italic md:text-lg">
              Product demo
            </span>
          </div>

          {/* Video Container */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#050505] p-2 shadow-2xl md:p-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#111] shadow-inner">
              <iframe
                src="https://share.descript.com/embed/A0At69QCEAQ"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                title="ThreddIQ Product Demo"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
