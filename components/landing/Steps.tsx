"use client";

import { Search, Brain, Target, Sparkles } from "lucide-react";

export function Steps() {
  const steps = [
    {
      num: "1",
      title: "Select your target niche",
      description:
        "Enter keywords or communities like r/SaaS, r/smallbusiness, or r/webdev to pinpoint active buyer conversations.",
      badge: "Targeting",
    },
    {
      num: "2",
      title: "AI extracts and clusters pain points",
      description:
        "Our semantic pipeline filters out spam, isolates repeated workflow hurdles, and quantifies willingness to pay.",
      badge: "Extraction",
    },
    {
      num: "3",
      title: "Ship with confirmed demand",
      description:
        "Review structured opportunity dossiers, export direct buyer leads, and build what customers are already asking for.",
      badge: "Validation",
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-20 sm:px-6 sm:py-28">
      <div className="mb-16 flex max-w-[680px] flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-[#ff4500] dark:border-white/10 dark:bg-zinc-900/60">
          Execution process
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          Validate your SaaS ideas in three simple steps
        </h2>
        <p className="text-base leading-relaxed font-normal text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
          Go from an unproven concept to a backed list of paying customer
          demands in minutes instead of weeks.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
        {/* Step 1 */}
        <div className="group flex flex-col items-start rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xs backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900/70">
          <div className="mb-6 flex w-full items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff4500] text-sm font-bold text-white">
              1
            </div>
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
              Targeting
            </span>
          </div>

          <div className="mb-6 flex h-40 w-full items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-zinc-50 p-4 transition-transform duration-500 group-hover:scale-[1.02] dark:border-white/5 dark:bg-zinc-950">
            <div className="flex w-full max-w-[220px] items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 shadow-xs dark:border-white/10 dark:bg-zinc-900">
              <Search className="h-4 w-4 text-[#ff4500]" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                r/productivity, r/SaaS
              </span>
            </div>
          </div>

          <h3 className="mb-2 text-xl font-bold tracking-tight text-balance text-zinc-950 dark:text-white">
            {steps[0].title}
          </h3>
          <p className="text-sm leading-relaxed text-pretty text-zinc-600 dark:text-zinc-400">
            {steps[0].description}
          </p>
        </div>

        {/* Step 2 */}
        <div className="group flex flex-col items-start rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xs backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900/70">
          <div className="mb-6 flex w-full items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff4500] text-sm font-bold text-white">
              2
            </div>
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
              Extraction
            </span>
          </div>

          <div className="mb-6 flex h-40 w-full flex-col justify-center gap-2 overflow-hidden rounded-lg border border-black/5 bg-zinc-50 p-4 transition-transform duration-500 group-hover:scale-[1.02] dark:border-white/5 dark:bg-zinc-950">
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              High willingness to pay signal detected
            </div>
            <div className="rounded-md border border-[#ff4500]/20 bg-[#ff4500]/10 p-2 text-xs font-medium text-[#ff4500]">
              Competitor churn reason: Pricing & complexity
            </div>
          </div>

          <h3 className="mb-2 text-xl font-bold tracking-tight text-balance text-zinc-950 dark:text-white">
            {steps[1].title}
          </h3>
          <p className="text-sm leading-relaxed text-pretty text-zinc-600 dark:text-zinc-400">
            {steps[1].description}
          </p>
        </div>

        {/* Step 3 */}
        <div className="group flex flex-col items-start rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xs backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900/70">
          <div className="mb-6 flex w-full items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff4500] text-sm font-bold text-white">
              3
            </div>
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
              Validation
            </span>
          </div>

          <div className="mb-6 flex h-40 w-full items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-zinc-50 p-4 transition-transform duration-500 group-hover:scale-[1.02] dark:border-white/5 dark:bg-zinc-950">
            <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5 shadow-xs dark:border-white/10 dark:bg-zinc-900">
              <Target className="h-5 w-5 text-emerald-500" />
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Opportunity Score: 92/100
              </span>
            </div>
          </div>

          <h3 className="mb-2 text-xl font-bold tracking-tight text-balance text-zinc-950 dark:text-white">
            {steps[2].title}
          </h3>
          <p className="text-sm leading-relaxed text-pretty text-zinc-600 dark:text-zinc-400">
            {steps[2].description}
          </p>
        </div>
      </div>
    </section>
  );
}
