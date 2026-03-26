import { describe, expect, it, vi, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Pure unit tests — getSortModesForDepth + SORT_MODES_BY_DEPTH
// No I/O, no mocking needed.
// ---------------------------------------------------------------------------

import {
  getSortModesForDepth,
  SORT_MODES_BY_DEPTH,
  type RedditSortMode,
} from "@/lib/reddit";

describe("getSortModesForDepth", () => {
  it("returns [relevance] for basic", () => {
    expect(getSortModesForDepth("basic")).toEqual(["relevance"]);
  });

  it("returns [relevance, hot] for deep", () => {
    expect(getSortModesForDepth("deep")).toEqual(["relevance", "hot"]);
  });

  it("returns all 4 modes for advanced", () => {
    expect(getSortModesForDepth("advanced")).toEqual([
      "relevance",
      "hot",
      "new",
      "top",
    ]);
  });

  it("falls back to [relevance] for an unknown depth", () => {
    expect(getSortModesForDepth("unknown")).toEqual(["relevance"]);
  });

  it("SORT_MODES_BY_DEPTH contains all defined depths", () => {
    expect(Object.keys(SORT_MODES_BY_DEPTH)).toEqual(
      expect.arrayContaining(["basic", "deep", "advanced"]),
    );
  });

  it("basic mode list has no duplicates", () => {
    const modes = getSortModesForDepth("basic");
    expect(new Set(modes).size).toBe(modes.length);
  });

  it("advanced mode list has no duplicates", () => {
    const modes = getSortModesForDepth("advanced");
    expect(new Set(modes).size).toBe(modes.length);
  });

  it("advanced depth is a superset of deep modes", () => {
    const deep = getSortModesForDepth("deep") as RedditSortMode[];
    const advanced = getSortModesForDepth("advanced") as RedditSortMode[];
    for (const mode of deep) {
      expect(advanced).toContain(mode);
    }
  });
});

// ---------------------------------------------------------------------------
// fetchSubredditPostsMultiSort — integration tests via global.fetch mock.
//
// The REDDIT_CLIENT_ID env var may be set (dev env), so OAuth token requests
// will fire. We serve a fake token for the token endpoint, then route listing
// requests by their sort= param.
// ---------------------------------------------------------------------------

import { fetchSubredditPostsMultiSort } from "@/lib/reddit";

/** Minimal Reddit OAuth token response */
const FAKE_TOKEN_RESPONSE = {
  ok: true,
  json: async () => ({ access_token: "fake-token", expires_in: 3600 }),
};

/** Minimal Reddit listing API response */
function makeListingResponse(postIds: string[]) {
  return {
    ok: true,
    json: async () => ({
      data: {
        after: null,
        children: postIds.map((id) => ({
          data: {
            id,
            title: `Post ${id}`,
            selftext: "struggling with this tool",
            author: "user1",
            score: 10,
            subreddit: "SaaS",
            url: `https://reddit.com/${id}`,
            num_comments: 5,
            // Recent enough to not be filtered by any age window
            created_utc: Math.floor(Date.now() / 1000) - 600,
          },
        })),
      },
    }),
  };
}

/**
 * Creates a fetch mock that:
 *  - Handles OAuth token requests with a fake token
 *  - Routes Reddit listing requests to `handler` based on sort= param
 */
function buildFetchMock(
  handler: (sortMode: string) => ReturnType<typeof makeListingResponse>,
) {
  return vi.fn().mockImplementation(async (url: string) => {
    if ((url as string).includes("api/v1/access_token")) {
      return FAKE_TOKEN_RESPONSE;
    }
    const match = /[?&]sort=([^&]+)/.exec(url as string);
    const sort = match?.[1] ?? "relevance";
    return handler(sort);
  });
}

describe("fetchSubredditPostsMultiSort", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("basic depth queries the API once with sort=relevance", async () => {
    const sortsSeen: string[] = [];
    global.fetch = buildFetchMock((sort) => {
      sortsSeen.push(sort);
      return makeListingResponse(["a1", "a2"]);
    });

    const posts = await fetchSubredditPostsMultiSort("SaaS", "pain", "basic");

    expect(sortsSeen).toContain("relevance");
    expect(sortsSeen.filter((s) => s !== "relevance")).toHaveLength(0);
    expect(posts).toHaveLength(2);
  });

  it("deep depth queries the API with relevance AND hot", async () => {
    const sortsSeen: string[] = [];
    global.fetch = buildFetchMock((sort) => {
      sortsSeen.push(sort);
      return sort === "relevance"
        ? makeListingResponse(["r1", "r2"])
        : makeListingResponse(["h1", "h2"]);
    });

    const posts = await fetchSubredditPostsMultiSort("SaaS", "pain", "deep");

    expect(sortsSeen).toContain("relevance");
    expect(sortsSeen).toContain("hot");
    expect(posts.map((p) => p.id)).toEqual(
      expect.arrayContaining(["r1", "r2", "h1", "h2"]),
    );
    expect(posts).toHaveLength(4);
  });

  it("advanced depth queries all 4 sort modes", async () => {
    const sortsSeen: string[] = [];
    global.fetch = buildFetchMock((sort) => {
      sortsSeen.push(sort);
      return makeListingResponse([`${sort}-1`]);
    });

    await fetchSubredditPostsMultiSort("SaaS", "pain", "advanced");

    for (const mode of ["relevance", "hot", "new", "top"]) {
      expect(sortsSeen).toContain(mode);
    }
  });

  it("deduplicates a post that appears in multiple sort modes", async () => {
    global.fetch = buildFetchMock((sort) => {
      if (sort === "relevance")
        return makeListingResponse(["shared", "unique-r"]);
      if (sort === "hot") return makeListingResponse(["shared", "unique-h"]);
      return makeListingResponse([]);
    });

    const posts = await fetchSubredditPostsMultiSort("SaaS", "pain", "deep");

    const ids = posts.map((p) => p.id);
    expect(ids.filter((id) => id === "shared")).toHaveLength(1);
    expect(ids).toHaveLength(3);
  });

  it("tags the shared post with the first sort mode that surfaced it", async () => {
    global.fetch = buildFetchMock((sort) => {
      if (sort === "relevance")
        return makeListingResponse(["shared", "r-only"]);
      if (sort === "hot") return makeListingResponse(["shared", "h-only"]);
      return makeListingResponse([]);
    });

    const posts = await fetchSubredditPostsMultiSort("SaaS", "pain", "deep");

    expect(posts.find((p) => p.id === "shared")?.sortMode).toBe("relevance");
    expect(posts.find((p) => p.id === "h-only")?.sortMode).toBe("hot");
  });

  it("returns empty array when the API returns no posts for any sort mode", async () => {
    global.fetch = buildFetchMock(() => makeListingResponse([]));

    const posts = await fetchSubredditPostsMultiSort("SaaS", "pain", "deep");

    expect(posts).toHaveLength(0);
  });

  it("returns partial results when only some sort modes have data", async () => {
    global.fetch = buildFetchMock((sort) => {
      return sort === "relevance"
        ? makeListingResponse(["r1"])
        : makeListingResponse([]);
    });

    const posts = await fetchSubredditPostsMultiSort("SaaS", "pain", "deep");

    expect(posts).toHaveLength(1);
    expect(posts[0]?.id).toBe("r1");
    expect(posts[0]?.sortMode).toBe("relevance");
  });
});
