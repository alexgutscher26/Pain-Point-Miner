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
  trialActive: boolean;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
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

export function BillingPageClient({
  stripeConfigured,
  availablePlans,
  plan,
  ltdTier,
  planPurchaseRequired,
  trialActive,
  trialEndsAt,
  trialDaysRemaining,
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

      const data = (await res.json()) as { url?: string; message?: string };

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

      const data = (await res.json()) as { url?: string; message?: string };

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
        message: error instanceof Error ? error.message : "Unable to start LTD checkout.",
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

      const data = (await res.json()) as { url?: string; message?: string };

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
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px w-8 bg-[#ff4500]" />
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
              Billing & Subscription
            </p>
          </div>
          <h2 className="mb-3 text-3xl leading-none font-black tracking-tight text-white">
            Manage Your Plan
          </h2>
          <p className="text-sm font-medium text-zinc-400">
            Update your payment method, review invoices, and manage your
            subscription in Stripe.
          </p>
        </div>
      </div>

      {planPurchaseRequired ? (
        <div className="border-2 border-rose-400/60 bg-rose-500/10 px-5 py-4">
          <p className="mb-1 font-mono text-[11px] font-black tracking-widest text-rose-300 uppercase">
            Plan Inactive
          </p>
          <p className="text-sm font-semibold text-rose-100">
            Your account is in read-only mode. Purchase a plan to resume new
            searches and paid features.
          </p>
        </div>
      ) : null}

      {trialActive && trialDaysRemaining !== null ? (
        <div className="border-2 border-amber-400/60 bg-amber-500/10 px-5 py-4">
          <p className="mb-1 font-mono text-[11px] font-black tracking-widest text-amber-300 uppercase">
            Trial Active
          </p>
          <p className="text-sm font-semibold text-amber-100">
            {trialDaysRemaining <= 1
              ? "Your free trial ends in 1 day."
              : `Your free trial ends in ${trialDaysRemaining} days.`}{" "}
            Purchase a plan to keep using premium features.
          </p>
          {trialEndsAt ? (
            <p className="mt-2 font-mono text-[11px] text-amber-200/80">
              Ends {new Date(trialEndsAt).toLocaleDateString("en-US")}
            </p>
          ) : null}
        </div>
      ) : null}

      {availablePlans.length > 0 ? (
        <div className="border-2 border-white/15 bg-[#111] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.6)]">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-black text-white">Purchase Plan</h3>
            <div className="inline-flex items-center gap-2 border border-white/15 bg-[#161616] p-1">
              <button
                type="button"
                onClick={() => setBillingInterval("monthly")}
                className={`px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase ${
                  billingInterval === "monthly"
                    ? "bg-[#ff4500] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval("yearly")}
                className={`px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase ${
                  billingInterval === "yearly"
                    ? "bg-[#ff4500] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-zinc-400">
            Choose a paid plan to restore access after trial expiry or upgrade
            your current account.{" "}
            {billingInterval === "yearly"
              ? "Yearly checkout is selected."
              : "Monthly checkout is selected."}
          </p>
          <div className="flex flex-wrap gap-3">
            {availablePlans.map(({ plan: targetPlan, yearlyAvailable }) => {
              const isCurrentPlan =
                !planPurchaseRequired && targetPlan === plan && !trialActive;
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
                  className="inline-flex items-center gap-2 border border-[#ff8a57] bg-[#ff4500] px-5 py-2.5 font-mono text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {isCurrentPlan
                    ? `${targetPlan} current`
                    : yearlyDisabled
                      ? `Yearly unavailable`
                      : `Buy ${targetPlan} ${billingInterval}`}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* LTD SECTION */}
      <div className="relative overflow-hidden border-2 border-amber-400/30 bg-linear-to-br from-[#111] to-[#16130a] p-8 shadow-[5px_5px_0px_0px_rgba(251,191,36,0.1)]">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CreditCard className="h-24 w-24 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
          <div className="flex-1">
            <p className="mb-2 font-mono text-[11px] font-black tracking-[0.3em] text-amber-400 uppercase">
              Early Believer Offer
            </p>
            <h3 className="mb-4 text-3xl font-black tracking-tight text-white uppercase">
              Lifetime Deals
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
              One-time payment for lifetime access. Support early development and
              avoid recurring fees forever. Includes monthly recurring base
              credits plus heavily discounted top-up rates.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {/* FOUNDER LTD */}
            <div className="flex flex-col border border-white/5 bg-black/40 p-5">
              <span className="mb-1 font-mono text-[10px] text-amber-500 uppercase">
                Tier 1
              </span>
              <span className="mb-3 text-lg font-bold text-white">
                Founder LTD
              </span>
              <span className="mb-4 text-3xl font-black text-white">$149</span>
              <ul className="mb-6 space-y-2 text-xs text-zinc-400">
                <li>✓ 30 scans / month</li>
                <li>✓ Subreddit heatmaps</li>
                <li>✓ Basic + Deep extraction</li>
                <li>✓ 20% credit top-up discount</li>
              </ul>
              <button
                type="button"
                onClick={() => startLtdCheckout("founder")}
                disabled={ltdTier === "founder" || ltdTier === "professional"}
                className="inline-flex justify-center border-2 border-amber-400 px-4 py-2 font-mono text-xs font-bold text-amber-400 uppercase transition-all hover:bg-amber-400 hover:text-black disabled:opacity-30"
              >
                {(ltdTier === "founder" || ltdTier === "professional")
                  ? "Owned"
                  : "Buy Founder LTD"}
              </button>
            </div>
            {/* PRO FOUNDER LTD */}
            <div className="flex flex-col border border-amber-400 bg-amber-400/5 p-5">
              <span className="mb-1 font-mono text-[10px] text-amber-500 uppercase">
                Tier 2
              </span>
              <span className="mb-3 text-lg font-bold text-white">
                Professional LTD
              </span>
              <span className="mb-4 text-3xl font-black text-white">
                {ltdTier === "founder" ? "$150" : "$299"}
              </span>
              <ul className="mb-6 space-y-2 text-xs text-zinc-400">
                <li>✓ 100 scans / month</li>
                <li>✓ Advanced AI depth</li>
                <li>✓ Trend Velocity engine</li>
                <li>✓ 40% credit top-up discount</li>
              </ul>
              <button
                type="button"
                onClick={() => startLtdCheckout("professional")}
                disabled={ltdTier === "professional"}
                className="inline-flex justify-center bg-amber-400 px-4 py-2 font-mono text-xs font-bold text-black uppercase transition-all hover:bg-amber-500 disabled:opacity-30"
              >
                {ltdTier === "professional"
                  ? "Active"
                  : ltdTier === "founder"
                    ? "Upgrade to Pro"
                    : "Buy Professional LTD"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border-2 border-white/15 bg-[#111] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.6)] lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
            <CreditCard className="h-5 w-5 text-[#ff4500]" />
            Billing Portal
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-zinc-400">
            Open your Stripe billing portal to update payment methods, view
            invoices, cancel, or restore your subscription.
          </p>
          <button
            type="button"
            onClick={openBillingPortal}
            disabled={openingPortal}
            className="inline-flex items-center gap-2 border border-[#ff8a57] bg-[#ff4500] px-5 py-2.5 font-mono text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {openingPortal ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Open Billing Portal
          </button>
          {actionState?.type === "error" ? (
            <p className="mt-4 font-mono text-xs text-rose-300">
              {actionState.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-4 border-2 border-white/15 bg-[#111] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.6)]">
          <h3 className="text-lg font-black text-white">Current Access</h3>
          <p className="text-2xl font-black text-[#ff4500] uppercase">
            {planPurchaseRequired ? "Read Only" : plan}
            {ltdTier && ltdTier !== "none" && (
              <span className="ml-2 inline-block rounded-full bg-linear-to-r from-amber-400 to-amber-600 px-2 py-0.5 text-[10px] text-black">
                {ltdTier === "founder" ? "FOUNDER ✨" : "PRO FOUNDER 💎"}
              </span>
            )}
          </p>
          <div className="space-y-2 font-mono text-sm text-zinc-400">
            <p className="border-b border-white/5 pb-1">
              Status:{" "}
              <span className="font-bold text-white uppercase">
                {ltdTier && ltdTier !== "none"
                  ? "Lifetime access"
                  : planPurchaseRequired
                    ? "Plan inactive"
                    : trialActive
                      ? "Free trial"
                      : "Active plan"}
              </span>
            </p>
            <div className="pt-2">
              <p className="mb-1 text-[10px] tracking-widest text-[#ff4500] uppercase">
                Credit Meter
              </p>
              <div className="space-y-1">
                <p className="flex justify-between">
                  <span>Monthly Base:</span>
                  <span className="font-bold text-white">
                    {usage.monthlyUsed} / {usage.monthlyLimit ?? "∞"}
                  </span>
                </p>
                <div className="h-1 w-full bg-white/5">
                  <div
                    className="h-full bg-white"
                    style={{
                      width: `${Math.min(
                        (usage.monthlyUsed / (usage.monthlyLimit ?? 100)) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="flex justify-between pt-1">
                  <span>Permanent (Rollover):</span>
                  <span className="font-bold text-amber-400">
                    {usage.purchasedRemaining}
                  </span>
                </p>
              </div>
            </div>
            <p>
              Max subreddits/search:{" "}
              <span className="font-bold text-white">
                {planPurchaseRequired
                  ? "Requires paid plan"
                  : entitlements.maxSubredditsPerSearch === null
                    ? "Unlimited"
                    : entitlements.maxSubredditsPerSearch}
              </span>
            </p>
            <p>
              Save reports:{" "}
              <span className="font-bold text-white">
                {planPurchaseRequired
                  ? "Past reports stay available"
                  : entitlements.canSaveReports
                    ? "Enabled"
                    : "Upgrade required"}
              </span>
            </p>
            {planPurchaseRequired ? (
              <p className="text-amber-200">
                New scans and AI actions unlock after you purchase a plan.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
