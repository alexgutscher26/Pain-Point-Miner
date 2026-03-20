import { db } from "@/lib/db";
import { painPoint } from "@/lib/db/schema";
import { count, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await db
      .select({ value: count() })
      .from(painPoint)
      .where(gte(painPoint.createdAt, sevenDaysAgo));

    const totalCount = result[0]?.value ?? 0;

    return NextResponse.json({
      count: totalCount,
      period: "last_7_days",
    });
  } catch (error) {
    console.error("Error fetching pain point stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", count: 1240 }, // Fallback count
      { status: 500 },
    );
  }
}
