import React from "react";
import { TrendingUp } from "lucide-react";

export function MetricCard({
  title,
  value,
  icon,
  progress,
  subtext,
  trend,
  trendSub,
  badge,
  isHighlight,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  progress?: number;
  subtext?: string;
  trend?: string;
  trendSub?: string;
  badge?: string;
  isHighlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-400 ${
        isHighlight
          ? "border border-[#ff4500]/25 bg-gradient-to-br from-white/95 to-orange-50/20 hover:scale-[1.01] hover:border-[#ff4500]/40 hover:shadow-md"
          : "glass-card glass-card-hover"
      }`}
    >
      {isHighlight && (
        <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-[#ff4500] opacity-[0.03] blur-[40px]"></div>
      )}
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`rounded-xl p-2 transition-all duration-300 group-hover:scale-105 ${
            isHighlight
              ? "bg-[#ff4500]/10 text-[#ff4500]"
              : "border border-black/[0.04] bg-black/[0.02] text-zinc-700"
          }`}
        >
          {icon}
        </div>
        {badge && (
          <span className="rounded-full border border-[#ff4500]/10 bg-[#ff4500]/5 px-2.5 py-0.5 font-mono text-[9px] font-black tracking-widest text-[#ff4500] uppercase">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="mb-1 font-mono text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-[28px] leading-none font-extrabold tracking-tight ${isHighlight ? "text-[#ff4500]" : "text-zinc-950"}`}
          >
            {value}
          </p>
          {trend && (
            <p className="flex items-center gap-0.5 text-[12px] font-black text-emerald-600">
              <TrendingUp className="h-3 w-3" /> {trend}
            </p>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80">
              <div
                className="h-full rounded-full bg-[#ff4500]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-2 font-mono text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase">
              {subtext}
            </p>
          </div>
        )}
        {trendSub && (
          <p className="mt-1.5 font-mono text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase">
            {trendSub}
          </p>
        )}
      </div>
    </div>
  );
}
