"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Rocket,
  Zap,
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
  Loader2,
  Lock,
  Database,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { MINING_PRESETS, type MiningDepth } from "@/lib/mining-presets";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_TIME_WINDOW,
  getTimeWindowLabel,
  type TimeWindow,
} from "@/lib/time-window";

const SEARCH_DRAFT_STORAGE_KEY = "threddiq-search-draft-v1";

type SearchDraft = {
  keyword: string;
  subreddits: string;
  customPatterns: string;
  miningDepth: "basic" | "deep" | "advanced";
  timeWindow: TimeWindow;
  savedAt: string;
};

type SubredditSuggestion = {
  name: string;
  subscribers: number;
  description: string;
  activeUsers?: number;
};

type BillingEntitlementsResponse = {
  plan: "starter" | "growth" | "pro";
  hasActiveSubscription: boolean;
  trialActive: boolean;
  planPurchaseRequired: boolean;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  entitlements: {
    monthlyScans: number | null;
    maxSubredditsPerSearch: number | null;
    allowedMiningDepths: MiningDepth[];
    canSaveReports: boolean;
    hasTrendDetection: boolean;
    hasSaasOpportunities: boolean;
    hasCustomPatterns: boolean;
  };
  usage: {
    monthlyScansUsed: number;
    monthlyScansLimit: number | null;
    monthlyScansRemaining: number | null;
  };
};
type PlanErrorCode =
  | "PLAN_REQUIRED"
  | "PLAN_LIMIT_REACHED"
  | "PLAN_UPGRADE_REQUIRED";

const DEFAULT_SUBREDDIT_COUNT = 5;
const DEFAULT_MIN_SCORE = 70;
const DEFAULT_LOCALE = "United States";
const COMMON_SUBREDDITS_BY_LOCALE: Record<string, string[]> = {
  "united states": [
    "saas",
    "entrepreneur",
    "startups",
    "smallbusiness",
    "sales",
    "marketing",
    "freelance",
  ],
  "united kingdom": [
    "ukbusiness",
    "smallbusinessuk",
    "entrepreneur",
    "startups",
    "marketing",
  ],
  canada: [
    "canadabusiness",
    "entrepreneur",
    "startups",
    "smallbusiness",
    "marketing",
  ],
  australia: [
    "ausfinance",
    "entrepreneur",
    "startups",
    "smallbusiness",
    "marketing",
  ],
  india: [
    "startups_india",
    "entrepreneur",
    "smallbusiness",
    "marketing",
    "india",
  ],
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [miningDepth, setMiningDepth] = useState<MiningDepth>("basic");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(DEFAULT_TIME_WINDOW);
  const [keyword, setKeyword] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [customPatterns, setCustomPatterns] = useState("");
  const [suggestedSubreddits, setSuggestedSubreddits] = useState<
    SubredditSuggestion[]
  >([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [defaultSubredditCount, setDefaultSubredditCount] = useState(
    DEFAULT_SUBREDDIT_COUNT,
  );
  const [minimumOpportunityScore, setMinimumOpportunityScore] =
    useState(DEFAULT_MIN_SCORE);
  const [defaultLocale, setDefaultLocale] = useState(DEFAULT_LOCALE);
  const [billing, setBilling] = useState<BillingEntitlementsResponse | null>(
    null,
  );
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planDialogMessage, setPlanDialogMessage] = useState(
    "Your free trial has ended. Purchase a plan to continue.",
  );
  const requestInFlightRef = useRef(false);
  const planSubredditCap = billing?.entitlements.maxSubredditsPerSearch ?? 10;
  const normalizedVisibleCommunityCount = Math.max(
    1,
    Math.min(defaultSubredditCount, planSubredditCap),
  );
  const localeCommunities =
    COMMON_SUBREDDITS_BY_LOCALE[defaultLocale.trim().toLowerCase()] ??
    COMMON_SUBREDDITS_BY_LOCALE[DEFAULT_LOCALE.toLowerCase()];
  const visibleCommunities = localeCommunities.slice(
    0,
    normalizedVisibleCommunityCount,
  );
  const trialEnded = billing?.planPurchaseRequired ?? false;
  const isAtScanLimit =
    billing?.usage.monthlyScansLimit !== null &&
    (billing?.usage.monthlyScansUsed ?? 0) +
      MINING_PRESETS[miningDepth].estimatedCredits >
      (billing?.usage.monthlyScansLimit ?? 0);

  const hasCustomPatternsEntitlement =
    billing?.entitlements.hasCustomPatterns ?? false;

  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(SEARCH_DRAFT_STORAGE_KEY);
      if (!rawDraft) return;

      const parsedDraft = JSON.parse(rawDraft) as SearchDraft;
      setKeyword(parsedDraft.keyword ?? "");
      setSubreddits(parsedDraft.subreddits ?? "");
      setCustomPatterns(parsedDraft.customPatterns ?? "");
      setMiningDepth(
        parsedDraft.miningDepth === "advanced"
          ? "advanced"
          : parsedDraft.miningDepth === "deep"
            ? "deep"
            : "basic",
      );
      setTimeWindow(
        parsedDraft.timeWindow === "24h" ||
          parsedDraft.timeWindow === "7d" ||
          parsedDraft.timeWindow === "30d"
          ? parsedDraft.timeWindow
          : DEFAULT_TIME_WINDOW,
      );
      setDraftSavedAt(parsedDraft.savedAt ?? null);
    } catch {
      localStorage.removeItem(SEARCH_DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const keywordFromQuery = searchParams.get("keyword")?.trim() ?? "";
    if (!keywordFromQuery) return;
    setKeyword((current) =>
      current.trim().length > 0 ? current : keywordFromQuery,
    );
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadDefaults() {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) return;
        const data = (await response.json()) as {
          defaultSubredditCount?: number;
          minimumOpportunityScore?: number;
          defaultLocale?: string;
        };
        if (cancelled) return;

        if (typeof data.defaultSubredditCount === "number") {
          setDefaultSubredditCount(
            Math.max(1, Math.min(25, Math.round(data.defaultSubredditCount))),
          );
        }
        if (typeof data.minimumOpportunityScore === "number") {
          setMinimumOpportunityScore(
            Math.max(
              0,
              Math.min(100, Math.round(data.minimumOpportunityScore)),
            ),
          );
        }
        if (
          typeof data.defaultLocale === "string" &&
          data.defaultLocale.trim().length > 0
        ) {
          setDefaultLocale(data.defaultLocale.trim());
        }
      } catch {
        // Keep UI usable with fallback defaults if settings cannot be loaded.
      }
    }

    void loadDefaults();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBillingEntitlements() {
      try {
        const response = await fetch("/api/billing/entitlements");
        if (!response.ok) return;
        const data = (await response.json()) as BillingEntitlementsResponse;
        if (!cancelled) {
          setBilling(data);
          setMiningDepth((current) =>
            data.entitlements.allowedMiningDepths.includes(current)
              ? current
              : (data.entitlements.allowedMiningDepths[0] ?? "basic"),
          );
        }
      } catch {
        // Keep page usable even if plan data cannot be loaded.
      }
    }
    void loadBillingEntitlements();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSuggestSubreddits = async () => {
    if (trialEnded) {
      setPlanDialogMessage(
        "Your free trial has ended. Purchase a plan to continue.",
      );
      setPlanDialogOpen(true);
      return;
    }

    if (!keyword || keyword.length < 3) return;

    setIsSuggesting(true);
    try {
      const response = await fetch("/api/search/suggest-subreddits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          locale: defaultLocale,
          count: Math.max(1, Math.min(defaultSubredditCount, 15)),
        }),
      });
      const data = await response.json();
      setSuggestedSubreddits(data.subreddits);
    } catch (error) {
      console.error("Error suggesting subreddits:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const addSubreddit = (sub: string) => {
    const current = subreddits
      .split(",")
      .map((s) => s.trim().replace("r/", ""))
      .filter(Boolean);
    if (!current.includes(sub)) {
      setSubreddits([...current, sub].map((s) => `r/${s}`).join(", "));
    }
  };

  const handleStartMining = async () => {
    if (requestInFlightRef.current || isLoading) {
      return;
    }

    if (!keyword) {
      toast.error("Please enter a keyword to start mining.");
      return;
    }

    const allowedDepths = billing?.entitlements.allowedMiningDepths ?? [
      "basic",
    ];
    if (!allowedDepths.includes(miningDepth)) {
      toast.error("This mining depth is not available on your current plan.");
      return;
    }

    const subredditCount = subreddits
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean).length;
    const maxSubreddits = billing?.entitlements.maxSubredditsPerSearch;
    if (
      maxSubreddits !== null &&
      maxSubreddits !== undefined &&
      subredditCount > maxSubreddits
    ) {
      toast.error(
        `Your current plan supports up to ${maxSubreddits} subreddits per search.`,
      );
      return;
    }

    requestInFlightRef.current = true;
    setIsLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          subreddits,
          customPatterns: customPatterns
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          miningDepth,
          timeWindow,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          code?: string;
          message?: string;
        } | null;
        const code = errorPayload?.code as PlanErrorCode | undefined;
        if (
          code === "PLAN_REQUIRED" ||
          code === "PLAN_LIMIT_REACHED" ||
          code === "PLAN_UPGRADE_REQUIRED"
        ) {
          setPlanDialogMessage(
            errorPayload?.message ??
              "Your free trial has ended. Purchase a plan to continue.",
          );
          setPlanDialogOpen(true);
          return;
        }
        throw new Error(errorPayload?.message ?? "Failed to start mining");
      }

      const data = await response.json();
      if (data?.duplicate) {
        toast.info(
          "Investigation already running. Redirecting to existing analysis...",
        );
      } else {
        toast.success("Mining started successfully!");
      }
      router.push(`/dashboard/analysis?id=${data.scraperId}`);
    } catch (error) {
      console.error("Mining error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "There was an error starting the investigation.",
        {
          action: {
            label: "Retry",
            onClick: () => void handleStartMining(),
          },
        },
      );
    } finally {
      setIsLoading(false);
      requestInFlightRef.current = false;
    }
  };

  const handleSaveDraft = () => {
    const draft: SearchDraft = {
      keyword: keyword.trim(),
      subreddits: subreddits.trim(),
      customPatterns: customPatterns.trim(),
      miningDepth,
      timeWindow,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(SEARCH_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setDraftSavedAt(draft.savedAt);
    toast.success("Draft saved.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="bg-[#111] border-2 border-white/15 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Plan Required
            </DialogTitle>
            <DialogDescription className="font-mono text-zinc-300">
              {planDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setPlanDialogOpen(false)}
              className="px-4 py-2 bg-white/5 border border-white/20 font-mono text-sm font-bold uppercase tracking-wide"
            >
              Close
            </button>
            <Link
              href="/dashboard/billing"
              className="px-4 py-2 border border-[#ff8a57] bg-[#ff4500] text-white font-mono text-sm font-bold uppercase tracking-wide"
            >
              Purchase Plan
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-10">
          {trialEnded ? (
            <div className="border border-amber-400/35 bg-amber-500/8 px-5 py-4">
              <p className="font-mono text-[11px] font-black uppercase tracking-widest text-amber-300 mb-1">
                Read-Only After Trial
              </p>
              <p className="text-sm text-amber-100 font-semibold">
                You can still explore the app and review past results. New scans
                and AI suggestions require a paid plan.
              </p>
            </div>
          ) : null}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-[#ff4500]"></div>
              <p className="font-mono text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">
                New Investigation
              </p>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-4">
              What are we looking for?
            </h2>
            <p className="text-zinc-400 font-medium text-sm max-w-xl">
              Define the niche or problem space you want to explore across
              Reddit communities. Our AI will extract high-intent pain points.
            </p>
          </div>

          <div className="space-y-8">
            {/* Keyword Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Keyword or Niche
                <div className="w-1.5 h-1.5 bg-[#ff4500]"></div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. cold email, property management, SaaS churn"
                  className="w-full relative z-10 bg-[#0c0c0c] border-2 border-white/15 px-4 py-4 text-white text-base font-medium focus:outline-none focus:border-[#ff4500]/70 transition-colors placeholder:text-zinc-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>

            {/* Subreddits Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Target Subreddits{" "}
                  <span className="font-mono text-[9px] text-zinc-600">
                    (Optional)
                  </span>
                </label>
                <button
                  onClick={handleSuggestSubreddits}
                  disabled={isSuggesting || !keyword}
                  className="font-mono text-[10px] font-black uppercase tracking-widest text-[#ff4500] hover:text-[#ff8c00] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed group/suggest"
                >
                  {isSuggesting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 group-hover/suggest:scale-125 transition-transform" />
                  )}
                  Auto-Suggest (
                  {Math.max(1, Math.min(defaultSubredditCount, 15))})
                </button>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={subreddits}
                  onChange={(e) => setSubreddits(e.target.value)}
                  placeholder="r/sales, r/realestate, r/entrepreneur"
                  className="w-full relative z-10 bg-[#0c0c0c] border-2 border-white/15 px-4 py-4 pl-12 text-white text-base font-medium focus:outline-none focus:border-[#ff4500]/70 transition-colors placeholder:text-zinc-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)]"
                />
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 z-20 pointer-events-none" />
              </div>

              {suggestedSubreddits.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="font-mono text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                    AI & Reddit Discovery Results
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedSubreddits.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => addSubreddit(sub.name)}
                        className="group/item relative flex flex-col p-4 border border-[#ff4500]/30 bg-[#ff4500]/5 hover:bg-[#ff4500]/10 hover:border-[#ff4500]/60 transition-all text-left shadow-[2px_2px_0px_0px_rgba(255,69,0,0.1)]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-black text-white group-hover/item:text-[#ff8a57] transition-colors">
                            r/{sub.name}
                          </span>
                          <span className="font-mono text-[10px] text-[#ff8a57] font-bold">
                            {Intl.NumberFormat("en-US", {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(sub.subscribers)}{" "}
                            subs
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium line-clamp-2 leading-relaxed h-8">
                          {sub.description || "No description provided."}
                        </p>
                        <div className="mt-2 flex items-center gap-1 font-mono text-[9px] font-black text-[#ff4500] uppercase opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Add to Scan
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <p className="w-full font-mono text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                  Common Core Communities ({defaultLocale})
                </p>
                {visibleCommunities.map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => addSubreddit(sub)}
                    className="px-3 py-1.5 border border-white/15 bg-white/2 font-mono text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    + r/{sub}
                  </button>
                ))}
              </div>

              <p className="font-mono text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                Max {MINING_PRESETS[miningDepth].subreddits} subreddits for {MINING_PRESETS[miningDepth].name}.
                Separate multiple with commas.
              </p>
            </div>

            <div className={`space-y-3 transition-opacity duration-300 ${!hasCustomPatternsEntitlement && "opacity-75"}`}>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Custom Intelligence Patterns{" "}
                  <span className="font-mono text-[9px] text-zinc-600">
                    (Optional)
                  </span>
                </label>
                {!hasCustomPatternsEntitlement && (
                  <Link
                    href="/dashboard/billing"
                    className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <Lock className="w-3 h-3" />
                    Pro Only
                  </Link>
                )}
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={customPatterns}
                  onChange={(e) => setCustomPatterns(e.target.value)}
                  disabled={!hasCustomPatternsEntitlement}
                  placeholder={
                    hasCustomPatternsEntitlement
                      ? "e.g. mentions of HubSpot, frustration with pricing, legal compliance"
                      : "Upgrade to Pro to unlock custom signals"
                  }
                  className={`w-full relative z-10 bg-[#0c0c0c] border-2 px-4 py-4 pl-12 text-white text-base font-medium focus:outline-none transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)] ${
                    hasCustomPatternsEntitlement
                      ? "border-white/15 focus:border-amber-400/70 placeholder:text-zinc-700"
                      : "border-amber-500/20 cursor-not-allowed placeholder:text-zinc-800"
                  }`}
                />
                <Sparkles 
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-20 pointer-events-none transition-colors ${
                    hasCustomPatternsEntitlement ? "text-amber-500/60" : "text-zinc-800"
                  }`} 
                />
                
                {!hasCustomPatternsEntitlement && (
                  <div 
                    className="absolute inset-x-0 -bottom-2 flex justify-center z-20 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="bg-[#111] border border-amber-500/30 px-3 py-1 shadow-xl">
                      <p className="font-mono text-[8px] font-black uppercase tracking-tighter text-amber-500/80">
                        Restricted Parameter
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <p className="font-mono text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                {hasCustomPatternsEntitlement 
                  ? "Comma-separated signals you want the AI to specifically hunt for."
                  : "Precision targeting for niche problems is a Pro-tier exclusive."}
              </p>
            </div>

            <div className="space-y-4">
              <label className="font-mono text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
                Expert Discovery Presets
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["basic", "deep", "advanced"] as const).map((depth) => {
                  const preset = MINING_PRESETS[depth];
                  const isAllowed = billing
                    ? billing.entitlements.allowedMiningDepths.includes(depth)
                    : true;
                  const isActive = miningDepth === depth;

                  return (
                    <button
                      key={depth}
                      onClick={() => setMiningDepth(depth)}
                      disabled={!isAllowed}
                      className={`relative p-6 border-2 transition-all text-left flex flex-col gap-4 overflow-hidden group disabled:opacity-45 disabled:cursor-not-allowed ${
                        isActive
                          ? "bg-[#ff4500]/10 border-[#ff4500]/70 shadow-[4px_4px_0px_0px_rgba(255,69,0,0.3)]"
                          : "bg-[#0c0c0c] border-white/15 hover:border-white/35"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`p-3 border ${
                            isActive
                              ? "bg-[#ff4500] border-[#ff8a57] text-white"
                              : "bg-white/5 border-white/15 text-zinc-500"
                          }`}
                        >
                          {depth === "basic" ? (
                            <Zap className="w-5 h-5" />
                          ) : (
                            <Sparkles className="w-5 h-5" />
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isActive ? "border-[#ff4500]" : "border-zinc-800"
                          }`}
                        >
                          {isActive && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff4500]"></div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-mono font-black uppercase tracking-widest text-[12px] ${
                              isActive ? "text-white" : "text-zinc-400"
                            }`}
                          >
                            {preset.name}
                          </p>
                          <span className="font-mono text-[9px] font-black px-1.5 py-0.5 bg-white/5 border border-white/10 text-zinc-500">
                            {preset.estimatedCredits} CR
                          </span>
                        </div>
                        <p className="text-zinc-500 text-[11px] font-bold leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="font-mono text-[8px] text-zinc-600 uppercase font-black">
                            Subreddits
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold">
                            {preset.subreddits} communities
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-mono text-[8px] text-zinc-600 uppercase font-black">
                            Analysis
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold">
                            {preset.sortModes} mode
                            {preset.sortModes > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {!isAllowed && (
                        <div className="absolute top-0 right-0 p-2">
                          <span className="inline-flex items-center gap-1 font-mono text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-400/35">
                            <Lock className="w-2.5 h-2.5" />
                            Upgrade
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {billing ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <p className="font-mono text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    Plan: {billing.plan.toUpperCase()} | Monthly Credit Pool:{" "}
                    {billing.usage.monthlyScansUsed.toFixed(1)}
                    {billing.usage.monthlyScansLimit === null
                      ? "/Unlimited"
                      : `/${billing.usage.monthlyScansLimit.toFixed(1)}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanDialogMessage(
                        "Credits (CR) represent the resource intensity of a scan. Basic = 0.5 CR, Deep = 2 CR, Advanced = 5 CR. Your monthly plan gives you a fixed pool of credits that reset every 30 days. No hidden fees, just value-based mining."
                      );
                      setPlanDialogOpen(true);
                    }}
                    className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-widest text-[#ff4500] hover:text-[#ff8a57] transition-colors"
                  >
                    <HelpCircle className="w-3 h-3" />
                    How do credits work?
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <label className="font-mono text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
                Time Window
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["24h", "7d", "30d", "90d"] as const).map((window) => (
                  <button
                    key={window}
                    type="button"
                    onClick={() => setTimeWindow(window)}
                    className={`border-2 px-4 py-4 text-left transition-colors ${
                      timeWindow === window
                        ? "bg-amber-500/10 border-amber-400/60 shadow-[3px_3px_0px_0px_rgba(245,158,11,0.18)]"
                        : "bg-[#0c0c0c] border-white/15 hover:border-white/35"
                    }`}
                  >
                    <p
                      className={`font-mono text-[11px] font-black uppercase tracking-widest ${
                        timeWindow === window
                          ? "text-amber-300"
                          : "text-zinc-400"
                      }`}
                    >
                      {getTimeWindowLabel(window)}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-zinc-500">
                      Restrict discovery to this recency window.
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px] font-bold uppercase tracking-widest">
                  <Clock className="w-4 h-4" />
                  Est. time: {MINING_PRESETS[miningDepth].timeEstimate}
                </div>
                <div className="flex items-center gap-3 text-[#ff4500] font-mono text-[11px] font-bold uppercase tracking-widest">
                  <Database className="w-4 h-4" />
                  Est. cost: {MINING_PRESETS[miningDepth].estimatedCredits} CR
                </div>
              </div>
              <div className="text-zinc-500 font-mono text-[11px] font-bold uppercase tracking-widest">
                Min score default: {minimumOpportunityScore}+
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none font-mono text-[12px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                  type="button"
                >
                  {draftSavedAt ? "Update Draft" : "Save Draft"}
                </button>
                {isAtScanLimit || trialEnded ? (
                  <div className="flex flex-col items-center sm:items-end gap-2">
                    <p className="font-serif text-[13px] text-amber-300 italic">
                      {trialEnded
                        ? "Free trial ended — upgrade to start a new investigation."
                        : "Scan limit reached — upgrade to Growth or Pro to continue."}
                    </p>
                    <Link
                      href="/dashboard/billing"
                      className="flex-1 sm:flex-none border border-[#ff8a57] bg-[#ff4500] hover:bg-[#ff571a] text-white px-8 py-3.5 font-mono font-black text-[12px] uppercase tracking-wider transition-colors flex items-center justify-center gap-3 active:scale-95 group"
                    >
                      {trialEnded ? "Unlock New Scans" : "Upgrade to Continue"}
                      <Sparkles className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleStartMining}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none border border-[#ff8a57] bg-[#ff4500] hover:bg-[#ff571a] text-white px-8 py-3.5 font-mono font-black text-[12px] uppercase tracking-wider transition-colors flex items-center justify-center gap-3 active:scale-95 group disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        Processing <Loader2 className="w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Start Mining
                        <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
          <div className="bg-[#0c0c0c] border-2 border-white/15 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] relative overflow-hidden">
            <h4 className="font-black text-white text-lg mb-8 flex items-center gap-3 tracking-tight">
              <Zap className="w-6 h-6 text-[#ff4500]" />
              Expert Tips
            </h4>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="shrink-0 w-6 h-6 bg-[#ff4500]/10 border border-[#ff4500]/35 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight mb-1">
                    Be Specific
                  </p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    Instead of &quot;marketing&quot;, use &quot;B2B marketing
                    for AI startups&quot;.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-6 h-6 bg-[#ff4500]/10 border border-[#ff4500]/35 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight mb-1">
                    Focus on Frustration
                  </p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    Our AI looks for patterns like &quot;I hate when...&quot; or
                    &quot;Why is it so hard to...&quot;.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-6 h-6 bg-[#ff4500]/10 border border-[#ff4500]/35 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight mb-1">
                    Subreddit Context
                  </p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    Narrowing down to specific niche subreddits gives higher
                    quality pain points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
