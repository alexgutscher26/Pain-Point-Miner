import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractPainPoints } from "@/lib/ai";

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
      url: mockPost.url,
      author: mockPost.author,
      subreddit: mockPost.subreddit,
      budget: [],
      triedSolutions: ["Solution A"],
    });
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
      expect.any(SyntaxError), // JSON.parse throws SyntaxError
    );
  });
});
