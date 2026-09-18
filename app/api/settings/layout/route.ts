import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const layoutSchema = z.object({
  cardOrder: z.array(z.string()).min(1),
  cardVisibility: z.record(z.string(), z.boolean()).optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(req.headers);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = layoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid layout payload", errors: parsed.error.format() },
        { status: 400 },
      );
    }

    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, session.user.id),
    });

    const currentLayout =
      existing?.dashboardLayout && typeof existing.dashboardLayout === "object"
        ? (existing.dashboardLayout as Record<string, unknown>)
        : {};

    const updatedLayout = {
      ...currentLayout,
      cardOrder: parsed.data.cardOrder,
      cardVisibility:
        parsed.data.cardVisibility ??
        (currentLayout.cardVisibility as Record<string, boolean> | undefined),
    };

    if (existing) {
      await db
        .update(userPreferences)
        .set({
          dashboardLayout: updatedLayout,
        })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      await db.insert(userPreferences).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        dashboardLayout: updatedLayout,
      });
    }

    return NextResponse.json({
      success: true,
      dashboardLayout: updatedLayout,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("[Dashboard Layout Save Error]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
