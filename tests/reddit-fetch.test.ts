import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchSubredditPosts } from "@/lib/reddit";

describe("fetchSubredditPosts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and returns a list of reddit posts up to the limit", async () => {
    // Mock the global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          children: [
            {
              data: {
                id: "1",
                title: "Test Post 1",
                selftext: "Body 1",
                author: "user1",
                score: 20, // Setting higher score so it gets sorted first
                subreddit: "test",
                url: "https://reddit.com/1",
                num_comments: 5,
                created_utc: 1234567890,
              },
            },
            {
              data: {
                id: "2",
                title: "Test Post 2",
                selftext: "Body 2",
                author: "user2",
                score: 10,
                subreddit: "test",
                url: "https://reddit.com/2",
                num_comments: 10,
                created_utc: 1234567891,
              },
            },
          ],
        },
      }),
    });

    const posts = await fetchSubredditPosts("test", "keyword", 2);

    expect(posts).toHaveLength(2);
    // Sort logic in rankRedditPosts will sort them, but let's just make sure IDs are included
    expect(posts.map((p) => p.id)).toContain("1");
    expect(posts.map((p) => p.id)).toContain("2");
  });

  it("handles fetch errors gracefully", async () => {
    // Mock the global fetch
    global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    const posts = await fetchSubredditPosts("test", "keyword", 2);
    expect(posts).toHaveLength(0);
  });

  it("returns empty array when no posts are found", async () => {
    // Mock the global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          children: [],
        },
      }),
    });

    const posts = await fetchSubredditPosts("test", "keyword", 2);
    expect(posts).toHaveLength(0);
  });

  it("handles multiple batches when limit > 100", async () => {
    // Mock the global fetch
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount += 1;
      const start = (callCount - 1) * 100;
      const children = Array.from({ length: 100 }, (_, i) => ({
        data: {
          id: `${start + i}`,
          title: `Test Post ${start + i}`,
          selftext: `Body ${start + i}`,
          author: `user${start + i}`,
          score: 10,
          subreddit: "test",
          url: `https://reddit.com/${start + i}`,
          num_comments: 5,
          created_utc: 1234567890,
        },
      }));
      return {
        ok: true,
        json: async () => ({
          data: {
            children: callCount < 2 ? children : children.slice(0, 50),
            after: callCount < 2 ? "after_token" : null,
          },
        }),
      };
    });

    const posts = await fetchSubredditPosts("test", "keyword", 150);

    expect(posts).toHaveLength(150);
  });
});
