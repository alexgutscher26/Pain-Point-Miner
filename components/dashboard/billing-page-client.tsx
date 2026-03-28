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
    monthlyScansUsed: number;
    monthlyScansLimit: number | null;
    monthlyScansRemaining: number | null;
  };
};

type BillingActionState = {
  type: "success" | "error";
  message: string;
} | null;

export function BillingPageClient({
  stripeConfigured,
  availablePlans,
  plan,
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
          </p>
          <div className="space-y-2 font-mono text-sm text-zinc-400">
            <p>
              Status:{" "}
              <span className="font-bold text-white">
                {planPurchaseRequired
                  ? "Plan inactive"
                  : trialActive
                    ? "Free trial"
                    : "Active plan"}
              </span>
            </p>
            <p>
              Scans this month:{" "}
              <span className="font-bold text-white">
                {planPurchaseRequired
                  ? "Read only"
                  : `${usage.monthlyScansUsed}${
                      usage.monthlyScansLimit === null
                        ? ""
                        : ` / ${usage.monthlyScansLimit}`
                    }`}
              </span>
            </p>
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
