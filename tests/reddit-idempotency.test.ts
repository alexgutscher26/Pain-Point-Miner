import { describe, expect, it } from "vitest";
import { claimRedditPostForAiProcessing } from "@/lib/reddit-idempotency";

describe("claimRedditPostForAiProcessing", () => {
  it("returns false immediately if redditPostId is empty", async () => {
    const result = await claimRedditPostForAiProcessing("", "user1");
    expect(result).toBe(false);
  });

  it("returns false immediately if redditPostId is only whitespace", async () => {
    const result = await claimRedditPostForAiProcessing("   ", "user1");
    expect(result).toBe(false);
  });
});
