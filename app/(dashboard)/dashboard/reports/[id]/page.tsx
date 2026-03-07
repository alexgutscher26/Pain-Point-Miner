"use client";

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
  MessageCircle,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
export default function ReportDetailPage() {
  // Mock data for the specific report
  const reportData = {
    title: "Cold Email Automation",
    date: "Oct 24, 2023",
    metrics: [
      { label: "Pain Points", value: "142", sub: "+12 this week", icon: <AlertTriangle className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "Posts Analyzed", value: "4,200", sub: "From 12 subreddits", icon: <MessageSquare className="w-4 h-4" />, color: "text-purple-500", bg: "bg-purple-500/10" },
      { label: "Opportunity Score", value: "92/100", sub: "Very High Potential", icon: <Star className="w-4 h-4" />, color: "text-[#ff4500]", bg: "bg-[#ff4500]/10" },
      { label: "Top Source", value: "r/sales", sub: "45% of total volume", icon: <Users className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ],
    topPainPoints: [
      {
        title: "Deliverability issues with new domains",
        urgency: "High Urgency",
        mentions: 88,
        description: "Users are frustrated with rapid blacklisting despite following warm-up protocols. The standard advice is no longer working as effectively.",
        subreddits: ["r/sales", "r/entrepreneur"],
        sentiment: "Negative",
        communityVoices: [
          "My domains are burning in 2 days even with 3 weeks of Instantly warm-up. Google's spam filters are getting insanely aggressive lately.",
          "Anyone else notice that .com domains aren't safe either? I'm spending more time setting up tech than actually selling."
        ],
        language: ["Burning domains in days", "Aggressive spam filters", "Warm-up protocols failing"],
        angles: ["Automated domain rotation service", "Deliverability health dashboard", "AI-driven 'soft-touch' content"]
      },
      {
        title: "Personalization scaling burnout",
        urgency: "Medium Urgency",
        mentions: 64,
        description: "SDRs are struggling to balance quality personalization with volume requirements from management. Tools aren't helping enough.",
        subreddits: ["r/sales"],
        sentiment: "Negative",
        communityVoices: [
          "I'm expected to send 100 high-quality emails a day. It's impossible without sounding like a robot.",
        ],
        language: ["Personalization at scale", "Quality vs Quantity", "SDR burnout"],
        angles: ["Hyper-personalized AI icebreakers", "Research-as-a-Service", "Scaling quality outreach"]
      }
    ]
  };

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
          <h2 className="text-4xl font-black text-white tracking-tighter">
            Analysis: <span className="text-[#ff4500]">{reportData.title}</span>
          </h2>
          <div className="flex items-center gap-2 text-zinc-500 font-bold text-[12px] uppercase tracking-widest">
             <ShieldCheck className="w-3.5 h-3.5" />
             Scanned on {reportData.date}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
             Save Report
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
             Export Data
          </button>
          <button className="bg-[#ff4500] hover:bg-[#ff571a] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#ff4500]/20 active:scale-95 group">
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
                {metric.icon}
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-white tracking-tight">{metric.value}</h4>
              <p className={`text-[11px] font-bold ${metric.color === 'text-[#ff4500]' ? 'text-zinc-600' : metric.color}`}>{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pain Points */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ff4500]" />
              Top Pain Points Identified
            </h3>
            <button className="text-[11px] font-black text-[#ff4500] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
               View All Map
            </button>
          </div>

          <div className="space-y-6">
            {reportData.topPainPoints.map((pain, idx) => (
              <div key={idx} className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 space-y-8 hover:border-[#ff4500]/20 transition-all group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4500]/2 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                
                {/* Pain Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-2xl font-black text-white tracking-tight group-hover:text-[#ff4500] transition-colors">{pain.title}</h4>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        pain.urgency === 'High Urgency' 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {pain.urgency}
                      </span>
                    </div>
                    <p className="text-zinc-400 font-medium leading-relaxed max-w-2xl">
                      {pain.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
                       {pain.subreddits.map((sub, i) => (
                         <div key={i} className="flex items-center gap-1.5 text-zinc-500">
                           <Users className="w-3.5 h-3.5" />
                           {sub}
                         </div>
                       ))}
                       <div className="flex items-center gap-1.5 text-rose-500">
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                         Sentiment: {pain.sentiment}
                       </div>
                    </div>
                  </div>
                  <div className="text-center md:text-right shrink-0">
                     <p className="text-4xl font-black text-white">{pain.mentions}</p>
                     <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Mentions Found</p>
                  </div>
                </div>

                {/* Community Voices */}
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Community Voices</p>
                   {pain.communityVoices.map((voice, i) => (
                    <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl relative">
                      <MessageCircle className="absolute -top-1.5 -left-1.5 w-6 h-6 text-[#ff4500]/40" />
                      <p className="text-[14px] text-zinc-300 italic font-medium leading-relaxed">
                        &quot;{voice}&quot;
                      </p>
                    </div>
                   ))}
                </div>

                {/* Insight Grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                       <BarChart3 className="w-4 h-4" /> Language to Use
                    </p>
                    <div className="space-y-2">
                       {pain.language.map((lang, i) => (
                         <div key={i} className="flex items-center gap-3 text-zinc-400 font-medium">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div>
                           &quot;{lang}&quot;
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
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
           <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 space-y-8">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Filter className="w-4 h-4 text-[#ff4500]" />
                  Refine Results
                </h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sort By</label>
                    <select className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4500]/50 transition-colors appearance-none">
                      <option>Most Mentions</option>
                      <option>Highest Urgency</option>
                      <option>Sentiment Score</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Timeframe</label>
                    <select className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4500]/50 transition-colors appearance-none">
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                      <option>All Time</option>
                    </select>
                  </div>
                  <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl">
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Validation Signals */}
              <div className="pt-8 border-t border-white/5">
                <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Validation Signals
                </h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black mb-2">
                      <span className="text-zinc-400 uppercase">Total Upvotes</span>
                      <span className="text-white tracking-widest">12.4k</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff4500] w-[85%]"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black mb-2">
                      <span className="text-zinc-400 uppercase">Comment Volume</span>
                      <span className="text-white tracking-widest">3,820</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[62%]"></div>
                    </div>
                  </div>
                </div>
              </div>
           </div>

           {/* Pro Unlock Card */}
           <div className="relative group rounded-[32px] overflow-hidden bg-linear-to-br from-[#111] to-black border border-white/5 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4500]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-[#ff4500] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#ff4500]/20">
                   <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white tracking-tight">Unlock Deep Insights</h4>
                  <p className="text-[13px] text-zinc-500 font-medium leading-relaxed">
                    See historical trends, competitor mentions, and direct lead lists from these discussions.
                  </p>
                </div>
                <button className="w-full bg-[#ff4500] hover:bg-[#ff571a] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-[#ff4500]/10">
                   Upgrade to Pro
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
