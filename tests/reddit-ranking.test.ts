import { describe, expect, it } from "vitest";
import {
  filterPostsByProblemPatterns,
  getProblemPatternMatchStats,
  rankRedditPosts,
  resolveProblemPatterns,
  scoreRedditPostRelevance,
  type RedditPost,
} from "@/lib/reddit";

const now = Math.floor(Date.now() / 1_000);

function makePost(overrides: Partial<RedditPost>): RedditPost {
  return {
    id: crypto.randomUUID(),
    title: "Generic discussion",
    selftext: "",
    author: "tester",
    score: 1,
    subreddit: "saas",
    url: "https://reddit.com/test",
    num_comments: 1,
    created_utc: now - 3600,
    ...overrides,
  };
}

describe("reddit ranking", () => {
  it("prefers posts with stronger keyword matches and pain signals", () => {
    const keyword = "cold email deliverability";
    const strong = makePost({
      title: "Cold email deliverability is broken for our agency",
      selftext:
        "We are losing replies, testing alternatives, and manually rotating inboxes.",
      score: 12,
      num_comments: 18,
    });
    const weak = makePost({
      title: "Anyone working on outreach lately?",
      selftext: "Curious what tools people use.",
      score: 40,
      num_comments: 5,
    });

    expect(scoreRedditPostRelevance(strong, keyword)).toBeGreaterThan(
      scoreRedditPostRelevance(weak, keyword),
    );
  });

  it("ranks the strongest matching thread first", () => {
    const keyword = "property management";
    const posts = [
      makePost({
        title: "Best tools for landlords?",
        selftext: "Just curious what everyone uses.",
        score: 50,
        num_comments: 6,
      }),
      makePost({
        title: "Property management software keeps breaking our workflow",
        selftext:
          "Tenant communication, maintenance, and accounting are all split across tools.",
        score: 14,
        num_comments: 22,
      }),
      makePost({
        title: "Manual rent collection is exhausting",
        selftext: "We still use spreadsheets and text messages.",
        score: 8,
        num_comments: 16,
      }),
    ];

    const ranked = rankRedditPosts(posts, keyword);

    expect(ranked[0]?.title).toContain("Property management software");
  });

  it("counts default and custom problem patterns across title and selftext", () => {
    const post = makePost({
      title: "Why is it so hard to manage handoffs?",
      selftext:
        "Anyone else deal with this? I hate how frustrating the current process is.",
    });

    const stats = getProblemPatternMatchStats(
      post,
      resolveProblemPatterns(["current process"]),
    );

    expect(stats.matchCount).toBe(5);
    expect(stats.matchedPatterns).toEqual(
      expect.arrayContaining([
        "why is it so hard",
        "anyone else deal with",
        "hate",
        "frustrating",
        "current process",
      ]),
    );
  });

  it("filters out posts with no problem-pattern matches", () => {
    const patterns = resolveProblemPatterns();
    const matched = makePost({
      title: "Anyone else deal with support queue pain?",
      selftext: "This workflow is frustrating every single day.",
    });
    const unmatched = makePost({
      title: "What analytics dashboard do you use?",
      selftext: "Collecting tool recommendations for a side project.",
    });

    const filtered = filterPostsByProblemPatterns(
      [matched, unmatched],
      patterns,
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe(matched.id);
  });

  it("uses multiple pattern matches to boost ranking", () => {
    const keyword = "customer support";
    const patterns = resolveProblemPatterns();
    const strong = makePost({
      title: "Customer support is frustrating and I hate our queue",
      selftext: "Anyone else deal with this pain every week?",
    });
    const weaker = makePost({
      title: "Customer support software recommendations",
      selftext: "Looking for a better setup.",
    });

    expect(scoreRedditPostRelevance(strong, keyword, patterns)).toBeGreaterThan(
      scoreRedditPostRelevance(weaker, keyword, patterns),
    );
  });
});
