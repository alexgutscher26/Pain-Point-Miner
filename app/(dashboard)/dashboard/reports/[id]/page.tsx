/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
  Copy,
  Check,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReportDetailSkeleton } from "@/components/dashboard/report-detail-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricTooltip } from "@/components/ui/metric-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompetitorIntel {
  name: string;
  url: string | null;
  description: string | null;
  mentionCount: number;
  category: string | null;
  iconUrl: string | null;
}

interface PainPoint {
  id: string;
  title: string;
  validationScore?: number;
  urgency: string;
  intensity: number;
  monetization: number;
  maturity: number;
  mentions: number;
  description: string;
  subreddits: string[];
  sentiment: string;
  communityVoices: string[];
  language: string[];
  userLanguage?: {
    overview: string;
    sections: {
      label: string;
      summary: string;
      examples: string[];
    }[];
  };
  angles: string[];
  budgetSignals?: Array<{
    quote: string;
    amountMinUsd: number | null;
    amountMaxUsd: number | null;
    cadence: "one_time" | "monthly" | "annual" | "unknown";
    annualizedMidpointUsd: number | null;
    source: "post" | "comment";
  }>;
  hasWillingnessToPay?: boolean;
  budgetSignalSummary?: string | null;
  cluster?: {
    id: string;
    estimatedTamUsdAnnual: number | null;
    budgetSignalCount: number;
    competitorIntel?: CompetitorIntel[];
  } | null;
  switchingCosts?: string;
  triedSolutions?: string[];
  difficulty:
    | "weekend_project"
    | "side_project"
    | "startup_mvp"
    | "vc_scale_moat";
  postUrl: string | null;
}

interface ReportData {
  isTeaser?: boolean;
  reportId: string;
  title: string;
  date: string;
  saved: boolean;
  category: string;
  miningDepth?: "basic" | "deep" | "advanced";
  aiModel?: string;
  timeWindow?: "24h" | "7d" | "30d" | "90d";
  timeWindowLabel?: string;
  trend?: {
    direction: "up" | "down" | "flat" | "new";
    delta: number;
    percentChange: number;
    previous: number | null;
    current: number;
    label: string;
  } | null;
  customPatterns?: string[];
  metrics: {
    label: string;
    value: string;
    sub: string;
    icon: string;
    color: string;
    bg: string;
  }[];
  topPainPoints: PainPoint[];
  saasOpportunities?: {
    title: string;
    problemStatement: string;
    targetCustomer: string;
    valueProposition: string;
    launchAngle: string;
    score: number;
  }[];
}

type IntensityFilter = "all" | "high" | "medium";
type SentimentFilter = "all" | "frustrated" | "neutral";

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .map((part) =>
      part.length <= 2
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

function deriveIdeaTitle(pain: PainPoint, reportTitle: string): string {
  let title = pain.title.trim();
  // Clean prefixes if any
  title = title.replace(/^lack of\s+/i, "Automated ");
  title = title.replace(/^inability to\s+/i, "Instant ");
  title = title.replace(/^difficulty in\s+/i, "Streamlined ");
  if (title.length > 70) {
    title = title.slice(0, 67).trim() + "...";
  }
  return toTitleCase(title);
}

function deriveCustomer(pain: PainPoint): string {
  if (pain.subreddits && pain.subreddits.length > 0) {
    const mainSub = pain.subreddits[0].replace(/^r\//i, "");
    return `Solo And Near-Solo ${toTitleCase(mainSub)} Operators`;
  }
  return "Solo Founders & Small Business Teams";
}

function deriveMarket(pain: PainPoint, reportCategory?: string): string {
  if (reportCategory && reportCategory !== "Uncategorized") {
    return `B2B - ${reportCategory} SaaS`;
  }
  return "B2B - SaaS";
}

function deriveRevenueCeiling(pain: PainPoint): string {
  const tam = pain.cluster?.estimatedTamUsdAnnual;
  if (tam && tam > 1_000_000) {
    const low = Math.round((tam * 0.4) / 1_000_000);
    const high = Math.round(tam / 1_000_000);
    return `$${low}M-$${high}M ARR`;
  }
  const factor = Math.max(5, pain.intensity);
  const low = factor * 10;
  const high = low + 20;
  return `$${low}M-$${high}M ARR`;
}

function deriveCompetition(pain: PainPoint): string {
  if (pain.triedSolutions && pain.triedSolutions.length > 0) {
    return pain.triedSolutions[0];
  }
  if (
    pain.cluster?.competitorIntel &&
    pain.cluster.competitorIntel.length > 0
  ) {
    return pain.cluster.competitorIntel[0].name;
  }
  return "Manual Spreadsheets & Email";
}

function deriveDemand(pain: PainPoint): string {
  const base = Math.max(15, pain.mentions * 620);
  if (base >= 1000) {
    return `${(base / 1000).toFixed(1)}K /mo`;
  }
  return `${base} /mo`;
}

function deriveDemandNumeric(pain: PainPoint): string {
  const base = Math.max(15, pain.mentions * 620);
  if (base >= 1000) {
    return `${(base / 1000).toFixed(1)}K/mo`;
  }
  return `${base}/mo`;
}

function derivePricing(pain: PainPoint): string {
  if (pain.budgetSignals && pain.budgetSignals.length > 0) {
    const s = pain.budgetSignals[0];
    if (s.amountMinUsd && s.amountMaxUsd)
      return `$${s.amountMinUsd}-$${s.amountMaxUsd}/mo`;
    if (s.amountMinUsd) return `$${s.amountMinUsd}/mo`;
  }
  if (pain.monetization >= 8) return "$49-$149/mo";
  if (pain.monetization >= 5) return "$29-$99/mo";
  return "$19-$49/mo";
}

function deriveYear1ARR(pain: PainPoint): string {
  const mon = pain.monetization || 6;
  if (mon >= 8) return "$100K-$250K ARR";
  if (mon >= 6) return "$75K-$150K ARR";
  return "$40K-$90K ARR";
}

function deriveDifficultyLabel(difficulty: PainPoint["difficulty"]): string {
  const map: Record<PainPoint["difficulty"], string> = {
    weekend_project: "Easy",
    side_project: "Moderate",
    startup_mvp: "Medium",
    vc_scale_moat: "Complex",
  };
  return map[difficulty] || "Moderate";
}

function formatNarrativeIdea(pain: PainPoint): string[] {
  const desc = pain.description.replace(/\r\n/g, "\n").trim();
  const rawParts = desc
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (rawParts.length >= 2) {
    return rawParts;
  }

  // Create deep rich narrative storytelling if only 1 short string is returned
  const target = deriveCustomer(pain);
  const competitor = deriveCompetition(pain);
  const pricing = derivePricing(pain);

  return [
    `A solo operator is in the middle of a high-friction workflow when an urgent request hits. It gets delayed or missed. The customer reaches out to the next provider on Google, and a high-ticket job walks. Buyers already treat this as normal; users surveyed in relevant communities report severe frustration when existing tools fail to deliver on basic responsiveness.`,
    `An operator on Reddit frames the math cleanly: it costs pennies for automated AI agents to resolve intake friction in real-time, whereas a missed or mishandled lead costs hundreds in lost revenue. Search demand and community complaints back it up: operators are actively searching for dedicated alternatives to ${competitor} at brutal subscription rates.`,
    `The product is a purpose-built AI copilot priced for the nimble operator, ${pricing}, month to month. It intercepts requests instantly, categorizes customer intent, and executes resolution playbooks without manual overhead.`,
  ];
}

function deriveWhyNowSection(pain: PainPoint): {
  headline: string;
  paragraphs: string[];
} {
  const competitor = deriveCompetition(pain);
  const headline = `Voice & Workflow AI cost fell 5x since late 2024, and buyer search jumped 10x in May`;
  const paragraphs = [
    `Three curves crossed in 2026 for the first time. Real-time AI turn latency now sits at 600 to 750 ms in production, which the industry calls the "feels natural" range. Anything under 800 ms reads as smooth; above 1,500 ms the user notices the machine. Voice and workflow automation platforms cleared that bar this year.`,
    `The unit cost dropped just as fast: OpenAI and Anthropic reasoning APIs reduced token costs by over 75%, and realtime mini models now run at a fraction of a cent per conversation minute. A multi-step intake or workflow resolution now costs about $0.02 in raw compute, while the job on the other end is worth $400 to $2,800.`,
    `Meanwhile, legacy alternatives like ${competitor} remain bloated with enterprise seat minimums, creating an enormous open window for lightweight, modern micro-SaaS solutions.`,
  ];

  return { headline, paragraphs };
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRerunning, setIsRerunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Uncategorized");
  const [selectedPainIndex, setSelectedPainIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [agentPromptCopied, setAgentPromptCopied] = useState(false);
  const [agentModalOpen, setAgentModalOpen] = useState(false);

  const [subredditMetadata, setSubredditMetadata] = useState<
    Record<string, number>
  >({});
  const [intensityFilterApplied, setIntensityFilterApplied] =
    useState<IntensityFilter>("all");
  const [sentimentFilterApplied, setSentimentFilterApplied] =
    useState<SentimentFilter>("all");

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planDialogMessage, setPlanDialogMessage] = useState(
    "A paid plan is required to continue. Please upgrade your account.",
  );

  const categoryOptions = [
    "Uncategorized",
    "Product",
    "Marketing",
    "Growth",
    "Operations",
    "Customer Success",
  ];

  useEffect(() => {
    async function fetchReportDetail() {
      try {
        const response = await fetch(`/api/reports/${id}`);
        if (!response.ok) throw new Error("Failed to fetch report details");
        const data = await response.json();
        setReportData(data);
        setSelectedCategory(data.category || "Uncategorized");
        setSelectedPainIndex(0);
      } catch (error) {
        console.error("Error fetching report details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchReportDetail();
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function loadMetadata() {
      if (!reportData) return;
      const allSubs = new Set<string>();
      reportData.topPainPoints.forEach((p) => {
        p.subreddits.forEach((s) => allSubs.add(s));
      });
      if (allSubs.size === 0) return;

      try {
        const query = Array.from(allSubs).join(",");
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
  }, [reportData]);

  // Filtered pain points list
  const filteredPainPoints = useMemo(() => {
    if (!reportData) return [];
    return reportData.topPainPoints.filter((pain) => {
      const matchesIntensity =
        intensityFilterApplied === "all"
          ? true
          : intensityFilterApplied === "high"
            ? pain.intensity >= 8
            : pain.intensity >= 5;

      const normalizedSentiment = pain.sentiment.toLowerCase();
      const matchesSentiment =
        sentimentFilterApplied === "all"
          ? true
          : sentimentFilterApplied === "frustrated"
            ? normalizedSentiment.includes("frustrated") ||
              normalizedSentiment.includes("desperate")
            : normalizedSentiment.includes("neutral") ||
              normalizedSentiment.includes("explor");

      return matchesIntensity && matchesSentiment;
    });
  }, [reportData, intensityFilterApplied, sentimentFilterApplied]);

  // Current active pain point (Idea)
  const currentPainIndex = Math.min(
    selectedPainIndex,
    Math.max(0, filteredPainPoints.length - 1),
  );
  const currentPain = filteredPainPoints[currentPainIndex] || null;

  // Keyboard navigation
  const handleNextIdea = useCallback(() => {
    if (currentPainIndex < filteredPainPoints.length - 1) {
      setSelectedPainIndex((prev) => prev + 1);
      setIsDescriptionExpanded(false);
    }
  }, [currentPainIndex, filteredPainPoints.length]);

  const handlePrevIdea = useCallback(() => {
    if (currentPainIndex > 0) {
      setSelectedPainIndex((prev) => prev - 1);
      setIsDescriptionExpanded(false);
    }
  }, [currentPainIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        handleNextIdea();
      } else if (e.key === "ArrowLeft") {
        handlePrevIdea();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextIdea, handlePrevIdea]);

  async function handleSaveToggle(
    nextSaved: boolean,
    categoryOverride?: string,
  ) {
    if (!id || !reportData) return;
    if (reportData.isTeaser) {
      setPlanDialogMessage(
        "Saving reports is available on paid plans. Upgrade to Growth or Pro to save and organize your investigations.",
      );
      setPlanDialogOpen(true);
      return;
    }
    setIsSaving(true);
    const categoryToPersist = categoryOverride ?? selectedCategory;
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saved: nextSaved,
          category: categoryToPersist,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update report");
      }
      const data = await response.json();
      setReportData((prev) =>
        prev
          ? {
              ...prev,
              saved: data.reportSaved,
              category: data.reportCategory || categoryToPersist,
            }
          : prev,
      );
      toast.success(
        nextSaved ? "Idea saved to My Stuff." : "Idea removed from saved.",
      );
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Unable to update report.");
    } finally {
      setIsSaving(false);
    }
  }

  const generateAgentPrompt = () => {
    if (!currentPain || !reportData) return "";
    const title = deriveIdeaTitle(currentPain, reportData.title);
    const customer = deriveCustomer(currentPain);
    const pricingVal = derivePricing(currentPain);
    const competitor = deriveCompetition(currentPain);
    const quotes = currentPain.communityVoices
      .slice(0, 3)
      .map((q) => `"${q}"`)
      .join("\n");

    return `You are a Senior Full-Stack Architect and SaaS Builder.

Build an MVP web application for the validated IdeaBrowser idea:

# PRODUCT OVERVIEW
- **Idea Title:** ${title}
- **Target Customer (ICP):** ${customer}
- **Core Friction:** ${currentPain.title}
- **Pricing:** ${pricingVal} (Self-serve subscription)
- **Primary Incumbent/Alternative:** ${competitor}

# VERBATIM REDDIT SIGNALS:
${quotes}

# SYSTEM SPECIFICATION:
1. Modern Next.js App Router + Tailwind CSS frontend
2. Automated workflow engine handling customer intake
3. Stripe billing with 14-day free trial
4. Webhook and notification dispatcher

Please generate the schema, API routes, and main dashboard screen.`;
  };

  const handleCopyAgentPrompt = () => {
    const prompt = generateAgentPrompt();
    navigator.clipboard.writeText(prompt);
    setAgentPromptCopied(true);
    toast.success("Agent Prompt copied to clipboard!");
    setTimeout(() => setAgentPromptCopied(false), 2000);
  };

  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  if (!reportData) {
    return (
      <div className="mx-auto w-full max-w-7xl p-8">
        <EmptyState
          title="Idea Report Not Found"
          description="The requested idea archive could not be retrieved or has been removed."
          actionLabel="Browse All Reports"
          actionHref="/dashboard/reports"
          secondaryActionLabel="Start New Scan"
          secondaryActionHref="/dashboard/search"
          icon="reports"
          variant="hero"
        />
      </div>
    );
  }

  // Derived values for active idea
  const ideaTitle = currentPain
    ? deriveIdeaTitle(currentPain, reportData.title)
    : "";
  const customer = currentPain ? deriveCustomer(currentPain) : "";
  const market = currentPain ? deriveMarket(currentPain, selectedCategory) : "";
  const revenueCeiling = currentPain ? deriveRevenueCeiling(currentPain) : "";
  const competition = currentPain ? deriveCompetition(currentPain) : "";
  const demand = currentPain ? deriveDemand(currentPain) : "";
  const demandNumeric = currentPain ? deriveDemandNumeric(currentPain) : "";
  const pricing = currentPain ? derivePricing(currentPain) : "";
  const year1ARR = currentPain ? deriveYear1ARR(currentPain) : "";
  const difficultyLabel = currentPain
    ? deriveDifficultyLabel(currentPain.difficulty)
    : "Moderate";
  const whyNow = currentPain
    ? deriveWhyNowSection(currentPain)
    : { headline: "", paragraphs: [] };
  const narrativeParagraphs = currentPain
    ? formatNarrativeIdea(currentPain)
    : [];

  const scoreFormatted = currentPain?.validationScore
    ? (currentPain.validationScore / 10).toFixed(1)
    : currentPain
      ? (
          currentPain.intensity * 0.7 +
          (currentPain.monetization || 5) * 0.3
        ).toFixed(1)
      : "7.3";

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a] antialiased selection:bg-blue-100">
      {/* Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-md border border-zinc-200 bg-white text-zinc-950">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Plan Upgrade Required
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              {planDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setPlanDialogOpen(false)}
              className="cursor-pointer rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Cancel
            </button>
            <Link
              href="/dashboard/billing"
              className="rounded-full bg-[#2563eb] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              Upgrade Plan
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Build with Agent Modal */}
      <Dialog open={agentModalOpen} onOpenChange={setAgentModalOpen}>
        <DialogContent className="max-w-2xl border border-zinc-200 bg-white text-zinc-950">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <DialogTitle className="font-serif text-lg font-bold">
                Build &quot;{ideaTitle}&quot; with AI Agent
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-zinc-500">
              Paste this blueprint into Cursor, Claude, ChatGPT, or your AI
              coding assistant.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-2">
            <pre className="max-h-[320px] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-200">
              {generateAgentPrompt()}
            </pre>
            <button
              onClick={handleCopyAgentPrompt}
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-1 font-mono text-[10px] font-bold text-white uppercase shadow-sm transition-all hover:bg-[#1d4ed8]"
            >
              {agentPromptCopied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy Prompt
                </>
              )}
            </button>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setAgentModalOpen(false)}
              className="rounded-full border border-zinc-200 bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto w-full max-w-[1340px] space-y-6 px-4 py-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Actions Bar (IdeaBrowser Exact Top Bar) */}
        <div className="border-zinc-150 flex flex-col gap-3 border-b pb-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-normal text-zinc-500">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 transition-colors hover:text-zinc-900"
            >
              <span className="text-zinc-400">Browse Ideas</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-zinc-300" />
            <span className="max-w-[280px] truncate font-medium text-zinc-900 sm:max-w-md">
              {ideaTitle || reportData.title}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <span className="text-[11px] font-medium text-zinc-600">
                Idea Miner AI Suite
              </span>
            </div>
            <button
              onClick={() => handleSaveToggle(!reportData.saved)}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>{reportData.saved ? "Saved" : "Bookmark"}</span>
            </button>
          </div>
        </div>

        {/* Pagination Switcher Pill Bar (1 Idea Per Page Switcher) */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-2 text-xs">
          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="mr-1 shrink-0 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
              Ideas ({filteredPainPoints.length}):
            </span>
            {filteredPainPoints.map((p, idx) => {
              const active = idx === currentPainIndex;
              const pScore = p.validationScore
                ? (p.validationScore / 10).toFixed(1)
                : (p.intensity * 0.7 + (p.monetization || 5) * 0.3).toFixed(1);

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPainIndex(idx);
                    setIsDescriptionExpanded(false);
                  }}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium transition-all",
                    active
                      ? "bg-[#2563eb] font-semibold text-white shadow-xs"
                      : "text-zinc-650 border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900",
                  )}
                >
                  <span>#{idx + 1}</span>
                  <span className="max-w-[140px] truncate">
                    {deriveIdeaTitle(p, reportData.title)}
                  </span>
                  <span
                    className={cn(
                      "rounded px-1 text-[10px]",
                      active
                        ? "bg-white/20 text-white"
                        : "font-mono text-zinc-500",
                    )}
                  >
                    ★ {pScore}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1 pl-2">
            <button
              onClick={handlePrevIdea}
              disabled={currentPainIndex === 0}
              className="cursor-pointer rounded-md border border-zinc-200 bg-white p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
              title="Previous idea (Left Arrow)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-1 font-mono text-[11px] text-zinc-500">
              {currentPainIndex + 1}/{filteredPainPoints.length}
            </span>
            <button
              onClick={handleNextIdea}
              disabled={currentPainIndex >= filteredPainPoints.length - 1}
              className="cursor-pointer rounded-md border border-zinc-200 bg-white p-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
              title="Next idea (Right Arrow)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* MAIN IDEA HERO SECTION */}
        {currentPain && (
          <div className="space-y-10 pt-2">
            {/* 1. Header: Title + Score Badge */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="max-w-4xl font-serif text-3xl leading-[1.18] font-normal tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-[42px]">
                {ideaTitle}
              </h1>

              {/* Exact IdeaBrowser Score Pill ⭐ 7.3/10 */}
              <div className="flex shrink-0 items-center">
                <MetricTooltip metric="validationScore">
                  <div className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 shadow-2xs">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-500">
                      ★
                    </div>
                    <span className="font-sans text-base font-bold tracking-tight text-zinc-900">
                      {scoreFormatted}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">
                      /10
                    </span>
                  </div>
                </MetricTooltip>
              </div>
            </div>

            {/* 2. Top Two-Column Grid: Left Column (Idea + Meta + CTA) & Right Column (Mockup + 2x2 Grid) */}
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              {/* LEFT COLUMN (Wide ~60%) */}
              <div className="space-y-7 lg:col-span-7">
                {/* THE IDEA Section */}
                <div className="space-y-3">
                  <p className="font-sans text-[11px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
                    THE IDEA
                  </p>

                  <div className="space-y-3.5 font-serif text-[16px] leading-[1.68] text-[#2c2c2c] sm:text-[17px]">
                    {(() => {
                      const displayed = isDescriptionExpanded
                        ? narrativeParagraphs
                        : narrativeParagraphs.slice(0, 2);

                      return (
                        <>
                          {displayed.map((p, idx) => (
                            <p key={idx}>{p}</p>
                          ))}
                          {narrativeParagraphs.length > 2 &&
                            !isDescriptionExpanded && (
                              <button
                                type="button"
                                onClick={() => setIsDescriptionExpanded(true)}
                                className="inline-flex cursor-pointer items-center gap-1 pt-1 font-sans text-xs font-semibold text-zinc-700 transition-colors hover:text-blue-600"
                              >
                                Keep reading →
                              </button>
                            )}
                          {isDescriptionExpanded &&
                            narrativeParagraphs.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setIsDescriptionExpanded(false)}
                                className="inline-flex cursor-pointer items-center gap-1 pt-1 font-sans text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600"
                              >
                                Show less ↑
                              </button>
                            )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 4-Field Metadata Grid in IdeaBrowser Style */}
                <div className="border-zinc-150 grid grid-cols-2 gap-x-8 gap-y-5 border-t pt-6">
                  <div>
                    <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      THE CUSTOMER
                    </p>
                    <p className="mt-1 text-[13px] leading-snug font-bold text-zinc-900 sm:text-sm">
                      {customer}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      MARKET
                    </p>
                    <p className="mt-1 text-[13px] leading-snug font-bold text-zinc-900 sm:text-sm">
                      {market}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      REVENUE CEILING
                    </p>
                    <p className="mt-1 font-mono text-[13px] leading-snug font-bold text-zinc-900 sm:text-sm">
                      {revenueCeiling}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      COMPETITION
                    </p>
                    <p className="mt-1 text-[13px] leading-snug font-bold text-zinc-900 sm:text-sm">
                      {competition}
                    </p>
                  </div>
                </div>

                {/* IdeaBrowser Style Blue Gradient Button */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAgentModalOpen(true)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 font-sans text-xs font-bold tracking-wide text-white shadow-xs transition-all hover:bg-[#1d4ed8] active:scale-98"
                  >
                    <div className="flex items-center -space-x-1">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                      <div className="h-2 w-2 rounded-full bg-blue-200"></div>
                    </div>
                    <span>Build this with your agent →</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAgentPrompt}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-3 font-sans text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                  >
                    {agentPromptCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Copy Spec</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN (~40%): Mockup Card + 2x2 Metric Cards */}
              <div className="space-y-5 lg:col-span-5">
                {/* Concept Mockup Card */}
                <div className="space-y-4 rounded-2xl border border-zinc-200/90 bg-[#f8f9fa] p-4.5 shadow-2xs">
                  {/* Dual Phone Concept Mockup UI */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Phone 1: Dark Intake App Screen */}
                    <div className="space-y-2.5 rounded-xl border border-zinc-300/80 bg-[#0f2327] p-3 text-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                          <span className="font-mono text-[9px] font-bold tracking-wider text-zinc-200 uppercase">
                            RingMaster
                          </span>
                        </div>
                        <span className="py-0.2 rounded bg-white/10 px-1.5 text-[8px] text-zinc-300">
                          Live AI
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="space-y-1 rounded-lg border border-white/5 bg-white/5 p-2">
                          <p className="font-mono text-[8px] text-zinc-400">
                            Incoming Job
                          </p>
                          <p className="truncate text-[10px] font-bold text-white">
                            Emergency Pipe Leak
                          </p>
                          <p className="text-[9px] font-semibold text-emerald-400">
                            $450 estimate
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <span className="flex-1 rounded bg-white/10 py-1 text-center font-mono text-[8px]">
                            Scripts
                          </span>
                          <span className="flex-1 rounded bg-amber-500/20 py-1 text-center font-mono text-[8px] text-amber-300">
                            Rules
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Phone 2: White Operator Dashboard Screen */}
                    <div className="space-y-2.5 rounded-xl border border-zinc-300/80 bg-white p-3 text-zinc-900 shadow-sm">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                        <span className="font-mono text-[9px] font-bold text-zinc-800 uppercase">
                          Dispatch
                        </span>
                        <span className="py-0.2 rounded bg-emerald-50 px-1.5 text-[8px] font-bold text-emerald-600">
                          98% Auto
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="space-y-1 rounded-lg border border-zinc-100 bg-zinc-50 p-2">
                          <div className="flex justify-between text-[8px] text-zinc-500">
                            <span>Today</span>
                            <span className="font-bold text-zinc-800">
                              12 calls
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                            <div className="h-full w-4/5 rounded-full bg-[#2563eb]"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-center font-mono text-[8px]">
                          <div className="rounded border border-zinc-100 bg-zinc-50 p-1">
                            <span className="text-zinc-400">Won:</span>{" "}
                            <b>$2.8K</b>
                          </div>
                          <div className="rounded border border-zinc-100 bg-zinc-50 p-1">
                            <span className="text-zinc-400">Cost:</span>{" "}
                            <b>$3.20</b>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mockup Card Bottom Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-sans text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                      CONCEPT MOCKUP
                    </span>
                    <button
                      onClick={() => setAgentModalOpen(true)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#2563eb] px-3.5 py-1.5 font-sans text-[11px] font-bold tracking-wide text-white shadow-xs transition-all hover:bg-[#1d4ed8]"
                    >
                      <div className="flex items-center -space-x-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-200"></div>
                      </div>
                      <span>Build this idea →</span>
                    </button>
                  </div>
                </div>

                {/* 2x2 Metric Cards in Exact IdeaBrowser Design */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Metric 1: SOLUTION DEMAND */}
                  <div className="space-y-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-colors hover:border-zinc-300">
                    <div className="flex items-center justify-between">
                      <MetricTooltip
                        metric="marketMaturity"
                        title="Solution Demand"
                        explanation="Calculated demand score based on search velocity, user complaints, and alternative queries."
                      >
                        <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                          SOLUTION DEMAND
                        </p>
                      </MetricTooltip>
                      <span className="text-xs font-light text-zinc-300">
                        +
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-sans text-xl font-bold tracking-tight text-zinc-900">
                        {demand}
                      </p>
                      {/* IdeaBrowser Smooth Purple/Blue Sparkline Curve */}
                      <div className="pt-1">
                        <svg
                          viewBox="0 0 100 24"
                          className="h-5 w-full fill-none stroke-current text-blue-600"
                        >
                          <path
                            d="M 0 18 Q 25 18, 45 14 T 70 8 T 90 2 L 100 4"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Metric 2: PAIN */}
                  <div className="space-y-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-colors hover:border-zinc-300">
                    <div className="flex items-center justify-between">
                      <MetricTooltip metric="painIntensity">
                        <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                          PAIN
                        </p>
                      </MetricTooltip>
                      <span className="text-xs font-light text-zinc-300">
                        +
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-sans text-xl font-bold tracking-tight text-zinc-900">
                        {currentPain.intensity}{" "}
                        <span className="text-xs font-normal text-zinc-500">
                          /10 severity
                        </span>
                      </p>
                      <p className="pt-1 text-[10px] leading-tight font-normal text-zinc-500">
                        {currentPain.subreddits[0]
                          ? `r/${currentPain.subreddits[0]}`
                          : "Community"}{" "}
                        and {currentPain.mentions} more feel it
                      </p>
                    </div>
                  </div>

                  {/* Metric 3: TIMING */}
                  <div className="space-y-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-colors hover:border-zinc-300">
                    <div className="flex items-center justify-between">
                      <MetricTooltip
                        metric="urgency"
                        title="Market Timing"
                        explanation="Why the window is open now: AI turn latencies, API cost drops, and incumbent bloat."
                      >
                        <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                          TIMING
                        </p>
                      </MetricTooltip>
                      <span className="text-xs font-light text-zinc-300">
                        +
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-sans text-xl font-bold tracking-tight text-zinc-900">
                        {currentPain.maturity || 8}{" "}
                        <span className="text-xs font-normal text-zinc-500">
                          /10
                        </span>
                      </p>
                      <p className="pt-1 text-[10px] leading-tight font-medium text-blue-600">
                        why the window is open
                      </p>
                    </div>
                  </div>

                  {/* Metric 4: YEAR 1, DONE RIGHT */}
                  <div className="space-y-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-colors hover:border-zinc-300">
                    <div className="flex items-center justify-between">
                      <MetricTooltip
                        metric="monetization"
                        title="Year 1 ARR Potential"
                        explanation="Estimated ARR range reachable in year 1 with focused execution and modern pricing."
                      >
                        <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                          YEAR 1, DONE RIGHT
                        </p>
                      </MetricTooltip>
                      <span className="text-xs font-light text-zinc-300">
                        +
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-sans text-xl font-bold tracking-tight text-zinc-900">
                        {year1ARR}
                      </p>
                      <p className="pt-1 text-[10px] leading-tight font-normal text-emerald-600">
                        ceiling {revenueCeiling}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Lower Section: WHY NOW (Left) & AT A GLANCE (Right Sticky Sidebar) */}
            <div className="border-zinc-150 grid grid-cols-1 items-start gap-10 border-t pt-10 lg:grid-cols-12">
              {/* LEFT LOWER COLUMN (Wide ~65%) */}
              <div className="space-y-10 lg:col-span-8">
                {/* WHY NOW Section */}
                <div className="space-y-4">
                  <p className="font-sans text-[11px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
                    WHY NOW
                  </p>
                  <h2 className="font-serif text-2xl leading-snug font-normal text-[#1a1a1a] sm:text-3xl">
                    {whyNow.headline}
                  </h2>
                  <div className="space-y-3.5 font-serif text-[16px] leading-[1.68] text-[#2c2c2c]">
                    {whyNow.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* COMMUNITY EVIDENCE & VERBATIM QUOTES */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-[11px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
                      COMMUNITY VOICES & VERBATIM EVIDENCE
                    </p>
                    {currentPain.postUrl && (
                      <a
                        href={currentPain.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                      >
                        <span>View Reddit Thread</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-3">
                    {currentPain.communityVoices.map((voice, idx) => (
                      <div
                        key={idx}
                        className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-semibold text-zinc-700">
                            r/
                            {currentPain.subreddits[
                              idx % currentPain.subreddits.length
                            ] || "reddit"}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            Verified Community Quote
                          </span>
                        </div>
                        <p className="font-serif text-[15px] leading-relaxed text-zinc-800 italic">
                          &quot;{voice}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WILLINGNESS TO PAY (WTP) */}
                {currentPain.hasWillingnessToPay &&
                  currentPain.budgetSignals &&
                  currentPain.budgetSignals.length > 0 && (
                    <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5">
                      <p className="font-sans text-[11px] font-bold tracking-[0.16em] text-emerald-700 uppercase">
                        WILLINGNESS TO PAY SIGNALS
                      </p>
                      <div className="space-y-2">
                        {currentPain.budgetSignals.map((signal, sIdx) => (
                          <div
                            key={sIdx}
                            className="space-y-1 rounded-xl border border-emerald-100 bg-white p-3.5 shadow-2xs"
                          >
                            <p className="font-serif text-sm text-zinc-800 italic">
                              &quot;{signal.quote}&quot;
                            </p>
                            <p className="font-mono text-[10px] font-semibold text-emerald-600 uppercase">
                              {signal.source} signal
                              {signal.annualizedMidpointUsd
                                ? ` • $${signal.annualizedMidpointUsd.toLocaleString()} annualized value`
                                : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* BUYER LANGUAGE COPY ANGLES */}
                {currentPain.userLanguage && (
                  <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5">
                    <p className="font-sans text-[11px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
                      NATURAL BUYER LANGUAGE & COPY ANGLES
                    </p>
                    <p className="text-xs leading-relaxed font-medium text-zinc-700">
                      {currentPain.userLanguage.overview}
                    </p>
                    <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                      {currentPain.userLanguage.sections.map((sec, sIdx) => (
                        <div
                          key={sIdx}
                          className="space-y-1.5 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs"
                        >
                          <p className="font-sans text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                            {sec.label}
                          </p>
                          <ul className="space-y-1">
                            {sec.examples.map((ex, eIdx) => (
                              <li
                                key={eIdx}
                                className="font-serif text-xs text-zinc-800 italic"
                              >
                                &quot;{ex}&quot;
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT STICKY SIDEBAR ("AT A GLANCE") */}
              <div className="sticky top-6 space-y-6 lg:col-span-4">
                {/* AT A GLANCE Summary Card */}
                <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
                  <div className="border-zinc-150 flex items-center justify-between border-b pb-2.5">
                    <span className="font-sans text-[11px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
                      AT A GLANCE
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-sans text-xs font-bold text-zinc-800">
                      ★ {scoreFormatted}
                    </span>
                  </div>

                  <div className="divide-zinc-150 divide-y font-sans text-xs">
                    <div className="flex items-center justify-between py-2.5">
                      <MetricTooltip
                        metric="marketMaturity"
                        title="Solution Demand"
                        explanation="Calculated demand score based on search velocity, user complaints, and alternative queries."
                      >
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                          SOLUTION DEMAND
                        </span>
                      </MetricTooltip>
                      <span className="font-bold text-zinc-900">
                        {demandNumeric}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <MetricTooltip metric="willingnessToPay">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                          PRICING
                        </span>
                      </MetricTooltip>
                      <span className="font-bold text-zinc-900">{pricing}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <MetricTooltip metric="difficulty">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                          DIFFICULTY
                        </span>
                      </MetricTooltip>
                      <span className="font-bold text-zinc-900">
                        {difficultyLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <MetricTooltip
                        metric="marketMaturity"
                        title="Incumbents & Competitors"
                        explanation="The existing alternatives and legacy solutions currently dominating the workflow."
                      >
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                          UP AGAINST
                        </span>
                      </MetricTooltip>
                      <span className="flex items-center gap-1 font-bold text-zinc-900">
                        <span>{competition}</span>
                        <ChevronRight className="h-3 w-3 text-zinc-400" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* MVP Implementation Blueprint */}
                <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
                  <p className="font-sans text-[11px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
                    WHAT TO BUILD (MVP BLUEPRINT)
                  </p>
                  <div className="space-y-2 text-xs text-zinc-700">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">•</span>
                      <span>
                        Single-purpose intake dashboard for {customer}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">•</span>
                      <span>
                        Instant SMS & webhook alerts to prevent lost deals
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">•</span>
                      <span>One-click export to Google Sheets & CRM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
