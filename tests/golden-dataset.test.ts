import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  resolveExtractionPrompt,
  consumeOpenRouterStream,
  extractPainPoints,
  EXTRACTION_SYSTEM_PROMPT_V1,
  EXTRACTION_SYSTEM_PROMPT_V2,
  PROMPT_VERSIONS,
  CURRENT_EXTRACTION_SCHEMA_VERSION,
} from "@/lib/ai";

describe("Golden Dataset & Prompt Versioning Pipeline", () => {
  const goldenDatasetDir = path.join(process.cwd(), "tests/golden-dataset");

  it("should have a populated golden dataset with valid JSON test fixtures", () => {
    expect(fs.existsSync(goldenDatasetDir)).toBe(true);
    const files = fs
      .readdirSync(goldenDatasetDir)
      .filter((f) => f.endsWith(".json"));

    expect(files.length).toBeGreaterThanOrEqual(10);

    for (const file of files) {
      const content = fs.readFileSync(
        path.join(goldenDatasetDir, file),
        "utf-8",
      );
      const parsed = JSON.parse(content);

      expect(parsed.postId).toBeDefined();
      expect(parsed.subreddit).toBeDefined();
      expect(
        typeof parsed.selftext === "string" || typeof parsed.title === "string",
      ).toBe(true);
      expect(Array.isArray(parsed.expected)).toBe(true);
      expect(parsed.expected.length).toBeGreaterThan(0);

      for (const exp of parsed.expected) {
        expect(typeof exp.painPoint).toBe("string");
        expect(typeof exp.painIntensity).toBe("number");
        expect(typeof exp.hasBudgetSignal).toBe("boolean");
      }
    }
  });

  describe("resolveExtractionPrompt", () => {
    it("should return V1 prompt by default when no options specified", () => {
      const result = resolveExtractionPrompt();
      expect(result.promptVersion).toBe("v1");
      expect(result.systemPrompt).toBe(EXTRACTION_SYSTEM_PROMPT_V1);
    });

    it("should return V2 prompt when explicit v2 requested", () => {
      const result = resolveExtractionPrompt({ promptVersion: "v2" });
      expect(result.promptVersion).toBe("v2");
      expect(result.systemPrompt).toBe(EXTRACTION_SYSTEM_PROMPT_V2);
    });

    it("should randomly assign between v1 and v2 when enableAbTest is true", () => {
      const versions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const { promptVersion } = resolveExtractionPrompt({
          enableAbTest: true,
        });
        versions.add(promptVersion);
      }
      expect(versions.has("v1")).toBe(true);
      expect(versions.has("v2")).toBe(true);
    });
  });

  describe("consumeOpenRouterStream", () => {
    it("should aggregate streaming SSE data chunks and usage tokens", async () => {
      const chunks = [
        'data: {"choices":[{"delta":{"content":"{\\"painPoints\\": ["}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"{\\"title\\": \\"Slow DB queries\\", \\"body\\": \\"Users wait 10s.\\", \\"painIntensity\\": 8, \\"monetizationScore\\": 8, \\"urgency\\": 8, \\"marketMaturity\\": 5, \\"sentiment\\": \\"frustrated\\", \\"difficulty\\": \\"side_project\\", \\"triedSolutions\\": [], \\"budget\\": []}"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"]}"}}]}\n\n',
        'data: {"usage": {"prompt_tokens": 120, "completion_tokens": 45}}\n\n',
        "data: [DONE]\n\n",
      ];

      const encoder = new TextEncoder();
      let chunkIdx = 0;

      const mockStream = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (chunkIdx < chunks.length) {
            controller.enqueue(encoder.encode(chunks[chunkIdx]));
            chunkIdx++;
          } else {
            controller.close();
          }
        },
      });

      const mockResponse = {
        body: mockStream,
        headers: new Headers({ "content-type": "text/event-stream" }),
      } as unknown as Response;

      const result = await consumeOpenRouterStream(mockResponse);

      expect(result.content).toContain('{"painPoints": [');
      expect(result.content).toContain("Slow DB queries");
      expect(result.usage).toEqual({
        prompt_tokens: 120,
        completion_tokens: 45,
      });
    });
  });

  describe("extractPainPoints with prompt version and raw response preservation", () => {
    it("should attach promptVersion, schemaVersion, and rawResponse to extracted pain points", async () => {
      const mockPost = {
        title: "Manual invoice chasing is wasting 10 hours a week",
        selftext:
          "I run a design agency and spend Fridays chasing unpaid invoices.",
        url: "https://reddit.com/r/freelance/123",
        author: "agency_owner",
        subreddit: "freelance",
        comments: [
          {
            body: "I would pay $100/mo for an automated reminder that actually gets paid.",
          },
        ],
      };

      const mockExtractionPayload = {
        painPoints: [
          {
            title: "Manual Invoice Chasing Bottleneck",
            body: "Agency owners lose 10 hours weekly manually chasing clients for payments.",
            targetUser: "Design Agency Owner",
            competingProducts: ["FreshBooks"],
            willingnessToPay: "paid_signal",
            featureRequested: "Automated multi-channel invoice follow-up",
            confidenceScore: 0.9,
            painIntensity: 8,
            urgency: 7,
            monetizationScore: 8,
            marketMaturity: 6,
            triedSolutions: [],
            budget: [
              {
                quote: "I would pay $100/mo for an automated reminder",
                amountMinUsd: 100,
                amountMaxUsd: 100,
                cadence: "monthly",
                annualizedMidpointUsd: 1200,
                source: "comment",
              },
            ],
            sentiment: "frustrated",
            difficulty: "side_project",
          },
        ],
      };

      const originalEnv = process.env.OPENROUTER_API_KEY;
      process.env.OPENROUTER_API_KEY = "test_key";

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [
                {
                  message: {
                    content: JSON.stringify(mockExtractionPayload),
                  },
                },
              ],
              usage: { prompt_tokens: 200, completion_tokens: 100 },
            }),
        }),
      );

      const results = await extractPainPoints(
        mockPost,
        [],
        undefined,
        undefined,
        undefined,
        undefined,
        { promptVersion: "v2", stream: false },
      );

      expect(results).toHaveLength(1);
      const point = results[0];

      expect(point.title).toBe("Manual Invoice Chasing Bottleneck");
      expect(point.schemaVersion).toBe(CURRENT_EXTRACTION_SCHEMA_VERSION);
      expect(point.promptVersion).toBe("v2");
      expect(point.rawResponse).toBeDefined();
      expect(typeof point.rawResponse).toBe("string");
      expect(point.rawResponse).toContain("Manual Invoice Chasing Bottleneck");

      process.env.OPENROUTER_API_KEY = originalEnv;
      vi.restoreAllMocks();
    });
  });
});
