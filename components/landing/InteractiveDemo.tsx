"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  DollarSign,
  TrendingDown,
  Flame,
  Quote,
} from "lucide-react";
import Link from "next/link";

interface MockRedditPreset {
  id: string;
  name: string;
  category: string;
  subreddit: string;
  author: string;
  upvotes: string;
  timeAgo: string;
  title: string;
  rawComment: string;
  highlightPhrase: string;
  insight: {
    opportunityTitle: string;
    opportunityScore: number;
    urgencyLevel: "Critical" | "High";
    competitorFlaw: string;
    willingnessToPay: string;
    marketingHook: string;
    targetBuyer: string;
  };
}

const PRESETS: MockRedditPreset[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM & Automation",
    subreddit: "r/sales",
    author: "u/growth_vp_dan",
    upvotes: "1.8k",
    timeAgo: "2 days ago",
    title: "HubSpot just hiked our tier by $600/month for 3 basic email sequences",
    rawComment:
      "We just crossed 2,000 contacts and HubSpot automatically kicked us into their Professional tier which is an extra $600/month. We literally only need 3 automated outbound sequences and pipeline stages. I would cancel today and pay $79/mo for a lightweight sales pipeline that connects to Google Workspace without enterprise bloat.",
    highlightPhrase: "I would cancel today and pay $79/mo for a lightweight sales pipeline",
    insight: {
      opportunityTitle: "Unbundled Lightweight Sales CRM",
      opportunityScore: 96,
      urgencyLevel: "Critical",
      competitorFlaw: "Forced tier upgrades with 80% unused enterprise features",
      willingnessToPay: "$79 / month (Explicit budget committed)",
      marketingHook: '"The CRM for teams who refuse to pay $600/mo for 3 email workflows."',
      targetBuyer: "Early-stage B2B founders & outbound sales leads",
    },
  },
  {
    id: "stripe",
    name: "Stripe Billing",
    category: "Fintech & Billing",
    subreddit: "r/SaaS",
    author: "u/marcus_builder",
    upvotes: "1.4k",
    timeAgo: "4 days ago",
    title: "Tired of manual invoice reconciliation between custom enterprise deals & Stripe",
    rawComment:
      "We spend 8 hours every month reconciling bespoke annual contracts with Stripe Billing. Stripe doesn't handle custom payment milestones natively without heavy custom code. I would pay $99 monthly just to automate milestone contract invoices via webhook.",
    highlightPhrase: "I would pay $99 monthly just to automate milestone contract invoices",
    insight: {
      opportunityTitle: "Milestone Contract & Stripe Syncer",
      opportunityScore: 94,
      urgencyLevel: "High",
      competitorFlaw: "Stripe Billing lacks out-of-the-box bespoke milestone contract schedules",
      willingnessToPay: "$99 / month (8 hours/mo saved)",
      marketingHook: '"Sync enterprise annual contracts to Stripe in 60 seconds without writing code."',
      targetBuyer: "B2B SaaS founders & finance operations",
    },
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    category: "SEO & Growth",
    subreddit: "r/indiehackers",
    author: "u/elena_bootstraps",
    upvotes: "940",
    timeAgo: "1 week ago",
    title: "Why does basic rank tracking cost $129/mo across modern SEO suites?",
    rawComment:
      "Existing SEO tools charge enterprise rates just to monitor 15 keywords. I am bootstrapping 3 micro-tools and only need ranking volatility alerts on Telegram. I would gladly pay $19/mo for a clean, zero-bloat rank monitor.",
    highlightPhrase: "I would gladly pay $19/mo for a clean, zero-bloat rank monitor",
    insight: {
      opportunityTitle: "Micro Rank Monitor for Builders",
      opportunityScore: 89,
      urgencyLevel: "High",
      competitorFlaw: "Extremely punitive credit limits and high base seat cost for solo builders",
      willingnessToPay: "$19 / month (High volume indie demand)",
      marketingHook: '"Track your 20 most important keywords without an expensive enterprise subscription."',
      targetBuyer: "Indie hackers, solo founders, and niche site builders",
    },
  },
  {
    id: "notion",
    name: "Notion",
    category: "Productivity",
    subreddit: "r/productivity",
    author: "u/sarah_agency_ops",
    upvotes: "2.3k",
    timeAgo: "3 days ago",
    title: "Notion databases take 5 seconds to load on mobile when meeting clients",
    rawComment:
      "Our team relies on Notion for client briefs, but when I open it on the go or offline, it takes ages to render. If there were a fast local-first client portal that syncs markdown seamlessly, I would switch our entire 12-person agency immediately at $10/user.",
    highlightPhrase: "I would switch our entire 12-person agency immediately at $10/user",
    insight: {
      opportunityTitle: "Fast Local-First Agency Client Portal",
      opportunityScore: 92,
      urgencyLevel: "High",
      competitorFlaw: "Cloud latency and poor offline support on complex nested databases",
      willingnessToPay: "$120 / month ($10/seat across 12 team members)",
      marketingHook: '"Sub-millisecond client documentation that works offline and never buffers."',
      targetBuyer: "Design & marketing agency founders",
    },
  },
  {
    id: "loom",
    name: "Loom",
    category: "Video & Remote",
    subreddit: "r/remote",
    author: "u/alex_productlead",
    upvotes: "1.1k",
    timeAgo: "5 days ago",
    title: "Loom's continuous audio drift and compression on design walkthroughs",
    rawComment:
      "Half of our async engineering review videos have audio sync drift after 10 minutes. If someone built a lightweight Mac menubar recorder that uploads native high-res MP4 directly to S3 or Cloudflare Stream, I'd pay $15/mo in a heartbeat.",
    highlightPhrase: "I'd pay $15/mo in a heartbeat",
    insight: {
      opportunityTitle: "Native High-Fidelity Async Screen Recorder",
      opportunityScore: 91,
      urgencyLevel: "High",
      competitorFlaw: "Cloud transcoding degradation and audio-video desync on longer clips",
      willingnessToPay: "$15 / month (Direct credit card ready)",
      marketingHook: '"Lossless 4K screen recordings hosted on your own cloud storage with zero compression lag."',
      targetBuyer: "Product managers, engineers, and UX researchers",
    },
  },
];

export function InteractiveDemo() {
  const [selectedId, setSelectedId] = useState<string>("hubspot");
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const activePreset = PRESETS.find((p) => p.id === selectedId) || PRESETS[0];

  const handleSelectPreset = (id: string) => {
    if (id === selectedId) return;
    setIsSwitching(true);
    setTimeout(() => {
      setSelectedId(id);
      setIsSwitching(false);
    }, 180);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-16 sm:px-6 sm:py-24">
      {/* Header */}
      <div className="mb-12 flex max-w-[760px] flex-col items-center text-center">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#ff4500] shadow-2xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Signal Radar</span>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          See raw Reddit complaints turn into revenue opportunities
        </h2>
        <p className="text-base leading-relaxed font-normal text-zinc-600 sm:text-lg dark:text-zinc-300">
          Select a competitor below to see how ThreddIQ isolates genuine buyer frustration,
          extracts competitor flaws, and calculates willingness to pay in real time.
        </p>

        {/* Competitor Presets Bar */}
        <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-2">
          {PRESETS.map((preset) => {
            const isSelected = preset.id === selectedId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  isSelected
                    ? "border-[#ff4500] bg-white text-[#ff4500] shadow-sm ring-2 ring-[#ff4500]/10 dark:bg-zinc-900 dark:text-orange-400"
                    : "border-zinc-200 bg-white/80 text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                <span>{preset.name}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                    isSelected
                      ? "bg-[#ff4500]/10 text-[#ff4500] dark:bg-orange-950/40 dark:text-orange-300"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {preset.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dual-Column Interactive Display */}
      <div
        className={`grid w-full max-w-5xl grid-cols-1 gap-6 transition-opacity duration-200 lg:grid-cols-12 ${
          isSwitching ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* Left Column: Raw Reddit Discussion Feed */}
        <div className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6">
          <div>
            {/* Reddit Header */}
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3.5 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4500] text-white">
                  <span className="text-xs font-black">r/</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {activePreset.subreddit}
                    </span>
                    <span className="text-[11px] text-zinc-400">• Posted by {activePreset.author}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{activePreset.timeAgo}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Flame className="h-3.5 w-3.5 text-[#ff4500]" />
                <span>{activePreset.upvotes}</span>
              </div>
            </div>

            {/* Post Title */}
            <h3 className="mb-3 text-base font-bold text-zinc-900 sm:text-lg dark:text-white">
              {activePreset.title}
            </h3>

            {/* Post Body with highlighted quote */}
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-700 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              {activePreset.rawComment.split(activePreset.highlightPhrase).map((part, index, arr) => (
                <span key={index}>
                  {part}
                  {index < arr.length - 1 && (
                    <mark className="rounded-md bg-amber-100 px-1.5 py-0.5 font-semibold text-zinc-900 ring-1 ring-amber-300/60 dark:bg-amber-950/80 dark:text-amber-200 dark:ring-amber-800">
                      {activePreset.highlightPhrase}
                    </mark>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800">
            <span>Verified public discussion permalink</span>
            <span className="font-mono text-emerald-600 font-semibold dark:text-emerald-400">
              ✓ Authenticity verified
            </span>
          </div>
        </div>

        {/* Right Column: AI Extracted Signal Card (Guaranteed Dark Obsidian with high contrast) */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-xl lg:col-span-6">
          {/* Subtle warm glow inside card */}
          <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-[#ff4500]/10 blur-2xl" />

          <div>
            {/* Header with Signal Score */}
            <div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  AI Signal Teardown
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-[#ff4500]/20 px-3 py-1 text-xs font-bold text-[#ff6b33]">
                <Sparkles className="h-3 w-3" />
                <span>Validation Score: {activePreset.insight.opportunityScore}/100</span>
              </div>
            </div>

            {/* Extracted Opportunity Title */}
            <div className="mb-4">
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase">
                Validated Concept
              </span>
              <h4 className="text-lg font-bold text-white sm:text-xl">
                {activePreset.insight.opportunityTitle}
              </h4>
            </div>

            {/* Grid of Key Intelligence Tokens */}
            <div className="space-y-3">
              {/* Willingness to Pay */}
              <div className="flex flex-col gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Buyer Willingness-To-Pay Signal</span>
                </div>
                <p className="text-xs font-medium text-zinc-100 sm:text-sm">
                  {activePreset.insight.willingnessToPay}
                </p>
              </div>

              {/* Competitor Flaw / Churn Vector */}
              <div className="flex flex-col gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Competitor Vulnerability</span>
                </div>
                <p className="text-xs text-zinc-300">
                  {activePreset.insight.competitorFlaw}
                </p>
              </div>

              {/* Customer Voice / Copy Hook */}
              <div className="flex flex-col gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Quote className="h-3.5 w-3.5" />
                  <span>Customer Voice Copy Hook</span>
                </div>
                <p className="text-xs italic text-zinc-300">
                  {activePreset.insight.marketingHook}
                </p>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="mt-6 flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] text-zinc-400">
              Target: <strong className="text-zinc-200">{activePreset.insight.targetBuyer}</strong>
            </span>
            <Link
              href={`/niches`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff4500] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#e03d00]"
            >
              <span>Explore Pre-Mined Niches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
