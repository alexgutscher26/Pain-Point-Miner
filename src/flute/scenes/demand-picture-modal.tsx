"use client";

import React from "react";
import { Surface } from "@webprodigies/flute";
import { ExternalLink, TrendingUp } from "lucide-react";

export default function DemandPictureModalScene() {
  const chartPoints = [35, 42, 50, 64, 76, 88, 96];
  const yAxisTicks = ["20k", "15k", "10k", "5k", "0"];

  return (
    <Surface
      id="demand-modal-surface"
      style={{ width: 1400, height: 980 }}
      className="bg-zinc-950/90 p-12 flex items-center justify-center font-sans antialiased select-none"
    >
      {/* Modal Dialog Card */}
      <div className="w-full max-w-4xl rounded-3xl border border-zinc-200 bg-white p-9 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="space-y-1">
            <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
              SEARCH INTELLIGENCE & DEMAND PICTURE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-zinc-900">
              The demand picture.
            </h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>High Organic Intent</span>
          </div>
        </div>

        {/* Highlight Banner Card */}
        <div className="rounded-2xl border border-indigo-100 bg-[#FAFAFE] p-6 space-y-2">
          <div className="font-sans text-[11px] font-bold tracking-widest text-[#6366F1] uppercase">
            LOCAL PLAY & BOARD GAME DISCOVERY
          </div>
          <div className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-zinc-900">
            14.8K<span className="text-xl font-light text-zinc-400">/mo</span>
          </div>
          <div className="font-sans text-sm text-zinc-600">
            &apos;board game cafe near me&apos; in US & UK, rising 1.6x YoY across Google Search
          </div>
          <div className="pt-1">
            <a
              href="https://trends.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-[#6366F1] hover:underline"
            >
              <span>Explore live query in Google Trends</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* 4 Key Metric Columns */}
        <div className="grid grid-cols-4 gap-4 py-2 text-center rounded-2xl bg-zinc-50/80 border border-zinc-200/70 p-4">
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#2563EB]">14.8K</div>
            <div className="font-sans text-xs font-medium text-zinc-500">Monthly Volume</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#10B981]">+62%</div>
            <div className="font-sans text-xs font-medium text-zinc-500">YoY Search Velocity</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#D97706]">$1.85</div>
            <div className="font-sans text-xs font-medium text-zinc-500">Commercial CPC</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#8B5CF6]">Low</div>
            <div className="font-sans text-xs font-medium text-zinc-500">Paid Ad Competition</div>
          </div>
        </div>

        {/* Area Trend Line Chart */}
        <div className="space-y-2 rounded-2xl border border-zinc-200/90 bg-white p-5">
          <div className="flex items-center justify-between pb-1">
            <span className="font-sans text-xs font-bold text-zinc-800">
              Historical Search Volume Trend (2020 – 2026)
            </span>
            <span className="font-mono text-[11px] text-zinc-400">Google Search Index</span>
          </div>

          <div className="relative w-full h-44">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="modalDemandAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yAxisTicks.map((tick, i) => {
                const y = 18 + i * (140 / 4);
                return (
                  <g key={i}>
                    <text x="45" y={y} textAnchor="end" dominantBaseline="middle" className="font-sans text-[11px] fill-zinc-400">
                      {tick}
                    </text>
                    <line x1="55" y1={y} x2="690" y2={y} stroke="#F1F5F9" strokeWidth="1.2" />
                  </g>
                );
              })}

              {/* Area Fill */}
              <path
                d={
                  `M 55 160 ` +
                  chartPoints
                    .map((p, i) => {
                      const x = 55 + i * (635 / (chartPoints.length - 1));
                      const y = 160 - (p / 100) * 140;
                      return `L ${x} ${y}`;
                    })
                    .join(" ") +
                  ` L 690 160 Z`
                }
                fill="url(#modalDemandAreaGrad)"
              />

              {/* Trend Line */}
              <path
                d={chartPoints
                  .map((p, i) => {
                    const x = 55 + i * (635 / (chartPoints.length - 1));
                    const y = 160 - (p / 100) * 140;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Year Marker */}
              <text x="375" y="195" textAnchor="middle" className="font-sans text-xs font-semibold fill-zinc-400">
                2026
              </text>
            </svg>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Verified against live Google Search Console & Trends Index</span>
          </div>
          <span className="font-mono text-zinc-400">ESC or click anywhere to close</span>
        </div>
      </div>
    </Surface>
  );
}
