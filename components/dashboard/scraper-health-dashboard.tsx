"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  BarChart3, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  RefreshCcw,
  ExternalLink
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
} from "recharts";

type HealthStats = {
  subHealth: {
    subreddit: string;
    successRate: number;
    totalRequests: number;
  }[];
  avgPostsPerScan: number;
  dailyTrend: {
    date: string;
    runs: number;
    successRate: number;
    discovery: number;
  }[];
  totalScans: number;
  successRate: number;
};

export function ScraperHealthDashboard() {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats/health");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch health stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((key) => (
          <div key={key} className="h-32 bg-white/5 border-2 border-white/10" />
        ))}
        <div className="md:col-span-2 h-80 bg-white/5 border-2 border-white/10" />
        <div className="h-80 bg-white/5 border-2 border-white/10" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">
            Scraper Health & Reliability
          </h3>
          <p className="text-zinc-400 text-sm font-medium">
            Real-time monitoring of Reddit API performance and ingestion status.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthCard 
          title="Overall Success Rate" 
          value={`${stats.successRate}%`}
          subtext="Last 7 days of scheduled jobs"
          icon={<CheckCircle2 className={stats.successRate > 90 ? "text-emerald-400" : "text-amber-400"} />}
        />
        <HealthCard 
          title="Avg Posts Per Scan" 
          value={stats.avgPostsPerScan.toString()}
          subtext="Volume of data ingested per run"
          icon={<BarChart3 className="text-[#ff4500]" />}
        />
        <HealthCard 
          title="Total API Operations" 
          value={stats.totalScans.toString()}
          subtext="Unique investigation runs executed"
          icon={<Activity className="text-blue-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-[#111] border-2 border-white/10 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-white text-lg flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[#ff4500]" />
              Discovery & Ingestion Trend
            </h4>
            <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#ff4500]"></div>
                <span>Pain Points Found</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500"></div>
                <span>Success Rate (%)</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyTrend}>
                <defs>
                  <linearGradient id="colorDiscovery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4500" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff4500" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#555" 
                  fontSize={10} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161616', border: '1px solid #333', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="discovery" 
                  stroke="#ff4500" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorDiscovery)" 
                  name="Pain Points"
                />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  dot={false}
                  name="Success Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subreddit Performance */}
        <div className="bg-[#111] border-2 border-white/10 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
          <h4 className="font-black text-white text-lg mb-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            Top Subreddits
          </h4>
          <div className="space-y-4">
            {stats.subHealth.map((sub) => (
              <div key={sub.subreddit} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-white group-hover:text-[#ff4500] transition-colors cursor-pointer flex items-center gap-1.5">
                    r/{sub.subreddit}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className={`font-mono text-[10px] font-black ${sub.successRate > 90 ? "text-emerald-400" : sub.successRate > 70 ? "text-amber-400" : "text-rose-400"}`}>
                    {sub.successRate}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 border border-white/5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${sub.successRate > 90 ? "bg-emerald-500" : sub.successRate > 70 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${sub.successRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthCard({ title, value, subtext, icon }: { title: string; value: string; subtext: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#111] p-6 border-2 border-white/12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.65)] relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-white/5 border border-white/15 group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
          {title}
        </p>
        <p className="text-3xl font-black text-white tracking-tight mb-1">
          {value}
        </p>
        <p className="font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
          {subtext}
        </p>
      </div>
    </div>
  );
}
