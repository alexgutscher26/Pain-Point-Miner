import { describe, it, expect } from "vitest";
import { getCorrelationId, apiJson, apiError } from "@/lib/api-error";

describe("api-error", () => {
  describe("getCorrelationId", () => {
    it("extracts correlationId from x-correlation-id header", () => {
      const req = new Request("http://localhost", {
        headers: { "x-correlation-id": "test-id-123" }
      });
      const id = getCorrelationId(req);
      expect(id).toBe("test-id-123");
    });

    it("trims whitespace from correlationId", () => {
      const req = new Request("http://localhost", {
        headers: { "x-correlation-id": "  test-id-123  " }
      });
      const id = getCorrelationId(req);
      expect(id).toBe("test-id-123");
    });

    it("generates random UUID when header is missing", () => {
      const req = new Request("http://localhost");
      const id = getCorrelationId(req);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("generates random UUID when header is empty string", () => {
      const req = new Request("http://localhost", {
        headers: { "x-correlation-id": "" }
      });
      const id = getCorrelationId(req);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("generates random UUID when header is only whitespace", () => {
      const req = new Request("http://localhost", {
        headers: { "x-correlation-id": "   " }
      });
      const id = getCorrelationId(req);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe("apiJson", () => {
    it("returns NextResponse with body and status", async () => {
      const res = apiJson({ foo: "bar" }, 201, "my-id") as any;
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toEqual({ foo: "bar" });
      expect(res.headers.get("x-correlation-id")).toBe("my-id");
    });

    it("generates correlationId if not provided", async () => {
      const res = apiJson({ foo: "bar" }) as any;
      expect(res.status).toBe(200); // default status
      const id = res.headers.get("x-correlation-id");
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("includes extraHeaders", async () => {
      const res = apiJson({ foo: "bar" }, 200, "my-id", { "x-custom": "value" }) as any;
      expect(res.headers.get("x-custom")).toBe("value");
    });
  });

  describe("apiError", () => {
    it("returns correct error body and status", async () => {
      const res = apiError(400, "VALIDATION_ERROR", "Invalid input", undefined, "error-id") as any;
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Invalid input"
      });
      expect(res.headers.get("x-correlation-id")).toBe("error-id");
    });

    it("includes details if provided", async () => {
      const res = apiError(422, "VALIDATION_ERROR", "Invalid input", { field: "email" }, "error-id") as any;
      const body = await res.json();
      expect(body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: { field: "email" }
      });
    });

    it("generates correlationId if not provided", async () => {
      const res = apiError(500, "INTERNAL_SERVER_ERROR", "Server error") as any;
      const id = res.headers.get("x-correlation-id");
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("includes extraHeaders", async () => {
      const res = apiError(403, "FORBIDDEN", "No access", undefined, "my-id", { "x-custom-err": "err-value" }) as any;
      expect(res.headers.get("x-custom-err")).toBe("err-value");
    });
  });
});
