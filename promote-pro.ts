import { db } from "./lib/db";
import { user, userPreferences } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function setLTDPro() {
  const email = "workinbox6969@gmail.com";
  
  // Find user
  const u = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (!u) {
    console.error(`❌ User ${email} not found.`);
    process.exit(1);
  }

  console.log(`👤 Found user: ${u.id} | ${u.email}`);

  // 1. Update user record
  await db
    .update(user)
    .set({
      ltdTier: "professional",
      ltdPricePaid: 299,
    })
    .where(eq(user.id, u.id));

  // 2. Set anniversary date in user preferences
  await db
    .insert(userPreferences)
    .values({
      id: crypto.randomUUID(),
      userId: u.id,
      anniversaryDate: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { anniversaryDate: new Date() },
    });

  console.log(`✨ Successfully promoted ${email} to Professional LTD.`);
}

setLTDPro();
