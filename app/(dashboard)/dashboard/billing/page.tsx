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
import { Stripe } from "stripe";

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

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<{
    success?: string;
    session_id?: string;
    canceled?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestHeaders = await headers();
  const session = await getServerSession(requestHeaders);

  if (!session) {
    redirect("/sign-in");
  }

  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
  );

  if (
    stripeConfigured &&
    (resolvedSearchParams.session_id || resolvedSearchParams.success === "true")
  ) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      let checkoutSession: Stripe.Checkout.Session | null = null;

      if (resolvedSearchParams.session_id) {
        checkoutSession = await stripe.checkout.sessions.retrieve(
          resolvedSearchParams.session_id,
        );
      } else {
        const recent = await stripe.checkout.sessions.list({
          limit: 3,
        });
        checkoutSession =
          recent.data.find(
            (s) =>
              s.metadata?.userId === session.user.id &&
              (s.payment_status === "paid" || s.status === "complete"),
          ) || null;
      }

      if (
        checkoutSession &&
        (checkoutSession.payment_status === "paid" ||
          checkoutSession.status === "complete") &&
        checkoutSession.metadata?.type === "ltd_purchase" &&
        checkoutSession.metadata?.userId === session.user.id
      ) {
        const tier = checkoutSession.metadata.ltdTier as
          | "founder"
          | "professional";
        const amountPaid = parseFloat(
          checkoutSession.metadata.amountPaid || "0",
        );
        const { db } = await import("@/lib/db");
        const { user } = await import("@/lib/db/schema");
        const { eq } = await import("drizzle-orm");

        await db
          .update(user)
          .set({
            ltdTier: tier,
            ltdPricePaid: amountPaid,
            stripeCustomerId:
              (checkoutSession.customer as string) ||
              session.user.stripeCustomerId,
          })
          .where(eq(user.id, session.user.id));
      }
    } catch (err) {
      console.error("[BillingPage] Checkout sync check:", err);
    }
  }

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
