"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Calendar, 
  Filter, 
  Star, 
  MoreVertical, 
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Database
} from "lucide-react";
import Link from "next/link";

interface Report {
    id: string;
    niche: string;
    date: string;
    painPoints: number;
    score: number;
    status: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-px w-8 bg-[#ff4500]"></div>
             <p className="text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">Investigation Archives</p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
            Reports History
          </h2>
          <p className="text-zinc-500 font-medium text-sm">Manage and analyze your past Reddit mining sessions.</p>
        </div>
        <Link 
          href="/dashboard/search" 
          className="bg-[#ff4500] hover:bg-[#ff571a] text-white px-6 py-3 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff4500]/20 active:scale-95 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          New Search
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#0c0c0c] p-2 rounded-2xl border border-white/5">
        <FilterButton icon={<Calendar className="w-4 h-4" />} label="Last 30 Days" />
        <FilterButton icon={<Filter className="w-4 h-4" />} label="Status: All" />
        <FilterButton icon={<Star className="w-4 h-4" />} label="Min Score: 70+" />
        <div className="ml-auto px-4 hidden sm:block">
           <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
             {isLoading ? "Counting records..." : `Showing ${reports.length} results`}
           </p>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <Loader2 className="w-8 h-8 text-[#ff4500] animate-spin" />
               <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Decrypting Archives...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
               <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5">
                  <Database className="w-8 h-8 text-zinc-700" />
               </div>
               <div className="space-y-2">
                 <p className="text-white font-black text-xl tracking-tight">No investigations found.</p>
                 <p className="text-zinc-500 text-sm max-w-[300px] font-medium mx-auto">Start your first mining session to see high-value SaaS opportunities here.</p>
               </div>
               <Link 
                 href="/dashboard/search" 
                 className="px-6 py-2.5 rounded-xl border border-[#ff4500]/30 text-[#ff4500] font-black text-[12px] uppercase tracking-widest hover:bg-[#ff4500]/10 transition-all"
               >
                 Start Mining
               </Link>
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Keyword / Niche</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Created Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Pain Points</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Top Score</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map((report) => (
                <tr key={report.id} className="group hover:bg-white/2 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner bg-[#ff4500]/5 text-[#ff4500]`}>
                        <Search className="w-4 h-4" />
                      </div>
                      <p className="font-black text-white text-[15px] tracking-tight group-hover:text-[#ff4500] transition-colors uppercase">{report.niche}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-zinc-400 text-sm font-medium">{report.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-black text-sm">{report.painPoints}</p>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[12px] font-black tracking-tighter ${
                      report.score >= 90 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    }`}>
                      {report.score}/100
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5">
                      {report.status === "Completed" ? (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                          <span className="text-[11px] font-black uppercase tracking-widest">Analyzed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#ff4500]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-[11px] font-black uppercase tracking-widest animate-pulse">Mining...</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link 
                        href={`/dashboard/reports/${report.id}`}
                        className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-[#ff4500] hover:border-[#ff4500] transition-all shadow-lg active:scale-95 group/btn"
                      >
                         <span className="flex items-center gap-2">
                           View Report
                           <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                         </span>
                      </Link>
                      <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-white/1 border-t border-white/5 flex items-center justify-between">
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
             Showing {reports.length} of {reports.length} reports
          </p>
          <div className="flex items-center gap-1.5">
             <PaginationButton disabled icon={<ChevronLeft className="w-4 h-4" />} />
             <PaginationButton active label="1" />
             <PaginationButton icon={<ChevronRight className="w-4 h-4" />} />
          </div>
        </div>
      </div>

      {/* Pro CTA Banner */}
      <div className="relative group p-10 rounded-[32px] overflow-hidden bg-[#0c0c0c] border border-white/5 text-center shadow-2xl">
        <div className="absolute inset-0 bg-[#ff4500]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h3 className="text-2xl font-black text-white tracking-tight">Looking for deeper insights?</h3>
          <p className="text-zinc-500 font-medium leading-relaxed">
            Get unlimited searches, AI-powered pain point summarization, and direct Slack integration with the <span className="text-white font-black underline cursor-pointer decoration-[#ff4500] underline-offset-4">Enterprise Plan</span>.
          </p>
          <div className="pt-4">
            <button className="bg-white hover:bg-zinc-200 text-black px-10 py-3.5 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all shadow-xl hover:shadow-white/10 active:scale-95">
               Talk to Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="px-4 py-2.5 rounded-xl bg-[#111] border border-white/5 text-[12px] font-bold text-zinc-400 hover:text-white hover:border-white/10 transition-all flex items-center gap-2 group">
       <span className="text-zinc-500 group-hover:text-[#ff4500] transition-colors">{icon}</span>
       {label}
       <span className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity">
         <ChevronRight className="w-3.5 h-3.5 rotate-90" />
       </span>
    </button>
  );
}

function PaginationButton({ label, icon, active = false, disabled = false }: { label?: string, icon?: React.ReactNode, active?: boolean, disabled?: boolean }) {
  return (
    <button 
      disabled={disabled}
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black transition-all border ${
        active 
          ? "bg-[#ff4500] border-[#ff4500] text-white shadow-lg shadow-[#ff4500]/20" 
          : disabled 
            ? "border-white/5 text-zinc-800 opacity-50 cursor-not-allowed"
            : "border-white/5 text-zinc-500 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon || label}
    </button>
  );
}
