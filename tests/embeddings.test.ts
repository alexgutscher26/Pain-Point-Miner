/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { generateEmbedding } from "@/lib/embeddings";

describe("generateEmbedding", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-api-key";
    global.fetch = vi.fn();
  });

  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("throws an error if OPENROUTER_API_KEY is not configured", async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(generateEmbedding("test text")).rejects.toThrow(
      "OPENROUTER_API_KEY is not configured.",
    );
  });

  it("returns a 1536-dimensional embedding on success", async () => {
    const mockEmbedding = Array(1536).fill(0.1);

    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ embedding: mockEmbedding }],
        }),
    });

    const result = await generateEmbedding("test text");

    expect(result).toEqual(mockEmbedding);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/embeddings",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: "test text",
        }),
      }),
    );
  });

  it("truncates text to 8000 characters", async () => {
    const mockEmbedding = Array(1536).fill(0.1);

    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ embedding: mockEmbedding }],
        }),
    });

    const longText = "a".repeat(10000);
    await generateEmbedding(longText);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/embeddings",
      expect.objectContaining({
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: "a".repeat(8000),
        }),
      }),
    );
  });

  it("throws an error if API responds with a non-ok status", async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    await expect(generateEmbedding("test text")).rejects.toThrow(
      "Embedding API error: 401 Unauthorized",
    );
  });

  it("throws an error if the embedding dimensions are unexpected", async () => {
    const wrongDimensions = Array(100).fill(0.1);

    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ embedding: wrongDimensions }],
        }),
    });

    await expect(generateEmbedding("test text")).rejects.toThrow(
      "Unexpected embedding dimensions: got 100, expected 1536",
    );
  });

  it("throws an error if the embedding is missing from response", async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{}], // missing embedding
        }),
    });

    await expect(generateEmbedding("test text")).rejects.toThrow(
      "Unexpected embedding dimensions: got 0, expected 1536",
    );
  });
});
