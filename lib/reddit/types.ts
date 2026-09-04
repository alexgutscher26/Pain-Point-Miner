export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  subreddit: string;
  url: string;
  num_comments: number;
  created_utc: number;
  is_self?: boolean;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  permalink: string;
  created_utc: number;
}

export type RedditTimeRange =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year"
  | "all";

export type RedditSortMode = "relevance" | "hot" | "new" | "top";

/** Maps each mining depth to the sort modes it should use. */
export const SORT_MODES_BY_DEPTH: Record<string, RedditSortMode[]> = {
  basic: ["relevance"],
  deep: ["relevance", "hot"],
  advanced: ["relevance", "hot", "new", "top"],
  ultra: ["relevance", "hot", "new", "top"],
};

export function getSortModesForDepth(depth: string): RedditSortMode[] {
  return SORT_MODES_BY_DEPTH[depth] ?? ["relevance"];
}

export interface RedditPostWithMeta extends RedditPost {
  /** The sort mode that first surfaced this post. */
  sortMode: RedditSortMode;
}

export type FetchOptions = {
  maxDepth?: number;
  maxComments?: number;
  timeoutMs?: number;
  retries?: number;
  timeWindow?: RedditTimeRange;
};

export type MultiSortFetchOptions = FetchOptions & {
  miningDepth?: string;
};
