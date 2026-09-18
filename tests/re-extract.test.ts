import { describe, it, expect, vi, beforeEach } from "vitest";
import { reExtractOutdatedOpportunities } from "@/lib/re-extract-job";
import { CURRENT_EXTRACTION_SCHEMA_VERSION } from "@/lib/ai";

const mockUpdateSet = vi.fn().mockReturnValue({
  where: vi.fn().mockResolvedValue([{ id: "p1" }]),
});

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      painPoint: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      }),
    }),
    update: vi.fn().mockImplementation(() => ({
      set: mockUpdateSet,
    })),
  },
}));

import * as ai from "@/lib/ai";

describe("reExtractOutdatedOpportunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return zeros when no outdated records are found", async () => {
    const { db } = await import("@/lib/db");
    vi.mocked(db.query.painPoint.findMany).mockResolvedValueOnce([]);

    const result = await reExtractOutdatedOpportunities({ userId: "user-123" });
    expect(result).toEqual({ scanned: 0, updated: 0, remaining: 0 });
  });

  it("should re-extract and upgrade schemaVersion for outdated records", async () => {
    const { db } = await import("@/lib/db");
    vi.mocked(db.query.painPoint.findMany).mockResolvedValueOnce([
      {
        id: "p1",
        title: "Old Title",
        body: "Old Body",
        postUrl: "https://reddit.com/r/saas/1",
        author: "founder1",
        subreddit: "saas",
        schemaVersion: 1,
        tags: [],
        painPointComments: [{ id: "c1", body: "Comment text" }],
      },
    ] as any);

    vi.spyOn(ai, "extractPainPointsBatch").mockResolvedValueOnce([
      {
        title: "Upgraded Title",
        body: "Upgraded Body",
        painIntensity: 8,
        urgency: 8,
        monetizationScore: 8,
        marketMaturity: 7,
        confidenceScore: 0.9,
        targetUser: "SaaS Founder",
        competingProducts: ["Competitor X"],
        willingnessToPay: "paid_signal",
        featureRequested: "Automated webhook sync",
        url: "https://reddit.com/r/saas/1",
        author: "founder1",
        subreddit: "saas",
        triedSolutions: [],
        sentiment: "frustrated",
        difficulty: "startup_mvp",
      },
    ]);

    const result = await reExtractOutdatedOpportunities({
      userId: "user-123",
      targetVersion: CURRENT_EXTRACTION_SCHEMA_VERSION,
    });

    expect(result.scanned).toBe(1);
    expect(result.updated).toBe(1);
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaVersion: CURRENT_EXTRACTION_SCHEMA_VERSION,
        title: "Upgraded Title",
      }),
    );
  });
});
