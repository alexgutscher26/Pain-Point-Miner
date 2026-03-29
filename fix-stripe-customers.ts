/**
 * Clears stale Stripe customer IDs from the database.
 * Run this when switching from Test → Live Stripe keys.
 * BetterAuth and our checkout routes will create fresh Live customers on next use.
 */
import { db } from "./lib/db";
import { user } from "./lib/db/schema";
import { isNotNull, is } from "drizzle-orm";
import Stripe from "stripe";
import { eq } from "drizzle-orm";

async function clearStaleCustomers() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("❌ STRIPE_SECRET_KEY not found.");
    process.exit(1);
  }

  const mode = key.startsWith("sk_live_") ? "LIVE" : "TEST";
  console.log(`🔑 Stripe mode: ${mode}\n`);

  const stripe = new Stripe(key, { apiVersion: "2025-01-27.acacia" as any });

  const allUsers = await db.select().from(user);
  console.log(`👥 Checking ${allUsers.length} user(s)...\n`);

  let cleared = 0;
  let ok = 0;
  let created = 0;

  for (const u of allUsers) {
    if (!u.stripeCustomerId) {
      // No customer ID — create one fresh
      try {
        const customer = await stripe.customers.create({
          email: u.email,
          name: u.name,
          metadata: { userId: u.id },
        });
        await db.update(user).set({ stripeCustomerId: customer.id }).where(eq(user.id, u.id));
        console.log(`✨ ${u.email} — created fresh: ${customer.id}`);
        created++;
      } catch (err: any) {
        console.error(`❌ ${u.email} — failed to create:`, err.message);
      }
      continue;
    }

    // Has an ID — verify it exists in current Stripe mode
    try {
      const customer = await stripe.customers.retrieve(u.stripeCustomerId);
      if ((customer as any).deleted) throw new Error("deleted");
      console.log(`✅ ${u.email} — OK (${u.stripeCustomerId})`);
      ok++;
    } catch (err: any) {
      if (err.code === "resource_missing" || err.message === "deleted") {
        // Stale ID from wrong mode — check if customer already exists by email
        const existing = await stripe.customers.list({ email: u.email, limit: 1 });
        if (existing.data.length > 0) {
          const liveId = existing.data[0]!.id;
          await db.update(user).set({ stripeCustomerId: liveId }).where(eq(user.id, u.id));
          console.log(`🔗 ${u.email} — linked to existing ${mode} customer: ${liveId}`);
        } else {
          // No customer in Stripe at all — create one
          const customer = await stripe.customers.create({
            email: u.email,
            name: u.name,
            metadata: { userId: u.id },
          });
          await db.update(user).set({ stripeCustomerId: customer.id }).where(eq(user.id, u.id));
          console.log(`✨ ${u.email} — stale ID replaced with: ${customer.id}`);
        }
        cleared++;
      } else {
        console.error(`❌ ${u.email} — unexpected error:`, err.message);
      }
    }
  }

  console.log(`\n📊 Summary: ${ok} OK | ${cleared} repaired | ${created} created`);
}

clearStaleCustomers();
