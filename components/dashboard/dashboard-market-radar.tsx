"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RadarPoint, RadarQuadrant } from "@/lib/dashboard-analytics";
import {
  Crosshair,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

interface DashboardMarketRadarProps {
  points: RadarPoint[];
  className?: string;
}

export function DashboardMarketRadar({
  points,
  className = "",
}: DashboardMarketRadarProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<RadarQuadrant | "all">("all");
  const [hoveredPoint, setHoveredPoint] = useState<RadarPoint | null>(null);

  const filteredPoints =
    selectedQuadrant === "all"
      ? points
      : points.filter((p) => p.quadrant === selectedQuadrant);

  const blueOceanCount = points.filter((p) => p.quadrant === "blue-ocean").length;
  const battlegroundCount = points.filter((p) => p.quadrant === "battleground").length;
  const unchartedCount = points.filter((p) => p.quadrant === "uncharted").length;
  const commodityCount = points.filter((p) => p.quadrant === "commodity").length;

  // 2D chart dimensions
  const width = 600;
  const height = 360;
  const padding = { top: 30, right: 30, bottom: 40, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const toX = (val: number) => padding.left + (val / 10) * plotWidth;
  const toY = (val: number) => padding.top + plotHeight - (val / 10) * plotHeight;

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
    >
      {/* Header & Quadrant Filter Pills */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
            <Crosshair className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black tracking-tight text-zinc-950 dark:text-white uppercase font-mono">
                Market Competition Radar
              </h4>
              <span className="rounded-full bg-[#ff4500]/10 px-2 py-0.5 font-mono text-[9px] font-black text-[#ff4500] uppercase">
                2D Axis
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pain Intensity ($Y$) vs Market Solution Maturity ($X$)
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-bold uppercase">
          <button
            type="button"
            onClick={() => setSelectedQuadrant("all")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              selectedQuadrant === "all"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            All ({points.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedQuadrant("blue-ocean")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              selectedQuadrant === "blue-ocean"
                ? "bg-[#ff4500] text-white shadow-xs"
                : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
            }`}
          >
            ★ Blue Ocean ({blueOceanCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedQuadrant("battleground")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              selectedQuadrant === "battleground"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
            }`}
          >
            Battleground ({battlegroundCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedQuadrant("uncharted")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              selectedQuadrant === "uncharted"
                ? "bg-zinc-700 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            Uncharted ({unchartedCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedQuadrant("commodity")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              selectedQuadrant === "commodity"
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:text-rose-400"
            }`}
          >
            Commodity ({commodityCount})
          </button>
        </div>
      </div>

      {/* 2D Radar Canvas / SVG */}
      <div className="mt-4 relative overflow-hidden rounded-xl border border-black/5 bg-zinc-50/70 dark:border-white/5 dark:bg-zinc-950/40 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-80 overflow-visible"
        >
          {/* Quadrant Background Shading */}
          {/* Top-Left: Blue Ocean */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth / 2}
            height={plotHeight / 2}
            className="fill-emerald-500/[0.04] dark:fill-emerald-500/[0.07]"
          />
          {/* Top-Right: Battleground */}
          <rect
            x={padding.left + plotWidth / 2}
            y={padding.top}
            width={plotWidth / 2}
            height={plotHeight / 2}
            className="fill-amber-500/[0.04] dark:fill-amber-500/[0.07]"
          />
          {/* Bottom-Left: Uncharted */}
          <rect
            x={padding.left}
            y={padding.top + plotHeight / 2}
            width={plotWidth / 2}
            height={plotHeight / 2}
            className="fill-zinc-500/[0.03] dark:fill-zinc-500/[0.05]"
          />
          {/* Bottom-Right: Commodity */}
          <rect
            x={padding.left + plotWidth / 2}
            y={padding.top + plotHeight / 2}
            width={plotWidth / 2}
            height={plotHeight / 2}
            className="fill-rose-500/[0.03] dark:fill-rose-500/[0.05]"
          />

          {/* Quadrant Watermark Labels */}
          <text
            x={padding.left + 10}
            y={padding.top + 20}
            className="fill-emerald-600/60 dark:fill-emerald-400/60 font-mono text-[11px] font-black uppercase tracking-wider"
          >
            ★ Blue Ocean (High Pain, Few Solutions)
          </text>
          <text
            x={padding.left + plotWidth / 2 + 10}
            y={padding.top + 20}
            className="fill-amber-600/60 dark:fill-amber-400/60 font-mono text-[11px] font-black uppercase tracking-wider"
          >
            Competitive Battleground (High Demand)
          </text>
          <text
            x={padding.left + 10}
            y={height - padding.bottom - 10}
            className="fill-zinc-400 font-mono text-[10px] font-bold uppercase tracking-wider"
          >
            Uncharted Niche (Low Friction)
          </text>
          <text
            x={padding.left + plotWidth / 2 + 10}
            y={height - padding.bottom - 10}
            className="fill-rose-500/60 font-mono text-[10px] font-bold uppercase tracking-wider"
          >
            Commodity Zone (High Competition)
          </text>

          {/* Center Dividing Lines */}
          <line
            x1={padding.left + plotWidth / 2}
            y1={padding.top}
            x2={padding.left + plotWidth / 2}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-zinc-300 dark:text-zinc-700"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + plotHeight / 2}
            x2={width - padding.right}
            y2={padding.top + plotHeight / 2}
            stroke="currentColor"
            className="text-zinc-300 dark:text-zinc-700"
            strokeDasharray="4 4"
          />

          {/* Outer Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-zinc-400 dark:text-zinc-600"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-zinc-400 dark:text-zinc-600"
          />

          {/* Axis Labels */}
          <text
            x={padding.left + 5}
            y={padding.top - 10}
            className="fill-zinc-500 dark:fill-zinc-400 font-mono text-[10px] font-bold uppercase"
          >
            ↑ High Pain Intensity (10)
          </text>
          <text
            x={width - padding.right}
            y={height - padding.bottom + 25}
            textAnchor="end"
            className="fill-zinc-500 dark:fill-zinc-400 font-mono text-[10px] font-bold uppercase"
          >
            Market Maturity (Incumbent Density) →
          </text>

          {/* Pain Point Dots */}
          {filteredPoints.map((pt) => {
            const cx = toX(pt.marketMaturity);
            const cy = toY(pt.painIntensity);
            const isHovered = hoveredPoint?.id === pt.id;

            let fillColor = "#ff4500";
            if (pt.quadrant === "blue-ocean") fillColor = "#10b981";
            else if (pt.quadrant === "battleground") fillColor = "#f59e0b";
            else if (pt.quadrant === "commodity") fillColor = "#f43f5e";
            else fillColor = "#71717a";

            return (
              <g
                key={pt.id}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill={fillColor}
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4.5}
                  fill={fillColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all hover:scale-125"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Point Tooltip / Inspection Bar */}
      <div className="mt-3 min-h-[3rem] flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.06] pt-3 text-[11px] font-mono">
        {hoveredPoint ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  hoveredPoint.quadrant === "blue-ocean"
                    ? "bg-emerald-500"
                    : hoveredPoint.quadrant === "battleground"
                      ? "bg-amber-500"
                      : hoveredPoint.quadrant === "commodity"
                        ? "bg-rose-500"
                        : "bg-zinc-400"
                }`}
              />
              <span className="font-bold text-zinc-900 dark:text-white truncate">
                "{hoveredPoint.title}"
              </span>
              <span className="text-zinc-400 shrink-0">
                (Pain: {hoveredPoint.painIntensity}/10, Maturity: {hoveredPoint.marketMaturity}/10)
              </span>
            </div>
            <Link
              href={`/dashboard/reports/${hoveredPoint.reportId}`}
              className="inline-flex items-center gap-1 font-bold text-[#ff4500] hover:underline shrink-0"
            >
              Open Dossier <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="text-zinc-400">
            Hover over radar nodes to inspect market quadrant & opportunity score
          </div>
        )}
      </div>
    </div>
  );
}
