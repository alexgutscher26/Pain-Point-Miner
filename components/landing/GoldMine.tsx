/* eslint-disable react/no-unescaped-entities */
"use client";

import { Search, Zap, MessageSquare, CheckCircle2 } from "lucide-react";

export function GoldMine() {
  return (
    <section
      id="features"
      className="flex w-full flex-col items-center bg-[#000] px-6 pt-32 pb-24"
    >
      <div className="mb-12 max-w-4xl text-center">
        <h2 className="mb-4 text-[12px] font-extrabold tracking-widest text-[#ff4500] uppercase">
          The Source of Truth
        </h2>
        <h3 className="mb-6 text-[40px] leading-[1.1] font-extrabold tracking-[-0.02em] text-[#f4f4f5] md:text-[52px] lg:text-[56px]">
          The world's largest{" "}
          <span className="text-[#ff4500]">focus group</span>
          <br className="hidden md:block" /> for SaaS ideas
        </h3>
        <p className="mx-auto mt-4 max-w-[700px] text-[17px] leading-relaxed font-medium text-zinc-400 md:text-[19px]">
          Reddit is where users go to complain. ThreddIQ is where founders go to
          listen and build solutions that have guaranteed demand.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-20 flex w-full max-w-[1020px] flex-col items-center justify-center gap-x-10 gap-y-8 rounded-[24px] border border-[#ff4500]/10 bg-linear-to-b from-[#1c0c0a] to-[#0f0504] px-8 py-10 shadow-2xl sm:flex-row lg:gap-x-14">
        <div className="flex items-center gap-6 sm:pr-4">
          <div className="shrink-0 rounded-xl border border-[#ff4500]/20 bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-[50px] w-[50px] text-[#ff4500] drop-shadow-[0_0_15px_rgba(255,69,0,0.5)]"
            >
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.248-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.248 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="text-[28px] leading-none font-extrabold tracking-tight text-white md:text-[34px] lg:text-[36px]">
              2B+
            </div>
            <span className="text-[13px] font-medium tracking-wide text-zinc-400 md:text-[14px]">
              Intent signals tracked
            </span>
          </div>
        </div>
        <div className="hidden h-14 w-px bg-white/[0.08] sm:block"></div>
        <div className="flex w-full flex-col items-start gap-1 sm:w-[220px] sm:pl-6">
          <div className="text-[28px] leading-none font-extrabold tracking-tight text-white md:text-[34px] lg:text-[36px]">
            100K+
          </div>
          <span className="text-[13px] font-medium tracking-wide text-zinc-400 md:text-[14px]">
            Problem-rich subreddits
          </span>
        </div>
        <div className="hidden h-14 w-px bg-white/[0.08] sm:block"></div>
        <div className="flex w-full flex-col items-start gap-1 sm:w-[220px] sm:pl-6">
          <div className="text-[28px] leading-none font-extrabold tracking-tight text-white md:text-[34px] lg:text-[36px]">
            52M+
          </div>
          <span className="text-[13px] font-medium tracking-wide text-zinc-400 md:text-[14px]">
            People complaining daily
          </span>
        </div>
      </div>

      {/* 3 Cards */}
      <div className="mb-32 grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="group relative overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-white/[0.08]">
          <div className="relative mb-8 flex h-44 flex-col justify-center overflow-hidden rounded-xl border-2 border-white/[0.03] bg-black p-4 shadow-inner">
            {/* Mock search interface */}
            <div className="-ml-[10%] w-[120%] rounded-xl border border-white/5 bg-[#1a1a1a] p-4 text-xs opacity-80 transition-opacity group-hover:opacity-100">
              <div className="mb-3 flex gap-2">
                <div className="h-2.5 w-5 rounded-full bg-blue-500"></div>
                <div className="h-2.5 w-16 rounded-full bg-zinc-700"></div>
              </div>
              <div className="mb-2 h-2 w-full rounded bg-zinc-800"></div>
              <div className="h-2 w-[85%] rounded bg-zinc-800"></div>
            </div>

            {/* Tag */}
            <div className="absolute right-4 bottom-4 flex translate-y-2 items-center gap-1.5 rounded-full bg-[#ff4500] px-3.5 py-2 text-[11px] font-bold tracking-wider text-white uppercase shadow-[0_4px_15px_rgba(255,69,0,0.4)] transition-transform group-hover:translate-y-0">
              <Search className="h-3.5 w-3.5" strokeWidth={3} /> Problem
              identified
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold text-white">
            Niche Problem Discovery
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-400">
            Scan thousands of active threads to automatically extract critical
            frustrations and common complaints.
          </p>
        </div>

        {/* Card 2 */}
        <div className="group relative overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-white/[0.08]">
          <div className="relative mb-8 flex h-44 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-white/[0.03] bg-black shadow-inner">
            {/* Simple Funnel mockup */}
            <div className="flex w-full max-w-[140px] flex-col items-center transition-transform duration-500 group-hover:scale-110">
              <div className="mb-1.5 h-6 w-full rounded-t-lg bg-zinc-800" />
              <div className="mb-1.5 h-5 w-[85%] bg-zinc-700" />
              <div className="relative flex h-12 w-[60%] items-center justify-center rounded-b-lg bg-linear-to-b from-[#ff4500] to-[#cc3700] shadow-[0_10px_20px_rgba(255,69,0,0.3)]">
                <Zap className="h-5 w-5 fill-current text-white" />
              </div>
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold text-white">
            Customer Voice Analysis
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-400">
            Get structured intelligence on how your target market describes
            their specific pain points and needs.
          </p>
        </div>

        {/* Card 3 */}
        <div className="group relative overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-white/[0.08]">
          <div className="mb-8 flex h-44 items-center justify-center rounded-xl border-2 border-white/[0.03] bg-black p-4 shadow-inner">
            {/* Mock message reply */}
            <div className="relative z-10 w-full rounded-xl border border-white/[0.05] bg-[#1a1a1a] p-4 shadow-xl transition-transform duration-500 group-hover:-translate-y-2">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="h-5 w-5 rounded bg-zinc-700"></div>
                <div className="h-2 w-24 rounded bg-zinc-700"></div>
              </div>
              <div className="mb-2.5 h-2 w-full rounded bg-zinc-600" />
              <div className="mb-5 h-2 w-3/4 rounded bg-zinc-600" />
              <div className="flex justify-end">
                <div className="flex items-center gap-1.5 rounded-full bg-[#ff4500] px-4 py-2 text-[11px] font-bold tracking-wider text-white uppercase shadow-[0_4px_15px_rgba(255,69,0,0.4)]">
                  <MessageSquare className="h-3.5 w-3.5" fill="currentColor" />{" "}
                  Report
                </div>
              </div>
            </div>
          </div>
          <h3 className="mb-3 text-[22px] font-extrabold text-white">
            Data-Driven Validation
          </h3>
          <p className="text-[15px] leading-relaxed font-medium text-zinc-400">
            Surface the most significant opportunities using real signal metrics
            like upvotes, volume, and sentiment.
          </p>
        </div>
      </div>

      {/* Autopilot Box section */}
      <div className="flex w-full max-w-[700px] flex-col items-center">
        <div className="mb-8 text-center">
          <h3 className="text-3xl leading-tight font-extrabold text-white md:text-[40px]">
            Unlimited{" "}
            <span className="text-[#ff4500]">Market Intelligence</span>
          </h3>
          <p className="mt-4 text-base font-medium text-zinc-400 md:text-[18px]">
            Turn chaotic Reddit threads into a structured, actionable research
            dataset for your next product.
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center rounded-[32px] border border-white/[0.02] bg-[#0a0a0a] p-10 shadow-[inset_0_0_100px_rgba(255,69,0,0.03),0_20px_40px_rgba(0,0,0,0.5)] md:p-14">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-linear-to-b from-transparent to-[#ff4500]/5 blur-sm" />

          <ul className="z-10 mb-10 flex w-full flex-col justify-between gap-6 space-y-4 md:flex-row md:justify-center md:gap-8 md:space-y-0">
            <li className="flex items-center gap-3 text-[15px] font-bold text-white">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2
                  className="h-5 w-5 text-green-500"
                  strokeWidth={3}
                />
              </div>
              Validate ideas in 60s
            </li>

            <li className="flex items-center gap-3 text-[15px] font-bold text-white">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2
                  className="h-5 w-5 text-green-500"
                  strokeWidth={3}
                />
              </div>
              Identify underserved niches
            </li>

            <li className="flex items-center gap-3 text-[15px] font-bold text-white">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2
                  className="h-5 w-5 text-green-500"
                  strokeWidth={3}
                />
              </div>
              Build exactly what they want
            </li>
          </ul>

          <div className="z-10 flex w-full max-w-[340px] flex-col items-center">
            <button className="mb-4 w-full rounded-xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-8 py-4 text-lg font-extrabold text-white shadow-[0_0_30px_rgba(255,69,0,0.3)] transition-all hover:from-[#ff621a] hover:to-[#ff4500]">
              Start mining insights
            </button>
            <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
              🔥 2-Day Trial With Card
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
