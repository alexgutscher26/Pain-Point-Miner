"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Eye,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  BrainCircuit,
  BarChart4,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMiningStream, type MiningPhase } from "@/hooks/use-mining-stream";

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scraperId = searchParams.get("id");

  const {
    phase,
    message: statusText,
    progress,
    painPointCount,
    postsFetched,
    subreddits,
    isDone,
    hasFailed,
  } = useMiningStream(scraperId);

  // Derive step status from the live SSE phase
  const steps = useMemo(() => {
    const phaseOrder: MiningPhase[] = [
      "scanning",
      "extracting",
      "clustering",
      "completed",
    ];
    const currentIdx = phaseOrder.indexOf(phase);

    function stepStatus(
      stepPhase: MiningPhase,
    ): "completed" | "in-progress" | "pending" {
      const stepIdx = phaseOrder.indexOf(stepPhase);
      if (phase === "completed" || phase === "failed" || phase === "canceled")
        return "completed";
      if (currentIdx > stepIdx) return "completed";
      if (currentIdx === stepIdx) return "in-progress";
      return "pending";
    }

    return [
      {
        icon: <Search className="w-4 h-4" />,
        title: "Collecting Reddit posts...",
        description:
          postsFetched > 0
            ? `Found ${postsFetched} posts across ${
                subreddits.length > 0
                  ? subreddits
                      .map((s) => `r/${s}`)
                      .slice(0, 3)
                      .join(", ")
                  : "target subreddits"
              }.`
            : subreddits.length > 0
              ? `Scanning r/${subreddits[0]}${subreddits.length > 1 ? ` and ${subreddits.length - 1} more...` : "..."}`
              : "Analyzing search relevance...",
        status: stepStatus("scanning"),
      },
      {
        icon: <BrainCircuit className="w-4 h-4" />,
        title: "Extracting pain points...",
        description:
          painPointCount > 0
            ? `Discovered ${painPointCount} unique frustration markers.`
            : "AI is reading content for intensity and budget...",
        status: stepStatus("extracting"),
      },
      {
        icon: <Sparkles className="w-4 h-4" />,
        title: "Clustering repeated themes...",
        description:
          phase === "completed" || phase === "clustering"
            ? `Clustered ${painPointCount} insights into high-value opportunities.`
            : "Structuring data hierarchies for the final report...",
        status: stepStatus("clustering"),
      },
      {
        icon: <BarChart4 className="w-4 h-4" />,
        title: "Finalizing Report...",
        description: isDone
          ? "Scoring market viability and difficulty scores."
          : "Preparing your analysis dashboard...",
        status: stepStatus("completed"),
      },
    ];
  }, [phase, postsFetched, painPointCount, subreddits, isDone]);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full flex flex-col items-center min-h-[calc(100vh-10rem)] justify-center">
      {/* Top Icon */}
      <div className="relative mb-8">
        <div className="relative w-20 h-20 bg-[#0c0c0c] flex items-center justify-center text-[#ff4500] border border-[#ff4500]/45 shadow-[3px_3px_0px_0px_rgba(255,69,0,0.3)]">
          <Eye className="w-10 h-10 animate-pulse" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white tracking-tight mb-4 uppercase">
          Mining Market Secrets
        </h2>
        <p className="text-zinc-400 font-medium text-lg">
          Our specialized algorithms are decoding the Reddit pulse for you.
        </p>
      </div>

      {/* Progress Card */}
      <div className="w-full bg-[#111] border-2 border-white/15 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#ff4500]/20 to-transparent"></div>

        <div className="p-10 space-y-10">
          {/* Overall Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="font-mono text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Analysis Progress
              </p>
              <p className="text-lg font-black text-[#ff4500]">{progress}%</p>
            </div>
            <div className="h-2 w-full bg-white/5 overflow-hidden border border-white/10">
              <div
                className="h-full bg-[#ff4500] transition-all duration-1000 shadow-[0_0_15px_rgba(255,69,0,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
              <div className="w-1.5 h-1.5 bg-[#ff4500] animate-ping"></div>
              {statusText}
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="space-y-0 relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-white/10"></div>

            {steps.map((step, idx) => (
              <AnalysisStep
                key={idx}
                icon={step.icon}
                title={step.title}
                description={step.description}
                status={step.status as "completed" | "in-progress" | "pending"}
              />
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-10 py-6 bg-white/2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-500 font-mono text-[11px] font-bold uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            {isDone ? "Mining complete" : `${progress}% — ${statusText}`}
          </div>
          <button
            disabled={!isDone}
            onClick={() => router.push(`/dashboard/reports/${scraperId}`)}
            className="px-6 py-2.5 border border-[#ff8a57] bg-[#ff4500] text-white font-mono text-[12px] font-black uppercase tracking-widest flex items-center gap-2 disabled:bg-white/5 disabled:text-zinc-500 disabled:border-white/20 disabled:cursor-not-allowed group transition-colors"
          >
            {isDone
              ? "View Detailed Report"
              : hasFailed
                ? "Scan Failed"
                : "Processing..."}{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mt-8 w-full max-w-2xl bg-[#ff4500]/5 border-2 border-[#ff4500]/25 p-6 flex gap-4 items-start relative overflow-hidden">
        <div className="p-2 bg-[#ff4500]/10 border border-[#ff4500]/35 text-[#ff4500] relative z-10">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="relative z-10">
          <p className="font-mono text-[10px] font-black text-[#ff4500] uppercase tracking-widest mb-1.5 flex items-center gap-2">
            Intelligence Protocol Active
          </p>
          <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">
            Our engine is specifically hunting for{" "}
            <span className="text-zinc-200">Pain Intensity</span>,{" "}
            <span className="text-zinc-200">Budgets</span>, and{" "}
            <span className="text-zinc-200">Switching Costs</span>. We ignore
            generic comments to find high-conviction market gaps.
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalysisStep({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
}) {
  return (
    <div
      className={`flex gap-6 p-5 transition-all duration-500 ${status === "pending" ? "opacity-45 grayscale" : "opacity-100"}`}
    >
      <div className="relative z-10">
        <div
          className={`w-10 h-10 flex items-center justify-center border transition-all duration-500 ${
            status === "completed"
              ? "bg-emerald-500/10 border-emerald-400/45 text-emerald-300"
              : status === "in-progress"
                ? "bg-[#ff4500]/20 border-[#ff4500]/70 text-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.35)] animate-pulse"
                : "bg-white/5 border-white/15 text-zinc-600"
          }`}
        >
          {status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <p
            className={`text-lg font-black tracking-tight ${status === "pending" ? "text-zinc-500" : "text-zinc-100"}`}
          >
            {title}
          </p>
          {status === "completed" && (
            <span className="font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-400/40">
              Analyzed
            </span>
          )}
          {status === "in-progress" && (
            <span className="font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/40">
              In Progress
            </span>
          )}
        </div>
        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
