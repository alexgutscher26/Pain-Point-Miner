import { and, eq, gte, sql } from "drizzle-orm";
import { startOfMonth } from "date-fns";
import { db } from "@/lib/db";
import { scraper, scraperRun, userPreferences, purchasedCredits } from "@/lib/db/schema";
import { MINING_PRESETS, type MiningDepth } from "./mining-presets";

export { MINING_PRESETS };
export type { MiningDepth };

export type BillingPlan = "starter" | "growth" | "pro" | "founder" | "professional";

export type PlanEntitlements = {
  monthlyScans: number | null;
  maxSubredditsPerSearch: number | null;
  allowedMiningDepths: readonly MiningDepth[];
  canSaveReports: boolean;
  hasTrendDetection: boolean;
  hasSaasOpportunities: boolean;
  hasCustomPatterns: boolean;
};

export const PLAN_ENTITLEMENTS: Record<BillingPlan, PlanEntitlements> = {
  starter: {
    monthlyScans: 2,
    maxSubredditsPerSearch: 3,
    allowedMiningDepths: ["basic"],
    canSaveReports: false,
    hasTrendDetection: false,
    hasSaasOpportunities: false,
    hasCustomPatterns: false,
  },
  growth: {
    monthlyScans: 50,
    maxSubredditsPerSearch: 10,
    allowedMiningDepths: ["basic", "deep"],
    canSaveReports: true,
    hasTrendDetection: false,
    hasSaasOpportunities: false,
    hasCustomPatterns: false,
  },
  pro: {
    monthlyScans: null,
    maxSubredditsPerSearch: null,
    allowedMiningDepths: ["basic", "deep", "advanced", "ultra"],
    canSaveReports: true,
    hasTrendDetection: true,
    hasSaasOpportunities: true,
    hasCustomPatterns: true,
  },
  founder: {
    monthlyScans: 30,
    maxSubredditsPerSearch: 10,
    allowedMiningDepths: ["basic", "deep"],
    canSaveReports: true,
    hasTrendDetection: false,
    hasSaasOpportunities: false,
    hasCustomPatterns: false,
  },
  professional: {
    monthlyScans: 100,
    maxSubredditsPerSearch: null,
    allowedMiningDepths: ["basic", "deep", "advanced", "ultra"],
    canSaveReports: true,
    hasTrendDetection: true,
    hasSaasOpportunities: true,
    hasCustomPatterns: true,
  },
};

export function calculateMiningCost(depth: MiningDepth): number {
  return MINING_PRESETS[depth]?.estimatedCredits ?? 1;
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "past_due",
]);
const PLAN_ORDER: Record<BillingPlan, number> = {
  starter: 1,
  growth: 2,
  pro: 3,
  founder: 4,
  professional: 5,
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
    return Object.entries(parsed).reduce<Record<string, BillingPlan>>(
      (acc, [key, value]) => {
        const resolved = planFromString(value);
        if (resolved) {
          acc[key.trim().toLowerCase()] = resolved;
        }
        return acc;
      },
      {},
    );
  } catch {
    return {};
  }
}

export function normalizeBillingPlan(
  input: string | null | undefined,
): BillingPlan {
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
  ltdTier?: string | null;
}) {
  const defaultPlan = normalizeBillingPlan(process.env.DEFAULT_BILLING_PLAN);
  const overrides = parsePlanOverrides(process.env.BILLING_PLAN_OVERRIDES_JSON);

  const byUserId = input.userId
    ? overrides[input.userId.trim().toLowerCase()]
    : undefined;
  if (byUserId) return byUserId;

  // Prioritize LTD Tiers if user has one
  if (input.ltdTier === "founder") return "founder";
  if (input.ltdTier === "professional") return "professional";

  const email = input.email?.trim().toLowerCase();
  const byEmail = email ? overrides[email] : undefined;
  if (byEmail) return byEmail;

  const activePlans =
    input.subscriptions
      ?.filter((subscription) =>
        ACTIVE_SUBSCRIPTION_STATUSES.has(
          (subscription.status ?? "").toLowerCase(),
        ),
      )
      .map((subscription) => planFromString(subscription.plan))
      .filter((plan): plan is BillingPlan => Boolean(plan)) ?? [];

  if (activePlans.length === 0) {
    return defaultPlan;
  }

  return activePlans.reduce((highest, current) =>
    PLAN_ORDER[current] > PLAN_ORDER[highest] ? current : highest,
  );
}

export async function getAnniversaryDate(userId: string) {
  const result = await db
    .select({ anniversaryDate: userPreferences.anniversaryDate })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));
  return result[0]?.anniversaryDate ?? null;
}

export async function getPurchasedCreditsBalance(userId: string) {
  const result = await db
    .select({ amount: purchasedCredits.amount })
    .from(purchasedCredits)
    .where(eq(purchasedCredits.userId, userId));
  return result[0]?.amount ?? 0;
}

export async function getMonthlyScanUsage(userId: string, now = new Date()) {
  let fromDate = startOfMonth(now);

  const anniversary = await getAnniversaryDate(userId);
  if (anniversary) {
    const day = anniversary.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    const currentAnniversary = new Date(year, month, day);
    
    // If today is before this month's anniversary, the period started last month
    if (now < currentAnniversary) {
      fromDate = new Date(year, month - 1, day);
    } else {
      fromDate = currentAnniversary;
    }
  }

  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${scraperRun.cost}), 0)` })
    .from(scraperRun)
    .innerJoin(scraper, eq(scraperRun.scraperId, scraper.id))
    .where(
      and(eq(scraper.userId, userId), gte(scraperRun.startedAt, fromDate)),
    );
  return Number(result[0]?.total ?? 0);
}

export async function getCreditSummary(userId: string, plan: BillingPlan) {
  const used = await getMonthlyScanUsage(userId);
  const purchased = await getPurchasedCreditsBalance(userId);
  const limit = PLAN_ENTITLEMENTS[plan].monthlyScans;

  const baseRemaining = limit === null ? null : Math.max(limit - used, 0);
  const totalRemaining = baseRemaining === null ? null : baseRemaining + purchased;

  return {
    monthlyUsed: used,
    monthlyLimit: limit,
    monthlyRemaining: baseRemaining,
    purchasedRemaining: purchased,
    totalRemaining,
  };
}

export function getMonthlyUsageSummary(
  plan: BillingPlan,
  monthlyScansUsed: number,
) {
  const limit = PLAN_ENTITLEMENTS[plan].monthlyScans;
  return {
    monthlyScansUsed,
    monthlyScansLimit: limit,
    monthlyScansRemaining:
      limit === null ? null : Math.max(limit - monthlyScansUsed, 0),
  };
}
