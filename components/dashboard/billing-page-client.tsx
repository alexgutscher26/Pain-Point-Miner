"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import type { BillingPlan, PlanEntitlements } from "@/lib/plan-gating";

type BillingPurchaseOption = {
  plan: BillingPlan;
  yearlyAvailable: boolean;
};

type BillingPageClientProps = {
  stripeConfigured: boolean;
  availablePlans: BillingPurchaseOption[];
  plan: BillingPlan;
  planPurchaseRequired: boolean;
  entitlements: PlanEntitlements;
  usage: {
    monthlyUsed: number;
    monthlyLimit: number | null;
    monthlyRemaining: number | null;
    purchasedRemaining: number;
    totalRemaining: number | null;
  };
  ltdTier?: string | null;
};

type BillingActionState = {
  type: "success" | "error";
  message: string;
} | null;

async function safeJson(res: Response): Promise<any> {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export function BillingPageClient({
  stripeConfigured,
  availablePlans,
  plan,
  ltdTier,
  planPurchaseRequired,
  entitlements,
  usage,
}: BillingPageClientProps) {
  const [openingPortal, setOpeningPortal] = useState(false);
  const [startingCheckoutPlan, setStartingCheckoutPlan] =
    useState<BillingPlan | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [actionState, setActionState] = useState<BillingActionState>(null);

  const displayLtdTier = ltdTier || "none";

  async function openBillingPortal() {
    if (!stripeConfigured) {
      return;
    }

    setOpeningPortal(true);

    try {
      const res = await fetch("/api/auth/subscription/billing-portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/billing`,
          disableRedirect: false,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(
          data?.message ?? "Unable to open billing portal right now.",
        );
      }

      if (data?.url) {
        const url = new URL(data.url, window.location.origin);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("Invalid redirect URL.");
        }
        window.location.href = data.url;
        return;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      setActionState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to open billing portal.",
      });
    } finally {
      setOpeningPortal(false);
    }
  }

  async function startLtdCheckout(targetTier: "founder" | "professional") {
    if (!stripeConfigured) {
      return;
    }

    setStartingCheckoutPlan(targetTier as any);
    setActionState(null);

    try {
      const res = await fetch("/api/billing/create-ltd-checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier: targetTier }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to start LTD checkout.");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Checkout URL was not returned.");
    } catch (error) {
      console.error("Error starting LTD checkout:", error);
      setActionState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to start LTD checkout.",
      });
    } finally {
      setStartingCheckoutPlan(null);
    }
  }

  async function startCheckout(targetPlan: BillingPlan) {
    if (!stripeConfigured) {
      return;
    }

    setStartingCheckoutPlan(targetPlan);
    setActionState(null);

    try {
      const res = await fetch("/api/auth/subscription/upgrade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan: targetPlan,
          annual: billingInterval === "yearly",
          successUrl: `${window.location.origin}/dashboard/billing`,
          cancelUrl: `${window.location.origin}/dashboard/billing`,
          returnUrl: `${window.location.origin}/dashboard/billing`,
          disableRedirect: true,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(
          data?.message ?? "Unable to start checkout for this plan.",
        );
      }

      if (data?.url) {
        const url = new URL(data.url, window.location.origin);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("Invalid redirect URL.");
        }
        window.location.href = data.url;
        return;
      }

      throw new Error("Checkout URL was not returned.");
    } catch (error) {
      console.error("Error starting checkout:", error);
      setActionState({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to start checkout.",
      });
    } finally {
      setStartingCheckoutPlan(null);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-7xl space-y-8 p-4 duration-500 sm:p-6 lg:p-8">
      {/* Page Title */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4500]"></span>
            </span>
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
              Billing & Subscription
            </p>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Manage Your Plan
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed font-medium text-zinc-500">
            Update your payment methods, review transaction invoices, or change
            your subscription tiers via Stripe.
          </p>
        </div>
      </div>

      {/* Plan Inactive Banner */}
      {planPurchaseRequired ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 px-5 py-4">
          <div>
            <p className="mb-1 font-mono text-[10px] font-black tracking-widest text-rose-600 uppercase">
              Plan Inactive
            </p>
            <p className="text-sm font-semibold text-rose-700">
              Your account is in read-only mode. Purchase a plan to resume new
              searches and unlock paid features.
            </p>
          </div>
        </div>
      ) : null}

      {/* Available Plans Section */}
      {availablePlans.length > 0 ? (
        <div className="glass-card space-y-6 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-zinc-900">
                Purchase a Subscription
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                Choose a paid plan to unlock full access or upgrade your current
                account.
              </p>
            </div>

            {/* Toggle Billing Interval */}
            <div className="inline-flex items-center gap-1 self-start rounded-full border border-black/[0.05] bg-white/50 p-1 shadow-xs backdrop-blur-md md:self-auto">
              <button
                type="button"
                onClick={() => setBillingInterval("monthly")}
                className={`cursor-pointer rounded-full px-4 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
                  billingInterval === "monthly"
                    ? "bg-[#ff4500] text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval("yearly")}
                className={`cursor-pointer rounded-full px-4 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
                  billingInterval === "yearly"
                    ? "bg-[#ff4500] text-white shadow-xs"
                    : "text-zinc-550 hover:text-zinc-855"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {availablePlans.map(({ plan: targetPlan, yearlyAvailable }) => {
              const isCurrentPlan =
                !planPurchaseRequired && targetPlan === plan;
              const isLoading = startingCheckoutPlan === targetPlan;
              const yearlyDisabled =
                billingInterval === "yearly" && !yearlyAvailable;

              return (
                <button
                  key={targetPlan}
                  type="button"
                  onClick={() => startCheckout(targetPlan)}
                  disabled={
                    isCurrentPlan ||
                    isLoading ||
                    !stripeConfigured ||
                    yearlyDisabled
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#ff4500] px-6 py-3 font-mono text-xs font-bold tracking-widest text-white uppercase shadow-xs transition-colors hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {isCurrentPlan
                    ? `${targetPlan} (Active)`
                    : yearlyDisabled
                      ? `Yearly unavailable`
                      : `Buy ${targetPlan} ${billingInterval}`}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* LTD (Lifetime Deals) Section */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.02] to-amber-600/[0.04] p-6 shadow-xs sm:p-8">
        <div className="pointer-events-none absolute top-0 right-0 p-6 text-amber-500 opacity-[0.03]">
          <CreditCard className="h-28 w-28 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-amber-700 uppercase">
              Early Believer Offer
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950 uppercase sm:text-3xl">
              Lifetime Deals
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
              One-time payment for lifetime access. Support early development
              and avoid recurring fees forever. Includes monthly recurring base
              credits plus heavily discounted top-up rates.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-6 sm:flex-row">
            {/* TIER 1: FOUNDER LTD */}
            <div className="flex w-full flex-col justify-between rounded-2xl border border-black/[0.04] bg-white/60 p-6 backdrop-blur-md sm:w-64">
              <div>
                <span className="font-mono text-[9px] font-black tracking-widest text-amber-600 uppercase">
                  Tier 1
                </span>
                <h4 className="mt-1 text-base font-extrabold text-zinc-900">
                  Founder LTD
                </h4>
                <div className="text-zinc-955 mt-4 mb-5 flex items-baseline gap-1">
                  <span className="text-3xl font-black">$149</span>
                  <span className="text-xs font-medium text-zinc-400">
                    one-time
                  </span>
                </div>
                <ul className="mb-6 space-y-2.5 text-xs font-medium text-zinc-500">
                  <li className="flex items-center gap-2">
                    ✓ 30 scans / month
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ Subreddit heatmaps
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ Basic + Deep extraction
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ 20% top-up discount
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => startLtdCheckout("founder")}
                disabled={ltdTier === "founder" || ltdTier === "professional"}
                className="inline-flex cursor-pointer justify-center rounded-full border border-amber-500/50 bg-amber-500/5 px-4 py-2.5 font-mono text-xs font-bold text-amber-700 uppercase transition-all hover:bg-amber-500 hover:text-white disabled:opacity-40"
              >
                {ltdTier === "founder" || ltdTier === "professional"
                  ? "Owned"
                  : "Buy Founder LTD"}
              </button>
            </div>

            {/* TIER 2: PROFESSIONAL LTD */}
            <div className="flex w-full flex-col justify-between rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 shadow-sm backdrop-blur-md sm:w-64">
              <div>
                <span className="font-mono text-[9px] font-black tracking-widest text-amber-600 uppercase">
                  Tier 2
                </span>
                <h4 className="mt-1 text-base font-extrabold text-zinc-900">
                  Professional LTD
                </h4>
                <div className="text-zinc-955 mt-4 mb-5 flex items-baseline gap-1">
                  <span className="text-3xl font-black">
                    {ltdTier === "founder" ? "$150" : "$299"}
                  </span>
                  <span className="text-xs font-medium text-zinc-400">
                    {ltdTier === "founder" ? "upgrade" : "one-time"}
                  </span>
                </div>
                <ul className="mb-6 space-y-2.5 text-xs font-medium text-zinc-500">
                  <li className="flex items-center gap-2">
                    ✓ 100 scans / month
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ Advanced AI depth
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ Trend Velocity engine
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ 40% top-up discount
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => startLtdCheckout("professional")}
                disabled={ltdTier === "professional"}
                className="bg-amber-550 inline-flex cursor-pointer justify-center rounded-full px-4 py-2.5 font-mono text-xs font-bold text-black uppercase transition-colors hover:bg-amber-600 disabled:opacity-40"
              >
                {ltdTier === "professional"
                  ? "Active"
                  : ltdTier === "founder"
                    ? "Upgrade to Pro"
                    : "Buy Pro LTD"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Portal & Current Access Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Stripe Portal */}
        <div className="glass-card flex flex-col justify-between rounded-2xl p-6 sm:p-8 lg:col-span-2">
          <div>
            <h3 className="flex items-center gap-2.5 text-lg font-extrabold text-zinc-900">
              <CreditCard className="h-5 w-5 text-[#ff4500]" />
              Billing Portal
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Open your Stripe billing portal to update payment methods, view
              invoices, download receipts, or cancel/restore your subscription
              safely.
            </p>
          </div>
          <div className="mt-8">
            <button
              type="button"
              onClick={openBillingPortal}
              disabled={openingPortal}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#ff4500] px-6 py-3 font-mono text-xs font-bold tracking-widest text-white uppercase shadow-xs transition-colors hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {openingPortal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Open Billing Portal
            </button>
            {actionState?.type === "error" ? (
              <p className="mt-4 font-mono text-xs text-rose-600">
                {actionState.message}
              </p>
            ) : null}
          </div>
        </div>

        {/* Current Access Quotas */}
        <div className="glass-card space-y-6 rounded-2xl p-6 sm:p-8">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-900">
              Current Access
            </h3>
            <div className="mt-3 flex items-center gap-2 text-xl font-extrabold text-[#ff4500] uppercase">
              {planPurchaseRequired ? "Read Only" : plan}
              {ltdTier && ltdTier !== "none" && (
                <span className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[9px] font-black tracking-widest text-white uppercase">
                  {ltdTier === "founder" ? "FOUNDER" : "PRO FOUNDER"}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs text-zinc-500">
            <div className="flex justify-between border-b border-black/[0.04] pb-3">
              <span>Status:</span>
              <span className="text-zinc-850 font-bold uppercase">
                {ltdTier && ltdTier !== "none"
                  ? "Lifetime access"
                  : planPurchaseRequired
                    ? "Plan inactive"
                    : "Active plan"}
              </span>
            </div>

            {/* Usage credit display */}
            <div className="space-y-2">
              <p className="text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
                Quota Usage
              </p>
              <div className="space-y-1">
                <p className="flex justify-between font-medium">
                  <span>Monthly Base:</span>
                  <span className="font-bold text-zinc-800">
                    {usage.monthlyUsed} / {usage.monthlyLimit ?? "∞"}
                  </span>
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.04]">
                  <div
                    className="h-full rounded-full bg-[#ff4500] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (usage.monthlyUsed / (usage.monthlyLimit ?? 100)) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="flex justify-between pt-1 font-medium">
                  <span>Rollover Credits:</span>
                  <span className="font-bold text-amber-600">
                    {usage.purchasedRemaining}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-black/[0.04] pt-3">
              <p className="flex justify-between">
                <span>Max subreddits:</span>
                <span className="font-bold text-zinc-800">
                  {planPurchaseRequired
                    ? "Upgrade required"
                    : entitlements.maxSubredditsPerSearch === null
                      ? "Unlimited"
                      : entitlements.maxSubredditsPerSearch}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Save reports:</span>
                <span className="font-bold text-zinc-800">
                  {planPurchaseRequired
                    ? "View-only"
                    : entitlements.canSaveReports
                      ? "Enabled"
                      : "Upgrade required"}
                </span>
              </p>
            </div>
            {planPurchaseRequired ? (
              <p className="font-sans text-[11px] leading-relaxed text-amber-700/85 italic">
                New scans and AI actions unlock after you purchase an active
                plan.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
