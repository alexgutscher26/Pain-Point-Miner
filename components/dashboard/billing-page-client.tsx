"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import type { BillingPlan, PlanEntitlements } from "@/lib/plan-gating";

type BillingPageClientProps = {
  stripeConfigured: boolean;
  stripeSubscriptionConfigured: boolean;
  plan: BillingPlan;
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

type CheckoutPlan = "growth" | "pro";

export function BillingPageClient({
  stripeConfigured,
  stripeSubscriptionConfigured,
  plan,
  entitlements,
  usage,
}: BillingPageClientProps) {
  const [openingPortal, setOpeningPortal] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<CheckoutPlan | null>(null);
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
        throw new Error(data?.message ?? "Unable to open billing portal right now.");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      setActionState({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to open billing portal.",
      });
    } finally {
      setOpeningPortal(false);
    }
  }

  async function startTrial(targetPlan: CheckoutPlan) {
    if (!stripeConfigured || !stripeSubscriptionConfigured) {
      setActionState({
        type: "error",
        message: "Stripe subscriptions are not configured yet.",
      });
      return;
    }

    setUpgradingPlan(targetPlan);
    setActionState(null);

    try {
      const res = await fetch("/api/auth/subscription/upgrade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan: targetPlan,
          annual: false,
          successUrl: `${window.location.origin}/dashboard/billing?checkout=success`,
          cancelUrl: `${window.location.origin}/dashboard/billing?checkout=cancelled`,
          disableRedirect: false,
        }),
      });

      const data = (await res.json().catch(() => null)) as { url?: string; message?: string } | null;

      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to start subscription checkout.");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
      setActionState({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to start trial checkout.",
      });
    } finally {
      setUpgradingPlan(null);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-[#ff4500]" />
            <p className="text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">Billing & Subscription</p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">Manage Your Plan</h2>
          <p className="text-zinc-500 font-medium text-sm">
            Update your payment method, review invoices, and manage your subscription in Stripe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111] rounded-[24px] border border-white/5 p-6">
          <h3 className="text-white text-lg font-black mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#ff4500]" />
            Billing Portal
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Open your Stripe billing portal to update payment methods, view invoices, cancel, or restore your subscription.
          </p>
          <button
            type="button"
            onClick={openBillingPortal}
            disabled={openingPortal}
            className="inline-flex items-center gap-2 bg-[#ff4500] hover:bg-[#e03d00] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          >
            {openingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Open Billing Portal
          </button>
          {actionState?.type === "error" ? (
            <p className="mt-4 text-xs text-rose-400">{actionState.message}</p>
          ) : null}
        </div>

        <div className="bg-[#111] rounded-[24px] border border-white/5 p-6 space-y-4">
          <h3 className="text-white text-lg font-black">Current Plan</h3>
          <p className="text-2xl font-black text-[#ff4500] uppercase">{plan}</p>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              Scans this month:{" "}
              <span className="text-white font-bold">
                {usage.monthlyScansUsed}
                {usage.monthlyScansLimit === null ? "" : ` / ${usage.monthlyScansLimit}`}
              </span>
            </p>
            <p>
              Max subreddits/search:{" "}
              <span className="text-white font-bold">
                {entitlements.maxSubredditsPerSearch === null ? "Unlimited" : entitlements.maxSubredditsPerSearch}
              </span>
            </p>
            <p>
              Save reports:{" "}
              <span className="text-white font-bold">{entitlements.canSaveReports ? "Enabled" : "Upgrade required"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#111] rounded-[24px] border border-white/5 p-6">
        <h3 className="text-white text-lg font-black mb-4">Start 3-Day Trial</h3>
        <p className="text-zinc-400 text-sm mb-5">
          Start a 3-day free trial on Growth or Pro. You can cancel any time from the billing portal.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => startTrial("growth")}
            disabled={upgradingPlan !== null}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all border border-white/10"
          >
            {upgradingPlan === "growth" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Trial Growth
          </button>
          <button
            type="button"
            onClick={() => startTrial("pro")}
            disabled={upgradingPlan !== null}
            className="inline-flex items-center gap-2 bg-[#ff4500] hover:bg-[#e03d00] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            {upgradingPlan === "pro" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Trial Pro
          </button>
        </div>
        {!stripeSubscriptionConfigured ? (
          <p className="mt-4 text-xs text-amber-400">
            Configure `STRIPE_SUBSCRIPTION_ENABLED`, `STRIPE_PRICE_GROWTH_MONTHLY`, and `STRIPE_PRICE_PRO_MONTHLY` to enable checkout.
          </p>
        ) : null}
      </div>
    </div>
  );
}
