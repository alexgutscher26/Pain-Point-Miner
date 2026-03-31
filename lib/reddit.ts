/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { sql, gt } from "drizzle-orm";
import { db } from "./db";
import { redditRateLimitLog } from "./db/schema";

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

type RedditTimeRange = "hour" | "day" | "week" | "month" | "year" | "all";

export type RedditSortMode = "relevance" | "hot" | "new" | "top";

/** Maps each mining depth to the sort modes it should use. */
export const SORT_MODES_BY_DEPTH: Record<string, RedditSortMode[]> = {
  basic: ["relevance"],
  deep: ["relevance", "hot"],
  advanced: ["relevance", "hot", "new", "top"],
};

export function getSortModesForDepth(depth: string): RedditSortMode[] {
  return SORT_MODES_BY_DEPTH[depth] ?? ["relevance"];
}

export interface RedditPostWithMeta extends RedditPost {
  /** The sort mode that first surfaced this post. */
  sortMode: RedditSortMode;
}

const ENV_UA = process.env.REDDIT_USER_AGENT;

/** Pool of browser-realistic User-Agents. Updated for March 2026. */
export const UA_POOL = [
  ...(ENV_UA ? [ENV_UA] : []),
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:140.0) Gecko/20100101 Firefox/140.0",
].filter(Boolean) as string[];

function getRandomUA() {
  return UA_POOL[Math.floor(Math.random() * UA_POOL.length)] ?? "Threddiq/1.0";
}

/** In-memory map of throttled subreddits (subreddit -> timestamp when throttle expires). */
const throttledUntilMap = new Map<string, number>();

/** Track consecutive 429s per subreddit. */
const consecutive429CountMap = new Map<string, number>();

const THROTTLE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** Extracts subreddit name from a Reddit URL. */
function getSubredditFromUrl(url: string): string | null {
  const match = url.match(/\/r\/([^/?]+)/);
  return match ? match[1] : null;
}

/** Checks if a subreddit is currently throttled. */
export function isSubredditThrottled(subreddit: string): boolean {
  const until = throttledUntilMap.get(subreddit);
  if (!until) return false;
  if (Date.now() > until) {
    throttledUntilMap.delete(subreddit);
    consecutive429CountMap.set(subreddit, 0);
    return false;
  }
  return true;
}

/** Logs a rate limit or block event to the database and updates throttle state. */
async function logRateLimitEvent(
  url: string,
  statusCode: number,
  headers?: Headers,
  errorText?: string,
) {
  const subreddit = getSubredditFromUrl(url);
  const uaUsed = currentUA;

  let retryAfter: number | undefined;
  if (headers?.has("retry-after")) {
    retryAfter = parseInt(headers.get("retry-after") || "0", 10);
  }

  try {
    await db.insert(redditRateLimitLog).values({
      id: crypto.randomUUID(),
      subreddit,
      userAgent: uaUsed,
      url,
      statusCode,
      retryAfter,
      error: errorText,
    });
  } catch (dbErr) {
    console.error("Failed to log rate limit to DB:", dbErr);
  }

  if (subreddit && (statusCode === 429 || statusCode === 403)) {
    const count = (consecutive429CountMap.get(subreddit) || 0) + 1;
    consecutive429CountMap.set(subreddit, count);

    if (count >= 3 && !throttledUntilMap.has(subreddit)) {
      throttledUntilMap.set(subreddit, Date.now() + THROTTLE_DURATION_MS);
    }
  } else if (subreddit && statusCode >= 200 && statusCode < 300) {
    consecutive429CountMap.set(subreddit, 0);
  }
}

/**
 * Calculates the global 429 (Too Many Requests) rate over the last 5 minutes.
 * Used for adaptive concurrency control.
 */
export async function getGlobal429Rate(): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const recentLogs = await db
      .select({
        statusCode: redditRateLimitLog.statusCode,
      })
      .from(redditRateLimitLog)
      .where(gt(redditRateLimitLog.createdAt, fiveMinutesAgo))
      .limit(100);

    if (recentLogs.length === 0) return 0;

    const errorCount = recentLogs.filter(
      (log) => log.statusCode === 429,
    ).length;
    return errorCount / recentLogs.length;
  } catch (err) {
    console.error("Failed to calculate global 429 rate:", err);
    return 0;
  }
}

/** The currently active User-Agent string for the current execution instance. */
let currentUA = getRandomUA();

/** Switches to a different UA from the pool. */
function rotateUA() {
  const others = UA_POOL.filter((ua) => ua !== currentUA);
  const pool = others.length > 0 ? others : UA_POOL;
  currentUA = pool[Math.floor(Math.random() * pool.length)] ?? getRandomUA();
  return currentUA;
}
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID?.trim();
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET?.trim();
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const TOKEN_EXPIRY_SAFETY_SECONDS = 30;

type RedditTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type CachedToken = {
  token: string;
  expiresAtEpochSeconds: number;
};

let cachedToken: CachedToken | null = null;

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
    is_self?: boolean;
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

const WORD_SEPARATOR_REGEX = /[^a-z0-9]+/i;
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "my",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

export const DEFAULT_PROBLEM_PATTERNS = [
  "struggling",
  "frustrating",
  "annoying",
  "horrible",
  "hate",
  "waste of time",
  "sucks",
  "pain",
  "wish there was",
  "is there a tool",
  "why is it so hard",
  "anyone else deal with",
  "manual",
  "spreadsheet",
  "workflow",
  "nightmare",
  "expensive",
  "alternative to",
  "how do i",
] as const;

export type ProblemPatternMatchStats = {
  matchCount: number;
  matchedPatterns: string[];
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
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const subreddit = getSubredditFromUrl(url);
      if (subreddit && isSubredditThrottled(subreddit)) {
        throw new Error(`Subreddit r/${subreddit} is currently rate-limited.`);
      }

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (response.ok) {
        if (subreddit) consecutive429CountMap.set(subreddit, 0);
        return response;
      }

      const isRateLimited = response.status === 429 || response.status === 403;
      if (isRateLimited) {
        await logRateLimitEvent(
          url,
          response.status,
          response.headers,
          response.statusText,
        );
      }

      if (response.status === 403) {
        // Rotate UA and update the headers for the next attempt
        const nextUA = rotateUA();
        if (init.headers instanceof Headers) {
          init.headers.set("User-Agent", nextUA);
        } else if (init.headers) {
          (init.headers as Record<string, string>)["User-Agent"] = nextUA;
        } else {
          init.headers = { "User-Agent": nextUA };
        }

        if (attempt === retries) {
          throw new Error(
            `Reddit API returned 403 (Forbidden) after trying different User-Agents`,
          );
        }
        continue;
      }

      const isRetriable = response.status === 429 || response.status >= 500;
      if (!isRetriable || attempt === retries) {
        throw new Error(
          `Reddit API returned ${response.status}: ${response.statusText}`,
        );
      }
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
    } finally {
      clearTimeout(timeout);
    }

    await sleep(500 * (attempt + 1));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Reddit request failed");
}

function hasOAuthCredentials() {
  return Boolean(REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET);
}

async function getRedditAccessToken(
  forceRefresh = false,
): Promise<string | null> {
  if (!hasOAuthCredentials()) return null;

  const nowSeconds = Math.floor(Date.now() / 1_000);
  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.expiresAtEpochSeconds > nowSeconds + TOKEN_EXPIRY_SAFETY_SECONDS
  ) {
    return cachedToken.token;
  }

  const basicAuth = Buffer.from(
    `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`,
  ).toString("base64");
  const response = await fetchWithRetry(
    "https://www.reddit.com/api/v1/access_token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": currentUA,
      },
      body: "grant_type=client_credentials",
    },
    1,
  );

  const payload = (await response.json()) as RedditTokenResponse;
  if (!payload.access_token) {
    throw new Error("Failed to obtain Reddit access token");
  }

  const expiresIn = payload.expires_in ?? 3_600;
  cachedToken = {
    token: payload.access_token,
    expiresAtEpochSeconds: nowSeconds + Math.max(60, expiresIn),
  };
  return cachedToken.token;
}

async function fetchRedditResponse(url: string): Promise<Response> {
  const authToken = await getRedditAccessToken();

  if (authToken) {
    const oauthUrl = url.replace(
      "https://www.reddit.com",
      "https://oauth.reddit.com",
    );

    try {
      const response = await fetchWithRetry(oauthUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "User-Agent": currentUA,
        },
      });
      return response;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.toLowerCase().includes("unauthorized"))
      ) {
        const refreshedToken = await getRedditAccessToken(true);
        if (refreshedToken) {
          return fetchWithRetry(oauthUrl, {
            headers: {
              Authorization: `Bearer ${refreshedToken}`,
              "User-Agent": currentUA,
            },
          });
        }
      }

      if (
        error instanceof Error &&
        (error.message.includes("403") ||
          error.message.toLowerCase().includes("forbidden"))
      ) {
        throw error;
      }
    }
  }

  return fetchWithRetry(url, {
    headers: {
      "User-Agent": currentUA,
    },
  });
}

function isRedditBlockedError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("403") || message.includes("blocked");
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePattern(pattern: string) {
  return pattern.toLowerCase().replace(/\s+/g, " ").trim();
}

function createPatternRegex(pattern: string) {
  const normalizedPattern = normalizePattern(pattern);
  const parts = normalizedPattern
    .split(" ")
    .map((part) => escapeRegExp(part))
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return new RegExp(`\\b${parts.join("\\s+")}\\b`, "gi");
}

function tokenizeKeyword(keyword: string) {
  return keyword
    .toLowerCase()
    .split(WORD_SEPARATOR_REGEX)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function countOccurrences(text: string, needle: string) {
  if (!needle) return 0;
  const matches = text.match(new RegExp(escapeRegExp(needle), "gi"));
  return matches?.length ?? 0;
}

export function resolveProblemPatterns(customPatterns: string[] = []) {
  return Array.from(
    new Set(
      [...DEFAULT_PROBLEM_PATTERNS, ...customPatterns]
        .map((pattern) => normalizePattern(pattern))
        .filter(Boolean),
    ),
  );
}

export function getProblemPatternMatchStats(
  post: RedditPost,
  problemPatterns: string[] = [...DEFAULT_PROBLEM_PATTERNS],
): ProblemPatternMatchStats {
  const combined = normalizeText(`${post.title ?? ""} ${post.selftext ?? ""}`);
  const matchedPatterns: string[] = [];

  for (const pattern of resolveProblemPatterns(problemPatterns)) {
    const regex = createPatternRegex(pattern);
    if (!regex) continue;

    if (regex.test(combined)) {
      matchedPatterns.push(pattern);
    }
  }

  return {
    matchCount: matchedPatterns.length,
    matchedPatterns,
  };
}

export function scoreRedditPostRelevance(
  post: RedditPost,
  keyword: string,
  problemPatterns: string[] = [...DEFAULT_PROBLEM_PATTERNS],
) {
  const normalizedKeyword = normalizeText(keyword);
  const keywordTokens = tokenizeKeyword(keyword);
  const title = normalizeText(post.title ?? "");
  const body = normalizeText(post.selftext ?? "");
  const combined = `${title} ${body}`.trim();
  const patternStats = getProblemPatternMatchStats(post, problemPatterns);

  let score = 0;

  if (normalizedKeyword) {
    if (title.includes(normalizedKeyword)) score += 35;
    if (body.includes(normalizedKeyword)) score += 18;
    score += Math.min(15, countOccurrences(title, normalizedKeyword) * 6);
    score += Math.min(10, countOccurrences(body, normalizedKeyword) * 3);
  }

  if (keywordTokens.length > 0) {
    let titleTokenMatches = 0;
    let bodyTokenMatches = 0;

    for (const token of keywordTokens) {
      if (title.includes(token)) titleTokenMatches += 1;
      if (body.includes(token)) bodyTokenMatches += 1;
    }

    score += titleTokenMatches * 8;
    score += bodyTokenMatches * 4;

    if (titleTokenMatches === keywordTokens.length) score += 20;
    if (bodyTokenMatches === keywordTokens.length) score += 10;
  }

  score += patternStats.matchCount * 12;
  if (patternStats.matchCount > 0 && title) score += 8;
  if (patternStats.matchCount > 1 && body) score += 4;

  score += Math.min(20, Math.log10(Math.max(1, post.score) + 1) * 8);
  score += Math.min(25, Math.log10(Math.max(1, post.num_comments) + 1) * 12);

  const ageHours = Math.max(
    0,
    (Date.now() / 1_000 - Math.max(0, post.created_utc ?? 0)) / 3600,
  );
  if (ageHours <= 24) score += 6;
  else if (ageHours <= 24 * 7) score += 4;
  else if (ageHours <= 24 * 30) score += 2;
  else if (ageHours <= 24 * 90) score += 1;

  return score;
}

export function filterPostsByProblemPatterns(
  posts: RedditPost[],
  problemPatterns: string[] = [...DEFAULT_PROBLEM_PATTERNS],
) {
  return posts.filter(
    (post) => getProblemPatternMatchStats(post, problemPatterns).matchCount > 0,
  );
}

export function rankRedditPosts(
  posts: RedditPost[],
  keyword: string,
  problemPatterns: string[] = [...DEFAULT_PROBLEM_PATTERNS],
) {
  return [...posts].sort((a, b) => {
    const byScore =
      scoreRedditPostRelevance(b, keyword, problemPatterns) -
      scoreRedditPostRelevance(a, keyword, problemPatterns);
    if (byScore !== 0) return byScore;

    const byComments = (b.num_comments ?? 0) - (a.num_comments ?? 0);
    if (byComments !== 0) return byComments;

    const byUpvotes = (b.score ?? 0) - (a.score ?? 0);
    if (byUpvotes !== 0) return byUpvotes;

    return (b.created_utc ?? 0) - (a.created_utc ?? 0);
  });
}

async function fetchFromPullPushSubmissions(
  subreddit: string,
  keyword: string,
  maxPosts: number,
): Promise<RedditPost[]> {
  const size = Math.max(1, Math.min(250, maxPosts));
  const params = new URLSearchParams({
    subreddit,
    q: keyword,
    size: String(size),
    sort: "desc",
    sort_type: "score",
  });
  const response = await fetch(
    `https://api.pullpush.io/reddit/search/submission/?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(
      `PullPush API returned ${response.status}: ${response.statusText}`,
    );
  }
  const data = (await response.json()) as PullPushListingResponse;
  const rows = data.data ?? [];
  return rows
    .filter(
      (row): row is NonNullable<typeof row> & { id: string; title: string } =>
        Boolean(row?.id && row?.title),
    )
    .map((row) => ({
      id: row.id,
      title: row.title,
      selftext: row.selftext ?? "",
      author: row.author ?? "unknown",
      score: row.score ?? 0,
      subreddit: row.subreddit ?? subreddit,
      url:
        row.url ??
        (row.permalink ? `https://www.reddit.com${row.permalink}` : ""),
      num_comments: row.num_comments ?? 0,
      created_utc:
        row.created_utc ?? row.created ?? Math.floor(Date.now() / 1000),
      is_self: row.is_self ?? true, // PullPush usually returns self-posts for search
    }));
}

async function fetchFromPullPushComments(
  postId: string,
): Promise<RedditComment[]> {
  const params = new URLSearchParams({
    link_id: postId,
    size: "200",
    sort: "desc",
    sort_type: "score",
  });
  const response = await fetch(
    `https://api.pullpush.io/reddit/search/comment/?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(
      `PullPush API returned ${response.status}: ${response.statusText}`,
    );
  }
  const data = (await response.json()) as PullPushCommentResponse;
  const rows = data.data ?? [];
  return rows
    .filter(
      (row): row is NonNullable<typeof row> & { id: string; body: string } =>
        Boolean(row?.id && row?.body),
    )
    .map((row) => ({
      id: row.id,
      body: row.body,
      author: row.author ?? "unknown",
      score: row.score ?? 0,
      permalink: row.permalink ? `https://www.reddit.com${row.permalink}` : "",
      created_utc:
        row.created_utc ?? row.created ?? Math.floor(Date.now() / 1000),
    }));
}

/**
 * Fetches posts from a subreddit across multiple Reddit sort modes concurrently,
 * deduplicates the merged results by post ID, and re-ranks them.
 *
 * Sort modes per mining depth:
 *  - basic:    relevance
 *  - deep:     relevance, hot
 *  - advanced: relevance, hot, new, top
 *
 * @param subreddit - The subreddit to search.
 * @param keyword - The search keyword.
 * @param depth - Mining depth string used to resolve sort modes.
 * @param options - Forwarded to `fetchSubredditPostsBatched` (maxPosts applies per sort mode).
 * @returns Deduplicated, ranked posts tagged with the sort mode that first returned them.
 */
export async function fetchSubredditPostsMultiSort(
  subreddit: string,
  keyword: string,
  depth: string,
  options?: {
    maxPosts?: number;
    time?: RedditTimeRange;
    delayMs?: number;
    requestLimit?: number;
  },
): Promise<RedditPostWithMeta[]> {
  const sortModes = getSortModesForDepth(depth);

  // Fetch all sort modes concurrently; individual failures don't abort the whole run
  const perModeFetches = await Promise.allSettled(
    sortModes.map((mode) =>
      fetchSubredditPostsBatched(subreddit, keyword, {
        ...options,
        sort: mode,
      }),
    ),
  );

  // Merge — first occurrence of a post.id wins (determines sortMode tag)
  const seen = new Set<string>();
  const merged: RedditPostWithMeta[] = [];

  for (let i = 0; i < perModeFetches.length; i++) {
    const result = perModeFetches[i]!;
    if (result.status !== "fulfilled") {
      console.error(
        `Multi-sort fetch failed for r/${subreddit} (${sortModes[i]}):`,
        result.reason,
      );
      continue;
    }
    for (const post of result.value) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      merged.push({ ...post, sortMode: sortModes[i]! });
    }
  }

  // Re-rank the merged set so the best posts surface first
  const ranked = rankRedditPosts(merged, keyword);
  return ranked as RedditPostWithMeta[];
}

/**
 * Fetches posts from a specified subreddit containing a keyword.
 */
export const fetchSubredditPosts = async (
  subreddit: string,
  keyword: string,
  limit = 25,
  time: RedditTimeRange = "all",
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
    /** Reddit search sort mode. Defaults to "relevance". */
    sort?: RedditSortMode;
  },
): Promise<RedditPost[]> {
  try {
    const maxPosts = Math.max(1, Math.min(2_000, options?.maxPosts ?? 25));
    const delayMs = Math.max(0, options?.delayMs ?? 250);
    const time = options?.time ?? "all";
    const requestLimit = Math.max(
      1,
      Math.min(100, options?.requestLimit ?? 100),
    );
    const posts: RedditPost[] = [];
    let after: string | null = null;

    while (posts.length < maxPosts) {
      const limit = Math.min(requestLimit, maxPosts - posts.length);
      const params = new URLSearchParams({
        q: keyword,
        restrict_sr: "1",
        sort: options?.sort ?? "relevance",
        limit: String(limit),
        t: time,
      });
      if (after) params.set("after", after);

      const url = `https://www.reddit.com/r/${subreddit}/search.json?${params.toString()}`;
      const response = await fetchRedditResponse(url);

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

    return rankRedditPosts(posts, keyword);
  } catch (error) {
    if (isRedditBlockedError(error)) {
      try {
        const fallbackPosts = await fetchFromPullPushSubmissions(
          subreddit,
          keyword,
          Math.max(1, Math.min(2_000, options?.maxPosts ?? 25)),
        );
        return rankRedditPosts(fallbackPosts, keyword);
      } catch (fallbackError) {
        console.error(
          `Error fetching posts from fallback source for r/${subreddit}:`,
          fallbackError,
        );
        return [];
      }
    }
    console.error(`Error fetching posts from r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Fetch comments from a Reddit post.
 *
 * This function constructs a URL to retrieve comments for a specific post in a given subreddit. It uses the fetchWithRetry function to handle network requests and retries. The response is processed to extract comment nodes, and a helper function, extractReplies, is used to recursively gather replies to comments. In case of an error during the fetch operation, it logs the error and returns an empty array.
 *
 * @param postId - The ID of the Reddit post for which comments are to be fetched.
 * @param subreddit - The name of the subreddit containing the post.
 * @returns A promise that resolves to an array of RedditComment objects.
 */
export const fetchComments = async (
  postId: string,
  subreddit: string,
  options?: { maxDepth?: number; maxComments?: number },
): Promise<RedditComment[]> => {
  const maxDepth = options?.maxDepth ?? 100;
  const maxComments = options?.maxComments ?? 200;

  // Validate subreddit to prevent malformed URLs and restrict path injection.
  if (!subreddit || !/^[A-Za-z0-9_]{3,21}$/.test(subreddit)) {
    throw new Error(`Invalid subreddit name: ${String(subreddit)}`);
  }

  try {
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
    const response = await fetchRedditResponse(url);

    const data = await response.json();
    const commentNodes = data[1].data.children;
    const collectedComments: RedditComment[] = [];

    const extractReplies = (
      replies: {
        data?: { children?: any[] };
      },
      currentDepth: number,
    ): void => {
      if (
        currentDepth >= maxDepth ||
        collectedComments.length >= maxComments ||
        !replies ||
        !replies.data ||
        !replies.data.children
      )
        return;

      for (const child of replies.data.children) {
        if (child.kind !== "t1") continue;
        if (collectedComments.length >= maxComments) break;

        const comment = child.data;
        collectedComments.push(comment);
        extractReplies(comment.replies, currentDepth + 1);
      }
    };

    for (const child of commentNodes) {
      if (child.kind !== "t1") continue;
      if (collectedComments.length >= maxComments) break;

      const comment = child.data;
      collectedComments.push(comment);
      extractReplies(comment.replies, 1); // Depth 1 for replies to top-level
    }

    return collectedComments;
  } catch (error) {
    if (isRedditBlockedError(error)) {
      try {
        return await fetchFromPullPushComments(postId);
      } catch (fallbackError) {
        console.error(
          "Error fetching comments from fallback source for post:",
          postId,
          fallbackError,
        );
        return [];
      }
    }
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
};

export interface SubredditSuggestion {
  name: string;
  subscribers: number;
  description: string;
  activeUsers?: number;
}

/**
 * Searches for relevant subreddits by name or topic using Reddit's search API.
 *
 * @param query - The search query.
 * @param limit - Maximum number of results to return.
 * @returns An array of subreddit suggestions with metadata.
 */
export async function searchSubreddits(
  query: string,
  limit = 10,
): Promise<SubredditSuggestion[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      sort: "relevance",
    });

    const url = `https://www.reddit.com/subreddits/search.json?${params.toString()}`;
    const response = await fetchRedditResponse(url);
    const data = await response.json();
    const children = data.data?.children ?? [];

    return children
      .map((child: any) => {
        const item = child.data;
        return {
          name: item.display_name,
          subscribers: item.subscribers || 0,
          description: item.public_description || item.title || "",
          activeUsers: item.active_user_count || 0,
        };
      })
      .filter(
        (sub: SubredditSuggestion) => sub.name && !sub.name.startsWith("u/"),
      )
      .slice(0, limit);
  } catch (error) {
    console.error("Error searching subreddits:", error);
    return [];
  }
}

/**
 * Fetches metadata for multiple subreddits.
 *
 * @param subreddits - Array of subreddit names to query.
 * @returns An array of metadata about each subreddit.
 */
export async function getSubredditMetadataBulk(
  subreddits: string[],
): Promise<SubredditSuggestion[]> {
  const results: SubredditSuggestion[] = [];

  for (const sub of subreddits) {
    try {
      const url = `https://www.reddit.com/r/${sub}/about.json`;
      const response = await fetchRedditResponse(url);
      const data = (await response.json()) as any;
      
      if (data?.data) {
        results.push({
          name: data.data.display_name ?? sub,
          subscribers: data.data.subscribers ?? 0,
          description: data.data.public_description ?? "",
          activeUsers: data.data.active_user_count ?? 0,
        });
      }
    } catch (err) {
      console.error(`Failed to fetch metadata for r/${sub}:`, err);
    }
  }

  return results;
}
