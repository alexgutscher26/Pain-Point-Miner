import { describe, expect, it } from "vitest";
import {
  rankRedditPosts,
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
});
