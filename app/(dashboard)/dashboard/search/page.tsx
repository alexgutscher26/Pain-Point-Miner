"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Rocket, 
  Zap, 
  Clock, 
  Target, 
  Lightbulb,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const [miningDepth, setMiningDepth] = useState<"basic" | "deep">("basic");

  const handleStartMining = () => {
    // In a real app, we would kick off the background job here
    router.push("/dashboard/analysis");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <div className="h-px w-8 bg-[#ff4500]"></div>
               <p className="text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">New Investigation</p>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-4">
              What are we looking for?
            </h2>
            <p className="text-zinc-500 font-medium text-sm max-w-xl">
              Define the niche or problem space you want to explore across Reddit communities. Our AI will extract high-intent pain points.
            </p>
          </div>

          <div className="space-y-8">
            {/* Keyword Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Keyword or Niche
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff4500]"></div>
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-[#ff4500] to-[#ff8c00] rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity blur-md"></div>
                <input 
                  type="text" 
                  placeholder="e.g. cold email, property management, SaaS churn"
                  className="w-full bg-[#0c0c0c] border border-white/5 rounded-xl px-4 py-4 text-white text-base font-medium focus:outline-none focus:border-[#ff4500]/30 transition-all placeholder:text-zinc-700 shadow-2xl"
                />
              </div>
            </div>

            {/* Subreddits Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Target Subreddits <span className="text-[9px] text-zinc-600">(Optional)</span>
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="r/sales, r/realestate, r/entrepreneur"
                  className="w-full bg-[#0c0c0c] border border-white/5 rounded-xl px-4 py-4 pl-12 text-white text-base font-medium focus:outline-none focus:border-[#ff4500]/30 transition-all placeholder:text-zinc-700 shadow-2xl"
                />
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                Leave blank to search all relevant communities across Reddit.
              </p>
            </div>

            {/* Mining Depth Selection */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">
                Mining Depth
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setMiningDepth("basic")}
                  className={`relative p-6 rounded-2xl border transition-all text-left flex items-start gap-4 overflow-hidden group ${
                    miningDepth === "basic" 
                      ? "bg-[#ff4500]/5 border-[#ff4500]/50 shadow-[0_0_30px_rgba(255,69,0,0.1)]" 
                      : "bg-[#0c0c0c] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${miningDepth === "basic" ? "bg-[#ff4500] text-white" : "bg-white/5 text-zinc-500"}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-black uppercase tracking-widest text-[12px] mb-1 ${miningDepth === "basic" ? "text-white" : "text-zinc-400"}`}>Basic Scan</p>
                    <p className="text-zinc-500 text-[11px] font-bold">Last 3 months, top 100 threads</p>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${miningDepth === "basic" ? "border-[#ff4500]" : "border-zinc-800"}`}>
                    {miningDepth === "basic" && <div className="w-2.5 h-2.5 rounded-full bg-[#ff4500]"></div>}
                  </div>
                </button>

                <button 
                  onClick={() => setMiningDepth("deep")}
                  className={`relative p-6 rounded-2xl border transition-all text-left flex items-start gap-4 overflow-hidden group ${
                    miningDepth === "deep" 
                      ? "bg-[#ff4500]/5 border-[#ff4500]/50 shadow-[0_0_30px_rgba(255,69,0,0.1)]" 
                      : "bg-[#0c0c0c] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${miningDepth === "deep" ? "bg-amber-500 text-white" : "bg-white/5 text-zinc-500"}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-black uppercase tracking-widest text-[12px] mb-1 ${miningDepth === "deep" ? "text-white" : "text-zinc-400"}`}>Deep Mine</p>
                    <p className="text-zinc-500 text-[11px] font-bold">Last 12 months, recursive comment scan</p>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${miningDepth === "deep" ? "border-[#ff4500]" : "border-zinc-800"}`}>
                    {miningDepth === "deep" && <div className="w-2.5 h-2.5 rounded-full bg-[#ff4500]"></div>}
                  </div>
                  {miningDepth !== "deep" && (
                    <div className="absolute top-0 right-0 p-2">
                       <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">Pro</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-zinc-600 text-[11px] font-bold uppercase tracking-widest">
                 <Clock className="w-4 h-4" />
                 Est. time: ~2 minutes
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none text-[12px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                  Save Draft
                </button>
                <button 
                  onClick={handleStartMining}
                  className="flex-1 sm:flex-none bg-[#ff4500] hover:bg-[#ff571a] text-white px-8 py-3.5 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#ff4500]/20 active:scale-95 group"
                >
                  Start Mining 
                  <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4500]/5 blur-3xl rounded-full"></div>
            <h4 className="font-black text-white text-lg mb-8 flex items-center gap-3 tracking-tight">
              <Zap className="w-6 h-6 text-[#ff4500]" />
              Expert Tips
            </h4>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#ff4500]/10 border border-[#ff4500]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight mb-1">Be Specific</p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">Instead of &quot;marketing&quot;, use &quot;B2B marketing for AI startups&quot;.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#ff4500]/10 border border-[#ff4500]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight mb-1">Focus on Frustration</p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">Our AI looks for patterns like &quot;I hate when...&quot; or &quot;Why is it so hard to...&quot;.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#ff4500]/10 border border-[#ff4500]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4500]" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight mb-1">Subreddit Context</p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">Narrowing down to specific niche subreddits gives higher quality pain points.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-b from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h4 className="font-black text-white text-lg mb-6 tracking-tight flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Example Queries
            </h4>
            
            <div className="space-y-3">
              <ExampleCard 
                query="&quot;remote team collaboration&quot;" 
                insight="Found 43 high-intent pain points"
              />
              <ExampleCard 
                query="&quot;shopify app development&quot;" 
                insight="Focus on API limits & documentation"
              />
              <ExampleCard 
                query="&quot;pet grooming business&quot;" 
                insight="Highlighting scheduling conflicts"
              />
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="p-4 bg-white/3 rounded-2xl border border-white/5">
                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                  Need custom parameters? Check our <span className="text-white font-black underline cursor-pointer">Documentation</span> for advanced operators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExampleCard({ query, insight }: { query: string; insight: string }) {
  return (
    <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl hover:border-[#ff4500]/30 transition-all cursor-pointer group/card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-bold text-[#ff4500]">{query}</p>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover/card:text-white transition-colors" />
      </div>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{insight}</p>
    </div>
  );
}
