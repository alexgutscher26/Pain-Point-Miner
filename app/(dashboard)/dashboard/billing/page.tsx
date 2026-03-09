import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BillingPageClient } from "@/components/dashboard/billing-page-client";
import { getMonthlyScanUsage, getMonthlyUsageSummary, getPlanEntitlements } from "@/lib/plan-gating";
import { resolveCurrentPlan } from "@/lib/plan-resolver";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/sign-in");
  }

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  const plan = await resolveCurrentPlan({
    userId: session.user.id,
    email: session.user.email,
    requestHeaders,
  });
  const entitlements = getPlanEntitlements(plan);
  const usage = getMonthlyUsageSummary(plan, await getMonthlyScanUsage(session.user.id));

  return (
    <BillingPageClient
      stripeConfigured={stripeConfigured}
      plan={plan}
      entitlements={entitlements}
      usage={usage}
    />
  );
}
