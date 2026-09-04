import { describe, expect, it, vi, afterEach } from "vitest";
import {
  validateCustomPatternRegex,
  validateCustomPatterns,
  validateSubredditExists,
  validateSubredditsBulk,
  fetchFromPullPushSubmissions,
  fetchFromPullPushComments,
} from "@/lib/reddit";

describe("Custom Pattern Regex Validation", () => {
  it("validates standard problem pattern strings and valid regular expressions", () => {
    expect(validateCustomPatternRegex("struggling with").valid).toBe(true);
    expect(validateCustomPatternRegex("pain point").valid).toBe(true);
    expect(validateCustomPatternRegex("(bug|issue|crash)").valid).toBe(true);
    expect(validateCustomPatternRegex("\\b(slow|lag|latency)\\b").valid).toBe(true);
    expect(validateCustomPatternRegex("error code: \\d+").valid).toBe(true);
  });

  it("catches and rejects invalid regular expressions with syntax error messages", () => {
    const invalid1 = validateCustomPatternRegex("[unclosed-bracket");
    expect(invalid1.valid).toBe(false);
    expect(invalid1.error).toBeDefined();

    const invalid2 = validateCustomPatternRegex("(?<invalid-group-name");
    expect(invalid2.valid).toBe(false);
    expect(invalid2.error).toBeDefined();

    const invalid3 = validateCustomPatternRegex("*(invalid-start");
    expect(invalid3.valid).toBe(false);
  });

  it("rejects empty or whitespace-only patterns", () => {
    expect(validateCustomPatternRegex("").valid).toBe(false);
    expect(validateCustomPatternRegex("   ").valid).toBe(false);
  });

  it("validates a batch of patterns and identifies all syntax errors", () => {
    const res = validateCustomPatterns([
      "good pattern",
      "(good|regex)",
      "[bad-regex",
      "(another-unclosed",
    ]);

    expect(res.valid).toBe(false);
    expect(res.errors).toHaveLength(2);
    expect(res.errors[0]?.pattern).toBe("[bad-regex");
    expect(res.errors[1]?.pattern).toBe("(another-unclosed");
  });
});

describe("Subreddit Subscriber Count Threshold Check (< 1,000 subscribers)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts subreddits with >= 1,000 subscribers", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            display_name: "high_signal_sub",
            subscribers: 25000,
          },
        }),
    });

    const res = await validateSubredditExists("high_signal_sub", {
      minSubscribers: 1000,
    });

    expect(res.exists).toBe(true);
    expect(res.subscribers).toBe(25000);
    expect(res.lowSubscribers).toBeUndefined();
  });

  it("rejects subreddits with < 1,000 subscribers when minSubscribers threshold is set", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            display_name: "tiny_sub",
            subscribers: 340,
          },
        }),
    });

    const res = await validateSubredditExists("tiny_sub", {
      minSubscribers: 1000,
    });

    expect(res.exists).toBe(false);
    expect(res.reason).toBe("low_subscribers");
    expect(res.lowSubscribers).toBe(true);
    expect(res.subscribers).toBe(340);
  });

  it("bulk filters out subreddits below the 1,000 subscriber threshold", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes("large_sub")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: { display_name: "large_sub", subscribers: 50000 },
            }),
        });
      }
      if ((url as string).includes("small_sub")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: { display_name: "small_sub", subscribers: 250 },
            }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 404 }),
      });
    });

    const result = await validateSubredditsBulk(
      ["large_sub", "small_sub", "missing_sub"],
      { minSubscribers: 1000 },
    );

    expect(result.valid).toEqual(["large_sub"]);
    expect(result.invalid.map((i) => i.name)).toEqual(
      expect.arrayContaining(["small_sub", "missing_sub"]),
    );
    const smallSubInfo = result.invalid.find((i) => i.name === "small_sub");
    expect(smallSubInfo?.reason).toBe("low_subscribers");
    expect(smallSubInfo?.subscribers).toBe(250);
  });
});

describe("PullPush.io Historical Fallback Robustness", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches historical submissions with query params and timestamp bounds", async () => {
    let capturedUrl = "";
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url as string;
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: "pp_1",
                title: "Historical pain point",
                selftext: "Old software complaint",
                author: "dev_user",
                score: 45,
                subreddit: "saas",
                url: "https://reddit.com/pp_1",
                num_comments: 12,
                created_utc: 1600000000,
              },
            ],
          }),
      });
    });

    const posts = await fetchFromPullPushSubmissions("saas", "software", 50, {
      after: 1590000000,
      before: 1610000000,
      retries: 1,
    });

    expect(capturedUrl).toContain("subreddit=saas");
    expect(capturedUrl).toContain("q=software");
    expect(capturedUrl).toContain("after=1590000000");
    expect(capturedUrl).toContain("before=1610000000");
    expect(posts).toHaveLength(1);
    expect(posts[0]?.id).toBe("pp_1");
  });

  it("retries on transient failure before returning results", async () => {
    let attempts = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      attempts += 1;
      if (attempts === 1) {
        return Promise.resolve({
          ok: false,
          status: 502,
          statusText: "Bad Gateway",
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: "pp_recovered",
                title: "Recovered Post",
                selftext: "Recovered body",
                author: "user",
                score: 5,
                subreddit: "saas",
              },
            ],
          }),
      });
    });

    const posts = await fetchFromPullPushSubmissions("saas", "pain", 10, {
      retries: 2,
    });

    expect(attempts).toBe(2);
    expect(posts).toHaveLength(1);
    expect(posts[0]?.id).toBe("pp_recovered");
  });

  it("fetches comments with retries", async () => {
    let commentAttempts = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      commentAttempts += 1;
      if (commentAttempts === 1) {
        return Promise.resolve({
          ok: false,
          status: 503,
          statusText: "Service Unavailable",
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: "c_1",
                body: "This is a great comment describing a pain point",
                author: "commenter",
                score: 8,
                permalink: "/r/saas/comments/123/c1",
                created_utc: 1600000000,
              },
            ],
          }),
      });
    });

    const comments = await fetchFromPullPushComments("post_123", { retries: 2 });
    expect(commentAttempts).toBe(2);
    expect(comments).toHaveLength(1);
    expect(comments[0]?.id).toBe("c_1");
  });
});
