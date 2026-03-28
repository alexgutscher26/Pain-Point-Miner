"use client";

import { useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Eye,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  BrainCircuit,
  BarChart4,
  AlertTriangle,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMiningStream, type MiningPhase } from "@/hooks/use-mining-stream";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
    timeWindow,
    customPatterns,
    throttleWarnings,
    isDone,
    hasFailed,
    hasHydrated,
  } = useMiningStream(scraperId);

  // New: Toast management for mining operations
  useEffect(() => {
    if (!scraperId || !hasHydrated) return;

    if (hasFailed) {
      toast.error("Analysis Failed", {
        description: "There was a problem processing the Reddit data.",
        id: `mining-${scraperId}`,
        action: {
          label: "Retry",
          onClick: () => window.location.reload(), // Simple retry by reload for now, or could re-trigger mining
        },
      });
      return;
    }

    if (isDone) {
      toast.success("Mining Complete", {
        description: `Discovered ${painPointCount} unique pain points.`,
        id: `mining-${scraperId}`,
        duration: 5000,
      });
      return;
    }

    if (progress > 0 && progress < 100) {
      toast.info(`Mining in progress: ${progress}%`, {
        description: statusText,
        id: `mining-${scraperId}`,
        duration: Infinity, // Keep it visible until complete or failed
      });
    }

    return () => {
      // Clear progress toast if it's still there when unmounting
      if (!isDone && !hasFailed) {
        toast.dismiss(`mining-${scraperId}`);
      }
    };
  }, [
    scraperId,
    hasHydrated,
    isDone,
    hasFailed,
    progress,
    painPointCount,
    statusText,
  ]);

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
        icon: <Search className="h-4 w-4" />,
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
        icon: <BrainCircuit className="h-4 w-4" />,
        title: "Extracting pain points...",
        description:
          painPointCount > 0
            ? `Discovered ${painPointCount} unique frustration markers.`
            : "AI is reading content for intensity and budget...",
        status: stepStatus("extracting"),
      },
      {
        icon: <Sparkles className="h-4 w-4" />,
        title: "Clustering repeated themes...",
        description:
          phase === "completed" || phase === "clustering"
            ? `Clustered ${painPointCount} insights into high-value opportunities.`
            : "Structuring data hierarchies for the final report...",
        status: stepStatus("clustering"),
      },
      {
        icon: <BarChart4 className="h-4 w-4" />,
        title: "Finalizing Report...",
        description: isDone
          ? "Scoring market viability and difficulty scores."
          : "Preparing your analysis dashboard...",
        status: stepStatus("completed"),
      },
    ];
  }, [phase, postsFetched, painPointCount, subreddits, isDone]);

  if (!hasHydrated && scraperId) {
    return <AnalysisSkeletonView />;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-4xl flex-col items-center justify-center p-8">
      {/* Top Icon */}
      <div className="relative mb-8">
        <div className="relative flex h-20 w-20 items-center justify-center border border-[#ff4500]/45 bg-[#0c0c0c] text-[#ff4500] shadow-[3px_3px_0px_0px_rgba(255,69,0,0.3)]">
          <Eye className="h-10 w-10 animate-pulse" />
        </div>
      </div>

      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-4xl font-black tracking-tight text-white uppercase">
          Mining Market Secrets
        </h2>
        <p className="text-lg font-medium text-zinc-400">
          Our specialized algorithms are decoding the Reddit pulse for you.
        </p>
        <p className="mt-3 font-mono text-[11px] font-black tracking-widest text-amber-400 uppercase">
          Active window: {timeWindow}
        </p>
      </div>

      {/* Progress Card */}
      <div className="relative w-full overflow-hidden border-2 border-white/15 bg-[#111] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-[#ff4500]/20 to-transparent"></div>

        <div className="space-y-10 p-10">
          {/* Rate Limit Warnings */}
          {throttleWarnings.length > 0 && (
            <div className="mb-8 space-y-2.5 border border-amber-500/20 bg-amber-500/5 p-5 font-mono text-[11px] leading-relaxed tracking-widest text-amber-400 uppercase">
              <div className="mb-2 flex items-center gap-2 font-black text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                Rate Limit Protocol Alerts
              </div>
              {throttleWarnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 border-l-2 border-amber-500/30 pl-3"
                >
                  <span className="tabular-nums opacity-40">
                    [
                    {new Date().toLocaleTimeString([], {
                      hour12: false,
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                    ]
                  </span>
                  <span className="font-bold">{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Overall Progress */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <p className="font-mono text-[11px] font-black tracking-widest text-zinc-400 uppercase">
                Analysis Progress
              </p>
              <p className="text-lg font-black text-[#ff4500]">{progress}%</p>
            </div>
            <div className="h-2 w-full overflow-hidden border border-white/10 bg-white/5">
              <div
                className="h-full bg-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.5)] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-wide text-zinc-500 uppercase">
              <div className="h-1.5 w-1.5 animate-ping bg-[#ff4500]"></div>
              {statusText}
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="relative space-y-0">
            <div className="absolute top-6 bottom-6 left-[19px] w-px bg-white/10"></div>

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
        <div className="flex items-center justify-between border-t border-white/10 bg-white/2 px-10 py-6">
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
            <Clock className="h-4 w-4" />
            {isDone ? "Mining complete" : `${progress}% — ${statusText}`}
          </div>
          <button
            disabled={!isDone}
            onClick={() => router.push(`/dashboard/reports/${scraperId}`)}
            className="group flex items-center gap-2 border border-[#ff8a57] bg-[#ff4500] px-6 py-2.5 font-mono text-[12px] font-black tracking-widest text-white uppercase transition-colors disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/5 disabled:text-zinc-500"
          >
            {isDone
              ? "View Detailed Report"
              : hasFailed
                ? "Scan Failed"
                : "Processing..."}{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Pro Tip & Active Signals */}
      <div className="mt-8 flex w-full max-w-2xl flex-col gap-4">
        {customPatterns.length > 0 && (
          <div className="relative overflow-hidden border-2 border-amber-500/25 bg-amber-500/5 p-6">
            <div className="relative z-10">
              <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-amber-500 uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Active Custom Intelligence Signals
              </p>
              <div className="flex flex-wrap gap-2">
                {customPatterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400"
                  >
                    {pattern}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="relative flex items-start gap-4 overflow-hidden border-2 border-[#ff4500]/25 bg-[#ff4500]/5 p-6">
          <div className="relative z-10 border border-[#ff4500]/35 bg-[#ff4500]/10 p-2 text-[#ff4500]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="relative z-10">
            <p className="mb-1.5 flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
              Intelligence Protocol Active
            </p>
            <p className="text-[13px] leading-relaxed font-medium text-zinc-400">
              Our engine is specifically hunting for{" "}
              <span className="text-zinc-200">Pain Intensity</span>,{" "}
              <span className="text-zinc-200">Budgets</span>, and{" "}
              <span className="text-zinc-200">Switching Costs</span>. We ignore
              generic comments to find high-conviction market gaps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisSkeletonView() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-4xl flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <div className="relative flex h-20 w-20 items-center justify-center border border-[#ff4500]/35 bg-[#0c0c0c] shadow-[3px_3px_0px_0px_rgba(255,69,0,0.2)]">
          <div className="h-10 w-10 animate-pulse rounded-full border border-[#ff4500]/45 bg-[#ff4500]/12"></div>
        </div>
      </div>

      <div className="mb-12 text-center">
        <Skeleton className="mx-auto mb-4 h-11 w-80 rounded-none bg-white/10" />
        <Skeleton className="mx-auto h-5 w-96 max-w-full rounded-none bg-white/8" />
        <Skeleton className="mx-auto mt-4 h-3 w-36 rounded-none bg-amber-500/12" />
      </div>

      <div className="relative w-full overflow-hidden border-2 border-white/15 bg-[#111] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-[#ff4500]/20 to-transparent"></div>

        <div className="space-y-10 p-10">
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <Skeleton className="h-3 w-28 rounded-none bg-white/8" />
              <Skeleton className="h-7 w-14 rounded-none bg-[#ff4500]/12" />
            </div>
            <div className="h-2 w-full overflow-hidden border border-white/10 bg-white/5">
              <div className="h-full w-1/3 animate-pulse bg-[#ff4500]/25"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#ff4500]/70"></div>
              <Skeleton className="h-3 w-48 rounded-none bg-white/8" />
            </div>
          </div>

          <div className="relative space-y-0">
            <div className="absolute top-6 bottom-6 left-[19px] w-px bg-white/10"></div>
            {Array.from({ length: 4 }).map((_, index) => (
              <AnalysisSkeletonStep key={index} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-white/2 px-10 py-6">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-4 rounded-full bg-white/8" />
            <Skeleton className="h-3 w-40 rounded-none bg-white/8" />
          </div>
          <Skeleton className="h-10 w-44 rounded-none bg-[#ff4500]/12" />
        </div>
      </div>

      <div className="relative mt-8 flex w-full max-w-2xl items-start gap-4 overflow-hidden border-2 border-[#ff4500]/25 bg-[#ff4500]/5 p-6">
        <Skeleton className="h-10 w-10 rounded-none border border-[#ff4500]/35 bg-[#ff4500]/12" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-44 rounded-none bg-[#ff4500]/12" />
          <Skeleton className="h-4 w-full rounded-none bg-white/8" />
          <Skeleton className="h-4 w-5/6 rounded-none bg-white/8" />
        </div>
      </div>
    </div>
  );
}

function AnalysisSkeletonStep() {
  return (
    <div className="flex gap-6 p-5">
      <div className="relative z-10">
        <div className="flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5">
          <div className="h-4 w-4 animate-pulse rounded-full bg-[#ff4500]/55"></div>
        </div>
      </div>
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <Skeleton className="h-6 w-52 rounded-none bg-white/10" />
          <Skeleton className="h-5 w-20 rounded-none bg-[#ff4500]/12" />
        </div>
        <Skeleton className="mb-2 h-4 w-full max-w-lg rounded-none bg-white/8" />
        <Skeleton className="h-4 w-4/5 max-w-md rounded-none bg-white/8" />
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
          className={`flex h-10 w-10 items-center justify-center border transition-all duration-500 ${
            status === "completed"
              ? "border-emerald-400/45 bg-emerald-500/10 text-emerald-300"
              : status === "in-progress"
                ? "animate-pulse border-[#ff4500]/70 bg-[#ff4500]/20 text-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.35)]"
                : "border-white/15 bg-white/5 text-zinc-600"
          }`}
        >
          {status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-3">
          <p
            className={`text-lg font-black tracking-tight ${status === "pending" ? "text-zinc-500" : "text-zinc-100"}`}
          >
            {title}
          </p>
          {status === "completed" && (
            <span className="border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-black tracking-widest text-emerald-300 uppercase">
              Analyzed
            </span>
          )}
          {status === "in-progress" && (
            <span className="border border-[#ff4500]/40 bg-[#ff4500]/10 px-2 py-0.5 font-mono text-[9px] font-black tracking-widest text-[#ff4500] uppercase">
              In Progress
            </span>
          )}
        </div>
        <p className="max-w-lg text-sm leading-relaxed font-medium text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}
