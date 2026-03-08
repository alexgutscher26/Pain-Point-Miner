/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { 
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
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface PainPoint {
    id: string;
    title: string;
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

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Uncategorized");

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

  const iconMap: Record<string, React.ReactNode> = {
    AlertTriangle: <AlertTriangle className="w-4 h-4" />,
    MessageSquare: <MessageSquare className="w-4 h-4" />,
    Star: <Star className="w-4 h-4" />,
    Users: <Users className="w-4 h-4" />,
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
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all"
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
          <button className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
             Export Data
          </button>
          <button className="bg-[#ff4500] hover:bg-[#ff571a] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff4500]/20 active:scale-95 group min-w-[140px]">
             Run Again
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
            {reportData.topPainPoints.map((pain, idx) => (
              <div key={idx} className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 space-y-8 hover:border-[#ff4500]/20 transition-all group shadow-2xl relative overflow-hidden">
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

                {/* Algo Specific Intel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
                   <InfoSquare icon={<DollarSign className="w-3.5 h-3.5" />} label="Budget" value={pain.budget || "Unseen"} color="text-emerald-500" />
                   <InfoSquare icon={<ArrowRightLeft className="w-3.5 h-3.5" />} label="Switching" value={pain.switchingCosts || "Low friction"} color="text-amber-500" />
                   <InfoSquare icon={<Wrench className="w-3.5 h-3.5" />} label="Tried" value={pain.triedSolutions && pain.triedSolutions.length > 0 ? (pain.triedSolutions.length).toString() : "0"} color="text-blue-500" />
                   <InfoSquare icon={<TrendingUp className="w-3.5 h-3.5" />} label="Pay Signal" value={`${pain.monetization || 0}/10`} color="text-violet-500" />
                   <InfoSquare icon={<BarChart3 className="w-3.5 h-3.5" />} label="Stage" value={pain.maturity && pain.maturity < 4 ? "Blue Ocean" : pain.maturity && pain.maturity > 7 ? "Disruption" : "Scaling"} color="text-rose-500" />
                </div>

                {/* Community Voices */}
                <div className="space-y-4 relative z-10">
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Community Pulse</p>
                   {pain.communityVoices.map((voice, i) => (
                    <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl border-l-4 border-l-[#ff4500]">
                      <p className="text-[14px] text-zinc-300 italic font-medium leading-relaxed">
                        &quot;{voice}&quot;
                      </p>
                    </div>
                   ))}
                </div>

                {/* Insight Grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
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
              </div>
            ))}
          </div>
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
                    <select className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4500]/50 transition-colors appearance-none font-bold">
                      <option>All Intensity Levels</option>
                      <option>High Core Pain (8+)</option>
                      <option>Medium Friction (5+)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sentiment Filter</label>
                    <select className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4500]/50 transition-colors appearance-none font-bold">
                      <option>All Sentiment Types</option>
                      <option>Frustrated / Desperate</option>
                      <option>Neutral Explorations</option>
                    </select>
                  </div>
                  <button className="w-full bg-[#ff4500] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#ff571a] transition-all active:scale-[0.98] shadow-lg shadow-[#ff4500]/20">
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
                     <p className="text-xs text-zinc-400 font-medium leading-relaxed">{opp.problemStatement}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ICP: {opp.targetCustomer}</p>
                     <p className="text-xs text-zinc-300 font-medium leading-relaxed">{opp.valueProposition}</p>
                     <p className="text-[11px] text-zinc-500 font-bold leading-relaxed">{opp.launchAngle}</p>
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
        <div className="bg-white/2 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-zinc-900 border border-white/5 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</p>
                <p className={`text-sm font-black text-white uppercase truncate max-w-[120px]`}>{value}</p>
            </div>
        </div>
    );
}
