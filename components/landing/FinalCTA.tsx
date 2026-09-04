"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="flex w-full justify-center px-4 py-20 sm:py-28">
      <div className="relative flex w-full max-w-[1240px] flex-col items-center overflow-hidden rounded-3xl bg-zinc-950 p-8 text-center text-white shadow-2xl sm:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.15),transparent_70%)]" />

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-[#ff4500]">
          Ready to validate your next idea?
        </div>

        <h2 className="mb-6 max-w-[680px] text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
          Start mining Reddit complaints for your next paying SaaS
        </h2>

        <p className="mb-8 max-w-[680px] text-base leading-relaxed text-pretty text-zinc-400 sm:text-lg">
          Join hundreds of founders who validate customer demand, spot
          competitor flaws, and find paying users before writing code.
        </p>

        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/sign-up"
            className="flex items-center justify-center gap-2 rounded-full bg-[#ff4500] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#ff4500]/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#e03d00] active:scale-[0.98]"
          >
            <span>Start free scan</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/niches"
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Explore pre-mined niches
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
