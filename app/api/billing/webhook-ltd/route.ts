import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { user, userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, ltdTier, amountPaid, type } = session.metadata || {};

    if (type === "ltd_purchase" && userId && ltdTier) {
      // 1. Update User LTD Tier
      await db
        .update(user)
        .set({
          ltdTier: ltdTier as "founder" | "professional",
          ltdPricePaid: Number(amountPaid),
        })
        .where(eq(user.id, userId));

      // 2. Set Anniversary Date if not already set
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

      console.log(`LTD ${ltdTier} activated for user ${userId}`);
    }
  }

  return NextResponse.json({ received: true });
}
