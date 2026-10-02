"use client";

import { useState } from "react";
import { ActivityHeatmapData, HeatmapDay } from "@/lib/dashboard-analytics";
import { Calendar, Flame, Zap, Award } from "lucide-react";

interface DashboardActivityHeatmapProps {
  data: ActivityHeatmapData;
  className?: string;
}

export function DashboardActivityHeatmap({
  data,
  className = "",
}: DashboardActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Group into weeks of 7 days
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  // Align starting day of week
  const firstDayOfWeek = data.days[0]?.dayOfWeek ?? 0;
  // Pad if first day is not Sunday (0)
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({
      date: `pad-${i}`,
      dayOfWeek: i,
      count: 0,
      painPointsCount: 0,
      runsCount: 0,
      level: 0,
    });
  }

  for (const day of data.days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
    >
      {/* Header & Stats */}
      <div className="flex flex-col gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-sm font-black tracking-tight text-zinc-950 uppercase dark:text-white">
              Scan & Insight Activity
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Daily market ingestion over past 90 days
            </p>
          </div>
        </div>

        {/* Quick Streak Stats */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-black/5 bg-zinc-50 px-2.5 py-1 dark:border-white/5 dark:bg-zinc-800/60">
            <Flame className="h-3.5 w-3.5 text-[#ff4500]" />
            <span className="text-zinc-500 dark:text-zinc-400">Streak:</span>
            <strong className="text-zinc-900 dark:text-white">
              {data.currentStreak}d
            </strong>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-black/5 bg-zinc-50 px-2.5 py-1 dark:border-white/5 dark:bg-zinc-800/60">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Best:</span>
            <strong className="text-zinc-900 dark:text-white">
              {data.longestStreak}d
            </strong>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-black/5 bg-zinc-50 px-2.5 py-1 dark:border-white/5 dark:bg-zinc-800/60">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Total:</span>
            <strong className="text-zinc-900 dark:text-white">
              {data.totalPainPoints} insights
            </strong>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="inline-flex min-w-[580px] gap-1.5">
          {/* Day of week labels */}
          <div className="flex flex-col justify-between py-1 pr-2 font-mono text-[9px] text-zinc-400 select-none">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Week Columns */}
          <div className="flex gap-1.5">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => {
                  const isPadding = day.date.startsWith("pad-");
                  if (isPadding) {
                    return <div key={dIdx} className="h-3.5 w-3.5 opacity-0" />;
                  }

                  let bgClass =
                    "bg-zinc-100 hover:ring-1 hover:ring-zinc-400 dark:bg-zinc-800/70 dark:hover:ring-zinc-600";
                  if (day.level === 1) {
                    bgClass = "bg-[#ff4500]/30 hover:bg-[#ff4500]/40";
                  } else if (day.level === 2) {
                    bgClass = "bg-[#ff4500]/60 hover:bg-[#ff4500]/70";
                  } else if (day.level === 3) {
                    bgClass = "bg-[#ff4500]/85 hover:bg-[#ff4500]";
                  } else if (day.level === 4) {
                    bgClass =
                      "bg-[#ff4500] shadow-[0_0_8px_rgba(255,69,0,0.6)]";
                  }

                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`h-3.5 w-3.5 cursor-pointer rounded-xs transition-transform hover:scale-125 ${bgClass}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Details / Legend & Tooltip readout */}
      <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t border-black/[0.04] pt-3 font-mono text-[11px] sm:flex-row dark:border-white/[0.06]">
        {/* Dynamic Tooltip Info */}
        <div className="flex min-h-[1.5rem] items-center text-zinc-600 dark:text-zinc-400">
          {hoveredDay ? (
            <span>
              <strong className="font-bold text-zinc-900 dark:text-white">
                {new Date(hoveredDay.date + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </strong>
              :{" "}
              {hoveredDay.count === 0
                ? "No activity recorded"
                : `${hoveredDay.painPointsCount} pain points extracted across ${hoveredDay.runsCount} scan(s)`}
            </span>
          ) : (
            <span className="text-zinc-400">
              Hover over a square to inspect daily extraction volume
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-xs bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-2.5 w-2.5 rounded-xs bg-[#ff4500]/30" />
          <div className="h-2.5 w-2.5 rounded-xs bg-[#ff4500]/60" />
          <div className="h-2.5 w-2.5 rounded-xs bg-[#ff4500]/85" />
          <div className="h-2.5 w-2.5 rounded-xs bg-[#ff4500]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
