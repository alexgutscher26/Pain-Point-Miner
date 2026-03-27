import { db } from "../lib/db";
import { user } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("User ID required");
    process.exit(1);
  }

  await db.update(user).set({ role: "admin" }).where(eq(user.id, userId));
  console.log(`User ${userId} promoted to admin`);
  process.exit(0);
}

main().catch(console.error);
