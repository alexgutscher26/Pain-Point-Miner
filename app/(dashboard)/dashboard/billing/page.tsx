import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BillingPageClient } from "@/components/dashboard/billing-page-client";
import {
  type BillingPlan,
  getMonthlyScanUsage,
  getCreditSummary,
  getPlanEntitlements,
} from "@/lib/plan-gating";
import { resolvePlanContext } from "@/lib/plan-resolver";

type BillingPurchaseOption = {
  plan: BillingPlan;
  yearlyAvailable: boolean;
};

type BillingPurchaseConfig = {
  plan: BillingPlan;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
};

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
  const availablePlans: BillingPurchaseOption[] = (
    [
      {
        plan: "starter",
        monthlyPriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY,
        yearlyPriceId: process.env.STRIPE_PRICE_STARTER_YEARLY,
      },
      {
        plan: "growth",
        monthlyPriceId: process.env.STRIPE_PRICE_GROWTH_MONTHLY,
        yearlyPriceId: process.env.STRIPE_PRICE_GROWTH_YEARLY,
      },
      {
        plan: "pro",
        monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
        yearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
      },
    ] satisfies BillingPurchaseConfig[]
  )
    .filter((option) => Boolean(option.monthlyPriceId))
    .map(({ plan, yearlyPriceId }) => ({
      plan,
      yearlyAvailable: Boolean(yearlyPriceId),
    }));
  const planContext = await resolvePlanContext({
    userId: session.user.id,
    email: session.user.email,
    requestHeaders,
  });
  const currentPlan = planContext.plan;
  const entitlements = getPlanEntitlements(currentPlan);
  const creditSummary = await getCreditSummary(session.user.id, currentPlan);

  return (
    <BillingPageClient
      stripeConfigured={stripeConfigured}
      availablePlans={availablePlans}
      plan={currentPlan}
      ltdTier={planContext.ltdTier}
      planPurchaseRequired={planContext.planPurchaseRequired}
      trialActive={planContext.trialActive}
      trialEndsAt={planContext.trialEndsAt?.toISOString() ?? null}
      trialDaysRemaining={planContext.trialDaysRemaining}
      entitlements={entitlements}
      usage={creditSummary}
    />
  );
}
