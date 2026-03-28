import { db } from "../lib/db";
import { user } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    throw new Error("User ID required");
  }

  await db.update(user).set({ role: "admin" }).where(eq(user.id, userId));
  console.log(`User ${userId} promoted to admin`);
}

main().catch((err) => {
  console.error(err);
  throw err;
});
