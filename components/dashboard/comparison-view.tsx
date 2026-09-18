"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Flame,
  DollarSign,
  Compass,
  Download,
  Check,
  ChevronDown,
  Layers,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  ReportComparisonResult,
  compareReports,
  ComparisonReport,
} from "@/lib/comparison";
import { toast } from "sonner";

interface ComparisonViewProps {
  initialReportAId?: string;
  initialReportBId?: string;
  availableReports: Array<{
    id: string;
    keyword: string;
    date: string;
    painPointsCount: number;
    score: number;
  }>;
  fullReportsData: ComparisonReport[];
}

export function ComparisonView({
  initialReportAId,
  initialReportBId,
  availableReports,
  fullReportsData,
}: ComparisonViewProps) {
  const router = useRouter();
  const [selectedIdA, setSelectedIdA] = useState<string>(
    initialReportAId || availableReports[0]?.id || "",
  );
  const [selectedIdB, setSelectedIdB] = useState<string>(
    initialReportBId ||
      availableReports.find((r) => r.id !== selectedIdA)?.id ||
      availableReports[1]?.id ||
      "",
  );

  const reportAData = fullReportsData.find((r) => r.id === selectedIdA);
  const reportBData = fullReportsData.find((r) => r.id === selectedIdB);

  const comparison: ReportComparisonResult | null =
    reportAData && reportBData
      ? compareReports(reportAData, reportBData)
      : null;

  const handleSelectA = (id: string) => {
    setSelectedIdA(id);
    router.replace(`/dashboard/compare?a=${id}&b=${selectedIdB}`, { scroll: false });
  };

  const handleSelectB = (id: string) => {
    setSelectedIdB(id);
    router.replace(`/dashboard/compare?a=${selectedIdA}&b=${id}`, { scroll: false });
  };

  const handleExportJSON = () => {
    if (!comparison) return;
    const blob = new Blob([JSON.stringify(comparison, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comparison-${comparison.reportA.keyword}-vs-${comparison.reportB.keyword}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported comparison JSON");
  };

  const handleExportCSV = () => {
    if (!comparison) return;
    const rows = [
      ["Metric", comparison.reportA.keyword, comparison.reportB.keyword, "Delta (B vs A)"],
      ["Opportunity Score", comparison.reportA.opportunityScore, comparison.reportB.opportunityScore, `${comparison.deltas.opportunityScore.percentChange}%`],
      ["Pain Points Found", comparison.reportA.painPointsCount, comparison.reportB.painPointsCount, `${comparison.deltas.painPointsCount.percentChange}%`],
      ["Avg Urgency (1-10)", comparison.reportA.avgUrgency, comparison.reportB.avgUrgency, `${comparison.deltas.avgUrgency.percentChange}%`],
      ["Avg Monetization (1-10)", comparison.reportA.avgMonetization, comparison.reportB.avgMonetization, `${comparison.deltas.avgMonetization.percentChange}%`],
      ["Blue Ocean Niches", comparison.reportA.quadrantBreakdown.blueOcean, comparison.reportB.quadrantBreakdown.blueOcean, `${comparison.deltas.blueOceanCount.percentChange}%`],
      ["Budget Signals", comparison.reportA.budgetSignalsCount, comparison.reportB.budgetSignalsCount, `${comparison.deltas.budgetSignalsCount.percentChange}%`],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `comparison-${comparison.reportA.keyword}-vs-${comparison.reportB.keyword}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported comparison CSV");
  };

  return (
    <div className="space-y-8">
      {/* Top Selectors & Export Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {/* Selector A */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4500] text-[10px] font-black text-white">
                A
              </span>
              Primary Investigation
            </label>
            <div className="relative">
              <select
                value={selectedIdA}
                onChange={(e) => handleSelectA(e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2.5 pr-8 text-xs font-bold text-zinc-900 outline-none transition-all hover:border-black/20 focus:border-[#ff4500] focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              >
                {availableReports.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.id === selectedIdB}>
                    {r.keyword} ({r.painPointsCount} pts, Score: {r.score})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Selector B */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                B
              </span>
              Comparison Target
            </label>
            <div className="relative">
              <select
                value={selectedIdB}
                onChange={(e) => handleSelectB(e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2.5 pr-8 text-xs font-bold text-zinc-900 outline-none transition-all hover:border-black/20 focus:border-blue-600 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              >
                {availableReports.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.id === selectedIdA}>
                    {r.keyword} ({r.painPointsCount} pts, Score: {r.score})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        {comparison && (
          <div className="flex items-center gap-2 pt-2 lg:pt-0 shrink-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-[11px] font-bold text-zinc-700 uppercase transition-all hover:border-[#ff4500] hover:text-[#ff4500] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-[#ff4500] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-[11px] font-bold text-zinc-700 uppercase transition-all hover:border-[#ff4500] hover:text-[#ff4500] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-[#ff4500] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>JSON</span>
            </button>
          </div>
        )}
      </div>

      {!comparison ? (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
          <Scale className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            Select Two Investigations to Compare
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Choose two distinct research dossiers from the dropdown menus above to analyze pain point densities and market opportunities side-by-side.
          </p>
        </div>
      ) : (
        <>
          {/* Executive Summary & Verdict Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#ff4500]/30 bg-gradient-to-br from-[#ff4500]/10 via-[#ff4500]/5 to-transparent p-6 shadow-sm dark:from-[#ff4500]/15 dark:via-[#ff4500]/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-md bg-[#ff4500]/20 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-widest text-[#ff4500]">
                  <Sparkles className="h-3 w-3" />
                  Comparative Viability Verdict
                </div>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white">
                  {comparison.summaryVerdict.overallWinner === "tie"
                    ? "Evenly Matched Market Potential"
                    : `Winner: "${comparison.summaryVerdict.winnerKeyword}" Shows Stronger Signal`}
                </h3>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 max-w-3xl">
                  {comparison.summaryVerdict.verdictStatement}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/dashboard/reports/${comparison.reportA.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#ff4500] hover:underline"
                >
                  View Dossier A <ExternalLink className="h-3 w-3" />
                </Link>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <Link
                  href={`/dashboard/reports/${comparison.reportB.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:underline"
                >
                  View Dossier B <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Metric Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Opportunity Score Delta */}
            <DeltaMetricCard
              title="Opportunity Score"
              icon={<Zap className="h-4 w-4" />}
              labelA={comparison.reportA.keyword}
              valueA={comparison.reportA.opportunityScore}
              labelB={comparison.reportB.keyword}
              valueB={comparison.reportB.opportunityScore}
              delta={comparison.deltas.opportunityScore}
            />

            {/* 2. Pain Points Count Delta */}
            <DeltaMetricCard
              title="Pain Points Found"
              icon={<Layers className="h-4 w-4" />}
              labelA={comparison.reportA.keyword}
              valueA={comparison.reportA.painPointsCount}
              labelB={comparison.reportB.keyword}
              valueB={comparison.reportB.painPointsCount}
              delta={comparison.deltas.painPointsCount}
            />

            {/* 3. Blue Ocean Niches Delta */}
            <DeltaMetricCard
              title="Blue Ocean Niches"
              icon={<Compass className="h-4 w-4" />}
              labelA={comparison.reportA.keyword}
              valueA={comparison.reportA.quadrantBreakdown.blueOcean}
              labelB={comparison.reportB.keyword}
              valueB={comparison.reportB.quadrantBreakdown.blueOcean}
              delta={comparison.deltas.blueOceanCount}
              badgeText="High Pain, Low Satiation"
            />

            {/* 4. Budget Signals Count Delta */}
            <DeltaMetricCard
              title="Willingness to Pay Signals"
              icon={<DollarSign className="h-4 w-4" />}
              labelA={comparison.reportA.keyword}
              valueA={comparison.reportA.budgetSignalsCount}
              labelB={comparison.reportB.keyword}
              valueB={comparison.reportB.budgetSignalsCount}
              delta={comparison.deltas.budgetSignalsCount}
            />
          </div>

          {/* Side-by-side Quadrant & Sentiment Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quadrant Distribution Comparison */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#ff4500]" />
                  <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase font-mono tracking-wider">
                    Market Quadrant Distribution
                  </h4>
                </div>
              </div>

              <div className="space-y-4">
                <QuadrantComparisonRow
                  name="🌟 Blue Ocean (High Pain, Low Comp)"
                  countA={comparison.reportA.quadrantBreakdown.blueOcean}
                  totalA={comparison.reportA.painPointsCount}
                  countB={comparison.reportB.quadrantBreakdown.blueOcean}
                  totalB={comparison.reportB.painPointsCount}
                  labelA={comparison.reportA.keyword}
                  labelB={comparison.reportB.keyword}
                  highlight
                />
                <QuadrantComparisonRow
                  name="⚔️ Competitive Battleground"
                  countA={comparison.reportA.quadrantBreakdown.battleground}
                  totalA={comparison.reportA.painPointsCount}
                  countB={comparison.reportB.quadrantBreakdown.battleground}
                  totalB={comparison.reportB.painPointsCount}
                  labelA={comparison.reportA.keyword}
                  labelB={comparison.reportB.keyword}
                />
                <QuadrantComparisonRow
                  name="🧭 Uncharted Niche"
                  countA={comparison.reportA.quadrantBreakdown.uncharted}
                  totalA={comparison.reportA.painPointsCount}
                  countB={comparison.reportB.quadrantBreakdown.uncharted}
                  totalB={comparison.reportB.painPointsCount}
                  labelA={comparison.reportA.keyword}
                  labelB={comparison.reportB.keyword}
                />
                <QuadrantComparisonRow
                  name="📦 Commodity Zone"
                  countA={comparison.reportA.quadrantBreakdown.commodity}
                  totalA={comparison.reportA.painPointsCount}
                  countB={comparison.reportB.quadrantBreakdown.commodity}
                  totalB={comparison.reportB.painPointsCount}
                  labelA={comparison.reportA.keyword}
                  labelB={comparison.reportB.keyword}
                />
              </div>
            </div>

            {/* Sentiment Breakdown Comparison */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#ff4500]" />
                  <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase font-mono tracking-wider">
                    Audience Sentiment Breakdown
                  </h4>
                </div>
              </div>

              <div className="space-y-4">
                <SentimentComparisonRow
                  emotion="🔥 Desperate Need"
                  countA={comparison.reportA.sentimentBreakdown.desperate}
                  totalA={comparison.reportA.painPointsCount}
                  countB={comparison.reportB.sentimentBreakdown.desperate}
                  totalB={comparison.reportB.painPointsCount}
                  labelA={comparison.reportA.keyword}
                  labelB={comparison.reportB.keyword}
                  color="rose"
                />
                <SentimentComparisonRow
                  emotion="⚡ High Frustration"
                  countA={comparison.reportA.sentimentBreakdown.frustrated}
                  totalA={comparison.reportA.painPointsCount}
                  countB={comparison.reportB.sentimentBreakdown.frustrated}
                  totalB={comparison.reportB.painPointsCount}
                  labelA={comparison.reportA.keyword}
                  labelB={comparison.reportB.keyword}
                  color="amber"
                />
                <SentimentComparisonRow
                  emotion="💬 General Inconvenience"
                  countA={comparison.reportA.sentimentBreakdown.neutral}
                  totalA={comparison.reportA.painPointsCount}
                  countB={comparison.reportB.sentimentBreakdown.neutral}
                  totalB={comparison.reportB.painPointsCount}
                  labelA={comparison.reportA.keyword}
                  labelB={comparison.reportB.keyword}
                  color="zinc"
                />
              </div>
            </div>
          </div>

          {/* Head-to-Head Top Friction Points */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight text-zinc-950 dark:text-white uppercase font-mono">
                    Head-to-Head Top Opportunities
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Highest-friction user struggles ranked side-by-side
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column A */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4500] text-[10px] font-black text-white">
                    A
                  </span>
                  <h5 className="font-mono text-xs font-black uppercase text-zinc-900 dark:text-white truncate">
                    {comparison.reportA.keyword} Top Signals
                  </h5>
                </div>

                <div className="space-y-2.5">
                  {comparison.topPainPointsHeadToHead.map((item) =>
                    item.painPointA ? (
                      <div
                        key={item.painPointA.id}
                        className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-[#ff4500] uppercase">
                              #{item.rank} Friction Signal
                            </span>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2">
                              {item.painPointA.title}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            {item.painPointA.score}/10
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                          <span>Urgency: {item.painPointA.urgency}/10</span>
                          <span>•</span>
                          <span className="capitalize">{item.painPointA.sentiment}</span>
                          {item.painPointA.subreddit && (
                            <>
                              <span>•</span>
                              <span>r/{item.painPointA.subreddit}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={`empty-a-${item.rank}`}
                        className="rounded-xl border border-dashed border-zinc-200 p-4 text-center font-mono text-xs text-zinc-400 dark:border-zinc-800"
                      >
                        No rank #{item.rank} signal available
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Column B */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                    B
                  </span>
                  <h5 className="font-mono text-xs font-black uppercase text-zinc-900 dark:text-white truncate">
                    {comparison.reportB.keyword} Top Signals
                  </h5>
                </div>

                <div className="space-y-2.5">
                  {comparison.topPainPointsHeadToHead.map((item) =>
                    item.painPointB ? (
                      <div
                        key={item.painPointB.id}
                        className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                              #{item.rank} Friction Signal
                            </span>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2">
                              {item.painPointB.title}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            {item.painPointB.score}/10
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                          <span>Urgency: {item.painPointB.urgency}/10</span>
                          <span>•</span>
                          <span className="capitalize">{item.painPointB.sentiment}</span>
                          {item.painPointB.subreddit && (
                            <>
                              <span>•</span>
                              <span>r/{item.painPointB.subreddit}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={`empty-b-${item.rank}`}
                        className="rounded-xl border border-dashed border-zinc-200 p-4 text-center font-mono text-xs text-zinc-400 dark:border-zinc-800"
                      >
                        No rank #{item.rank} signal available
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DeltaMetricCard({
  title,
  icon,
  labelA,
  valueA,
  labelB,
  valueB,
  delta,
  badgeText,
}: {
  title: string;
  icon: React.ReactNode;
  labelA: string;
  valueA: number;
  labelB: string;
  valueB: number;
  delta: { diff: number; percentChange: number; favors: "A" | "B" | "neutral" };
  badgeText?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold text-zinc-500 uppercase dark:text-zinc-400">
            {title}
          </span>
          <div className="text-zinc-400">{icon}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="block font-mono text-[9px] font-bold text-[#ff4500] uppercase truncate">
              {labelA}
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">
              {valueA}
            </span>
          </div>
          <div>
            <span className="block font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase truncate">
              {labelB}
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">
              {valueB}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-400 text-[10px] uppercase">Delta Diff</span>
        <span
          className={`inline-flex items-center gap-1 font-bold ${
            delta.favors === "B"
              ? "text-blue-600 dark:text-blue-400"
              : delta.favors === "A"
                ? "text-[#ff4500]"
                : "text-zinc-500"
          }`}
        >
          {delta.diff > 0 ? `+${delta.diff}` : `${delta.diff}`}
          {delta.percentChange !== 0 && ` (${delta.percentChange > 0 ? "+" : ""}${delta.percentChange}%)`}
        </span>
      </div>
    </div>
  );
}

function QuadrantComparisonRow({
  name,
  countA,
  totalA,
  countB,
  totalB,
  labelA,
  labelB,
  highlight = false,
}: {
  name: string;
  countA: number;
  totalA: number;
  countB: number;
  totalB: number;
  labelA: string;
  labelB: string;
  highlight?: boolean;
}) {
  const pctA = totalA > 0 ? Math.round((countA / totalA) * 100) : 0;
  const pctB = totalB > 0 ? Math.round((countB / totalB) * 100) : 0;

  return (
    <div className={`p-3 rounded-xl ${highlight ? "bg-[#ff4500]/5 border border-[#ff4500]/20" : "bg-zinc-50/50 dark:bg-zinc-950/40"}`}>
      <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white mb-2">
        <span>{name}</span>
        <span className="font-mono text-[11px] text-zinc-500">
          A: {countA} ({pctA}%) vs B: {countB} ({pctB}%)
        </span>
      </div>

      {/* Side-by-side Progress Bars */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-5 font-mono text-[9px] font-bold text-[#ff4500]">A</span>
          <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-[#ff4500] rounded-full transition-all duration-500"
              style={{ width: `${pctA}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400">B</span>
          <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${pctB}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SentimentComparisonRow({
  emotion,
  countA,
  totalA,
  countB,
  totalB,
  labelA,
  labelB,
  color,
}: {
  emotion: string;
  countA: number;
  totalA: number;
  countB: number;
  totalB: number;
  labelA: string;
  labelB: string;
  color: "rose" | "amber" | "zinc";
}) {
  const pctA = totalA > 0 ? Math.round((countA / totalA) * 100) : 0;
  const pctB = totalB > 0 ? Math.round((countB / totalB) * 100) : 0;

  return (
    <div className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40">
      <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white mb-2">
        <span>{emotion}</span>
        <span className="font-mono text-[11px] text-zinc-500">
          A: {countA} ({pctA}%) vs B: {countB} ({pctB}%)
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-5 font-mono text-[9px] font-bold text-[#ff4500]">A</span>
          <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                color === "rose"
                  ? "bg-rose-500"
                  : color === "amber"
                    ? "bg-amber-500"
                    : "bg-zinc-400"
              }`}
              style={{ width: `${pctA}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400">B</span>
          <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                color === "rose"
                  ? "bg-rose-500"
                  : color === "amber"
                    ? "bg-amber-500"
                    : "bg-zinc-400"
              }`}
              style={{ width: `${pctB}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
