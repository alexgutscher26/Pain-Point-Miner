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
  Lock,
  AlertTriangle,
  Lightbulb,
  Loader2,
  DollarSign,
  ArrowRightLeft,
  Wrench,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

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
    budget?: string;
    switchingCosts?: string;
    triedSolutions?: string[];
}

interface ReportData {
    reportId: string;
    title: string;
    date: string;
    saved: boolean;
    category: string;
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
    features.push(`Alternative to "${pain.triedSolutions[0]}" with measurable outcomes`);
  } else {
    features.push("Experiment tracker to compare interventions by impact");
  }
  return features.slice(0, 3);
}

function renderMultiline(text: string) {
  return text.replace(/\\n/g, "\n");
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
  const [activeTabsByPain, setActiveTabsByPain] = useState<Record<string, CardTab>>({});
  const [intensityFilterDraft, setIntensityFilterDraft] = useState<IntensityFilter>("all");
  const [sentimentFilterDraft, setSentimentFilterDraft] = useState<SentimentFilter>("all");
  const [intensityFilterApplied, setIntensityFilterApplied] = useState<IntensityFilter>("all");
  const [sentimentFilterApplied, setSentimentFilterApplied] = useState<SentimentFilter>("all");

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
    showToast = true
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
      if (!response.ok) throw new Error("Failed to update report");
      const data = await response.json();
      setReportData((prev) =>
        prev
          ? {
              ...prev,
              saved: data.reportSaved,
              category: data.reportCategory || categoryToPersist,
            }
          : prev
      );
      if (showToast) {
        toast.success(nextSaved ? "Report saved and organized." : "Report removed from saved.");
      }
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Unable to update report.");
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
              if (typeof errorPayload?.message === "string" && errorPayload.message.length > 0) {
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
        toast.info("Investigation already running. Redirecting to existing analysis...");
      } else {
        toast.success("Investigation started.");
      }
      router.push(`/dashboard/analysis?id=${data.scraperId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to run investigation again.";
      toast.error(message);
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
            ? normalizedSentiment.includes("frustrated") || normalizedSentiment.includes("desperate")
            : normalizedSentiment.includes("neutral") || normalizedSentiment.includes("explor");

      return matchesIntensity && matchesSentiment;
    }).length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAIN_POINTS_PER_PAGE));
    if (painPointsPage > totalPages) {
      setPainPointsPage(totalPages);
    }
  }, [intensityFilterApplied, painPointsPage, reportData, sentimentFilterApplied]);

  const iconMap: Record<string, React.ReactNode> = {
    AlertTriangle: <AlertTriangle className="w-4 h-4" />,
    MessageSquare: <MessageSquare className="w-4 h-4" />,
    Star: <Star className="w-4 h-4" />,
    Users: <Users className="w-4 h-4" />,
    BarChart3: <BarChart3 className="w-4 h-4" />,
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#ff4500] animate-spin" />
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Decrypting Insights...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-black text-white mb-4 uppercase">Report Not Found</h2>
        <p className="text-zinc-500 mb-8 max-w-md">We couldn't find the investigation archives you're looking for. It might have been deleted or moved.</p>
        <Link href="/dashboard/reports" className="px-6 py-3 bg-[#ff4500] text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
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
          ? normalizedSentiment.includes("frustrated") || normalizedSentiment.includes("desperate")
          : normalizedSentiment.includes("neutral") || normalizedSentiment.includes("explor");

    return matchesIntensity && matchesSentiment;
  });

  const totalPainPoints = filteredPainPoints.length;
  const totalPainPointPages = Math.max(1, Math.ceil(totalPainPoints / PAIN_POINTS_PER_PAGE));
  const startPainPointIndex = (painPointsPage - 1) * PAIN_POINTS_PER_PAGE;
  const endPainPointIndex = Math.min(startPainPointIndex + PAIN_POINTS_PER_PAGE, totalPainPoints);
  const visiblePainPoints = filteredPainPoints.slice(startPainPointIndex, endPainPointIndex);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-700">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard/reports" className="hover:text-white transition-colors">Reports</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-200">{reportData.title}</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
            Analysis: <span className="text-[#ff4500]">{reportData.title}</span>
          </h2>
          <div className="flex items-center gap-2 text-zinc-500 font-bold text-[12px] uppercase tracking-widest pt-2">
             <ShieldCheck className="w-3.5 h-3.5 text-[#ff4500]" />
             Scanned on {reportData.date}
          </div>
          {reportData.trend && (
            <div className="pt-3">
              <span
                className={`inline-flex items-center rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border ${
                  reportData.trend.direction === "up" || reportData.trend.direction === "new"
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
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all [&>option]:bg-white [&>option]:text-black"
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
            className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
             {isSaving ? "Saving..." : reportData.saved ? "Saved" : "Save Report"}
          </button>
          <button
            type="button"
            onClick={handleExportData}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
          >
             Export Data
          </button>
          <button
            type="button"
            onClick={handleRunAgain}
            disabled={isRerunning}
            className="bg-[#ff4500] hover:bg-[#ff571a] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff4500]/20 active:scale-95 group min-w-[140px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
             {isRerunning ? "Running..." : "Run Again"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportData.metrics.map((metric, idx) => (
          <div key={idx} className="bg-[#0c0c0c] border border-white/5 rounded-[24px] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-[#ff4500]/5 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                {iconMap[metric.icon] || <Star className="w-4 h-4" />}
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-white tracking-tight">{metric.value}</h4>
              <p className={`text-[11px] font-bold ${metric.color === 'text-[#ff4500]' ? 'text-zinc-600' : 'text-zinc-700'}`}>{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pain Points */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
              <TrendingUp className="w-5 h-5 text-[#ff4500]" />
              Top Frustrations Identified
            </h3>
            <button className="text-[11px] font-black text-[#ff4500] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
               View Heatmap
            </button>
          </div>

          {reportData.customPatterns && reportData.customPatterns.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 mb-6">
               <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                 <Sparkles className="w-3.5 h-3.5" /> AI Intelligence Patterns
               </p>
               <div className="flex flex-wrap gap-2">
                 {reportData.customPatterns.map((pattern, i) => (
                   <span key={i} className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-[11px] font-bold text-zinc-400">
                     {pattern}
                   </span>
                 ))}
               </div>
            </div>
          )}

          <div className="space-y-6">
            {visiblePainPoints.map((pain) => (
              <div key={pain.id} className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 space-y-8 hover:border-[#ff4500]/20 transition-all group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4500]/2 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                
                {/* Pain Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-2xl font-black text-white tracking-tight group-hover:text-[#ff4500] transition-colors">{pain.title}</h4>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        pain.urgency === 'High Urgency' 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {pain.urgency}
                      </span>
                    </div>
                    <p className="text-zinc-400 font-medium leading-relaxed max-w-2xl bg-[#111]/30 p-4 rounded-xl border border-white/5">
                      {pain.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-black uppercase tracking-widest">
                       <div className="flex items-center gap-1.5 text-[#ff4500]">
                         <MessageSquare className="w-3.5 h-3.5" />
                         {pain.mentions} mentions
                       </div>
                       {typeof pain.validationScore === "number" && (
                         <div className="flex items-center gap-1.5 text-sky-400">
                           <BarChart3 className="w-3.5 h-3.5" />
                           Validation {pain.validationScore}/100
                         </div>
                       )}
                       {pain.subreddits.map((sub, i) => (
                         <div key={i} className="flex items-center gap-1.5 text-zinc-500">
                           <Users className="w-3.5 h-3.5" />
                           r/{sub}
                         </div>
                       ))}
                       <div className={`flex items-center gap-1.5 ${pain.sentiment === 'frustrated' ? 'text-rose-500' : 'text-zinc-500'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${pain.sentiment === 'frustrated' ? 'bg-rose-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                         Vibe: {pain.sentiment}
                       </div>
                    </div>
                  </div>
                  <div className="text-center md:text-right shrink-0 bg-white/2 border border-white/5 px-6 py-4 rounded-2xl">
                     <p className="text-4xl font-black text-white">{pain.intensity}/10</p>
                     <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Pain Score</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-2 relative z-10">
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
                        onClick={() => setActiveTab(pain.id, tab.key as CardTab)}
                        className={`px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                          isActive
                            ? "bg-[#ff4500]/20 border-[#ff4500]/40 text-[#ff4500]"
                            : "bg-zinc-900 border-white/10 text-zinc-400 hover:bg-white/5"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {getActiveTab(pain.id) === "signals" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 relative z-10">
                     <InfoSquare icon={<DollarSign className="w-3.5 h-3.5" />} label="Budget" value={pain.budget || "Unseen"} color="text-emerald-500" />
                     <InfoSquare icon={<ArrowRightLeft className="w-3.5 h-3.5" />} label="Switching" value={pain.switchingCosts || "Low friction"} color="text-amber-500" />
                     <InfoSquare icon={<Wrench className="w-3.5 h-3.5" />} label="Tried" value={pain.triedSolutions && pain.triedSolutions.length > 0 ? (pain.triedSolutions.length).toString() : "0"} color="text-blue-500" />
                     <InfoSquare icon={<TrendingUp className="w-3.5 h-3.5" />} label="Pay Signal" value={`${pain.monetization || 0}/10`} color="text-violet-500" />
                     <InfoSquare icon={<BarChart3 className="w-3.5 h-3.5" />} label="Stage" value={pain.maturity && pain.maturity < 4 ? "Blue Ocean" : pain.maturity && pain.maturity > 7 ? "Disruption" : "Scaling"} color="text-rose-500" />
                  </div>
                )}

                {getActiveTab(pain.id) === "community" && (
                  <div className="space-y-4 relative z-10">
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Community Pulse</p>
                     {pain.userLanguage && (
                       <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 space-y-3">
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                           Language Overview
                         </p>
                         <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                           &quot;{pain.userLanguage.overview}&quot;
                         </p>
                       </div>
                     )}
                     {pain.communityVoices.map((voice, i) => (
                      <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl border-l-4 border-l-[#ff4500]">
                        <p className="text-[14px] text-zinc-300 italic font-medium leading-relaxed">
                          &quot;{voice}&quot;
                        </p>
                      </div>
                     ))}
                     {pain.userLanguage?.sections?.map((section, sectionIdx) => (
                       <div
                         key={`${pain.id}-lang-${sectionIdx}`}
                         className="bg-white/2 border border-white/5 p-6 rounded-2xl space-y-3"
                       >
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                           {section.label}
                         </p>
                         <p className="text-xs text-zinc-500 font-medium">{section.summary}</p>
                         <div className="space-y-2">
                           {section.examples.map((example, exampleIdx) => (
                             <p
                               key={`${pain.id}-lang-${sectionIdx}-ex-${exampleIdx}`}
                               className="text-sm text-zinc-300 font-medium leading-relaxed"
                             >
                               - &quot;{example}&quot;
                             </p>
                           ))}
                         </div>
                       </div>
                     ))}
                  </div>
                )}

                {getActiveTab(pain.id) === "build" && (
                  <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4 shadow-inner">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                           <BarChart3 className="w-4 h-4" /> Marketing Language
                        </p>
                        <div className="space-y-2">
                           {pain.triedSolutions && pain.triedSolutions.length > 0 ? (
                             pain.triedSolutions.map((sol, i) => (
                               <div key={i} className="flex items-center gap-3 text-zinc-400 font-medium">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div>
                                 User tried &quot;{sol}&quot;
                               </div>
                             ))
                           ) : (
                             <p className="text-zinc-600 text-xs italic font-medium">No tools mentioned specifically.</p>
                           )}
                        </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4 shadow-inner">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                           <Lightbulb className="w-4 h-4" /> Suggested Angles
                        </p>
                        <div className="space-y-2">
                           {pain.angles.map((angle, i) => (
                             <div key={i} className="flex items-center gap-3 text-zinc-400 font-medium">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"></div>
                               {angle}
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-[#ff4500]/5 border border-[#ff4500]/15 space-y-4">
                      <p className="text-[10px] font-black text-[#ff4500] uppercase tracking-widest">
                        What to Build
                      </p>
                      <h5 className="text-lg font-black text-white tracking-tight">
                        {deriveBuildIdea(pain)}
                      </h5>
                      <p className="text-[12px] text-zinc-300 font-medium">
                        Build for: <span className="text-white">{deriveTargetUser(pain)}</span>
                      </p>
                      <div className="space-y-2">
                        {deriveMvpFeatures(pain).map((feature) => (
                          <div key={feature} className="flex items-start gap-3 text-zinc-300 text-[13px] font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ff4500] mt-2"></div>
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
            <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                No frustrations match the selected filters
              </p>
            </div>
          )}

          {totalPainPoints > PAIN_POINTS_PER_PAGE && (
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Showing {startPainPointIndex + 1}-{endPainPointIndex} of {totalPainPoints}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPainPointsPage((prev) => Math.max(1, prev - 1))}
                  disabled={painPointsPage === 1}
                  className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">
                  Page {painPointsPage} / {totalPainPointPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPainPointsPage((prev) => Math.min(totalPainPointPages, prev + 1))}
                  disabled={painPointsPage === totalPainPointPages}
                  className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-all flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Intel */}
        <div className="lg:col-span-4 space-y-8">
           {/* Refine Section */}
           <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Filter className="w-4 h-4 text-[#ff4500]" />
                  Investigation Tools
                </h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Filter by Intensity</label>
                    <select
                      value={intensityFilterDraft}
                      onChange={(event) => setIntensityFilterDraft(event.target.value as IntensityFilter)}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4500]/50 transition-colors appearance-none font-bold [&>option]:bg-white [&>option]:text-black"
                    >
                      <option value="all">All Intensity Levels</option>
                      <option value="high">High Core Pain (8+)</option>
                      <option value="medium">Medium Friction (5+)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sentiment Filter</label>
                    <select
                      value={sentimentFilterDraft}
                      onChange={(event) => setSentimentFilterDraft(event.target.value as SentimentFilter)}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4500]/50 transition-colors appearance-none font-bold [&>option]:bg-white [&>option]:text-black"
                    >
                      <option value="all">All Sentiment Types</option>
                      <option value="frustrated">Frustrated / Desperate</option>
                      <option value="neutral">Neutral Explorations</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="w-full bg-[#ff4500] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#ff571a] transition-all active:scale-[0.98] shadow-lg shadow-[#ff4500]/20"
                  >
                    Apply Filter Logic
                  </button>
                </div>
              </div>

              {/* Validation Signals */}
              <div className="pt-8 border-t border-white/5">
                <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Market Signals
                </h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black mb-2">
                      <span className="text-zinc-400 uppercase">Analysis Confidence</span>
                      <span className="text-white tracking-widest">94%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff4500] w-[94%]"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black mb-2">
                      <span className="text-zinc-400 uppercase">AI Data Fidelity</span>
                      <span className="text-white tracking-widest">High</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[88%]"></div>
                    </div>
                  </div>
                </div>
              </div>
           </div>

           {reportData.saasOpportunities && reportData.saasOpportunities.length > 0 && (
             <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 space-y-5 shadow-2xl">
               <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Lightbulb className="w-4 h-4 text-[#ff4500]" /> AI-Generated SaaS Opportunities
               </h4>
               <div className="space-y-4">
                 {reportData.saasOpportunities.slice(0, 3).map((opp, idx) => (
                   <div key={idx} className="rounded-2xl border border-white/5 bg-white/2 p-5 space-y-3">
                     <div className="flex items-center justify-between gap-3">
                       <p className="text-sm font-black text-white leading-tight">{opp.title}</p>
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#ff4500]">{opp.score}/100</span>
                     </div>
                     <p className="text-xs text-zinc-400 font-medium leading-relaxed whitespace-pre-line">{renderMultiline(opp.problemStatement)}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ICP: {opp.targetCustomer}</p>
                     <p className="text-xs text-zinc-300 font-medium leading-relaxed whitespace-pre-line">{renderMultiline(opp.valueProposition)}</p>
                     <p className="text-[11px] text-zinc-500 font-bold leading-relaxed whitespace-pre-line">{renderMultiline(opp.launchAngle)}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Pro Unlock Card */}
           <div className="relative group rounded-[32px] overflow-hidden bg-linear-to-br from-[#111] to-black border border-white/5 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4500]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-[#ff4500] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#ff4500]/20">
                   <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white tracking-tight uppercase">Unlock Core Strategy</h4>
                  <p className="text-[13px] text-zinc-500 font-medium leading-relaxed">
                    Access competitor breakdown charts, verified lead emails from Reddit users, and ready-to-run marketing copy.
                  </p>
                </div>
                <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-[0.98]">
                   Upgrade to Enterprise
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoSquare({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    return (
        <div className="bg-white/2 border border-white/5 p-4 rounded-2xl flex items-start gap-3 min-h-[82px]">
            <div className={`p-2 rounded-lg bg-zinc-900 border border-white/5 ${color} shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-black text-white leading-tight break-words whitespace-normal">
                  {value}
                </p>
            </div>
        </div>
    );
}
