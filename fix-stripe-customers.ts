import { db } from "./lib/db";
import { user } from "./lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

async function syncStripeCustomers() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("❌ STRIPE_SECRET_KEY not found in environment.");
    process.exit(1);
  }

  const mode = key.startsWith("sk_live_") ? "LIVE" : "TEST";
  console.log(`🔑 Using Stripe in ${mode} mode.`);

  const stripe = new Stripe(key, { apiVersion: "2025-01-27.acacia" as any });

  const allUsers = await db.select().from(user);
  console.log(`👥 Found ${allUsers.length} user(s) in database.\n`);

  let created = 0;
  let repaired = 0;
  let ok = 0;

  for (const u of allUsers) {
    // 1) If they have an ID, verify it actually exists in Stripe
    if (u.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(u.stripeCustomerId);
        if ((customer as any).deleted) {
          console.warn(`⚠️  ${u.email} — customer was deleted in Stripe. Re-creating...`);
        } else {
          console.log(`✅ ${u.email} — OK (${u.stripeCustomerId})`);
          ok++;
          continue;
        }
      } catch (err: any) {
        if (err.code === "resource_missing") {
          console.warn(`⚠️  ${u.email} — ID ${u.stripeCustomerId} not found in Stripe. Re-creating...`);
        } else {
          console.error(`❌ ${u.email} — unexpected error:`, err.message);
          continue;
        }
      }

      // 2) Before creating, check if a customer with this email already exists
      const existing = await stripe.customers.list({ email: u.email, limit: 1 });
      if (existing.data.length > 0) {
        const existingId = existing.data[0]!.id;
        await db.update(user).set({ stripeCustomerId: existingId }).where(eq(user.id, u.id));
        console.log(`🔗 ${u.email} — linked to existing Stripe customer ${existingId}`);
        repaired++;
        continue;
      }
    }

    // 3) No valid customer found — create a fresh one
    try {
      const customer = await stripe.customers.create({
        email: u.email,
        name: u.name,
        metadata: { userId: u.id },
      });
      await db.update(user).set({ stripeCustomerId: customer.id }).where(eq(user.id, u.id));
      console.log(`✨ ${u.email} — created new Stripe customer ${customer.id}`);
      created++;
    } catch (err: any) {
      console.error(`❌ ${u.email} — failed to create:`, err.message);
    }
  }

  console.log(`\n📊 Summary: ${ok} OK | ${repaired} repaired | ${created} created`);
}

syncStripeCustomers();
