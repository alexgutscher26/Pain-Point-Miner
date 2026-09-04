"use client";

import {
  CheckCircle2,
  Flame,
  Sparkles,
  TrendingUp,
  BarChart3,
  Database,
} from "lucide-react";
import Link from "next/link";

export function GoldMine() {
  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-20 sm:px-6 sm:py-28">
      {/* Header */}
      <div className="mb-14 flex max-w-[680px] flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-[#ff4500] dark:border-white/10 dark:bg-zinc-900/60">
          The authentic source of truth
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          The largest unfiltered feedback loop for software builders
        </h2>
        <p className="text-base leading-relaxed font-normal text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
          Reddit is where users go to vent about broken workflows and expensive
          tools. ThreddIQ turns that chatter into validated product
          opportunities.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="mb-20 grid w-full max-w-5xl grid-cols-1 gap-6 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xs backdrop-blur-xl sm:grid-cols-3 sm:p-10 dark:border-white/10 dark:bg-zinc-900/70">
        <div className="flex flex-col items-start gap-1">
          <span className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            48,920+
          </span>
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Pain points extracted
          </span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:border-l sm:border-zinc-200/60 sm:pl-8 dark:sm:border-zinc-800">
          <span className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            1,240+
          </span>
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Niche communities indexed
          </span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:border-l sm:border-zinc-200/60 sm:pl-8 dark:sm:border-zinc-800">
          <span className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            94.2%
          </span>
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Validation signal accuracy
          </span>
        </div>
      </div>

      {/* 2-Column Staggered Feature Showcase */}
      <div className="w-full max-w-5xl space-y-16 sm:space-y-24">
        {/* Row 1: Frustration Density */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col items-start lg:col-span-5 lg:pr-4">
            <span className="mb-2 text-xs font-bold tracking-wider text-[#ff4500] uppercase">
              01 / Discovery
            </span>
            <h3 className="mb-3 text-2xl font-bold tracking-tight text-balance text-zinc-950 sm:text-3xl dark:text-white">
              Frustration Density Scoring
            </h3>
            <p className="mb-6 text-sm leading-relaxed font-normal text-pretty text-zinc-600 sm:text-base dark:text-zinc-400">
              Measure the intensity of customer friction before writing
              software. Our algorithms quantify emotional urgency, workaround
              frequency, and active budget signals.
            </p>
            <div className="space-y-2.5 text-xs font-semibold text-zinc-800 sm:text-sm dark:text-zinc-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Automated subreddit thread clustering</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Filter out bots, memes, and promotions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Verified permalinks to original discussions</span>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center lg:col-span-7">
            <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
              <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/5">
                <span className="text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                  Community Frustration Density
                </span>
                <span className="text-xs text-zinc-400">Live index</span>
              </div>
              <div className="space-y-4">
                {[
                  { sub: "r/SaaS", score: 92, label: "Critical Demand" },
                  { sub: "r/indiehackers", score: 86, label: "High Demand" },
                  {
                    sub: "r/productivity",
                    score: 78,
                    label: "Moderate Demand",
                  },
                  { sub: "r/marketing", score: 94, label: "Critical Demand" },
                ].map((item) => (
                  <div key={item.sub} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {item.sub}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-[#ff4500] transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {item.score}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Competitor Gaps */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="order-2 flex w-full justify-center lg:order-1 lg:col-span-7">
            <div className="w-full max-w-md space-y-3 rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
              <div className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/5">
                <span className="text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                  Competitor Churn Signals
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  Active queries
                </span>
              </div>
              <div className="rounded-xl border border-black/5 bg-zinc-50 p-3 text-xs dark:border-white/5 dark:bg-zinc-900/60">
                <span className="mb-1 block font-bold text-zinc-900 dark:text-white">
                  &ldquo;Stripe Billing is too rigid for custom sales
                  contracts&rdquo;
                </span>
                <span className="text-zinc-500">
                  18 mentions across 4 subreddits this week
                </span>
              </div>
              <div className="rounded-xl border border-black/5 bg-zinc-50 p-3 text-xs dark:border-white/5 dark:bg-zinc-900/60">
                <span className="mb-1 block font-bold text-zinc-900 dark:text-white">
                  &ldquo;Ahrefs pricing changes forced our team off the
                  platform&rdquo;
                </span>
                <span className="text-zinc-500">
                  42 mentions looking for micro rank trackers
                </span>
              </div>
            </div>
          </div>

          <div className="order-1 flex flex-col items-start lg:order-2 lg:col-span-5 lg:pl-4">
            <span className="mb-2 text-xs font-bold tracking-wider text-[#ff4500] uppercase">
              02 / Positioning
            </span>
            <h3 className="mb-3 text-2xl font-bold tracking-tight text-balance text-zinc-950 sm:text-3xl dark:text-white">
              Target Established Competitor Gaps
            </h3>
            <p className="mb-6 text-sm leading-relaxed font-normal text-pretty text-zinc-600 sm:text-base dark:text-zinc-400">
              Do not guess what features incumbents are missing. Listen directly
              to their disgruntled customers asking for focused alternatives.
            </p>
            <div className="space-y-2.5 text-xs font-semibold text-zinc-800 sm:text-sm dark:text-zinc-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Track exact churn reasons and pricing revolts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Identify single feature spin out opportunities</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Direct user outreach with solution prototypes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
