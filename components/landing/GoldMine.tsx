"use client";

import {
  CheckCircle2,
  Database,
} from "lucide-react";

export function GoldMine() {
  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-16 sm:px-6 sm:py-24">
      {/* Header */}
      <div className="mb-14 flex max-w-[720px] flex-col items-center text-center">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#ff4500] shadow-2xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <Database className="h-3.5 w-3.5" />
          <span>The Unfiltered Truth Engine</span>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          Where real buyers explain why they're leaving competitors
        </h2>
        <p className="text-base leading-relaxed font-normal text-zinc-600 sm:text-lg dark:text-zinc-300">
          Reddit isn't just forum discussions—it is the world's most candid
          repository of user frustration, workarounds, and unfulfilled software
          requests.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="mb-16 grid w-full max-w-5xl grid-cols-1 gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl sm:grid-cols-3 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex flex-col items-start gap-1">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            48,920+
          </span>
          <span className="font-mono text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            Pain Points Classified
          </span>
          <span className="text-xs text-zinc-500">
            Filtered for genuine friction & intent
          </span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:border-l sm:border-zinc-200 sm:pl-8 dark:sm:border-zinc-800">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            1,240+
          </span>
          <span className="font-mono text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            Niche Communities Monitored
          </span>
          <span className="text-xs text-zinc-500">
            From r/SaaS to niche industry subreddits
          </span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:border-l sm:border-zinc-200 sm:pl-8 dark:sm:border-zinc-800">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            94.2%
          </span>
          <span className="font-mono text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            Intent Signal Accuracy
          </span>
          <span className="text-xs text-zinc-500">
            Removes noise, spam, and bot posts
          </span>
        </div>
      </div>

      {/* 2-Column Staggered Feature Showcase */}
      <div className="w-full max-w-5xl space-y-16 sm:space-y-20">
        {/* Row 1: Frustration Density */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col items-start lg:col-span-5 lg:pr-4">
            <span className="mb-2 font-mono text-xs font-bold tracking-wider text-[#ff4500] uppercase">
              01 / Discovery & Churn
            </span>
            <h3 className="mb-3 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">
              Frustration Density & Churn Scoring
            </h3>
            <p className="mb-6 text-sm leading-relaxed font-normal text-zinc-600 sm:text-base dark:text-zinc-300">
              Quantify the intensity of customer friction before writing
              software. Our algorithms measure emotional urgency, manual
              workaround frequency, and explicit budget mentions.
            </p>
            <div className="space-y-2.5 text-xs font-semibold text-zinc-800 sm:text-sm dark:text-zinc-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>
                  Automated thread clustering across 1,200+ subreddits
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Filters out bots, memes, and vendor self-promotions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Verified permalinks to original discussions</span>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center lg:col-span-7">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="font-mono text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                  Live Community Frustration Index
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  Real-time scan
                </span>
              </div>
              <div className="space-y-3.5">
                {[
                  {
                    sub: "r/sales",
                    niche: "HubSpot pricing tier jump",
                    density: "94%",
                    growth: "+42%",
                  },
                  {
                    sub: "r/SaaS",
                    niche: "Stripe custom invoicing sync",
                    density: "89%",
                    growth: "+28%",
                  },
                  {
                    sub: "r/indiehackers",
                    niche: "Ahrefs high base seat cost",
                    density: "86%",
                    growth: "+19%",
                  },
                ].map((item) => (
                  <div
                    key={item.niche}
                    className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-950/60"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-zinc-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {item.sub}
                        </span>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                          {item.niche}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-[#ff4500]">
                        {item.density}
                      </span>
                      <span className="block font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                        {item.growth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Customer Voice & Messaging */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="order-2 flex w-full justify-center lg:order-1 lg:col-span-7">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="font-mono text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                  Customer Copy Extraction
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  High Conversion
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
                  <span className="mb-1 block font-mono text-[10px] text-zinc-400 uppercase">
                    Raw User Quote
                  </span>
                  <p className="italic">
                    "I waste 4 hours every Friday copying screenshots across 5
                    dashboards for client decks."
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs text-white">
                  <span className="mb-1 block font-mono text-[10px] text-orange-400 uppercase">
                    Extracted Landing Page Headline
                  </span>
                  <p className="font-bold text-white">
                    "Automated agency KPI slides delivered to your inbox before
                    Friday 5 PM."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 flex flex-col items-start lg:order-2 lg:col-span-5 lg:pl-4">
            <span className="mb-2 font-mono text-xs font-bold tracking-wider text-[#ff4500] uppercase">
              02 / Positioning & Messaging
            </span>
            <h3 className="mb-3 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">
              Customer Voice & Copywriting Goldmine
            </h3>
            <p className="mb-6 text-sm leading-relaxed font-normal text-zinc-600 sm:text-base dark:text-zinc-300">
              High-converting landing pages speak the exact language of
              frustrated users. ThreddIQ automatically extracts the verbatim
              phrasing customers use to describe their pain—giving you instant
              headline and ad copy inspiration.
            </p>
            <div className="space-y-2.5 text-xs font-semibold text-zinc-800 sm:text-sm dark:text-zinc-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Direct verbatim quote extraction</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Pain-to-Headline AI conversion</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff4500]" />
                <span>Angle testing for ads and cold outreach</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
