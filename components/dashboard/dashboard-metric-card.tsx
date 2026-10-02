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
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
        isHighlight
          ? "border-[#ff4500]/40 bg-white shadow-sm ring-1 ring-[#ff4500]/10 dark:border-[#ff4500]/40 dark:bg-zinc-900"
          : "border-zinc-200/90 bg-white shadow-2xs hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      }`}
    >
      {isHighlight && (
        <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-[#ff4500]/5 blur-2xl" />
      )}
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
            isHighlight
              ? "bg-[#ff4500]/10 text-[#ff4500] dark:bg-orange-950/40 dark:text-orange-400"
              : "border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {icon}
        </div>
        {badge && (
          <span className="rounded-md bg-[#ff4500]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#ff4500] uppercase dark:bg-orange-950/50 dark:text-orange-300">
            {badge}
          </span>
        )}
      </div>

      <div>
        <p className="font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
          {title}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <p
            className={`font-mono text-2xl font-extrabold tracking-tight ${
              isHighlight
                ? "text-[#ff4500] dark:text-orange-400"
                : "text-zinc-950 dark:text-white"
            }`}
          >
            {value}
          </p>
          {trend && (
            <span className="flex items-center gap-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> {trend}
            </span>
          )}
        </div>

        {progress !== undefined && (
          <div className="mt-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-[#ff4500]"
                style={{ width: `${progress}%` }}
              />
            </div>
            {subtext && (
              <p className="mt-1.5 font-mono text-[9px] font-medium text-zinc-400 dark:text-zinc-500">
                {subtext}
              </p>
            )}
          </div>
        )}

        {trendSub && (
          <p className="mt-1 font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
            {trendSub}
          </p>
        )}
      </div>
    </div>
  );
}
