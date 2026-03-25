import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  SettingsPageClient,
  type SettingsFormValues,
} from "@/components/dashboard/settings-page-client";

export const dynamic = "force-dynamic";

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
};

function parseDashboardLayout(input: unknown): DashboardLayoutSettings {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  return input as DashboardLayoutSettings;
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }

  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
    columns: {
      emailNotifications: true,
      dashboardLayout: true,
    },
  });

  const parsedLayout = parseDashboardLayout(preferences?.dashboardLayout);
  const persistedSettings = parsedLayout.settings ?? {};
  const notifications = persistedSettings.notifications ?? {};
  const scanDefaults = persistedSettings.scanDefaults ?? {};

  const initialValues: SettingsFormValues = {
    fullName: session.user.name ?? "",
    email: session.user.email ?? "",
    company: persistedSettings.company ?? "",
    role: persistedSettings.role ?? "",
    weeklyDigest:
      notifications.weeklyDigest ?? preferences?.emailNotifications ?? true,
    scanCompletionAlerts: notifications.scanCompletionAlerts ?? true,
    billingNotifications: notifications.billingNotifications ?? false,
    defaultSubredditCount: scanDefaults.defaultSubredditCount ?? 5,
    minimumOpportunityScore: scanDefaults.minimumOpportunityScore ?? 70,
    defaultLocale: scanDefaults.defaultLocale ?? "United States",
  };

  return <SettingsPageClient initialValues={initialValues} />;
}
