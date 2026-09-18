import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { SavedFilterPreset, DEFAULT_FILTER_PRESETS } from "@/lib/saved-filters";

const saveFilterSchema = z.object({
  name: z.string().min(1).max(50),
  filters: z.object({
    days: z.string().default("30"),
    status: z.string().default("all"),
    minScore: z.string().default("0"),
    savedOnly: z.string().default("false"),
    category: z.string().default("all"),
    searchTerm: z.string().optional(),
  }),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(req.headers);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, session.user.id),
      columns: { dashboardLayout: true },
    });

    const layout = (prefs?.dashboardLayout as Record<string, unknown>) || {};
    const userPresets = Array.isArray(layout.savedFilters)
      ? (layout.savedFilters as SavedFilterPreset[])
      : [];

    return NextResponse.json({
      presets: [...DEFAULT_FILTER_PRESETS, ...userPresets],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Saved Filters GET Error]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req.headers);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = saveFilterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid filter preset format", errors: parsed.error.format() },
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

    const currentSavedFilters = Array.isArray(currentLayout.savedFilters)
      ? (currentLayout.savedFilters as SavedFilterPreset[])
      : [];

    const newPreset: SavedFilterPreset = {
      id: `filter-${crypto.randomUUID()}`,
      name: parsed.data.name.trim(),
      isDefault: false,
      createdAt: new Date().toISOString(),
      filters: parsed.data.filters,
    };

    const updatedSavedFilters = [...currentSavedFilters, newPreset];
    const updatedLayout = {
      ...currentLayout,
      savedFilters: updatedSavedFilters,
    };

    if (existing) {
      await db
        .update(userPreferences)
        .set({ dashboardLayout: updatedLayout })
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
      preset: newPreset,
      presets: [...DEFAULT_FILTER_PRESETS, ...updatedSavedFilters],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Saved Filters POST Error]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(req.headers);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Preset ID is required" },
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

    const currentSavedFilters = Array.isArray(currentLayout.savedFilters)
      ? (currentLayout.savedFilters as SavedFilterPreset[])
      : [];

    const updatedSavedFilters = currentSavedFilters.filter((p) => p.id !== id);
    const updatedLayout = {
      ...currentLayout,
      savedFilters: updatedSavedFilters,
    };

    if (existing) {
      await db
        .update(userPreferences)
        .set({ dashboardLayout: updatedLayout })
        .where(eq(userPreferences.userId, session.user.id));
    }

    return NextResponse.json({
      success: true,
      presets: [...DEFAULT_FILTER_PRESETS, ...updatedSavedFilters],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Saved Filters DELETE Error]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
