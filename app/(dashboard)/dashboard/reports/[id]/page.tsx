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
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReportDetailSkeleton } from "@/components/dashboard/report-detail-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricTooltip } from "@/components/ui/metric-tooltip";
import { ReportShareModal } from "@/components/dashboard/report-share-modal";
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

const SUBREDDIT_PERSONA_MAP: Record<string, string> = {
  reactjs: "React & Next.js Developers",
  webdev: "Full-Stack Web Developers",
  javascript: "Frontend & Full-Stack Engineers",
  python: "Python Developers & Data Engineers",
  programming: "Software Engineers & Tech Teams",
  startups: "Startup Founders & Operators",
  entrepreneur: "Small Business Owners & Founders",
  indiehackers: "Solo Founders & Indie Builders",
  saas: "B2B SaaS Founders & Product Teams",
  smallbusiness: "Small Business Owners",
  shopify: "Shopify & E-Commerce Merchants",
  ecommerce: "Online Brand Operators & Merchants",
  marketing: "Digital Marketers & Growth Leads",
  seo: "SEO Specialists & Content Strategists",
  copywriting: "Copywriters & Content Agencies",
  devops: "DevOps & Cloud Engineers",
  sysadmin: "Systems & Infrastructure Admins",
  cybersecurity: "Security Engineers & Analysts",
  freelance: "Independent Freelancers & Consultants",
  notion: "Knowledge Workers & Notion Power Users",
  sales: "B2B Sales Reps & Account Execs",
};

function deriveCustomer(pain: PainPoint): string {
  if (pain.subreddits && pain.subreddits.length > 0) {
    const rawSub = pain.subreddits[0].replace(/^r\//i, "").toLowerCase();
    if (SUBREDDIT_PERSONA_MAP[rawSub]) {
      return SUBREDDIT_PERSONA_MAP[rawSub];
    }
    return `${toTitleCase(rawSub)} Practitioners & Teams`;
  }
  return "Operators & Specialized Teams";
}

function deriveMarket(pain: PainPoint, reportCategory?: string): string {
  if (reportCategory && reportCategory !== "Uncategorized") {
    return `B2B • ${reportCategory} Software`;
  }
  if (pain.subreddits && pain.subreddits.length > 0) {
    const sub = pain.subreddits[0].replace(/^r\//i, "").toLowerCase();
    if (
      [
        "reactjs",
        "webdev",
        "javascript",
        "python",
        "programming",
        "devops",
        "sysadmin",
      ].includes(sub)
    ) {
      return "B2B • Developer Tools";
    }
    if (["shopify", "ecommerce"].includes(sub)) {
      return "B2B • E-commerce Tech";
    }
    if (["marketing", "seo", "copywriting", "growth"].includes(sub)) {
      return "B2B • Growth & Marketing";
    }
    return `B2B • ${toTitleCase(sub)} SaaS`;
  }
  return "B2B • Micro-SaaS";
}

function deriveRevenueCeiling(pain: PainPoint): string {
  const tam = pain.cluster?.estimatedTamUsdAnnual;
  if (tam && tam > 1_000_000) {
    const low = Math.max(1, Math.round((tam * 0.3) / 1_000_000));
    const high = Math.max(low + 2, Math.round(tam / 1_000_000));
    return `$${low}M-$${high}M ARR`;
  }
  const mon = Math.max(3, pain.monetization || 5);
  const low = mon <= 5 ? 2 : mon <= 7 ? 5 : 10;
  const high = low * 3;
  return `$${low}M-$${high}M ARR`;
}

function deriveCompetition(pain: PainPoint): string {
  if (pain.triedSolutions && pain.triedSolutions.length > 0) {
    const filtered = pain.triedSolutions.filter(
      (s) =>
        s &&
        !s.toLowerCase().includes("none") &&
        !s.toLowerCase().includes("n/a"),
    );
    if (filtered.length > 0) {
      return filtered.slice(0, 2).join(" & ");
    }
  }
  if (
    pain.cluster?.competitorIntel &&
    pain.cluster.competitorIntel.length > 0
  ) {
    return pain.cluster.competitorIntel
      .map((c) => c.name)
      .slice(0, 2)
      .join(" & ");
  }
  return "Manual Workarounds & Ad-hoc Scripts";
}

function deriveDemand(pain: PainPoint): string {
  const mentions = Math.max(1, pain.mentions || 1);
  if (mentions >= 100) return `${mentions} thread signals`;
  return `${mentions} verified mentions`;
}

function deriveDemandNumeric(pain: PainPoint): string {
  const mentions = Math.max(1, pain.mentions || 1);
  return `${mentions} Citations`;
}

function derivePricing(pain: PainPoint): string {
  if (pain.budgetSignals && pain.budgetSignals.length > 0) {
    const s = pain.budgetSignals[0];
    if (s.amountMinUsd && s.amountMaxUsd)
      return `$${s.amountMinUsd}-$${s.amountMaxUsd}/mo`;
    if (s.amountMinUsd) return `$${s.amountMinUsd}/mo`;
  }
  const mon = pain.monetization || 5;
  if (mon >= 8) return "$49-$149/mo";
  if (mon >= 5) return "$29-$79/mo";
  return "$19-$39/mo";
}

function deriveYear1ARR(pain: PainPoint): string {
  const mon = pain.monetization || 6;
  if (mon >= 8) return "$120K-$250K ARR";
  if (mon >= 6) return "$60K-$120K ARR";
  return "$30K-$75K ARR";
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
    .filter((p) => p.length > 30);

  if (rawParts.length >= 2) {
    return rawParts;
  }

  const cleanSub = pain.subreddits?.[0]
    ? `r/${pain.subreddits[0].replace(/^r\//i, "")}`
    : "online communities";
  const customer = deriveCustomer(pain);
  const competitor = deriveCompetition(pain);
  const pricing = derivePricing(pain);
  const title = pain.title.trim();

  const p1 = `Across ${cleanSub}, ${customer.toLowerCase()} report recurring friction with ${title.toLowerCase()}. As highlighted in community threads: "${desc || pain.communityVoices?.[0] || title}".`;

  const p2 = `Existing options like ${competitor} fail to address the core requirements, forcing teams into complex manual steps or patchwork workarounds. When these workflows break down, operators face compounding delays and operational overhead.`;

  const p3 = `The opportunity is a streamlined, purpose-built SaaS solution designed specifically for ${customer}, priced around ${pricing}. By directly resolving this bottleneck, it provides immediate time savings and positive ROI without enterprise bloat.`;

  return [p1, p2, p3];
}

function deriveWhyNowSection(pain: PainPoint): {
  headline: string;
  paragraphs: string[];
} {
  const cleanSub = pain.subreddits?.[0]
    ? `r/${pain.subreddits[0].replace(/^r\//i, "")}`
    : "target communities";
  const competitor = deriveCompetition(pain);
  const pricing = derivePricing(pain);
  const title = pain.title.trim();
  const customer = deriveCustomer(pain);

  const headline = `Market demand for solving "${title}" is surging while legacy tools remain high-friction`;

  const paragraphs = [
    `Community sentiment across ${cleanSub} indicates an inflection point. Users are increasingly vocal about the limitations of existing approaches like ${competitor}, where dissatisfaction and urgency (rated ${pain.urgency || 7}/10) are driving active search for modern alternatives.`,
    `Modern developer tooling and API integrations now make it feasible to build a hyper-focused micro-SaaS in weeks rather than months. Lightweight architectures can deliver 10x faster setup and superior UX compared to legacy incumbents with bloated feature sets.`,
    `With strong willingness-to-pay indicators in the ${pricing} bracket, ${customer.toLowerCase()} are eager to adopt dedicated utilities that deliver fast, measurable workflow improvements.`,
  ];

  return { headline, paragraphs };
}

export default function ReportDetailPage() {
  const params = useParams();
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
  const [shareModalOpen, setShareModalOpen] = useState(false);

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

      {/* Share & Embed Badge Modal */}
      <ReportShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        reportTitle={reportData.title}
        ideaTitle={ideaTitle}
        validationScore={scoreFormatted}
        reportId={id}
      />

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
              onClick={() => setShareModalOpen(true)}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
            >
              <Share2 className="h-3.5 w-3.5 text-zinc-500" />
              <span>Share</span>
            </button>
            <button
              onClick={() => handleSaveToggle(!reportData.saved)}
              disabled={isSaving}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
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

                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-3 font-sans text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                  >
                    <Share2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Share Opportunity</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN (~40%): Mockup Card + 2x2 Metric Cards */}
              <div className="space-y-5 lg:col-span-5">
                {/* Concept Mockup Card */}
                <div className="space-y-4 rounded-2xl border border-zinc-200/90 bg-[#f8f9fa] p-4.5 shadow-2xs">
                  {/* Dynamic Concept Mockup UI */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Phone 1: Detection / Resolver App Screen */}
                    <div className="space-y-2.5 rounded-xl border border-zinc-300/80 bg-[#0f172a] p-3 text-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></div>
                          <span className="font-mono text-[9px] font-bold tracking-wider text-zinc-200 uppercase truncate">
                            {ideaTitle.split(" ")[0]} Flow
                          </span>
                        </div>
                        <span className="shrink-0 py-0.2 rounded bg-white/10 px-1.5 font-mono text-[8px] text-zinc-300">
                          {currentPain.subreddits[0]
                            ? `r/${currentPain.subreddits[0].replace(/^r\//i, "")}`
                            : "Active"}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="space-y-1 rounded-lg border border-white/5 bg-white/5 p-2">
                          <p className="font-mono text-[8px] text-zinc-400">
                            Problem Detected
                          </p>
                          <p className="line-clamp-2 text-[10px] font-bold text-white leading-tight">
                            {currentPain.title}
                          </p>
                          <p className="text-[9px] font-semibold text-emerald-400">
                            {pricing} • {difficultyLabel}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <span className="flex-1 rounded bg-white/10 py-1 text-center font-mono text-[8px] text-zinc-300 truncate px-1">
                            {currentPain.sentiment || "Frustrated"}
                          </span>
                          <span className="flex-1 rounded bg-blue-500/20 py-1 text-center font-mono text-[8px] text-blue-300 truncate px-1">
                            Urgency {currentPain.urgency || 7}/10
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Phone 2: Resolution & Value Metrics Screen */}
                    <div className="space-y-2.5 rounded-xl border border-zinc-300/80 bg-white p-3 text-zinc-900 shadow-sm">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                        <span className="font-mono text-[9px] font-bold text-zinc-800 uppercase">
                          Resolver Hub
                        </span>
                        <span className="py-0.2 rounded bg-emerald-50 px-1.5 text-[8px] font-bold text-emerald-600">
                          Validated
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="space-y-1 rounded-lg border border-zinc-100 bg-zinc-50 p-2">
                          <div className="flex justify-between text-[8px] text-zinc-500">
                            <span>Validation Score</span>
                            <span className="font-bold text-zinc-800">
                              {scoreFormatted}/10
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                            <div
                              className="h-full rounded-full bg-[#2563eb]"
                              style={{
                                width: `${Math.min(100, Math.max(25, currentPain.validationScore || 70))}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-center font-mono text-[8px]">
                          <div className="rounded border border-zinc-100 bg-zinc-50 p-1 truncate">
                            <span className="text-zinc-400">Target:</span>{" "}
                            <b className="text-zinc-700">
                              {customer.split(" ")[0]}
                            </b>
                          </div>
                          <div className="rounded border border-zinc-100 bg-zinc-50 p-1 truncate">
                            <span className="text-zinc-400">Vs:</span>{" "}
                            <b className="text-zinc-700">
                              {competition.split(" ")[0]}
                            </b>
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
                        Single-purpose dashboard tailored for {customer}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">•</span>
                      <span>
                        Automated workflow resolving &quot;{currentPain.title}&quot;
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">•</span>
                      <span>
                        Direct displacement alternative to {competition} at {pricing}
                      </span>
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
