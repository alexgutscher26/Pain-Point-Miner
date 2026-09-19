"use client";

import React from "react";
import { Surface } from "@webprodigies/flute";
import {
  Radar,
  Activity,
  Cpu,
  Flame,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Target,
  PieChart,
  ShieldCheck,
  ExternalLink,
  Zap,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function ConnectedOpportunityTourScene() {
  // Data for Scanner
  const opportunities = [
    {
      sub: "r/boardgames",
      title: "Board Game Group Finding & Table Formation SaaS",
      score: "8.8",
      signalCount: "1,248 signals",
      growth: "+48% MoM",
      intent: "High WTP",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      sub: "r/ecommerce",
      title: "Automated Return Fraud Detection for Shopify Plus",
      score: "8.5",
      signalCount: "892 signals",
      growth: "+62% MoM",
      intent: "High WTP",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      sub: "r/realestateinvesting",
      title: "HVAC Preventative Telemetry & Dispatch for Landlords",
      score: "8.2",
      signalCount: "640 signals",
      growth: "+31% MoM",
      intent: "Medium WTP",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
  ];

  const liveTerminalLogs = [
    { time: "18:42:04", src: "r/boardgames", msg: "Identified pain cluster: 'Meetup doubled prices, store night attendance dropping 40%'", tag: "EXTRACTED" },
    { time: "18:42:19", src: "r/ecommerce", msg: "Clustering buyer intent: 'Looking for tool that flags serial returners automatically'", tag: "CLUSTERED" },
    { time: "18:42:35", src: "r/SaaS", msg: "Calculating TAM & CPC telemetry: Volume 14.8K/mo, CPC $1.85, Low Paid Competition", tag: "ENRICHED" },
    { time: "18:42:51", src: "r/boardgames", msg: "Synthesizing AI Validation Score: 8.8/10 (Viability: 9.1, Timing: 9.4, Wedge: 8.6)", tag: "SCORED" },
  ];

  // Data for Snapshot
  const demandChartPoints = [75, 75, 75, 92, 60, 60, 60];

  // Data for Demand Picture
  const modalChartPoints = [35, 42, 50, 64, 76, 88, 96];
  const yAxisTicks = ["20k", "15k", "10k", "5k", "0"];

  // Data for Money Math
  const pilotFunnel = [
    { label: "Target stores in pilot metro", value: "30", note: "In-store visits made" },
    { label: "Owner meeting rate", value: "50%", note: "15 active demos" },
    { label: "Paid pilots signed ($79/mo)", value: "6", note: "$948 initial 60-day ARR" },
    { label: "Pilot -> $149/mo Pro conversion", value: "50%", note: "3 converted stores" },
    { label: "Month 4 MRR from pilot city", value: "$684", note: "$8,208 run-rate" },
    { label: "Scale to 5 metros by month 12", value: "60 stores", note: "Blended $110/mo ARPU" },
  ];

  const ceilingMetrics = [
    { label: "US Toy & Hobby Stores (First Research)", val: "8,500", highlight: false },
    { label: "FLGS-Shaped Subset (Runs Weekly Play)", val: "3,000", highlight: false },
    { label: "Realistic Serviceable Stores (25% Penetration)", val: "750", highlight: true, color: "text-blue-400" },
    { label: "Store B2B SaaS ARR Ceiling", val: "$1.17M ARR", highlight: true, color: "text-indigo-400" },
    { label: "Player Pass Upsell ($3.99/mo per regular)", val: "$1.85M ARR", highlight: true, color: "text-emerald-400" },
  ];

  return (
    <>
      {/* Surface 1: Reddit Mining Scanner */}
      <Surface
        id="scanner-surface"
        style={{ width: 1400, height: 980 }}
        className="bg-[#07090e] p-8 font-sans text-zinc-100 antialiased overflow-hidden flex flex-col justify-between select-none rounded-3xl border border-zinc-800 shadow-2xl relative"
      >
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-0.5 font-mono text-[11px] font-bold text-blue-400 uppercase">
                <Radar className="w-3.5 h-3.5 animate-pulse" /> 01 • Live Mining Scanner
              </span>
              <span className="font-mono text-xs text-zinc-400">Stream Processing Engine</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
              Pain Point Discovery & Real-Time Radar
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-sans text-[10px] font-bold tracking-wider text-zinc-400 uppercase">INDEXED</div>
              <div className="font-mono text-xl font-black text-white">142,850</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-right">
              <div className="font-sans text-[10px] font-bold tracking-wider text-zinc-400 uppercase">CLUSTERS</div>
              <div className="font-mono text-xl font-black text-emerald-400">3,412</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 pt-2 z-10 flex-1">
          <div className="col-span-7 space-y-3">
            <span className="font-sans text-[10px] font-bold tracking-wider text-blue-400 uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Top Scored Opportunities
            </span>
            {opportunities.map((opp, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-mono text-xs text-blue-400 font-semibold">{opp.sub}</span>
                  <h3 className="font-serif text-sm font-semibold text-white">{opp.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9.5px] px-2 py-0.5 rounded border uppercase ${opp.badgeColor}`}>{opp.intent}</span>
                    <span className="font-mono text-[9.5px] text-emerald-400">{opp.growth}</span>
                  </div>
                </div>
                <div className="text-right pl-3">
                  <div className="font-sans text-[9px] font-bold text-zinc-400">SCORE</div>
                  <div className="font-mono text-xl font-black text-emerald-400">{opp.score}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-5 flex flex-col justify-between">
            <span className="font-sans text-[10px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Terminal Stream
            </span>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] space-y-2.5 mt-2 flex-1">
              {liveTerminalLogs.map((log, idx) => (
                <div key={idx} className="border-l-2 border-zinc-800 pl-2.5">
                  <span className="text-zinc-500 text-[9px]">{log.time} • {log.src}</span>
                  <p className="text-zinc-300 font-sans text-[11px] leading-tight mt-0.5">{log.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 pt-3 z-10 text-xs text-zinc-500">
          <span>Continuous Reddit PRAW & Pushshift Firehose</span>
          <span className="text-blue-400 flex items-center gap-1">Next: Opportunity Validation <ArrowUpRight className="w-3.5 h-3.5" /></span>
        </div>
      </Surface>

      {/* Surface 2: Idea Market Snapshot */}
      <Surface
        id="snapshot-surface"
        style={{ width: 1400, height: 980 }}
        className="bg-[#FAFAFB] p-8 font-sans text-zinc-900 antialiased overflow-hidden flex flex-col justify-between select-none rounded-3xl border border-zinc-200 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 font-mono text-[11px] font-bold text-blue-700 uppercase">
                02 • Opportunity Intelligence
              </span>
              <span className="font-mono text-xs text-zinc-400">r/boardgames • Verified Idea</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1a1a1a]">
              Board Game Group Finding & Table Formation SaaS
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-sans text-[11px] font-bold text-zinc-400 uppercase">VALIDATION SCORE</div>
              <div className="font-sans text-2xl font-black text-emerald-600">8.8/10</div>
            </div>
            <div className="h-10 w-px bg-zinc-200" />
            <div className="text-right">
              <div className="font-sans text-[11px] font-bold text-zinc-400 uppercase">Y1 TARGET</div>
              <div className="font-sans text-2xl font-black text-zinc-900">$79.2K ARR</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 pt-2">
          <div className="col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
                <span className="font-sans text-[10.5px] font-bold text-[#6366F1] uppercase">DEMAND SEARCH</span>
                <div className="font-serif text-2xl font-normal text-zinc-900">201K<span className="text-sm font-light text-zinc-400">/mo</span></div>
                <div className="h-14 w-full">
                  <svg viewBox="0 0 300 80" className="h-full w-full" preserveAspectRatio="none">
                    <path
                      d={`M 0 65 ` + demandChartPoints.map((p, i) => `L ${i * 50} ${65 - (p / 100) * 55}`).join(" ") + ` L 300 65 Z`}
                      fill="#EEF2FF"
                    />
                    <path
                      d={`M 0 65 ` + demandChartPoints.map((p, i) => `L ${i * 50} ${65 - (p / 100) * 55}`).join(" ")}
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
                <span className="font-sans text-[10.5px] font-bold text-[#6366F1] uppercase">GOOGLE SEARCH VOLUME</span>
                <div className="font-serif text-2xl font-normal text-zinc-900">14.8K<span className="text-sm font-light text-zinc-400">/mo</span></div>
                <div className="flex items-center gap-1.5 pt-2">
                  {[40, 48, 55, 62, 70, 85, 96].map((v, i) => (
                    <div key={i} className="flex-1 bg-zinc-100 h-12 rounded-sm overflow-hidden flex flex-col justify-end">
                      <div className="bg-[#4F46E5] w-full rounded-sm" style={{ height: `${v}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
              <span className="font-sans text-[10.5px] font-bold text-zinc-400 uppercase">COMMUNITY CITATIONS</span>
              <p className="font-serif text-sm italic text-zinc-700 leading-snug">
                &ldquo;Meetup just doubled our organizer rates again. It costs us $288/year just to post weekly game nights that seat 16 people.&rdquo;
              </p>
              <div className="font-mono text-xs text-blue-600 font-medium">u/DiceAndDecks • r/boardgames • 342 upvotes</div>
            </div>
          </div>

          <div className="col-span-5 space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
              <span className="font-sans text-[10.5px] font-bold text-emerald-600 uppercase">THE WHITESPACE GAP</span>
              <h3 className="font-serif text-lg font-bold text-zinc-900">Meetup is too generic, Discord is too chaotic</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Players need structured seat reservation and player-count matching, while store owners need attendance guarantees and automated reminders.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
              <span className="font-sans text-[10.5px] font-bold text-indigo-600 uppercase">THE WEDGE STRATEGY</span>
              <h3 className="font-serif text-lg font-bold text-zinc-900">Store-Sponsored Table Reservation Plugin</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Free for players, $79/mo for store owners to manage weekly tables with guaranteed check-ins.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500">
          <span>AI Validation Engine Scorecard</span>
          <span className="text-blue-600 flex items-center gap-1">Next: Search Demand Details <ArrowUpRight className="w-3.5 h-3.5" /></span>
        </div>
      </Surface>

      {/* Surface 3: Search Demand Intelligence Modal */}
      <Surface
        id="demand-surface"
        style={{ width: 1400, height: 980 }}
        className="bg-zinc-950/90 p-10 flex items-center justify-center font-sans antialiased select-none rounded-3xl border border-zinc-800 shadow-2xl"
      >
        <div className="w-full max-w-4xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="space-y-0.5">
              <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                03 • SEARCH INTELLIGENCE & DEMAND PICTURE
              </span>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-zinc-900">
                The demand picture.
              </h1>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>High Organic Intent</span>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-[#FAFAFE] p-5 space-y-1">
            <div className="font-sans text-[10.5px] font-bold tracking-widest text-[#6366F1] uppercase">
              LOCAL PLAY & BOARD GAME DISCOVERY
            </div>
            <div className="font-serif text-4xl font-normal text-zinc-900">
              14.8K<span className="text-lg font-light text-zinc-400">/mo</span>
            </div>
            <div className="font-sans text-xs text-zinc-600">
              &apos;board game cafe near me&apos; in US & UK, rising 1.6x YoY across Google Search
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 py-1 text-center rounded-2xl bg-zinc-50 border border-zinc-200/70 p-3">
            <div>
              <div className="font-sans text-[10px] font-bold text-zinc-400 uppercase">SEARCH VOLUME</div>
              <div className="font-serif text-xl font-normal text-zinc-900">14.8K/mo</div>
            </div>
            <div>
              <div className="font-sans text-[10px] font-bold text-zinc-400 uppercase">YOY VELOCITY</div>
              <div className="font-sans text-xl font-bold text-emerald-600">+62%</div>
            </div>
            <div>
              <div className="font-sans text-[10px] font-bold text-zinc-400 uppercase">AVG CPC</div>
              <div className="font-serif text-xl font-normal text-zinc-900">$1.85</div>
            </div>
            <div>
              <div className="font-sans text-[10px] font-bold text-zinc-400 uppercase">COMPETITION</div>
              <div className="font-sans text-xl font-bold text-blue-600">Low</div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
              <span>Google Search Demand (12-Month Trend)</span>
              <span className="text-emerald-600">+62% YoY</span>
            </div>
            <div className="h-28 w-full">
              <svg viewBox="0 0 500 120" className="h-full w-full" preserveAspectRatio="none">
                <path
                  d={`M 0 100 ` + modalChartPoints.map((p, i) => `L ${i * 83.3} ${100 - (p / 100) * 80}`).join(" ") + ` L 500 100 Z`}
                  fill="#EEF2FF"
                />
                <path
                  d={`M 0 100 ` + modalChartPoints.map((p, i) => `L ${i * 83.3} ${100 - (p / 100) * 80}`).join(" ")}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
        </div>
      </Surface>

      {/* Surface 4: Unit Economics & Money Math Modal */}
      <Surface
        id="money-surface"
        style={{ width: 1400, height: 980 }}
        className="bg-[#0b0f19] p-8 font-sans text-zinc-100 antialiased overflow-hidden flex flex-col justify-between select-none rounded-3xl border border-zinc-800 shadow-2xl relative"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 font-mono text-[11px] font-bold text-emerald-400 uppercase">
                <DollarSign className="w-3.5 h-3.5" /> 04 • Unit Economics & ARR Ceiling
              </span>
              <span className="font-mono text-xs text-zinc-500">First-Principles Financial Model</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
              The Money Math: Year 1 Napkin to $3.02M ARR
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-sans text-[11px] font-bold text-zinc-400 uppercase">Y1 BASELINE</div>
              <div className="font-sans text-2xl font-black text-emerald-400">$79,200 ARR</div>
            </div>
            <div className="h-10 w-px bg-zinc-800" />
            <div className="text-right">
              <div className="font-sans text-[11px] font-bold text-zinc-400 uppercase">CEILING</div>
              <div className="font-sans text-2xl font-black text-blue-400">$3.02M ARR</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 pt-2 z-10 flex-1">
          <div className="col-span-6 space-y-3">
            <span className="font-sans text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Year One, On A Napkin
            </span>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-2">
              {pilotFunnel.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50">
                  <span className="text-xs text-zinc-300">{step.label}</span>
                  <span className="font-mono text-xs font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{step.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-6 space-y-3">
            <span className="font-sans text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
              <PieChart className="w-3.5 h-3.5" /> TAM & Ceiling Breakdown
            </span>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-2">
              {ceilingMetrics.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50">
                  <span className="text-xs text-zinc-300">{item.label}</span>
                  <span className={`font-mono text-xs font-bold ${item.color || "text-zinc-200"}`}>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3">
                <div className="text-[10px] font-bold text-blue-400 uppercase">B2B STORES</div>
                <div className="text-lg font-bold text-white mt-0.5">$1.17M ARR</div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">B2C PLAYERS</div>
                <div className="text-lg font-bold text-white mt-0.5">$1.85M ARR</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 z-10 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sourced against First Research US Census & Meetup Acquisition Comps</span>
          </div>
          <div className="font-mono text-zinc-500">Full Validation Pipeline Complete</div>
        </div>
      </Surface>
    </>
  );
}
