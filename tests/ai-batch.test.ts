import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractPainPointsBatch } from "@/lib/ai";

describe("extractPainPointsBatch", () => {
  const originalEnv = process.env;

  const mockPosts = [
    {
      title: "Inventory Sync is Broken",
      selftext: "Our Shopify inventory counts desync daily.",
      url: "https://reddit.com/r/shopify/1",
      author: "merchant1",
      subreddit: "shopify",
      comments: [{ body: "Same here, we lose 2 hours daily." }],
    },
    {
      title: "Invoicing is a nightmare",
      selftext: "Looking for an automated invoicing tool for freelancers.",
      url: "https://reddit.com/r/freelance/2",
      author: "designer2",
      subreddit: "freelance",
      comments: [{ body: "Would happily pay $30/mo for this." }],
    },
  ];

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.OPENROUTER_API_KEY = "test_key";
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should return empty array when posts array is empty", async () => {
    const result = await extractPainPointsBatch([]);
    expect(result).toEqual([]);
  });

  it("should successfully extract multiple pain points from batch response", async () => {
    const mockBatchResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              extractions: [
                {
                  threadIndex: 0,
                  painPoints: [
                    {
                      title: "Broken Shopify Inventory Sync",
                      body: "Shopify merchants suffer daily stock desyncs.",
                      targetUser: "Shopify Merchant",
                      competingProducts: ["InventoryPlanner"],
                      willingnessToPay: "paid_signal",
                      featureRequested: "Real-time sync webhooks",
                      confidenceScore: 0.9,
                      painIntensity: 8,
                      urgency: 7,
                      monetizationScore: 8,
                      marketMaturity: 6,
                      sentiment: "frustrated",
                      difficulty: "startup_mvp",
                    },
                  ],
                },
                {
                  threadIndex: 1,
                  painPoints: [
                    {
                      title: "Manual Freelance Invoicing Nightmare",
                      body: "Freelancers waste time creating manual invoices.",
                      targetUser: "Freelance Designer",
                      competingProducts: ["Freshbooks"],
                      willingnessToPay: "explicit_budget",
                      featureRequested: "Auto-recurring invoices",
                      confidenceScore: 0.85,
                      painIntensity: 6,
                      urgency: 6,
                      monetizationScore: 7,
                      marketMaturity: 5,
                      sentiment: "frustrated",
                      difficulty: "side_project",
                    },
                  ],
                },
              ],
            }),
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBatchResponse),
    } as Response);

    const result = await extractPainPointsBatch(mockPosts);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Broken Shopify Inventory Sync");
    expect(result[0].url).toBe(mockPosts[0].url);
    expect(result[0].subreddit).toBe("shopify");
    expect(result[0].targetUser).toBe("Shopify Merchant");

    expect(result[1].title).toBe("Manual Freelance Invoicing Nightmare");
    expect(result[1].url).toBe(mockPosts[1].url);
    expect(result[1].subreddit).toBe("freelance");
  });

  it("should gracefully fallback to individual extractions if batch JSON is malformed", async () => {
    // 1. Batch call returns malformed JSON
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "invalid json response" } }],
        }),
    } as Response);

    // 2. Individual fallback for post 1
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: "Fallback Pain 1",
                  body: "Body 1",
                  painIntensity: 6,
                  urgency: 6,
                  monetizationScore: 6,
                  marketMaturity: 5,
                  sentiment: "frustrated",
                  difficulty: "side_project",
                }),
              },
            },
          ],
        }),
    } as Response);

    // 3. Individual fallback for post 2
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: "Fallback Pain 2",
                  body: "Body 2",
                  painIntensity: 7,
                  urgency: 7,
                  monetizationScore: 7,
                  marketMaturity: 5,
                  sentiment: "frustrated",
                  difficulty: "side_project",
                }),
              },
            },
          ],
        }),
    } as Response);

    const result = await extractPainPointsBatch(mockPosts);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
