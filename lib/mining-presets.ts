export type MiningDepth = "basic" | "deep" | "advanced" | "ultra";

export interface MiningPreset {
  id: MiningDepth;
  name: string;
  label: string;
  tagline: string;
  subreddits: number;
  sortModes: number;
  maxDepth: number;
  maxComments: number;
  postsPerSub: number;
  analyzeLimit: number;
  estimatedCredits: number;
  description: string;
  timeEstimate: string;
  targetAudience: string;
  features: readonly string[];
  recommendedSorts: readonly ("top" | "hot" | "new" | "relevance")[];
  aiModelTier: "fast" | "balanced" | "advanced" | "flagship";
}

export const MINING_PRESETS: Record<MiningDepth, MiningPreset> = {
  basic: {
    id: "basic",
    name: "Basic Scan",
    label: "Basic Scan",
    tagline: "Rapid idea & pain-point discovery",
    subreddits: 3,
    sortModes: 1,
    maxDepth: 1, // Depth 1 captures top-level replies
    maxComments: 100,
    postsPerSub: 150,
    analyzeLimit: 20,
    estimatedCredits: 0.5,
    description: "Rapid discovery. Top threads + key replies.",
    timeEstimate: "~3-5 mins",
    targetAudience: "Solopreneurs validating rapid market viability",
    features: [
      "Top 150 posts per subreddit",
      "Direct reply analysis (Depth 1)",
      "Instant keyword frequency & sentiment",
      "Fast AI summary generation",
    ],
    recommendedSorts: ["top"],
    aiModelTier: "fast",
  },
  deep: {
    id: "deep",
    name: "Deep Mine",
    label: "Deep Mine",
    tagline: "Comprehensive niche & context extraction",
    subreddits: 6,
    sortModes: 2,
    maxDepth: 2,
    maxComments: 250,
    postsPerSub: 300,
    analyzeLimit: 45,
    estimatedCredits: 2.0,
    description: "Thorough context extraction. Deep thread analysis.",
    timeEstimate: "~10-15 mins",
    targetAudience: "Founders designing SaaS MVP features and value propositions",
    features: [
      "Up to 300 posts per subreddit across Top & Hot",
      "Multi-level nested comment parsing (Depth 2)",
      "Willingness-to-pay & feature request extraction",
      "Competitor sentiment and switching cost signals",
    ],
    recommendedSorts: ["top", "hot"],
    aiModelTier: "balanced",
  },
  advanced: {
    id: "advanced",
    name: "Advanced Clustering",
    label: "Advanced Clustering",
    tagline: "Multi-subreddit semantic clustering & market mapping",
    subreddits: 10,
    sortModes: 4,
    maxDepth: 10,
    maxComments: 300,
    postsPerSub: 400,
    analyzeLimit: 50,
    estimatedCredits: 5.0,
    description: "Deep recursive mining. Full thread analysis + clustering.",
    timeEstimate: "~30+ mins",
    targetAudience: "Product teams building strategic roadmaps and competitive moats",
    features: [
      "Up to 400 posts per subreddit across 4 sort algorithms",
      "Recursive 10-level branch comment tree analysis",
      "Semantic pain point clustering with vector embeddings",
      "Automated feature matrix & monetization scoring",
    ],
    recommendedSorts: ["top", "hot", "new", "relevance"],
    aiModelTier: "advanced",
  },
  ultra: {
    id: "ultra",
    name: "Ultra Deep Dive",
    label: "Ultra Deep Dive",
    tagline: "Exhaustive recursive ecosystem excavation",
    subreddits: 15,
    sortModes: 4,
    maxDepth: 100, // Exhaustive comment tree traversal
    maxComments: 1000,
    postsPerSub: 500,
    analyzeLimit: 100,
    estimatedCredits: 10.0,
    description:
      "Exhaustive comment tree traversal + full recursive context analysis.",
    timeEstimate: "~45+ mins",
    targetAudience: "Venture-scale founders & market intelligence researchers",
    features: [
      "Up to 500 posts per subreddit (15 subreddits max)",
      "Exhaustive 100-level comment graph traversal (up to 1,000 comments/thread)",
      "Deep cross-subreddit pain point cross-referencing",
      "Executive summary report + comprehensive TAM opportunities",
    ],
    recommendedSorts: ["top", "hot", "new", "relevance"],
    aiModelTier: "flagship",
  },
};

export const MINING_DEPTH_KEYS: readonly MiningDepth[] = [
  "basic",
  "deep",
  "advanced",
  "ultra",
] as const;

export function getMiningPreset(depth: MiningDepth): MiningPreset {
  return MINING_PRESETS[depth] ?? MINING_PRESETS.basic;
}

export function getAllMiningPresets(): MiningPreset[] {
  return MINING_DEPTH_KEYS.map((key) => MINING_PRESETS[key]);
}

export function calculateMiningCost(depth: MiningDepth): number {
  return MINING_PRESETS[depth]?.estimatedCredits ?? 1;
}

export function isMiningDepth(value: unknown): value is MiningDepth {
  return (
    typeof value === "string" &&
    MINING_DEPTH_KEYS.includes(value as MiningDepth)
  );
}

export function normalizeMiningDepth(
  depth: string | null | undefined,
  fallback: MiningDepth = "basic",
): MiningDepth {
  if (depth && isMiningDepth(depth)) {
    return depth;
  }
  return fallback;
}
