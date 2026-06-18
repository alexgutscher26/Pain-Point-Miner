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
  Loader2,
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

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200/50 bg-white/80 p-3.5 shadow-lg backdrop-blur-md animate-in fade-in duration-200">
        <p className="mb-2 font-mono text-[10px] font-bold text-zinc-400 uppercase">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((item: any) => (
            <div key={item.name} className="flex items-center gap-4 justify-between">
              <span className="flex items-center gap-1.5 font-sans text-xs font-semibold text-zinc-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-mono text-xs font-bold text-zinc-900">
                {item.value}
                {item.name === "Success Rate" ? "%" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

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
          <div key={key} className="h-36 rounded-2xl glass-card border border-zinc-200/30" />
        ))}
        <div className="h-96 rounded-2xl glass-card border border-zinc-200/30 md:col-span-2" />
        <div className="h-96 rounded-2xl glass-card border border-zinc-200/30" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center border border-zinc-200/50">
        <Activity className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
        <h3 className="mb-2 text-xl font-extrabold tracking-tight text-zinc-900 uppercase">
          No Health Data Available
        </h3>
        <p className="mx-auto max-w-sm font-mono text-xs tracking-widest text-zinc-400 uppercase">
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
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900">
            Scraper Health & Reliability
          </h3>
          <p className="mt-1 text-sm font-medium text-zinc-500">
            Real-time monitoring of Reddit API performance and ingestion status.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="cursor-pointer inline-flex items-center justify-center rounded-full border border-zinc-200/50 bg-white/60 p-3 text-zinc-600 transition-all duration-300 hover:bg-[#ff4500]/5 hover:border-[#ff4500]/30 hover:text-[#ff4500] hover:scale-105 active:scale-95 shadow-xs"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <HealthCard
          title="Overall Success Rate"
          value={`${stats.successRate}%`}
          subtext="Last 7 days of scheduled jobs"
          variant="success"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <HealthCard
          title="Avg Posts Per Scan"
          value={stats.avgPostsPerScan.toString()}
          subtext="Volume of data ingested per run"
          variant="warning"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <HealthCard
          title="Total API Operations"
          value={stats.totalScans.toString()}
          subtext="Unique investigation runs executed"
          variant="info"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Trend Chart */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl lg:col-span-2">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h4 className="flex items-center gap-2.5 text-lg font-extrabold text-zinc-900">
              <TrendingUp className="h-5 w-5 text-[#ff4500]" />
              Discovery & Ingestion Trend
            </h4>
            <div className="flex items-center gap-4 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff4500]"></div>
                <span>Pain Points Found</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]"></div>
                <span>Success Rate (%)</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={stats.dailyTrend}>
                <defs>
                  <linearGradient
                    id="colorDiscovery"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ff4500" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ff4500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#00000008"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => val.split("-").slice(1).join("/")}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
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
        <div className="glass-card p-6 sm:p-8 rounded-2xl">
          <h4 className="mb-6 flex items-center gap-2.5 text-lg font-extrabold text-zinc-900">
            <Clock className="h-5 w-5 text-[#ff4500]" />
            Top Subreddits
          </h4>
          <div className="space-y-4">
            {stats.subHealth.map((sub) => (
              <div key={sub.subreddit} className="group">
                <div className="mb-1.5 flex items-center justify-between">
                  <a
                    href={`https://reddit.com/r/${sub.subreddit}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer items-center gap-1.5 font-mono text-[12px] font-extrabold text-zinc-800 transition-colors group-hover:text-[#ff4500]"
                  >
                    r/{sub.subreddit}
                    <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                  <span
                    className={`font-mono text-[11px] font-extrabold ${
                      sub.successRate > 90
                        ? "text-emerald-600"
                        : sub.successRate > 70
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {sub.successRate}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      sub.successRate > 90
                        ? "bg-emerald-500"
                        : sub.successRate > 70
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
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
  variant,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  variant: "success" | "warning" | "info";
}) {
  const iconColors = {
    success: "border-emerald-500/15 bg-emerald-500/5 text-emerald-600",
    warning: "border-[#ff4500]/15 bg-[#ff4500]/5 text-[#ff4500]",
    info: "border-blue-500/15 bg-blue-500/5 text-blue-600",
  };

  return (
    <div className="group relative overflow-hidden glass-card glass-card-hover p-6 rounded-2xl">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-xl border p-2.5 transition-colors duration-300 ${iconColors[variant]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-zinc-550 uppercase">
          {title}
        </p>
        <p className="mb-1 text-3xl font-extrabold tracking-tight text-zinc-900">
          {value}
        </p>
        <p className="font-mono text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
          {subtext}
        </p>
      </div>
    </div>
  );
}

