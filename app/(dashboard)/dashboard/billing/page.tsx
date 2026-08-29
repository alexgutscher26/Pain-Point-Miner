import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
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
  const session = await getServerSession(requestHeaders);

  if (!session) {
    redirect("/sign-in");
  }

  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
  );

  let stripeCustomerId = session.user.stripeCustomerId;

  if (stripeConfigured && !stripeCustomerId) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      
      // Look up existing customer by email to prevent duplicates in Stripe dashboard
      const existing = await stripe.customers.list({
        email: session.user.email,
        limit: 1,
      });

      if (existing.data.length > 0) {
        stripeCustomerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: session.user.email,
          name: session.user.name || undefined,
          metadata: {
            userId: session.user.id,
          },
        });
        stripeCustomerId = customer.id;
      }

      // Save customer ID to database
      const { db } = await import("@/lib/db");
      const { user } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");
      await db
        .update(user)
        .set({ stripeCustomerId })
        .where(eq(user.id, session.user.id));

      // Update the local session user object so subsequent handlers get it
      session.user.stripeCustomerId = stripeCustomerId;
    } catch (err) {
      console.error("Failed to automatically create Stripe customer ID:", err);
    }
  }

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
      entitlements={entitlements}
      usage={creditSummary}
    />
  );
}
