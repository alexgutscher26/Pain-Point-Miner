"use client";

import React from "react";
import { Surface } from "@webprodigies/flute";
import { Radar, Activity, Zap, Cpu, Flame, CheckCircle2, ChevronRight, MessageSquare, ArrowUpRight } from "lucide-react";

export default function OpportunityMiningScannerScene() {
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
    {
      sub: "r/notion",
      title: "Two-Way Notion to SQLite Bidirectional Sync Engine",
      score: "7.9",
      signalCount: "512 signals",
      growth: "+22% MoM",
      intent: "High WTP",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
  ];

  const liveTerminalLogs = [
    { time: "18:42:04", src: "r/boardgames", msg: "Identified pain cluster: 'Meetup doubled prices, store night attendance dropping 40%'", tag: "EXTRACTED" },
    { time: "18:42:19", src: "r/ecommerce", msg: "Clustering buyer intent: 'Looking for tool that flags serial returners automatically'", tag: "CLUSTERED" },
    { time: "18:42:35", src: "r/SaaS", msg: "Calculating TAM & CPC telemetry: Volume 14.8K/mo, CPC $1.85, Low Paid Competition", tag: "ENRICHED" },
    { time: "18:42:51", src: "r/realestate", msg: "Synthesizing AI Validation Score: 8.8/10 (Viability: 9.1, Timing: 9.4, Wedge: 8.6)", tag: "SCORED" },
  ];

  return (
    <Surface
      id="opportunity-scanner-surface"
      style={{ width: 1400, height: 980 }}
      className="bg-[#07090e] p-8 font-sans text-zinc-100 antialiased overflow-hidden flex flex-col justify-between select-none relative"
    >
      {/* Background Neon Grid / Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-0.5 font-mono text-[11px] font-bold text-blue-400 uppercase">
              <Radar className="w-3.5 h-3.5 animate-pulse" /> Live Reddit Mining Scanner
            </span>
            <span className="font-mono text-xs text-zinc-400">Stream Processing Engine v3.4</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            Pain Point Discovery & Real-Time Opportunity Radar
          </h1>
        </div>

        {/* Global Pipeline Counters */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              INDEXED POSTS
            </div>
            <div className="font-mono text-2xl font-black text-white">142,850</div>
          </div>
          <div className="h-10 w-px bg-zinc-800" />
          <div className="text-right">
            <div className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              PAIN CLUSTERS
            </div>
            <div className="font-mono text-2xl font-black text-emerald-400">3,412</div>
          </div>
          <div className="h-10 w-px bg-zinc-800" />
          <div className="text-right">
            <div className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              ACTIVE SCRAPERS
            </div>
            <div className="font-mono text-2xl font-black text-blue-400">18 Subs</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar List vs Terminal Engine */}
      <div className="grid grid-cols-12 gap-6 pt-2 z-10 flex-1">
        {/* Left Column: Top Scored Opportunities (7 cols) */}
        <div className="col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10.5px] font-bold tracking-[0.16em] text-blue-400 uppercase flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> TOP VERIFIED OPPORTUNITIES
              </span>
              <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                Ranked by Validation Score
              </span>
            </div>
            <h2 className="font-serif text-xl font-medium tracking-tight text-zinc-200">
              High conviction SaaS ideas with verified willingness-to-pay.
            </h2>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 hover:border-zinc-700/90 transition-all flex items-center justify-between group shadow-lg backdrop-blur-sm"
              >
                <div className="space-y-1.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-400 font-semibold">{opp.sub}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="font-mono text-[11px] text-zinc-400">{opp.signalCount}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="font-mono text-[11px] text-emerald-400 font-medium">{opp.growth}</span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold uppercase ${opp.badgeColor}`}>
                      {opp.intent}
                    </span>
                    <span className="font-mono text-[10px] bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                      B2B SaaS
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-sans text-[10px] font-bold text-zinc-400 uppercase">SCORE</div>
                    <div className="font-mono text-2xl font-black text-emerald-400">{opp.score}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Real-time Extraction Pipeline & Signals (5 cols) */}
        <div className="col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10.5px] font-bold tracking-[0.16em] text-emerald-400 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> LIVE PIPELINE TELEMETRY
              </span>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-time
              </span>
            </div>
            <h2 className="font-serif text-xl font-medium tracking-tight text-zinc-200">
              Autonomous pain extraction & AI synthesis.
            </h2>
          </div>

          {/* Terminal Box */}
          <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-4 shadow-xl flex-1 flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] text-zinc-400 pl-2">miner-stream-agent.worker.ts</span>
              </div>
              <Cpu className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="space-y-3 flex-1 overflow-hidden">
              {liveTerminalLogs.map((log, idx) => (
                <div key={idx} className="space-y-1 border-l-2 border-zinc-800 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[10px]">{log.time} • {log.src}</span>
                    <span className="text-[9.5px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase">
                      {log.tag}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px] font-sans">
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>

            {/* Pipeline Status Footnote */}
            <div className="border-t border-zinc-800/80 pt-3 mt-3 flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> LLM Structured Parser OK
              </span>
              <span className="font-mono text-zinc-500">Latency: 142ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-2 z-10">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span>Real-time Reddit PRAW & Pushshift Firehose Analysis with OpenAI GPT-4o / DeepSeek R1</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <span>Cluster ID: #FLGS-2026-MINING</span>
        </div>
      </div>
    </Surface>
  );
}
