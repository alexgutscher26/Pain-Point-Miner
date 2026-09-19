"use client";

import React from "react";
import { Surface } from "@webprodigies/flute";
import { Zap, ExternalLink } from "lucide-react";

export default function IdeaMarketSnapshotScene() {
  const demandChartPoints = [75, 75, 75, 92, 60, 60, 60];

  return (
    <Surface
      id="market-snapshot-card"
      style={{ width: 1400, height: 980 }}
      className="bg-[#FAFAFB] p-8 font-sans text-zinc-900 antialiased overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 font-mono text-[11px] font-bold text-blue-700 uppercase">
              Opportunity Intelligence
            </span>
            <span className="font-mono text-xs text-zinc-400">r/boardgames • Verified Idea</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1a1a1a]">
            Board Game Group Finding & Table Formation SaaS
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              VALIDATION SCORE
            </div>
            <div className="font-sans text-2xl font-black text-emerald-600">
              8.8<span className="text-xs font-normal text-zinc-400">/10</span>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-200" />
          <div className="text-right">
            <div className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              YEAR 1 TARGET
            </div>
            <div className="font-sans text-2xl font-black text-zinc-900">$79.2K ARR</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Receipts & Strategy */}
      <div className="grid grid-cols-12 gap-6 pt-2">
        {/* Left Column: Market Snapshot / The Receipts (7 cols) */}
        <div className="col-span-7 space-y-5">
          <div className="space-y-0.5">
            <span className="font-sans text-[10.5px] font-bold tracking-[0.16em] text-zinc-400 uppercase">
              MARKET SNAPSHOT
            </span>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-[#1a1a1a]">
              The receipts.
            </h2>
          </div>

          {/* 2-Col Demand & Search Volume */}
          <div className="grid grid-cols-2 gap-4">
            {/* Demand Card */}
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-4.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10.5px] font-bold tracking-widest text-[#6366F1] uppercase">
                  DEMAND
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[9.5px] font-medium tracking-wider text-zinc-400 uppercase">
                  SEARCH
                </span>
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-zinc-900">&ldquo;meetup&rdquo;</p>
                <div className="flex items-baseline justify-between pt-0.5">
                  <div className="font-serif text-2xl font-normal text-zinc-900">
                    201K<span className="text-sm font-light text-zinc-400">/mo</span>
                  </div>
                  <span className="font-sans text-xs font-bold text-[#EF4444]">-18% YoY</span>
                </div>
              </div>
              <div className="h-16 w-full pt-1">
                <svg viewBox="0 0 300 80" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="fluteSparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={
                      `M 0 65 ` +
                      demandChartPoints
                        .map((p, i) => {
                          const x = i * (300 / (demandChartPoints.length - 1));
                          const y = 65 - (p / 100) * 55;
                          return `L ${x} ${y}`;
                        })
                        .join(" ") +
                      ` L 300 65 Z`
                    }
                    fill="url(#fluteSparkGrad)"
                  />
                  <path
                    d={demandChartPoints
                      .map((p, i) => {
                        const x = i * (300 / (demandChartPoints.length - 1));
                        const y = 65 - (p / 100) * 55;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Search Volume Card */}
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-4.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10.5px] font-bold tracking-widest text-[#6366F1] uppercase">
                  SEARCH VOLUME
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[9.5px] font-medium tracking-wider text-zinc-400 uppercase">
                  US • MO
                </span>
              </div>
              <div className="space-y-2 pt-0.5">
                {[
                  { term: "board game cafe near me", vol: "14.8K", growth: "▲ 49%", width: "100%" },
                  { term: "local game store", vol: "3.6K", growth: "▲ 175%", width: "42%" },
                  { term: "tabletop gaming near me", vol: "2.4K", growth: "▲ 26%", width: "28%" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-semibold text-zinc-900 truncate max-w-[130px]">
                        &ldquo;{item.term}&rdquo;
                      </span>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9.5px] font-bold text-emerald-700">
                        {item.growth}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: item.width }} />
                      </div>
                      <span className="font-sans text-[11px] font-bold text-zinc-800">
                        {item.vol}
                        <span className="font-normal text-zinc-400">/mo</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pain Severity & Verbatim Quotes */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="font-sans text-[10.5px] font-bold tracking-widest text-[#EA580C] uppercase">
                PAIN
              </span>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[9.5px] font-bold text-zinc-500 uppercase">
                7/10 SEVERITY
              </span>
            </div>

            <div className="space-y-2">
              <div className="rounded-xl border border-amber-100 bg-[#FFFDF9] p-3 space-y-1 border-l-[3px] border-l-amber-400">
                <p className="font-serif text-xs leading-relaxed text-zinc-900 line-clamp-2">
                  &ldquo;I&apos;ve been puzzling over this question: does hosting a board game night make economic sense for the store owner? Most players leave without buying anything...&rdquo;
                </p>
                <p className="font-sans text-[10.5px] font-medium text-zinc-400">BoardGameGeek • BGG thread OP</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-[#FFFDF9] p-3 space-y-1 border-l-[3px] border-l-amber-400">
                <p className="font-serif text-xs leading-relaxed text-zinc-900 line-clamp-2">
                  &ldquo;I used to work at a game store. Name recognition. Name recognition. Name recognition. But you can&apos;t pay Tuesday staff wages on goodwill alone.&rdquo;
                </p>
                <p className="font-sans text-[10.5px] font-medium text-zinc-400">BoardGameGeek • Former employee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Whitespace, Wedge & Proof Signals (5 cols) */}
        <div className="col-span-5 space-y-4">
          {/* Whitespace */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10.5px] font-bold tracking-widest text-[#6366F1] uppercase">
                WHITESPACE
              </span>
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[9.5px] font-medium tracking-wider text-zinc-400 uppercase">
                MARKET GAP
              </span>
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1a1a1a] leading-snug">
              Free tools own the calendar. Nobody owns the table match
            </h3>
          </div>

          {/* The Wedge */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-2.5">
            <div className="pointer-events-none absolute -bottom-2 -right-2 text-indigo-50/60 select-none">
              <Zap className="h-24 w-24" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="font-sans text-[10.5px] font-bold tracking-widest text-[#6366F1] uppercase">
                THE WEDGE
              </span>
            </div>
            <p className="font-serif text-xs text-zinc-800 leading-relaxed relative z-10">
              Start with one store&apos;s existing audience and library. Match players by game, availability, play style, and beginner friendliness.
            </p>
            <p className="font-sans text-[11px] text-zinc-500 pt-1 relative z-10">
              The incumbent to beat: <span className="font-bold text-zinc-900">Meetup</span>
            </p>
          </div>

          {/* Proof & Signals */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-3">
            <span className="font-sans text-[10.5px] font-bold tracking-widest text-[#2563EB] uppercase block">
              PROOF & SIGNALS
            </span>
            <div className="space-y-2.5">
              <div className="space-y-0.5">
                <div className="flex items-start gap-2 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  <p className="font-serif text-[12px] text-zinc-800 leading-snug">
                    StartPlaying.games raised $6.5M seed from a16z; hosted 100,000+ games and moved $50M+ in paid GM games.
                  </p>
                </div>
                <span className="pl-3.5 font-mono text-[9px] font-bold text-zinc-400 uppercase">VENTUREBEAT ↗</span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-start gap-2 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  <p className="font-serif text-[12px] text-zinc-800 leading-snug">
                    US board games market reached $5.0B in 2025 per IMARC, forecast to $11.9B by 2034 at 9.77% CAGR.
                  </p>
                </div>
                <span className="pl-3.5 font-mono text-[9px] font-bold text-zinc-400 uppercase">IMARC GROUP ↗</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between border-t border-zinc-200/80 pt-3 text-xs text-zinc-400 font-mono">
        <div>PAIN-POINT-MINER • FLUTE 3D SCENE STUDIO</div>
        <div className="flex items-center gap-1 text-blue-600 font-sans font-semibold">
          <span>Explore live interactive report</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    </Surface>
  );
}
