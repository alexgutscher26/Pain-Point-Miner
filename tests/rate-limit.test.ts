import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "../lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Enable fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers and clear mocks
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("allows requests within the limit", () => {
    const identifier = "user-1";
    const limit = 5;

    for (let i = 0; i < limit; i++) {
      const result = checkRateLimit(identifier, limit);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(limit - i - 1);
      expect(result.reset).toBe(0);
    }
  });

  it("blocks requests exceeding the limit", () => {
    const identifier = "user-2";
    const limit = 3;

    // First 3 requests should be allowed
    checkRateLimit(identifier, limit);
    checkRateLimit(identifier, limit);
    checkRateLimit(identifier, limit);

    // 4th request should be blocked
    const result = checkRateLimit(identifier, limit);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.reset).toBeGreaterThan(0);
  });

  it("resets the window after 60 seconds", () => {
    const identifier = "user-3";
    const limit = 2;

    // Consume the limit
    checkRateLimit(identifier, limit);
    checkRateLimit(identifier, limit);

    // Verify it is blocked
    const blockedResult = checkRateLimit(identifier, limit);
    expect(blockedResult.allowed).toBe(false);

    // Advance time by 60 seconds (60000ms)
    vi.advanceTimersByTime(60000);

    // Request should now be allowed
    const allowedResult = checkRateLimit(identifier, limit);
    expect(allowedResult.allowed).toBe(true);
    expect(allowedResult.remaining).toBe(1); // One used out of 2
  });

  it("handles independent identifiers correctly", () => {
    const limit = 2;

    // User A consumes their limit
    checkRateLimit("user-A", limit);
    checkRateLimit("user-A", limit);
    expect(checkRateLimit("user-A", limit).allowed).toBe(false);

    // User B should still be allowed
    const resultB = checkRateLimit("user-B", limit);
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(1);
  });

  it("calculates the correct reset time", () => {
    const identifier = "user-4";
    const limit = 1;

    // Make the first request at t=0
    checkRateLimit(identifier, limit);

    // Advance time by 20 seconds (20000ms)
    vi.advanceTimersByTime(20000);

    // The next request should be blocked, and the reset time should be 40 seconds
    const blockedResult = checkRateLimit(identifier, limit);
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.reset).toBe(40); // 60s - 20s = 40s
  });
});
