import { auth } from "@/lib/auth";
import { resolvePlanForIdentity, type BillingPlan } from "@/lib/plan-gating";

type SubscriptionRecord = {
  plan?: string;
  status?: string;
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
  const subscriptions = await loadSubscriptions(input.requestHeaders);
  return resolvePlanForIdentity({
    userId: input.userId,
    email: input.email,
    subscriptions,
  });
}
