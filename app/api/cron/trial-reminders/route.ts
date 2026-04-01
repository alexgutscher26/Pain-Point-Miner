import { db } from "@/lib/db";
import { user, userPreferences } from "@/lib/db/schema";
import { resolvePlanForIdentity } from "@/lib/plan-gating";
import {
  sendTrialExpiringSoonEmailProgrammatically,
  sendTrialEndedEmailProgrammatically,
  sendTrialWinbackEmailProgrammatically,
} from "@/lib/loops/service";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const authHeader = req.headers.get("Authorization");

  if (
    secret !== process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://threddiq.com"}/dashboard/billing`;

    // Helper to process a specific day
    const processTrialReminders = async (daysAgo: number, emailType: "soon" | "ended" | "winback") => {
      // Find users who signed up exactly N days ago
      // Using CURRENT_DATE - N days logic
      const usersToNotify = await db
        .select({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          ltdTier: user.ltdTier,
        })
        .from(user)
        .innerJoin(userPreferences, eq(user.id, userPreferences.userId))
        .where(
          and(
            eq(userPreferences.emailNotifications, true),
            // Select users where truncated createdAt matches (today - daysAgo)
            sql`DATE(${user.createdAt}) = CURRENT_DATE - ${daysAgo}`
          )
        );

      console.log(`[Trial-Cron] Found ${usersToNotify.length} users for Day ${daysAgo} (${emailType}).`);

      for (const u of usersToNotify) {
        // Resolve current plan to see if they already upgraded
        const plan = resolvePlanForIdentity({
          userId: u.id,
          email: u.email,
          ltdTier: u.ltdTier,
        });

        // Skip if they are already on a paid plan (not starter)
        if (plan !== "starter") {
            console.log(`[Trial-Cron] Skipping user ${u.email} (already on ${plan}).`);
            continue;
        }

        const firstName = u.name.split(" ")[0] || "there";

        try {
          if (emailType === "soon") {
            await sendTrialExpiringSoonEmailProgrammatically(u.email, firstName, upgradeUrl);
          } else if (emailType === "ended") {
            await sendTrialEndedEmailProgrammatically(u.email, firstName, upgradeUrl);
          } else if (emailType === "winback") {
            await sendTrialWinbackEmailProgrammatically(u.email, firstName, upgradeUrl, "FOUNDER20");
          }
          console.log(`[Trial-Cron] Sent ${emailType} email to ${u.email}`);
        } catch (err) {
          console.error(`[Trial-Cron] Error sending ${emailType} to ${u.email}:`, err);
        }
      }
    };

    // Run for all 3 intervals
    await processTrialReminders(2, "soon");
    await processTrialReminders(3, "ended");
    await processTrialReminders(5, "winback");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Trial-Cron] Global error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
