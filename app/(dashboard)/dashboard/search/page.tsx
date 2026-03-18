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
} from "lucide-react";
import { toast } from "sonner";
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

type MiningDepth = SearchDraft["miningDepth"];
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
  const [suggestedSubreddits, setSuggestedSubreddits] = useState<string[]>([]);
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
                You can still explore the app and review past results. New
                scans and AI suggestions require a paid plan.
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
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="w-full font-mono text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                    AI Recommended Communities
                  </p>
                  {suggestedSubreddits.map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => addSubreddit(sub)}
                      className="px-3 py-1.5 border border-[#ff4500]/40 bg-[#ff4500]/8 font-mono text-[11px] font-bold text-[#ff4500] hover:bg-[#ff4500]/15 transition-colors"
                    >
                      + r/{sub}
                    </button>
                  ))}
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
                Leave blank to use your default locale and subreddit count from
                settings.
              </p>
            </div>

            {/* Custom Extraction Parameters */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Custom Intelligence Patterns{" "}
                <span className="font-mono text-[9px] text-zinc-600">
                  (Optional)
                </span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={customPatterns}
                  onChange={(e) => setCustomPatterns(e.target.value)}
                  placeholder="e.g. mentions of HubSpot, frustration with pricing, legal compliance, developer experience"
                  className="w-full relative z-10 bg-[#0c0c0c] border-2 border-white/15 px-4 py-4 pl-12 text-white text-base font-medium focus:outline-none focus:border-amber-400/70 transition-colors placeholder:text-zinc-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)]"
                />
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/60 z-20 pointer-events-none" />
              </div>
              <p className="font-mono text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                Comma-separated signals you want the AI to specifically hunt
                for.
              </p>
            </div>

            {/* Mining Depth Selection */}
            <div className="space-y-4">
              <label className="font-mono text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
                Mining Depth
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setMiningDepth("basic")}
                  className={`relative p-6 border-2 transition-colors text-left flex items-start gap-4 overflow-hidden group ${
                    miningDepth === "basic"
                      ? "bg-[#ff4500]/6 border-[#ff4500]/65 shadow-[3px_3px_0px_0px_rgba(255,69,0,0.25)]"
                      : "bg-[#0c0c0c] border-white/15 hover:border-white/35"
                  }`}
                >
                  <div
                    className={`p-3 border ${miningDepth === "basic" ? "bg-[#ff4500] border-[#ff8a57] text-white" : "bg-white/5 border-white/15 text-zinc-500"}`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      className={`font-mono font-black uppercase tracking-widest text-[12px] mb-1 ${miningDepth === "basic" ? "text-white" : "text-zinc-400"}`}
                    >
                      Basic Scan
                    </p>
                    <p className="text-zinc-500 text-[11px] font-bold">
                      Last 3 months, top 100 threads
                    </p>
                  </div>
                  <div
                    className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${miningDepth === "basic" ? "border-[#ff4500]" : "border-zinc-800"}`}
                  >
                    {miningDepth === "basic" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff4500]"></div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setMiningDepth("deep")}
                  disabled={
                    billing
                      ? !billing.entitlements.allowedMiningDepths.includes(
                          "deep",
                        )
                      : false
                  }
                  className={`relative p-6 border-2 transition-colors text-left flex items-start gap-4 overflow-hidden group disabled:opacity-45 disabled:cursor-not-allowed ${
                    miningDepth === "deep"
                      ? "bg-[#ff4500]/6 border-[#ff4500]/65 shadow-[3px_3px_0px_0px_rgba(255,69,0,0.25)]"
                      : "bg-[#0c0c0c] border-white/15 hover:border-white/35"
                  }`}
                >
                  <div
                    className={`p-3 border ${miningDepth === "deep" ? "bg-amber-500 border-amber-300 text-white" : "bg-white/5 border-white/15 text-zinc-500"}`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      className={`font-mono font-black uppercase tracking-widest text-[12px] mb-1 ${miningDepth === "deep" ? "text-white" : "text-zinc-400"}`}
                    >
                      Deep Mine
                    </p>
                    <p className="text-zinc-500 text-[11px] font-bold">
                      Last 12 months, recursive comment scan
                    </p>
                  </div>
                  <div
                    className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${miningDepth === "deep" ? "border-[#ff4500]" : "border-zinc-800"}`}
                  >
                    {miningDepth === "deep" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff4500]"></div>
                    )}
                  </div>
                  {miningDepth !== "deep" && (
                    <div className="absolute top-0 right-0 p-2">
                      <span className="font-mono text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-400/35">
                        {billing &&
                        !billing.entitlements.allowedMiningDepths.includes(
                          "deep",
                        )
                          ? "Pro"
                          : "Deep"}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setMiningDepth("advanced")}
                  disabled={
                    billing
                      ? !billing.entitlements.allowedMiningDepths.includes(
                          "advanced",
                        )
                      : false
                  }
                  className={`relative p-6 border-2 transition-colors text-left flex items-start gap-4 overflow-hidden group disabled:opacity-45 disabled:cursor-not-allowed ${
                    miningDepth === "advanced"
                      ? "bg-[#ff4500]/6 border-[#ff4500]/65 shadow-[3px_3px_0px_0px_rgba(255,69,0,0.25)]"
                      : "bg-[#0c0c0c] border-white/15 hover:border-white/35"
                  }`}
                >
                  <div
                    className={`p-3 border ${miningDepth === "advanced" ? "bg-violet-500 border-violet-300 text-white" : "bg-white/5 border-white/15 text-zinc-500"}`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      className={`font-mono font-black uppercase tracking-widest text-[12px] mb-1 ${miningDepth === "advanced" ? "text-white" : "text-zinc-400"}`}
                    >
                      Advanced Clustering
                    </p>
                    <p className="text-zinc-500 text-[11px] font-bold">
                      Deep scan + advanced pain-point clustering
                    </p>
                  </div>
                  <div
                    className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${miningDepth === "advanced" ? "border-[#ff4500]" : "border-zinc-800"}`}
                  >
                    {miningDepth === "advanced" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff4500]"></div>
                    )}
                  </div>
                  {billing &&
                  !billing.entitlements.allowedMiningDepths.includes(
                    "advanced",
                  ) ? (
                    <div className="absolute top-0 right-0 p-2">
                      <span className="inline-flex items-center gap-1 font-mono text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-400/35">
                        <Lock className="w-2.5 h-2.5" />
                        Growth+
                      </span>
                    </div>
                  ) : null}
                </button>
              </div>
              {billing ? (
                <p className="font-mono text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                  Plan: {billing.plan.toUpperCase()}{" "}
                  | Monthly scans:{" "}
                  {billing.usage.monthlyScansUsed}
                  {billing.usage.monthlyScansLimit === null
                    ? "/Unlimited"
                    : `/${billing.usage.monthlyScansLimit}`}
                </p>
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
                        timeWindow === window ? "text-amber-300" : "text-zinc-400"
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
              <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px] font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                Est. time: ~
                {(() => {
                  const subCount =
                    subreddits.split(",").filter((s) => s.trim()).length ||
                    Math.max(1, Math.min(defaultSubredditCount, 10));
                  const depthMultiplier =
                    miningDepth === "advanced"
                      ? 5
                      : miningDepth === "deep"
                        ? 3
                        : 1;
                  const totalSeconds = subCount * 15 * depthMultiplier;
                  return totalSeconds >= 60
                    ? `${Math.round(totalSeconds / 60)} minutes`
                    : `${totalSeconds} seconds`;
                })()}
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
