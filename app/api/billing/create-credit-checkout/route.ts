import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { pack } = await req.json();

    if (pack !== "starter" && pack !== "pro" && pack !== "elite") {
      return NextResponse.json({ message: "Invalid credit pack" }, { status: 400 });
    }

    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    let priceId = "";
    let creditsToAdd = 0;

    // Credit Mapping (50, 250, 1000)
    if (pack === "starter") {
      creditsToAdd = 50;
      if (currentUser?.ltdTier === "professional") priceId = process.env.STRIPE_PRICE_CREDITS_50_PRO!;
      else if (currentUser?.ltdTier === "founder") priceId = process.env.STRIPE_PRICE_CREDITS_50_FOUNDER!;
      else priceId = process.env.STRIPE_PRICE_CREDITS_50!;
    } else if (pack === "pro") {
      creditsToAdd = 250;
      if (currentUser?.ltdTier === "professional") priceId = process.env.STRIPE_PRICE_CREDITS_250_PRO!;
      else if (currentUser?.ltdTier === "founder") priceId = process.env.STRIPE_PRICE_CREDITS_250_FOUNDER!;
      else priceId = process.env.STRIPE_PRICE_CREDITS_250!;
    } else if (pack === "elite") {
      creditsToAdd = 1000;
      if (currentUser?.ltdTier === "professional") priceId = process.env.STRIPE_PRICE_CREDITS_1000_PRO!;
      else if (currentUser?.ltdTier === "founder") priceId = process.env.STRIPE_PRICE_CREDITS_1000_FOUNDER!;
      else priceId = process.env.STRIPE_PRICE_CREDITS_1000!;
    }

    if (!priceId) {
      return NextResponse.json(
        { message: `Credit price for ${pack} pack not configured.` },
        { status: 500 }
      );
    }

    // Handle stale customer ID logic as before
    let validCustomerId: string | undefined = session.user.stripeCustomerId || undefined;
    if (validCustomerId) {
      try {
        const existing = await stripe.customers.retrieve(validCustomerId);
        if ((existing as any).deleted) validCustomerId = undefined;
      } catch (err: any) {
        if (err.code === "resource_missing") {
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
      success_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
        credits: String(creditsToAdd),
        type: "credit_topup",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    const message = error?.message ?? "Internal server error";
    console.error("[Credit Top-up Error]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
