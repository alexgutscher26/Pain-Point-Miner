"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Magnet, RotateCw } from "lucide-react";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const getPricing = (monthly: number) => {
    if (!isYearly) {
      return {
        displayPrice: `$${monthly}`,
        suffix: "/month",
        detail: null,
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
      detail: `$${yearlyTotal} billed yearly`,
    };
  };

  const starterPricing = getPricing(15);
  const growthPricing = getPricing(29);
  const proPricing = getPricing(69);

  return (
    <section
      className="flex w-full flex-col items-center border-y-2 border-white/[0.03] bg-[#111] px-4 py-24 sm:px-6 sm:py-32"
      id="pricing"
    >
      <div className="mb-12 max-w-2xl text-center">
        <h2 className="mb-4 text-[11px] font-extrabold tracking-widest text-[#ff4500] uppercase">
          PRICING
        </h2>
        <h3 className="mb-6 text-[40px] leading-[1.1] font-extrabold tracking-[-0.02em] text-[#f4f4f5] md:text-[56px]">
          Pricing Plans
        </h3>
        <p className="mb-10 text-[17px] font-medium text-zinc-400">
          Scale your market research as you grow from idea to product.
        </p>

        <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/5 bg-[#1a1a1a] p-1.5 shadow-inner sm:rounded-full">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`rounded-full px-6 py-2.5 text-[13px] font-extrabold shadow-sm transition-all sm:px-8 sm:text-[14px] ${!isYearly ? "border border-[#ff4500]/20 bg-[#ff4500]/10 text-[#ff4500]" : "border border-transparent text-zinc-400 hover:text-white"}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-extrabold shadow-sm transition-all sm:px-8 sm:text-[14px] ${isYearly ? "border border-[#ff4500]/20 bg-[#ff4500]/10 text-[#ff4500]" : "border border-transparent text-zinc-400 hover:text-white"}`}
          >
            Yearly{" "}
            <span className="text-[10px] font-black tracking-wider text-[#ff4500] uppercase">
              Save 2 months
            </span>
          </button>
        </div>
      </div>

      <div className="mb-12 grid w-full max-w-[1100px] grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        {/* Starter Plan */}
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-white/5 bg-[#141414] shadow-2xl transition-all hover:border-[#ff4500]/20">
          <div className="relative z-10 p-8 pb-6">
            <h3 className="mb-2 text-[19px] font-extrabold text-white">
              Starter
            </h3>
            <p className="mb-6 text-[13px] font-medium text-zinc-500">
              Perfect for founders exploring early ideas.
            </p>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] leading-none font-extrabold tracking-tight text-white">
                {starterPricing.displayPrice}
              </span>
              <span className="text-[14px] font-semibold text-zinc-400">
                {starterPricing.suffix}
              </span>
            </div>
            {starterPricing.detail ? (
              <p className="-mt-3 text-[12px] font-semibold text-zinc-500">
                {starterPricing.detail}
              </p>
            ) : null}
          </div>

          <div className="relative z-10 mb-8 w-full flex-1 px-8">
            <SectionHeader
              icon={<Magnet className="h-3.5 w-3.5" />}
              label="INBOUND"
            />
            <ul className="mb-8 space-y-4">
              <FeatureItem label="10 Reddit scans per month" />
              <FeatureItem label="Up to 3 subreddits per search" />
              <FeatureItem label="Access to top Reddit posts" />
            </ul>

            <SectionHeader
              icon={<RotateCw className="h-3.5 w-3.5" />}
              label="ENGAGE"
            />
            <ul className="space-y-4">
              <FeatureItem label="Basic pain-point extraction" />
              <FeatureItem label="Mention count insights" />
              <FeatureItem label="Export basic report" />
              <FeatureItem label="Email support" />
            </ul>
          </div>

          <div className="relative z-10 mt-auto w-full border-t border-white/5 bg-white/[0.01] p-8 pt-6">
            <Link
              href={`/sign-up?plan=starter&billing=${isYearly ? "yearly" : "monthly"}`}
              className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-[14px] font-extrabold text-white transition-all hover:bg-white/10"
            >
              Get Started
            </Link>
            <p className="mb-1 text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
              Best for:
            </p>
            <p className="text-[13px] leading-tight font-medium text-zinc-300">
              Early-stage founders validating first ideas.
            </p>
          </div>
        </div>

        {/* Growth Plan - Featured */}
        <div className="group relative z-20 flex flex-col overflow-hidden rounded-2xl border-2 border-[#ff4500]/40 bg-[#141414] shadow-[0_0_40px_rgba(255,69,0,0.1)] lg:scale-105">
          <div className="absolute top-0 right-0 flex items-center gap-1.5 rounded-bl-lg border-b border-l border-white/20 bg-linear-to-r from-[#ff4500] to-[#ff571a] px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
            <span className="text-[12px]">⭐</span> Most Popular
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff4500]/5 to-transparent"></div>

          <div className="relative z-10 p-8 pb-6">
            <h3 className="mb-2 text-[19px] font-extrabold text-white">
              Growth
            </h3>
            <p className="mb-6 text-[13px] font-medium text-zinc-500">
              For builders actively researching markets.
            </p>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] leading-none font-extrabold tracking-tight text-white">
                {growthPricing.displayPrice}
              </span>
              <span className="text-[14px] font-semibold text-zinc-400">
                {growthPricing.suffix}
              </span>
            </div>
            {growthPricing.detail ? (
              <p className="-mt-3 text-[12px] font-semibold text-zinc-500">
                {growthPricing.detail}
              </p>
            ) : null}
          </div>

          <div className="relative z-10 mb-8 w-full flex-1 px-8">
            <SectionHeader
              icon={<Magnet className="h-3.5 w-3.5" />}
              label="INBOUND"
              spotlight
            />
            <ul className="mb-8 space-y-4">
              <FeatureItem label="50 Reddit scans per month" />
              <FeatureItem label="Up to 10 subreddits per search" />
              <FeatureItem label="Everything in Starter" />
            </ul>

            <SectionHeader
              icon={<RotateCw className="h-3.5 w-3.5" />}
              label="ENGAGE"
              spotlight
            />
            <ul className="space-y-4">
              <FeatureItem label="Advanced pain-point clustering" />
              <FeatureItem label="Opportunity scoring" />
              <FeatureItem label="Sentiment analysis" />
              <FeatureItem label="Save and organize reports" />
              <FeatureItem label="Export full insights" />
              <FeatureItem label="Priority processing" />
            </ul>
          </div>

          <div className="relative z-10 mt-auto w-full border-t border-white/5 bg-[#ff4500]/5 p-8 pt-6">
            <Link
              href={`/sign-up?plan=growth&billing=${isYearly ? "yearly" : "monthly"}`}
              className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#ff4500] bg-[#ff4500] text-[14px] font-extrabold text-black shadow-lg shadow-[#ff4500]/20 transition-all hover:bg-[#ff571a]"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mb-1 text-[11px] font-bold tracking-widest text-[#ff4500] uppercase">
              Best for:
            </p>
            <p className="text-[13px] leading-tight font-semibold text-zinc-300">
              Indie hackers and SaaS founders building products.
            </p>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-white/5 bg-[#141414] shadow-2xl transition-all hover:border-[#ff4500]/20">
          <div className="relative z-10 p-8 pb-6">
            <h3 className="mb-2 text-[19px] font-extrabold text-white">Pro</h3>
            <p className="mb-6 text-[13px] font-medium text-zinc-500">
              For teams doing serious market research.
            </p>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] leading-none font-extrabold tracking-tight text-white">
                {proPricing.displayPrice}
              </span>
              <span className="text-[14px] font-semibold text-zinc-400">
                {proPricing.suffix}
              </span>
            </div>
            {proPricing.detail ? (
              <p className="-mt-3 text-[12px] font-semibold text-zinc-500">
                {proPricing.detail}
              </p>
            ) : null}
          </div>

          <div className="relative z-10 mb-8 w-full flex-1 px-8">
            <SectionHeader
              icon={<Magnet className="h-3.5 w-3.5" />}
              label="INBOUND"
            />
            <ul className="mb-8 space-y-4">
              <FeatureItem label="Unlimited Reddit scans" />
              <FeatureItem label="Analyze unlimited subreddits" />
              <FeatureItem label="Everything in Growth" />
            </ul>

            <SectionHeader
              icon={<RotateCw className="h-3.5 w-3.5" />}
              label="ENGAGE"
            />
            <ul className="space-y-4">
              <FeatureItem label="Deep Reddit thread analysis" />
              <FeatureItem label="AI-generated SaaS opportunities" />
              <FeatureItem label="Trend detection & tracking" />
              <FeatureItem label="Team workspace (coming soon)" />
              <FeatureItem label="API access (coming soon)" />
              <FeatureItem label="Priority support" />
            </ul>
          </div>

          <div className="relative z-10 mt-auto w-full border-t border-white/5 bg-white/[0.01] p-8 pt-6">
            <Link
              href={`/sign-up?plan=pro&billing=${isYearly ? "yearly" : "monthly"}`}
              className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-[14px] font-extrabold text-white transition-all hover:bg-white/10"
            >
              Get Started
            </Link>
            <p className="mb-1 text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
              Best for:
            </p>
            <p className="text-[13px] leading-tight font-medium text-zinc-300">
              Startup teams, agencies, and product researchers.
            </p>
          </div>
        </div>
      </div>

      {/* ── LIFETIME DEAL SECTION ── */}
      <div className="mt-16 w-full max-w-[1100px]">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-[11px] font-black tracking-[0.25em] text-amber-400 uppercase">
            ⚡ Limited Early-Believer Offer
          </span>
          <h3 className="mb-3 text-[32px] font-extrabold tracking-tight text-white md:text-[40px]">
            Lifetime Access
          </h3>
          <p className="mx-auto max-w-lg text-[15px] font-medium text-zinc-400">
            One payment. No subscriptions. Monthly credits that reset forever on
            your anniversary — plus permanent rollover top-ups at founder rates.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* FOUNDER LTD */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-amber-400/20 bg-[#141414] shadow-2xl transition-all hover:border-amber-400/40">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 to-transparent" />
            <div className="relative z-10 p-8 pb-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-0.5 text-[10px] font-black tracking-widest text-amber-400 uppercase">
                  Tier 1 — Founder
                </span>
              </div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-[48px] leading-none font-extrabold tracking-tight text-white">
                  $149
                </span>
                <span className="text-[14px] font-semibold text-zinc-400">
                  one-time
                </span>
              </div>
              <p className="mb-6 text-[13px] font-medium text-zinc-500">
                Perfect for solopreneurs who want to lock in early.
              </p>
            </div>

            <div className="relative z-10 flex-1 px-8 pb-4">
              <SectionHeader
                icon={<Magnet className="h-3.5 w-3.5" />}
                label="MONTHLY CREDITS"
              />
              <ul className="mb-8 space-y-4">
                <FeatureItem label="30 Reddit scans / month — forever" />
                <FeatureItem label="Credits reset on your anniversary date" />
                <FeatureItem label="20% discount on extra credit top-ups" />
              </ul>
              <SectionHeader
                icon={<RotateCw className="h-3.5 w-3.5" />}
                label="FEATURES"
              />
              <ul className="space-y-4">
                <FeatureItem label="Basic + Deep pain-point extraction" />
                <FeatureItem label="Subreddit heatmaps" />
                <FeatureItem label="Early access to new scrapers" />
                <FeatureItem label="Founder badge on your account ✨" />
                <FeatureItem label="Upgrade to Pro for just $150 later" />
              </ul>
            </div>

            <div className="relative z-10 mt-auto w-full border-t border-amber-400/10 bg-amber-400/[0.03] p-8 pt-6">
              <Link
                href="/sign-up?plan=founder-ltd"
                className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-amber-400/60 bg-transparent text-[14px] font-extrabold text-amber-400 transition-all hover:bg-amber-400/10"
              >
                Get Founder Access
              </Link>
              <p className="text-center text-[11px] font-bold text-zinc-500">
                One-time · No recurring fees · Unlock on signup
              </p>
            </div>
          </div>

          {/* PROFESSIONAL LTD */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-[#141414] shadow-[0_0_60px_rgba(251,191,36,0.08)]">
            <div className="absolute top-0 right-0 flex items-center gap-1.5 rounded-bl-lg border-b border-l border-amber-400/30 bg-linear-to-r from-amber-500 to-amber-400 px-4 py-1.5 text-[10px] font-black tracking-widest text-black uppercase shadow-lg">
              <span>💎</span> Best Value
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/8 to-transparent" />

            <div className="relative z-10 p-8 pb-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full border border-amber-400/60 bg-amber-400/15 px-3 py-0.5 text-[10px] font-black tracking-widest text-amber-400 uppercase">
                  Tier 2 — Professional
                </span>
              </div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-[48px] leading-none font-extrabold tracking-tight text-white">
                  $299
                </span>
                <span className="text-[14px] font-semibold text-zinc-400">
                  one-time
                </span>
              </div>
              <p className="mb-1 text-[12px] font-semibold text-amber-400">
                Already a Founder? Upgrade for just $150.
              </p>
              <p className="mb-6 text-[13px] font-medium text-zinc-500">
                For serious builders who want the full arsenal.
              </p>
            </div>

            <div className="relative z-10 flex-1 px-8 pb-4">
              <SectionHeader
                icon={<Magnet className="h-3.5 w-3.5" />}
                label="MONTHLY CREDITS"
                spotlight
              />
              <ul className="mb-8 space-y-4">
                <FeatureItem label="100 Reddit scans / month — forever" spotlight />
                <FeatureItem label="Credits reset on your anniversary date" spotlight />
                <FeatureItem label="40% discount on extra credit top-ups" spotlight />
              </ul>
              <SectionHeader
                icon={<RotateCw className="h-3.5 w-3.5" />}
                label="FEATURES"
                spotlight
              />
              <ul className="space-y-4">
                <FeatureItem label="Everything in Founder" spotlight />
                <FeatureItem label="Advanced AI mining depth" spotlight />
                <FeatureItem label="Trend Velocity engine" spotlight />
                <FeatureItem label="Phase 7 & 8 scrapers (early access)" spotlight />
                <FeatureItem label="Pro Founder badge 💎" spotlight />
                <FeatureItem label="Priority support & feature requests" spotlight />
              </ul>
            </div>

            <div className="relative z-10 mt-auto w-full border-t border-amber-400/20 bg-amber-400/[0.05] p-8 pt-6">
              <Link
                href="/sign-up?plan=professional-ltd"
                className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-400 text-[14px] font-extrabold text-black shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300"
              >
                Get Professional Access <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-center text-[11px] font-bold text-zinc-500">
                One-time · No recurring fees · Unlock on signup
              </p>
            </div>
          </div>
        </div>

        {/* Rollover explanation */}
        <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center">
          <p className="text-[13px] font-medium text-zinc-400">
            <span className="font-bold text-white">How credits work:</span>{" "}
            Your monthly base resets every month on your signup anniversary — unused base credits{" "}
            <span className="font-bold text-amber-400">do not roll over</span>. But{" "}
            <span className="font-bold text-white">purchased top-up credits</span> are permanent
            and roll over forever, used only after your monthly base is exhausted.
          </p>
        </div>
      </div>

      <div className="relative mx-0 mt-12 flex w-full max-w-[700px] flex-col items-center justify-center overflow-hidden rounded-xl border border-[#7a281c] bg-[#140a08] px-5 py-8 text-center shadow-lg sm:mx-4 sm:px-12">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        <h4 className="mb-2 text-[18px] font-extrabold tracking-tight text-white">
          Start your 3-day free trial. No credit card required.
        </h4>
      </div>
    </section>
  );
}

function SectionHeader({
  icon,
  label,
  spotlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  spotlight?: boolean;
}) {
  return (
    <div className="mt-2 mb-6 flex w-full items-center gap-3">
      <div className={`${spotlight ? "text-[#ff4500]" : "text-zinc-400"}`}>
        {icon}
      </div>
      <h4
        className={`text-[11px] font-extrabold tracking-[0.2em] uppercase ${spotlight ? "text-[#ff4500]" : "text-zinc-400"}`}
      >
        {label}
      </h4>
      <div
        className={`flex-1 border-t ${spotlight ? "border-[#ff4500]/20" : "border-white/5"}`}
      ></div>
    </div>
  );
}

function FeatureItem({
  label,
  spotlight = false,
}: {
  label: string;
  spotlight?: boolean;
}) {
  return (
    <li className="flex items-start gap-4">
      <div
        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${spotlight ? "bg-[#ff4500] text-white" : "bg-[#ff4500]/10 text-[#ff4500]"}`}
      >
        <Check className="h-2.5 w-2.5" strokeWidth={4} />
      </div>
      <span
        className={`flex-1 text-[13px] leading-snug font-extrabold ${spotlight ? "text-white" : "text-zinc-200"}`}
      >
        {label}
      </span>
    </li>
  );
}
