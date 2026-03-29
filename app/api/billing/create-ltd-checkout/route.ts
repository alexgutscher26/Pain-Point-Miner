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
      priceId = process.env.STRIPE_PRICE_LTD_FOUNDER!;
      amount = 149;
    } else if (tier === "professional") {
      if (currentUser?.ltdTier === "founder") {
        // PRO-RATED UPGRADE
        priceId = process.env.STRIPE_PRICE_LTD_UPGRADE!; // User must provide this $150 price
        amount = 150;
      } else {
        priceId = process.env.STRIPE_PRICE_LTD_PROFESSIONAL!;
        amount = 299;
      }
    }

    if (!priceId) {
      return NextResponse.json(
        { message: `Stripe Price ID for ${tier} not configured.` },
        { status: 500 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: session.user.stripeCustomerId || undefined,
      customer_email: session.user.stripeCustomerId ? undefined : session.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
        ltdTier: tier,
        amountPaid: amount,
        type: "ltd_purchase",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("LTD Checkout Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
