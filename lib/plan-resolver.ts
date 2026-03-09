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

async function loadSubscriptions(requestHeaders: HeadersInit): Promise<SubscriptionRecord[]> {
  const stripePluginEnabled = process.env.STRIPE_PLUGIN_ENABLED === "true";
  if (!stripePluginEnabled) {
    return [];
  }

  const authApi = auth.api as unknown as {
    listActiveSubscriptions?: (input: { headers: HeadersInit }) => Promise<unknown>;
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
    ["active", "trialing", "past_due"].includes((subscription.status ?? "").toLowerCase())
  );
  const localTrialDays = Number.parseInt(process.env.LOCAL_TRIAL_DAYS ?? "3", 10);
  const localTrialEnabled = process.env.LOCAL_TRIAL_ENABLED !== "false";
  const requirePaidAfterTrial = process.env.REQUIRE_PAID_PLAN_AFTER_TRIAL !== "false";
  let trialActive = false;

  if (!localTrialEnabled || hasActiveSubscription || !Number.isFinite(localTrialDays) || localTrialDays <= 0) {
    return {
      plan: resolvedPlan,
      hasActiveSubscription,
      trialActive: false,
      planPurchaseRequired:
        requirePaidAfterTrial && resolvedPlan === "starter" && !hasActiveSubscription,
      trialEndsAt: null,
      trialDaysRemaining: null,
    };
  }

  try {
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, input.userId),
      columns: {
        createdAt: true,
      },
    });

    if (!currentUser?.createdAt) {
      return {
        plan: resolvedPlan,
        hasActiveSubscription,
        trialActive: false,
        planPurchaseRequired:
          requirePaidAfterTrial && resolvedPlan === "starter" && !hasActiveSubscription,
        trialEndsAt: null,
        trialDaysRemaining: null,
      };
    }

    const trialEndsAt = new Date(currentUser.createdAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + localTrialDays);
    const daysRemaining = Math.max(
      0,
      Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    if (trialEndsAt.getTime() > Date.now()) {
      trialActive = true;
      return {
        plan: "pro",
        hasActiveSubscription,
        trialActive,
        planPurchaseRequired: false,
        trialEndsAt,
        trialDaysRemaining: daysRemaining,
      };
    }
  } catch {
    return {
      plan: resolvedPlan,
      hasActiveSubscription,
      trialActive: false,
      planPurchaseRequired: false,
      trialEndsAt: null,
      trialDaysRemaining: null,
    };
  }

  return {
    plan: resolvedPlan,
    hasActiveSubscription,
    trialActive,
    planPurchaseRequired:
      requirePaidAfterTrial && resolvedPlan === "starter" && !hasActiveSubscription && !trialActive,
    trialEndsAt: null,
    trialDaysRemaining: null,
  };
}
