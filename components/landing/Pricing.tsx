"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Flame,
  Gem,
  Layers,
} from "lucide-react";

export function Pricing() {
  const [pricingMode, setPricingMode] = useState<"recurring" | "lifetime">(
    "recurring",
  );
  const [isYearly, setIsYearly] = useState(true);
  const [showFeatureMatrix, setShowFeatureMatrix] = useState(false);

  const getPricing = (monthly: number) => {
    if (!isYearly) {
      return {
        displayPrice: `$${monthly}`,
        suffix: "/month",
        annualSavings: null,
        detail: "Billed monthly, cancel anytime",
      };
    }

    const yearlyTotal = monthly * 10;
    const yearlyMonthlyEquivalent = yearlyTotal / 12;
    const formattedEquivalent = Number.isInteger(yearlyMonthlyEquivalent)
      ? yearlyMonthlyEquivalent.toString()
      : yearlyMonthlyEquivalent.toFixed(2).replace(/\.?0+$/, "");

    return {
      displayPrice: `$${formattedEquivalent}`,
      suffix: "/month",
      annualSavings: `Save $${monthly * 2}/year`,
      detail: `$${yearlyTotal} billed annually (2 months free)`,
    };
  };

  const growthPricing = getPricing(29);
  const proPricing = getPricing(69);

  return (
    <section
      className="relative mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-20 sm:px-6 sm:py-28"
      id="pricing"
    >
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="h-[420px] w-[620px] rounded-full bg-gradient-to-tr from-[#ff4500]/10 via-[#ff6b33]/5 to-transparent blur-3xl" />
      </div>

      {/* Header Section */}
      <div className="mb-12 flex max-w-2xl flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-1 text-xs font-semibold text-[#ff4500] shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/70">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-balance text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          Turn community frustration into your next high-margin SaaS
        </h2>
        <p className="text-base leading-relaxed font-normal text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
          Choose a plan that matches your research volume. From validating your
          first idea to continuously monitoring competitor niches.
        </p>

        {/* Pricing Category Switcher (Subscription vs Lifetime) */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <div className="inline-flex rounded-2xl border border-black/10 bg-zinc-100/90 p-1.5 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90">
            <button
              type="button"
              onClick={() => setPricingMode("recurring")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all duration-300 sm:text-sm ${
                pricingMode === "recurring"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>Subscription Plans</span>
            </button>
            <button
              type="button"
              onClick={() => setPricingMode("lifetime")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all duration-300 sm:text-sm ${
                pricingMode === "lifetime"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span>Lifetime Deals</span>
              <span className="rounded-full bg-amber-400/30 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase dark:bg-amber-950/60 dark:text-amber-200">
                Limited
              </span>
            </button>
          </div>

          {/* Monthly / Yearly Toggle (Only shown when recurring is selected) */}
          {pricingMode === "recurring" && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-black/5 bg-zinc-100/60 p-1 dark:border-white/5 dark:bg-zinc-900/60">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                  !isYearly
                    ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                  isYearly
                    ? "bg-white text-[#ff4500] shadow-xs dark:bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <span>Annual</span>
                <span className="rounded-full bg-[#ff4500]/10 px-2 py-0.5 text-[10px] font-bold text-[#ff4500]">
                  -20% (2 Mos Free)
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── SUBSCRIPTION PLANS VIEW ── */}
      {pricingMode === "recurring" && (
        <div className="mb-12 grid w-full max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {/* Starter Plan */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/10 bg-white/70 p-7 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-black/20 hover:shadow-lg sm:p-8 dark:border-white/10 dark:bg-zinc-900/70 dark:hover:border-white/20">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-black/10 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-800 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200">
                  Starter
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  Free forever
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-zinc-950 dark:text-white">
                Idea Explorer
              </h3>
              <p className="mb-6 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
                Perfect for first-time founders validating early concepts before
                writing code.
              </p>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
                  $0
                </span>
                <span className="text-sm font-semibold text-zinc-500">
                  /forever
                </span>
              </div>

              <div className="mb-6 border-t border-black/5 pt-6 dark:border-white/5">
                <p className="mb-3 text-xs font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                  Included Capabilities
                </p>
                <ul className="space-y-3">
                  <FeatureItem label="2 Reddit community scans / month" />
                  <FeatureItem label="Up to 3 subreddits per search" />
                  <FeatureItem label="Basic pain-point extraction" />
                  <FeatureItem label="Mention volume insights" />
                  <FeatureItem label="Single CSV export format" />
                  <FeatureItem label="Community support Discord" />
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-black/5 pt-6 dark:border-white/5">
              <Link
                href="/sign-up?plan=starter"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-sm font-bold text-zinc-900 transition-all duration-200 hover:bg-zinc-50 hover:shadow-sm dark:border-white/15 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Start Free Research
              </Link>
              <p className="mt-3 text-center text-[11px] font-medium text-zinc-400">
                No credit card required · Instant access
              </p>
            </div>
          </div>

          {/* Growth Plan - FEATURED */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[#ff4500] bg-white p-7 shadow-[0_16px_50px_rgba(255,69,0,0.12)] sm:p-8 lg:-translate-y-2 dark:bg-zinc-900">
            {/* Featured Header Ribbon */}
            <div className="absolute top-0 right-0 flex items-center gap-1.5 rounded-bl-2xl bg-gradient-to-r from-[#ff4500] to-[#ff6b33] px-4 py-1.5 text-[11px] font-extrabold tracking-wider text-white uppercase shadow-sm">
              <Flame className="h-3.5 w-3.5 fill-white" />
              <span>Most Popular</span>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-[#ff4500]/30 bg-[#ff4500]/10 px-3 py-1 text-xs font-bold text-[#ff4500]">
                  Growth Tier
                </span>
                {growthPricing.annualSavings && (
                  <span className="text-xs font-bold text-[#ff4500]">
                    {growthPricing.annualSavings}
                  </span>
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-zinc-950 dark:text-white">
                Active Builder
              </h3>
              <p className="mb-6 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
                Designed for indie hackers and SaaS creators actively building
                product roadmaps.
              </p>

              <div className="mb-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
                  {growthPricing.displayPrice}
                </span>
                <span className="text-sm font-semibold text-zinc-500">
                  {growthPricing.suffix}
                </span>
              </div>
              <p className="mb-6 text-xs font-medium text-zinc-500">
                {growthPricing.detail}
              </p>

              <div className="mb-6 border-t border-[#ff4500]/15 pt-6">
                <p className="mb-3 text-xs font-bold tracking-wider text-[#ff4500] uppercase">
                  Everything in Starter, plus:
                </p>
                <ul className="space-y-3">
                  <FeatureItem label="50 Reddit scans / month" highlight />
                  <FeatureItem
                    label="Up to 10 subreddits per search"
                    highlight
                  />
                  <FeatureItem
                    label="AI opportunity scoring (0-100)"
                    highlight
                  />
                  <FeatureItem
                    label="Semantic pain-point clustering"
                    highlight
                  />
                  <FeatureItem
                    label="Willingness-to-pay intent filters"
                    highlight
                  />
                  <FeatureItem
                    label="Saved collections & report tagging"
                    highlight
                  />
                  <FeatureItem label="CSV, Notion & JSON exports" highlight />
                  <FeatureItem label="Priority background queueing" highlight />
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-black/5 pt-6 dark:border-white/5">
              <Link
                href={`/sign-up?plan=growth&billing=${isYearly ? "yearly" : "monthly"}`}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4500] to-[#ff6b33] text-sm font-bold text-white shadow-md shadow-[#ff4500]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#ff4500]/35 hover:brightness-110"
              >
                <span>Get Started with Growth</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-[11px] font-medium text-zinc-500">
                14-day money-back guarantee · Cancel anytime
              </p>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/10 bg-white/70 p-7 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-black/20 hover:shadow-lg sm:p-8 dark:border-white/10 dark:bg-zinc-900/70 dark:hover:border-white/20">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-black/10 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-800 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200">
                  Pro
                </span>
                {proPricing.annualSavings && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {proPricing.annualSavings}
                  </span>
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-zinc-950 dark:text-white">
                Agencies & Studios
              </h3>
              <p className="mb-6 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
                For product teams, consultancies, and serial builders demanding
                unlimited velocity.
              </p>

              <div className="mb-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
                  {proPricing.displayPrice}
                </span>
                <span className="text-sm font-semibold text-zinc-500">
                  {proPricing.suffix}
                </span>
              </div>
              <p className="mb-6 text-xs font-medium text-zinc-500">
                {proPricing.detail}
              </p>

              <div className="mb-6 border-t border-black/5 pt-6 dark:border-white/5">
                <p className="mb-3 text-xs font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                  Everything in Growth, plus:
                </p>
                <ul className="space-y-3">
                  <FeatureItem label="Unlimited monthly Reddit scans" />
                  <FeatureItem label="Analyze unlimited subreddits concurrently" />
                  <FeatureItem label="Deep full-thread comment excavation" />
                  <FeatureItem label="SaaS Feature Opportunity Blueprints" />
                  <FeatureItem label="Trend Velocity Engine & alert webhooks" />
                  <FeatureItem label="Direct Slack & Discord team digests" />
                  <FeatureItem label="Priority dedicated support" />
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-black/5 pt-6 dark:border-white/5">
              <Link
                href={`/sign-up?plan=pro&billing=${isYearly ? "yearly" : "monthly"}`}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-sm font-bold text-zinc-900 transition-all duration-200 hover:bg-zinc-50 hover:shadow-sm dark:border-white/15 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Upgrade to Pro
              </Link>
              <p className="mt-3 text-center text-[11px] font-medium text-zinc-400">
                Includes all future engine scrapers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── LIFETIME DEAL (LTD) VIEW ── */}
      {pricingMode === "lifetime" && (
        <div className="mb-12 w-full max-w-5xl">
          <div className="mb-8 rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5 dark:border-amber-400/20">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                  <Gem className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 sm:text-base dark:text-white">
                    Early-Believer Lifetime Allocation
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Pay once, unlock monthly recurring scan credits that
                    automatically renew every year forever.
                  </p>
                </div>
              </div>
              <div className="shrink-0 rounded-full border border-amber-400/40 bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                🔒 Only 38 Licenses Left
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* FOUNDER LTD */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-300/60 bg-gradient-to-b from-amber-50/50 to-white p-8 shadow-sm transition-all duration-300 hover:border-amber-400 hover:shadow-xl dark:border-amber-400/25 dark:from-zinc-900/90 dark:to-zinc-900">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900 dark:border-amber-700/50 dark:bg-amber-950 dark:text-amber-200">
                    Tier 1 — Founder LTD
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    Pay Once
                  </span>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-zinc-950 dark:text-white">
                  Founder Pass
                </h3>
                <p className="mb-6 text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
                  Ideal for solo founders who want ongoing access without
                  recurring monthly subscriptions.
                </p>

                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                    $149
                  </span>
                  <span className="text-sm font-semibold text-zinc-500">
                    one-time payment
                  </span>
                </div>
                <p className="mb-6 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Saves $199+ in your first year alone
                </p>

                <div className="space-y-6 border-t border-amber-200/60 pt-6 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-amber-800 uppercase dark:text-amber-300">
                      Recurring Allowance
                    </span>
                    <ul className="mt-3 space-y-3">
                      <FeatureItem
                        label="30 Reddit scans / month renewed forever"
                        highlight
                      />
                      <FeatureItem label="Credits refresh automatically on anniversary" />
                      <FeatureItem label="20% permanent discount on extra credit top-ups" />
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                      Founder Perks
                    </span>
                    <ul className="mt-3 space-y-3">
                      <FeatureItem label="Deep pain-point extraction & clustering" />
                      <FeatureItem label="Subreddit activity heatmaps" />
                      <FeatureItem label="Early access to Phase 6 scrapers" />
                      <FeatureItem label="Exclusive Founder badge on your account ✨" />
                      <FeatureItem label="Upgrade to Pro LTD for $150 difference anytime" />
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-amber-200/60 pt-6 dark:border-zinc-800">
                <Link
                  href="/sign-up?plan=founder-ltd"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-amber-400 bg-white text-sm font-bold text-amber-950 transition-all duration-200 hover:bg-amber-50 hover:shadow-sm dark:bg-zinc-800 dark:text-amber-100 dark:hover:bg-zinc-700"
                >
                  Claim Founder Access ($149)
                </Link>
                <p className="mt-3 text-center text-[11px] font-medium text-zinc-500">
                  Lifetime entitlement · Instant activation · No renewal fees
                </p>
              </div>
            </div>

            {/* PROFESSIONAL LTD */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-100/40 via-white to-white p-8 shadow-xl shadow-amber-500/10 dark:border-amber-400 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
              <div className="absolute top-0 right-0 flex items-center gap-1.5 rounded-bl-2xl bg-amber-400 px-4 py-1.5 text-[11px] font-black tracking-wider text-amber-950 uppercase shadow-xs">
                <span>💎</span>
                <span>Best Lifetime Value</span>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full border border-amber-400 bg-amber-200/70 px-3 py-1 text-xs font-extrabold text-amber-950 dark:bg-amber-900/60 dark:text-amber-100">
                    Tier 2 — Professional LTD
                  </span>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-zinc-950 dark:text-white">
                  Studio Master
                </h3>
                <p className="mb-6 text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
                  For serious market researchers and studios running deep weekly
                  intelligence cycles.
                </p>

                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                    $299
                  </span>
                  <span className="text-sm font-semibold text-zinc-500">
                    one-time payment
                  </span>
                </div>
                <p className="mb-6 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Saves $529+ annually vs monthly Pro plan
                </p>

                <div className="space-y-6 border-t border-amber-300 pt-6 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-amber-900 uppercase dark:text-amber-300">
                      Power Allowance
                    </span>
                    <ul className="mt-3 space-y-3">
                      <FeatureItem
                        label="100 Reddit scans / month renewed forever"
                        highlight
                      />
                      <FeatureItem
                        label="Credits refresh automatically on anniversary"
                        highlight
                      />
                      <FeatureItem
                        label="40% permanent discount on extra credit top-ups"
                        highlight
                      />
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
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
                        label="Phase 7 & 8 multi-platform scrapers (early access)"
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

              <div className="mt-8 border-t border-amber-300 pt-6 dark:border-zinc-800">
                <Link
                  href="/sign-up?plan=professional-ltd"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 text-sm font-bold text-amber-950 transition-all duration-300 hover:bg-amber-300 hover:shadow-md hover:shadow-amber-400/25"
                >
                  <span>Claim Professional LTD ($299)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-[11px] font-medium text-zinc-500">
                  One-time · Guaranteed lifetime maintenance & updates
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE FEATURE COMPARISON TOGGLE ── */}
      <div className="my-6 flex w-full max-w-5xl flex-col items-center">
        <button
          type="button"
          onClick={() => setShowFeatureMatrix(!showFeatureMatrix)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/60 px-5 py-2.5 text-xs font-bold text-zinc-800 shadow-xs backdrop-blur-md transition-all hover:bg-white dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Layers className="h-3.5 w-3.5 text-[#ff4500]" />
          <span>
            {showFeatureMatrix
              ? "Hide Plan Comparison Matrix"
              : "View Detailed Feature Comparison"}
          </span>
        </button>

        {showFeatureMatrix && (
          <div className="mt-6 w-full overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-bold tracking-wider text-zinc-400 uppercase dark:border-white/10">
                    <th className="pt-2 pb-4">Feature / Capability</th>
                    <th className="pt-2 pb-4 text-center">Starter</th>
                    <th className="pt-2 pb-4 text-center text-[#ff4500]">
                      Growth
                    </th>
                    <th className="pt-2 pb-4 text-center">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs sm:text-sm dark:divide-white/5">
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Monthly Reddit Scans
                    </td>
                    <td className="py-3 text-center text-zinc-500">2 scans</td>
                    <td className="py-3 text-center font-bold text-[#ff4500]">
                      50 scans
                    </td>
                    <td className="py-3 text-center font-bold text-zinc-900 dark:text-white">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Subreddits per Scan
                    </td>
                    <td className="py-3 text-center text-zinc-500">Up to 3</td>
                    <td className="py-3 text-center font-bold text-[#ff4500]">
                      Up to 10
                    </td>
                    <td className="py-3 text-center font-bold text-zinc-900 dark:text-white">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      AI Opportunity Scoring
                    </td>
                    <td className="py-3 text-center text-zinc-400">—</td>
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
                    <td className="py-3 text-center text-zinc-400">—</td>
                    <td className="py-3 text-center font-bold text-emerald-500">
                      ✓ Included
                    </td>
                    <td className="py-3 text-center font-bold text-emerald-500">
                      ✓ Included
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Export Options
                    </td>
                    <td className="py-3 text-center text-zinc-500">CSV Only</td>
                    <td className="py-3 text-center text-zinc-900 dark:text-white">
                      CSV, JSON, Notion
                    </td>
                    <td className="py-3 text-center text-zinc-900 dark:text-white">
                      CSV, JSON, Notion, API
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-zinc-900 dark:text-white">
                      Trend Velocity Alerts
                    </td>
                    <td className="py-3 text-center text-zinc-400">—</td>
                    <td className="py-3 text-center text-zinc-400">—</td>
                    <td className="py-3 text-center font-bold text-emerald-500">
                      ✓ Webhook & Email
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── TRUST & RISK-REVERSAL BANNER ── */}
      <div className="mt-8 grid w-full max-w-5xl grid-cols-1 gap-4 rounded-3xl border border-black/10 bg-white/60 p-6 shadow-xs backdrop-blur-xl sm:grid-cols-3 dark:border-white/10 dark:bg-zinc-900/60">
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
              Instant Access
            </h5>
            <p className="text-[11px] text-zinc-500">
              Scanners and credits unlock immediately on signup.
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
            ? "bg-[#ff4500] text-white"
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
