import { describe, expect, it } from "vitest";
import { resolvePlanAccessState } from "@/lib/plan-resolver";

describe("plan-resolver", () => {
  it("requires a paid plan for starter users without LTD", () => {
    const result = resolvePlanAccessState({
      userId: "user_1",
      plan: "starter",
      ltdTier: "none",
    });

    expect(result.plan).toBe("starter");
    expect(result.planPurchaseRequired).toBe(true);
    expect(result.ltdTier).toBe("none");
  });

  it("grants access to growth plan users", () => {
    const result = resolvePlanAccessState({
      userId: "user_1",
      plan: "growth",
      ltdTier: "none",
    });

    expect(result.plan).toBe("growth");
    expect(result.planPurchaseRequired).toBe(false);
  });

  it("grants access to LTD founder users even on starter plan", () => {
    const result = resolvePlanAccessState({
      userId: "user_1",
      plan: "starter",
      ltdTier: "founder",
    });

    expect(result.plan).toBe("starter");
    expect(result.planPurchaseRequired).toBe(false);
    expect(result.ltdTier).toBe("founder");
  });

  it("grants access to LTD professional users even on starter plan", () => {
    const result = resolvePlanAccessState({
      userId: "user_1",
      plan: "starter",
      ltdTier: "professional",
    });

    expect(result.plan).toBe("starter");
    expect(result.planPurchaseRequired).toBe(false);
    expect(result.ltdTier).toBe("professional");
  });
});
