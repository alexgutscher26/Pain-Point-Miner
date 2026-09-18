"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Flame,
  Compass,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { MINING_PRESETS, type MiningDepth } from "@/lib/mining-presets";
import { ScanWizard } from "@/components/dashboard/scan-wizard";
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
  miningDepth: MiningDepth;
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
  const [scanMode, setScanMode] = useState<"quick" | "wizard">("quick");
  const [miningDepth, setMiningDepth] = useState<MiningDepth>("basic");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(DEFAULT_TIME_WINDOW);
  const [keyword, setKeyword] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [customPatterns, setCustomPatterns] = useState("");

  const selectedSubredditList = useMemo(() => {
    return subreddits
      .split(",")
      .map((s) => s.trim().replace(/^r\//i, ""))
      .filter(Boolean);
  }, [subreddits]);

  const removeSubreddit = (sub: string) => {
    const updated = selectedSubredditList.filter(
      (s) => s.toLowerCase() !== sub.toLowerCase(),
    );
    setSubreddits(updated.map((s) => `r/${s}`).join(", "));
  };
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

  const visibleCommunitiesKey = visibleCommunities.join(",");

  useEffect(() => {
    let cancelled = false;
    async function loadMetadata() {
      if (!visibleCommunitiesKey) return;
      try {
        const res = await fetch(
          `/api/subreddits/metadata?names=${visibleCommunitiesKey}`,
        );
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
  }, [visibleCommunitiesKey]);

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
        <DialogContent className="max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-mono text-lg font-black text-zinc-950 uppercase dark:text-white">
              Lifetime Access Required
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {planDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setPlanDialogOpen(false)}
              className="dark:hover:bg-zinc-850 cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2 font-mono text-xs font-bold tracking-wide text-zinc-700 uppercase transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              Close
            </button>
            <Link
              href="/dashboard/billing"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#ff4500] px-4 py-2 font-mono text-xs font-black tracking-wide text-white uppercase shadow-xs transition-all hover:bg-[#e03d00]"
            >
              View LTD Deals
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scan Mode Switcher & Presets Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-zinc-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setScanMode("quick")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold uppercase transition-all ${
                scanMode === "quick"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-[#ff4500]" />
              <span>Quick Scan</span>
            </button>
            <button
              type="button"
              onClick={() => setScanMode("wizard")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold uppercase transition-all ${
                scanMode === "wizard"
                  ? "bg-[#ff4500] text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Guided Wizard</span>
            </button>
          </div>
        </div>

        <span className="font-mono text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
          {scanMode === "wizard"
            ? "Step-by-step guided mining setup"
            : "Direct 1-page search configuration"}
        </span>
      </div>

      {scanMode === "wizard" ? (
        <div className="mx-auto max-w-4xl">
          <ScanWizard
            keyword={keyword}
            setKeyword={setKeyword}
            subreddits={subreddits}
            setSubreddits={setSubreddits}
            selectedSubredditList={selectedSubredditList}
            onAddSubreddit={addSubreddit}
            onRemoveSubreddit={removeSubreddit}
            miningDepth={miningDepth}
            setMiningDepth={setMiningDepth}
            timeWindow={timeWindow}
            setTimeWindow={setTimeWindow}
            customPatterns={customPatterns}
            setCustomPatterns={setCustomPatterns}
            isSearching={isLoading}
            onStartScan={handleStartMining}
            allowedDepths={billing?.entitlements.allowedMiningDepths}
            maxSubredditsLimit={
              billing?.entitlements.maxSubredditsPerSearch ?? 10
            }
            onOpenUpgradeModal={(msg) => {
              if (msg) setPlanDialogMessage(msg);
              setPlanDialogOpen(true);
            }}
            estimatedCredits={MINING_PRESETS[miningDepth].estimatedCredits}
            currentPlan={billing?.plan}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          {/* Main Form Area */}
          <div className="space-y-8 lg:col-span-2">
            {trialEnded ? (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-5 py-4 dark:bg-amber-500/10">
                <div>
                  <p className="mb-1 font-mono text-[10px] font-black tracking-widest text-amber-600 uppercase">
                    Action Required
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Unlock unlimited investigations with a Lifetime Deal.
                  </p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 font-mono text-xs font-black text-black uppercase transition-colors hover:bg-amber-400"
                >
                  View LTD
                </Link>
              </div>
            ) : null}

            <div>
              <div className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-[#ff4500] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff4500]"></span>
                Investigation Parameters
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">
                Configure Market Radar
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                Define the problem space, competitors, or niche to mine across
                Reddit communities.
              </p>
            </div>

            <div className="space-y-7">
              {/* Keyword Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                  Target Keyword or Problem Niche
                  <span className="text-[#ff4500]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. cold email deliverability, property management software, Stripe billing churn..."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-[15px] font-medium text-zinc-900 shadow-2xs transition-all placeholder:text-zinc-400 focus:border-[#ff4500] focus:ring-4 focus:ring-[#ff4500]/10 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Subreddits Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                    Target Communities
                    <span className="font-mono text-[9px] text-zinc-400">
                      (Optional)
                    </span>
                  </label>
                  <button
                    onClick={handleSuggestSubreddits}
                    disabled={isSuggesting || !keyword}
                    className="group/suggest flex cursor-pointer items-center gap-1.5 font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase transition-colors hover:text-[#e03d00] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSuggesting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 transition-transform group-hover/suggest:scale-125" />
                    )}
                    Auto-Discover Subreddits
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={subreddits}
                    onChange={(e) => setSubreddits(e.target.value)}
                    placeholder="r/sales, r/entrepreneur, r/SaaS, r/smallbusiness"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 pl-11 text-[15px] font-medium text-zinc-900 shadow-2xs transition-all placeholder:text-zinc-400 focus:border-[#ff4500] focus:ring-4 focus:ring-[#ff4500]/10 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                  <Target className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                </div>

                {suggestedSubreddits.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-2 space-y-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 duration-300 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                      AI Discovered Communities
                    </p>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {suggestedSubreddits.map((sub) => (
                        <button
                          key={sub.name}
                          type="button"
                          onClick={() => addSubreddit(sub.name)}
                          className="group/item flex cursor-pointer flex-col rounded-lg border border-zinc-200/80 bg-white p-3 text-left shadow-2xs transition-all hover:border-[#ff4500]/40 hover:bg-[#ff4500]/5 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-[#ff4500]/40"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-mono text-xs font-black text-zinc-900 transition-colors group-hover/item:text-[#ff4500] dark:text-zinc-100">
                              r/{sub.name}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-[#ff4500]">
                              {Intl.NumberFormat("en-US", {
                                notation: "compact",
                                maximumFractionDigits: 1,
                              }).format(sub.subscribers)}{" "}
                              subs
                            </span>
                          </div>
                          <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                            {sub.description || "No description provided."}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Core Subreddits */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="mr-1 font-mono text-[10px] font-semibold text-zinc-400 uppercase">
                    Popular:
                  </span>
                  {visibleCommunities.map((sub) => {
                    const subs = subredditMetadata[sub.toLowerCase()];
                    const formattedSubs = subs
                      ? Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(subs)
                      : null;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => addSubreddit(sub)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[10px] font-semibold text-zinc-600 transition-all hover:border-[#ff4500]/40 hover:text-[#ff4500] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-[#ff4500]/40 dark:hover:text-[#ff4500]"
                      >
                        <span>+ r/{sub}</span>
                        {formattedSubs && (
                          <span className="text-[9px] text-zinc-400">
                            ({formattedSubs})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Intelligence Patterns */}
              <div
                className={`space-y-2 transition-opacity duration-300 ${!hasCustomPatternsEntitlement && "opacity-80"}`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                    Custom Intelligence Patterns
                    <span className="font-mono text-[9px] text-zinc-400">
                      (Optional)
                    </span>
                  </label>
                  {!hasCustomPatternsEntitlement && (
                    <Link
                      href="/dashboard/billing"
                      className="inline-flex items-center gap-1 font-mono text-[9px] font-black tracking-widest text-amber-600 uppercase transition-colors hover:text-amber-500"
                    >
                      <Lock className="h-3 w-3" />
                      Studio LTD Feature
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customPatterns}
                    onChange={(e) => setCustomPatterns(e.target.value)}
                    disabled={!hasCustomPatternsEntitlement}
                    placeholder={
                      hasCustomPatternsEntitlement
                        ? "e.g. mentions of HubSpot, pricing complaints, manual CSV exports, API rate limits..."
                        : "Unlock custom search patterns with Studio LTD Pass"
                    }
                    className={`w-full rounded-xl border bg-white px-4 py-3.5 pl-11 text-[15px] font-medium text-zinc-900 shadow-2xs transition-all focus:outline-none dark:bg-zinc-950 dark:text-white ${
                      hasCustomPatternsEntitlement
                        ? "border-zinc-200 placeholder:text-zinc-400 focus:border-[#ff4500] focus:ring-4 focus:ring-[#ff4500]/10 dark:border-zinc-800"
                        : "cursor-not-allowed border-amber-300/60 placeholder:text-zinc-400 dark:border-amber-500/30"
                    }`}
                  />
                  <Sparkles
                    className={`pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 ${
                      hasCustomPatternsEntitlement
                        ? "text-[#ff4500]"
                        : "text-amber-500"
                    }`}
                  />
                </div>
              </div>

              {/* Discovery Presets */}
              <div className="space-y-3">
                <label className="block font-mono text-[11px] font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                  Mining Depth & Resolution
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {(["basic", "deep", "advanced", "ultra"] as const).map(
                    (depth) => {
                      const preset = MINING_PRESETS[depth];
                      const isAllowed = billing
                        ? billing.entitlements.allowedMiningDepths.includes(
                            depth,
                          )
                        : true;
                      const isActive = miningDepth === depth;

                      return (
                        <button
                          key={depth}
                          type="button"
                          onClick={() => setMiningDepth(depth)}
                          disabled={!isAllowed}
                          className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                            isActive
                              ? "border-[#ff4500] bg-[#ff4500]/5 shadow-xs dark:bg-[#ff4500]/10"
                              : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                          }`}
                        >
                          <div>
                            <div className="mb-3 flex items-center justify-between">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  isActive
                                    ? "bg-[#ff4500] text-white"
                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                                }`}
                              >
                                {depth === "basic" ? (
                                  <Zap className="h-4 w-4" />
                                ) : depth === "ultra" ? (
                                  <Flame className="h-4 w-4" />
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                              </div>
                              <span className="font-mono text-[10px] font-black text-[#ff4500]">
                                {preset.estimatedCredits} CR
                              </span>
                            </div>

                            <p
                              className={`font-mono text-xs font-black uppercase ${
                                isActive
                                  ? "text-zinc-950 dark:text-white"
                                  : "text-zinc-800 dark:text-zinc-200"
                              }`}
                            >
                              {preset.name}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                              {preset.description}
                            </p>
                          </div>

                          <div className="dark:border-zinc-850 mt-4 flex items-center justify-between border-t border-zinc-100 pt-2.5 font-mono text-[9px] text-zinc-400 dark:text-zinc-500">
                            <span>{preset.subreddits} Subreddits</span>
                            <span>{preset.timeEstimate}</span>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Time Window */}
              <div className="space-y-3">
                <label className="block font-mono text-[11px] font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                  Recency Window
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(["24h", "7d", "30d", "90d"] as const).map((window) => (
                    <button
                      key={window}
                      type="button"
                      onClick={() => setTimeWindow(window)}
                      className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                        timeWindow === window
                          ? "border-[#ff4500] bg-[#ff4500]/5 text-zinc-950 dark:bg-[#ff4500]/10 dark:text-white"
                          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                      }`}
                    >
                      <p
                        className={`font-mono text-[11px] font-black uppercase ${
                          timeWindow === window
                            ? "text-[#ff4500]"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {getTimeWindowLabel(window)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                        Scan depth filter
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Action Bar */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-200/80 pt-6 sm:flex-row dark:border-zinc-800">
                <div className="flex items-center gap-4 font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    Est: {MINING_PRESETS[miningDepth].timeEstimate}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#ff4500]">
                    <Database className="h-3.5 w-3.5" />
                    Cost: {MINING_PRESETS[miningDepth].estimatedCredits} CR
                  </span>
                </div>

                <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                  <button
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    className="cursor-pointer font-mono text-[11px] font-bold text-zinc-400 uppercase transition-colors hover:text-zinc-800 disabled:opacity-50 dark:hover:text-zinc-200"
                    type="button"
                  >
                    {draftSavedAt ? "Update Draft" : "Save Draft"}
                  </button>

                  <button
                    onClick={handleStartMining}
                    disabled={isLoading}
                    className="group flex flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#ff4500] px-7 py-3 font-mono text-xs font-black tracking-wider text-white uppercase shadow-xs transition-all hover:bg-[#e03d00] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                  >
                    {isLoading ? (
                      <>
                        <span>Analyzing Stream...</span>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span>Start Mining</span>
                        <Rocket className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
              <h4 className="mb-6 flex items-center gap-2 text-sm font-extrabold tracking-tight text-zinc-950 uppercase dark:text-white">
                <Zap className="h-4 w-4 text-[#ff4500]" />
                Mining Guidelines
              </h4>

              <div className="space-y-5">
                <div className="flex gap-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ff4500]/10 text-[#ff4500]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Use High-Intent Queries
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Instead of broad keywords like &quot;CRM&quot;, query
                      &quot;HubSpot migration friction&quot; or &quot;Pipedrive
                      billing limits&quot;.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ff4500]/10 text-[#ff4500]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Target Real Buyer Frustration
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Our semantic parser searches for &quot;I switched
                      from...&quot;, &quot;anyone else tired of...&quot;, and
                      explicit budget mentions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ff4500]/10 text-[#ff4500]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Narrow by Vertical
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Subreddits like{" "}
                      <code className="font-mono text-[10px] text-[#ff4500]">
                        r/sales
                      </code>{" "}
                      or{" "}
                      <code className="font-mono text-[10px] text-[#ff4500]">
                        r/sysadmin
                      </code>{" "}
                      yield 3x higher willingness-to-pay signals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
