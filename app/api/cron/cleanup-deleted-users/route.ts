import { db } from "@/lib/db";
import { user, workspace } from "@/lib/db/schema";
import { and, lt, isNotNull, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GDPR Cleanup Cron
 * Purges users who have been marked as 'deletedAt' for more than 30 days.
 * This also removes all their associated workspaces.
 */
export async function GET(req: Request) {
  // Simple check for cron secret if available
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Define the expiration window (30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Find all accounts marked for deletion that have exceeded the 30-day window
    const expiredUsers = await db
      .select({ id: user.id })
      .from(user)
      .where(and(isNotNull(user.deletedAt), lt(user.deletedAt, thirtyDaysAgo)));

    if (expiredUsers.length === 0) {
      return NextResponse.json({ message: "No users pending final deletion." });
    }

    const idsToPurge = expiredUsers.map((u) => u.id);

    // Atomically delete all data for these users
    await db.transaction(async (tx) => {
      // Remove workspaces owned by these users
      await tx.delete(workspace).where(inArray(workspace.ownerId, idsToPurge));

      // Remove the users themselves
      await tx.delete(user).where(inArray(user.id, idsToPurge));
    });

    console.log(
      `[GDPR CRON] Successfully purged ${idsToPurge.length} accounts.`,
    );

    return NextResponse.json({
      success: true,
      purgedCount: idsToPurge.length,
    });
  } catch (error) {
    console.error("[GDPR CRON] Error during user cleanup:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
