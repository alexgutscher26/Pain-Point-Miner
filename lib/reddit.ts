/* eslint-disable @typescript-eslint/no-explicit-any */

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
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  permalink: string;
  created_utc: number;
}

type RedditTimeRange = "hour" | "day" | "week" | "month" | "year" | "all";

const DEFAULT_USER_AGENT =
  process.env.REDDIT_USER_AGENT ??
  "RPPScanner/1.0 (+https://github.com; contact: ops@example.com)";
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;

type RedditListingResponse = {
  data?: {
    after?: string | null;
    children?: Array<{ data?: RedditPost }>;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit, retries = MAX_RETRIES) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (response.ok) return response;

      const isRetriable = response.status === 429 || response.status >= 500;
      if (!isRetriable || attempt === retries) {
        throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
    } finally {
      clearTimeout(timeout);
    }

    await sleep(500 * (attempt + 1));
  }

  throw lastError instanceof Error ? lastError : new Error("Reddit request failed");
}

export const fetchSubredditPosts = async (
  subreddit: string,
  keyword: string,
  limit = 25,
  time: RedditTimeRange = "all"
): Promise<RedditPost[]> => {
  const posts = await fetchSubredditPostsBatched(subreddit, keyword, {
    maxPosts: limit,
    time,
  });
  return posts.slice(0, limit);
};

export async function fetchSubredditPostsBatched(
  subreddit: string,
  keyword: string,
  options?: {
    maxPosts?: number;
    time?: RedditTimeRange;
    delayMs?: number;
    requestLimit?: number;
  }
): Promise<RedditPost[]> {
  try {
    const maxPosts = Math.max(1, Math.min(2_000, options?.maxPosts ?? 25));
    const delayMs = Math.max(0, options?.delayMs ?? 250);
    const time = options?.time ?? "all";
    const requestLimit = Math.max(1, Math.min(100, options?.requestLimit ?? 100));
    const posts: RedditPost[] = [];
    let after: string | null = null;

    while (posts.length < maxPosts) {
      const limit = Math.min(requestLimit, maxPosts - posts.length);
      const params = new URLSearchParams({
        q: keyword,
        restrict_sr: "1",
        sort: "relevance",
        limit: String(limit),
        t: time,
      });
      if (after) params.set("after", after);

      const url = `https://www.reddit.com/r/${subreddit}/search.json?${params.toString()}`;
      const response = await fetchWithRetry(url, {
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
        },
      });

      const data = (await response.json()) as RedditListingResponse;
      const children = data.data?.children ?? [];
      if (children.length === 0) break;

      for (const child of children) {
        if (child.data) {
          posts.push(child.data);
          if (posts.length >= maxPosts) break;
        }
      }

      after = data.data?.after ?? null;
      if (!after) break;

      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }

    return posts;
  } catch (error) {
    console.error(`Error fetching posts from r/${subreddit}:`, error);
    return [];
  }
};

export const fetchComments = async (postId: string, subreddit: string): Promise<RedditComment[]> => {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
    const response = await fetchWithRetry(url, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
      }
    });

    const data = await response.json();
    const commentNodes = data[1].data.children;
    
    const extractReplies = (replies: { data?: { children?: any[] } }): RedditComment[] => {
      if (!replies || !replies.data || !replies.data.children) return [];
      
      return replies.data.children.flatMap((child: { kind: string, data: any }) => {
        if (child.kind !== 't1') return [];
        const comment = child.data;
        return [
          comment,
          ...extractReplies(comment.replies)
        ];
      });
    };

    return commentNodes.flatMap((child: { kind: string, data: any }) => {
      if (child.kind !== 't1') return [];
      const comment = child.data;
      return [
        comment,
        ...extractReplies(comment.replies)
      ];
    });
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
};
