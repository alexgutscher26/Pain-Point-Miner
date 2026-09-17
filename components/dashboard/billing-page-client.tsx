"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, Loader2, Sparkles, ShieldCheck, Check, Zap } from "lucide-react";
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
    useState<string | null>(null);
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

    setStartingCheckoutPlan(targetTier);
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-7xl space-y-8 p-4 duration-500 sm:p-6 lg:p-8">
      {/* Page Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-[#ff4500] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4500]"></span>
            </span>
            Account & Quota Engine
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Billing & Lifetime Access
          </h2>
          <p className="mt-1 max-w-2xl text-[14px] leading-relaxed font-medium text-zinc-500 sm:text-[15px] dark:text-zinc-400">
            Manage your Lifetime Deal allocation, review Stripe receipts, or upgrade your monthly scan allowance.
          </p>
        </div>
      </div>

      {/* Plan Inactive / Read Only Banner */}
      {planPurchaseRequired ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 dark:bg-amber-500/10">
          <div>
            <p className="mb-1 font-mono text-[10px] font-black tracking-widest text-amber-600 uppercase">
              Read-Only Mode Active
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Your account is currently in read-only mode. Claim a Lifetime Deal below to unlock unlimited search depth, automated discovery, and AI pain point clustering.
            </p>
          </div>
        </div>
      ) : null}

      {/*
        NOTE: Recurring monthly subscription plans are intentionally commented out 
        per business model update. Only Lifetime Deals (LTD) are active.
      */}

      {/* LTD (Lifetime Deals) Section */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-b from-white via-zinc-50/60 to-zinc-100/50 p-6 shadow-xs sm:p-10 dark:border-zinc-800 dark:from-zinc-900/90 dark:via-zinc-900/50 dark:to-zinc-950/80">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 font-mono text-[10px] font-black tracking-widest text-amber-700 uppercase dark:text-amber-400">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>One-Time Lifetime Deals (LTD)</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl dark:text-white">
              Pay Once. Mine Forever.
            </h3>
            <p className="mt-1 max-w-xl text-[14px] font-medium text-zinc-500 dark:text-zinc-400">
              Zero recurring fees. Your monthly scan quota automatically renews on the 1st of every month forever.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>14-Day 100% Money-Back Guarantee</span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* TIER 1: FOUNDER LTD */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/70">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                  Tier 1 Pass
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[9px] font-black text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  30 Scans / Mo
                </span>
              </div>
              <h4 className="mt-2 text-xl font-extrabold text-zinc-950 dark:text-white">
                Founder Lifetime Pass
              </h4>
              <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Ideal for solo founders, indie hackers, and early product builders.
              </p>

              <div className="my-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-zinc-950 dark:text-white">$149</span>
                <span className="font-mono text-xs font-bold text-zinc-400 uppercase">one-time payment</span>
              </div>

              <div className="space-y-3 border-t border-zinc-100 pt-5 text-[13px] font-medium text-zinc-600 dark:border-zinc-850 dark:text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span><strong>30 investigations</strong> per month (resets monthly)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span>Basic + Deep Reddit semantic extraction</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span>Subreddit community map & sentiment scoring</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span>Willingness-to-pay ($/mo) quote extraction</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span>20% lifetime discount on bonus credit top-ups</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => startLtdCheckout("founder")}
                disabled={ltdTier === "founder" || ltdTier === "professional" || startingCheckoutPlan === "founder"}
                className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 py-3 font-mono text-xs font-black tracking-wider text-zinc-900 uppercase transition-all hover:border-[#ff4500] hover:bg-[#ff4500] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-[#ff4500]"
              >
                {startingCheckoutPlan === "founder" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {ltdTier === "founder" || ltdTier === "professional"
                  ? "Active on Account"
                  : "Claim Founder Pass — $149"}
              </button>
            </div>
          </div>

          {/* TIER 2: PROFESSIONAL / STUDIO LTD */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-[#ff4500] bg-white p-7 shadow-md dark:bg-zinc-950">
            {/* Best Value Badge */}
            <div className="absolute -top-3.5 right-6 rounded-full bg-[#ff4500] px-3 py-1 font-mono text-[9px] font-black tracking-widest text-white uppercase shadow-xs">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
                  Tier 2 Studio Pass
                </span>
                <span className="rounded-full border border-[#ff4500]/30 bg-[#ff4500]/10 px-2 py-0.5 font-mono text-[9px] font-black text-[#ff4500]">
                  100 Scans / Mo
                </span>
              </div>
              <h4 className="mt-2 text-xl font-extrabold text-zinc-950 dark:text-white">
                Studio Master LTD
              </h4>
              <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                For growth teams, SaaS studios, and product consultancies.
              </p>

              <div className="my-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-zinc-950 dark:text-white">
                  {ltdTier === "founder" ? "$150" : "$299"}
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400 uppercase">
                  {ltdTier === "founder" ? "upgrade difference" : "one-time payment"}
                </span>
              </div>

              <div className="space-y-3 border-t border-zinc-100 pt-5 text-[13px] font-medium text-zinc-600 dark:border-zinc-850 dark:text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span><strong>100 investigations</strong> per month (resets monthly)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span>Ultra + Advanced AI depth scanning</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span>Custom intelligence pattern filters</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span>Trend Velocity spike detection engine</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-[#ff4500]" />
                  <span>40% lifetime discount on credit top-ups</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => startLtdCheckout("professional")}
                disabled={ltdTier === "professional" || startingCheckoutPlan === "professional"}
                className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff4500] py-3 font-mono text-xs font-black tracking-wider text-white uppercase shadow-xs transition-all hover:bg-[#e03d00] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {startingCheckoutPlan === "professional" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {ltdTier === "professional"
                  ? "Active on Account"
                  : ltdTier === "founder"
                    ? "Upgrade to Studio Pass — $150"
                    : "Claim Studio Master — $299"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Access & Stripe Portal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stripe Portal */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs sm:p-8 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
                <CreditCard className="h-4 w-4" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">
                Stripe Customer Portal
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Access your encrypted Stripe portal to view transaction receipts, download tax invoices, or update your billing email and payment methods.
            </p>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={openBillingPortal}
              disabled={openingPortal}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 font-mono text-xs font-bold text-zinc-800 uppercase shadow-2xs transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {openingPortal ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              )}
              <span>Open Customer Portal</span>
            </button>
            {actionState?.type === "error" ? (
              <p className="mt-3 font-mono text-xs text-rose-600">
                {actionState.message}
              </p>
            ) : null}
          </div>
        </div>

        {/* Current Quota Status */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
          <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">
            Current Quota Status
          </h3>
          <div className="mt-3 flex items-center gap-2 font-mono text-lg font-black text-[#ff4500] uppercase">
            {planPurchaseRequired ? "Read Only" : plan}
            {ltdTier && ltdTier !== "none" && (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[9px] font-bold text-amber-700 uppercase dark:text-amber-400">
                {ltdTier === "founder" ? "FOUNDER LTD" : "STUDIO LTD"}
              </span>
            )}
          </div>

          <div className="mt-6 space-y-4 font-mono text-xs">
            <div className="flex justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
              <span className="text-zinc-400">Plan Status:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">
                {ltdTier && ltdTier !== "none"
                  ? "Lifetime active"
                  : planPurchaseRequired
                    ? "Read-only"
                    : "Active"}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Monthly Scans:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {usage.monthlyUsed} / {usage.monthlyLimit ?? "∞"}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
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
            </div>

            <div className="flex justify-between border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
              <span className="text-zinc-400">Max Subreddits:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {entitlements.maxSubredditsPerSearch ?? "Unlimited"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Save Dossiers:</span>
              <span className="font-bold text-emerald-600">
                {entitlements.canSaveReports ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

