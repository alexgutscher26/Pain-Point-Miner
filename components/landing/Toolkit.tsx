"use client";

import { useState } from "react";
import { Sparkles, Terminal, Bell, BarChart3, ArrowRight, ShieldCheck, Check } from "lucide-react";
import Link from "next/link";

interface FeatureDetail {
  title: string;
  badge: string;
  desc: string;
  bulletPoints: { title: string; desc: string }[];
}

const tabDetails: FeatureDetail[] = [
  {
    title: "Pain-Point Mining Engine",
    badge: "Mining",
    desc: "Scrape, filter, and structure raw Reddit threads to isolate validated frustrations in under 60 seconds.",
    bulletPoints: [
      { title: "Semantic Intent Parsing", desc: "Filters out jokes, meta discussions, and spam to find real customer frustration." },
      { title: "Competitor Scraping", desc: "Monitors mentions of target alternatives (e.g., Ahrefs, Salesforce, Stripe) to find gaps." },
      { title: "Direct Exporter", desc: "Instantly exports structured opportunity spreadsheets into Notion, Google Sheets, or PDF." },
    ],
  },
  {
    title: "Trend Velocity & Demand Analytics",
    badge: "Analytics",
    desc: "Track the growth and frequency of complaints over time to guarantee you are building for a growing market.",
    bulletPoints: [
      { title: "Niche Trendlines", desc: "Charts complaint frequency across different subreddits to check demand stability." },
      { title: "Volume Spike Alerts", desc: "Alerts you when a specific tool's complaints spike (often indicating pricing/feature changes)." },
      { title: "Desperation Scoring", desc: "Weights metrics like upvotes, comments, and sentiment to grade market intent." },
    ],
  },
  {
    title: "Slack, Discord & Webhook Integration",
    badge: "Integrations",
    desc: "Hook ThreddIQ directly into your active builder stack, receiving alerts the second a user vents about an issue.",
    bulletPoints: [
      { title: "Real-Time Webhooks", desc: "Send automated JSON payloads to Zapier, Make, or custom API endpoints." },
      { title: "Team Channel Alerts", desc: "Elegant Slack and Discord bots push alerts directly into your private channels." },
      { title: "Inbox Digest", desc: "Receive clean daily or weekly email summaries featuring validation signals." },
    ],
  },
];

export function Toolkit() {
  const [activeTab, setActiveTab] = useState(0);
  const activeFeature = tabDetails[activeTab];

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-24 sm:px-6 sm:py-32">
      {/* Section Header */}
      <div className="mb-16 max-w-2xl text-center">
        <span className="mb-4 inline-block text-[11px] font-extrabold tracking-widest text-[#ff4500] uppercase">
          PRODUCT TOUR
        </span>
        <h2 className="mb-6 text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-zinc-950 sm:text-[48px]">
          Your complete <span className="text-[#ff4500]">Reddit research</span> suite
        </h2>
        <p className="text-[16px] font-medium text-zinc-500 leading-relaxed">
          Everything you need to validate SaaS ideas by listening to target markets—built on top of actual customer complaints.
        </p>
      </div>

      {/* Tabs Selectors */}
      <div className="mb-12 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-black/5 bg-zinc-100 p-1.5 shadow-inner">
        <button
          onClick={() => setActiveTab(0)}
          className={`rounded-full px-5 py-2.5 text-[12px] font-extrabold transition-all ${
            activeTab === 0
              ? "border border-[#ff4500]/25 bg-white text-[#ff4500] shadow-xs"
              : "border border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          🔍 Real-Time Mining
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`rounded-full px-5 py-2.5 text-[12px] font-extrabold transition-all ${
            activeTab === 1
              ? "border border-[#ff4500]/25 bg-white text-[#ff4500] shadow-xs"
              : "border border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          📊 Trend Velocities
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`rounded-full px-5 py-2.5 text-[12px] font-extrabold transition-all ${
            activeTab === 2
              ? "border border-[#ff4500]/25 bg-white text-[#ff4500] shadow-xs"
              : "border border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          🔔 Integrations & Webhooks
        </button>
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left Side: Descriptions (col-span-5) */}
        <div className="flex flex-col items-start lg:col-span-5 animate-in fade-in duration-300">
          <span className="mb-2 rounded bg-[#ff4500]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#ff4500] uppercase tracking-wider">
            {activeFeature.badge} Feature
          </span>
          <h3 className="mb-4 text-2xl font-extrabold tracking-tight text-zinc-950">
            {activeFeature.title}
          </h3>
          <p className="mb-8 text-sm leading-relaxed font-medium text-zinc-500">
            {activeFeature.desc}
          </p>

          <div className="w-full space-y-5">
            {activeFeature.bulletPoints.map((bp, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ff4500]/10 text-[#ff4500]">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">{bp.title}</h4>
                  <p className="text-[12px] font-medium text-zinc-500 mt-0.5 leading-normal">{bp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Visual Sandbox Dashboard Mockup (col-span-7) */}
        <div className="lg:col-span-7 w-full flex justify-center">
          <div className="w-full rounded-2xl border border-black/[0.05] bg-white/70 p-1.5 shadow-md overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.04] px-4 py-2 bg-zinc-50/50">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-zinc-300"></div>
                <div className="h-2 w-2 rounded-full bg-zinc-300"></div>
                <div className="h-2 w-2 rounded-full bg-zinc-300"></div>
              </div>
              <div className="flex items-center gap-1 rounded bg-white border border-black/[0.04] px-6 py-0.5 text-[9px] font-medium text-zinc-400">
                <span>Preview Sandbox Screen</span>
              </div>
              <div className="w-6"></div>
            </div>

            {/* Inner Dashboard View */}
            <div className="bg-white p-5 min-h-[300px] flex flex-col justify-start rounded-b-xl">
              
              {/* Tab 0 View: Real-Time Mining Dashboard */}
              {activeTab === 0 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-black/[0.03] pb-2">
                    <span className="text-[10px] font-extrabold text-zinc-900">Mined Ledgers: Subreddit scan</span>
                    <span className="text-[9px] font-bold text-green-500">Live feed</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {[
                      { source: "r/SaaS", quote: "...need simple enterprise contract syncer for Stripe...", score: "94%" },
                      { source: "r/productivity", quote: "...automatic weekly PDF reports builder for clients...", score: "96%" },
                      { source: "r/indiehackers", quote: "...keywords tracking tool is too bloated and expensive...", score: "78%" },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between border border-black/5 bg-zinc-50/50 p-2.5 rounded-lg text-[11px]">
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-extrabold text-[#ff4500] tracking-wider uppercase bg-[#ff4500]/10 px-1 rounded">{row.source}</span>
                            <span className="text-[9px] font-bold text-zinc-400">Verifying complaints</span>
                          </div>
                          <p className="text-[10px] font-medium text-zinc-600 mt-1 truncate">{row.quote}</p>
                        </div>
                        <span className="text-[10px] font-black text-[#ff4500]">{row.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 1 View: Trend Velocities Chart */}
              {activeTab === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300 flex flex-col justify-between flex-1">
                  <div className="flex items-center justify-between border-b border-black/[0.03] pb-2">
                    <span className="text-[10px] font-extrabold text-zinc-900">Niche Growth Velocity: Last 6 months</span>
                    <span className="text-[9px] font-bold text-[#ff4500]">Upward Trends</span>
                  </div>

                  {/* Chart representation */}
                  <div className="flex items-end justify-between h-36 px-4 border-b border-zinc-150 pb-2 relative">
                    {/* Vertical grid markers */}
                    <div className="absolute left-0 top-0 text-[8px] text-zinc-400 font-mono w-full flex flex-col gap-8 pointer-events-none">
                      <div className="border-b border-zinc-100 w-full"></div>
                      <div className="border-b border-zinc-100 w-full"></div>
                    </div>
                    {[
                      { month: "Jan", h: 30 },
                      { month: "Feb", h: 42 },
                      { month: "Mar", h: 35 },
                      { month: "Apr", h: 60 },
                      { month: "May", h: 52 },
                      { month: "Jun", h: 84 },
                    ].map((node, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                        <div className="relative w-7 bg-gradient-to-t from-orange-400 to-[#ff4500] rounded-t-sm shadow-2xs hover:scale-105 transition-all" style={{ height: `${node.h}px` }}>
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#ff4500]">{node.h}%</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-zinc-400 uppercase">{node.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2 View: Webhook terminal and Integrations */}
              {activeTab === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300 flex flex-col justify-between flex-1">
                  <div className="flex items-center justify-between border-b border-black/[0.03] pb-2">
                    <span className="text-[10px] font-extrabold text-zinc-900">Active Integrations</span>
                    <span className="text-[9px] font-bold text-green-500">JSON Webhook Stream</span>
                  </div>

                  {/* Mock Terminal Output */}
                  <div className="rounded-lg bg-zinc-950 p-3.5 font-mono text-[9px] text-zinc-400 space-y-1 shadow-inner border border-zinc-800">
                    <p className="text-zinc-500">{"// Webhook payload trigger"}</p>
                    <p className="text-zinc-300">POST <span className="text-green-400">https://api.threddiq.com/v1/webhook</span></p>
                    <p className="text-amber-400">{"{"}</p>
                    <p className="pl-4">"source": <span className="text-emerald-400">"r/SaaS"</span>,</p>
                    <p className="pl-4">"niche": <span className="text-emerald-400">"Enterprise Stripe Billing Syncer"</span>,</p>
                    <p className="pl-4">"desperation_score": <span className="text-emerald-400">94</span>,</p>
                    <p className="pl-4">"verified": <span className="text-emerald-400">true</span></p>
                    <p className="text-amber-400">{"}"}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
