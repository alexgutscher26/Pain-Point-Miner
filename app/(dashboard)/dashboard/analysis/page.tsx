"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Eye, 
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  BrainCircuit,
  BarChart4
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface ScraperRunInfo {
  status: string;
  postsFetched: number;
}

interface ScraperStatusData {
  scraper: {
    id: string;
    keywords: string[];
    subreddits: string[];
    miningDepth?: string;
  };
  latestRun: ScraperRunInfo | null;
  painPointCount: number;
  status: string;
}

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scraperId = searchParams.get("id");

  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("Initializing Reddit data pipeline...");
  const [isDone, setIsDone] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [stats, setStats] = useState<ScraperStatusData | null>(null);

  // Poll for status
  useEffect(() => {
    if (!scraperId) return;

    let isActive = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/search/status?id=${scraperId}`);
        if (!response.ok) throw new Error("Status check failed");
        
        const data = await response.json();
        if (!isActive) return;
        setStats(data);

        // Map status to progress (This is a simplified approach)
        if (data.status === 'completed') {
          setProgress(100);
          setStatusText("Analysis complete. Found " + data.painPointCount + " pain points.");
          setIsDone(true);
          setHasFailed(false);
          clearInterval(pollInterval);
        } else if (data.status === "failed" || data.status === "canceled") {
          setProgress((prev) => Math.max(prev, 95));
          setStatusText(
            data.status === "failed"
              ? "Analysis failed. Please retry this scan."
              : "Analysis was canceled."
          );
          setHasFailed(true);
          clearInterval(pollInterval);
        } else {
          // Increment progress slightly while waiting
          setProgress((prev) => (prev < 90 ? prev + 5 : prev));
          setStatusText("Processing posts and comments...");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    return () => {
      isActive = false;
      clearInterval(pollInterval);
    };
  }, [scraperId]);

  // Derived step status
  const steps = useMemo(() => {
    const isSuccess = stats?.status === 'completed';
    const hasPoints = (stats?.painPointCount || 0) > 0;
    
    return [
      {
        icon: <Search className="w-4 h-4" />,
        title: "Collecting Reddit posts...",
        description: stats?.latestRun 
          ? `Found ${stats.latestRun.postsFetched} posts across targeting subreddits.` 
          : "Analyzing search relevance...",
        status: stats ? 'completed' : 'in-progress'
      },
      {
        icon: <BrainCircuit className="w-4 h-4" />,
        title: "Extracting pain points...",
        description: hasPoints 
          ? `Discovered ${stats?.painPointCount} unique frustration markers.` 
          : "AI is reading content for intensity and budget...",
        status: hasPoints ? 'completed' : (stats ? 'in-progress' : 'pending')
      },
      {
        icon: <Sparkles className="w-4 h-4" />,
        title: "Grouping repeated themes...",
        description: isSuccess 
          ? "Clustered insights into high-value opportunities." 
          : "Structuring data hierarchies for the final report...",
        status: (isSuccess && hasPoints) ? 'completed' : (hasPoints ? 'in-progress' : 'pending')
      },
      {
        icon: <BarChart4 className="w-4 h-4" />,
        title: "Finalizing Report...",
        description: isSuccess 
          ? "Scoring market viability and difficulty scores." 
          : "Preparing your analysis dashboard...",
        status: isSuccess ? 'completed' : ((isSuccess || hasPoints) ? 'in-progress' : 'pending')
      }
    ];
  }, [stats]);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full flex flex-col items-center min-h-[calc(100vh-10rem)] justify-center">
      {/* Top Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#ff4500] blur-3xl opacity-20 scale-150 animate-pulse"></div>
        <div className="relative w-20 h-20 bg-[#0c0c0c] rounded-3xl flex items-center justify-center text-[#ff4500] border border-[#ff4500]/30 shadow-2xl">
           <Eye className="w-10 h-10 animate-pulse" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white tracking-tight mb-4 uppercase">
          Mining Market Secrets
        </h2>
        <p className="text-zinc-500 font-medium text-lg">
          Our specialized algorithms are decoding the Reddit pulse for you.
        </p>
      </div>

      {/* Progress Card */}
      <div className="w-full bg-[#111] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#ff4500]/20 to-transparent"></div>
        
        <div className="p-10 space-y-10">
          {/* Overall Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Analysis Progress</p>
               <p className="text-lg font-black text-[#ff4500]">{progress}%</p>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[#ff4500] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,69,0,0.4)]"
                 style={{ width: `${progress}%` }}
               ></div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 italic">
               <div className="w-1 h-1 rounded-full bg-[#ff4500] animate-ping"></div>
               {statusText}
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="space-y-0 relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-white/5"></div>
            
            {steps.map((step, idx) => (
              <AnalysisStep 
                key={idx}
                icon={step.icon}
                title={step.title}
                description={step.description}
                status={step.status as 'completed' | 'in-progress' | 'pending'}
              />
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-10 py-6 bg-white/2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-600 text-[11px] font-bold uppercase tracking-widest">
             <Clock className="w-4 h-4" />
             {isDone ? "Mining complete" : (() => {
               const subCount = stats?.scraper.subreddits.length || 4;
               const depthMultiplier =
                 stats?.scraper.miningDepth === "advanced"
                   ? 5
                   : stats?.scraper.miningDepth === "deep"
                     ? 3
                     : 1;
               const totalSeconds = (subCount * 15) * depthMultiplier;
               return `Expected completion: ~${totalSeconds >= 60 
                ? `${Math.round(totalSeconds / 60)} minutes` 
                : `${totalSeconds} seconds`}`;
             })()}
          </div>
          <button 
            disabled={!isDone}
            onClick={() => router.push(`/dashboard/reports/${scraperId}`)}
            className="px-6 py-2.5 rounded-xl bg-[#ff4500] text-white text-[12px] font-black uppercase tracking-widest border border-[#ff4500]/30 flex items-center gap-2 disabled:bg-white/5 disabled:text-zinc-500 disabled:border-white/5 disabled:cursor-not-allowed group transition-all"
          >
            {isDone ? "View Detailed Report" : hasFailed ? "Scan Failed" : "Processing..."} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mt-8 w-full max-w-2xl bg-[#ff4500]/5 border border-[#ff4500]/10 rounded-2xl p-6 flex gap-4 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4500]/5 blur-3xl rounded-full"></div>
        <div className="p-2 bg-[#ff4500]/10 rounded-xl text-[#ff4500] relative z-10">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black text-[#ff4500] uppercase tracking-widest mb-1.5 flex items-center gap-2">
            Intelligence Protocol Active
          </p>
          <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">
            Our engine is specifically hunting for <span className="text-zinc-200">Pain Intensity</span>, <span className="text-zinc-200">Budgets</span>, and <span className="text-zinc-200">Switching Costs</span>. We ignore generic comments to find high-conviction market gaps.
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
  status 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  status: 'completed' | 'in-progress' | 'pending' 
}) {
  return (
    <div className={`flex gap-6 p-5 transition-all duration-500 ${status === 'pending' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
          status === 'completed' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
            : status === 'in-progress'
              ? 'bg-[#ff4500]/20 border-[#ff4500]/50 text-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.2)] animate-pulse'
              : 'bg-white/5 border-white/5 text-zinc-600'
        }`}>
          {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <p className={`text-lg font-black tracking-tight ${status === 'pending' ? 'text-zinc-500' : 'text-zinc-100'}`}>{title}</p>
          {status === 'completed' && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">Analyzed</span>
          )}
          {status === 'in-progress' && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#ff4500]/10 text-[#ff4500] rounded-full border border-[#ff4500]/20">In Progress</span>
          )}
        </div>
        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-lg">{description}</p>
      </div>
    </div>
  );
}
