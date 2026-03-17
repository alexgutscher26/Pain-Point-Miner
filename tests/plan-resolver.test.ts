import { describe, expect, it } from "vitest";
import { resolvePlanAccessState } from "@/lib/plan-resolver";

describe("plan-resolver", () => {
  it("keeps users on pro during an active local trial", () => {
    const result = resolvePlanAccessState({
      resolvedPlan: "starter",
      hasActiveSubscription: false,
      userCreatedAt: new Date("2026-03-15T12:00:00.000Z"),
      now: new Date("2026-03-17T12:00:00.000Z"),
      localTrialEnabled: true,
      localTrialDays: 3,
      requirePaidAfterTrial: true,
    });

    expect(result.plan).toBe("pro");
    expect(result.trialActive).toBe(true);
    expect(result.planPurchaseRequired).toBe(false);
    expect(result.trialDaysRemaining).toBe(1);
  });

  it("requires a paid plan after the local trial expires", () => {
    const result = resolvePlanAccessState({
      resolvedPlan: "starter",
      hasActiveSubscription: false,
      userCreatedAt: new Date("2026-03-10T12:00:00.000Z"),
      now: new Date("2026-03-17T12:00:00.000Z"),
      localTrialEnabled: true,
      localTrialDays: 3,
      requirePaidAfterTrial: true,
    });

    expect(result.plan).toBe("starter");
    expect(result.trialActive).toBe(false);
    expect(result.planPurchaseRequired).toBe(true);
    expect(result.trialDaysRemaining).toBe(0);
    expect(result.trialEndsAt?.toISOString()).toBe("2026-03-13T12:00:00.000Z");
  });

  it("does not require purchase when an active subscription exists", () => {
    const result = resolvePlanAccessState({
      resolvedPlan: "growth",
      hasActiveSubscription: true,
      userCreatedAt: new Date("2026-03-10T12:00:00.000Z"),
      now: new Date("2026-03-17T12:00:00.000Z"),
      localTrialEnabled: true,
      localTrialDays: 3,
      requirePaidAfterTrial: true,
    });

    expect(result.plan).toBe("growth");
    expect(result.planPurchaseRequired).toBe(false);
    expect(result.trialActive).toBe(false);
  });
});
