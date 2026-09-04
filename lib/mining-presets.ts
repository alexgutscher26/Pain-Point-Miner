export type MiningDepth = "basic" | "deep" | "advanced" | "ultra";

export const MINING_PRESETS: Record<
  MiningDepth,
  {
    name: string;
    subreddits: number;
    sortModes: number;
    maxDepth: number;
    maxComments: number;
    postsPerSub: number;
    analyzeLimit: number;
    estimatedCredits: number;
    description: string;
    timeEstimate: string;
  }
> = {
  basic: {
    name: "Basic Scan",
    subreddits: 3,
    sortModes: 1,
    maxDepth: 1, // Added depth even to basic to catch some replies
    maxComments: 100,
    postsPerSub: 150,
    analyzeLimit: 20,
    estimatedCredits: 0.5,
    description: "Rapid discovery. Top threads + key replies.",
    timeEstimate: "~3-5 mins",
  },
  deep: {
    name: "Deep Mine",
    subreddits: 6,
    sortModes: 2,
    maxDepth: 2,
    maxComments: 250,
    postsPerSub: 300,
    analyzeLimit: 45,
    estimatedCredits: 2.0,
    description: "Thorough context extraction. Deep thread analysis.",
    timeEstimate: "~10-15 mins",
  },
  advanced: {
    name: "Advanced Clustering",
    subreddits: 10,
    sortModes: 4,
    maxDepth: 10,
    maxComments: 300,
    postsPerSub: 400,
    analyzeLimit: 50,
    estimatedCredits: 5,
    description: "Deep recursive mining. Full thread analysis + clustering.",
    timeEstimate: "~30+ mins",
  },
  ultra: {
    name: "Ultra Deep Dive",
    subreddits: 15,
    sortModes: 4,
    maxDepth: 100, // Exhaustive comment tree traversal
    maxComments: 1000,
    postsPerSub: 500,
    analyzeLimit: 100,
    estimatedCredits: 10,
    description:
      "Exhaustive comment tree traversal + full recursive context analysis.",
    timeEstimate: "~45+ mins",
  },
};

export function calculateMiningCost(depth: MiningDepth): number {
  return MINING_PRESETS[depth]?.estimatedCredits ?? 1;
}
