import { describe, expect, it, vi } from "vitest";
import { getCorrelationId } from "@/lib/api-error";

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn(),
  },
}));

describe("getCorrelationId", () => {
  it("returns the correlation ID from the request headers if present", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-correlation-id": "test-correlation-id",
      },
    });

    expect(getCorrelationId(req)).toBe("test-correlation-id");
  });

  it("returns a trimmed correlation ID from the request headers if present", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-correlation-id": "  test-correlation-id  ",
      },
    });

    expect(getCorrelationId(req)).toBe("test-correlation-id");
  });

  it("generates a new UUID if the correlation ID header is not present", () => {
    const req = new Request("http://localhost");
    const uuid = getCorrelationId(req);
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe("string");
    // basic UUID validation
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("generates a new UUID if the correlation ID header is empty", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-correlation-id": "",
      },
    });
    const uuid = getCorrelationId(req);
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe("string");
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("generates a new UUID if the correlation ID header contains only whitespace", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-correlation-id": "   ",
      },
    });
    const uuid = getCorrelationId(req);
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe("string");
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
