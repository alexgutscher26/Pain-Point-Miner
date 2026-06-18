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
  const [subredditMetadata, setSubredditMetadata] = useState<
    Record<string, number>
  >({});
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planDialogMessage, setPlanDialogMessage] = useState(
    "A paid plan is required to unlock new scans and AI analysis.",
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

  useEffect(() => {
    let cancelled = false;
    async function loadMetadata() {
      if (visibleCommunities.length === 0) return;
      try {
        const query = visibleCommunities.join(",");
        const res = await fetch(`/api/subreddits/metadata?names=${query}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.subreddits) {
          const map: Record<string, number> = {};
          for (const sub of data.subreddits) {
            map[sub.name.toLowerCase()] = sub.subscriberCount;
          }
          setSubredditMetadata(map);
        }
      } catch {}
    }
    void loadMetadata();
    return () => {
      cancelled = true;
    };
  }, [visibleCommunities]);

  const handleSuggestSubreddits = async () => {
    if (trialEnded) {
      setPlanDialogMessage(
        "A paid plan is required to continue. Please upgrade your account.",
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
              "A paid plan is required to continue. Please upgrade your account.",
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
        <DialogContent className="rounded-2xl border border-zinc-200/50 bg-white/95 backdrop-blur-md text-zinc-900 shadow-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-zinc-900">
              Plan Required
            </DialogTitle>
            <DialogDescription className="font-mono text-zinc-500">
              {planDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setPlanDialogOpen(false)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 font-mono text-sm font-bold tracking-wide text-zinc-700 hover:bg-zinc-55 uppercase transition-all"
            >
              Close
            </button>
            <Link
              href="/dashboard/billing"
              className="rounded-xl bg-[#ff4500] hover:bg-[#e63e00] px-4 py-2 font-mono text-sm font-bold tracking-wide text-white uppercase transition-all shadow-sm"
            >
              Purchase Plan
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        {/* Main Form Area */}
        <div className="space-y-10 lg:col-span-2">
          {trialEnded ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/55 px-5 py-4 shadow-sm">
              <p className="mb-1 font-mono text-[11px] font-black tracking-widest text-amber-600 uppercase">
                Action Required
              </p>
              <p className="text-sm font-semibold text-amber-800">
                Upgrade to a paid plan to unlock new scans and AI suggestions.
              </p>
            </div>
          ) : null}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-[#ff4500]"></div>
              <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
                New Investigation
              </p>
            </div>
            <h2 className="mb-4 text-3xl leading-none font-black tracking-tight text-zinc-900">
              What are we looking for?
            </h2>
            <p className="max-w-xl text-sm font-medium text-zinc-550">
              Define the niche or problem space you want to explore across
              Reddit communities. Our AI will extract high-intent pain points.
            </p>
          </div>

          <div className="space-y-8">
            {/* Keyword Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-mono text-[11px] font-black tracking-widest text-zinc-550 uppercase">
                Keyword or Niche
                <div className="h-1.5 w-1.5 rounded-full bg-[#ff4500]"></div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. cold email, property management, SaaS churn"
                  className="relative z-10 w-full rounded-2xl border border-zinc-200 bg-white/60 px-4 py-4 text-base font-medium text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-[#ff4500] focus:ring-4 focus:ring-[#ff4500]/10 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Subreddits Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-mono text-[11px] font-black tracking-widest text-zinc-550 uppercase">
                  Target Subreddits{" "}
                  <span className="font-mono text-[9px] text-zinc-400">
                    (Optional)
                  </span>
                </label>
                <button
                  onClick={handleSuggestSubreddits}
                  disabled={isSuggesting || !keyword}
                  className="group/suggest flex items-center gap-1.5 font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase transition-colors hover:text-[#e63e00] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSuggesting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 transition-transform group-hover/suggest:scale-125" />
                  )}
                  Auto-Suggest (
                  {Math.max(1, Math.min(defaultSubredditCount, 15))})
                </button>
              </div>
              <div className="group relative">
                <input
                  type="text"
                  value={subreddits}
                  onChange={(e) => setSubreddits(e.target.value)}
                  placeholder="r/sales, r/realestate, r/entrepreneur"
                  className="relative z-10 w-full rounded-2xl border border-zinc-200 bg-white/60 px-4 py-4 pl-12 text-base font-medium text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-[#ff4500] focus:ring-4 focus:ring-[#ff4500]/10 focus:outline-none shadow-sm"
                />
                <Target className="pointer-events-none absolute top-1/2 left-4 z-20 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              </div>

              {suggestedSubreddits.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-3 duration-500">
                  <p className="mb-1 font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                    AI & Reddit Discovery Results
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {suggestedSubreddits.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => addSubreddit(sub.name)}
                        className="group/item relative flex flex-col rounded-2xl border border-zinc-200 bg-white/40 p-4 text-left shadow-sm transition-all hover:border-[#ff4500]/60 hover:bg-[#ff4500]/5 hover:shadow-md"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-mono text-sm font-black text-zinc-800 transition-colors group-hover/item:text-[#ff4500]">
                            r/{sub.name}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-[#ff4500]">
                            {Intl.NumberFormat("en-US", {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(sub.subscribers)}{" "}
                            subs
                          </span>
                        </div>
                        <p className="line-clamp-2 h-8 text-[11px] leading-relaxed font-medium text-zinc-550">
                          {sub.description || "No description provided."}
                        </p>
                        <div className="mt-2 flex items-center gap-1 font-mono text-[9px] font-black text-[#ff4500] uppercase opacity-0 transition-opacity group-hover/item:opacity-100">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Add to Scan
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <p className="mb-1 w-full font-mono text-[9px] font-black tracking-widest text-zinc-450 uppercase">
                  Common Core Communities ({defaultLocale})
                </p>
                {visibleCommunities.map((sub) => {
                  const subs = subredditMetadata[sub.toLowerCase()];
                  const formattedSubs = subs
                    ? Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(subs)
                    : null;
                  return (
                    <button
                      key={sub}
                      onClick={() => addSubreddit(sub)}
                      className="rounded-xl border border-zinc-200 bg-white/40 px-3 py-1.5 font-mono text-[11px] font-bold text-zinc-650 transition-all hover:border-[#ff4500]/40 hover:bg-white flex items-center gap-1.5 shadow-sm"
                    >
                      <span>+ r/{sub}</span>
                      {formattedSubs && (
                        <span className="rounded bg-zinc-100/70 px-1 py-0.5 text-[9px] text-zinc-550 group-hover:bg-[#ff4500]/20 group-hover:text-[#ff4500]">
                          {formattedSubs}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Max {MINING_PRESETS[miningDepth].subreddits} subreddits for{" "}
                {MINING_PRESETS[miningDepth].name}. Separate multiple with
                commas.
              </p>
            </div>

            <div
              className={`space-y-3 transition-opacity duration-300 ${!hasCustomPatternsEntitlement && "opacity-75"}`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-mono text-[11px] font-black tracking-widest text-zinc-550 uppercase">
                  Custom Intelligence Patterns{" "}
                  <span className="font-mono text-[9px] text-zinc-400">
                    (Optional)
                  </span>
                </label>
                {!hasCustomPatternsEntitlement && (
                  <Link
                    href="/dashboard/billing"
                    className="flex items-center gap-1.5 font-mono text-[9px] font-black tracking-widest text-amber-600 uppercase transition-colors hover:text-amber-500"
                  >
                    <Lock className="h-3 w-3" />
                    Pro Only
                  </Link>
                )}
              </div>
              <div className="group relative">
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
                  className={`relative z-10 w-full rounded-2xl border bg-white/60 px-4 py-4 pl-12 text-base font-medium text-zinc-900 transition-all focus:outline-none shadow-sm ${
                    hasCustomPatternsEntitlement
                      ? "border-zinc-200 placeholder:text-zinc-400 focus:border-[#ff4500] focus:ring-4 focus:ring-[#ff4500]/10"
                      : "cursor-not-allowed border-amber-200 placeholder:text-zinc-400"
                  }`}
                />
                <Sparkles
                  className={`pointer-events-none absolute top-1/2 left-4 z-20 h-5 w-5 -translate-y-1/2 transition-colors ${
                    hasCustomPatternsEntitlement
                      ? "text-[#ff4500]/60"
                      : "text-zinc-350"
                  }`}
                />

                {!hasCustomPatternsEntitlement && (
                  <div
                    className="pointer-events-none absolute inset-x-0 -bottom-2 z-20 flex justify-center"
                    aria-hidden="true"
                  >
                    <div className="rounded-full border border-amber-250 bg-amber-50 px-3 py-1 shadow-md">
                      <p className="font-mono text-[8px] font-black tracking-tighter text-amber-600 uppercase">
                        Restricted Parameter
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <p className="font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                {hasCustomPatternsEntitlement
                  ? "Comma-separated signals you want the AI to specifically hunt for."
                  : "Precision targeting for niche problems is a Pro-tier exclusive."}
              </p>
            </div>

            <div className="space-y-4">
              <label className="block font-mono text-[11px] font-black tracking-widest text-zinc-550 uppercase">
                Expert Discovery Presets
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                      className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-6 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45 shadow-sm ${
                        isActive
                          ? "border-[#ff4500] bg-[#ff4500]/5 hover:shadow-md"
                          : "border-zinc-200 bg-white/40 hover:border-[#ff4500]/40 hover:bg-white/60"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div
                          className={`rounded-xl border p-3 transition-colors ${
                            isActive
                              ? "border-[#ff8a57] bg-[#ff4500] text-white"
                              : "border-zinc-200 bg-white text-zinc-400"
                          }`}
                        >
                          {depth === "basic" ? (
                            <Zap className="h-5 w-5" />
                          ) : (
                            <Sparkles className="h-5 w-5" />
                          )}
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            isActive ? "border-[#ff4500]" : "border-zinc-300"
                          }`}
                        >
                          {isActive && (
                            <div className="h-2.5 w-2.5 rounded-full bg-[#ff4500]"></div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <p
                            className={`font-mono text-[12px] font-black tracking-widest uppercase ${
                              isActive ? "text-zinc-900" : "text-zinc-550"
                            }`}
                          >
                            {preset.name}
                          </p>
                          <span className="rounded-full border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-black text-zinc-500">
                            {preset.estimatedCredits} CR
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed font-bold text-zinc-500">
                          {preset.description}
                        </p>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-zinc-150/40 pt-4">
                        <div className="space-y-1">
                          <p className="font-mono text-[8px] font-black text-zinc-450 uppercase">
                            Subreddits
                          </p>
                          <p className="text-[10px] font-bold text-zinc-600">
                            {preset.subreddits} communities
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-mono text-[8px] font-black text-zinc-450 uppercase">
                            Analysis
                          </p>
                          <p className="text-[10px] font-bold text-zinc-600">
                            {preset.sortModes} mode
                            {preset.sortModes > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {!isAllowed && (
                        <div className="absolute top-0 right-0 p-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-mono text-[8px] font-black tracking-widest text-amber-600 uppercase shadow-sm">
                            <Lock className="h-2.5 w-2.5" />
                            Upgrade
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {billing ? (
                <div className="flex flex-col justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                  <p className="font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
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
                        "Credits (CR) represent the resource intensity of a scan. Basic = 0.5 CR, Deep = 2 CR, Advanced = 5 CR. Your monthly plan gives you a fixed pool of credits that reset every 30 days. No hidden fees, just value-based mining.",
                      );
                      setPlanDialogOpen(true);
                    }}
                    className="flex items-center gap-1.5 font-mono text-[9px] font-black tracking-widest text-[#ff4500] uppercase transition-colors hover:text-[#ff8a57]"
                  >
                    <HelpCircle className="h-3 w-3" />
                    How do credits work?
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <label className="block font-mono text-[11px] font-black tracking-widest text-zinc-550 uppercase">
                Time Window
              </label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(["24h", "7d", "30d", "90d"] as const).map((window) => (
                  <button
                    key={window}
                    type="button"
                    onClick={() => setTimeWindow(window)}
                    className={`rounded-2xl border-2 px-4 py-4 text-left transition-colors ${
                      timeWindow === window
                        ? "border-amber-400 bg-amber-50/50 text-amber-900 shadow-sm"
                        : "border-zinc-200 bg-white/40 hover:border-amber-400/45 hover:bg-white/60"
                    }`}
                  >
                    <p
                      className={`font-mono text-[11px] font-black tracking-widest uppercase ${
                        timeWindow === window
                          ? "text-amber-600"
                          : "text-zinc-500"
                      }`}
                    >
                      {getTimeWindowLabel(window)}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-zinc-400">
                      Restrict discovery to this recency window.
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col items-center justify-between gap-6 border-t border-zinc-200/50 pt-6 sm:flex-row">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  Est. time: {MINING_PRESETS[miningDepth].timeEstimate}
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-widest text-[#ff4500] uppercase">
                  <Database className="h-4 w-4" />
                  Est. cost: {MINING_PRESETS[miningDepth].estimatedCredits} CR
                </div>
              </div>
              <div className="font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                Min score default: {minimumOpportunityScore}+
              </div>
              <div className="flex w-full items-center gap-4 sm:w-auto justify-end">
                <button
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="font-mono text-[12px] font-black tracking-widest text-zinc-400 uppercase transition-colors hover:text-zinc-700 disabled:opacity-50"
                  type="button"
                >
                  {draftSavedAt ? "Update Draft" : "Save Draft"}
                </button>
                {isAtScanLimit || trialEnded ? (
                  <div className="flex flex-col items-center gap-2 sm:items-end">
                    <p className="font-serif text-[13px] text-amber-600 italic">
                      {trialEnded
                        ? "Upgrade your plan to unlock new investigations."
                        : "Scan limit reached — upgrade to Growth or Pro to continue."}
                    </p>
                    <Link
                      href="/dashboard/billing"
                      className="group flex flex-1 items-center justify-center gap-3 rounded-xl bg-[#ff4500] px-8 py-3.5 font-mono text-[12px] font-black tracking-wider text-white uppercase transition-all hover:bg-[#e63e00] shadow-md hover:shadow-lg active:scale-95 sm:flex-none"
                    >
                      {trialEnded ? "Unlock New Scans" : "Upgrade to Continue"}
                      <Sparkles className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleStartMining}
                    disabled={isLoading}
                    className="group flex flex-1 items-center justify-center gap-3 rounded-xl bg-[#ff4500] px-8 py-3.5 font-mono text-[12px] font-black tracking-wider text-white uppercase transition-all hover:bg-[#e63e00] shadow-md hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-75 sm:flex-none"
                  >
                    {isLoading ? (
                      <>
                        Processing <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Start Mining
                        <Rocket className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/60 backdrop-blur-md p-8 shadow-sm">
            <h4 className="mb-8 flex items-center gap-3 text-lg font-black tracking-tight text-zinc-900">
              <Zap className="h-6 w-6 text-[#ff4500]" />
              Expert Tips
            </h4>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white/60 text-[#ff4500]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="mb-1 text-[13px] font-black tracking-tight text-zinc-900 uppercase">
                    Be Specific
                  </p>
                  <p className="text-[12px] leading-relaxed text-zinc-550">
                    Instead of &quot;marketing&quot;, use &quot;B2B marketing
                    for AI startups&quot;.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white/60 text-[#ff4500]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="mb-1 text-[13px] font-black tracking-tight text-zinc-900 uppercase">
                    Focus on Frustration
                  </p>
                  <p className="text-[12px] leading-relaxed text-zinc-550">
                    Our AI looks for patterns like &quot;I hate when...&quot; or
                    &quot;Why is it so hard to...&quot;.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white/60 text-[#ff4500]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="mb-1 text-[13px] font-black tracking-tight text-zinc-900 uppercase">
                    Subreddit Context
                  </p>
                  <p className="text-[12px] leading-relaxed text-zinc-550">
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
