"use client";

import { Search, Zap, MessageSquare, CheckCircle2 } from "lucide-react";

export function GoldMine() {
  return (
    <section id="features" className="w-full pt-32 pb-24 px-6 flex flex-col items-center bg-[#000]">
      <div className="text-center max-w-4xl mb-12">
        <h2 className="text-[12px] font-extrabold tracking-widest text-[#ff4500] uppercase mb-4">
          WHY REDDIT?
        </h2>
        <h3 className="text-[40px] md:text-[52px] lg:text-[56px] font-extrabold tracking-[-0.02em] text-[#f4f4f5] mb-6 leading-[1.1]">
          Reddit is a <span className="text-[#ff4500]">goldmine</span> for
          <br className="hidden md:block" /> product validation
        </h3>
        <p className="text-[17px] md:text-[19px] text-zinc-400 mt-4 leading-relaxed font-medium mx-auto max-w-[700px]">
          Reddit contains authentic conversations revealing exactly what people
          are struggling with. We help you mine it.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-x-10 lg:gap-x-14 gap-y-8 mb-20 px-8 py-10 rounded-[24px] bg-linear-to-b from-[#1c0c0a] to-[#0f0504] border border-[#ff4500]/10 w-full max-w-[1020px] shadow-2xl">
        <div className="flex items-center gap-6 sm:pr-4">
          <div className="bg-transparent border border-[#ff4500]/20 rounded-xl shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-[50px] h-[50px] text-[#ff4500] drop-shadow-[0_0_15px_rgba(255,69,0,0.5)]"
            >
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.248-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.248 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="text-[28px] md:text-[34px] lg:text-[36px] text-white font-extrabold leading-none tracking-tight">
              2B+
            </div>
            <span className="text-[13px] md:text-[14px] text-zinc-400 font-medium tracking-wide">
              monthly visits
            </span>
          </div>
        </div>
        <div className="w-px h-14 bg-white/[0.08] hidden sm:block"></div>
        <div className="flex flex-col items-start gap-1 w-full sm:w-[200px] sm:pl-6">
          <div className="text-[28px] md:text-[34px] lg:text-[36px] text-white font-extrabold leading-none tracking-tight">
            100K+
          </div>
          <span className="text-[13px] md:text-[14px] text-zinc-400 font-medium tracking-wide">
            active communities
          </span>
        </div>
        <div className="w-px h-14 bg-white/[0.08] hidden sm:block"></div>
        <div className="flex flex-col items-start gap-1 w-full sm:w-[200px] sm:pl-6">
          <div className="text-[28px] md:text-[34px] lg:text-[36px] text-white font-extrabold leading-none tracking-tight">
            52M+
          </div>
          <span className="text-[13px] md:text-[14px] text-zinc-400 font-medium tracking-wide">
            daily active users
          </span>
        </div>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl w-full mb-32">
        {/* Card 1 */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 relative overflow-hidden group hover:border-white/[0.08] transition-colors shadow-2xl">
          <div className="h-44 bg-black rounded-xl border-2 border-white/[0.03] mb-8 p-4 flex flex-col justify-center relative overflow-hidden shadow-inner">
            {/* Mock search interface */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 text-xs w-[120%] -ml-[10%] opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2 mb-3">
                <div className="h-2.5 w-5 rounded-full bg-blue-500"></div>
                <div className="h-2.5 w-16 rounded-full bg-zinc-700"></div>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded mb-2"></div>
              <div className="h-2 w-[85%] bg-zinc-800 rounded"></div>
            </div>

            {/* Tag */}
            <div className="absolute right-4 bottom-4 bg-[#ff4500] px-3.5 py-2 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 shadow-[0_4px_15px_rgba(255,69,0,0.4)] translate-y-2 group-hover:translate-y-0 transition-transform uppercase tracking-wider">
              <Search className="w-3.5 h-3.5" strokeWidth={3} /> Problem
              identified
            </div>
          </div>
          <h3 className="font-extrabold text-[22px] text-white mb-3">
            Identify Frustrations
          </h3>
          <p className="text-[15px] text-zinc-400 leading-relaxed font-medium">
            Scan thousands of recent posts to automatically extract underlying
            problems and common complaints.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 relative overflow-hidden group hover:border-white/[0.08] transition-colors shadow-2xl">
          <div className="h-44 bg-black border-2 border-white/[0.03] rounded-xl mb-8 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            {/* Simple Funnel mockup */}
            <div className="flex flex-col items-center w-full max-w-[140px] transition-transform group-hover:scale-110 duration-500">
              <div className="w-full h-6 bg-zinc-800 rounded-t-lg mb-1.5" />
              <div className="w-[85%] h-5 bg-zinc-700 mb-1.5" />
              <div className="w-[60%] h-12 bg-linear-to-b from-[#ff4500] to-[#cc3700] rounded-b-lg flex items-center justify-center relative shadow-[0_10px_20px_rgba(255,69,0,0.3)]">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-[22px] text-white mb-3">
            Analyze User Language
          </h3>
          <p className="text-[15px] text-zinc-400 leading-relaxed font-medium">
            Organize insights into structured reports showing examples of the
            exact wording users use to describe issues.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 relative overflow-hidden group hover:border-white/[0.08] transition-colors shadow-2xl">
          <div className="h-44 bg-black border-2 border-white/[0.03] rounded-xl mb-8 flex items-center justify-center p-4 shadow-inner">
            {/* Mock message reply */}
            <div className="bg-[#1a1a1a] border border-white/[0.05] rounded-xl p-4 w-full relative z-10 transition-transform group-hover:-translate-y-2 duration-500 shadow-xl">
              <div className="flex gap-2.5 mb-4 items-center">
                <div className="w-5 h-5 rounded bg-zinc-700"></div>
                <div className="h-2 w-24 bg-zinc-700 rounded"></div>
              </div>
              <div className="h-2 w-full bg-zinc-600 rounded mb-2.5" />
              <div className="h-2 w-3/4 bg-zinc-600 rounded mb-5" />
              <div className="flex justify-end">
                <div className="bg-[#ff4500] text-white text-[11px] px-4 py-2 rounded-full flex items-center gap-1.5 font-bold shadow-[0_4px_15px_rgba(255,69,0,0.4)] uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" fill="currentColor" />{" "}
                  Report
                </div>
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-[22px] text-white mb-3">
            Prioritize with Data
          </h3>
          <p className="text-[15px] text-zinc-400 leading-relaxed font-medium">
            Surface the most significant problems with validation signals like
            upvotes, comment volume, and mentions.
          </p>
        </div>
      </div>

      {/* Autopilot Box section */}
      <div className="max-w-[700px] w-full flex flex-col items-center">
        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-[40px] font-extrabold text-white leading-tight">
            Continuous <span className="text-[#ff4500]">Idea Discovery</span>
          </h3>
          <p className="text-zinc-400 text-base md:text-[18px] mt-4 font-medium">
            Turn Reddit into a structured research dataset for your SaaS.
          </p>
        </div>

        <div className="relative w-full rounded-[32px] p-10 md:p-14 flex flex-col items-center bg-[#0a0a0a] border border-white/[0.02] shadow-[inset_0_0_100px_rgba(255,69,0,0.03),0_20px_40px_rgba(0,0,0,0.5)]">
          {/* Subtle background glow */}
          <div className="absolute inset-0 rounded-[32px] bg-linear-to-b from-transparent to-[#ff4500]/5 pointer-events-none blur-sm" />

          <ul className="space-y-4 md:space-y-0 z-10 w-full flex flex-col md:flex-row md:justify-center justify-between gap-6 md:gap-8 mb-10">
            <li className="flex items-center gap-3 text-white font-bold text-[15px]">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2
                  className="w-5 h-5 text-green-500"
                  strokeWidth={3}
                />
              </div>
              Validate ideas faster
            </li>

            <li className="flex items-center gap-3 text-white font-bold text-[15px]">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2
                  className="w-5 h-5 text-green-500"
                  strokeWidth={3}
                />
              </div>
              Discover underserved niches
            </li>

            <li className="flex items-center gap-3 text-white font-bold text-[15px]">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2
                  className="w-5 h-5 text-green-500"
                  strokeWidth={3}
                />
              </div>
              Prioritize features
            </li>
          </ul>

          <div className="flex flex-col items-center z-10 w-full max-w-[340px]">
            <button className="bg-linear-to-b from-[#ff5100] to-[#e63e00] hover:from-[#ff621a] hover:to-[#ff4500] w-full text-white px-8 py-4 rounded-xl font-extrabold text-lg transition-all shadow-[0_0_30px_rgba(255,69,0,0.3)] mb-4">
              Start mining insights
            </button>
            <p className="text-[11px] text-zinc-500 font-bold tracking-[0.2em] uppercase">
              🔥 No Credit Card Required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
