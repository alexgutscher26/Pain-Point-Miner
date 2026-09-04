import { auth, sanitizeAuthHeaders } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { resolvePlanForIdentity, type BillingPlan } from "@/lib/plan-gating";
import { eq } from "drizzle-orm";

type SubscriptionRecord = {
  plan?: string;
  status?: string;
};

export type ResolvedPlanContext = {
  userId: string;
  plan: BillingPlan;
  ltdTier: string | null;
  planPurchaseRequired: boolean;
  hasActiveSubscription: boolean;
  trialActive: boolean;
  trialEndsAt: Date | null;
  trialDaysRemaining: number | null;
};

type PlanContextResolutionInput = {
  userId: string;
  plan: BillingPlan;
  ltdTier?: string | null;
  hasActiveSubscription?: boolean;
};

async function loadSubscriptions(
  requestHeaders: HeadersInit,
): Promise<SubscriptionRecord[]> {
  const stripePluginEnabled = process.env.STRIPE_PLUGIN_ENABLED === "true";
  if (!stripePluginEnabled) {
    return [];
  }

  const authApi = auth.api as unknown as {
    listActiveSubscriptions?: (input: {
      headers: HeadersInit;
    }) => Promise<unknown>;
  };

  if (typeof authApi.listActiveSubscriptions !== "function") {
    return [];
  }

  try {
    const cleanHeaders = sanitizeAuthHeaders(requestHeaders);
    const subscriptions = await authApi.listActiveSubscriptions({
      headers: cleanHeaders,
    });

    if (!Array.isArray(subscriptions)) {
      return [];
    }

    return subscriptions as SubscriptionRecord[];
  } catch {
    return [];
  }
}

export async function resolveCurrentPlan(input: {
  userId: string;
  email?: string | null;
  requestHeaders: HeadersInit;
}): Promise<BillingPlan> {
  const context = await resolvePlanContext(input);
  return context.plan;
}

export async function resolvePlanContext(input: {
  userId: string;
  email?: string | null;
  requestHeaders: HeadersInit;
}): Promise<ResolvedPlanContext> {
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, input.userId),
    columns: {
      createdAt: true,
      ltdTier: true,
    },
  });

  const subscriptions = await loadSubscriptions(input.requestHeaders);
  const resolvedPlan = resolvePlanForIdentity({
    userId: input.userId,
    email: input.email,
    subscriptions,
    ltdTier: currentUser?.ltdTier,
  });

  const hasActiveSub = subscriptions.some((s) =>
    isSubscriptionActive(s.status),
  );

  return resolvePlanAccessState({
    userId: input.userId,
    plan: resolvedPlan,
    ltdTier: currentUser?.ltdTier ?? "none",
    hasActiveSubscription: hasActiveSub,
  });
}

/**
 * Checks if a subscription is considered "active" (meaning it grants pro features).
 */
export function isSubscriptionActive(status?: string | null): boolean {
  if (!status) return false;
  return ["active", "past_due"].includes(status.toLowerCase());
}

/**
 * High-level business logic that decides the final access state for a user.
 */
export function resolvePlanAccessState({
  userId,
  plan,
  ltdTier,
  hasActiveSubscription = false,
}: PlanContextResolutionInput): ResolvedPlanContext {
  const isPaidOrLTD =
    (ltdTier && ltdTier !== "none") ||
    plan !== "starter" ||
    hasActiveSubscription;

  return {
    userId,
    plan,
    ltdTier: ltdTier || null,
    planPurchaseRequired: false,
    hasActiveSubscription: isPaidOrLTD,
    trialActive: false, // Trials are disabled
    trialEndsAt: null,
    trialDaysRemaining: null,
  };
}
