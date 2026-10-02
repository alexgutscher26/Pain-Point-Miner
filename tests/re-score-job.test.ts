import { describe, it, expect, vi, beforeEach } from "vitest";
import { reScoreUserOpportunities } from "@/lib/re-score-job";
import { DEFAULT_WEIGHTS } from "@/lib/dashboard-metrics";

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
    update: vi.fn().mockImplementation(() => ({
      set: mockUpdateSet,
    })),
    transaction: vi.fn().mockImplementation(async (cb) => {
      return cb({
        update: vi.fn().mockImplementation(() => ({
          set: mockUpdateSet,
        })),
      });
    }),
  },
}));

describe("reScoreUserOpportunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle zero pain points gracefully", async () => {
    const { db } = await import("@/lib/db");
    (db.query.painPoint.findMany as any).mockResolvedValueOnce([]);

    const result = await reScoreUserOpportunities("user-empty");
    expect(result.totalProcessed).toBe(0);
    expect(result.totalUpdated).toBe(0);
    expect(db.query.painPoint.findMany).toHaveBeenCalledTimes(1);
  });

  it("should process and update a single batch of pain points", async () => {
    const { db } = await import("@/lib/db");
    (db.query.painPoint.findMany as any).mockResolvedValueOnce([
      {
        id: "p1",
        score: 50,
        urgency: 8,
        monetizationScore: 7,
        marketMaturity: 6,
        sentiment: "frustrated",
        mentionCount: 3,
        commentCount: 5,
        painPointFeedback: [{ vote: 1 }, { vote: 1 }],
      },
      {
        id: "p2",
        score: 40,
        urgency: 4,
        monetizationScore: 5,
        marketMaturity: 5,
        sentiment: "neutral",
        mentionCount: 1,
        commentCount: 2,
        painPointFeedback: [{ vote: -1 }],
      },
    ]);

    const result = await reScoreUserOpportunities("user-1", DEFAULT_WEIGHTS, {
      batchSize: 10,
    });

    expect(result.totalProcessed).toBe(2);
    expect(result.totalUpdated).toBe(2);
    expect(db.query.painPoint.findMany).toHaveBeenCalledTimes(1);
  });

  it("should handle cursor pagination across multiple batches", async () => {
    const { db } = await import("@/lib/db");
    (db.query.painPoint.findMany as any)
      .mockResolvedValueOnce([
        {
          id: "p1",
          score: 50,
          urgency: 5,
          monetizationScore: 5,
          marketMaturity: 5,
          sentiment: "neutral",
          mentionCount: 1,
          commentCount: 1,
          painPointFeedback: [],
        },
        {
          id: "p2",
          score: 60,
          urgency: 6,
          monetizationScore: 6,
          marketMaturity: 6,
          sentiment: "positive",
          mentionCount: 2,
          commentCount: 3,
          painPointFeedback: [],
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "p3",
          score: 70,
          urgency: 7,
          monetizationScore: 7,
          marketMaturity: 7,
          sentiment: "negative",
          mentionCount: 4,
          commentCount: 8,
          painPointFeedback: [],
        },
      ]);

    const result = await reScoreUserOpportunities("user-2", DEFAULT_WEIGHTS, {
      batchSize: 2,
    });

    expect(result.totalProcessed).toBe(3);
    expect(result.totalUpdated).toBe(3);
    expect(db.query.painPoint.findMany).toHaveBeenCalledTimes(2);
  });
});
