import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { apiJson, apiError, getCorrelationId } from "@/lib/api-error";

describe("api-error", () => {
  const MOCK_UUID = "mock-uuid-1234-5678";

  beforeEach(() => {
    // Mock crypto.randomUUID without stubGlobal
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(MOCK_UUID);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("apiJson", () => {
    it("returns a generic json response with 200 status and generated correlation id", async () => {
      const response = apiJson({ test: "data" });

      expect(response.status).toBe(200);
      expect(response.headers.get("x-correlation-id")).toBe(MOCK_UUID);

      const body = await response.json();
      expect(body).toEqual({ test: "data" });
    });

    it("uses provided status, correlationId, and extraHeaders", async () => {
      const response = apiJson(
        { msg: "custom" },
        201,
        "custom-corr-id",
        { "x-custom-header": "value" }
      );

      expect(response.status).toBe(201);
      expect(response.headers.get("x-correlation-id")).toBe("custom-corr-id");
      expect(response.headers.get("x-custom-header")).toBe("value");

      const body = await response.json();
      expect(body).toEqual({ msg: "custom" });
    });

    it("trims whitespace from provided correlation id or generates a new one if empty", () => {
      const respWithWhitespace = apiJson({}, 200, "  padded-id  ");
      expect(respWithWhitespace.headers.get("x-correlation-id")).toBe("padded-id");

      const respEmpty = apiJson({}, 200, "   ");
      expect(respEmpty.headers.get("x-correlation-id")).toBe(MOCK_UUID);
    });
  });

  describe("getCorrelationId", () => {
    it("returns existing correlation id from headers", () => {
      const req = new Request("https://example.com", {
        headers: {
          "x-correlation-id": "existing-id",
        },
      });
      expect(getCorrelationId(req)).toBe("existing-id");
    });

    it("generates a new correlation id if header is missing", () => {
      const req = new Request("https://example.com");
      expect(getCorrelationId(req)).toBe(MOCK_UUID);
    });

    it("generates a new correlation id if header is empty whitespace", () => {
      const req = new Request("https://example.com", {
        headers: {
          "x-correlation-id": "   ",
        },
      });
      expect(getCorrelationId(req)).toBe(MOCK_UUID);
    });
  });

  describe("apiError", () => {
    it("returns correctly formatted error response without details", async () => {
      const response = apiError(404, "NOT_FOUND", "Resource not found");

      expect(response.status).toBe(404);
      expect(response.headers.get("x-correlation-id")).toBe(MOCK_UUID);

      const body = await response.json();
      expect(body).toEqual({
        code: "NOT_FOUND",
        message: "Resource not found",
      });
    });

    it("returns correctly formatted error response with details and custom headers", async () => {
      const response = apiError(
        400,
        "VALIDATION_ERROR",
        "Invalid input",
        { field: "email", error: "Required" },
        "error-corr-id",
        { "x-retry": "false" }
      );

      expect(response.status).toBe(400);
      expect(response.headers.get("x-correlation-id")).toBe("error-corr-id");
      expect(response.headers.get("x-retry")).toBe("false");

      const body = await response.json();
      expect(body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: { field: "email", error: "Required" },
      });
    });
  });
});
