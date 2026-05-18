import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();

    if (tier !== "founder" && tier !== "professional") {
      return NextResponse.json({ message: "Invalid tier" }, { status: 400 });
    }

    // Check for pro-rated upgrade
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    let priceId = "";
    let amount = 0;

    if (tier === "founder") {
      priceId = process.env.STRIPE_PRICE_LTD_FOUNDER ?? "";
      amount = 149;
    } else if (tier === "professional") {
      if (currentUser?.ltdTier === "founder") {
        priceId = process.env.STRIPE_PRICE_LTD_UPGRADE ?? "";
        amount = 150;
      } else {
        priceId = process.env.STRIPE_PRICE_LTD_PROFESSIONAL ?? "";
        amount = 299;
      }
    }

    if (!priceId) {
      const missing = tier === "founder"
        ? "STRIPE_PRICE_LTD_FOUNDER"
        : currentUser?.ltdTier === "founder"
        ? "STRIPE_PRICE_LTD_UPGRADE"
        : "STRIPE_PRICE_LTD_PROFESSIONAL";
      console.error(`[LTD Checkout] Missing env var: ${missing}`);
      return NextResponse.json(
        { message: `Server misconfiguration: ${missing} is not set in .env.local` },
        { status: 500 }
      );
    }

    const stripeMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "LIVE" : "TEST";
    console.log(`[LTD Checkout] Stripe mode: ${stripeMode} | Tier: ${tier} | PriceId: ${priceId}`);

    // Validate the stored customer ID against the current Stripe environment.
    // It may be a stale Test-mode ID when running in Live mode (or vice versa).
    let validCustomerId: string | undefined = session.user.stripeCustomerId || undefined;
    if (validCustomerId) {
      try {
        const existing = await stripe.customers.retrieve(validCustomerId);
        if ((existing as any).deleted) validCustomerId = undefined;
      } catch (err: any) {
        if (err.code === "resource_missing") {
          console.warn(`[LTD Checkout] Stale customer ID ${validCustomerId} — falling back to email.`);
          validCustomerId = undefined;
        } else {
          throw err;
        }
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: validCustomerId,
      customer_email: validCustomerId ? undefined : session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
        ltdTier: tier,
        amountPaid: String(amount),
        type: "ltd_purchase",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    // Surface the real Stripe/server error message
    const message = error?.message ?? "Internal server error";
    console.error("[LTD Checkout Error]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
