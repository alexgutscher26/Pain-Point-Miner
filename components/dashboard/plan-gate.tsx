"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import {
  type BillingPlan,
  type PlanEntitlements,
  isAtLeastPlan,
  PLAN_ENTITLEMENTS,
} from "@/lib/plan-gating";

export interface PlanGateProps {
  children: React.ReactNode;
  /** Minimum plan required to unlock this feature */
  minPlan?: BillingPlan;
  /** Specific entitlement feature key required */
  feature?: keyof Omit<
    PlanEntitlements,
    "monthlyScans" | "maxSubredditsPerSearch" | "allowedMiningDepths"
  >;
  /** Current user plan if passed as prop */
  currentPlan?: BillingPlan;
  /** Fallback render variant */
  variant?: "blur" | "card" | "inline" | "banner" | "hidden";
  /** Title for the upgrade prompt */
  title?: string;
  /** Description for the upgrade prompt */
  description?: string;
  /** Custom fallback element */
  fallback?: React.ReactNode;
  /** Optional custom className */
  className?: string;
}

export function PlanGate({
  children,
  minPlan = "pro",
  feature,
  currentPlan,
  variant = "card",
  title,
  description,
  fallback,
  className = "",
}: PlanGateProps) {
  const [resolvedPlan, setResolvedPlan] = useState<BillingPlan>(
    currentPlan ?? "starter",
  );
  const [loading, setLoading] = useState(!currentPlan);

  useEffect(() => {
    if (currentPlan) {
      setResolvedPlan(currentPlan);
      setLoading(false);
      return;
    }

    let isMounted = true;
    fetch("/api/billing/entitlements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.plan) {
          setResolvedPlan(data.plan as BillingPlan);
        }
      })
      .catch(() => {
        // Default to starter on error
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPlan]);

  // Check access based on minPlan or specific feature
  let isAllowed = false;
  if (feature) {
    const entitlements =
      PLAN_ENTITLEMENTS[resolvedPlan] ?? PLAN_ENTITLEMENTS.starter;
    isAllowed = Boolean(entitlements[feature]);
  } else {
    isAllowed = isAtLeastPlan(resolvedPlan, minPlan);
  }

  if (loading) {
    return <div className="animate-pulse opacity-50">{children}</div>;
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (variant === "hidden") {
    return null;
  }

  const promptTitle =
    title ||
    `Upgrade to ${minPlan.charAt(0).toUpperCase() + minPlan.slice(1)} to Unlock`;
  const promptDescription =
    description ||
    `This premium intelligence feature requires the ${minPlan.toUpperCase()} plan. Upgrade now to get unrestricted access.`;

  if (variant === "blur") {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <div className="pointer-events-none opacity-40 blur-md filter select-none">
          {children}
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 p-6 text-center backdrop-blur-xs">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/10 text-[#ff4500] shadow-xs">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="mb-1 font-mono text-sm font-black tracking-wider text-zinc-900 uppercase">
            {promptTitle}
          </h4>
          <p className="mb-4 max-w-xs text-xs font-medium text-zinc-500">
            {promptDescription}
          </p>
          <Link
            href="/dashboard/billing"
            className="group flex items-center gap-2 rounded-xl border border-[#ff8a57] bg-[#ff4500] px-5 py-2.5 font-mono text-[11px] font-black tracking-wider text-white uppercase shadow-sm transition-all hover:bg-[#ff571a] hover:shadow-md active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Upgrade Plan</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs backdrop-blur-md sm:flex-row ${className}`}
      >
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-black tracking-wider text-amber-950 uppercase">
              {promptTitle}
            </h4>
            <p className="text-xs font-medium text-amber-800">
              {promptDescription}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/billing"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-amber-600 bg-amber-600 px-4 py-2 font-mono text-[11px] font-black tracking-wider text-white uppercase shadow-xs transition-all hover:bg-amber-700 active:scale-95"
        >
          <span>Upgrade</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 ${className}`}
      >
        <Lock className="h-3.5 w-3.5 text-amber-600" />
        <span className="font-medium">{promptTitle}</span>
        <Link
          href="/dashboard/billing"
          className="ml-1 font-mono text-[10px] font-bold tracking-wider text-[#ff4500] uppercase hover:underline"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center shadow-xs backdrop-blur-md ${className}`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/10 text-[#ff4500] shadow-xs">
        <Lock className="h-6 w-6" />
      </div>
      <h4 className="mb-1 font-mono text-sm font-black tracking-wider text-zinc-900 uppercase">
        {promptTitle}
      </h4>
      <p className="mb-5 max-w-md text-xs font-medium text-zinc-500">
        {promptDescription}
      </p>
      <Link
        href="/dashboard/billing"
        className="group flex items-center gap-2 rounded-xl border border-[#ff8a57] bg-[#ff4500] px-6 py-2.5 font-mono text-[11px] font-black tracking-wider text-white uppercase shadow-sm transition-all hover:bg-[#ff571a] hover:shadow-md active:scale-95"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Upgrade to Unlock</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
