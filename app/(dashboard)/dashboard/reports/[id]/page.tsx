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
import { useParams } from "next/navigation";
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
import {
  generateStructuredNarrative,
  generatePainThesis,
  generateDemandPicture,
  generateTimingThesis,
  generateMoneyMath,
  generateOpportunitySignals,
  generateComprehensiveAgentPrompt,
  type MoneyMath,
  type DemandPicture,
  type TimingThesis,
  type PainThesis,
  type OpportunitySignals,
} from "@/lib/narrative-engine";

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
  ideaNarrative?: {
    catalystContext?: string;
    productMechanics?: string;
    distributionPlaybook?: string;
    wedgeAnalysis?: string;
    revenueCeilingModel?: string;
    paragraphs?: string[];
  };
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
  return `${(mentions * 2.4).toFixed(1)}K/mo`;
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

function deriveYear1ARR(pain: PainPoint, math?: MoneyMath | null): string {
  if (math?.yearOneSummary) {
    const match = math.yearOneSummary.match(/\$(\d+K-\$\d+K|\d+K-\d+K)/i);
    if (match) return match[0].toUpperCase().includes("ARR") ? match[0] : `${match[0]} ARR`;
  }
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

function formatNarrativeIdea(pain: PainPoint, reportCategory?: string): string[] {
  const structured = generateStructuredNarrative({
    id: pain.id,
    title: pain.title,
    body: pain.description,
    subreddit: pain.subreddits?.[0],
    category: reportCategory,
    triedSolutions: pain.triedSolutions,
    sentiment: pain.sentiment,
    urgency:
      pain.urgency === "Extreme Urgency"
        ? 9
        : pain.urgency === "High Urgency"
          ? 7
          : 5,
    intensity: pain.intensity,
    monetizationScore: pain.monetization,
    marketMaturity: pain.maturity,
    difficulty: pain.difficulty,
    quotes: pain.communityVoices,
    budgetSignals: pain.budgetSignals,
    tamUsdAnnual: pain.cluster?.estimatedTamUsdAnnual,
    competitors: pain.cluster?.competitorIntel,
    ideaNarrative: pain.ideaNarrative,
  });
  return structured.paragraphs;
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
  const [painModalOpen, setPainModalOpen] = useState(false);
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [selectedDemandTermIndex, setSelectedDemandTermIndex] = useState(0);
  const [timingModalOpen, setTimingModalOpen] = useState(false);
  const [arrModalOpen, setArrModalOpen] = useState(false);

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
      setSelectedDemandTermIndex(0);
      setIsDescriptionExpanded(false);
    }
  }, [currentPainIndex, filteredPainPoints.length]);

  const handlePrevIdea = useCallback(() => {
    if (currentPainIndex > 0) {
      setSelectedPainIndex((prev) => prev - 1);
      setSelectedDemandTermIndex(0);
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
    return generateComprehensiveAgentPrompt({
      id: currentPain.id,
      title: currentPain.title,
      body: currentPain.description || "",
      subreddit: currentPain.subreddits?.[0] || "",
      category: selectedCategory,
      triedSolutions: currentPain.triedSolutions,
      sentiment: currentPain.sentiment,
      urgency:
        typeof currentPain.urgency === "number"
          ? currentPain.urgency
          : parseInt(currentPain.urgency, 10) || 8,
      intensity: currentPain.intensity,
      monetizationScore: currentPain.monetization,
      marketMaturity: currentPain.maturity,
      difficulty: currentPain.difficulty,
      quotes: currentPain.communityVoices,
      budgetSignals: currentPain.budgetSignals,
      tamUsdAnnual: currentPain.cluster?.estimatedTamUsdAnnual,
      competitors: currentPain.cluster?.competitorIntel?.map((c) => ({
        name: c.name,
      })),
      ideaNarrative: currentPain.ideaNarrative,
    });
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

  // Generate real narrative & metric engines first
  const painThesis = currentPain
    ? generatePainThesis({
        id: currentPain.id,
        title: currentPain.title,
        body: currentPain.description || "",
        subreddit: currentPain.subreddits?.[0] || "",
        category: selectedCategory,
        triedSolutions: currentPain.triedSolutions,
        sentiment: currentPain.sentiment,
        urgency:
          typeof currentPain.urgency === "number"
            ? currentPain.urgency
            : parseInt(currentPain.urgency, 10) || 8,
        intensity: currentPain.intensity,
        monetizationScore: currentPain.monetization,
        marketMaturity: currentPain.maturity,
        difficulty: currentPain.difficulty,
        quotes: currentPain.communityVoices,
        budgetSignals: currentPain.budgetSignals,
        tamUsdAnnual: currentPain.cluster?.estimatedTamUsdAnnual,
        competitors: currentPain.cluster?.competitorIntel?.map((c) => ({
          name: c.name,
        })),
      })
    : null;

  const demandPicture = currentPain
    ? generateDemandPicture({
        id: currentPain.id,
        title: currentPain.title,
        body: currentPain.description || "",
        subreddit: currentPain.subreddits?.[0] || "",
        category: selectedCategory,
        triedSolutions: currentPain.triedSolutions,
        sentiment: currentPain.sentiment,
        urgency:
          typeof currentPain.urgency === "number"
            ? currentPain.urgency
            : parseInt(currentPain.urgency, 10) || 8,
        intensity: currentPain.intensity,
        monetizationScore: currentPain.monetization,
        marketMaturity: currentPain.maturity,
        difficulty: currentPain.difficulty,
        quotes: currentPain.communityVoices,
        budgetSignals: currentPain.budgetSignals,
        tamUsdAnnual: currentPain.cluster?.estimatedTamUsdAnnual,
        competitors: currentPain.cluster?.competitorIntel?.map((c) => ({
          name: c.name,
        })),
      })
    : null;

  const activeDemandTerm =
    demandPicture && demandPicture.terms.length > 0
      ? demandPicture.terms[
          Math.min(
            selectedDemandTermIndex,
            demandPicture.terms.length - 1
          )
        ]
      : null;

  const primaryDemandTerm =
    demandPicture && demandPicture.terms.length > 0
      ? demandPicture.terms[0]
      : null;

  const secondaryDemandTerms =
    demandPicture && demandPicture.terms.length > 1
      ? demandPicture.terms.slice(1, 4)
      : demandPicture?.terms || [];

  const timingThesis = currentPain
    ? generateTimingThesis({
        id: currentPain.id,
        title: currentPain.title,
        body: currentPain.description || "",
        subreddit: currentPain.subreddits?.[0] || "",
        category: selectedCategory,
        triedSolutions: currentPain.triedSolutions,
        sentiment: currentPain.sentiment,
        urgency:
          typeof currentPain.urgency === "number"
            ? currentPain.urgency
            : parseInt(currentPain.urgency, 10) || 8,
        intensity: currentPain.intensity,
        monetizationScore: currentPain.monetization,
        marketMaturity: currentPain.maturity,
        difficulty: currentPain.difficulty,
        quotes: currentPain.communityVoices,
        budgetSignals: currentPain.budgetSignals,
        tamUsdAnnual: currentPain.cluster?.estimatedTamUsdAnnual,
        competitors: currentPain.cluster?.competitorIntel?.map((c) => ({
          name: c.name,
        })),
      })
    : null;

  const moneyMath = currentPain
    ? generateMoneyMath({
        id: currentPain.id,
        title: currentPain.title,
        body: currentPain.description || "",
        subreddit: currentPain.subreddits?.[0] || "",
        category: selectedCategory,
        triedSolutions: currentPain.triedSolutions,
        sentiment: currentPain.sentiment,
        urgency:
          typeof currentPain.urgency === "number"
            ? currentPain.urgency
            : parseInt(currentPain.urgency, 10) || 8,
        intensity: currentPain.intensity,
        monetizationScore: currentPain.monetization,
        marketMaturity: currentPain.maturity,
        difficulty: currentPain.difficulty,
        budgetSignals: currentPain.budgetSignals,
        tamUsdAnnual: currentPain.cluster?.estimatedTamUsdAnnual,
        competitors: currentPain.cluster?.competitorIntel?.map((c) => ({
          name: c.name,
        })),
      })
    : null;

  const opportunitySignals = currentPain
    ? generateOpportunitySignals({
        id: currentPain.id,
        title: currentPain.title,
        body: currentPain.description || "",
        subreddit: currentPain.subreddits?.[0] || "",
        category: selectedCategory,
        triedSolutions: currentPain.triedSolutions,
        sentiment: currentPain.sentiment,
        urgency:
          typeof currentPain.urgency === "number"
            ? currentPain.urgency
            : parseInt(currentPain.urgency, 10) || 8,
        intensity: currentPain.intensity,
        monetizationScore: currentPain.monetization,
        marketMaturity: currentPain.maturity,
        difficulty: currentPain.difficulty,
        quotes: currentPain.communityVoices,
        budgetSignals: currentPain.budgetSignals,
        tamUsdAnnual: currentPain.cluster?.estimatedTamUsdAnnual,
        competitors: currentPain.cluster?.competitorIntel?.map((c) => ({
          name: c.name,
        })),
      })
    : null;

  // Derived values for active idea
  const ideaTitle = currentPain
    ? deriveIdeaTitle(currentPain, reportData.title)
    : "";
  const customer = currentPain ? deriveCustomer(currentPain) : "";
  const market = currentPain ? deriveMarket(currentPain, selectedCategory) : "";
  const revenueCeiling = moneyMath?.ceilingBadge || (currentPain ? deriveRevenueCeiling(currentPain) : "");
  const competition = currentPain ? deriveCompetition(currentPain) : "";
  const demand = demandPicture?.topSearchVolume || (currentPain ? deriveDemand(currentPain) : "14.8K/mo");
  const demandNumeric = currentPain ? deriveDemandNumeric(currentPain) : "";
  const pricing = currentPain ? derivePricing(currentPain) : "";
  const year1ARR = currentPain ? deriveYear1ARR(currentPain, moneyMath) : "";
  const difficultyLabel = currentPain
    ? deriveDifficultyLabel(currentPain.difficulty)
    : "Moderate";
  const whyNow = currentPain
    ? {
        headline: timingThesis?.headline || deriveWhyNowSection(currentPain).headline,
        paragraphs:
          timingThesis?.narrativeParagraphs && timingThesis.narrativeParagraphs.length > 0
            ? timingThesis.narrativeParagraphs
            : deriveWhyNowSection(currentPain).paragraphs,
        sources: timingThesis?.sources || [],
      }
    : { headline: "", paragraphs: [], sources: [] };
  const narrativeParagraphs = currentPain
    ? formatNarrativeIdea(currentPain, selectedCategory)
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
        <DialogContent className="w-full sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto border border-zinc-200 bg-white text-zinc-950 p-6 sm:rounded-2xl sm:p-8 shadow-2xl">
          <DialogHeader className="space-y-2 border-b border-zinc-100 pb-4 text-left">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                AI CODING ASSISTANT BLUEPRINT
              </span>
              <div className="hidden sm:flex items-center gap-1.5">
                {["Cursor", "Claude Code", "Windsurf", "ChatGPT", "Copilot"].map((agent) => (
                  <span
                    key={agent}
                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-600"
                  >
                    {agent}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <div>
                <DialogTitle className="font-serif text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                  Build &quot;{ideaTitle}&quot; with AI Agent
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 mt-0.5">
                  Turnkey full-stack prompt specification including Drizzle schema, REST API routes, core algorithms, and implementation phases.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="relative mt-3">
            <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>prompt-blueprint.md</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                {generateAgentPrompt().length.toLocaleString()} characters • Ready to paste
              </span>
            </div>
            <pre className="max-h-[460px] overflow-y-auto rounded-b-xl border border-zinc-800 bg-zinc-950 p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-200 selection:bg-blue-600 selection:text-white scrollbar-thin">
              {generateAgentPrompt()}
            </pre>
            <button
              onClick={handleCopyAgentPrompt}
              className="absolute top-12 right-4 flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3.5 py-1.5 font-sans text-xs font-bold text-white shadow-md transition-all hover:bg-[#1d4ed8] active:scale-98 cursor-pointer"
            >
              {agentPromptCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied Specification!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Full Blueprint
                </>
              )}
            </button>
          </div>

          <DialogFooter className="border-t border-zinc-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="font-semibold text-zinc-700">Target Stack:</span>
              <span>Next.js 15 • TypeScript • Drizzle ORM • PostgreSQL • Tailwind CSS • Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAgentPrompt}
                className="rounded-full bg-[#2563eb] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1d4ed8] cursor-pointer"
              >
                {agentPromptCopied ? "Copied to Clipboard" : "Copy Blueprint"}
              </button>
              <button
                type="button"
                onClick={() => setAgentModalOpen(false)}
                className="rounded-full border border-zinc-200 bg-zinc-100 px-5 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 cursor-pointer"
              >
                Close
              </button>
            </div>
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

      {/* IdeaBrowser Style "Why the pain scores high" Modal */}
      <Dialog open={painModalOpen} onOpenChange={setPainModalOpen}>
        <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-4xl max-h-[88vh] overflow-y-auto border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl sm:rounded-2xl sm:p-9">
          {painThesis && (
            <div className="space-y-7">
              <DialogHeader className="space-y-2 border-b border-zinc-100 pb-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    PAIN SCORE THESIS
                  </span>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    <span>★ {currentPain?.intensity || 7}/10 Severity</span>
                  </div>
                </div>
                <DialogTitle className="font-serif text-2xl font-normal tracking-tight text-zinc-900 sm:text-3xl lg:text-[34px]">
                  Why the pain scores high.
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Deep analysis of why this specific pain point scores high in severity, customer friction, and economic loss.
                </DialogDescription>
              </DialogHeader>

              {/* Analytical Context Paragraphs */}
              <div className="space-y-4 font-serif text-[15px] leading-[1.75] text-[#2c2c2c] sm:text-[16px]">
                <p>{painThesis.customerContext}</p>
                <p>{painThesis.leakageContext}</p>
              </div>

              {/* 4 Numbered Pain Points in a 2x2 Grid on Wide Screens */}
              <div className="space-y-3 pt-2">
                <h3 className="font-sans text-xs font-bold tracking-widest text-zinc-900 uppercase">
                  Pain points
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {painThesis.painPoints.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 transition-colors hover:bg-zinc-50"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 font-mono text-xs font-bold text-white shadow-2xs">
                        {item.id}
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <p className="font-bold text-zinc-900 leading-snug">
                          {item.theme}
                        </p>
                        <p className="leading-relaxed text-zinc-600">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Their Own Words in a 3-Card Grid */}
              <div className="space-y-3 pt-2">
                <h3 className="font-sans text-xs font-bold tracking-widest text-zinc-900 uppercase">
                  In their own words
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {painThesis.quotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs space-y-3"
                    >
                      <p className="font-serif text-xs italic leading-relaxed text-zinc-700">
                        &ldquo;{q.quote}&rdquo;
                      </p>
                      <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-[11px] font-medium text-zinc-400">
                        <span className="truncate max-w-[140px]">{q.source}</span>
                        {currentPain?.postUrl ? (
                          <a
                            href={currentPain.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold text-blue-600 hover:underline shrink-0"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={() => setPainModalOpen(false)}
                  className="rounded-full border border-zinc-200 bg-zinc-100 px-6 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
                >
                  Close
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Solution Demand Modal - The demand picture */}
      <Dialog open={demandModalOpen} onOpenChange={setDemandModalOpen}>
        <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-4xl max-h-[88vh] overflow-y-auto border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl sm:rounded-2xl sm:p-9">
          {demandPicture && (
            <div className="space-y-6">
              <DialogHeader className="space-y-1 text-left pb-1">
                <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                  SEARCH INTELLIGENCE
                </span>
                <DialogTitle className="font-serif text-2xl font-normal tracking-tight text-zinc-900 sm:text-3xl lg:text-[34px]">
                  The demand picture.
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Verified Google Search engine demand, monthly query volumes, growth metrics, and keyword velocity.
                </DialogDescription>
              </DialogHeader>

              {/* Highlight Card */}
              <div className="rounded-2xl border border-indigo-100/80 bg-[#FAFAFE] p-6 space-y-2">
                <div className="font-sans text-[11px] font-bold tracking-widest text-[#6366F1] uppercase">
                  {demandPicture.headlineCategory}
                </div>
                <div className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
                  {demandPicture.topSearchVolume}
                </div>
                <div className="font-sans text-sm text-zinc-600 leading-snug">
                  {demandPicture.topSearchQuery}
                </div>
                <div className="pt-1">
                  <a
                    href={demandPicture.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-[#6366F1] hover:underline"
                  >
                    <span>See the source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* The Terms Section */}
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                      THE TERMS
                    </span>
                    {activeDemandTerm && (
                      <a
                        href={activeDemandTerm.googleTrendsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-sans text-[11px] font-medium text-blue-600 hover:underline"
                      >
                        <span>Explore on Google Trends</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="relative inline-block w-full sm:w-auto">
                    <select
                      value={selectedDemandTermIndex}
                      onChange={(e) =>
                        setSelectedDemandTermIndex(Number(e.target.value))
                      }
                      className="w-full sm:w-auto cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-4 pr-10 font-sans text-sm font-semibold text-zinc-900 shadow-2xs hover:bg-zinc-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      {demandPicture.terms.map((t, idx) => (
                        <option key={idx} value={idx}>
                          &ldquo;{t.term}&rdquo;
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 4 Metric Columns */}
                {activeDemandTerm && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 text-center">
                    <div className="space-y-1">
                      <div className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-[#2563EB]">
                        {activeDemandTerm.volume}
                      </div>
                      <div className="font-sans text-xs sm:text-sm font-medium text-zinc-500">
                        Volume
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "font-sans text-3xl sm:text-4xl font-bold tracking-tight",
                          activeDemandTerm.growthIsPositive
                            ? "text-[#10B981]"
                            : "text-[#EF4444]",
                        )}
                      >
                        {activeDemandTerm.growth}
                      </div>
                      <div className="font-sans text-xs sm:text-sm font-medium text-zinc-500">
                        Growth
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-[#D97706]">
                        {activeDemandTerm.cpc}
                      </div>
                      <div className="font-sans text-xs sm:text-sm font-medium text-zinc-500">
                        CPC
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-[#8B5CF6]">
                        {activeDemandTerm.competition}
                      </div>
                      <div className="font-sans text-xs sm:text-sm font-medium text-zinc-500">
                        Competition
                      </div>
                    </div>
                  </div>
                )}

                {/* Area Chart */}
                {activeDemandTerm && (
                  <div className="space-y-2 pt-2">
                    <div className="relative w-full overflow-hidden rounded-xl bg-white p-2">
                      <svg
                        viewBox="0 0 700 240"
                        className="w-full h-auto overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="demandAreaGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3B82F6"
                              stopOpacity="0.14"
                            />
                            <stop
                              offset="100%"
                              stopColor="#3B82F6"
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                        </defs>

                        {/* 5 Grid Lines & Y-Axis Labels */}
                        {activeDemandTerm.yAxisTicks.map((tick, i) => {
                          const y = 24 + i * (156 / 4);
                          return (
                            <g key={i}>
                              <text
                                x="52"
                                y={y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                className="font-sans text-[11px] font-normal fill-zinc-400"
                              >
                                {tick}
                              </text>
                              <line
                                x1="65"
                                y1={y}
                                x2="690"
                                y2={y}
                                stroke="#F1F5F9"
                                strokeWidth="1.2"
                              />
                            </g>
                          );
                        })}

                        {/* Area Fill */}
                        <path
                          d={
                            `M 65 180 ` +
                            activeDemandTerm.chartPoints
                              .map((p, i) => {
                                const x =
                                  65 +
                                  i *
                                    (625 /
                                      (activeDemandTerm.chartPoints.length -
                                        1));
                                const y = 180 - (p / 100) * 156;
                                return `L ${x} ${y}`;
                              })
                              .join(" ") +
                            ` L 690 180 Z`
                          }
                          fill="url(#demandAreaGrad)"
                        />

                        {/* Trend Line */}
                        <path
                          d={activeDemandTerm.chartPoints
                            .map((p, i) => {
                              const x =
                                65 +
                                i *
                                  (625 /
                                    (activeDemandTerm.chartPoints.length - 1));
                              const y = 180 - (p / 100) * 156;
                              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Center X-Axis Year */}
                        <text
                          x="377"
                          y="222"
                          textAnchor="middle"
                          className="font-sans text-xs font-normal fill-zinc-400"
                        >
                          2026
                        </text>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-zinc-100 pt-4 flex items-center justify-between sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Google Search Engine Intelligence</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDemandModalOpen(false)}
                  className="rounded-full border border-zinc-200 bg-zinc-100 px-6 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 cursor-pointer"
                >
                  Close
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Timing Modal - The full timing case */}
      <Dialog open={timingModalOpen} onOpenChange={setTimingModalOpen}>
        <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-4xl max-h-[88vh] overflow-y-auto border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl sm:rounded-2xl sm:p-9">
          {timingThesis && (
            <div className="space-y-6">
              <DialogHeader className="space-y-2 border-b border-zinc-100 pb-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    TIMING SCORE THESIS
                  </span>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    <span>★ {timingThesis.score}/10 Timing</span>
                  </div>
                </div>
                <DialogTitle className="font-serif text-2xl font-normal tracking-tight text-zinc-900 sm:text-3xl lg:text-[34px]">
                  The full timing case.
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed analysis of why the market timing window is open now, platform shifts, macro tailwinds, and counter cases.
                </DialogDescription>
              </DialogHeader>

              {/* Lead Summary Highlight */}
              <div className="rounded-xl border border-blue-100/80 bg-blue-50/40 p-4 font-serif text-[15px] font-semibold leading-relaxed text-zinc-900 sm:text-[16px]">
                {timingThesis.leadSummary}
              </div>

              {/* Analytical Narrative Paragraphs */}
              <div className="space-y-4 font-serif text-[15px] leading-[1.75] text-[#2c2c2c] sm:text-[16px]">
                {timingThesis.narrativeParagraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* The Signals / Counter Cases */}
              <div className="space-y-3 pt-2">
                <h3 className="font-sans text-xs font-bold tracking-widest text-zinc-900 uppercase">
                  {timingThesis.signalsTitle}
                </h3>
                <div className="space-y-3">
                  {timingThesis.counterCases.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-4 font-sans text-xs leading-relaxed text-zinc-700 space-y-1"
                    >
                      <span className="font-bold text-zinc-900 block sm:inline mr-1">
                        {c.title}
                      </span>
                      <span>{c.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sourced References in Modal */}
              {timingThesis.sources && timingThesis.sources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <span className="font-sans text-[11px] font-bold tracking-widest text-zinc-400 uppercase block">
                    VERIFIED SOURCES & CITATIONS
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    {timingThesis.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-blue-600 hover:underline"
                      >
                        <span>{source.name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={() => setTimingModalOpen(false)}
                  className="rounded-full border border-zinc-200 bg-zinc-100 px-6 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 cursor-pointer"
                >
                  Close
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Year 1 ARR Modal - The money math */}
      <Dialog open={arrModalOpen} onOpenChange={setArrModalOpen}>
        <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-4xl max-h-[88vh] overflow-y-auto border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl sm:rounded-2xl sm:p-9">
          {moneyMath && (
            <div className="space-y-6">
              <DialogHeader className="space-y-2 border-b border-zinc-100 pb-4 text-left">
                <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                  UNIT ECONOMICS & MATH
                </span>
                <DialogTitle className="font-serif text-2xl font-normal tracking-tight text-zinc-900 sm:text-3xl lg:text-[34px]">
                  The money math.
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Step-by-step unit economics, year-one pilot napkin math, and TAM revenue ceiling calculation.
                </DialogDescription>
              </DialogHeader>

              {/* Section 1: Year One Napkin */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-zinc-900 sm:text-xl">
                  {moneyMath.yearOneTitle}
                </h3>
                <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200/90 bg-white overflow-hidden text-xs shadow-2xs">
                  {moneyMath.yearOneItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-3 sm:px-4 transition-colors",
                        idx % 2 === 1 ? "bg-zinc-50/50" : "bg-white",
                      )}
                    >
                      <span className="text-zinc-600 font-medium">
                        {item.label}
                      </span>
                      <span className="font-mono font-bold text-zinc-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 font-serif text-[14px] leading-relaxed text-zinc-700">
                  {moneyMath.yearOneSummary}
                </div>
              </div>

              {/* Section 2: The Ceiling */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif text-lg font-bold text-zinc-900 sm:text-xl">
                  {moneyMath.ceilingTitle}
                </h3>
                <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200/90 bg-white overflow-hidden text-xs shadow-2xs">
                  {moneyMath.ceilingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-3 sm:px-4 transition-colors",
                        idx % 2 === 1 ? "bg-zinc-50/50" : "bg-white",
                      )}
                    >
                      <span className="text-zinc-600 font-medium">
                        {item.label}
                      </span>
                      <span className="font-mono font-bold text-zinc-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 font-serif text-[14px] leading-relaxed text-zinc-700">
                  {moneyMath.ceilingSummary}
                </div>
              </div>

              {/* Section 3: Bottom Highlight Card */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] font-bold tracking-widest text-emerald-800 uppercase">
                    THE CEILING
                  </span>
                  <p className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 mt-0.5">
                    {moneyMath.ceilingBadge}
                  </p>
                </div>
                <div className="text-right text-xs text-emerald-800 max-w-[220px] hidden sm:block font-medium">
                  Blended core subscriptions, partner expansion, and integration rev-share.
                </div>
              </div>

              <DialogFooter className="border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={() => setArrModalOpen(false)}
                  className="rounded-full border border-zinc-200 bg-zinc-100 px-6 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 cursor-pointer"
                >
                  Close
                </button>
              </DialogFooter>
            </div>
          )}
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
                        <div className="flex min-w-0 items-center gap-1.5">
                          <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-400"></div>
                          <span className="truncate font-mono text-[9px] font-bold tracking-wider text-zinc-200 uppercase">
                            {ideaTitle.split(" ")[0]} Flow
                          </span>
                        </div>
                        <span className="py-0.2 shrink-0 rounded bg-white/10 px-1.5 font-mono text-[8px] text-zinc-300">
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
                          <p className="line-clamp-2 text-[10px] leading-tight font-bold text-white">
                            {currentPain.title}
                          </p>
                          <p className="text-[9px] font-semibold text-emerald-400">
                            {pricing} • {difficultyLabel}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <span className="flex-1 truncate rounded bg-white/10 px-1 py-1 text-center font-mono text-[8px] text-zinc-300">
                            {currentPain.sentiment || "Frustrated"}
                          </span>
                          <span className="flex-1 truncate rounded bg-blue-500/20 px-1 py-1 text-center font-mono text-[8px] text-blue-300">
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
                          <div className="truncate rounded border border-zinc-100 bg-zinc-50 p-1">
                            <span className="text-zinc-400">Target:</span>{" "}
                            <b className="text-zinc-700">
                              {customer.split(" ")[0]}
                            </b>
                          </div>
                          <div className="truncate rounded border border-zinc-100 bg-zinc-50 p-1">
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
                  <div
                    onClick={() => setDemandModalOpen(true)}
                    className="group cursor-pointer space-y-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-xs active:scale-99"
                  >
                    <div className="flex items-center justify-between">
                      <MetricTooltip
                        metric="marketMaturity"
                        title="Solution Demand"
                        explanation="Calculated demand score based on search velocity, user complaints, and alternative queries."
                      >
                        <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase group-hover:text-zinc-600 transition-colors">
                          SOLUTION DEMAND
                        </p>
                      </MetricTooltip>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDemandModalOpen(true);
                        }}
                        className="text-xs font-light text-zinc-300 transition-colors hover:text-blue-600 group-hover:text-zinc-500"
                        title="View solution demand breakdown"
                      >
                        +
                      </button>
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
                  <div
                    onClick={() => setPainModalOpen(true)}
                    className="group cursor-pointer space-y-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-xs active:scale-99"
                  >
                    <div className="flex items-center justify-between">
                      <MetricTooltip metric="painIntensity">
                        <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase group-hover:text-zinc-600 transition-colors">
                          PAIN
                        </p>
                      </MetricTooltip>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPainModalOpen(true);
                        }}
                        className="text-xs font-light text-zinc-300 transition-colors hover:text-blue-600 group-hover:text-zinc-500"
                        title="Why the pain scores high"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="font-sans text-xl font-bold tracking-tight text-zinc-900">
                        {painThesis?.severityScore || currentPain.intensity || 7}{" "}
                        <span className="text-xs font-normal text-zinc-500">
                          /10 severity
                        </span>
                      </p>
                      <p className="pt-1 text-[10px] leading-tight font-normal text-zinc-500">
                        {(() => {
                          const rawSub = currentPain.subreddits?.[0]?.replace(/^r\//i, "");
                          const subText = rawSub ? `r/${rawSub}` : "Community";
                          const extraSubs = (currentPain.subreddits?.length || 1) - 1;
                          if (extraSubs > 0) {
                            return `${subText} and ${extraSubs} more feel it`;
                          }
                          const mentionsCount = Math.max(1, currentPain.mentions || 1);
                          if (mentionsCount > 1) {
                            return `${subText} and ${mentionsCount} threads feel it`;
                          }
                          return `${subText} operators feel it`;
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Metric 3: TIMING */}
                  <div
                    onClick={() => setTimingModalOpen(true)}
                    className="group cursor-pointer space-y-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-xs active:scale-99"
                  >
                    <div className="flex items-center justify-between">
                      <MetricTooltip
                        metric="urgency"
                        title="Market Timing"
                        explanation="Why the window is open now: AI turn latencies, API cost drops, and incumbent bloat."
                      >
                        <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase group-hover:text-zinc-600 transition-colors">
                          TIMING
                        </p>
                      </MetricTooltip>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTimingModalOpen(true);
                        }}
                        className="text-xs font-light text-zinc-300 transition-colors hover:text-blue-600 group-hover:text-zinc-500"
                        title="Why the window is open"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="font-sans text-xl font-bold tracking-tight text-zinc-900">
                        {timingThesis?.score || 8}{" "}
                        <span className="text-xs font-normal text-zinc-500">
                          /10
                        </span>
                      </p>
                      <p className="pt-1 text-[10px] leading-tight font-medium text-blue-600 group-hover:underline">
                        why the window is open
                      </p>
                    </div>
                  </div>

                  {/* Metric 4: YEAR 1, DONE RIGHT */}
                  <div
                    onClick={() => setArrModalOpen(true)}
                    className="group cursor-pointer space-y-2 rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-xs active:scale-99"
                  >
                    <div className="flex items-center justify-between">
                      <MetricTooltip
                        metric="monetization"
                        title="Year 1 ARR Potential"
                        explanation="Estimated ARR range reachable in year 1 with focused execution and modern pricing."
                      >
                        <p className="font-sans text-[10px] font-bold tracking-widest text-zinc-400 uppercase group-hover:text-zinc-600 transition-colors">
                          YEAR 1, DONE RIGHT
                        </p>
                      </MetricTooltip>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setArrModalOpen(true);
                        }}
                        className="text-xs font-light text-zinc-300 transition-colors hover:text-blue-600 group-hover:text-zinc-500"
                        title="View Year 1 ARR breakdown"
                      >
                        +
                      </button>
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
                  <h2 className="font-serif text-2xl leading-snug font-normal text-[#1a1a1a] sm:text-3xl lg:text-[34px]">
                    {whyNow.headline}
                  </h2>
                  <div className="space-y-4 font-serif text-[15px] sm:text-[16px] leading-[1.72] text-[#2c2c2c]">
                    {whyNow.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  {/* SOURCES Row */}
                  {whyNow.sources && whyNow.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-xs">
                      <span className="font-sans text-[11px] font-bold tracking-[0.14em] text-zinc-400 uppercase">
                        SOURCES
                      </span>
                      {whyNow.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-sans text-xs text-zinc-600 underline underline-offset-3 decoration-zinc-300 transition-colors hover:text-zinc-900 hover:decoration-zinc-600"
                        >
                          <span>{source.name}</span>
                          <span className="text-[10px] text-zinc-400">↗</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* See the full timing case trigger */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setTimingModalOpen(true)}
                      className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      <span>See the full timing case</span>
                      <span className="text-base leading-none">→</span>
                    </button>
                  </div>
                </div>

                {/* 4. MARKET SNAPSHOT / The receipts. */}
                <div className="space-y-6 pt-4 border-t border-zinc-150">
                  <div className="space-y-1">
                    <p className="font-sans text-[11px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
                      MARKET SNAPSHOT
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1a1a1a]">
                      The receipts.
                    </h2>
                  </div>

                  {/* Top Row: 2-Column Grid (Demand Card & Search Volume Card) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Card 1: DEMAND */}
                    <div
                      onClick={() => setDemandModalOpen(true)}
                      className="group relative cursor-pointer rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-3">
                        <span className="font-sans text-[11px] font-bold tracking-widest text-[#6366F1] uppercase">
                          DEMAND
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
                          SEARCH
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-serif text-base text-zinc-900 font-medium">
                          &ldquo;{primaryDemandTerm?.term || "search query"}&rdquo;
                        </p>
                        <div className="flex items-baseline justify-between">
                          <div className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900">
                            {primaryDemandTerm?.volume?.replace(/\/mo$/i, "") || "201K"}
                            <span className="font-serif text-xl sm:text-2xl font-light text-zinc-400 ml-0.5">
                              /mo
                            </span>
                          </div>
                          {primaryDemandTerm && (
                            <span
                              className={cn(
                                "font-sans text-xs sm:text-sm font-bold",
                                primaryDemandTerm.growthIsPositive
                                  ? "text-[#10B981]"
                                  : "text-[#EF4444]"
                              )}
                            >
                              {primaryDemandTerm.growth} YoY
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Sparkline Area Chart */}
                      {primaryDemandTerm && (
                        <div className="pt-4">
                          <div className="relative h-28 w-full">
                            <svg
                              viewBox="0 0 400 120"
                              className="h-full w-full overflow-visible"
                              preserveAspectRatio="none"
                            >
                              <defs>
                                <linearGradient id="receiptDemandGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.14" />
                                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              <path
                                d={
                                  `M 0 95 ` +
                                  primaryDemandTerm.chartPoints
                                    .map((p, i) => {
                                      const x = i * (400 / (primaryDemandTerm.chartPoints.length - 1));
                                      const y = 95 - (p / 100) * 80;
                                      return `L ${x} ${y}`;
                                    })
                                    .join(" ") +
                                  ` L 400 95 Z`
                                }
                                fill="url(#receiptDemandGrad)"
                              />
                              <path
                                d={primaryDemandTerm.chartPoints
                                  .map((p, i) => {
                                    const x = i * (400 / (primaryDemandTerm.chartPoints.length - 1));
                                    const y = 95 - (p / 100) * 80;
                                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                                  })
                                  .join(" ")}
                                fill="none"
                                stroke="#3B82F6"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <p className="text-center font-sans text-[11px] text-zinc-400 pt-1">
                            2026
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card 2: SEARCH VOLUME */}
                    <div
                      onClick={() => setDemandModalOpen(true)}
                      className="group relative cursor-pointer rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-4">
                        <span className="font-sans text-[11px] font-bold tracking-widest text-[#6366F1] uppercase">
                          SEARCH VOLUME
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
                          US · PER MO
                        </span>
                      </div>

                      <div className="space-y-4">
                        {secondaryDemandTerms.map((term, idx) => {
                          const maxVolumeRaw = Math.max(...secondaryDemandTerms.map((t) => t.volumeRaw || 10000));
                          const percentageWidth = Math.max(12, Math.min(100, Math.round(((term.volumeRaw || 1000) / maxVolumeRaw) * 100)));

                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-serif text-sm font-semibold text-zinc-900">
                                  &ldquo;{term.term}&rdquo;
                                </span>
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                                    term.growthIsPositive
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                      : "bg-red-50 text-red-700 border border-red-200/60"
                                  )}
                                >
                                  <span>{term.growthIsPositive ? "▲" : "▼"}</span>
                                  <span>{term.growth.replace(/^[+-]/, "")}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="h-2 flex-1 rounded-full bg-zinc-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#2563EB] transition-all"
                                    style={{ width: `${percentageWidth}%` }}
                                  />
                                </div>
                                <span className="font-sans text-xs font-bold text-zinc-900 whitespace-nowrap">
                                  {term.volume.replace(/\/mo$/i, "")}
                                  <span className="font-normal text-zinc-400">/mo</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Full-width PAIN Card */}
                  {painThesis && (
                    <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <span className="font-sans text-[11px] font-bold tracking-widest text-[#EA580C] uppercase">
                          PAIN
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                          {painThesis.severityScore}/10 SEVERITY
                        </span>
                      </div>

                      <div className="space-y-3">
                        {painThesis.quotes.slice(0, 3).map((q, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-amber-100/70 bg-[#FFFDF9] p-4.5 space-y-2 border-l-[3px] border-l-amber-400"
                          >
                            <p className="font-serif text-[15px] sm:text-[16px] leading-[1.68] text-zinc-900">
                              &ldquo;{q.quote.replace(/^["“”]|["“”]$/g, "")}&rdquo;
                            </p>
                            <p className="font-sans text-[12px] font-medium text-zinc-400">
                              {q.source}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setPainModalOpen(true)}
                          className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          <span>
                            All {Math.max(9, (currentPain.communityVoices?.length || 0) + 6)} receipts, and where these people gather
                          </span>
                          <span className="text-base leading-none">→</span>
                        </button>
                        {currentPain.postUrl && (
                          <a
                            href={currentPain.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-600"
                          >
                            <span>Original Thread</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. WHITESPACE & THE WEDGE */}
                {opportunitySignals && (
                  <div className="space-y-6 pt-2">
                    {/* Top Row: 2-Column Grid (Whitespace & The Wedge) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Card 1: WHITESPACE */}
                      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-[11px] font-bold tracking-widest text-[#6366F1] uppercase">
                              WHITESPACE
                            </span>
                            <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
                              MARKET GAP
                            </span>
                          </div>
                          <h3 className="font-serif text-2xl sm:text-[25px] font-normal text-[#1a1a1a] leading-snug">
                            {opportunitySignals.whitespaceHeadline}
                          </h3>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setPainModalOpen(true)}
                            className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            <span>Understand the opening</span>
                            <span className="text-sm leading-none">→</span>
                          </button>
                        </div>
                      </div>

                      {/* Card 2: THE WEDGE */}
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                        {/* Decorative watermark */}
                        <div className="pointer-events-none absolute -bottom-3 -right-3 text-indigo-50/50 select-none">
                          <Zap className="h-28 w-28" />
                        </div>

                        <div className="space-y-3 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-[11px] font-bold tracking-widest text-[#6366F1] uppercase">
                              THE WEDGE
                            </span>
                          </div>
                          <p className="font-serif text-[15px] sm:text-[16px] text-zinc-900 leading-[1.68]">
                            {opportunitySignals.wedgeDescription}
                          </p>
                        </div>

                        <div className="pt-2 relative z-10">
                          <p className="font-sans text-xs text-zinc-500">
                            The incumbent to beat:{" "}
                            <span className="font-bold text-zinc-900">
                              {opportunitySignals.incumbentToBeat}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: PROOF & SIGNALS (Full Width) */}
                    <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <span className="font-sans text-[11px] font-bold tracking-widest text-[#2563EB] uppercase">
                          PROOF & SIGNALS
                        </span>
                      </div>

                      <div className="space-y-4">
                        {opportunitySignals.proofSignals.map((signal, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-start gap-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-2"></span>
                              <p className="font-serif text-[14.5px] sm:text-[15.5px] text-zinc-800 leading-relaxed">
                                {signal.text}
                              </p>
                            </div>
                            <div className="pl-4">
                              <a
                                href={signal.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-widest text-zinc-400 hover:text-zinc-700 uppercase underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-600 transition-colors"
                              >
                                <span>{signal.sourceName}</span>
                                <span className="text-[9px]">↗</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setTimingModalOpen(true)}
                          className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          <span>Explore the evidence</span>
                          <span className="text-base leading-none">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
                        Automated workflow resolving &quot;{currentPain.title}
                        &quot;
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">•</span>
                      <span>
                        Direct displacement alternative to {competition} at{" "}
                        {pricing}
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
