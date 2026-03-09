import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { scraper } from "@/lib/db/schema";

export type BillingPlan = "starter" | "growth" | "pro";
export type MiningDepth = "basic" | "deep" | "advanced";

export type PlanEntitlements = {
  monthlyScans: number | null;
  maxSubredditsPerSearch: number | null;
  allowedMiningDepths: readonly MiningDepth[];
  canSaveReports: boolean;
  hasTrendDetection: boolean;
  hasSaasOpportunities: boolean;
};

export const PLAN_ENTITLEMENTS: Record<BillingPlan, PlanEntitlements> = {
  starter: {
    monthlyScans: 10,
    maxSubredditsPerSearch: 3,
    allowedMiningDepths: ["basic"],
    canSaveReports: false,
    hasTrendDetection: false,
    hasSaasOpportunities: false,
  },
  growth: {
    monthlyScans: 50,
    maxSubredditsPerSearch: 10,
    allowedMiningDepths: ["basic", "advanced"],
    canSaveReports: true,
    hasTrendDetection: false,
    hasSaasOpportunities: false,
  },
  pro: {
    monthlyScans: null,
    maxSubredditsPerSearch: null,
    allowedMiningDepths: ["basic", "deep", "advanced"],
    canSaveReports: true,
    hasTrendDetection: true,
    hasSaasOpportunities: true,
  },
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);
const PLAN_ORDER: Record<BillingPlan, number> = {
  starter: 1,
  growth: 2,
  pro: 3,
};

type SubscriptionLike = {
  plan?: string | null;
  status?: string | null;
};

function planFromString(input: string | null | undefined): BillingPlan | null {
  const normalized = input?.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("growth")) return "growth";
  if (normalized.includes("starter")) return "starter";
  if (normalized.includes("free")) return "starter";

  return null;
}

function parsePlanOverrides(raw: string | undefined) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.entries(parsed).reduce<Record<string, BillingPlan>>((acc, [key, value]) => {
      const resolved = planFromString(value);
      if (resolved) {
        acc[key.trim().toLowerCase()] = resolved;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function normalizeBillingPlan(input: string | null | undefined): BillingPlan {
  return planFromString(input) ?? "starter";
}

export function getPlanEntitlements(plan: BillingPlan): PlanEntitlements {
  return PLAN_ENTITLEMENTS[plan];
}

export function isDepthAllowed(plan: BillingPlan, depth: MiningDepth) {
  return PLAN_ENTITLEMENTS[plan].allowedMiningDepths.includes(depth);
}

export function isAtLeastPlan(plan: BillingPlan, minimumPlan: BillingPlan) {
  return PLAN_ORDER[plan] >= PLAN_ORDER[minimumPlan];
}

export function resolvePlanForIdentity(input: {
  userId: string;
  email?: string | null;
  subscriptions?: SubscriptionLike[];
}) {
  const defaultPlan = normalizeBillingPlan(process.env.DEFAULT_BILLING_PLAN);
  const overrides = parsePlanOverrides(process.env.BILLING_PLAN_OVERRIDES_JSON);

  const byUserId = overrides[input.userId.trim().toLowerCase()];
  if (byUserId) return byUserId;

  const email = input.email?.trim().toLowerCase();
  const byEmail = email ? overrides[email] : undefined;
  if (byEmail) return byEmail;

  const hasTrialingSubscription =
    input.subscriptions?.some(
      (subscription) => (subscription.status ?? "").toLowerCase() === "trialing"
    ) ?? false;
  if (hasTrialingSubscription) {
    return "pro";
  }

  const activePlans =
    input.subscriptions
      ?.filter((subscription) =>
        ACTIVE_SUBSCRIPTION_STATUSES.has((subscription.status ?? "").toLowerCase())
      )
      .map((subscription) => planFromString(subscription.plan))
      .filter((plan): plan is BillingPlan => Boolean(plan)) ?? [];

  if (activePlans.length === 0) {
    return defaultPlan;
  }

  return activePlans.reduce((highest, current) =>
    PLAN_ORDER[current] > PLAN_ORDER[highest] ? current : highest
  );
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getMonthlyScanUsage(userId: string, now = new Date()) {
  const fromDate = startOfMonth(now);
  const result = await db
    .select({ total: count() })
    .from(scraper)
    .where(and(eq(scraper.userId, userId), gte(scraper.createdAt, fromDate)));
  return result[0]?.total ?? 0;
}

export function getMonthlyUsageSummary(plan: BillingPlan, monthlyScansUsed: number) {
  const limit = PLAN_ENTITLEMENTS[plan].monthlyScans;
  return {
    monthlyScansUsed,
    monthlyScansLimit: limit,
    monthlyScansRemaining: limit === null ? null : Math.max(limit - monthlyScansUsed, 0),
  };
}
