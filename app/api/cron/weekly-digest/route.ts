import { db } from "@/lib/db";
import { user, userPreferences, painPoint, keywordStat } from "@/lib/db/schema";
import { resolvePlanForIdentity, getCreditSummary } from "@/lib/plan-gating";
import { sendWeeklyDigestEmailProgrammatically } from "@/lib/loops/service";
import { and, eq, gte, sql, desc } from "drizzle-orm";
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
    // 1. Fetch all users with email notifications enabled
    const targetUsers = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        ltdTier: user.ltdTier,
      })
      .from(user)
      .innerJoin(userPreferences, eq(user.id, userPreferences.userId))
      .where(eq(userPreferences.emailNotifications, true));

    console.log(`[Weekly-Digest] Found ${targetUsers.length} users to process.`);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const results = [];

    for (const u of targetUsers) {
      try {
        // 2. Find top 3 opportunities for this user in the last 7 days
        const topOppsRaw = await db
          .select({
            title: painPoint.title,
            score: sql<number>`(COALESCE(${painPoint.score}, 0) + COALESCE(${painPoint.monetizationScore}, 0) + COALESCE(${painPoint.urgency}, 0)) / 3.0`,
            niche: painPoint.subreddit,
          })
          .from(painPoint)
          .where(
            and(
              eq(painPoint.userId, u.id),
              gte(painPoint.createdAt, sevenDaysAgo)
            )
          )
          .orderBy(desc(sql`score`))
          .limit(3);

        // 3. Find top trending keyword in user's saved niches (keywordStat)
        const topKeywordRaw = await db
          .select({
            keyword: keywordStat.keyword,
          })
          .from(keywordStat)
          .where(eq(keywordStat.userId, u.id))
          .orderBy(desc(keywordStat.painPointsFound), desc(keywordStat.updatedAt))
          .limit(1);

        const trendingKeyword = topKeywordRaw[0]?.keyword || "";

        // 4. Resolve plan and get usage summary
        // Mocking headers for resolvePlanSince its a CRON job
        const plan = resolvePlanForIdentity({
           userId: u.id,
           email: u.email,
           ltdTier: u.ltdTier
        });
        
        const usage = await getCreditSummary(u.id, plan);
        const scansRemaining = usage.totalRemaining;

        // 5. Send email via Loops
        const firstName = u.name.split(" ")[0] || "there";
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://threddiq.com"}/dashboard/settings`;

        // Normalize opportunities to ensure niche is a string
        const topOpportunities = topOppsRaw.map(opp => ({
          title: opp.title,
          score: Number(opp.score),
          niche: opp.niche || "general"
        })) as { title: string; score: number; niche: string }[];

        await sendWeeklyDigestEmailProgrammatically(
          u.email,
          firstName,
          topOpportunities,
          trendingKeyword,
          scansRemaining,
          unsubscribeUrl
        );

        results.push({ email: u.email, success: true });
      } catch (err) {
        console.error(`[Weekly-Digest] Failed to process user ${u.email}:`, err);
        results.push({ email: u.email, success: false });
      }
    }

    return NextResponse.json({
      processed: targetUsers.length,
      results
    });
  } catch (error) {
    console.error("[Weekly-Digest] Global error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
