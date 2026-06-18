"use client";

import { Check, Flame, MessageSquare, Sparkles, TrendingUp, Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function GoldMine() {
  return (
    <section
      id="features"
      className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 pt-32 pb-24 sm:px-6"
    >
      {/* Header */}
      <div className="mb-16 max-w-4xl text-center">
        <h2 className="mb-4 text-[11px] font-extrabold tracking-widest text-[#ff4500] uppercase">
          THE SOURCE OF TRUTH
        </h2>
        <h3 className="mb-6 text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-zinc-950 sm:text-[48px] md:text-[54px] lg:text-[56px] text-balance">
          The world's largest <span className="text-[#ff4500]">focus group</span> for SaaS ideas
        </h3>
        <p className="mx-auto max-w-2xl text-[16px] font-medium text-zinc-500 md:text-[18px]">
          Reddit is where users go to vent and complain. ThreddIQ is where founders go to listen, validate, and build products with guaranteed market pull.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="mb-24 grid w-full max-w-5xl grid-cols-1 gap-y-8 gap-x-12 rounded-[24px] border border-black/[0.04] bg-white/60 backdrop-blur-md p-8 shadow-xs sm:grid-cols-3 md:p-10">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[32px] font-extrabold tracking-tight text-zinc-950 md:text-[36px]">2B+</span>
          <span className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Intent comments parsed</span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:border-l sm:border-zinc-200/60 sm:pl-10">
          <span className="text-[32px] font-extrabold tracking-tight text-zinc-950 md:text-[36px]">120K+</span>
          <span className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Target subreddits monitored</span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:border-l sm:border-zinc-200/60 sm:pl-10">
          <span className="text-[32px] font-extrabold tracking-tight text-zinc-950 md:text-[36px]">650+</span>
          <span className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Validated indie validation reports</span>
        </div>
      </div>

      {/* Staggered Storyboard Features */}
      <div className="w-full max-w-5xl space-y-28 md:space-y-36">
        
        {/* Row 1: Left Text, Right Visual (Niche Discovery) */}
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12">
          <div className="flex flex-col items-start md:col-span-5 md:pr-4">
            <span className="mb-2 text-[10px] font-extrabold text-[#ff4500] uppercase tracking-widest">01 / DISCOVER</span>
            <h4 className="mb-4 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
              Uncover Real Problems
            </h4>
            <p className="mb-6 text-sm font-medium text-zinc-500 leading-relaxed">
              We monitor target communities for high-intent frustration markers. Find what developers, marketers, and solopreneurs are actively struggling to build workarounds for.
            </p>
            <ul className="space-y-2 text-xs font-bold text-zinc-700">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Automated subreddit crawling</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Intent keyword clustering</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Noise & spam filtration</span>
              </li>
            </ul>
          </div>
          <div className="md:col-span-7 w-full flex justify-center">
            {/* Visual: Sentiment Heatmap Widget */}
            <div className="w-full max-w-[480px] rounded-2xl border border-black/[0.05] bg-white/70 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-black/[0.04] pb-3 mb-4">
                <span className="text-[11px] font-bold text-zinc-900 uppercase">Subreddit Frustration Density</span>
                <span className="text-[9px] font-bold text-zinc-400">Weekly updates</span>
              </div>
              <div className="space-y-3.5">
                {[
                  { sub: "r/SaaS", level: 92, status: "Critical" },
                  { sub: "r/indiehackers", level: 78, status: "Elevated" },
                  { sub: "r/productivity", level: 86, status: "Critical" },
                  { sub: "r/marketing", level: 64, status: "Moderate" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-20 text-[11px] font-bold text-zinc-700">{item.sub}</span>
                    <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden flex items-center">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-[#ff4500] rounded-full" 
                        style={{ width: `${item.level}%` }}
                      ></div>
                    </div>
                    <span className={`w-14 text-right text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      item.status === "Critical" ? "bg-red-50 text-red-500" : item.status === "Elevated" ? "bg-amber-50 text-amber-600" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Right Text, Left Visual (Live Alerts Stream) */}
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12">
          <div className="order-2 md:order-1 md:col-span-7 w-full flex justify-center">
            {/* Visual: Live Webhook Alerts */}
            <div className="w-full max-w-[480px] rounded-2xl border border-black/[0.05] bg-white/70 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-black/[0.04] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                  <span className="text-[11px] font-bold text-zinc-900 uppercase">Live Webhook Feed</span>
                </div>
                <span className="text-[9px] font-bold text-[#ff4500] animate-pulse">Connection: Active</span>
              </div>
              
              <div className="space-y-3">
                {/* Alert Item */}
                <div className="border border-[#ff4500]/10 bg-[#ff4500]/[0.02] p-3.5 rounded-xl flex items-start gap-3">
                  <div className="flex-none rounded-lg bg-[#ff4500]/10 p-1.5 text-[#ff4500]">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-900">Alert Triggered in r/SaaS</span>
                      <span className="text-[8px] font-semibold text-zinc-400">2 min ago</span>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-600 mt-1 truncate">
                      "...spending 6 hours manually mapping custom Stripe enterprise contracts..."
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-red-50 text-red-500 px-1.5 py-0.5 rounded text-[8px] font-bold">Severity: 94%</span>
                      <span className="text-[8px] font-semibold text-zinc-500">Action: Extracted Concept</span>
                    </div>
                  </div>
                </div>

                {/* Normal Webhook Output */}
                <div className="border border-black/5 bg-zinc-50/50 p-3.5 rounded-xl flex items-start gap-3 opacity-60">
                  <div className="flex-none rounded-lg bg-zinc-200 p-1.5 text-zinc-500">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-900">Comment Scanned in r/productivity</span>
                      <span className="text-[8px] font-semibold text-zinc-400">12 min ago</span>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-500 mt-1 truncate">
                      "...need a cheap tool to output client reporting stats..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 flex flex-col items-start md:col-span-5 md:pl-4">
            <span className="mb-2 text-[10px] font-extrabold text-[#ff4500] uppercase tracking-widest">02 / MONITOR</span>
            <h4 className="mb-4 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
              Live Slack & Webhook Alerts
            </h4>
            <p className="mb-6 text-sm font-medium text-zinc-500 leading-relaxed">
              Don't wait around for manual research. Get notified the second a user complains about an issue in your target subreddits, allowing you to reach out when pain is fresh.
            </p>
            <ul className="space-y-2 text-xs font-bold text-zinc-700">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Instant Slack, Discord & Webhook alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Custom keyword configuration triggers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Direct links to original threads</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Row 3: Left Text, Right Visual (Data-Driven Validation) */}
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12">
          <div className="flex flex-col items-start md:col-span-5 md:pr-4">
            <span className="mb-2 text-[10px] font-extrabold text-[#ff4500] uppercase tracking-widest">03 / VALIDATE</span>
            <h4 className="mb-4 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
              Opportunity Scoreboard
            </h4>
            <p className="mb-6 text-sm font-medium text-zinc-500 leading-relaxed">
              We translate comments into concrete SaaS opportunities. Review market intensity scores, pricing suggestions, and validation checkpoints before writing a single line of code.
            </p>
            <ul className="space-y-2 text-xs font-bold text-zinc-700">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Product concept scaffolding</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Desperation scoring engine</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#ff4500] shrink-0" />
                <span>Competitor mention counting</span>
              </li>
            </ul>
          </div>
          <div className="md:col-span-7 w-full flex justify-center">
            {/* Visual: Opportunity Scoreboard Table */}
            <div className="w-full max-w-[480px] rounded-2xl border border-black/[0.05] bg-white/70 p-5 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/[0.04] pb-3 mb-3">
                <span className="text-[11px] font-bold text-zinc-900 uppercase">Opportunity Scoreboard</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.03] text-[9px] font-bold text-zinc-400 uppercase">
                      <th className="py-2">SaaS Niche</th>
                      <th className="py-2 text-center">Score</th>
                      <th className="py-2 text-right">Value Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.02]">
                    {[
                      { niche: "Billing middleware", score: "94/100", tag: "$99/mo" },
                      { niche: "Micro Rank Tracker", score: "78/100", tag: "$15/mo" },
                      { niche: "PDF Reporting engine", score: "96/100", tag: "$49/mo" },
                    ].map((row, idx) => (
                      <tr key={idx} className="text-[11px] font-semibold text-zinc-700">
                        <td className="py-2.5 font-bold text-zinc-800">{row.niche}</td>
                        <td className="py-2.5 text-center text-[#ff4500]">{row.score}</td>
                        <td className="py-2.5 text-right font-mono">{row.tag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
