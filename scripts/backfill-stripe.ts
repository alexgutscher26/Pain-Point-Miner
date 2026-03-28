import { drizzle } from "drizzle-orm/postgres-js";
import { user } from "../lib/db/schema";
import { isNull, eq } from "drizzle-orm";
import Stripe from "stripe";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in environment");
  process.exit(1);
}

// Create a new postgres client for this script
const sql = postgres(connectionString, {
  prepare: false,
  ssl: "require",
  connect_timeout: 30,
});

// Create a drizzle instance with our dedicated script client
const scriptDb = drizzle(sql, { schema: { user } });

// Log connection attempt without showing sensitive info
try {
  const dbUrl = new URL(connectionString);
  console.log(`🔌 Attempting to connect to database at: ${dbUrl.host}`);
} catch (e) {
  console.log("🔌 Attempting to connect to database...");
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not set in environment");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

async function main() {
  console.log("Fetching users without stripeCustomerId...");
  
  // Find all users where stripeCustomerId is null
  const usersToUpdate = await scriptDb.select().from(user).where(isNull(user.stripeCustomerId));

  console.log(`Found ${usersToUpdate.length} users to update.`);

  for (const u of usersToUpdate) {
    try {
      console.log(`Processing user: ${u.email} (${u.id})`);
      
      // We also check if a customer already exists with this email in Stripe 
      // to avoid creating duplicates if they previously tried to pay
      const existingCustomers = await stripe.customers.list({
        email: u.email,
        limit: 1,
      });

      let stripeCustomerId: string;

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        console.log(`Found existing Stripe customer for ${u.email}: ${stripeCustomerId}`);
      } else {
        console.log(`Creating new Stripe customer for: ${u.email}`);
        const customer = await stripe.customers.create({
          email: u.email,
          name: u.name,
          metadata: {
            userId: u.id,
          },
        });
        stripeCustomerId = customer.id;
      }

      await scriptDb.update(user)
        .set({ stripeCustomerId })
        .where(eq(user.id, u.id));

      console.log(`Successfully updated user ${u.id} in database with stripeCustomerId: ${stripeCustomerId}`);
    } catch (error) {
      console.error(`Error processing user ${u.id}:`, error);
    }
  }

  console.log("\n✅ Backfill complete.");
  
  // Explicitly exit to close database connections
  setTimeout(() => {
    process.exit(0);
  }, 500);
}

main().catch((err) => {
  console.error("\n❌ Fatal error in backfill script:", err);
  if (err.message && err.message.includes("ECONNREFUSED")) {
    console.error("\n💡 Connection refused. This usually means either:");
    console.error("1. Your DATABASE_URL is pointing to a host that isn't reachable (e.g. wrong host or port).");
    console.error("2. Your network is blocking outgoing connections to port 5432 (common on restricted WiFi).");
    console.error("3. The database is currently down (unlikely for Cloud DBs like Neon).");
    console.error("\nCheck your .env file and ensure DATABASE_URL matches what's on your Neon dashboard.");
  }
  process.exit(1);
});
