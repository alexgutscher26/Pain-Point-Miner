"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Gem,
  Layers,
} from "lucide-react";

export function Pricing() {
  const [showFeatureMatrix, setShowFeatureMatrix] = useState(false);

  return (
    <section
      className="relative mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-16 sm:px-6 sm:py-24"
      id="pricing"
    >
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="h-[420px] w-[620px] rounded-full bg-radial from-[#ff4500]/10 via-amber-500/5 to-transparent blur-3xl" />
      </div>

      {/* Header Section */}
      <div className="mb-12 flex max-w-2xl flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs backdrop-blur-md dark:border-amber-700/50 dark:bg-amber-950/60 dark:text-amber-200">
          <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span>Exclusive Lifetime Access · No Monthly Subscriptions</span>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          Pay once. Mine customer demand forever.
        </h2>
        <p className="text-base leading-relaxed font-normal text-zinc-600 sm:text-lg dark:text-zinc-300">
          Secure early-adopter lifetime access with recurring monthly scan credits that
          automatically refresh every year. Zero recurring monthly invoices.
        </p>
      </div>

      {/* ── LIFETIME DEAL (LTD) VIEW ── */}
      <div className="mb-12 w-full max-w-5xl">
        {/* Urgent Allocation Banner */}
        <div className="mb-8 rounded-3xl border border-amber-300/60 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5 backdrop-blur-md dark:border-amber-400/20 dark:from-amber-950/30">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                <Gem className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 sm:text-base dark:text-white">
                  Early-Founder Lifetime Allocation
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  Pay once, unlock monthly recurring scan credits that
                  automatically renew every year for life.
                </p>
              </div>
            </div>
            <div className="shrink-0 rounded-full border border-amber-400/40 bg-amber-100 px-4 py-1.5 font-mono text-xs font-bold text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
              🔒 Limited Early-Bird Cohort
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* FOUNDER LTD */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-amber-400/80 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 font-mono text-xs font-bold text-amber-900 dark:border-amber-700/50 dark:bg-amber-950 dark:text-amber-200">
                  Tier 1 — Founder LTD
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-500">
                  Pay Once
                </span>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-zinc-950 dark:text-white">
                Founder Pass
              </h3>
              <p className="mb-6 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
                Ideal for solo founders and builders who want continuous market validation
                without monthly SaaS subscriptions.
              </p>

              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                  $149
                </span>
                <span className="text-sm font-semibold text-zinc-500">
                  one-time payment
                </span>
              </div>
              <p className="mb-6 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Saves $199+ in your first year alone
              </p>

              <div className="space-y-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <div>
                  <span className="font-mono text-xs font-bold tracking-wider text-amber-800 uppercase dark:text-amber-300">
                    Recurring Allowance
                  </span>
                  <ul className="mt-3 space-y-3">
                    <FeatureItem
                      label="30 Reddit scans / month renewed forever"
                      highlight
                    />
                    <FeatureItem label="Credits refresh automatically each month forever" />
                    <FeatureItem label="20% permanent discount on extra credit top-ups" />
                  </ul>
                </div>

                <div>
                  <span className="font-mono text-xs font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                    Founder Perks
                  </span>
                  <ul className="mt-3 space-y-3">
                    <FeatureItem label="Deep pain-point extraction & clustering" />
                    <FeatureItem label="Subreddit activity heatmaps & sentiment" />
                    <FeatureItem label="Early access to upcoming niche scrapers" />
                    <FeatureItem label="Exclusive Founder badge on your account ✨" />
                    <FeatureItem label="Upgrade to Pro LTD for $150 difference anytime" />
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <Link
                href="/sign-up?plan=founder-ltd"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-zinc-50 text-sm font-bold text-zinc-900 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                Claim Founder Access ($149)
              </Link>
              <p className="mt-3 text-center text-[11px] font-medium text-zinc-400">
                Lifetime entitlement · Instant activation · No renewal fees
              </p>
            </div>
          </div>

          {/* PROFESSIONAL LTD - FEATURED */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-white p-8 shadow-xl shadow-amber-500/10 dark:border-amber-400 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
            <div className="absolute top-0 right-0 flex items-center gap-1.5 rounded-bl-2xl bg-amber-400 px-4 py-1.5 text-[11px] font-black tracking-wider text-amber-950 uppercase shadow-xs">
              <span>💎</span>
              <span>Best Lifetime Value</span>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-amber-400 bg-amber-200/70 px-3 py-1 font-mono text-xs font-extrabold text-amber-950 dark:bg-amber-900/60 dark:text-amber-100">
                  Tier 2 — Professional LTD
                </span>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-zinc-950 dark:text-white">
                Studio Master
              </h3>
              <p className="mb-6 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
                For active market researchers, growth agencies, and studios running deep weekly
                competitor teardowns.
              </p>

              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                  $299
                </span>
                <span className="text-sm font-semibold text-zinc-500">
                  one-time payment
                </span>
              </div>
              <p className="mb-6 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Saves $529+ annually vs monthly Pro plan
              </p>

              <div className="space-y-6 border-t border-amber-200 pt-6 dark:border-zinc-800">
                <div>
                  <span className="font-mono text-xs font-bold tracking-wider text-amber-900 uppercase dark:text-amber-300">
                    Power Allowance
                  </span>
                  <ul className="mt-3 space-y-3">
                    <FeatureItem
                      label="100 Reddit scans / month renewed forever"
                      highlight
                    />
                    <FeatureItem
                      label="Credits refresh automatically each month forever"
                      highlight
                    />
                    <FeatureItem
                      label="40% permanent discount on extra credit top-ups"
                      highlight
                    />
                  </ul>
                </div>

                <div>
                  <span className="font-mono text-xs font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                    Studio Arsenal
                  </span>
                  <ul className="mt-3 space-y-3">
                    <FeatureItem
                      label="Everything in Founder Pass included"
                      highlight
                    />
                    <FeatureItem
                      label="Trend Velocity Scoring Engine"
                      highlight
                    />
                    <FeatureItem
                      label="Advanced AI mining depth (200+ comments/thread)"
                      highlight
                    />
                    <FeatureItem
                      label="Multi-platform intelligence scrapers (early access)"
                      highlight
                    />
                    <FeatureItem
                      label="Pro VIP Founder badge & priority roadmap voting 💎"
                      highlight
                    />
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-amber-200 pt-6 dark:border-zinc-800">
              <Link
                href="/sign-up?plan=professional-ltd"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 text-sm font-bold text-amber-950 shadow-md shadow-amber-400/20 transition-all duration-300 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30 active:scale-[0.98]"
              >
                <span>Claim Professional LTD ($299)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-[11px] font-medium text-zinc-500">
                One-time payment · Guaranteed lifetime maintenance & updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE FEATURE COMPARISON TOGGLE ── */}
      <div className="my-6 flex w-full max-w-5xl flex-col items-center">
        <button
          type="button"
          onClick={() => setShowFeatureMatrix(!showFeatureMatrix)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-5 py-2.5 text-xs font-bold text-zinc-800 shadow-2xs backdrop-blur-md transition-all hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Layers className="h-3.5 w-3.5 text-[#ff4500]" />
          <span>
            {showFeatureMatrix
              ? "Hide LTD Tier Comparison Matrix"
              : "View Detailed LTD Tier Comparison"}
          </span>
        </button>

        {showFeatureMatrix && (
          <div className="mt-6 w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs font-bold tracking-wider text-zinc-400 uppercase dark:border-zinc-800">
                    <th className="pt-2 pb-4">Feature / Capability</th>
                    <th className="pt-2 pb-4 text-center">Founder LTD ($149)</th>
                    <th className="pt-2 pb-4 text-center text-amber-600 dark:text-amber-400">
                      Professional LTD ($299)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm dark:divide-zinc-800">
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Monthly Renewable Scans
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      30 scans / month
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                      100 scans / month
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Subreddits per Scan
                    </td>
                    <td className="py-3 text-center text-zinc-700 dark:text-zinc-300">
                      Up to 10
                    </td>
                    <td className="py-3 text-center font-bold text-amber-600 dark:text-amber-400">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      AI Opportunity Scoring (0-100)
                    </td>
                    <td className="py-3 text-center font-bold text-emerald-500">
                      ✓ Included
                    </td>
                    <td className="py-3 text-center font-bold text-emerald-500">
                      ✓ Included
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Willingness-to-Pay Detection
                    </td>
                    <td className="py-3 text-center font-bold text-emerald-500">
                      ✓ Included
                    </td>
                    <td className="py-3 text-center font-bold text-emerald-500">
                      ✓ Included
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Export Formats
                    </td>
                    <td className="py-3 text-center text-zinc-700 dark:text-zinc-300">
                      CSV, JSON, Notion
                    </td>
                    <td className="py-3 text-center text-zinc-900 dark:text-white">
                      CSV, JSON, Notion, Webhooks
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Trend Velocity Engine
                    </td>
                    <td className="py-3 text-center text-zinc-400">—</td>
                    <td className="py-3 text-center font-bold text-emerald-500">
                      ✓ Included
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Top-Up Credit Discount
                    </td>
                    <td className="py-3 text-center font-mono text-zinc-700 dark:text-zinc-300">
                      20% Lifetime Off
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                      40% Lifetime Off
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── TRUST & RISK-REVERSAL BANNER ── */}
      <div className="mt-8 grid w-full max-w-5xl grid-cols-1 gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs backdrop-blur-xl sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ff4500]/10 text-[#ff4500]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-zinc-900 sm:text-sm dark:text-white">
              14-Day Money-Back
            </h5>
            <p className="text-[11px] text-zinc-500">
              Not satisfied? Get 100% refund, no questions asked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 sm:border-l sm:border-zinc-200 sm:pl-6 dark:sm:border-zinc-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-zinc-900 sm:text-sm dark:text-white">
              Bank-Grade Security
            </h5>
            <p className="text-[11px] text-zinc-500">
              Powered by Stripe 256-bit encrypted checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 sm:border-l sm:border-zinc-200 sm:pl-6 dark:sm:border-zinc-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-zinc-900 sm:text-sm dark:text-white">
              Instant Activation
            </h5>
            <p className="text-[11px] text-zinc-500">
              Lifetime scan credits unlock immediately on signup.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  label,
  highlight = false,
}: {
  label: string;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          highlight
            ? "bg-amber-500 text-white"
            : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
        }`}
      >
        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
      </div>
      <span
        className={`text-xs leading-snug font-medium sm:text-[13px] ${
          highlight
            ? "font-semibold text-zinc-900 dark:text-zinc-100"
            : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {label}
      </span>
    </li>
  );
}
