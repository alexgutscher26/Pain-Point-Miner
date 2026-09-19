"use client";

import React from "react";
import { Surface } from "@webprodigies/flute";
import { DollarSign, TrendingUp, Target, ArrowRight, ShieldCheck, PieChart, Sparkles } from "lucide-react";

export default function MoneyMathModalScene() {
  const pilotFunnel = [
    { label: "Target stores in pilot metro", value: "30", note: "In-store visits made" },
    { label: "Owner meeting rate", value: "50%", note: "15 active demos" },
    { label: "Paid pilots signed ($79/mo)", value: "6", note: "$948 initial 60-day ARR" },
    { label: "Pilot -> $149/mo Pro conversion", value: "50%", note: "3 converted stores" },
    { label: "Month 4 MRR from pilot city", value: "$684", note: "$8,208 run-rate" },
    { label: "Scale to 5 metros by month 12", value: "60 stores", note: "Blended $110/mo ARPU" },
  ];

  const ceilingMetrics = [
    { label: "US Toy & Hobby Stores (First Research)", val: "8,500", highlight: false },
    { label: "FLGS-Shaped Subset (Runs Weekly Play)", val: "3,000", highlight: false },
    { label: "Realistic Serviceable Stores (25% Penetration)", val: "750", highlight: true, color: "text-blue-600" },
    { label: "Blended ARPU Across Starter/Pro/Multi", val: "$130/mo", highlight: false },
    { label: "Store B2B SaaS ARR Ceiling", val: "$1,170,000", highlight: true, color: "text-indigo-600" },
    { label: "Player Pass Upsell ($3.99/mo per regular)", val: "$1,850,000", highlight: true, color: "text-emerald-600" },
  ];

  return (
    <Surface
      id="money-math-surface"
      style={{ width: 1400, height: 980 }}
      className="bg-[#0b0f19] p-8 font-sans text-zinc-100 antialiased overflow-hidden flex flex-col justify-between select-none relative"
    >
      {/* Background Subtle Gradient Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 font-mono text-[11px] font-bold text-emerald-400 uppercase">
              <DollarSign className="w-3.5 h-3.5" /> Unit Economics & ARR Ceiling
            </span>
            <span className="font-mono text-xs text-zinc-500">First-Principles Financial Model</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            The Money Math: Year 1 Napkin to $3.02M ARR
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Y1 BASELINE TARGET
            </div>
            <div className="font-sans text-2xl font-black text-emerald-400">
              $79,200 <span className="text-xs font-normal text-zinc-400">ARR</span>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-800" />
          <div className="text-right">
            <div className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              MARKET CEILING
            </div>
            <div className="font-sans text-2xl font-black text-blue-400">$3.02M ARR</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Year 1 Napkin vs Market Ceiling */}
      <div className="grid grid-cols-12 gap-6 pt-2 z-10 flex-1">
        {/* Left Column: Year One Napkin Funnel (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10.5px] font-bold tracking-[0.16em] text-blue-400 uppercase flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> YEAR ONE, ON A NAPKIN
              </span>
              <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                Bootstrapped Playbook
              </span>
            </div>
            <h2 className="font-serif text-xl font-medium tracking-tight text-zinc-200">
              From 1 pilot city to 60 paying stores.
            </h2>
          </div>

          {/* Funnel Rows */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4.5 space-y-2.5 shadow-xl backdrop-blur-sm">
            {pilotFunnel.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-950/60 border border-zinc-800/50 hover:border-zinc-700/80 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-zinc-300">{step.label}</p>
                  <p className="font-mono text-[10.5px] text-zinc-500">{step.note}</p>
                </div>
                <div className="font-mono text-sm font-bold text-white bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                  {step.value}
                </div>
              </div>
            ))}
          </div>

          {/* Year 1 Summary Box */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-zinc-300">
              <strong className="text-emerald-300 font-semibold">First-year execution:</strong> 60 paying stores at a blended $110 ARPU generates <strong className="text-white">$79.2K ARR</strong>. Realistic launch range accounting for ramp slippage is <strong className="text-white">$60K-$120K</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: $3M ARR Ceiling Breakdown (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10.5px] font-bold tracking-[0.16em] text-emerald-400 uppercase flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" /> THE CEILING: WHAT $3M ARR TAKES
              </span>
              <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                Tam Modeling
              </span>
            </div>
            <h2 className="font-serif text-xl font-medium tracking-tight text-zinc-200">
              TAM penetration and consumer expansion.
            </h2>
          </div>

          {/* Ceiling Metrics List */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4.5 space-y-2.5 shadow-xl backdrop-blur-sm">
            {ceilingMetrics.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between py-2 px-3 rounded-xl border ${
                  item.highlight
                    ? "bg-zinc-900/90 border-zinc-700/80"
                    : "bg-zinc-950/60 border-zinc-800/50"
                }`}
              >
                <span className="text-xs font-medium text-zinc-300">{item.label}</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    item.color || "text-zinc-200"
                  }`}
                >
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          {/* Split Stack Visual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3">
              <div className="font-sans text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                B2B STORE SUBSCRIPTIONS
              </div>
              <div className="font-serif text-xl font-bold text-white mt-1">$1.17M ARR</div>
              <div className="font-mono text-[10.5px] text-zinc-400 mt-0.5">750 Stores × $130/mo</div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
              <div className="font-sans text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                B2C PLAYER PREMIUM PASS
              </div>
              <div className="font-serif text-xl font-bold text-white mt-1">$1.85M ARR</div>
              <div className="font-mono text-[10.5px] text-zinc-400 mt-0.5">38.6K Players × $3.99/mo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-2 z-10">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sourced against First Research US Retail Census & Meetup/Eventbrite Pricing Tiers</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>PainPointMiner Financial Intelligence Engine</span>
        </div>
      </div>
    </Surface>
  );
}
