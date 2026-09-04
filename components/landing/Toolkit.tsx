"use client";

import { useState } from "react";
import {
  Search,
  TrendingUp,
  Bell,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

interface FeatureSuite {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  benefits: { title: string; desc: string }[];
  previewDetail: {
    statTitle: string;
    statValue: string;
    statSubtitle: string;
    highlights: string[];
  };
}

const features: FeatureSuite[] = [
  {
    id: "mining",
    badge: "Semantic Mining",
    title: "Semantic Pain Point Miner",
    subtitle:
      "Turn messy Reddit discussions into structured customer opportunity reports in seconds.",
    benefits: [
      {
        title: "Intent and Sentiment Filters",
        desc: "Filters out jokes, memes, and spam to extract verified struggles and repeated manual workarounds.",
      },
      {
        title: "Competitor Churn Tracker",
        desc: "Tracks complaints about incumbents like Salesforce, Jira, and Stripe to uncover high friction gaps.",
      },
      {
        title: "One Click Data Export",
        desc: "Export opportunity dossiers and user permalinks to CSV, JSON, and Notion with complete metadata.",
      },
    ],
    previewDetail: {
      statTitle: "Complaints Classified",
      statValue: "48,920+",
      statSubtitle: "Reddit threads scanned and indexed across 1,240 niches",
      highlights: [
        "Unfiltered customer pain points",
        "Willingness to pay dollar estimates",
        "Direct permalink verification",
      ],
    },
  },
  {
    id: "velocity",
    badge: "Demand Velocity",
    title: "Trend Velocity and Growth Tracking",
    subtitle:
      "Verify whether market interest is growing before investing months into building software.",
    benefits: [
      {
        title: "Volume Growth Analysis",
        desc: "Measures complaint frequency trends across months to confirm durable market demand.",
      },
      {
        title: "Opportunity Score Index",
        desc: "Weights upvotes, comment density, and emotional urgency to grade validation potential from 0 to 100.",
      },
      {
        title: "Emerging Topic Detection",
        desc: "Identifies early spikes in discussions when new API changes or platform policies frustrate users.",
      },
    ],
    previewDetail: {
      statTitle: "Validation Accuracy",
      statValue: "94.2%",
      statSubtitle:
        "Correlation with verified customer demand in post launch surveys",
      highlights: [
        "Historical 12 month trendlines",
        "Engagement velocity scoring",
        "Automated niche clustering",
      ],
    },
  },
  {
    id: "alerts",
    badge: "Continuous Radar",
    title: "Automated Webhooks and Alerts",
    subtitle:
      "Receive instant notifications the moment a target user vents about a high intent issue.",
    benefits: [
      {
        title: "Real Time Webhooks",
        desc: "Dispatch custom JSON payloads to Make, Zapier, or your API server as fresh complaints emerge.",
      },
      {
        title: "Team Notifications",
        desc: "Deliver formatted pain point summaries directly to your private team channels.",
      },
      {
        title: "Custom Keyword Triggers",
        desc: "Track bespoke regex patterns and niche phrases across multiple communities simultaneously.",
      },
    ],
    previewDetail: {
      statTitle: "Alert Delivery",
      statValue: "< 90s",
      statSubtitle:
        "Average notification speed from thread publication to your inbox",
      highlights: [
        "Granular threshold controls",
        "Digest summary frequencies",
        "Direct outreach permalinks",
      ],
    },
  },
];

export function Toolkit() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const activeFeature = features[activeTab];

  return (
    <section
      id="features"
      className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-20 sm:px-6 sm:py-28"
    >
      {/* Section Header */}
      <div className="mb-14 flex max-w-[680px] flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-[#ff4500] dark:border-white/10 dark:bg-zinc-900/60">
          Comprehensive research suite
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          Everything you need to validate customer demand
        </h2>
        <p className="text-base leading-relaxed font-normal text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
          Replace speculative assumptions with verified customer feedback mined
          directly from authentic community threads.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="mb-12 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 p-1.5 shadow-xs backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70">
        {features.map((feat, index) => (
          <button
            key={feat.id}
            type="button"
            onClick={() => setActiveTab(index)}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              activeTab === index
                ? "bg-[#ff4500] text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {feat.badge}
          </button>
        ))}
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left Column: Bullet List */}
        <div className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xs backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] sm:p-10 lg:col-span-7 dark:border-white/10 dark:bg-zinc-900/70">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#ff4500] uppercase">
              {activeFeature.badge}
            </div>
            <h3 className="mb-3 text-2xl font-bold tracking-tight text-balance text-zinc-950 sm:text-3xl dark:text-white">
              {activeFeature.title}
            </h3>
            <p className="mb-8 text-base leading-relaxed font-normal text-pretty text-zinc-600 dark:text-zinc-300">
              {activeFeature.subtitle}
            </p>

            <div className="space-y-6">
              {activeFeature.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#ff4500]/10 text-[#ff4500]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                      {b.title}
                    </h4>
                    <p className="mt-0.5 text-sm leading-relaxed font-normal text-pretty text-zinc-600 dark:text-zinc-400">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-8 dark:border-white/5">
            <span className="text-xs font-medium text-zinc-500">
              Included on all starter and pro tiers
            </span>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff4500] transition-colors hover:text-[#e03d00]"
            >
              <span>Test feature now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Metrics Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-black/10 bg-zinc-950 p-6 text-white shadow-xl backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] sm:p-10 lg:col-span-5 dark:border-white/10">
          <div>
            <span className="mb-2 block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              {activeFeature.previewDetail.statTitle}
            </span>
            <div className="mb-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {activeFeature.previewDetail.statValue}
            </div>
            <p className="mb-8 text-sm leading-relaxed font-normal text-zinc-400">
              {activeFeature.previewDetail.statSubtitle}
            </p>

            <div className="space-y-3.5 rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="block text-xs font-bold tracking-wider text-zinc-300 uppercase">
                Key Deliverables
              </span>
              {activeFeature.previewDetail.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-xs font-medium text-zinc-200 sm:text-sm"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ff4500]" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-zinc-400">
            <span>Real-time Reddit listener</span>
            <span className="font-medium text-emerald-400">Active monitor</span>
          </div>
        </div>
      </div>
    </section>
  );
}
