import { describe, expect, it } from "vitest";
import {
  getPlanEntitlements,
  isAtLeastPlan,
  isDepthAllowed,
  normalizeBillingPlan,
  resolvePlanForIdentity,
} from "@/lib/plan-gating";

describe("plan-gating", () => {
  it("normalizes known plan names", () => {
    expect(normalizeBillingPlan("starter")).toBe("starter");
    expect(normalizeBillingPlan("Growth Monthly")).toBe("growth");
    expect(normalizeBillingPlan("PRO")).toBe("pro");
    expect(normalizeBillingPlan("founder")).toBe("founder");
    expect(normalizeBillingPlan("Professional Annual")).toBe("professional");
    expect(normalizeBillingPlan("unknown")).toBe("starter");
  });

  it("resolves highest plan from active subscriptions", () => {
    const resolved = resolvePlanForIdentity({
      userId: "user-1",
      subscriptions: [
        { plan: "starter", status: "active" },
        { plan: "pro", status: "active" },
      ],
    });
    expect(resolved).toBe("pro");

    const resolvedFounder = resolvePlanForIdentity({
      userId: "user-2",
      subscriptions: [{ plan: "founder", status: "active" }],
    });
    expect(resolvedFounder).toBe("founder");

    const resolvedProfessional = resolvePlanForIdentity({
      userId: "user-3",
      subscriptions: [{ plan: "professional", status: "active" }],
    });
    expect(resolvedProfessional).toBe("professional");
  });

  it("blocks inactive subscriptions from plan resolution", () => {
    const resolved = resolvePlanForIdentity({
      userId: "user-1",
      subscriptions: [{ plan: "pro", status: "canceled" }],
    });
    expect(resolved).toBe("starter");
  });

  it("does not grant pro entitlements for trialing subscriptions (hard paywall)", () => {
    const resolved = resolvePlanForIdentity({
      userId: "user-1",
      subscriptions: [{ plan: "pro", status: "trialing" }],
    });
    // In a hard paywall, "trialing" is not in ACTIVE_SUBSCRIPTION_STATUSES
    expect(resolved).toBe("starter");
  });

  it("exposes expected entitlements by plan", () => {
    const starter = getPlanEntitlements("starter");
    const growth = getPlanEntitlements("growth");
    const pro = getPlanEntitlements("pro");

    expect(starter.maxSubredditsPerSearch).toBe(3);
    expect(growth.maxSubredditsPerSearch).toBe(10);
    expect(pro.maxSubredditsPerSearch).toBeNull();
  });

  it("checks plan ordering and depth gates", () => {
    expect(isAtLeastPlan("pro", "growth")).toBe(true);
    expect(isAtLeastPlan("starter", "growth")).toBe(false);
    expect(isDepthAllowed("starter", "basic")).toBe(true);
    expect(isDepthAllowed("starter", "advanced")).toBe(false);
    expect(isDepthAllowed("starter", "ultra")).toBe(false);
    expect(isDepthAllowed("growth", "ultra")).toBe(false);
    expect(isDepthAllowed("founder", "ultra")).toBe(false);
    expect(isDepthAllowed("pro", "deep")).toBe(true);
    expect(isDepthAllowed("pro", "ultra")).toBe(true);
    expect(isDepthAllowed("professional", "ultra")).toBe(true);
  });
});
