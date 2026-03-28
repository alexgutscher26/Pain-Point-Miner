/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  Users,
  BarChart3,
  Filter,
  Star,
  AlertTriangle,
  Lightbulb,
  Loader2,
  DollarSign,
  ArrowRightLeft,
  Wrench,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PainPointFeedback } from "@/components/dashboard/pain-point-feedback";

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
  } | null;
  switchingCosts?: string;
  triedSolutions?: string[];
}

interface ReportData {
  reportId: string;
  title: string;
  date: string;
  saved: boolean;
  category: string;
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

const PAIN_POINTS_PER_PAGE = 5;
type CardTab = "signals" | "community" | "build";
type IntensityFilter = "all" | "high" | "medium";
type SentimentFilter = "all" | "frustrated" | "neutral";

function deriveBuildIdea(pain: PainPoint) {
  const base = pain.title.replace(/\s+leads?\s+to\s+/i, " ");
  return `${base} Assistant`;
}

function deriveTargetUser(pain: PainPoint) {
  if (pain.subreddits.length > 0) {
    return `Teams active in r/${pain.subreddits[0]}`;
  }
  return "Ops and product teams actively handling this pain";
}

function deriveMvpFeatures(pain: PainPoint) {
  const features: string[] = [];
  features.push(`Signal dashboard for "${pain.title}"`);
  features.push("Automated playbooks with step-by-step interventions");
  if (pain.triedSolutions && pain.triedSolutions.length > 0) {
    features.push(
      `Alternative to "${pain.triedSolutions[0]}" with measurable outcomes`,
    );
  } else {
    features.push("Experiment tracker to compare interventions by impact");
  }
  return features.slice(0, 3);
}

function renderMultiline(text: string) {
  return text.replace(/\\n/g, "\n");
}

function formatPainDescription(description: string) {
  const normalized = renderMultiline(description).replace(/\r\n/g, "\n").trim();
  const cleaned = normalized.replace(/\*([^*\n]+)\*/g, "$1");

  const explicitParagraphs = cleaned
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (explicitParagraphs.length > 1) {
    return explicitParagraphs;
  }

  const sentenceList = cleaned
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  if (sentenceList.length <= 2) {
    return [cleaned];
  }

  const paragraphs: string[] = [];
  for (let i = 0; i < sentenceList.length; i += 2) {
    paragraphs.push(sentenceList.slice(i, i + 2).join(" "));
  }
  return paragraphs;
}

function normalizeEvidenceText(value?: string | null) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

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

function formatBudgetValue(
  budgetSignals?: PainPoint["budgetSignals"],
  budgetSignalSummary?: string | null,
  monetization?: number,
  urgency?: string,
) {
  const value = normalizeEvidenceText(budgetSignalSummary);
  if (value) return value;

  const quote = normalizeEvidenceText(budgetSignals?.[0]?.quote);
  if (quote) return quote;

  if ((monetization ?? 0) >= 8) {
    return "High willingness";
  }

  if ((monetization ?? 0) >= 6) {
    return "Paid team need";
  }

  if ((monetization ?? 0) >= 4) {
    return urgency === "Extreme Urgency"
      ? "Budget pressure"
      : "Some willingness";
  }

  return "Weak signal";
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "No TAM yet";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSwitchingValue(
  switchingCosts?: string | null,
  maturity?: number,
  triedSolutions?: string[],
) {
  const value = normalizeEvidenceText(switchingCosts);
  if (value) return value;

  const triedCount = (triedSolutions ?? []).filter(Boolean).length;

  if ((maturity ?? 0) >= 8) {
    return triedCount > 0 ? "Crowded market" : "Entrenched tools";
  }

  if ((maturity ?? 0) >= 5) {
    return triedCount > 1 ? "Actively comparing" : "Existing tools";
  }

  if (triedCount > 0) {
    return "Low lock-in";
  }

  return "Early market";
}

function formatTriedValue(triedSolutions?: string[]) {
  const tried = (triedSolutions ?? [])
    .map((solution) => solution.trim())
    .filter(Boolean);

  if (tried.length === 0) {
    return "None named";
  }

  if (tried.length === 1) {
    return tried[0];
  }

  const preview = tried.slice(0, 2).join(", ");
  return tried.length > 2 ? `${preview} +${tried.length - 2}` : preview;
}

function formatPaySignalValue(monetization?: number) {
  if (!monetization || monetization <= 0) {
    return "No signal";
  }

  return `${monetization}/10`;
}

function formatStageValue(maturity?: number) {
  if (!maturity || maturity <= 0) {
    return "Unclear";
  }

  if (maturity < 4) {
    return "Blue Ocean";
  }

  if (maturity > 7) {
    return "Disruption";
  }

  return "Scaling";
}

function normalizeKeyword(input: string) {
  const normalized = input.trim().replace(/\s+/g, " ");
  if (normalized.length >= 2 && normalized.length <= 120) {
    return normalized;
  }
  if (normalized.length > 120) {
    return normalized.slice(0, 120).trim();
  }
  return "";
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
  const [painPointsPage, setPainPointsPage] = useState(1);
  const [activeTabsByPain, setActiveTabsByPain] = useState<
    Record<string, CardTab>
  >({});
  const [intensityFilterDraft, setIntensityFilterDraft] =
    useState<IntensityFilter>("all");
  const [sentimentFilterDraft, setSentimentFilterDraft] =
    useState<SentimentFilter>("all");
  const [intensityFilterApplied, setIntensityFilterApplied] =
    useState<IntensityFilter>("all");
  const [sentimentFilterApplied, setSentimentFilterApplied] =
    useState<SentimentFilter>("all");
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planDialogMessage, setPlanDialogMessage] = useState(
    "Your free trial has ended. Purchase a plan to continue.",
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
        setPainPointsPage(1);
        setIntensityFilterDraft("all");
        setSentimentFilterDraft("all");
        setIntensityFilterApplied("all");
        setSentimentFilterApplied("all");
      } catch (error) {
        console.error("Error fetching report details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchReportDetail();
  }, [id]);

  async function handleSaveToggle(
    nextSaved: boolean,
    categoryOverride?: string,
    showToast = true,
  ) {
    if (!id || !reportData) return;
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
        const errorPayload = (await response.json().catch(() => null)) as {
          code?: string;
          message?: string;
        } | null;
        const code = errorPayload?.code;
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
        throw new Error(errorPayload?.message ?? "Failed to update report");
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
      if (showToast) {
        toast.success(
          nextSaved
            ? "Report saved and organized."
            : "Report removed from saved.",
        );
      }
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Unable to update report.", {
        action: {
          label: "Retry",
          onClick: () =>
            void handleSaveToggle(nextSaved, categoryOverride, showToast),
        },
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    if (reportData?.saved) {
      void handleSaveToggle(true, category, false);
    }
  }

  function handleExportData() {
    if (!reportData) return;
    try {
      const safeTitle = reportData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const filename = `${safeTitle || "report"}-${reportData.reportId}.json`;
      const payload = JSON.stringify(reportData, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Report exported.");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Unable to export report.");
    }
  }

  async function handleRunAgain() {
    if (!reportData || isRerunning) return;
    setIsRerunning(true);

    try {
      const keyword =
        normalizeKeyword(reportData.title) ||
        normalizeKeyword(reportData.topPainPoints[0]?.title ?? "") ||
        "saas";

      const subredditSet = new Set<string>();
      reportData.topPainPoints.forEach((pain) => {
        pain.subreddits.forEach((sub) => {
          const cleaned = sub
            .replace(/^r\//i, "")
            .trim()
            .toLowerCase()
            .replace(/[^\w]/g, "");
          if (/^[a-z0-9_]{2,21}$/.test(cleaned)) subredditSet.add(cleaned);
        });
      });

      const sanitizedPatterns = (reportData.customPatterns ?? [])
        .map((pattern) => pattern.trim())
        .filter((pattern) => pattern.length > 0 && pattern.length <= 120)
        .slice(0, 20);

      const requestBody = {
        keyword,
        subreddits: Array.from(subredditSet)
          .slice(0, 15)
          .map((sub) => `r/${sub}`)
          .join(", "),
        customPatterns: sanitizedPatterns,
        miningDepth: "deep" as const,
        timeWindow: reportData.timeWindow ?? "90d",
      };

      let response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Retry with a minimal payload in case saved report metadata is invalid.
        response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword,
            subreddits: "",
            customPatterns: [],
            miningDepth: "deep",
            timeWindow: reportData.timeWindow ?? "90d",
          }),
        });
      }

      if (!response.ok) {
        const statusPrefix = `Run again failed (${response.status})`;
        let errorMessage = statusPrefix;
        try {
          const raw = await response.text();
          if (raw) {
            try {
              const errorPayload = JSON.parse(raw);
              if (
                errorPayload?.code === "PLAN_REQUIRED" ||
                errorPayload?.code === "PLAN_LIMIT_REACHED" ||
                errorPayload?.code === "PLAN_UPGRADE_REQUIRED"
              ) {
                setPlanDialogMessage(
                  typeof errorPayload?.message === "string"
                    ? errorPayload.message
                    : "Your free trial has ended. Purchase a plan to continue.",
                );
                setPlanDialogOpen(true);
                return;
              }
              if (
                typeof errorPayload?.message === "string" &&
                errorPayload.message.length > 0
              ) {
                errorMessage = `${statusPrefix}: ${errorPayload.message}`;
              } else {
                errorMessage = `${statusPrefix}: ${raw.slice(0, 180)}`;
              }
            } catch {
              errorMessage = `${statusPrefix}: ${raw.slice(0, 180)}`;
            }
          }
        } catch {
          // Ignore parsing failures and keep generic message.
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data?.duplicate) {
        toast.info(
          "Investigation already running. Redirecting to existing analysis...",
        );
      } else {
        toast.success("Investigation started.");
      }
      router.push(`/dashboard/analysis?id=${data.scraperId}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to run investigation again.";
      toast.error(message, {
        action: {
          label: "Retry",
          onClick: () => void handleRunAgain(),
        },
      });
    } finally {
      setIsRerunning(false);
    }
  }

  function getActiveTab(painId: string): CardTab {
    return activeTabsByPain[painId] ?? "signals";
  }

  function setActiveTab(painId: string, tab: CardTab) {
    setActiveTabsByPain((prev) => ({ ...prev, [painId]: tab }));
  }

  function handleApplyFilters() {
    setIntensityFilterApplied(intensityFilterDraft);
    setSentimentFilterApplied(sentimentFilterDraft);
    setPainPointsPage(1);
  }

  useEffect(() => {
    if (!reportData) return;
    const totalFiltered = reportData.topPainPoints.filter((pain) => {
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
    }).length;
    const totalPages = Math.max(
      1,
      Math.ceil(totalFiltered / PAIN_POINTS_PER_PAGE),
    );
    if (painPointsPage > totalPages) {
      setPainPointsPage(totalPages);
    }
  }, [
    intensityFilterApplied,
    painPointsPage,
    reportData,
    sentimentFilterApplied,
  ]);

  const iconMap: Record<string, React.ReactNode> = {
    AlertTriangle: <AlertTriangle className="h-4 w-4" />,
    MessageSquare: <MessageSquare className="h-4 w-4" />,
    Star: <Star className="h-4 w-4" />,
    Users: <Users className="h-4 w-4" />,
    BarChart3: <BarChart3 className="h-4 w-4" />,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#ff4500]" />
        <p className="font-mono text-[11px] font-black tracking-widest text-zinc-500 uppercase">
          Decrypting Insights...
        </p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="mb-4 text-2xl font-black text-white uppercase">
          Report Not Found
        </h2>
        <p className="mb-8 max-w-md text-zinc-500">
          We couldn't find the investigation archives you're looking for. It
          might have been deleted or moved.
        </p>
        <Link
          href="/dashboard/reports"
          className="rounded-xl bg-[#ff4500] px-6 py-3 text-[11px] font-black tracking-widest text-white uppercase shadow-lg transition-all active:scale-95"
        >
          Back to Archives
        </Link>
      </div>
    );
  }

  const filteredPainPoints = reportData.topPainPoints.filter((pain) => {
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

  const totalPainPoints = filteredPainPoints.length;
  const totalPainPointPages = Math.max(
    1,
    Math.ceil(totalPainPoints / PAIN_POINTS_PER_PAGE),
  );
  const startPainPointIndex = (painPointsPage - 1) * PAIN_POINTS_PER_PAGE;
  const endPainPointIndex = Math.min(
    startPainPointIndex + PAIN_POINTS_PER_PAGE,
    totalPainPoints,
  );
  const visiblePainPoints = filteredPainPoints.slice(
    startPainPointIndex,
    endPainPointIndex,
  );

  return (
    <div className="animate-in fade-in mx-auto w-full max-w-7xl space-y-8 p-8 duration-700">
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="border border-white/10 bg-[#111] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Plan Required
            </DialogTitle>
            <DialogDescription className="text-zinc-300">
              {planDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setPlanDialogOpen(false)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold"
            >
              Close
            </button>
            <Link
              href="/dashboard/billing"
              className="rounded-lg bg-[#ff4500] px-4 py-2 text-sm font-bold text-white"
            >
              Purchase Plan
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-black tracking-widest text-zinc-500 uppercase">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/dashboard/reports"
              className="transition-colors hover:text-white"
            >
              Reports
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-200">{reportData.title}</span>
          </div>
          <h2 className="text-4xl leading-none font-black tracking-tighter text-white uppercase">
            Analysis: <span className="text-[#ff4500]">{reportData.title}</span>
          </h2>
          <div className="flex items-center gap-2 pt-2 font-mono text-[12px] font-bold tracking-widest text-zinc-500 uppercase">
            <ShieldCheck className="h-3.5 w-3.5 text-[#ff4500]" />
            Scanned on {reportData.date}
          </div>
          <div className="flex items-center gap-2 font-mono text-[12px] font-bold tracking-widest text-zinc-500 uppercase">
            <Filter className="h-3.5 w-3.5 text-amber-400" />
            Window: {reportData.timeWindowLabel ?? "Last 90d"}
          </div>
          {reportData.customPatterns &&
            reportData.customPatterns.length > 0 && (
              <div className="flex items-start gap-2 pt-1 font-mono text-[12px] font-bold tracking-widest text-zinc-500 uppercase">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <div className="flex flex-wrap gap-1.5">
                  <span>Patterns:</span>
                  {reportData.customPatterns.map((p, i) => (
                    <span key={p} className="font-black text-emerald-300">
                      "{p}"
                      {i < (reportData.customPatterns?.length ?? 0) - 1
                        ? ","
                        : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          {reportData.trend && (
            <div className="pt-3">
              <span
                className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[10px] font-black tracking-widest uppercase ${
                  reportData.trend.direction === "up" ||
                  reportData.trend.direction === "new"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : reportData.trend.direction === "down"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300"
                }`}
              >
                Trend: {reportData.trend.label}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="border border-white/20 bg-zinc-900 px-4 py-2.5 font-mono text-[11px] font-black tracking-widest text-white uppercase transition-colors hover:bg-white/5 [&>option]:bg-white [&>option]:text-black"
          >
            {categoryOptions.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleSaveToggle(!reportData.saved)}
            disabled={isSaving}
            className="flex items-center gap-2 border border-white/20 bg-zinc-900 px-5 py-2.5 font-mono text-[11px] font-black tracking-widest text-white uppercase transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? "Saving..."
              : reportData.saved
                ? "Saved"
                : "Save Report"}
          </button>
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 border border-white/20 bg-zinc-900 px-5 py-2.5 font-mono text-[11px] font-black tracking-widest text-white uppercase transition-colors hover:bg-white/5"
          >
            Export Data
          </button>
          <button
            type="button"
            onClick={handleRunAgain}
            disabled={isRerunning}
            className="group flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-[#ff4500] px-6 py-3 text-[11px] font-black tracking-wider text-white uppercase shadow-lg shadow-[#ff4500]/20 transition-all hover:bg-[#ff571a] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRerunning ? "Running..." : "Run Again"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reportData.metrics.map((metric) => (
          <div
            key={metric.label}
            className="group relative overflow-hidden border-2 border-white/15 bg-[#0c0c0c] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.6)]"
          >
            <div className="absolute top-0 right-0 -mt-12 -mr-12 h-24 w-24 rounded-full bg-white/2 blur-2xl transition-all group-hover:bg-[#ff4500]/5"></div>
            <div className="relative z-10 mb-4 flex items-start justify-between">
              <div className={`rounded-lg p-2 ${metric.bg} ${metric.color}`}>
                {iconMap[metric.icon] || <Star className="h-4 w-4" />}
              </div>
            </div>
            <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              {metric.label}
            </p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black tracking-tight text-white">
                {metric.value}
              </h4>
              <p
                className={`text-[11px] font-bold ${metric.color === "text-[#ff4500]" ? "text-zinc-600" : "text-zinc-700"}`}
              >
                {metric.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Pain Points */}
        <div className="space-y-8 lg:col-span-8">
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-xl font-black tracking-tight text-white uppercase">
              <TrendingUp className="h-5 w-5 text-[#ff4500]" />
              Top Frustrations Identified
            </h3>
          </div>

          {reportData.customPatterns &&
            reportData.customPatterns.length > 0 && (
              <div className="mb-6 border border-amber-400/35 bg-amber-500/5 p-6">
                <p className="mb-3 flex items-center gap-2 text-[10px] font-black tracking-widest text-amber-500 uppercase">
                  <Sparkles className="h-3.5 w-3.5" /> AI Intelligence Patterns
                </p>
                <div className="flex flex-wrap gap-2">
                  {reportData.customPatterns.map((pattern) => (
                    <span
                      key={pattern}
                      className="rounded-lg border border-white/5 bg-zinc-900 px-3 py-1.5 text-[11px] font-bold text-zinc-400"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}

          <div className="space-y-6">
            {visiblePainPoints.map((pain) => (
              <div
                key={pain.id}
                className="group relative space-y-8 overflow-hidden border-2 border-white/15 bg-[#0c0c0c] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] transition-colors hover:border-[#ff4500]/40"
              >
                <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-[#ff4500]/2 blur-[80px]"></div>

                {/* Pain Header */}
                <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-2xl font-black tracking-tight text-white transition-colors group-hover:text-[#ff4500]">
                        {pain.title}
                      </h4>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-black tracking-widest uppercase ${
                          pain.urgency === "High Urgency"
                            ? "border-rose-500/20 bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {pain.urgency}
                      </span>
                      {pain.hasWillingnessToPay && (
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                          💰 Willingness to Pay
                        </span>
                      )}
                    </div>
                    <div className="max-w-2xl space-y-3 rounded-xl border border-white/5 bg-[#111]/30 p-4">
                      {formatPainDescription(pain.description).map(
                        (paragraph) => (
                          <p
                            key={paragraph.slice(0, 100)}
                            className="leading-relaxed font-medium text-zinc-400"
                          >
                            {paragraph}
                          </p>
                        ),
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-black tracking-widest uppercase">
                      <div className="flex items-center gap-1.5 text-[#ff4500]">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {pain.mentions} mentions
                      </div>
                      {typeof pain.validationScore === "number" && (
                        <div className="flex items-center gap-1.5 text-sky-400">
                          <BarChart3 className="h-3.5 w-3.5" />
                          Validation {pain.validationScore}/100
                        </div>
                      )}
                      {pain.subreddits.map((sub) => (
                        <div
                          key={sub}
                          className="flex items-center gap-1.5 text-zinc-500"
                        >
                          <Users className="h-3.5 w-3.5" />
                          r/{sub}
                        </div>
                      ))}
                      <div
                        className={`flex items-center gap-1.5 ${pain.sentiment === "frustrated" ? "text-rose-500" : "text-zinc-500"}`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${pain.sentiment === "frustrated" ? "animate-pulse bg-rose-500" : "bg-zinc-700"}`}
                        ></div>
                        Vibe: {pain.sentiment}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 border border-white/20 bg-white/2 px-6 py-4 text-center md:text-right">
                    <p className="text-4xl font-black text-white">
                      {pain.intensity}/10
                    </p>
                    <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
                      Pain Score
                    </p>
                  </div>
                  <div className="mt-4 flex justify-center md:justify-end">
                    <PainPointFeedback painPointId={pain.id} />
                  </div>
                </div>

                {/* Tabs */}
                <div className="relative z-10 flex flex-wrap items-center gap-2">
                  {[
                    { key: "signals", label: "Signals" },
                    { key: "community", label: "Community Pulse" },
                    { key: "build", label: "What to Build" },
                  ].map((tab) => {
                    const isActive = getActiveTab(pain.id) === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() =>
                          setActiveTab(pain.id, tab.key as CardTab)
                        }
                        className={`rounded-lg border px-3 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                          isActive
                            ? "border-[#ff4500]/40 bg-[#ff4500]/20 text-[#ff4500]"
                            : "border-white/10 bg-zinc-900 text-zinc-400 hover:bg-white/5"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {getActiveTab(pain.id) === "signals" && (
                  <div className="relative z-10 space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                      <InfoSquare
                        icon={<DollarSign className="h-3.5 w-3.5" />}
                        label="Budget"
                        value={formatBudgetValue(
                          pain.budgetSignals,
                          pain.budgetSignalSummary,
                          pain.monetization,
                          pain.urgency,
                        )}
                        color="text-emerald-500"
                        preserveCase
                      />
                      <InfoSquare
                        icon={<ArrowRightLeft className="h-3.5 w-3.5" />}
                        label="Switching"
                        value={formatSwitchingValue(
                          pain.switchingCosts,
                          pain.maturity,
                          pain.triedSolutions,
                        )}
                        color="text-amber-500"
                      />
                      <InfoSquare
                        icon={<Wrench className="h-3.5 w-3.5" />}
                        label="Tried"
                        value={formatTriedValue(pain.triedSolutions)}
                        color="text-blue-500"
                      />
                      <InfoSquare
                        icon={<TrendingUp className="h-3.5 w-3.5" />}
                        label="Pay Signal"
                        value={
                          pain.hasWillingnessToPay
                            ? `${pain.budgetSignals?.length ?? 0} quote${(pain.budgetSignals?.length ?? 0) === 1 ? "" : "s"}`
                            : formatPaySignalValue(pain.monetization)
                        }
                        color="text-violet-500"
                      />
                      <InfoSquare
                        icon={<DollarSign className="h-3.5 w-3.5" />}
                        label="Estimated TAM"
                        value={formatCurrency(
                          pain.cluster?.estimatedTamUsdAnnual,
                        )}
                        color="text-fuchsia-500"
                        preserveCase
                      />
                      <InfoSquare
                        icon={<BarChart3 className="h-3.5 w-3.5" />}
                        label="Stage"
                        value={formatStageValue(pain.maturity)}
                        color="text-rose-500"
                      />
                    </div>
                    {pain.hasWillingnessToPay &&
                    (pain.budgetSignals?.length ?? 0) > 0 ? (
                      <div className="space-y-3 border border-emerald-400/20 bg-emerald-500/5 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[10px] font-black tracking-widest text-emerald-300 uppercase">
                            WTP Quotes
                          </p>
                          {pain.cluster?.budgetSignalCount ? (
                            <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                              {pain.cluster.budgetSignalCount} cluster quote
                              {pain.cluster.budgetSignalCount === 1 ? "" : "s"}
                            </p>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          {pain.budgetSignals?.map((signal) => (
                            <div
                              key={signal.quote.slice(0, 100)}
                              className="space-y-1 border border-white/10 bg-black/20 p-3"
                            >
                              <p className="text-sm leading-relaxed font-medium text-zinc-200">
                                "{signal.quote}"
                              </p>
                              <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                                {signal.source} signal
                                {signal.annualizedMidpointUsd !== null
                                  ? ` • ${formatCurrency(signal.annualizedMidpointUsd)} annualized`
                                  : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {getActiveTab(pain.id) === "community" && (
                  <div className="relative z-10 space-y-4">
                    <p className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">
                      Community Pulse
                    </p>
                    {pain.userLanguage && (
                      <div className="space-y-3 border border-white/20 bg-zinc-900/40 p-5">
                        <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                          Language Overview
                        </p>
                        <div className="space-y-2">
                          {formatPainDescription(
                            pain.userLanguage.overview,
                          ).map((paragraph) => (
                            <p
                              key={paragraph.slice(0, 100)}
                              className="text-sm leading-relaxed font-medium text-zinc-300"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {pain.communityVoices.map((voice) => (
                      <div
                        key={voice.slice(0, 100)}
                        className="border border-l-4 border-white/20 border-l-[#ff4500] bg-white/2 p-6"
                      >
                        <div className="space-y-2">
                          {formatPainDescription(voice).map((paragraph) => (
                            <p
                              key={paragraph.slice(0, 100)}
                              className="text-[14px] leading-relaxed font-medium text-zinc-300 italic"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                    {pain.userLanguage?.sections?.map((section) => (
                      <div
                        key={`${pain.id}-lang-${section.label}`}
                        className="space-y-3 border border-white/20 bg-white/2 p-6"
                      >
                        <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                          {section.label}
                        </p>
                        <div className="space-y-2">
                          {formatPainDescription(section.summary).map(
                            (paragraph) => (
                              <p
                                key={paragraph.slice(0, 100)}
                                className="text-xs leading-relaxed font-medium text-zinc-500"
                              >
                                {paragraph}
                              </p>
                            ),
                          )}
                        </div>
                        <div className="space-y-2">
                          {section.examples.map((example) => (
                            <div key={example.slice(0, 100)} className="space-y-1">
                              {formatPainDescription(example).map(
                                (paragraph, paragraphIdx) => (
                                  <p
                                    key={paragraph.slice(0, 100)}
                                    className="text-sm leading-relaxed font-medium text-zinc-300"
                                  >
                                    {paragraphIdx === 0
                                      ? `- ${paragraph}`
                                      : paragraph}
                                  </p>
                                ),
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {getActiveTab(pain.id) === "build" && (
                  <div className="relative z-10 space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4 rounded-3xl border border-blue-500/10 bg-blue-500/5 p-6 shadow-inner">
                        <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-blue-400 uppercase">
                          <BarChart3 className="h-4 w-4" /> Marketing Language
                        </p>
                        <div className="space-y-2">
                          {pain.triedSolutions &&
                          pain.triedSolutions.length > 0 ? (
                            pain.triedSolutions.map((sol) => (
                              <div
                                key={sol}
                                className="flex items-center gap-3 font-medium text-zinc-400"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30"></div>
                                User tried &quot;{sol}&quot;
                              </div>
                            ))
                          ) : (
                            <p className="text-xs font-medium text-zinc-600 italic">
                              No tools mentioned specifically.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4 rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-6 shadow-inner">
                        <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                          <Lightbulb className="h-4 w-4" /> Suggested Angles
                        </p>
                        <div className="space-y-2">
                          {pain.angles.map((angle) => (
                            <div
                              key={angle}
                              className="flex items-center gap-3 font-medium text-zinc-400"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/30"></div>
                              {angle}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 rounded-3xl border border-[#ff4500]/15 bg-[#ff4500]/5 p-6">
                      <p className="text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
                        What to Build
                      </p>
                      <h5 className="text-lg font-black tracking-tight text-white">
                        {deriveBuildIdea(pain)}
                      </h5>
                      <p className="text-[12px] font-medium text-zinc-300">
                        Build for:{" "}
                        <span className="text-white">
                          {deriveTargetUser(pain)}
                        </span>
                      </p>
                      <div className="space-y-2">
                        {deriveMvpFeatures(pain).map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-3 text-[13px] font-medium text-zinc-300"
                          >
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ff4500]"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPainPoints === 0 && (
            <div className="border border-white/20 bg-zinc-900/40 p-6 text-center">
              <p className="font-mono text-[11px] font-black tracking-widest text-zinc-500 uppercase">
                No frustrations match the selected filters
              </p>
            </div>
          )}

          {totalPainPoints > PAIN_POINTS_PER_PAGE && (
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                Showing {startPainPointIndex + 1}-{endPainPointIndex} of{" "}
                {totalPainPoints}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPainPointsPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={painPointsPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-[10px] font-black tracking-widest text-white uppercase transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="px-2 text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                  Page {painPointsPage} / {totalPainPointPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPainPointsPage((prev) =>
                      Math.min(totalPainPointPages, prev + 1),
                    )
                  }
                  disabled={painPointsPage === totalPainPointPages}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-[10px] font-black tracking-widest text-white uppercase transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Intel */}
        <div className="space-y-8 lg:col-span-4">
          {/* Refine Section */}
          <div className="space-y-8 border-2 border-white/15 bg-[#0c0c0c] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
            <div>
              <h4 className="mb-6 flex items-center gap-2 text-sm font-black tracking-widest text-white uppercase">
                <Filter className="h-4 w-4 text-[#ff4500]" />
                Investigation Tools
              </h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">
                    Filter by Intensity
                  </label>
                  <select
                    value={intensityFilterDraft}
                    onChange={(event) =>
                      setIntensityFilterDraft(
                        event.target.value as IntensityFilter,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm font-bold text-white transition-colors focus:border-[#ff4500]/50 focus:outline-none [&>option]:bg-white [&>option]:text-black"
                  >
                    <option value="all">All Intensity Levels</option>
                    <option value="high">High Core Pain (8+)</option>
                    <option value="medium">Medium Friction (5+)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">
                    Sentiment Filter
                  </label>
                  <select
                    value={sentimentFilterDraft}
                    onChange={(event) =>
                      setSentimentFilterDraft(
                        event.target.value as SentimentFilter,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm font-bold text-white transition-colors focus:border-[#ff4500]/50 focus:outline-none [&>option]:bg-white [&>option]:text-black"
                  >
                    <option value="all">All Sentiment Types</option>
                    <option value="frustrated">Frustrated / Desperate</option>
                    <option value="neutral">Neutral Explorations</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="w-full border border-[#ff8a57] bg-[#ff4500] py-4 font-mono text-[11px] font-black tracking-widest text-white uppercase transition-colors hover:bg-[#ff571a] active:scale-[0.98]"
                >
                  Apply Filter Logic
                </button>
              </div>
            </div>

            {/* Validation Signals */}
            <div className="border-t border-white/5 pt-8">
              <h4 className="mb-6 flex items-center gap-2 font-mono text-[11px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                <BarChart3 className="h-4 w-4" /> Market Signals
              </h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="mb-2 flex justify-between font-mono text-[11px] font-black">
                    <span className="text-zinc-400 uppercase">
                      Analysis Confidence
                    </span>
                    <span className="tracking-widest text-white">94%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[94%] bg-[#ff4500]"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="mb-2 flex justify-between font-mono text-[11px] font-black">
                    <span className="text-zinc-400 uppercase">
                      AI Data Fidelity
                    </span>
                    <span className="tracking-widest text-white">High</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[88%] bg-emerald-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {reportData.saasOpportunities &&
            reportData.saasOpportunities.length > 0 && (
              <div className="space-y-5 border-2 border-white/15 bg-[#0c0c0c] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
                <h4 className="flex items-center gap-2 font-mono text-[11px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                  <Lightbulb className="h-4 w-4 text-[#ff4500]" /> AI-Generated
                  SaaS Opportunities
                </h4>
                <div className="space-y-4">
                  {reportData.saasOpportunities.slice(0, 3).map((opp) => (
                    <div
                      key={opp.title}
                      className="space-y-3 border border-white/20 bg-white/2 p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm leading-tight font-black text-white">
                          {opp.title}
                        </p>
                        <span className="text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
                          {opp.score}/100
                        </span>
                      </div>
                      <div className="space-y-2">
                        {formatPainDescription(opp.problemStatement).map(
                          (paragraph) => (
                            <p
                              key={paragraph.slice(0, 100)}
                              className="text-xs leading-relaxed font-medium text-zinc-400"
                            >
                              {paragraph}
                            </p>
                          ),
                        )}
                      </div>
                      <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                        ICP: {opp.targetCustomer}
                      </p>
                      <div className="space-y-2">
                        {formatPainDescription(opp.valueProposition).map(
                          (paragraph) => (
                            <p
                              key={paragraph.slice(0, 100)}
                              className="text-xs leading-relaxed font-medium text-zinc-300"
                            >
                              {paragraph}
                            </p>
                          ),
                        )}
                      </div>
                      <div className="space-y-2">
                        {formatPainDescription(opp.launchAngle).map(
                          (paragraph) => (
                            <p
                              key={paragraph.slice(0, 100)}
                              className="text-[11px] leading-relaxed font-bold text-zinc-500"
                            >
                              {paragraph}
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

function InfoSquare({
  icon,
  label,
  value,
  color,
  preserveCase,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  preserveCase?: boolean;
}) {
  return (
    <div className="flex min-h-[104px] items-start gap-3 border border-white/20 bg-white/2 p-4">
      <div
        className={`mt-0.5 rounded-xl border border-white/5 bg-zinc-900 p-2.5 ${color} shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] font-black tracking-[0.18em] text-zinc-600 uppercase">
          {label}
        </p>
        <p className="mt-2 text-base leading-[1.15] font-black wrap-break-word whitespace-normal text-white sm:text-[19px]">
          {preserveCase ? value : toTitleCase(value)}
        </p>
      </div>
    </div>
  );
}
