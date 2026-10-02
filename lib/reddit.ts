/**
 * Re-export all Reddit module features from modular sub-packages:
 * - types: TypeScript interfaces and models
 * - patterns: Problem pattern constants, extraction regex, and validators
 * - ranking: Scoring algorithms and post ranking
 * - throttle: Rate limit tracking, User-Agent rotation, 429 adaptive throttling
 * - oauth: Reddit API token management and authentication
 * - client: Network fetching, pagination, multi-sort, fallbacks, and subreddit validation
 */
export * from "./reddit/index";
