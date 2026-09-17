"use client";

import { Search, Brain, Target, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Steps() {
  const steps = [
    {
      num: "01",
      title: "Select niche or target competitor",
      description:
        "Enter a product category, specific incumbent (e.g. HubSpot, Notion, Stripe), or subreddits like r/SaaS and r/marketing.",
      badge: "Targeting",
      detail: "1,240+ Subreddits Indexed",
    },
    {
      num: "02",
      title: "AI isolates verified friction & budgets",
      description:
        "Our semantic pipeline filters out spam and noise, extracting verbatim complaints, competitor vulnerabilities, and willingness to pay.",
      badge: "Extraction",
      detail: "94.2% Signal Accuracy",
    },
    {
      num: "03",
      title: "Build and market with unfair clarity",
      description:
        "Export opportunity dossiers, grab authentic copy hooks for your landing page, and build features users have already committed budget for.",
      badge: "Execution",
      detail: "Direct CSV / Notion Export",
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-14 flex max-w-[680px] flex-col items-center text-center">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#ff4500] shadow-2xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Execution Pipeline</span>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          From raw Reddit thread to validated roadmap in 3 steps
        </h2>
        <p className="text-base leading-relaxed font-normal text-zinc-600 sm:text-lg dark:text-zinc-300">
          Replace weeks of inconclusive customer interviews with hundreds of
          unprompted, authentic buyer discussions.
        </p>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className="group flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff4500]/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-100 font-mono text-xs font-bold text-zinc-900 group-hover:bg-[#ff4500] group-hover:text-white transition-colors dark:bg-zinc-800 dark:text-white">
                  {step.num}
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  {step.badge}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
                {step.description}
              </p>
            </div>

            <div className="mt-8 border-t border-zinc-100 pt-3 text-[11px] font-mono text-zinc-400 dark:border-zinc-800">
              {step.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
