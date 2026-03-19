import { describe, expect, it } from "vitest";
import { buildCommunityMapNodes } from "@/lib/community-map";

describe("community map aggregation", () => {
  it("groups multiple pain points into one subreddit node", () => {
    const nodes = buildCommunityMapNodes([
      {
        id: "pain-1",
        title: "Manual onboarding",
        reportId: "report-1",
        reportTitle: "Onboarding",
        score: 8,
        urgency: 7,
        sentiment: "frustrated",
        mentionCount: 3,
        commentCount: 2,
        subreddit: "saas",
        subredditDisplayName: "SaaS",
      },
      {
        id: "pain-2",
        title: "Slow internal handoff",
        reportId: "report-2",
        reportTitle: "Ops",
        score: 6,
        urgency: 5,
        sentiment: "angry",
        mentionCount: 1,
        commentCount: 1,
        subreddit: "r/saas",
        subredditDisplayName: null,
      },
    ]);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      subreddit: "saas",
      label: "r/saas",
      painPointCount: 2,
      averageIntensity: 7,
      averageUrgency: 6,
    });
  });

  it("falls back to subreddit when display name is missing", () => {
    const nodes = buildCommunityMapNodes([
      {
        id: "pain-1",
        title: "Messy reporting",
        reportId: "report-1",
        reportTitle: "Analytics",
        score: 5,
        urgency: 4,
        sentiment: "neutral",
        mentionCount: 0,
        commentCount: 0,
        subreddit: "marketing",
        subredditDisplayName: null,
      },
    ]);

    expect(nodes[0]?.label).toBe("r/marketing");
  });

  it("sorts pain points within a subreddit by validation signal first", () => {
    const nodes = buildCommunityMapNodes([
      {
        id: "pain-low",
        title: "Hard exports",
        reportId: "report-1",
        reportTitle: "Exports",
        score: 8,
        urgency: 9,
        sentiment: "frustrated",
        mentionCount: 1,
        commentCount: 0,
        subreddit: "nocode",
        subredditDisplayName: "NoCode",
      },
      {
        id: "pain-high",
        title: "Broken automations",
        reportId: "report-2",
        reportTitle: "Automation",
        score: 6,
        urgency: 4,
        sentiment: "angry",
        mentionCount: 12,
        commentCount: 9,
        subreddit: "nocode",
        subredditDisplayName: "NoCode",
      },
    ]);

    expect(nodes[0]?.topPainPoints.map((item) => item.id)).toEqual([
      "pain-high",
      "pain-low",
    ]);
  });
});
