/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      user: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/ai", () => ({
  extractPainPoints: vi.fn(),
}));

vi.mock("@/lib/reddit", () => ({
  filterPostsByProblemPatterns: vi.fn(),
  fetchComments: vi.fn(),
  fetchSubredditPostsMultiSort: vi.fn(),
  rankRedditPosts: vi.fn(),
  resolveProblemPatterns: vi.fn(),
  isSubredditThrottled: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/clustering", () => ({
  clusterPainPoint: vi.fn(),
}));

vi.mock("@/lib/reddit-idempotency", () => ({
  claimRedditPostForAiProcessing: vi.fn(),
}));

import { db } from "@/lib/db";
import { executeMiningRun } from "@/lib/mining-runner";
import * as reddit from "@/lib/reddit";
import * as ai from "@/lib/ai";

describe("executeMiningRun", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup base successful mocks for chainable DB methods
    const onConflictDoUpdateMock = vi.fn().mockResolvedValue({});
    (db.insert as any).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: onConflictDoUpdateMock,
      }),
    });

    const updateSetMock = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue({}),
    });
    (db.update as any).mockReturnValue({
      set: updateSetMock,
    });
  });

  describe("Error Handling", () => {
    it("handles db.query.user.findFirst error gracefully and triggers fallback execution error logic", async () => {
      const error = new Error("Database connection failed");
      (db.query.user.findFirst as any).mockRejectedValueOnce(error);

      await expect(
        executeMiningRun({
          scraperId: "test-scraper",
          keyword: "test",
          subreddits: ["test"],
          customPatterns: [],
          miningDepth: "basic",
          timeWindow: "7d",
          userId: "test-user",
          workspaceId: "test-workspace",
        }),
      ).rejects.toThrow("Database connection failed");

      // Verify the catch block logic
      expect(db.insert).toHaveBeenCalled(); // Should attempt to insert scraperRun with 'failed' state
      expect(db.update).toHaveBeenCalled();
    });

    it("handles subreddit fetch errors but continues processing other subreddits", async () => {
      // Mock successful DB queries
      (db.query.user.findFirst as any).mockResolvedValueOnce({
        id: "test-user",
        anonymizeRedditUsernames: false,
      });

      // Mock one subreddit succeeding and one failing
      (reddit.fetchSubredditPostsMultiSort as any).mockImplementation(
        (sub: string) => {
          if (sub === "fail-sub") {
            return Promise.reject(new Error("API Error"));
          }
          return Promise.resolve([
            {
              id: "post1",
              title: "Test",
              selftext: "Test",
              author: "User1",
              subreddit: sub,
              url: "http://test",
              num_comments: 0,
              created_utc: Date.now() / 1000,
            },
          ]);
        },
      );

      (reddit.fetchComments as any).mockImplementation(() =>
        Promise.resolve([]),
      );
      (reddit.resolveProblemPatterns as any).mockReturnValue([]);
      (reddit.rankRedditPosts as any).mockImplementation(
        (posts: any[]) => posts,
      );
      (reddit.filterPostsByProblemPatterns as any).mockImplementation(
        (posts: any[]) => posts,
      );

      const result = await executeMiningRun({
        scraperId: "test-scraper",
        keyword: "test",
        subreddits: ["success-sub", "fail-sub"],
        customPatterns: [],
        miningDepth: "basic",
        timeWindow: "7d",
        userId: "test-user",
        workspaceId: "test-workspace",
      });

      // The execution should not throw
      expect(result.postsFetched).toBe(1);
    });
  });

  describe("Happy Path Execution", () => {
    it("successfully runs through scanning, extracting, clustering to completed", async () => {
      // Setup successful mocks
      (db.query.user.findFirst as any).mockResolvedValueOnce({
        id: "test-user",
      });

      const mockPost = {
        id: "post1",
        title: "Test",
        selftext: "Test",
        author: "User1",
        subreddit: "test-sub",
        url: "http://test",
        num_comments: 1,
        created_utc: Date.now() / 1000,
      };

      (reddit.fetchSubredditPostsMultiSort as any).mockResolvedValue([
        mockPost,
      ]);
      (reddit.resolveProblemPatterns as any).mockReturnValue([]);
      (reddit.rankRedditPosts as any).mockImplementation(
        (posts: any[]) => posts,
      );
      (reddit.filterPostsByProblemPatterns as any).mockImplementation(
        (posts: any[]) => posts,
      );

      (reddit.fetchComments as any).mockResolvedValue([
        { body: "A comment", author: "User2", score: 1 },
      ]);

      const idempotency = await import("@/lib/reddit-idempotency");
      (idempotency.claimRedditPostForAiProcessing as any).mockResolvedValue(
        true,
      );
      (reddit.fetchComments as any).mockImplementation(() =>
        Promise.resolve([{ body: "A comment", author: "User2", score: 1 }]),
      );

      const clustering = await import("@/lib/clustering");
      (clustering.clusterPainPoint as any).mockResolvedValue(true);

      (ai.extractPainPoints as any).mockResolvedValue([
        {
          title: "Pain point",
          body: "Description",
          painIntensity: 8,
          urgency: "high",
        },
      ]);

      const result = await executeMiningRun({
        scraperId: "test-scraper",
        keyword: "test",
        subreddits: ["test-sub"],
        customPatterns: ["pattern1"],
        miningDepth: "basic",
        timeWindow: "7d",
        userId: "test-user",
        workspaceId: "test-workspace",
      });

      expect(result.runId).toBeDefined();
      expect(result.postsFetched).toBe(1);
      expect(result.postsMatched).toBe(1);
      expect(result.commentsFetched).toBe(1);
      expect(result.newPainPoints).toBe(1);

      // Verify DB updates occurred
      expect(db.update).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
    });

    it("handles comments fetch errors but continues processing other parts", async () => {
      // Setup successful mocks
      (db.query.user.findFirst as any).mockResolvedValueOnce({
        id: "test-user",
      });

      const mockPost = {
        id: "post2",
        title: "Test",
        selftext: "Test",
        author: "User1",
        subreddit: "test-sub",
        url: "http://test",
        num_comments: 1,
        created_utc: Date.now() / 1000,
      };

      (reddit.fetchSubredditPostsMultiSort as any).mockResolvedValue([
        mockPost,
      ]);
      (reddit.resolveProblemPatterns as any).mockReturnValue([]);
      (reddit.rankRedditPosts as any).mockImplementation(
        (posts: any[]) => posts,
      );
      (reddit.filterPostsByProblemPatterns as any).mockImplementation(
        (posts: any[]) => posts,
      );

      const idempotency = await import("@/lib/reddit-idempotency");
      (idempotency.claimRedditPostForAiProcessing as any).mockResolvedValue(
        true,
      );
      (reddit.fetchComments as any).mockImplementation(() =>
        Promise.reject(new Error("Comments API Error")),
      );

      const clustering = await import("@/lib/clustering");
      (clustering.clusterPainPoint as any).mockResolvedValue(true);

      (ai.extractPainPoints as any).mockResolvedValue([
        {
          title: "Pain point without comments",
          body: "Description",
          painIntensity: 8,
          urgency: "high",
        },
      ]);

      const result = await executeMiningRun({
        scraperId: "test-scraper",
        keyword: "test",
        subreddits: ["test-sub"],
        customPatterns: ["pattern1"],
        miningDepth: "basic",
        timeWindow: "7d",
        userId: "test-user",
        workspaceId: "test-workspace",
      });

      expect(result.runId).toBeDefined();
      expect(result.postsFetched).toBe(1);
      expect(result.postsMatched).toBe(1);
      expect(result.commentsFetched).toBe(0); // Failed to fetch
      expect(result.newPainPoints).toBe(1);

      expect(db.update).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
