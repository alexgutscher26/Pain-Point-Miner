/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  constructStripeEvent,
  processStripeWebhookEvent,
} from "@/lib/billing-webhook";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { message: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event;
  try {
    event = constructStripeEvent(body, sig);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  try {
    const result = await processStripeWebhookEvent(event);
    return NextResponse.json({ received: true, ...result });
  } catch (err: any) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return NextResponse.json(
      { message: "Error processing webhook event", error: err.message },
      { status: 500 },
    );
  }
}
