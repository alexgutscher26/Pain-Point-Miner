import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  extractPainPoints,
  getModelForDepth,
  AI_MODELS,
  AI_MODEL_LABELS,
} from "@/lib/ai";

describe("extractPainPoints", () => {
  const originalEnv = process.env;

  const mockPost = {
    title: "Test Title",
    selftext: "Test Body",
    url: "https://reddit.com/r/test/123",
    author: "testuser",
    subreddit: "test",
    comments: [],
  };

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

  it("should throw an error if OPENROUTER_API_KEY is not configured", async () => {
    delete process.env.OPENROUTER_API_KEY;

    await expect(extractPainPoints(mockPost)).rejects.toThrow(
      "OPENROUTER_API_KEY is not configured.",
    );
  });

  it("should successfully extract and map pain points from valid markdown JSON array", async () => {
    const mockPainPoint = {
      title: "Test Pain",
      body: "Test Body",
      painIntensity: 5,
      urgency: 5,
      monetizationScore: 5,
      marketMaturity: 5,
      sentiment: "frustrated",
      triedSolutions: [],
      budget: [],
    };

    const mockResponse = {
      choices: [
        {
          message: {
            content: `\`\`\`json\n[${JSON.stringify(mockPainPoint)}]\n\`\`\``,
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await extractPainPoints(mockPost);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...mockPainPoint,
      confidenceScore: 0.7,
      targetUser: undefined,
      competingProducts: [],
      willingnessToPay: "unknown",
      featureRequested: undefined,
      url: mockPost.url,
      author: mockPost.author,
      subreddit: mockPost.subreddit,
      budget: [],
      triedSolutions: [],
    });
  });

  it("should successfully extract pain points from a nested 'painPoints' object property", async () => {
    const mockPainPoint = {
      title: "Nested Pain",
      body: "Nested Body",
      painIntensity: 8,
      urgency: 7,
      monetizationScore: 9,
      marketMaturity: 6,
      sentiment: "desperate",
      triedSolutions: ["Solution A"],
      budget: [],
    };

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ painPoints: [mockPainPoint] }),
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await extractPainPoints(mockPost);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...mockPainPoint,
      confidenceScore: 0.7,
      targetUser: undefined,
      competingProducts: [],
      willingnessToPay: "unknown",
      featureRequested: undefined,
      url: mockPost.url,
      author: mockPost.author,
      subreddit: mockPost.subreddit,
      budget: [],
      triedSolutions: ["Solution A"],
    });
  });

  it("should extract confidenceScore, targetUser, competingProducts, willingnessToPay, and featureRequested", async () => {
    const mockPainPoint = {
      title: "DevOps Pipeline Breakage",
      body: "CI/CD builds frequently timeout and fail silently.",
      painIntensity: 9,
      urgency: 8,
      monetizationScore: 8,
      marketMaturity: 7,
      confidenceScore: 0.92,
      targetUser: "enterprise IT manager",
      competingProducts: ["Jenkins", "CircleCI"],
      willingnessToPay: "paid_signal",
      featureRequested:
        "Automated timeout alerts and dead-letter queue retries",
      sentiment: "frustrated",
      triedSolutions: ["GitHub Actions"],
      budget: [],
    };

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ painPoints: [mockPainPoint] }),
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await extractPainPoints(mockPost);

    expect(result).toHaveLength(1);
    expect(result[0].confidenceScore).toBe(0.92);
    expect(result[0].targetUser).toBe("enterprise IT manager");
    expect(result[0].competingProducts).toEqual(["Jenkins", "CircleCI"]);
    expect(result[0].willingnessToPay).toBe("paid_signal");
    expect(result[0].featureRequested).toBe(
      "Automated timeout alerts and dead-letter queue retries",
    );
  });

  it("should filter out low-confidence extractions (< 0.3)", async () => {
    const highConfPoint = {
      title: "High Confidence Issue",
      body: "Very clear detailed bug.",
      painIntensity: 8,
      urgency: 7,
      monetizationScore: 8,
      marketMaturity: 5,
      confidenceScore: 0.85,
      targetUser: "solo founder",
      sentiment: "frustrated",
      triedSolutions: [],
      budget: [],
    };

    const lowConfPoint = {
      title: "Low Confidence Vague Complaint",
      body: "Something might be slow occasionally.",
      painIntensity: 2,
      urgency: 1,
      monetizationScore: 1,
      marketMaturity: 2,
      confidenceScore: 0.2,
      targetUser: "casual lurker",
      sentiment: "neutral",
      triedSolutions: [],
      budget: [],
    };

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              painPoints: [highConfPoint, lowConfPoint],
            }),
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await extractPainPoints(mockPost);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("High Confidence Issue");
    expect(result[0].confidenceScore).toBe(0.85);
  });

  it("should catch fetch error when response is not ok and return empty array", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("API is down"),
    } as Response);

    const result = await extractPainPoints(mockPost);

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error in AI extraction:",
      expect.any(Error),
    );
    expect(console.error).toHaveBeenCalledWith(
      "Error in AI extraction:",
      expect.objectContaining({
        message: expect.stringContaining(
          "OpenRouter API error: 500 Internal Server Error - API is down",
        ),
      }),
    );
  });

  it("should catch JSON parse error for malformed response and return empty array", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: "This is not valid JSON",
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await extractPainPoints(mockPost);

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error in AI extraction:",
      expect.objectContaining({
        message: "No JSON object found in AI response",
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// getModelForDepth — routing logic
// ---------------------------------------------------------------------------
describe("getModelForDepth", () => {
  it("routes basic depth to Gemini 2.0 Flash", () => {
    expect(getModelForDepth("basic")).toBe(AI_MODELS.GEMINI_FLASH);
  });

  it("routes deep depth to Gemini 2.0 Flash (cost reduction)", () => {
    expect(getModelForDepth("deep")).toBe(AI_MODELS.GEMINI_FLASH);
  });

  it("routes advanced depth to Gemini 2.0 Flash (cost reduction)", () => {
    expect(getModelForDepth("advanced")).toBe(AI_MODELS.GEMINI_FLASH);
  });

  it("routes ultra depth to Gemini 2.0 Flash", () => {
    expect(getModelForDepth("ultra")).toBe(AI_MODELS.GEMINI_FLASH);
  });

  it("respects a valid modelOverride regardless of depth", () => {
    expect(getModelForDepth("basic", AI_MODELS.GEMINI_FLASH)).toBe(
      AI_MODELS.GEMINI_FLASH,
    );
    expect(getModelForDepth("deep", AI_MODELS.GEMINI_FLASH)).toBe(
      AI_MODELS.GEMINI_FLASH,
    );
    expect(getModelForDepth("ultra", AI_MODELS.GEMINI_FLASH)).toBe(
      AI_MODELS.GEMINI_FLASH,
    );
  });

  it("ignores an invalid modelOverride and falls back to Gemini Flash", () => {
    expect(getModelForDepth("deep", "invalid/model-xyz")).toBe(
      AI_MODELS.GEMINI_FLASH,
    );
  });

  it("AI_MODEL_LABELS has a human-readable label for every model", () => {
    for (const modelId of Object.values(AI_MODELS)) {
      expect(AI_MODEL_LABELS[modelId]).toBeTruthy();
    }
  });
});
