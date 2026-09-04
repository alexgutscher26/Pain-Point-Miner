"use client";

import { useState } from "react";
import {
  Sparkles,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Users,
  Flame,
} from "lucide-react";
import Link from "next/link";

interface MockRedditPost {
  subreddit: string;
  author: string;
  karma: string;
  title: string;
  comment: string;
  insight: {
    idea: string;
    score: number;
    intensity: "High" | "Medium";
    solution: string;
    pricingSignal: string;
    targetUser: string;
    competitorFlaw: string;
  };
}

const mockSubredditData: Record<string, MockRedditPost> = {
  "r/SaaS": {
    subreddit: "r/SaaS",
    author: "u/marcus_builder",
    karma: "1.4k",
    title:
      "Tired of manual invoice reconciliation between Stripe and custom agreements",
    comment:
      "We spend 8 hours every month reconciling custom annual enterprise contracts that Stripe Billing does not handle natively. A simple contract sync tool would save us massive client friction. I would pay $99 monthly just to automate this.",
    insight: {
      idea: "Enterprise Stripe Contract Syncer",
      score: 94,
      intensity: "High",
      solution:
        "Lightweight middleware that extracts PDF contract clauses and syncs tiered invoice schedules directly into Stripe via webhook.",
      pricingSignal: "Explicit buyer intent: $99 per month",
      targetUser: "B2B SaaS founders and billing ops",
      competitorFlaw: "Stripe Billing lacks custom contract OCR",
    },
  },
  "r/indiehackers": {
    subreddit: "r/indiehackers",
    author: "u/elena_bootstraps",
    karma: "940",
    title:
      "Need affordable rank tracking without 50 useless enterprise features",
    comment:
      "Existing SEO suites charge $129 monthly just to monitor basic keyword rankings. I am bootstrapping small projects and only need 10 keywords. I would gladly pay $19 monthly for a simple rank monitor that sends clean Telegram alerts.",
    insight: {
      idea: "Micro Rank Monitor",
      score: 88,
      intensity: "High",
      solution:
        "Zero bloat daily keyword rank monitor delivering weekly volatility digests directly to email and Telegram.",
      pricingSignal: "Validated budget: $19 per month",
      targetUser: "Bootstrappers and solo creators",
      competitorFlaw:
        "Ahrefs and Semrush are too complex and costly for indie projects",
    },
  },
  "r/productivity": {
    subreddit: "r/productivity",
    author: "u/david_agency",
    karma: "3.2k",
    title: "Compiling weekly PDF client status updates takes half my Friday",
    comment:
      "Every Friday I copy screenshots from five different platforms into slide decks for client deliverables. It takes 4 hours. If a tool compiled these metrics automatically and formatted a branded PDF, I would buy it today.",
    insight: {
      idea: "Automated Agency PDF Reporter",
      score: 96,
      intensity: "High",
      solution:
        "Connects marketing accounts and analytics, auto compiling KPIs into customizable white label PDF reports delivered on schedule.",
      pricingSignal: "High urgency: Would buy immediately at $49 monthly",
      targetUser: "Boutique agency owners and consultants",
      competitorFlaw:
        "Looker Studio templates break and require continuous manual fixes",
    },
  },
  "r/marketing": {
    subreddit: "r/marketing",
    author: "u/sophia_growth",
    karma: "2.1k",
    title: "Tracking cold outreach bounce rates and scrubbing lists manually",
    comment:
      "We send cold email campaigns weekly. Tracking bounce events and cleaning deliverability hygiene takes forever across custom mailboxes. I need an automated webhook that scrubs bouncing contacts instantly.",
    insight: {
      idea: "Webhook Email Hygiene Worker",
      score: 91,
      intensity: "High",
      solution:
        "List hygiene worker that listens to webhook bounce notifications and scrubs invalid emails across all outreach sequences automatically.",
      pricingSignal: "Budget allocated: $39 monthly",
      targetUser: "Outbound sales reps and growth leads",
      competitorFlaw:
        "Native sequencing tools lack multi inbox bounce deduplication",
    },
  },
};

export function InteractiveDemo() {
  const [selectedSub, setSelectedSub] = useState<string>("r/SaaS");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const activePost = mockSubredditData[selectedSub];

  const handleSubChange = (sub: string) => {
    if (sub === selectedSub) return;
    setIsExtracting(true);
    setSelectedSub(sub);
    setTimeout(() => {
      setIsExtracting(false);
    }, 400);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-20 sm:px-6 sm:py-28">
      {/* Section Header */}
      <div className="mb-14 flex max-w-[680px] flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-[#ff4500] dark:border-white/10 dark:bg-zinc-900/60">
          Interactive extraction simulator
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          See raw Reddit complaints turn into validated SaaS blueprints
        </h2>
        <p className="text-base leading-relaxed font-normal text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
          Click across real niches below to see how our NLP engine extracts
          buyer intent, willingness to pay, and product opportunities.
        </p>
      </div>

      {/* Subreddit Selector Pills */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        {Object.keys(mockSubredditData).map((sub) => (
          <button
            key={sub}
            type="button"
            onClick={() => handleSubChange(sub)}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              selectedSub === sub
                ? "bg-[#ff4500] text-white shadow-md shadow-[#ff4500]/25"
                : "border border-black/10 bg-white/80 text-zinc-600 hover:border-black/20 hover:text-zinc-950 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-300"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Interactive Extraction Stage */}
      <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left Card: Raw Reddit Post */}
        <div className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xs backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] sm:p-8 lg:col-span-6 dark:border-white/10 dark:bg-zinc-900/70">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4500]/10 text-xs font-bold text-[#ff4500]">
                  r/
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {activePost.subreddit}
                </span>
                <span className="text-xs text-zinc-400">
                  · Posted by {activePost.author}
                </span>
              </div>
              <span className="rounded-md bg-black/5 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
                {activePost.karma} upvotes
              </span>
            </div>

            <h3 className="mb-3 text-lg font-bold text-balance text-zinc-900 dark:text-white">
              {activePost.title}
            </h3>

            <div className="mb-4 rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/5 dark:bg-zinc-950">
              <p className="text-sm leading-relaxed font-normal text-pretty text-zinc-700 italic dark:text-zinc-300">
                &ldquo;{activePost.comment}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/5 pt-4 text-xs font-medium text-zinc-500 dark:border-white/5">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-[#ff4500]" />
              42 verified comments analyzed
            </span>
            <span className="font-semibold text-emerald-600">
              Genuine buyer complaint
            </span>
          </div>
        </div>

        {/* Right Card: AI Extracted Opportunity Dossier */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#ff4500]/20 bg-linear-to-b from-[#ff4500]/5 via-white/80 to-white/90 p-6 shadow-lg shadow-[#ff4500]/5 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] sm:p-8 lg:col-span-6 dark:from-[#ff4500]/10 dark:via-zinc-900/90 dark:to-zinc-900/95">
          <div
            className={`${isExtracting ? "opacity-30 blur-xs" : "opacity-100"} transition-all duration-300`}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#ff4500]/15 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#ff4500]" />
                <span className="text-xs font-bold tracking-wider text-[#ff4500] uppercase">
                  AI Opportunity Extraction
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Flame className="h-3.5 w-3.5" />
                Score: {activePost.insight.score}/100
              </div>
            </div>

            <div className="mb-4">
              <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                Validated Concept
              </span>
              <h4 className="mt-1 text-xl font-bold text-zinc-950 dark:text-white">
                {activePost.insight.idea}
              </h4>
            </div>

            <div className="mb-6 space-y-3">
              <div className="rounded-xl border border-black/5 bg-white/80 p-3.5 dark:border-white/5 dark:bg-zinc-950/80">
                <span className="mb-1 block text-xs font-semibold text-zinc-500">
                  Proposed Solution
                </span>
                <p className="text-xs leading-relaxed font-medium text-zinc-800 sm:text-sm dark:text-zinc-200">
                  {activePost.insight.solution}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-black/5 bg-white/80 p-3 dark:border-white/5 dark:bg-zinc-950/80">
                  <span className="mb-1 block text-xs font-semibold text-zinc-500">
                    Buyer Willingness To Pay
                  </span>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {activePost.insight.pricingSignal}
                  </p>
                </div>
                <div className="rounded-xl border border-black/5 bg-white/80 p-3 dark:border-white/5 dark:bg-zinc-950/80">
                  <span className="mb-1 block text-xs font-semibold text-zinc-500">
                    Competitor Flaw
                  </span>
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {activePost.insight.competitorFlaw}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/5">
            <span className="text-xs font-medium text-zinc-500">
              Target Audience: {activePost.insight.targetUser}
            </span>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff4500] transition-colors hover:text-[#e03d00]"
            >
              <span>Mine this niche</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
