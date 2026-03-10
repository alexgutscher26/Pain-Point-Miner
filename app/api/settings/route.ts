import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireApiContext } from "@/lib/api-auth";
import { apiError, apiJson } from "@/lib/api-error";
import { db } from "@/lib/db";
import { user, userPreferences } from "@/lib/db/schema";

const settingsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255, "Email is too long"),
  company: z.string().trim().max(120, "Company is too long"),
  role: z.string().trim().max(80, "Role is too long"),
  weeklyDigest: z.boolean(),
  scanCompletionAlerts: z.boolean(),
  billingNotifications: z.boolean(),
  defaultSubredditCount: z.number().int().min(1).max(25),
  minimumOpportunityScore: z.number().int().min(0).max(100),
  defaultLocale: z.string().trim().max(80, "Locale is too long"),
});

type SettingsPayload = z.infer<typeof settingsSchema>;

type DashboardLayoutSettings = {
  settings?: {
    company?: string;
    role?: string;
    notifications?: {
      weeklyDigest?: boolean;
      scanCompletionAlerts?: boolean;
      billingNotifications?: boolean;
    };
    scanDefaults?: {
      defaultSubredditCount?: number;
      minimumOpportunityScore?: number;
      defaultLocale?: string;
    };
  };
  [key: string]: unknown;
};

function parseDashboardLayout(input: unknown): DashboardLayoutSettings {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  return input as DashboardLayoutSettings;
}

function toSettingsPayload(args: {
  name: string;
  email: string;
  emailNotifications: boolean;
  dashboardLayout: unknown;
}): SettingsPayload {
  const parsedLayout = parseDashboardLayout(args.dashboardLayout);
  const persistedSettings = parsedLayout.settings ?? {};
  const notifications = persistedSettings.notifications ?? {};
  const scanDefaults = persistedSettings.scanDefaults ?? {};

  return {
    fullName: args.name,
    email: args.email,
    company: persistedSettings.company ?? "",
    role: persistedSettings.role ?? "",
    weeklyDigest: notifications.weeklyDigest ?? args.emailNotifications,
    scanCompletionAlerts: notifications.scanCompletionAlerts ?? true,
    billingNotifications: notifications.billingNotifications ?? false,
    defaultSubredditCount: scanDefaults.defaultSubredditCount ?? 5,
    minimumOpportunityScore: scanDefaults.minimumOpportunityScore ?? 70,
    defaultLocale: scanDefaults.defaultLocale ?? "United States",
  };
}

export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId } = authContext.context;

  try {
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { name: true, email: true },
    });
    if (!currentUser) {
      return apiError(
        404,
        "NOT_FOUND",
        "User not found",
        undefined,
        correlationId,
      );
    }

    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
      columns: {
        emailNotifications: true,
        dashboardLayout: true,
      },
    });

    return apiJson(
      toSettingsPayload({
        name: currentUser.name,
        email: currentUser.email,
        emailNotifications: preferences?.emailNotifications ?? true,
        dashboardLayout: preferences?.dashboardLayout,
      }),
      200,
      correlationId,
    );
  } catch (error) {
    console.error("Settings GET API Error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}

export async function PATCH(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId } = authContext.context;

  const body = await req.json().catch(() => null);
  const parsedBody = settingsSchema.safeParse(body);

  if (!parsedBody.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid request body",
      parsedBody.error.flatten(),
      correlationId,
    );
  }

  const payload = parsedBody.data;

  try {
    const existingPreferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
      columns: {
        id: true,
        dashboardLayout: true,
      },
    });
    const parsedLayout = parseDashboardLayout(
      existingPreferences?.dashboardLayout,
    );
    const nextDashboardLayout: DashboardLayoutSettings = {
      ...parsedLayout,
      settings: {
        ...(parsedLayout.settings ?? {}),
        company: payload.company,
        role: payload.role,
        notifications: {
          weeklyDigest: payload.weeklyDigest,
          scanCompletionAlerts: payload.scanCompletionAlerts,
          billingNotifications: payload.billingNotifications,
        },
        scanDefaults: {
          defaultSubredditCount: payload.defaultSubredditCount,
          minimumOpportunityScore: payload.minimumOpportunityScore,
          defaultLocale: payload.defaultLocale,
        },
      },
    };

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({
          name: payload.fullName,
          email: payload.email,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      if (existingPreferences) {
        await tx
          .update(userPreferences)
          .set({
            emailNotifications: payload.weeklyDigest,
            dashboardLayout: nextDashboardLayout,
          })
          .where(eq(userPreferences.id, existingPreferences.id));
      } else {
        await tx.insert(userPreferences).values({
          id: crypto.randomUUID(),
          userId,
          emailNotifications: payload.weeklyDigest,
          dashboardLayout: nextDashboardLayout,
        });
      }
    });

    return apiJson(payload, 200, correlationId);
  } catch (error) {
    const maybePgError = error as { code?: string };
    if (maybePgError?.code === "23505") {
      return apiError(
        409,
        "VALIDATION_ERROR",
        "Email is already in use",
        undefined,
        correlationId,
      );
    }
    console.error("Settings PATCH API Error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}
