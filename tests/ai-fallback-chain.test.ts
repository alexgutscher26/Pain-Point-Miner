import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  extractPainPoints,
  getFallbackModelChain,
  AI_MODELS,
  FREE_MODELS_POOL,
} from "@/lib/ai";

describe("AI Fallback Model Chain", () => {
  const originalEnv = process.env;

  const mockPost = {
    title: "Frustrated with manual CRM sync",
    selftext: "Our Hubspot contacts do not sync with Postgres automatically.",
    url: "https://reddit.com/r/sales/101",
    author: "salesleader",
    subreddit: "sales",
    comments: [{ body: "Huge problem for our team too." }],
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.OPENROUTER_API_KEY = "test_key";
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should construct an ordered fallback chain starting with the primary model", () => {
    const chain = getFallbackModelChain(AI_MODELS.GPT4O);
    expect(chain[0]).toBe(AI_MODELS.GPT4O);
    expect(chain.length).toBe(FREE_MODELS_POOL.length + 1);
    expect(chain).toContain("google/gemini-2.0-flash-exp:free");
    expect(chain).toContain("meta-llama/llama-3.3-70b-instruct:free");
  });

  it("should successfully cascade to secondary fallback model when primary model fails with 429", async () => {
    // 1st call (primary model) fails with 429
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      text: () => Promise.resolve("Rate limit exceeded"),
    } as Response);

    // 2nd call (first fallback model) succeeds
    const mockSuccessResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              painPoints: [
                {
                  title: "Manual CRM Sync Friction",
                  body: "Sales teams lose hours manually syncing Hubspot contacts to Postgres.",
                  targetUser: "Sales Operations Lead",
                  competingProducts: ["Hubspot", "Zapier"],
                  willingnessToPay: "paid_signal",
                  featureRequested: "Automated real-time Postgres sync webhook",
                  confidenceScore: 0.92,
                  painIntensity: 8,
                  urgency: 7,
                  monetizationScore: 8,
                  marketMaturity: 6,
                  sentiment: "frustrated",
                  difficulty: "startup_mvp",
                },
              ],
            }),
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSuccessResponse),
    } as Response);

    const result = await extractPainPoints(mockPost, [], AI_MODELS.GPT4O);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Manual CRM Sync Friction");
    expect(result[0].targetUser).toBe("Sales Operations Lead");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
