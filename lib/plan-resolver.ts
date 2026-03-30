import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { resolvePlanForIdentity, type BillingPlan } from "@/lib/plan-gating";
import { eq } from "drizzle-orm";

type SubscriptionRecord = {
  plan?: string;
  status?: string;
};

export type ResolvedPlanContext = {
  plan: BillingPlan;
  hasActiveSubscription: boolean;
  trialActive: boolean;
  planPurchaseRequired: boolean;
  trialEndsAt: Date | null;
  trialDaysRemaining: number | null;
};

type PlanContextResolutionInput = {
  resolvedPlan: BillingPlan;
  hasActiveSubscription: boolean;
  userCreatedAt?: Date | null;
  now?: Date;
  localTrialEnabled?: boolean;
  localTrialDays?: number;
  requirePaidAfterTrial?: boolean;
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
    const subscriptions = await authApi.listActiveSubscriptions({
      headers: requestHeaders,
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
  const hasActiveSubscription = subscriptions.some((subscription) =>
    ["active", "trialing", "past_due"].includes(
      (subscription.status ?? "").toLowerCase(),
    ),
  );
  const localTrialDays = Number.parseInt(
    process.env.LOCAL_TRIAL_DAYS ?? "3",
    10,
  );
  const localTrialEnabled = process.env.LOCAL_TRIAL_ENABLED !== "false";
  const requirePaidAfterTrial =
    process.env.REQUIRE_PAID_PLAN_AFTER_TRIAL !== "false";
  
  const baseResolutionInput = {
    resolvedPlan,
    hasActiveSubscription,
    localTrialDays,
    localTrialEnabled,
    requirePaidAfterTrial,
    userCreatedAt: currentUser?.createdAt ?? null,
    ltdTier: currentUser?.ltdTier,
  };

  return resolvePlanAccessState(baseResolutionInput);
}

export function resolvePlanAccessState({
  resolvedPlan,
  hasActiveSubscription,
  userCreatedAt = null,
  now = new Date(),
  localTrialEnabled = true,
  localTrialDays = 3,
  requirePaidAfterTrial = true,
  ltdTier = "none",
}: PlanContextResolutionInput & { ltdTier?: string | null }): ResolvedPlanContext {
  // 1. Initial State from existing plan/subscription
  const context: ResolvedPlanContext = {
    plan: resolvedPlan,
    hasActiveSubscription,
    trialActive: false,
    trialEndsAt: null,
    trialDaysRemaining: null,
    planPurchaseRequired: !hasActiveSubscription && requirePaidAfterTrial,
  };

  // 2. Early Exit if trial logic should not run
  if (
    !localTrialEnabled ||
    hasActiveSubscription ||
    !Number.isFinite(localTrialDays) ||
    localTrialDays <= 0 ||
    !userCreatedAt
  ) {
    return context;
  }

  // 3. Calculate Trial Boundaries (Signup date + Trial duration)
  const trialEndsAt = new Date(userCreatedAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + localTrialDays);
  
  // Normalize to end-of-day for the expiration date to be user-friendly (generous end)
  trialEndsAt.setHours(23, 59, 59, 999);
  
  const trialEndsAtMs = trialEndsAt.getTime();
  const nowMs = now.getTime();
  const isCurrentlyInTrial = trialEndsAtMs > nowMs;

  // 4. Update Context with Trial Details
  context.trialEndsAt = trialEndsAt;
  context.trialActive = isCurrentlyInTrial;
  
  // Calculate days remaining based on calendar midnights for a more natural countdown
  const endMidnight = new Date(trialEndsAt);
  endMidnight.setHours(0, 0, 0, 0);
  const nowMidnight = new Date(now);
  nowMidnight.setHours(0, 0, 0, 0);
  
  context.trialDaysRemaining = Math.max(
    0,
    Math.round((endMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24)),
  );

  // 5. Business Logic Overrides
  if (isCurrentlyInTrial) {
    context.planPurchaseRequired = false;
    // Upgrade "starter" to "pro" during trial if not already on a higher plan
    if (context.plan === "starter" || context.plan === "founder") {
      context.plan = "pro";
    }
  } else {
    // Trial expired. If no active subscription, lock access if required.
    context.planPurchaseRequired = !hasActiveSubscription && requirePaidAfterTrial;
  }

  return context;
}
