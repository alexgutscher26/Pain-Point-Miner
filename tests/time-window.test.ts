import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIME_WINDOW,
  getRedditTimeRangeForWindow,
  getTimeWindowAgeSeconds,
  getTimeWindowLabel,
  normalizeTimeWindow,
} from "@/lib/time-window";

describe("normalizeTimeWindow", () => {
  it("returns the original value if it is a valid TimeWindow", () => {
    expect(normalizeTimeWindow("24h")).toBe("24h");
    expect(normalizeTimeWindow("7d")).toBe("7d");
    expect(normalizeTimeWindow("30d")).toBe("30d");
  });

  it("returns default TimeWindow if the value is '90d'", () => {
    expect(normalizeTimeWindow("90d")).toBe("90d");
  });

  it("returns default TimeWindow if the value is null", () => {
    expect(normalizeTimeWindow(null)).toBe(DEFAULT_TIME_WINDOW);
  });

  it("returns default TimeWindow if the value is undefined", () => {
    expect(normalizeTimeWindow(undefined)).toBe(DEFAULT_TIME_WINDOW);
  });

  it("returns default TimeWindow if the value is an invalid string", () => {
    expect(normalizeTimeWindow("12h")).toBe(DEFAULT_TIME_WINDOW);
    expect(normalizeTimeWindow("invalid")).toBe(DEFAULT_TIME_WINDOW);
    expect(normalizeTimeWindow("")).toBe(DEFAULT_TIME_WINDOW);
  });
});

describe("getTimeWindowLabel", () => {
  it("returns correct labels for valid time windows", () => {
    expect(getTimeWindowLabel("24h")).toBe("Last 24h");
    expect(getTimeWindowLabel("7d")).toBe("Last 7d");
    expect(getTimeWindowLabel("30d")).toBe("Last 30d");
    expect(getTimeWindowLabel("90d")).toBe("Last 90d");
  });

  it("returns default label for invalid cast inputs", () => {
    expect(getTimeWindowLabel("invalid" as any)).toBe("Last 90d");
  });
});

describe("getRedditTimeRangeForWindow", () => {
  it("returns correct reddit time ranges for valid time windows", () => {
    expect(getRedditTimeRangeForWindow("24h")).toBe("day");
    expect(getRedditTimeRangeForWindow("7d")).toBe("week");
    expect(getRedditTimeRangeForWindow("30d")).toBe("month");
    expect(getRedditTimeRangeForWindow("90d")).toBe("year");
  });

  it("returns default reddit time range for invalid cast inputs", () => {
    expect(getRedditTimeRangeForWindow("invalid" as any)).toBe("year");
  });
});

describe("getTimeWindowAgeSeconds", () => {
  it("returns correct age in seconds for valid time windows", () => {
    expect(getTimeWindowAgeSeconds("24h")).toBe(24 * 60 * 60);
    expect(getTimeWindowAgeSeconds("7d")).toBe(7 * 24 * 60 * 60);
    expect(getTimeWindowAgeSeconds("30d")).toBe(30 * 24 * 60 * 60);
    expect(getTimeWindowAgeSeconds("90d")).toBe(90 * 24 * 60 * 60);
  });

  it("returns default age in seconds for invalid cast inputs", () => {
    expect(getTimeWindowAgeSeconds("invalid" as any)).toBe(90 * 24 * 60 * 60);
  });
});
