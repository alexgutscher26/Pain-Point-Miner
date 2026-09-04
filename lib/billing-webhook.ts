import Stripe from "stripe";
import { db } from "@/lib/db";
import { user, userPreferences, purchasedCredits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizeBillingPlan } from "@/lib/plan-gating";
import { requireEnv } from "@/lib/env";

export function getStripeClient(): Stripe {
  const stripeKey = requireEnv("STRIPE_SECRET_KEY");
  return new Stripe(stripeKey, {
    apiVersion: "2025-01-27.acacia" as any,
  });
}

export function constructStripeEvent(
  body: string,
  signature: string,
  secret?: string,
): Stripe.Event {
  const webhookSecret = secret || requireEnv("STRIPE_WEBHOOK_SECRET");
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

export async function processStripeWebhookEvent(
  event: Stripe.Event,
): Promise<{ handled: boolean; message?: string }> {
  // 1. checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const type = session.metadata?.type as string;
    const userId = session.metadata?.userId as string;

    if (!userId) {
      return { handled: true, message: "No userId in session metadata" };
    }

    if (type === "ltd_purchase") {
      const tier = session.metadata?.ltdTier as "founder" | "professional";
      const amountPaid = parseFloat(session.metadata?.amountPaid || "0");

      console.log(`[Webhook] Processing tier upgrade for ${userId} to ${tier}`);

      await db
        .update(user)
        .set({
          ltdTier: tier,
          ltdPricePaid: amountPaid,
          stripeCustomerId: (session.customer as string) || undefined,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));
    } else if (type === "credit_topup") {
      const credits = parseInt(session.metadata?.credits || "0");
      console.log(
        `[Webhook] Processing credit top-up for ${userId}: +${credits}`,
      );

      await db.insert(purchasedCredits).values({
        id: crypto.randomUUID(),
        userId,
        amount: credits,
        updatedAt: new Date(),
      });
    }

    // Loops notification
    const customerEmail = session.customer_details?.email;
    if (customerEmail) {
      try {
        const { sendLoopsEvent } = await import("@/lib/loops/service");
        await sendLoopsEvent(customerEmail, "payment_received", {
          type: type || "purchase",
          amount:
            parseFloat(session.metadata?.amountPaid || "0") ||
            (session.amount_total ? session.amount_total / 100 : 0),
          credits: parseInt(session.metadata?.credits || "0"),
          ltdTier: session.metadata?.ltdTier || "",
        });
      } catch (err) {
        console.error("[Webhook] Loops event error:", err);
      }
    }

    // Shared Anniversary Logic
    const existingPrefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!existingPrefs?.anniversaryDate) {
      await db
        .insert(userPreferences)
        .values({
          id: crypto.randomUUID(),
          userId,
          anniversaryDate: new Date(),
        })
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: { anniversaryDate: new Date() },
        });
    }

    return {
      handled: true,
      message: "Checkout session completed successfully",
    };
  }

  // 2. customer.subscription.updated
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
    const userId = subscription.metadata?.userId;

    let targetUser = userId
      ? await db.query.user.findFirst({ where: eq(user.id, userId) })
      : customerId
        ? await db.query.user.findFirst({
            where: eq(user.stripeCustomerId, customerId),
          })
        : null;

    if (!targetUser && customerId) {
      targetUser = await db.query.user.findFirst({
        where: eq(user.stripeCustomerId, customerId),
      });
    }

    if (!targetUser) {
      console.warn(
        `[Webhook] No user found for customer.subscription.updated (customer: ${customerId}, user: ${userId})`,
      );
      return {
        handled: true,
        message: "No user found for subscription update",
      };
    }

    const status = subscription.status;
    const rawPlan =
      subscription.metadata?.plan ||
      subscription.items?.data?.[0]?.price?.nickname ||
      subscription.items?.data?.[0]?.price?.lookup_key ||
      "starter";
    const resolvedPlan = normalizeBillingPlan(rawPlan);

    const isActiveStatus =
      status === "active" || status === "past_due" || status === "trialing";

    if (isActiveStatus) {
      console.log(
        `[Webhook] Updating user ${targetUser.id} plan to ${resolvedPlan} (status: ${status})`,
      );
      await db
        .update(user)
        .set({
          plan: resolvedPlan,
          stripeCustomerId: customerId || targetUser.stripeCustomerId,
          updatedAt: new Date(),
        })
        .where(eq(user.id, targetUser.id));
    } else if (
      status === "canceled" ||
      status === "unpaid" ||
      status === "incomplete_expired"
    ) {
      // Downgrade to starter only if user has no active LTD tier
      if (targetUser.ltdTier === "none" || !targetUser.ltdTier) {
        console.log(
          `[Webhook] Downgrading user ${targetUser.id} to starter due to inactive subscription (${status})`,
        );
        await db
          .update(user)
          .set({
            plan: "starter",
            updatedAt: new Date(),
          })
          .where(eq(user.id, targetUser.id));
      }
    }

    if (targetUser.email) {
      try {
        const { sendLoopsEvent } = await import("@/lib/loops/service");
        await sendLoopsEvent(targetUser.email, "subscription_updated", {
          status,
          plan: resolvedPlan,
          customerId: customerId || "",
        });
      } catch (err) {
        console.error("[Webhook] Loops event error:", err);
      }
    }

    return {
      handled: true,
      message: `Subscription updated for user ${targetUser.id} (${status})`,
    };
  }

  // 3. customer.subscription.deleted
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
    const userId = subscription.metadata?.userId;

    const targetUser = userId
      ? await db.query.user.findFirst({ where: eq(user.id, userId) })
      : customerId
        ? await db.query.user.findFirst({
            where: eq(user.stripeCustomerId, customerId),
          })
        : null;

    if (targetUser) {
      if (targetUser.ltdTier === "none" || !targetUser.ltdTier) {
        console.log(
          `[Webhook] Revoking plan access for user ${targetUser.id} on subscription deletion`,
        );
        await db
          .update(user)
          .set({
            plan: "starter",
            updatedAt: new Date(),
          })
          .where(eq(user.id, targetUser.id));
      }

      if (targetUser.email) {
        try {
          const { sendLoopsEvent } = await import("@/lib/loops/service");
          await sendLoopsEvent(targetUser.email, "subscription_cancelled", {
            customerId: customerId || "",
          });
        } catch (err) {
          console.error("[Webhook] Loops event error:", err);
        }
      }
    }

    return { handled: true, message: "Subscription deleted processed" };
  }

  return { handled: false, message: `Unhandled event: ${event.type}` };
}
