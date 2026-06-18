"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, Flame, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface MockRedditPost {
  subreddit: string;
  username: string;
  karma: string;
  title: string;
  comment: string;
  insight: {
    idea: string;
    score: number;
    intensity: "High" | "Medium";
    solution: string;
    model: string;
  };
}

const mockSubredditData: Record<string, MockRedditPost> = {
  "r/SaaS": {
    subreddit: "r/SaaS",
    username: "u/saas_builder_99",
    karma: "1.4k",
    title: "Is anyone else tired of managing user billing manually? Stripe is great but...",
    comment: "Yes! We spend 6 hours every month reconciling custom enterprise contracts that Stripe Billing doesn't handle natively. A simple contract-to-Stripe sync app would save us so much time and client friction. I'd pay $100/mo just to automate this.",
    insight: {
      idea: "Enterprise Stripe Billing Syncer",
      score: 94,
      intensity: "High",
      solution: "A lightweight middleware app that reads PDF/Word enterprise contracts, extracts tiers automatically, and automatically maps/updates Stripe custom customer subscriptions via API.",
      model: "SaaS ($49 - $199/month)",
    },
  },
  "r/indiehackers": {
    subreddit: "r/indiehackers",
    username: "u/bootstrap_dev",
    karma: "940",
    title: "Struggling to find affordable rank tracking tools",
    comment: "Existing SEO tools charge $120+/mo just to track basic keyword volume. I'm a bootstrapper building side projects—I only need to track 5 keywords. I would easily pay $15/mo for a dead-simple tracker that does only that.",
    insight: {
      idea: "Micro Rank Tracker",
      score: 78,
      intensity: "Medium",
      solution: "A barebones daily rank tracker targeting solopreneurs and bootstrappers. Clean dashboard, limited to 10 keywords, email alerts, and zero bloat.",
      model: "Micro-SaaS ($9 - $19/month)",
    },
  },
  "r/productivity": {
    subreddit: "r/productivity",
    username: "u/busy_manager",
    karma: "3.2k",
    title: "Need a tool to generate automated client update reports",
    comment: "Every Friday I copy-paste screenshots and metrics from 5 dashboards (ads, traffic, sheets) into a PDF report for clients. It takes 4 hours. If there was a tool to auto-generate this weekly and email them, I'd pay $50/mo instantly.",
    insight: {
      idea: "Automated Client PDF Reporter",
      score: 96,
      intensity: "High",
      solution: "Integrates with popular marketing/data sources, compiles metrics every Thursday night, and auto-generates styled PDF weekly updates sent directly to clients.",
      model: "SaaS ($29 - $99/month)",
    },
  },
  "r/marketing": {
    subreddit: "r/marketing",
    username: "u/growth_lead",
    karma: "2.1k",
    title: "Tracking cold email bounces is a nightmare",
    comment: "We send 2,000 cold emails a week. Tracking bounce rates and updating list hygiene manually takes forever. Instantly/Smartlead are okay but missing auto-cleanup rules for custom SMTP. I'd pay for a tool that auto-scrubs custom lists on trigger.",
    insight: {
      idea: "Auto SMTP List Cleaner",
      score: 91,
      intensity: "High",
      solution: "A webhook-driven list hygiene worker that connects to custom SMTP providers and auto-scrubs/removes bouncing emails from active outreach databases in real-time.",
      model: "SaaS ($19 - $79/month)",
    },
  },
};

export function InteractiveDemo() {
  const [selectedSub, setSelectedSub] = useState<string>("r/SaaS");
  const [step, setStep] = useState<"idle" | "scanning" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const activePost = mockSubredditData[selectedSub];

  const handleAnalyze = () => {
    setStep("scanning");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep("done");
          return 100;
        }
        return prev + 5;
      });
    }, 40);
  };

  const changeSubreddit = (sub: string) => {
    setSelectedSub(sub);
    setStep("idle");
    setProgress(0);
  };

  return (
    <section className="flex w-full justify-center px-6 py-24 sm:py-32">
      <div className="w-full max-w-5xl">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-[11px] font-extrabold tracking-widest text-[#ff4500] uppercase">
            LIVE PLAYGROUND
          </span>
          <h2 className="mb-6 text-[36px] leading-tight font-extrabold tracking-tight text-zinc-900 sm:text-[44px]">
            Test our Mining Engine
          </h2>
          <p className="mx-auto max-w-2xl text-[16px] font-medium text-zinc-500">
            Select a community below to review a real customer complaint, then click analyze to see how ThreddIQ extracts validated business opportunities.
          </p>
        </div>

        {/* Subreddit Tab Selectors */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {Object.keys(mockSubredditData).map((subName) => (
            <button
              key={subName}
              onClick={() => changeSubreddit(subName)}
              className={`rounded-full px-5 py-2.5 text-[12px] font-extrabold transition-all shadow-xs ${
                selectedSub === subName
                  ? "border border-[#ff4500]/20 bg-[#ff4500]/5 text-[#ff4500]"
                  : "border border-zinc-200/60 bg-white text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {subName}
            </button>
          ))}
        </div>

        {/* Workbench Workspace Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
          {/* Left Pane: Reddit Thread View */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-black/[0.05] bg-white/70 backdrop-blur-md p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-black/[0.03] pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4500]/10 text-[#ff4500]">
                    <MessageSquare className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#ff4500] tracking-tight">{activePost.subreddit}</span>
                </div>
                <span className="text-[10px] font-semibold text-zinc-400">Karma: {activePost.karma}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400">Post Title</span>
                <h3 className="text-[14px] font-extrabold text-zinc-900 mt-1 leading-snug">{activePost.title}</h3>
              </div>

              <div className="relative mt-2 rounded-xl border border-black/5 bg-zinc-50/50 p-4">
                <span className="text-[10px] font-bold text-zinc-400">Frustration Comment</span>
                <p className="text-[12px] font-medium text-zinc-700 leading-relaxed mt-1.5 italic">
                  &ldquo;{activePost.comment}&rdquo;
                </p>
                {step === "scanning" && (
                  <div className="absolute inset-0 bg-yellow-500/10 mix-blend-multiply rounded-xl animate-pulse border border-yellow-400/40"></div>
                )}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={step === "scanning"}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 disabled:bg-zinc-300 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-current animate-pulse" />
              <span>{step === "scanning" ? "Running Scanners..." : "Analyze Frustrations"}</span>
            </button>
          </div>

          {/* Right Pane: Mining Output */}
          <div className="lg:col-span-7 flex flex-col justify-center rounded-2xl border border-black/[0.05] bg-white/70 backdrop-blur-md p-6 shadow-sm min-h-[340px]">
            
            {step === "idle" && (
              <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-100 rounded-xl flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff4500]/5 text-[#ff4500] mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">Mining Engine Ready</h3>
                <p className="text-[12px] text-zinc-500 max-w-[280px] mt-1.5 leading-relaxed">
                  Click &ldquo;Analyze Frustrations&rdquo; on the left to activate natural language parsing.
                </p>
              </div>
            )}

            {step === "scanning" && (
              <div className="flex flex-col items-center justify-center space-y-6 flex-1 py-12">
                <div className="relative">
                  <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-zinc-100 border-t-[#ff4500]"></div>
                  <Sparkles className="absolute inset-0 m-auto h-4 w-4 animate-pulse text-[#ff4500]" />
                </div>
                <div className="w-full max-w-xs space-y-3 text-center">
                  <p className="text-[10px] font-bold tracking-widest text-[#ff4500] uppercase animate-pulse">
                    {progress < 50 ? "Highlighting Pain Indicators..." : "Formulating SaaS Opportunity..."}
                  </p>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff4500] transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {step === "done" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col justify-between flex-1">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-black/[0.03] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-green-500/10 p-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <h4 className="text-[13px] font-black tracking-tight text-zinc-900 uppercase">Mined SaaS Concept</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider ${
                        activePost.insight.intensity === "High"
                          ? "bg-red-50 border border-red-100 text-red-500"
                          : "bg-amber-50 border border-amber-100 text-amber-600"
                      }`}
                    >
                      {activePost.insight.intensity} Urgency
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Recommended SaaS Product</span>
                      <h5 className="text-[16px] font-extrabold text-zinc-950 leading-tight">{activePost.insight.idea}</h5>
                    </div>
                    <div className="md:col-span-4 md:text-right space-y-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase block">Monetization Model</span>
                      <span className="inline-block text-[11px] font-bold text-zinc-700 bg-zinc-100 border border-black/5 px-2.5 py-0.5 rounded">{activePost.insight.model}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/5 bg-zinc-50/50 p-4">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Target Solution Specs</span>
                    <p className="text-[12px] font-medium text-zinc-600 leading-relaxed">
                      {activePost.insight.solution}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-[#ff4500] fill-current" />
                      <span className="text-xs font-bold text-zinc-800">Desperation Score:</span>
                    </div>
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden max-w-[120px]">
                      <div className="h-full bg-[#ff4500] rounded-full" style={{ width: `${activePost.insight.score}%` }}></div>
                    </div>
                    <span className="text-xs font-extrabold text-[#ff4500]">{activePost.insight.score}/100</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/[0.03] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span className="text-[11px] font-medium">Validated market demand signal</span>
                  </div>
                  <Link
                    href="/sign-up"
                    className="group flex items-center justify-center gap-1.5 rounded-full bg-[#ff4500] px-5 py-2.5 text-[11px] font-bold text-white transition-all hover:bg-[#e03d00]"
                  >
                    <span>Mine similar ideas</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
