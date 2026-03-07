"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  Eye, 
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Search,
  BrainCircuit,
  BarChart4
} from "lucide-react";
import Link from "next/link";

export default function AnalysisPage() {
  const [progress, setProgress] = useState(65);
  const [status, setStatus] = useState("Refining data patterns based on current subreddit sentiment...");

  // Mock progress increment
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

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
        <h2 className="text-4xl font-black text-white tracking-tight mb-4">
          Analyzing Reddit Insights
        </h2>
        <p className="text-zinc-500 font-medium text-lg">
          We&apos;re mining subreddits to identify high-value opportunities for you.
        </p>
      </div>

      {/* Progress Card */}
      <div className="w-full bg-[#111] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#ff4500]/20 to-transparent"></div>
        
        <div className="p-10 space-y-10">
          {/* Overall Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Overall Progress</p>
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
               {status}
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="space-y-0 relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-white/5"></div>
            
            <AnalysisStep 
              icon={<Search className="w-4 h-4" />}
              title="Collecting Reddit posts..."
              description="Successfully scanned 12 subreddits and archived 4,200 comments."
              status="completed"
            />
            
            <AnalysisStep 
              icon={<BrainCircuit className="w-4 h-4" />}
              title="Extracting pain points..."
              description="AI engine is identifying frustration markers and common complaints."
              status="in-progress"
            />
            
            <AnalysisStep 
              icon={<Sparkles className="w-4 h-4" />}
              title="Grouping repeated themes..."
              description="Clustering individual points into high-level opportunity categories."
              status="pending"
            />
            
            <AnalysisStep 
              icon={<BarChart4 className="w-4 h-4" />}
              title="Scoring opportunities..."
              description="Calculating market viability and difficulty scores for each segment."
              status="pending"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="px-10 py-6 bg-white/2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-600 text-[11px] font-bold uppercase tracking-widest">
             <Clock className="w-4 h-4" />
             Expected completion: ~45 seconds
          </div>
          <button 
            disabled 
            className="px-6 py-2.5 rounded-xl bg-white/5 text-zinc-500 text-[12px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2 disabled:cursor-not-allowed group transition-all"
          >
            View Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mt-8 w-full max-w-2xl bg-[#ff4500]/5 border border-[#ff4500]/10 rounded-2xl p-4 flex gap-4 items-start">
         <div className="p-1.5 bg-[#ff4500]/10 rounded-lg text-[#ff4500]">
            <Info className="w-4 h-4" />
         </div>
         <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">
            <span className="text-[#ff4500] font-black uppercase text-[11px] tracking-wider mr-2">Pro Tip:</span>
            You can safely navigate away from this page. We&apos;ll email you once the report is generated.
         </p>
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
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">Completed</span>
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
