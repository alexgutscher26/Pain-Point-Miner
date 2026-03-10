import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiContext: vi.fn(),
  workspaceScope: vi.fn(() => ({ __workspace_scope: true })),
  scraperFindFirst: vi.fn(),
  scraperRunFindFirst: vi.fn(),
  painPointFindMany: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  requireApiContext: mocks.requireApiContext,
  workspaceScope: mocks.workspaceScope,
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      scraper: { findFirst: mocks.scraperFindFirst },
      scraperRun: { findFirst: mocks.scraperRunFindFirst },
      painPoint: { findMany: mocks.painPointFindMany },
    },
  },
}));

import { GET } from "@/app/api/search/status/route";

describe("GET /api/search/status", () => {
  beforeEach(() => {
    mocks.requireApiContext.mockResolvedValue({
      ok: true,
      context: {
        correlationId: "test-correlation-id",
        userId: "user-1",
        workspaceId: null,
      },
    });
    mocks.scraperFindFirst.mockReset();
    mocks.scraperRunFindFirst.mockReset();
    mocks.painPointFindMany.mockReset();
  });

  it("returns 400 when id query param is missing", async () => {
    const req = new Request("http://localhost:3000/api/search/status");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.scraperFindFirst).not.toHaveBeenCalled();
  });

  it("returns 400 when id query param is invalid", async () => {
    const req = new Request(
      "http://localhost:3000/api/search/status?id=not-a-uuid",
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.scraperFindFirst).not.toHaveBeenCalled();
  });

  it("returns 404 for cross-user access attempts", async () => {
    mocks.scraperFindFirst.mockResolvedValue(null);

    const req = new Request(
      "http://localhost:3000/api/search/status?id=4b0bcc55-a413-4e26-a92f-c0a4c5b40668",
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
    expect(body.message).toBe("Scraper not found");
  });
});
