"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import type { BillingPlan, PlanEntitlements } from "@/lib/plan-gating";

type BillingPageClientProps = {
  stripeConfigured: boolean;
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

export function BillingPageClient({
  stripeConfigured,
  plan,
  entitlements,
  usage,
}: BillingPageClientProps) {
  const [openingPortal, setOpeningPortal] = useState(false);
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

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-[#ff4500]" />
            <p className="font-mono text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">
              Billing & Subscription
            </p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
            Manage Your Plan
          </h2>
          <p className="text-zinc-400 font-medium text-sm">
            Update your payment method, review invoices, and manage your
            subscription in Stripe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111] border-2 border-white/15 p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.6)]">
          <h3 className="text-white text-lg font-black mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#ff4500]" />
            Billing Portal
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Open your Stripe billing portal to update payment methods, view
            invoices, cancel, or restore your subscription.
          </p>
          <button
            type="button"
            onClick={openBillingPortal}
            disabled={openingPortal}
            className="inline-flex items-center gap-2 border border-[#ff8a57] bg-[#ff4500] hover:bg-[#e03d00] disabled:opacity-60 disabled:cursor-not-allowed text-white font-mono text-sm font-bold uppercase tracking-wide px-5 py-2.5 transition-colors"
          >
            {openingPortal ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            Open Billing Portal
          </button>
          {actionState?.type === "error" ? (
            <p className="mt-4 font-mono text-xs text-rose-300">
              {actionState.message}
            </p>
          ) : null}
        </div>

        <div className="bg-[#111] border-2 border-white/15 p-6 space-y-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.6)]">
          <h3 className="text-white text-lg font-black">Current Plan</h3>
          <p className="text-2xl font-black text-[#ff4500] uppercase">{plan}</p>
          <div className="space-y-2 font-mono text-sm text-zinc-400">
            <p>
              Scans this month:{" "}
              <span className="text-white font-bold">
                {usage.monthlyScansUsed}
                {usage.monthlyScansLimit === null
                  ? ""
                  : ` / ${usage.monthlyScansLimit}`}
              </span>
            </p>
            <p>
              Max subreddits/search:{" "}
              <span className="text-white font-bold">
                {entitlements.maxSubredditsPerSearch === null
                  ? "Unlimited"
                  : entitlements.maxSubredditsPerSearch}
              </span>
            </p>
            <p>
              Save reports:{" "}
              <span className="text-white font-bold">
                {entitlements.canSaveReports ? "Enabled" : "Upgrade required"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
