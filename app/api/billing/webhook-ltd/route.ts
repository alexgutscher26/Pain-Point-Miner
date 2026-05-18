import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { user, userPreferences, purchasedCredits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
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
    const type = session.metadata?.type as string;
    const userId = session.metadata?.userId as string;

    if (!userId) return NextResponse.json({ received: true });

    if (type === "ltd_purchase") {
      const tier = session.metadata?.ltdTier as "founder" | "professional";
      const amountPaid = parseFloat(session.metadata?.amountPaid || "0");

      console.log(`[Webhook-LTD] Processing tier upgrade for ${userId} to ${tier}`);

      await db
        .update(user)
        .set({
          ltdTier: tier,
          ltdPricePaid: amountPaid,
          stripeCustomerId: session.customer as string,
        })
        .where(eq(user.id, userId));
    } else if (type === "credit_topup") {
      const credits = parseInt(session.metadata?.credits || "0");
      console.log(`[Webhook-LTD] Processing credit top-up for ${userId}: +${credits}`);

      await db
        .insert(purchasedCredits)
        .values({
          id: crypto.randomUUID(),
          userId,
          amount: credits,
          updatedAt: new Date(),
        });
    }

    // 2. Fetch user email for Loops if not in session
    const customerEmail = session.customer_details?.email;
    if (customerEmail) {
      const { sendLoopsEvent } = await import("@/lib/loops/service");
      await sendLoopsEvent(customerEmail, "payment_received", {
        type: type || "purchase",
        amount: parseFloat(session.metadata?.amountPaid || "0") || (session.amount_total ? session.amount_total / 100 : 0),
        credits: parseInt(session.metadata?.credits || "0"),
        ltdTier: session.metadata?.ltdTier || "",
      });
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
  }

  return NextResponse.json({ received: true });
}
