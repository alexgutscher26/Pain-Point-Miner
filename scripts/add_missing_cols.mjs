import { Pool } from 'pg';
import 'dotenv/config.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const client = await pool.connect();
  try {
    // Add missing columns to user table
    const missingCols = [
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" text`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "display_username" text`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "anonymize_reddit_usernames" boolean DEFAULT false NOT NULL`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ltd_tier" text DEFAULT 'none' NOT NULL`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ltd_price_paid" double precision DEFAULT 0`,
    ];

    for (const sql of missingCols) {
      console.log('Running:', sql);
      await client.query(sql);
    }

    // Check session table columns
    const sessionCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'session'
      ORDER BY ordinal_position
    `);
    console.log('\nSession columns:', sessionCols.rows.map(r => r.column_name).join(', '));

    // Check account table columns
    const accountCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'account'
      ORDER BY ordinal_position
    `);
    console.log('Account columns:', accountCols.rows.map(r => r.column_name).join(', '));

    // Check verification table columns
    const verificationCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'verification'
      ORDER BY ordinal_position
    `);
    console.log('Verification columns:', verificationCols.rows.map(r => r.column_name).join(', '));

    console.log('\nAll missing columns added successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}
run().catch(e => { console.error(e); process.exit(1); });
