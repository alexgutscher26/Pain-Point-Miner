"use client";

import {
  Bot,
  Shield,
  Bell,
  Target,
  Activity,
  MessageSquare,
} from "lucide-react";

export function Toolkit() {
  return (
    <section className="flex w-full flex-col items-center bg-[#000] px-6 py-32">
      <div className="mb-24 max-w-2xl text-center">
        <h2 className="mb-6 text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
          FEATURES
        </h2>
        <h3 className="mb-6 text-[40px] leading-tight font-extrabold tracking-tight text-white md:text-[56px]">
          Your complete <span className="text-[#ff4500]">Reddit research</span>{" "}
          toolkit
        </h3>
        <p className="text-[18px] leading-relaxed font-medium text-zinc-400">
          Everything you need to validate SaaS ideas by analyzing data from
          Reddit.
        </p>
      </div>

      <div className="mb-32 grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column (Feature list) - taking up 5 columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:col-span-5">
          {([
            {
              icon: <Target className="h-5 w-5 text-indigo-400" />,
              title: "Keyword Targeting",
              desc: "Monitor specific niche terms",
            },
            {
              icon: <Bot className="h-5 w-5 text-amber-500" />,
              title: "AI Problem Extraction",
              desc: "Find underlying frustrations",
            },
            {
              icon: <Shield className="h-5 w-5 text-emerald-400" />,
              title: "Demand Signals",
              desc: "Validate by upvotes & volume",
            },
            {
              icon: <MessageSquare className="h-5 w-5 text-sky-400" />,
              title: "Language Analysis",
              desc: "See exact user phrasing",
            },
            {
              icon: <Bell className="h-5 w-5 text-[#ff4500]" />,
              title: "Niche Discovery",
              desc: "Uncover underserved topics",
            },
            {
              icon: <Activity className="h-5 w-5 text-fuchsia-400" />,
              title: "Trend Analytics",
              desc: "Track complaint frequencies",
            },
          ] as const).map((feature) => (
            <div key={feature.title} className="flex flex-col items-start gap-4">
              <div className="rounded-lg border border-white/[0.05] bg-[#0f0f0f] p-2.5 shadow-inner">
                {feature.icon}
              </div>
              <div>
                <h4 className="mb-1.5 text-[17px] font-extrabold text-white">
                  {feature.title}
                </h4>
                <p className="text-[14px] leading-relaxed font-medium text-zinc-400">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column (Placeholder Image Box) - taking up 7 columns */}
        <div className="lg:col-span-7">
          <div className="group relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[32px] border-2 border-white/[0.03] bg-[#0a0a0a] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Subltle glow */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4500]/10 blur-[120px]" />
            <div className="absolute inset-x-8 bottom-0 flex h-[80%] flex-col rounded-t-[20px] border-x-2 border-t-2 border-white/[0.05] bg-[#0f0f0f] shadow-2xl transition-transform duration-700 group-hover:translate-y-2">
              <div className="flex h-12 w-full items-center gap-3 border-b border-white/[0.05] px-6">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80"></div>
                </div>
              </div>
              <div className="flex flex-1 gap-6 p-6">
                <div className="hidden h-full w-1/4 flex-col gap-4 sm:flex">
                  <div className="h-8 w-full rounded-md bg-white/[0.03]"></div>
                  <div className="h-8 w-full rounded-md border border-[#ff4500]/50 bg-[#ff4500]/20"></div>
                  <div className="h-8 w-full rounded-md bg-white/[0.03]"></div>
                </div>
                <div className="flex w-full flex-col gap-4 sm:w-3/4">
                  <div className="h-5 w-1/3 rounded-full bg-white/[0.1]"></div>
                  <div className="h-24 w-full rounded-lg bg-white/[0.03]"></div>
                  <div className="w-full flex-1 rounded-lg bg-white/[0.03]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second part of toolkit */}
      <div className="mt-16 mb-24 max-w-2xl text-center">
        <h2 className="mb-6 text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
          MORE APPS
        </h2>
        <h3 className="mb-6 text-[40px] leading-tight font-extrabold tracking-tight text-white md:text-[56px]">
          Everything you need to{" "}
          <span className="text-[#ff4500]">validate ideas</span>
        </h3>
        <p className="text-[18px] leading-relaxed font-medium text-zinc-400">
          Understand real user problems, find niches, and make data-driven
          product decisions effortlessly.
        </p>
      </div>

      <div className="grid w-full max-w-[1100px] grid-cols-1 gap-8 md:grid-cols-3">
        {/* Card 1: Integrations */}
        <div className="group relative flex h-80 flex-col overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-white/[0.08]">
          <div className="absolute bottom-4 left-8 z-10 mb-8 flex origin-bottom-left items-center gap-2 transition-transform group-hover:scale-110">
            <div className="z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-[#0a0a0a] shadow-lg">
              <span className="text-sm font-black tracking-wider text-[#ff4500]">
                slack
              </span>
            </div>
            <div className="z-20 -ml-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-[#0a0a0a] shadow-lg">
              <span className="text-sm font-black tracking-wider text-amber-500">
                zap
              </span>
            </div>
            <div className="z-10 -ml-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-[#ff4500] shadow-lg">
              <span className="text-[10px] font-extrabold tracking-wider text-white">
                hub
              </span>
            </div>
          </div>

          <h4 className="mb-3 text-[20px] font-extrabold text-white">
            Structured Reports
          </h4>
          <p className="flex-1 text-[15px] font-medium text-zinc-400">
            Export insights into Notion, Docs, or Slack to share precisely what
            to build next.
          </p>
        </div>

        {/* Card 2: Alerts */}
        <div className="group relative flex h-80 flex-col overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-[#ff4500]/30">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#ff4500]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>

          <h4 className="mb-3 text-[20px] font-extrabold text-[#ff4500]">
            Weekly digests
          </h4>
          <p className="flex-1 text-[15px] font-medium text-zinc-400">
            Wake up to a fresh list of structured pain points and validation
            signals straight to your inbox.
          </p>

          <div className="absolute -bottom-4 -left-4 h-32 w-[120%] rounded-t-xl border border-white/5 bg-[#000] px-6 py-4 shadow-[0_-10px_30px_rgba(255,69,0,0.1)] transition-transform duration-500 group-hover:-translate-y-2">
            <div className="mt-2 mb-4 flex items-center justify-between">
              <span className="text-[13px] font-bold tracking-widest text-white uppercase">
                Trend Report
              </span>
              <span className="rounded bg-[#ff4500] px-2.5 py-1 text-[11px] font-bold text-white">
                HOT
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="relative h-full w-[75%] rounded-full bg-[#ff4500]"></div>
            </div>
          </div>
        </div>

        {/* Card 3: Sentiment Tracker */}
        <div className="group relative flex h-80 flex-col overflow-hidden rounded-[24px] border-2 border-white/[0.03] bg-[#0f0f0f] p-8 shadow-2xl transition-colors hover:border-white/[0.08]">
          <div className="absolute right-8 bottom-8 left-8 flex h-24 items-end gap-[3px] transition-transform duration-500 group-hover:-translate-y-2">
            {[
              { h: 3, id: "h1" },
              { h: 5, id: "h2" },
              { h: 4, id: "h3" },
              { h: 7, id: "h4" },
              { h: 5, id: "h5" },
              { h: 8, id: "h6" },
              { h: 4, id: "h7" },
              { h: 9, id: "h8" },
              { h: 7, id: "h9" },
            ].map((bar) => (
              <div
                key={bar.id}
                className="flex-1 rounded-t-[2px] bg-red-500 opacity-20"
                style={{ height: `${bar.h * 10}%` }}
              ></div>
            ))}
            <div className="absolute right-0 bottom-0 flex h-24 w-[40px] items-end gap-1">
              <div
                className="flex-1 rounded-t-[2px] bg-[#ff4500]"
                style={{ height: "70%" }}
              ></div>
              <div
                className="flex-1 rounded-t-[2px] bg-[#ff4500]"
                style={{ height: "100%" }}
              ></div>
            </div>
          </div>

          <h4 className="mb-3 text-[20px] font-extrabold text-white">
            Pain Point Tracker
          </h4>
          <p className="flex-1 text-[15px] font-medium text-zinc-400">
            Track the volume of specific complaints over time to prioritize
            features by demand.
          </p>
        </div>
      </div>
    </section>
  );
}
