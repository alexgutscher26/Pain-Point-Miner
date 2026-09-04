import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import {
  getRedditAccessToken,
  fetchRedditResponse,
  validateSubredditExists,
  validateSubredditsBulk,
  fetchSubredditPostsBatched,
  fetchSubredditPostsPaginated,
} from "@/lib/reddit";

describe("Reddit OAuth Token Refresh & Automatic Retry", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      REDDIT_CLIENT_ID: "test-client-id",
      REDDIT_CLIENT_SECRET: "test-client-secret",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("deduplicates concurrent getRedditAccessToken calls into a single flight", async () => {
    let tokenFetchCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes("api/v1/access_token")) {
        tokenFetchCount += 1;
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: `token-${tokenFetchCount}`,
              expires_in: 3600,
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const [token1, token2, token3] = await Promise.all([
      getRedditAccessToken(true),
      getRedditAccessToken(false),
      getRedditAccessToken(false),
    ]);

    expect(token1).toBe("token-1");
    expect(token2).toBe("token-1");
    expect(token3).toBe("token-1");
    expect(tokenFetchCount).toBe(1);
  });

  it("retries fetching access token if initial attempt fails", async () => {
    let attempts = 0;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes("api/v1/access_token")) {
        attempts += 1;
        if (attempts === 1) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "recovered-token",
              expires_in: 3600,
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const token = await getRedditAccessToken(true);
    expect(token).toBe("recovered-token");
    expect(attempts).toBeGreaterThanOrEqual(2);
  });

  it("automatically refreshes token and retries request on 401 Unauthorized", async () => {
    let apiCallCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes("api/v1/access_token")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "new-valid-token",
              expires_in: 3600,
            }),
        });
      }

      apiCallCount += 1;
      if (apiCallCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { success: true } }),
      });
    });

    const res = await fetchRedditResponse("https://www.reddit.com/r/test.json");
    expect(res.ok).toBe(true);
    expect(apiCallCount).toBe(2);
  });
});

describe("Subreddit Existence Validation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects invalid subreddit names immediately without network requests", async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const res1 = await validateSubredditExists("ab");
    const res2 = await validateSubredditExists(
      "this_subreddit_name_is_way_too_long_and_invalid",
    );
    const res3 = await validateSubredditExists("bad-chars!");

    expect(res1.exists).toBe(false);
    expect(res1.reason).toBe("invalid_name");
    expect(res2.exists).toBe(false);
    expect(res2.reason).toBe("invalid_name");
    expect(res3.exists).toBe(false);
    expect(res3.reason).toBe("invalid_name");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("validates an active, existing subreddit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            display_name: "typescript",
            title: "TypeScript Community",
            subscribers: 150000,
          },
        }),
    });

    const res = await validateSubredditExists("typescript");
    expect(res.exists).toBe(true);
    expect(res.name).toBe("typescript");
    expect(res.subscribers).toBe(150000);
  });

  it("identifies a non-existent subreddit (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () => Promise.resolve({ error: 404, message: "Not Found" }),
    });

    const res = await validateSubredditExists("nonexistent_sub_12345");
    expect(res.exists).toBe(false);
    expect(res.reason).toBe("not_found");
  });

  it("identifies a banned subreddit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          reason: "banned",
          message: "This subreddit was banned",
        }),
    });

    const res = await validateSubredditExists("banned_community");
    expect(res.exists).toBe(false);
    expect(res.reason).toBe("banned");
  });

  it("identifies a private subreddit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          reason: "private",
          message: "This subreddit is private",
        }),
    });

    const res = await validateSubredditExists("private_sub");
    expect(res.exists).toBe(false);
    expect(res.reason).toBe("private");
  });

  it("bulk validates subreddits and separates valid from invalid", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes("/r/valid_sub/about.json")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                display_name: "valid_sub",
                subscribers: 5000,
              },
            }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 404 }),
      });
    });

    const result = await validateSubredditsBulk([
      "valid_sub",
      "r/invalid_one",
      "r/invalid_two",
    ]);

    expect(result.valid).toEqual(["valid_sub"]);
    expect(result.invalid.map((i) => i.name)).toEqual(
      expect.arrayContaining(["invalid_one", "invalid_two"]),
    );
  });
});

describe("Reddit after/before Pagination Cursors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes after and before cursor to fetchSubredditPostsPaginated and returns cursors", async () => {
    let capturedUrl = "";
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url as string;
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              after: "t3_next_page_cursor",
              before: "t3_prev_page_cursor",
              children: [
                {
                  data: {
                    id: "p1",
                    title: "Test Post 1",
                    selftext: "Body 1",
                    author: "user1",
                    score: 10,
                    subreddit: "SaaS",
                    url: "https://reddit.com/p1",
                    num_comments: 2,
                    created_utc: 1234567890,
                  },
                },
              ],
            },
          }),
      });
    });

    const pagedResult = await fetchSubredditPostsPaginated("SaaS", "pain", {
      after: "t3_cursor_123",
      maxPosts: 20,
    });

    expect(capturedUrl).toContain("after=t3_cursor_123");
    expect(pagedResult.posts).toHaveLength(1);
    expect(pagedResult.after).toBe("t3_next_page_cursor");
    expect(pagedResult.before).toBe("t3_prev_page_cursor");
  });

  it("fetches across multiple pages using after cursors to exceed 100 posts", async () => {
    let pageCount = 0;
    const requestedUrls: string[] = [];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      requestedUrls.push(url as string);
      pageCount += 1;

      const children = Array.from({ length: 100 }, (_, idx) => ({
        data: {
          id: `post_${(pageCount - 1) * 100 + idx}`,
          title: `Post ${(pageCount - 1) * 100 + idx}`,
          selftext: "Pain points and bugs with current software",
          author: "user",
          score: 15,
          subreddit: "SaaS",
          url: "https://reddit.com",
          num_comments: 4,
          created_utc: Math.floor(Date.now() / 1000) - 100,
        },
      }));

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              children,
              after: pageCount < 3 ? `t3_cursor_page_${pageCount}` : null,
            },
          }),
      });
    });

    const posts = await fetchSubredditPostsBatched("SaaS", "software", {
      maxPosts: 250,
      delayMs: 0,
    });

    expect(posts).toHaveLength(250);
    expect(pageCount).toBe(3);
    expect(requestedUrls[1]).toContain("after=t3_cursor_page_1");
    expect(requestedUrls[2]).toContain("after=t3_cursor_page_2");
  });
});
