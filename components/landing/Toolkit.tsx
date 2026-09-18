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
  Target,
  Sparkles,
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
    badge: "Competitor & Pain Mining",
    title: "Semantic Pain & Churn Miner",
    subtitle:
      "Turn noisy Reddit discussions into structured customer dossiers and actionable product briefs.",
    benefits: [
      {
        title: "Intent and Sentiment Filters",
        desc: "Filters out jokes, memes, and spam to extract verified struggles and repeated manual workarounds.",
      },
      {
        title: "Competitor Churn Intelligence",
        desc: "Tracks complaints about incumbents like HubSpot, Jira, and Stripe to uncover high-friction gaps.",
      },
      {
        title: "One-Click Data Export",
        desc: "Export opportunity dossiers and direct user permalinks to CSV, JSON, and Notion with complete metadata.",
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
    title: "Trend Velocity & Growth Tracking",
    subtitle:
      "Verify whether market frustration is accelerating before investing months into building software.",
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
        desc: "Identifies early spikes in discussions when new pricing hikes or platform policy changes trigger user churn.",
      },
    ],
    previewDetail: {
      statTitle: "Validation Accuracy",
      statValue: "94.2%",
      statSubtitle:
        "Correlation with verified customer demand in post-launch surveys",
      highlights: [
        "Historical 12-month trendlines",
        "Engagement velocity scoring",
        "Automated niche clustering",
      ],
    },
  },
  {
    id: "alerts",
    badge: "Continuous Radar",
    title: "Automated Webhooks & Instant Alerts",
    subtitle:
      "Receive real-time notifications the moment target buyers complain about an incumbent or request an alternative.",
    benefits: [
      {
        title: "Real-Time Webhooks",
        desc: "Dispatch custom JSON payloads to Make, Zapier, or your API server as fresh complaints emerge.",
      },
      {
        title: "Team Notifications",
        desc: "Deliver formatted pain point summaries directly to Slack or Discord channels.",
      },
      {
        title: "Custom Keyword Triggers",
        desc: "Track bespoke competitor mentions and niche keywords across multiple communities simultaneously.",
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
      className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-16 sm:px-6 sm:py-24"
    >
      {/* Section Header */}
      <div className="mb-14 flex max-w-[720px] flex-col items-center text-center">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#ff4500] shadow-2xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Complete Research Suite</span>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          Everything you need to outposition competitors
        </h2>
        <p className="text-base leading-relaxed font-normal text-zinc-600 sm:text-lg dark:text-zinc-300">
          Replace subjective assumptions with verified customer feedback mined
          directly from authentic community discussions.
        </p>

        {/* Feature Navigation Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-100/90 p-1.5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
          {features.map((feat, idx) => (
            <button
              key={feat.id}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                activeTab === idx
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {feat.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feature Display Card */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-12 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Left: Detailed Benefit List */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <span className="mb-2 inline-block font-mono text-xs font-bold tracking-wider text-[#ff4500] uppercase">
              {activeFeature.badge}
            </span>
            <h3 className="mb-3 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">
              {activeFeature.title}
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {activeFeature.subtitle}
            </p>

            <div className="space-y-4">
              {activeFeature.benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4500]" />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {b.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            <Link
              href="/dashboard/search"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#ff4500] hover:text-[#e03d00]"
            >
              <span>Test this scanner live</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Tactile Metric & Signal Card */}
        <div className="flex flex-col justify-center rounded-2xl border border-zinc-100 bg-zinc-50 p-6 lg:col-span-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-6 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <span className="font-mono text-xs font-medium text-zinc-500 uppercase dark:text-zinc-400">
              {activeFeature.previewDetail.statTitle}
            </span>
            <div className="mt-1 font-mono text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {activeFeature.previewDetail.statValue}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {activeFeature.previewDetail.statSubtitle}
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="font-mono text-[11px] font-bold text-zinc-400 uppercase">
              Core Capabilities:
            </span>
            {activeFeature.previewDetail.highlights.map((h) => (
              <div
                key={h}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#ff4500]" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
