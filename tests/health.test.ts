import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/health/route";

vi.mock("@/lib/db", () => ({
  db: {
    execute: vi.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

describe("GET /api/health", () => {
  it("should return healthy status with 200 code and request id headers", async () => {
    const req = new Request("http://localhost:3000/api/health", {
      headers: {
        "x-request-id": "test-req-12345",
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("test-req-12345");
    expect(res.headers.get("x-correlation-id")).toBe("test-req-12345");

    const data = await res.json();
    expect(data.status).toBe("healthy");
    expect(data.checks.database.status).toBe("healthy");
    expect(typeof data.checks.database.latencyMs).toBe("number");
    expect(data.checks.system.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(data.checks.system.memoryMb).toBeDefined();
  });
});
