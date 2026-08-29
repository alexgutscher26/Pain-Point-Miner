import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { SettingsPageClient } from "@/components/dashboard/settings-page-client";
import { painPoint, userPreferences } from "@/lib/db/schema";
import { DEFAULT_WEIGHTS, ScoringWeights } from "@/lib/dashboard-metrics";

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
  const requestHeaders = await headers();
  const session = await getServerSession(requestHeaders);
  if (!session) {
    redirect("/sign-in");
  }

  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
    columns: {
      emailNotifications: true,
      dashboardLayout: true,
      scoringWeights: true,
      customApiKey: true,
    },
  });

  // Fetch sample opportunities for live preview
  const sampleOpportunities = await db.query.painPoint.findMany({
    where: eq(painPoint.userId, session.user.id),
    limit: 3,
    orderBy: [desc(painPoint.createdAt)],
    columns: {
      id: true,
      title: true,
      score: true,
      urgency: true,
      monetizationScore: true,
      marketMaturity: true,
      sentiment: true,
      mentionCount: true,
      commentCount: true,
    },
  });

  const parsedLayout = parseDashboardLayout(preferences?.dashboardLayout);
  const persistedSettings = parsedLayout.settings ?? {};
  const notifications = persistedSettings.notifications ?? {};
  const scanDefaults = persistedSettings.scanDefaults ?? {};

  const initialValues = {
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
    scoringWeights:
      (preferences?.scoringWeights as ScoringWeights) || DEFAULT_WEIGHTS,
    customApiKey: preferences?.customApiKey ?? "",
  };

  return (
    <SettingsPageClient
      initialValues={initialValues}
      sampleOpportunities={sampleOpportunities}
    />
  );
}
