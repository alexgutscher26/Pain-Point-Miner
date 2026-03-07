import { describe, expect, it } from "vitest";
import { isScraperDue, parsePositiveIntFromEnv } from "@/lib/scheduler";

describe("isScraperDue", () => {
  it("returns true when scraper has never run", () => {
    expect(isScraperDue(null, 15, new Date("2026-03-07T00:00:00Z"))).toBe(true);
  });

  it("returns false before interval has elapsed", () => {
    const now = new Date("2026-03-07T12:00:00Z");
    const lastRun = new Date("2026-03-07T11:50:01Z");
    expect(isScraperDue(lastRun, 15, now)).toBe(false);
  });

  it("returns true when interval has elapsed", () => {
    const now = new Date("2026-03-07T12:00:00Z");
    const lastRun = new Date("2026-03-07T11:30:00Z");
    expect(isScraperDue(lastRun, 15, now)).toBe(true);
  });
});

describe("parsePositiveIntFromEnv", () => {
  it("returns fallback for invalid values", () => {
    expect(parsePositiveIntFromEnv("abc", 10, 1, 100)).toBe(10);
  });

  it("clamps values to bounds", () => {
    expect(parsePositiveIntFromEnv("500", 10, 1, 100)).toBe(100);
    expect(parsePositiveIntFromEnv("-2", 10, 1, 100)).toBe(1);
  });
});
