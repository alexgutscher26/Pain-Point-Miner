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
  const subscriptions = await loadSubscriptions(input.requestHeaders);
  const resolvedPlan = resolvePlanForIdentity({
    userId: input.userId,
    email: input.email,
    subscriptions,
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
  };

  try {
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, input.userId),
      columns: {
        createdAt: true,
      },
    });
    return resolvePlanAccessState({
      ...baseResolutionInput,
      userCreatedAt: currentUser?.createdAt ?? null,
    });
  } catch {
    return resolvePlanAccessState({
      ...baseResolutionInput,
      userCreatedAt: null,
    });
  }
}

export function resolvePlanAccessState({
  resolvedPlan,
  hasActiveSubscription,
  userCreatedAt = null,
  now = new Date(),
  localTrialEnabled = true,
  localTrialDays = 3,
  requirePaidAfterTrial = true,
}: PlanContextResolutionInput): ResolvedPlanContext {
  const defaultContext: ResolvedPlanContext = {
    plan: resolvedPlan,
    hasActiveSubscription,
    trialActive: false,
    planPurchaseRequired:
      requirePaidAfterTrial &&
      resolvedPlan === "starter" &&
      !hasActiveSubscription,
    trialEndsAt: null,
    trialDaysRemaining: null,
  };

  if (
    !localTrialEnabled ||
    hasActiveSubscription ||
    !Number.isFinite(localTrialDays) ||
    localTrialDays <= 0 ||
    !userCreatedAt
  ) {
    return defaultContext;
  }

  const trialEndsAt = new Date(userCreatedAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + localTrialDays);
  const trialEndsAtMs = trialEndsAt.getTime();
  const nowMs = now.getTime();
  const trialDaysRemaining = Math.max(
    0,
    Math.ceil((trialEndsAtMs - nowMs) / (1000 * 60 * 60 * 24)),
  );

  if (trialEndsAtMs > nowMs) {
    return {
      plan: "pro",
      hasActiveSubscription,
      trialActive: true,
      planPurchaseRequired: false,
      trialEndsAt,
      trialDaysRemaining,
    };
  }

  return {
    ...defaultContext,
    trialEndsAt,
    trialDaysRemaining: 0,
  };
}
