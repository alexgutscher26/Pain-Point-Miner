"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function FinalCTA() {
  return (
    <section className="flex w-full justify-center px-4 py-16 sm:py-24">
      <div className="relative flex w-full max-w-[1240px] flex-col items-center overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center text-white shadow-2xl sm:p-16">
        {/* Subtle warm radial ambient glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.18),transparent_70%)]" />

        <div className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-4 py-1.5 text-xs font-semibold text-[#ff4500]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Stop guessing. Start building with validated demand.</span>
        </div>

        <h2 className="relative z-10 mb-6 max-w-[760px] text-3xl font-extrabold tracking-tight text-balance text-white sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Turn competitor complaints into your next high-margin SaaS
        </h2>

        <p className="relative z-10 mb-8 max-w-[620px] text-base leading-relaxed text-pretty text-zinc-300 sm:text-lg">
          Join founders, growth marketers, and product teams who validate
          demand, discover competitor vulnerabilities, and find paying users
          before writing code.
        </p>

        <div className="relative z-10 mb-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="flex items-center justify-center gap-2 rounded-full bg-[#ff4500] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ff4500]/25 transition-all duration-200 hover:bg-[#e03d00] hover:shadow-xl hover:shadow-[#ff4500]/30 active:scale-[0.98]"
          >
            <span>Start Free Scan</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/niches"
            className="flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/90 px-6 py-3.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Browse Pre-Mined Niches
          </Link>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>1 Free instant sample scan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>14-day 100% money-back guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Lifetime access · No subscriptions</span>
          </div>
        </div>
      </div>
    </section>
  );
}
