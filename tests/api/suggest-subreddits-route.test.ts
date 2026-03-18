import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiContext: vi.fn(),
  resolvePlanContext: vi.fn(),
  getPlanEntitlements: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  requireApiContext: mocks.requireApiContext,
}));

vi.mock("@/lib/plan-resolver", () => ({
  resolvePlanContext: mocks.resolvePlanContext,
}));

vi.mock("@/lib/plan-gating", () => ({
  getPlanEntitlements: mocks.getPlanEntitlements,
}));

import { POST } from "@/app/api/search/suggest-subreddits/route";

describe("POST /api/search/suggest-subreddits", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.OPENROUTER_API_KEY;

  beforeEach(() => {
    mocks.requireApiContext.mockResolvedValue({
      ok: true,
      context: {
        correlationId: "test-correlation-id",
        userId: "user-1",
        userEmail: "user@example.com",
      },
    });
    mocks.resolvePlanContext.mockResolvedValue({
      planPurchaseRequired: false,
      plan: "pro",
    });
    mocks.getPlanEntitlements.mockReturnValue({
      maxSubredditsPerSearch: null,
    });
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = originalApiKey;
    }
  });

  it("returns normalized subreddit suggestions from markdown-wrapped JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content:
                "```json\n[\"r/SaaS\", \"Entrepreneur!\", \"SaaS\"]\n```",
            },
          },
        ],
      }),
    }) as typeof fetch;

    const req = new Request("http://localhost:3000/api/search/suggest-subreddits", {
      method: "POST",
      body: JSON.stringify({
        keyword: "b2b marketing",
        locale: "United States",
        count: 5,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.subreddits).toEqual(["saas", "entrepreneur"]);
  });

  it("falls back to an empty list when the AI provider returns a non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: vi.fn().mockResolvedValue("{\"error\":\"invalid response_format\"}"),
    }) as typeof fetch;

    const req = new Request("http://localhost:3000/api/search/suggest-subreddits", {
      method: "POST",
      body: JSON.stringify({
        keyword: "b2b marketing",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.subreddits).toEqual([]);
  });
});
