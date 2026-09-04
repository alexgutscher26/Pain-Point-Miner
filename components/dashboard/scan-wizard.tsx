"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Users,
  Sliders,
  CheckCircle2,
  Lock,
  Layers,
  Clock,
  Zap,
  Flame,
  ShieldAlert,
  Compass,
} from "lucide-react";
import { MINING_PRESETS, type MiningDepth } from "@/lib/mining-presets";
import {
  DEFAULT_TIME_WINDOW,
  getTimeWindowLabel,
  type TimeWindow,
} from "@/lib/time-window";
import { cn } from "@/lib/utils";
import { ScanPresetsModal } from "@/components/dashboard/scan-presets-modal";
import { type ScanPreset } from "@/lib/scan-presets";

export interface ScanWizardProps {
  keyword: string;
  setKeyword: (kw: string) => void;
  subreddits: string;
  setSubreddits: (subs: string) => void;
  selectedSubredditList: string[];
  onAddSubreddit: (sub: string) => void;
  onRemoveSubreddit: (sub: string) => void;
  miningDepth: MiningDepth;
  setMiningDepth: (depth: MiningDepth) => void;
  timeWindow: TimeWindow;
  setTimeWindow: (tw: TimeWindow) => void;
  customPatterns: string;
  setCustomPatterns: (patterns: string) => void;
  isSearching: boolean;
  onStartScan: () => void;
  allowedDepths?: MiningDepth[];
  maxSubredditsLimit?: number;
  onOpenUpgradeModal?: (message?: string) => void;
  estimatedCredits?: number;
  currentPlan?: "starter" | "growth" | "pro";
}

const TOPIC_PRESETS = [
  {
    label: "SaaS Onboarding & Churn",
    keyword: "churn cancel onboarding friction",
    suggestedSubs: ["saas", "startups", "entrepreneur"],
  },
  {
    label: "Freelancer Invoicing & Taxes",
    keyword: "unpaid invoice late payment bookkeeping",
    suggestedSubs: ["freelance", "smallbusiness", "entrepreneur"],
  },
  {
    label: "Developer API & CI/CD Pain",
    keyword: "ci cd build slow flaky tests docker",
    suggestedSubs: ["webdev", "devops", "reactjs", "programming"],
  },
  {
    label: "E-Commerce Returns & Logistics",
    keyword: "returns inventory stockout 3pl fulfillment",
    suggestedSubs: ["ecommerce", "dropship", "smallbusiness"],
  },
  {
    label: "AI Workflow & Voice Agents",
    keyword: "customer intake missed calls answering service",
    suggestedSubs: ["smallbusiness", "sales", "entrepreneur"],
  },
];

const COMMUNITY_BUNDLES = [
  {
    name: "Founder & SaaS Core",
    subs: ["saas", "startups", "entrepreneur", "smallbusiness"],
  },
  {
    name: "Developer & Engineering",
    subs: ["webdev", "reactjs", "node", "devops", "programming"],
  },
  {
    name: "Sales & Growth",
    subs: ["sales", "marketing", "growthhacking", "freelance"],
  },
];

export function ScanWizard({
  keyword,
  setKeyword,
  subreddits,
  setSubreddits,
  selectedSubredditList,
  onAddSubreddit,
  onRemoveSubreddit,
  miningDepth,
  setMiningDepth,
  timeWindow,
  setTimeWindow,
  customPatterns,
  setCustomPatterns,
  isSearching,
  onStartScan,
  allowedDepths = ["basic", "deep"],
  maxSubredditsLimit = 10,
  onOpenUpgradeModal,
  estimatedCredits = 1,
  currentPlan = "starter",
}: ScanWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const steps = [
    {
      step: 1,
      title: "Topic & Niche",
      icon: Compass,
      desc: "What are you hunting?",
    },
    { step: 2, title: "Communities", icon: Users, desc: "Target subreddits" },
    {
      step: 3,
      title: "Depth & Horizon",
      icon: Sliders,
      desc: "Extraction intensity",
    },
    {
      step: 4,
      title: "Review & Launch",
      icon: CheckCircle2,
      desc: "Verify configuration",
    },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const isStep1Valid = keyword.trim().length >= 2;
  const isStep2Valid = selectedSubredditList.length > 0;

  return (
    <div className="space-y-8 rounded-2xl border-2 border-white/10 bg-[#111111] p-6 shadow-xl sm:p-8">
      {/* Wizard Progress Bar */}
      <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-6 sm:grid-cols-4">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                if (s.step === 1) setCurrentStep(1);
                if (s.step === 2 && isStep1Valid) setCurrentStep(2);
                if (s.step === 3 && isStep1Valid && isStep2Valid)
                  setCurrentStep(3);
                if (s.step === 4 && isStep1Valid && isStep2Valid)
                  setCurrentStep(4);
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                isActive
                  ? "border-[#ff4500] bg-[#ff4500]/10 text-white shadow-xs"
                  : isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-300"
                    : "border-white/5 bg-white/2 text-zinc-500 opacity-60",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                  isActive
                    ? "bg-[#ff4500] text-white"
                    : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-zinc-400",
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : s.step}
              </div>
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-black tracking-wider text-white uppercase">
                  {s.title}
                </p>
                <p className="truncate text-[11px] text-zinc-400">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* STEP 1: Topic & Core Problem */}
      {currentStep === 1 && (
        <div className="animate-in fade-in-50 space-y-6 duration-300">
          <div>
            <span className="font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
              Step 1 of 4: Define Your Mining Target
            </span>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white uppercase sm:text-2xl">
              What friction or software category are you exploring?
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Enter keywords describing customer headaches, competitor tool
              names, or friction phrases.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs font-bold tracking-wider text-zinc-300 uppercase">
              Target Keyword or Problem Query
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. customer support ticketing, invoice chasing, slow onboarding"
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3.5 pl-11 font-mono text-sm text-white placeholder-zinc-500 shadow-inner focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] focus:outline-hidden"
                autoFocus
              />
              <Search className="absolute top-4 left-3.5 h-4 w-4 text-zinc-500" />
            </div>
            {keyword.trim().length > 0 && keyword.trim().length < 2 && (
              <p className="text-xs text-amber-400">
                Please enter at least 2 characters.
              </p>
            )}
          </div>

          {/* Quick Preset Ideas */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-zinc-400 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Or choose a high-converting niche template:</span>
              </p>
              <ScanPresetsModal
                onSelectPreset={(p: ScanPreset) => {
                  setKeyword(p.keyword);
                  setSubreddits(p.subreddits.join(", "));
                  setMiningDepth(p.miningDepth);
                  setTimeWindow(p.timeWindow);
                  if (p.customPatterns)
                    setCustomPatterns(p.customPatterns.join(", "));
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {TOPIC_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setKeyword(preset.keyword);
                    setSubreddits(preset.suggestedSubs.join(", "));
                  }}
                  className="group flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-3.5 text-left transition-all hover:border-[#ff4500]/50 hover:bg-[#ff4500]/5"
                >
                  <span className="font-mono text-xs font-bold text-zinc-200 group-hover:text-[#ff8a57]">
                    {preset.label}
                  </span>
                  <span className="mt-1 max-w-full truncate font-mono text-[11px] text-zinc-400">
                    Query: &quot;{preset.keyword}&quot;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Subreddits & Communities */}
      {currentStep === 2 && (
        <div className="animate-in fade-in-50 space-y-6 duration-300">
          <div>
            <span className="font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
              Step 2 of 4: Select Discussion Hubs
            </span>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white uppercase sm:text-2xl">
              Where do your target users vent and ask for recommendations?
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Add subreddits separated by commas or select from popular
              community bundles.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold tracking-wider text-zinc-300 uppercase">
                Subreddits ({selectedSubredditList.length} of{" "}
                {maxSubredditsLimit})
              </label>
              <span className="font-mono text-xs text-zinc-400">
                {selectedSubredditList.length === 0
                  ? "At least 1 required"
                  : "Valid"}
              </span>
            </div>
            <textarea
              rows={2}
              value={subreddits}
              onChange={(e) => setSubreddits(e.target.value)}
              placeholder="e.g. saas, startups, smallbusiness, webdev"
              className="w-full rounded-xl border border-white/15 bg-black p-3.5 font-mono text-sm text-white placeholder-zinc-500 shadow-inner focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] focus:outline-hidden"
            />
          </div>

          {/* Active Subreddit Badges */}
          {selectedSubredditList.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[11px] font-bold text-zinc-400 uppercase">
                Active Selection:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSubredditList.map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff4500]/30 bg-[#ff4500]/10 px-3 py-1 font-mono text-xs text-[#ff8a57]"
                  >
                    <span>r/{sub}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveSubreddit(sub)}
                      className="ml-1 cursor-pointer text-zinc-400 hover:text-white"
                      title="Remove subreddit"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Community Bundles */}
          <div className="space-y-3 pt-2">
            <p className="font-mono text-xs font-bold tracking-wider text-zinc-400 uppercase">
              1-Click Community Bundles:
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {COMMUNITY_BUNDLES.map((bundle) => (
                <button
                  key={bundle.name}
                  type="button"
                  onClick={() => {
                    const merged = Array.from(
                      new Set([...selectedSubredditList, ...bundle.subs]),
                    );
                    setSubreddits(merged.join(", "));
                  }}
                  className="flex flex-col items-start rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-all hover:border-[#ff4500]/50 hover:bg-[#ff4500]/5"
                >
                  <span className="font-mono text-xs font-bold text-white">
                    {bundle.name}
                  </span>
                  <span className="mt-1 font-mono text-[10px] text-zinc-400">
                    +{bundle.subs.map((s) => `r/${s}`).join(", ")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Depth & Time Horizon */}
      {currentStep === 3 && (
        <div className="animate-in fade-in-50 space-y-6 duration-300">
          <div>
            <span className="font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
              Step 3 of 4: Depth & Time Horizon
            </span>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white uppercase sm:text-2xl">
              Choose extraction intensity and historical window
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Deeper scans crawl comments and multi-sort indices for maximum
              problem detection.
            </p>
          </div>

          {/* Mining Depth Cards */}
          <div className="space-y-3">
            <label className="font-mono text-xs font-bold tracking-wider text-zinc-300 uppercase">
              Mining Depth Tier
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(MINING_PRESETS) as MiningDepth[]).map((d) => {
                const preset = MINING_PRESETS[d];
                const isSelected = miningDepth === d;
                const isAllowed = allowedDepths.includes(d);

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      if (!isAllowed) {
                        onOpenUpgradeModal?.(
                          `The ${preset.label} tier requires an upgraded plan. Upgrade to unlock deep comment tree traversal.`,
                        );
                        return;
                      }
                      setMiningDepth(d);
                    }}
                    className={cn(
                      "relative flex flex-col rounded-xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-[#ff4500] bg-[#ff4500]/10 text-white shadow-md"
                        : isAllowed
                          ? "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                          : "cursor-not-allowed border-white/5 bg-black/40 text-zinc-600 opacity-75",
                    )}
                  >
                    {!isAllowed && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-400">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Pro</span>
                      </div>
                    )}
                    <span className="font-mono text-sm font-black text-white uppercase">
                      {preset.label}
                    </span>
                    <span className="mt-1 text-[11px] leading-snug text-zinc-400">
                      {preset.description}
                    </span>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 font-mono text-[10px] text-zinc-400">
                      <span>{preset.postsPerSub} posts/sub</span>
                      <span className="font-bold text-amber-400">
                        {d === "basic"
                          ? "0.5 CR"
                          : d === "deep"
                            ? "2 CR"
                            : d === "advanced"
                              ? "5 CR"
                              : "10 CR"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Window Buttons */}
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-zinc-300 uppercase">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>Historical Time Horizon</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(["30d", "90d", "1y", "all"] as TimeWindow[]).map((tw) => (
                <button
                  key={tw}
                  type="button"
                  onClick={() => setTimeWindow(tw)}
                  className={cn(
                    "rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase transition-all",
                    timeWindow === tw
                      ? "border border-[#ff4500] bg-[#ff4500] text-white shadow-xs"
                      : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {getTimeWindowLabel(tw)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Launch */}
      {currentStep === 4 && (
        <div className="animate-in fade-in-50 space-y-6 duration-300">
          <div>
            <span className="font-mono text-[10px] font-black tracking-widest text-emerald-400 uppercase">
              Step 4 of 4: Review Scan Configuration
            </span>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white uppercase sm:text-2xl">
              Ready to execute your intelligence run
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Confirm your scan parameters below. Mining will start immediately
              and stream results in real time.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-[#161616] p-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400 uppercase">Target Query</span>
              <span className="font-bold text-white">
                &quot;{keyword}&quot;
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400 uppercase">
                Target Communities
              </span>
              <span className="font-bold text-[#ff8a57]">
                {selectedSubredditList.map((s) => `r/${s}`).join(", ")}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400 uppercase">Depth Tier</span>
              <span className="font-bold text-white uppercase">
                {MINING_PRESETS[miningDepth].label} (
                {MINING_PRESETS[miningDepth].postsPerSub} posts/sub)
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400 uppercase">Time Window</span>
              <span className="font-bold text-white">
                {getTimeWindowLabel(timeWindow)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-zinc-400 uppercase">Estimated Credits</span>
              <span className="text-sm font-bold text-amber-400">
                {estimatedCredits} CR
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Footer Navigation */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 font-mono text-xs font-bold text-zinc-300 uppercase transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !isStep1Valid) ||
              (currentStep === 2 && !isStep2Valid)
            }
            className="flex items-center gap-2 rounded-xl border border-[#ff8a57] bg-[#ff4500] px-6 py-2.5 font-mono text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-[#ff571a] active:scale-95 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-zinc-600"
          >
            <span>Next Step</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartScan}
            disabled={isSearching || !isStep1Valid || !isStep2Valid}
            className="flex items-center gap-2 rounded-xl border border-emerald-500 bg-emerald-600 px-8 py-3 font-mono text-xs font-black tracking-wider text-white uppercase shadow-lg shadow-emerald-950/40 transition-all hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-zinc-600"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {isSearching ? "Launching Run..." : "Launch Mining Run →"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
