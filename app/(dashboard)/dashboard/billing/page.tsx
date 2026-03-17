import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BillingPageClient } from "@/components/dashboard/billing-page-client";
import {
  type BillingPlan,
  getMonthlyScanUsage,
  getMonthlyUsageSummary,
  getPlanEntitlements,
} from "@/lib/plan-gating";
import { resolvePlanContext } from "@/lib/plan-resolver";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/sign-in");
  }

  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
  );
  const availablePlans = (
    [
      process.env.STRIPE_PRICE_STARTER_MONTHLY ? "starter" : null,
      process.env.STRIPE_PRICE_GROWTH_MONTHLY ? "growth" : null,
      process.env.STRIPE_PRICE_PRO_MONTHLY ? "pro" : null,
    ] as const
  ).filter((plan): plan is BillingPlan => Boolean(plan));
  const planContext = await resolvePlanContext({
    userId: session.user.id,
    email: session.user.email,
    requestHeaders,
  });
  const plan = planContext.plan;
  const entitlements = getPlanEntitlements(plan);
  const usage = getMonthlyUsageSummary(
    plan,
    await getMonthlyScanUsage(session.user.id),
  );

  return (
    <BillingPageClient
      stripeConfigured={stripeConfigured}
      availablePlans={availablePlans}
      plan={plan}
      planPurchaseRequired={planContext.planPurchaseRequired}
      trialActive={planContext.trialActive}
      trialEndsAt={planContext.trialEndsAt?.toISOString() ?? null}
      trialDaysRemaining={planContext.trialDaysRemaining}
      entitlements={entitlements}
      usage={usage}
    />
  );
}
