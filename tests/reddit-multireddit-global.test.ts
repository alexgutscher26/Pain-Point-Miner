import { describe, expect, it, vi, afterEach } from "vitest";
import {
  buildRedditSearchUrl,
  fetchSubredditPostsBatched,
  fetchSubredditPostsPaginated,
  fetchMultiRedditPostsBatched,
  fetchMultiRedditPostsMultiSort,
  validateSubredditExists,
} from "@/lib/reddit";

describe("buildRedditSearchUrl", () => {
  it("constructs single subreddit search URL with restrict_sr=1", () => {
    const params = new URLSearchParams({ q: "pain" });
    const url = buildRedditSearchUrl("saas", params);
    expect(url).toBe(
      "https://www.reddit.com/r/saas/search.json?q=pain&restrict_sr=1",
    );
  });

  it("constructs multi-reddit search URL with combined subreddits", () => {
    const params = new URLSearchParams({ q: "pain" });
    const url = buildRedditSearchUrl("saas+startups+entrepreneur", params);
    expect(url).toBe(
      "https://www.reddit.com/r/saas+startups+entrepreneur/search.json?q=pain&restrict_sr=1",
    );
  });

  it("constructs global r/all search URL without restrict_sr=1", () => {
    const params = new URLSearchParams({ q: "pain", restrict_sr: "1" });
    const url = buildRedditSearchUrl("all", params);
    expect(url).toBe("https://www.reddit.com/r/all/search.json?q=pain");
    expect(url).not.toContain("restrict_sr");

    const paramsRAll = new URLSearchParams({ q: "pain" });
    const urlRAll = buildRedditSearchUrl("r/all", paramsRAll);
    expect(urlRAll).toBe("https://www.reddit.com/r/all/search.json?q=pain");
  });
});

describe("r/all Global Search & Validation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates 'all' and 'r/all' as valid global destinations without 404 network lookup", async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const res1 = await validateSubredditExists("all");
    const res2 = await validateSubredditExists("r/all");

    expect(res1.exists).toBe(true);
    expect(res1.name).toBe("all");
    expect(res2.exists).toBe(true);
    expect(res2.name).toBe("all");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches posts globally from r/all", async () => {
    let capturedUrl = "";
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url as string;
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              children: [
                {
                  data: {
                    id: "global_1",
                    title: "Global pain point post",
                    selftext: "Looking for recommendations across all tools",
                    author: "global_user",
                    score: 100,
                    subreddit: "technology",
                    url: "https://reddit.com/r/technology/global_1",
                    num_comments: 50,
                    created_utc: 1600000000,
                  },
                },
              ],
            },
          }),
      });
    });

    const posts = await fetchSubredditPostsBatched("all", "recommendations", {
      maxPosts: 10,
    });

    expect(capturedUrl).toContain("/r/all/search.json");
    expect(capturedUrl).not.toContain("restrict_sr=1");
    expect(posts).toHaveLength(1);
    expect(posts[0]?.subreddit).toBe("technology");
  });
});

describe("multiReddit Scraping (Combined Multiple Subreddits)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates multi-reddit composite names (e.g. saas+startups)", async () => {
    const res = await validateSubredditExists("saas+startups+entrepreneur");
    expect(res.exists).toBe(true);
    expect(res.name).toBe("saas+startups+entrepreneur");
  });

  it("fetches posts from multiple subreddits in a single combined call using fetchMultiRedditPostsBatched", async () => {
    let capturedUrl = "";
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url as string;
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              children: [
                {
                  data: {
                    id: "sub_post_1",
                    title: "SaaS problem",
                    selftext: "Struggling with billing",
                    author: "u1",
                    score: 20,
                    subreddit: "SaaS",
                    url: "https://reddit.com/1",
                    num_comments: 10,
                    created_utc: 1600000000,
                  },
                },
                {
                  data: {
                    id: "sub_post_2",
                    title: "Startup problem",
                    selftext: "Struggling with hiring",
                    author: "u2",
                    score: 30,
                    subreddit: "startups",
                    url: "https://reddit.com/2",
                    num_comments: 15,
                    created_utc: 1600000001,
                  },
                },
              ],
            },
          }),
      });
    });

    const posts = await fetchMultiRedditPostsBatched(
      ["SaaS", "startups", "entrepreneur"],
      "struggling",
      { chunkSize: 3 },
    );

    expect(capturedUrl).toContain("/r/SaaS+startups+entrepreneur/search.json");
    expect(posts).toHaveLength(2);
    expect(posts.map((p) => p.subreddit)).toEqual(
      expect.arrayContaining(["SaaS", "startups"]),
    );
  });

  it("fetches multi-sort posts across grouped subreddits using fetchMultiRedditPostsMultiSort", async () => {
    const requestedUrls: string[] = [];
    global.fetch = vi.fn().mockImplementation((url: string) => {
      requestedUrls.push(url as string);
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              children: [
                {
                  data: {
                    id: `post_${requestedUrls.length}`,
                    title: "Pain point",
                    selftext: "Frustrating bug",
                    author: "u",
                    score: 15,
                    subreddit: "webdev",
                    url: "https://reddit.com",
                    num_comments: 5,
                    created_utc: 1600000000,
                  },
                },
              ],
            },
          }),
      });
    });

    const posts = await fetchMultiRedditPostsMultiSort(
      ["webdev", "reactjs"],
      "bug",
      "basic",
    );

    expect(requestedUrls[0]).toContain("/r/webdev+reactjs/search.json");
    expect(posts).toHaveLength(1);
    expect(posts[0]?.sortMode).toBe("relevance");
  });
});
