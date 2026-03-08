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

type PullPushListingResponse = {
  data?: Array<{
    id?: string;
    title?: string;
    selftext?: string;
    author?: string;
    score?: number;
    subreddit?: string;
    url?: string;
    permalink?: string;
    num_comments?: number;
    created_utc?: number;
    created?: number;
  }>;
};

type PullPushCommentResponse = {
  data?: Array<{
    id?: string;
    body?: string;
    author?: string;
    score?: number;
    permalink?: string;
    created_utc?: number;
    created?: number;
  }>;
};

/**
 * Pauses execution for a specified number of milliseconds.
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a resource with retry logic for handling transient errors.
 *
 * The function attempts to fetch the specified URL multiple times if the response indicates a retriable error (HTTP status 429 or 5xx).
 * It uses an AbortController to implement a timeout for each request and waits progressively longer between retries.
 * If all attempts fail, it throws the last encountered error or a generic failure message.
 *
 * @param url - The URL to fetch.
 * @param init - The options for the fetch request.
 * @param retries - The maximum number of retry attempts (default is MAX_RETRIES).
 * @returns The response from the fetch call if successful.
 * @throws Error If all retry attempts fail.
 */
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

/** Checks if the given error indicates a Reddit blocked error. */
function isRedditBlockedError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("403") || message.includes("blocked");
}

/**
 * Fetch submissions from the PullPush API based on subreddit and keyword.
 *
 * This function constructs a URL with search parameters for subreddit and keyword, limits the number of posts to a maximum of 250, and fetches the data from the PullPush API. It checks the response for errors and processes the JSON data, filtering and mapping it to a specific format before returning an array of RedditPost objects.
 *
 * @param subreddit - The subreddit to search within.
 * @param keyword - The keyword to search for in submissions.
 * @param maxPosts - The maximum number of posts to retrieve, capped at 250.
 * @returns A promise that resolves to an array of RedditPost objects.
 * @throws Error If the PullPush API response is not ok.
 */
async function fetchFromPullPushSubmissions(
  subreddit: string,
  keyword: string,
  maxPosts: number
): Promise<RedditPost[]> {
  const size = Math.max(1, Math.min(250, maxPosts));
  const params = new URLSearchParams({
    subreddit,
    q: keyword,
    size: String(size),
    sort: "desc",
    sort_type: "score",
  });
  const response = await fetch(`https://api.pullpush.io/reddit/search/submission/?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`PullPush API returned ${response.status}: ${response.statusText}`);
  }
  const data = (await response.json()) as PullPushListingResponse;
  const rows = data.data ?? [];
  return rows
    .filter((row): row is NonNullable<typeof row> & { id: string; title: string } => Boolean(row?.id && row?.title))
    .map((row) => ({
      id: row.id,
      title: row.title,
      selftext: row.selftext ?? "",
      author: row.author ?? "unknown",
      score: row.score ?? 0,
      subreddit: row.subreddit ?? subreddit,
      url: row.url ?? (row.permalink ? `https://www.reddit.com${row.permalink}` : ""),
      num_comments: row.num_comments ?? 0,
      created_utc: row.created_utc ?? row.created ?? Math.floor(Date.now() / 1000),
    }));
}

/**
 * Fetch comments from the PullPush API for a given Reddit post.
 *
 * This function constructs a URL with query parameters based on the provided postId,
 * makes an asynchronous request to the PullPush API, and processes the response.
 * It filters and maps the response data to return an array of RedditComment objects,
 * ensuring that only valid comments with required fields are included.
 *
 * @param postId - The ID of the Reddit post for which comments are to be fetched.
 * @returns A promise that resolves to an array of RedditComment objects.
 * @throws Error If the PullPush API response is not ok.
 */
async function fetchFromPullPushComments(postId: string): Promise<RedditComment[]> {
  const params = new URLSearchParams({
    link_id: postId,
    size: "200",
    sort: "desc",
    sort_type: "score",
  });
  const response = await fetch(`https://api.pullpush.io/reddit/search/comment/?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`PullPush API returned ${response.status}: ${response.statusText}`);
  }
  const data = (await response.json()) as PullPushCommentResponse;
  const rows = data.data ?? [];
  return rows
    .filter((row): row is NonNullable<typeof row> & { id: string; body: string } => Boolean(row?.id && row?.body))
    .map((row) => ({
      id: row.id,
      body: row.body,
      author: row.author ?? "unknown",
      score: row.score ?? 0,
      permalink: row.permalink ? `https://www.reddit.com${row.permalink}` : "",
      created_utc: row.created_utc ?? row.created ?? Math.floor(Date.now() / 1000),
    }));
}

/**
 * Fetches posts from a specified subreddit containing a keyword.
 */
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

/**
 * Fetch posts from a specified subreddit in batches based on a keyword.
 *
 * This function retrieves posts from Reddit by constructing a search URL with the provided subreddit and keyword.
 * It handles pagination using the 'after' parameter and respects the specified limits for maximum posts, request limits, and delays between requests.
 * The function continues fetching until the desired number of posts is collected or no more posts are available.
 * In case of a blocked request, it attempts to fetch posts from a fallback source.
 *
 * @param subreddit - The name of the subreddit to fetch posts from.
 * @param keyword - The keyword to search for in the subreddit posts.
 * @param options - Optional parameters to customize the fetching behavior.
 * @param options.maxPosts - The maximum number of posts to fetch (default is 25, capped at 2000).
 * @param options.time - The time range for the posts (default is "all").
 * @param options.delayMs - The delay in milliseconds between requests (default is 250ms).
 * @param options.requestLimit - The maximum number of posts to request per API call (default is 100).
 * @returns A promise that resolves to an array of RedditPost objects.
 */
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
    if (isRedditBlockedError(error)) {
      try {
        const fallbackPosts = await fetchFromPullPushSubmissions(
          subreddit,
          keyword,
          Math.max(1, Math.min(2_000, options?.maxPosts ?? 25))
        );
        return fallbackPosts;
      } catch (fallbackError) {
        console.error(`Error fetching posts from fallback source for r/${subreddit}:`, fallbackError);
        return [];
      }
    }
    console.error(`Error fetching posts from r/${subreddit}:`, error);
    return [];
  }
};

/**
 * Fetch comments from a Reddit post.
 *
 * This function constructs a URL to retrieve comments for a specific post in a given subreddit. It utilizes the fetchWithRetry function to handle network requests and retries, processes the response to extract comment nodes, and employs a helper function, extractReplies, to recursively gather replies to comments. In case of a fetch error, it attempts to fetch from a fallback source and logs any encountered errors.
 *
 * @param postId - The ID of the Reddit post for which comments are to be fetched.
 * @param subreddit - The name of the subreddit containing the post.
 * @returns A promise that resolves to an array of RedditComment objects.
 */
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
    if (isRedditBlockedError(error)) {
      try {
        return await fetchFromPullPushComments(postId);
      } catch (fallbackError) {
        console.error(`Error fetching comments from fallback source for post ${postId}:`, fallbackError);
        return [];
      }
    }
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
};
