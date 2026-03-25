import { describe, expect, it } from "vitest";
import { normalizeRunStatus, RunStatus } from "@/lib/run-status";

describe("normalizeRunStatus", () => {
  it("should return the exact valid status when provided", () => {
    const validStatuses: RunStatus[] = [
      "pending",
      "queued",
      "running",
      "scanning",
      "extracting",
      "clustering",
      "completed",
      "failed",
      "canceled",
    ];

    for (const status of validStatuses) {
      expect(normalizeRunStatus(status)).toBe(status);
    }
  });

  it("should map legacy status strings to their correct current status equivalents", () => {
    expect(normalizeRunStatus("success")).toBe("completed");
    expect(normalizeRunStatus("started")).toBe("running");
    expect(normalizeRunStatus("error")).toBe("failed");
  });

  it("should return 'pending' (default fallback) for invalid status strings", () => {
    expect(normalizeRunStatus("unknown")).toBe("pending");
    expect(normalizeRunStatus("done")).toBe("pending");
    expect(normalizeRunStatus("fail")).toBe("pending");
    expect(normalizeRunStatus("")).toBe("pending");
  });

  it("should return 'pending' (default fallback) when status is null or undefined", () => {
    expect(normalizeRunStatus(null)).toBe("pending");
    expect(normalizeRunStatus(undefined)).toBe("pending");
  });

  it("should return the provided fallback for invalid status", () => {
    expect(normalizeRunStatus("unknown", "failed")).toBe("failed");
    expect(normalizeRunStatus(null, "completed")).toBe("completed");
    expect(normalizeRunStatus(undefined, "queued")).toBe("queued");
    expect(normalizeRunStatus("", "canceled")).toBe("canceled");
  });
});
