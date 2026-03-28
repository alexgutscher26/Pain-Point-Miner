"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Clock,
  RefreshCcw,
  ExternalLink,
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
      <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((key) => (
          <div key={key} className="h-32 border-2 border-white/10 bg-white/5" />
        ))}
        <div className="h-80 border-2 border-white/10 bg-white/5 md:col-span-2" />
        <div className="h-80 border-2 border-white/10 bg-white/5" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="border-2 border-white/10 bg-[#111] p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <Activity className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
        <h3 className="mb-2 text-xl font-black tracking-tight text-white uppercase">
          No Health Data Available
        </h3>
        <p className="mx-auto max-w-sm font-mono text-xs tracking-widest text-zinc-500 uppercase">
          Initiate your first investigation to begin tracking operational
          metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="mb-2 text-2xl leading-none font-black tracking-tight text-white">
            Scraper Health & Reliability
          </h3>
          <p className="text-sm font-medium text-zinc-400">
            Real-time monitoring of Reddit API performance and ingestion status.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="border border-white/10 bg-white/5 p-3 text-white transition-colors hover:bg-white/10"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <HealthCard
          title="Overall Success Rate"
          value={`${stats.successRate}%`}
          subtext="Last 7 days of scheduled jobs"
          icon={
            <CheckCircle2
              className={
                stats.successRate > 90 ? "text-emerald-400" : "text-amber-400"
              }
            />
          }
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Trend Chart */}
        <div className="border-2 border-white/10 bg-[#111] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <h4 className="flex items-center gap-3 text-lg font-black text-white">
              <TrendingUp className="h-5 w-5 text-[#ff4500]" />
              Discovery & Ingestion Trend
            </h4>
            <div className="flex items-center gap-4 font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-[#ff4500]"></div>
                <span>Pain Points Found</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-blue-500"></div>
                <span>Success Rate (%)</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyTrend}>
                <defs>
                  <linearGradient
                    id="colorDiscovery"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ff4500" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff4500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff05"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#555"
                  fontSize={10}
                  tickFormatter={(val) => val.split("-").slice(1).join("/")}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161616",
                    border: "1px solid #333",
                    fontSize: "10px",
                    fontFamily: "monospace",
                  }}
                  itemStyle={{ color: "#fff" }}
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
        <div className="border-2 border-white/10 bg-[#111] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
          <h4 className="mb-6 flex items-center gap-3 text-lg font-black text-white">
            <Clock className="h-5 w-5 text-amber-400" />
            Top Subreddits
          </h4>
          <div className="space-y-4">
            {stats.subHealth.map((sub) => (
              <div key={sub.subreddit} className="group">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] font-bold text-white transition-colors group-hover:text-[#ff4500]">
                    r/{sub.subreddit}
                    <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span
                    className={`font-mono text-[10px] font-black ${sub.successRate > 90 ? "text-emerald-400" : sub.successRate > 70 ? "text-amber-400" : "text-rose-400"}`}
                  >
                    {sub.successRate}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden border border-white/5 bg-white/5">
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

function HealthCard({
  title,
  value,
  subtext,
  icon,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden border-2 border-white/12 bg-[#111] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.65)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="border border-white/15 bg-white/5 p-2.5 transition-transform group-hover:scale-105">
          {icon}
        </div>
      </div>
      <div>
        <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          {title}
        </p>
        <p className="mb-1 text-3xl font-black tracking-tight text-white">
          {value}
        </p>
        <p className="font-mono text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
          {subtext}
        </p>
      </div>
    </div>
  );
}
