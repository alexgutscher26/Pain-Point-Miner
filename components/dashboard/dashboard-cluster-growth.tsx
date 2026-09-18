"use client";

import React, { useState } from "react";
import { ClusterGrowthData, ClusterGrowthPoint } from "@/lib/dashboard-analytics";
import { TrendingUp, Layers, Compass, Sparkles } from "lucide-react";

interface DashboardClusterGrowthProps {
  data: ClusterGrowthData;
  className?: string;
}

export function DashboardClusterGrowth({
  data,
  className = "",
}: DashboardClusterGrowthProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ClusterGrowthPoint | null>(null);

  const timeline = data.timeline;
  const maxCumulativePoints = Math.max(
    ...timeline.map((t) => t.cumulativePainPoints),
    1,
  );

  // Generate SVG path for cumulative pain points & clusters
  const width = 600;
  const height = 140;
  const padding = { top: 15, right: 15, bottom: 25, left: 15 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const points = timeline.map((pt, idx) => {
    const x = padding.left + (idx / Math.max(timeline.length - 1, 1)) * graphWidth;
    const y =
      padding.top +
      graphHeight -
      (pt.cumulativePainPoints / maxCumulativePoints) * graphHeight;
    return { x, y, pt };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${curr.x} ${curr.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? width} ${height - padding.bottom} L ${points[0]?.x ?? 0} ${height - padding.bottom} Z`;

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black tracking-tight text-zinc-950 dark:text-white uppercase font-mono">
                Cluster Growth & Evolution
              </h4>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                +{data.growthPercent}% 30d
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Expansion of semantic clusters & market problem themes
            </p>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1 dark:bg-zinc-800/60 border border-black/5 dark:border-white/5">
            <Layers className="h-3.5 w-3.5 text-[#ff4500]" />
            <span className="text-zinc-500 dark:text-zinc-400">Clusters:</span>
            <strong className="text-zinc-900 dark:text-white">
              {data.totalClusters}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1 dark:bg-zinc-800/60 border border-black/5 dark:border-white/5">
            <Compass className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Density:</span>
            <strong className="text-zinc-900 dark:text-white">
              {data.avgDensity} pts/cluster
            </strong>
          </div>
        </div>
      </div>

      {/* Sparkline Visual */}
      <div className="mt-4 relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="clusterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4500" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ff4500" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="currentColor"
            className="text-zinc-100 dark:text-zinc-800"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-700"
          />

          {/* Area Fill */}
          <path d={areaD} fill="url(#clusterGrad)" />

          {/* Sparkline Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#ff4500"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.date === p.pt.date ? 5 : 2.5}
              className="fill-[#ff4500] stroke-white dark:stroke-zinc-900 transition-all cursor-pointer"
              strokeWidth="2"
              onMouseEnter={() => setHoveredPoint(p.pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Date Markers on X-Axis */}
        <div className="flex justify-between px-1 text-[10px] font-mono text-zinc-400 pt-1">
          <span>{timeline[0]?.formattedDate}</span>
          <span>{timeline[Math.floor(timeline.length / 2)]?.formattedDate}</span>
          <span>{timeline[timeline.length - 1]?.formattedDate}</span>
        </div>
      </div>

      {/* Footer Info & Active Tooltip */}
      <div className="mt-3 flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.06] pt-3 text-[11px] font-mono">
        <div className="min-h-[1.5rem] flex items-center text-zinc-600 dark:text-zinc-400">
          {hoveredPoint ? (
            <span>
              <strong className="text-zinc-900 dark:text-white font-bold">
                {hoveredPoint.formattedDate}
              </strong>
              :{" "}
              {hoveredPoint.cumulativePainPoints} cumulative pain points (
              {hoveredPoint.cumulativeClusters} active clusters)
            </span>
          ) : data.topClusterTitle ? (
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles className="h-3 w-3 text-[#ff4500] shrink-0" />
              <span className="text-zinc-400">Dominant Cluster:</span>
              <strong className="text-zinc-900 dark:text-zinc-200 truncate">
                "{data.topClusterTitle}"
              </strong>
            </span>
          ) : (
            <span className="text-zinc-400">
              Hover along timeline to inspect cluster density evolution
            </span>
          )}
        </div>

        <span className="text-[10px] text-zinc-400 shrink-0">
          Updated in Realtime
        </span>
      </div>
    </div>
  );
}
