/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  RedditPost,
  RedditComment,
  RedditSortMode,
  RedditTimeRange,
  RedditPostWithMeta,
} from "./types";
import { getSortModesForDepth } from "./types";
import { currentUA, isSubredditThrottled } from "./throttle";
import { fetchRedditResponse, sleep } from "./oauth";
import { rankRedditPosts } from "./ranking";

type RedditListingResponse = {
  data?: {
    after?: string | null;
    before?: string | null;
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

export interface FetchSubredditPostsOptions {
  maxPosts?: number;
  time?: RedditTimeRange;
  delayMs?: number;
  requestLimit?: number;
  /** Reddit search sort mode. Defaults to "relevance". */
  sort?: RedditSortMode;
  /** Pagination cursor to fetch results after this post ID / fullname */
  after?: string | null;
  /** Pagination cursor to fetch results before this post ID / fullname */
  before?: string | null;
}

export interface RedditPagedPostsResult {
  posts: RedditPost[];
  after: string | null;
  before: string | null;
}

export interface SubredditSuggestion {
  name: string;
  subscribers: number;
  description: string;
  activeUsers?: number;
}

export interface SubredditValidationResult {
  exists: boolean;
  name: string;
  reason?:
    | "not_found"
    | "banned"
    | "private"
    | "invalid_name"
    | "low_subscribers"
    | "error";
  title?: string;
  subscribers?: number;
  lowSubscribers?: boolean;
}

/**
 * Constructs the Reddit search URL supporting single subreddits, multi-reddits (sub1+sub2), and global r/all search.
 */
export function buildRedditSearchUrl(
  subreddit: string,
  params: URLSearchParams,
): string {
  const cleanSub = subreddit.replace(/^r\//i, "").trim();

  if (!cleanSub || cleanSub.toLowerCase() === "all") {
    params.delete("restrict_sr");
    return `https://www.reddit.com/r/all/search.json?${params.toString()}`;
  }

  if (cleanSub.includes("+")) {
    const validSubs = cleanSub
      .split("+")
      .map((s) => s.replace(/^r\//i, "").trim())
      .filter(Boolean);
    params.set("restrict_sr", "1");
    return `https://www.reddit.com/r/${validSubs.join("+")}/search.json?${params.toString()}`;
  }

  params.set("restrict_sr", "1");
  return `https://www.reddit.com/r/${cleanSub}/search.json?${params.toString()}`;
}

function parseRedditRss(xml: string, subreddit: string): RedditPost[] {
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const posts: RedditPost[] = [];
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/);
    const contentMatch = entryXml.match(
      /<content type="html">([\s\S]*?)<\/content>/,
    );
    const idMatch = entryXml.match(/<id>([\s\S]*?)<\/id>/);
    const linkMatch = entryXml.match(/<link href="([\s\S]*?)"/);
    const authorMatch = entryXml.match(/<author><name>([\s\S]*?)<\/name>/);
    const updatedMatch = entryXml.match(/<updated>([\s\S]*?)<\/updated>/);

    const rawContent = contentMatch ? contentMatch[1] : "";
    const selftext = rawContent
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>?/gm, " ")
      .replace(/\s+/g, " ")
      .trim();

    let id = idMatch ? idMatch[1] : "";
    const t3Match = id.match(/t3_([a-z0-9]+)/i);
    if (t3Match) {
      id = t3Match[1];
    } else {
      const commentMatch = (linkMatch ? linkMatch[1] : "").match(
        /\/comments\/([a-z0-9]+)\//i,
      );
      id = commentMatch ? commentMatch[1] : crypto.randomUUID();
    }

    const title = titleMatch
      ? titleMatch[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
      : "";

    const createdUtc = updatedMatch
      ? Math.floor(new Date(updatedMatch[1]).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    posts.push({
      id,
      title,
      selftext,
      author: authorMatch ? authorMatch[1].replace("/u/", "") : "unknown",
      score: 1,
      subreddit,
      url: linkMatch ? linkMatch[1] : "",
      num_comments: 0,
      created_utc: createdUtc,
      is_self: !rawContent.includes("<span>[link]</span>"),
    });
  }

  return posts;
}

export async function fetchFromRedditRSS(
  subreddit: string,
  keyword: string,
  maxPosts: number,
  sort: RedditSortMode = "relevance",
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.rss?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=${sort}&limit=${Math.min(100, maxPosts)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": currentUA,
      Accept: "application/atom+xml,application/xml,text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Reddit RSS returned ${response.status}: ${response.statusText}`,
    );
  }

  const xml = await response.text();
  return parseRedditRss(xml, subreddit);
}

export async function fetchFromArcticShiftSubmissions(
  subreddit: string,
  keyword: string,
  maxPosts: number,
): Promise<RedditPost[]> {
  const url = `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=${subreddit}&limit=${Math.min(100, maxPosts)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    throw new Error(
      `Arctic Shift returned ${response.status}: ${response.statusText}`,
    );
  }

  const json = (await response.json()) as { data?: any[] };
  const rows = json.data ?? [];

  return rows.map((r: any) => ({
    id: r.id,
    title: r.title || "",
    selftext: r.selftext || "",
    author: r.author || "unknown",
    score: r.score ?? 1,
    subreddit: r.subreddit || subreddit,
    url: r.permalink ? `https://www.reddit.com${r.permalink}` : r.url || "",
    num_comments: r.num_comments ?? 0,
    created_utc: r.created_utc ?? Math.floor(Date.now() / 1000),
    is_self: r.is_self ?? true,
  }));
}

export async function fetchFromArcticShiftComments(
  postId: string,
): Promise<RedditComment[]> {
  const url = `https://arctic-shift.photon-reddit.com/api/comments/search?link_id=${postId}&limit=100`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    throw new Error(
      `Arctic Shift comments returned ${response.status}: ${response.statusText}`,
    );
  }

  const json = (await response.json()) as { data?: any[] };
  const rows = json.data ?? [];

  return rows.map((r: any) => ({
    id: r.id,
    body: r.body || "",
    author: r.author || "unknown",
    score: r.score ?? 0,
    permalink: r.permalink ? `https://www.reddit.com${r.permalink}` : "",
    created_utc: r.created_utc ?? Math.floor(Date.now() / 1000),
  }));
}

export async function fetchFromPullPushSubmissions(
  subreddit: string,
  keyword: string,
  maxPosts: number,
  options?: {
    after?: number | string;
    before?: number | string;
    retries?: number;
  },
): Promise<RedditPost[]> {
  const cleanSub = subreddit.replace(/^r\//i, "").trim();
  const params = new URLSearchParams({
    q: keyword,
    size: String(Math.min(100, maxPosts)),
    sort: "desc",
    sort_type: "score",
  });
  if (cleanSub && cleanSub.toLowerCase() !== "all") {
    params.set("subreddit", cleanSub);
  }
  if (options?.after) {
    params.set("after", String(options.after));
  }
  if (options?.before) {
    params.set("before", String(options.before));
  }

  const url = `https://api.pullpush.io/reddit/search/submission/?${params.toString()}`;
  let lastError: unknown;
  const maxAttempts =
    options?.retries !== undefined ? Math.max(1, options.retries) : 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": currentUA },
      });
      if (!response.ok) {
        throw new Error(
          `PullPush API returned ${response.status}: ${response.statusText}`,
        );
      }
      const data = (await response.json()) as PullPushListingResponse;
      const rows = data.data ?? [];
      return rows.map((row) => ({
        id: row.id ?? crypto.randomUUID(),
        title: row.title ?? "",
        selftext: row.selftext ?? "",
        author: row.author ?? "unknown",
        score: row.score ?? 1,
        subreddit: row.subreddit ?? cleanSub,
        url:
          row.url ||
          (row.permalink ? `https://www.reddit.com${row.permalink}` : ""),
        num_comments: row.num_comments ?? 0,
        created_utc:
          row.created_utc ?? row.created ?? Math.floor(Date.now() / 1000),
        is_self: row.is_self ?? true,
      }));
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(300 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("PullPush submissions API failed");
}

export async function fetchFromPullPushComments(
  postId: string,
  options?: { retries?: number },
): Promise<RedditComment[]> {
  const params = new URLSearchParams({
    link_id: postId.startsWith("t3_") ? postId : `t3_${postId}`,
    size: "100",
    sort: "desc",
    sort_type: "score",
  });

  const url = `https://api.pullpush.io/reddit/search/comment/?${params.toString()}`;
  let lastError: unknown;
  const maxAttempts =
    options?.retries !== undefined ? Math.max(1, options.retries) : 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": currentUA },
      });
      if (!response.ok) {
        throw new Error(
          `PullPush API returned ${response.status}: ${response.statusText}`,
        );
      }
      const data = (await response.json()) as PullPushCommentResponse;
      const rows = data.data ?? [];
      return rows
        .filter(
          (
            row,
          ): row is NonNullable<typeof row> & { id: string; body: string } =>
            Boolean(row?.id && row?.body),
        )
        .map((row) => ({
          id: row.id,
          body: row.body,
          author: row.author ?? "unknown",
          score: row.score ?? 0,
          permalink: row.permalink
            ? `https://www.reddit.com${row.permalink}`
            : "",
          created_utc:
            row.created_utc ?? row.created ?? Math.floor(Date.now() / 1000),
        }));
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(300 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("PullPush comments API failed");
}

/**
 * Fetch posts from a specified subreddit in batches based on a keyword.
 */
export async function fetchSubredditPostsBatched(
  subreddit: string,
  keyword: string,
  options?: FetchSubredditPostsOptions,
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
    let after: string | null = options?.after ?? null;
    let before: string | null = options?.before ?? null;

    while (posts.length < maxPosts) {
      const limit = Math.min(requestLimit, maxPosts - posts.length);
      const params = new URLSearchParams({
        q: keyword,
        sort: options?.sort ?? "relevance",
        limit: String(limit),
        t: time,
      });
      if (after) params.set("after", after);
      if (before && !after) params.set("before", before);

      const url = buildRedditSearchUrl(subreddit, params);
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
      before = data.data?.before ?? null;
      if (!after) break;

      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }

    return rankRedditPosts(posts, keyword);
  } catch (error) {
    // Multi-source Fallback Chain: Reddit RSS -> Arctic Shift -> PullPush
    const requestedMax = Math.max(1, Math.min(2_000, options?.maxPosts ?? 25));

    try {
      const rssPosts = await fetchFromRedditRSS(
        subreddit,
        keyword,
        requestedMax,
        options?.sort ?? "relevance",
      );
      if (rssPosts.length > 0) {
        return rankRedditPosts(rssPosts, keyword);
      }
    } catch {}

    try {
      const arcticPosts = await fetchFromArcticShiftSubmissions(
        subreddit,
        keyword,
        requestedMax,
      );
      if (arcticPosts.length > 0) {
        return rankRedditPosts(arcticPosts, keyword);
      }
    } catch {}

    try {
      const fallbackPosts = await fetchFromPullPushSubmissions(
        subreddit,
        keyword,
        requestedMax,
      );
      if (fallbackPosts.length > 0) {
        return rankRedditPosts(fallbackPosts, keyword);
      }
    } catch (pullPushError) {
      console.error(
        `All scraping fallback sources failed for r/${subreddit}:`,
        pullPushError,
      );
    }

    return [];
  }
}

/**
 * Fetch comments from a Reddit post.
 */
export async function fetchComments(
  postId: string,
  subreddit: string,
  options?: { maxDepth?: number; maxComments?: number },
): Promise<RedditComment[]> {
  const maxDepth = options?.maxDepth ?? 100;
  const maxComments = options?.maxComments ?? 200;

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
      extractReplies(comment.replies, 1);
    }

    return collectedComments;
  } catch (error) {
    try {
      const arcticComments = await fetchFromArcticShiftComments(postId);
      if (arcticComments.length > 0) return arcticComments;
    } catch {}

    try {
      const pullPushComments = await fetchFromPullPushComments(postId);
      if (pullPushComments.length > 0) return pullPushComments;
    } catch (fallbackError) {
      console.error(
        "Error fetching comments from fallback sources for post:",
        postId,
        fallbackError,
      );
    }

    return [];
  }
}

/**
 * Fetches posts from a subreddit across multiple Reddit sort modes concurrently.
 */
export async function fetchSubredditPostsMultiSort(
  subreddit: string,
  keyword: string,
  depth: string,
  options?: FetchSubredditPostsOptions,
): Promise<RedditPostWithMeta[]> {
  const sortModes = getSortModesForDepth(depth);

  const perModeFetches = await Promise.allSettled(
    sortModes.map((mode) =>
      fetchSubredditPostsBatched(subreddit, keyword, {
        ...options,
        sort: mode,
      }),
    ),
  );

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

  const ranked = rankRedditPosts(merged, keyword);
  return ranked as RedditPostWithMeta[];
}

/**
 * Fetches posts from multiple subreddits by grouping them into multi-reddit composite queries.
 */
export async function fetchMultiRedditPostsBatched(
  subreddits: string[],
  keyword: string,
  options?: FetchSubredditPostsOptions & { chunkSize?: number },
): Promise<RedditPost[]> {
  const uniqueSubs = Array.from(
    new Set(
      subreddits.map((s) => s.replace(/^r\//i, "").trim()).filter(Boolean),
    ),
  );

  if (uniqueSubs.length === 0) return [];

  const chunkSize = Math.max(1, Math.min(10, options?.chunkSize ?? 5));
  const chunks: string[][] = [];
  for (let i = 0; i < uniqueSubs.length; i += chunkSize) {
    chunks.push(uniqueSubs.slice(i, i + chunkSize));
  }

  const allPosts: RedditPost[] = [];
  for (const chunk of chunks) {
    const multiRedditName = chunk.join("+");
    const posts = await fetchSubredditPostsBatched(
      multiRedditName,
      keyword,
      options,
    );
    allPosts.push(...posts);
  }

  const seen = new Set<string>();
  const deduped: RedditPost[] = [];
  for (const p of allPosts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    deduped.push(p);
  }

  return rankRedditPosts(deduped, keyword);
}

/**
 * Multi-sort fetch across multiple subreddits using multi-reddit composite grouping.
 */
export async function fetchMultiRedditPostsMultiSort(
  subreddits: string[],
  keyword: string,
  depth: string,
  options?: FetchSubredditPostsOptions & { chunkSize?: number },
): Promise<RedditPostWithMeta[]> {
  const uniqueSubs = Array.from(
    new Set(
      subreddits.map((s) => s.replace(/^r\//i, "").trim()).filter(Boolean),
    ),
  );

  if (uniqueSubs.length === 0) return [];

  const chunkSize = Math.max(1, Math.min(10, options?.chunkSize ?? 5));
  const chunks: string[][] = [];
  for (let i = 0; i < uniqueSubs.length; i += chunkSize) {
    chunks.push(uniqueSubs.slice(i, i + chunkSize));
  }

  const allPosts: RedditPostWithMeta[] = [];
  for (const chunk of chunks) {
    const multiRedditName = chunk.join("+");
    const posts = await fetchSubredditPostsMultiSort(
      multiRedditName,
      keyword,
      depth,
      options,
    );
    allPosts.push(...posts);
  }

  const seen = new Set<string>();
  const deduped: RedditPostWithMeta[] = [];
  for (const p of allPosts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    deduped.push(p);
  }

  return rankRedditPosts(deduped, keyword) as RedditPostWithMeta[];
}

/**
 * Fetches posts from a specified subreddit containing a keyword.
 */
export async function fetchSubredditPosts(
  subreddit: string,
  keyword: string,
  limit = 25,
  time: RedditTimeRange = "all",
): Promise<RedditPost[]> {
  const posts = await fetchSubredditPostsBatched(subreddit, keyword, {
    maxPosts: limit,
    time,
  });
  return posts.slice(0, limit);
}

/**
 * Fetches a single page of posts with pagination cursor metadata (after/before).
 */
export async function fetchSubredditPostsPaginated(
  subreddit: string,
  keyword: string,
  options?: FetchSubredditPostsOptions,
): Promise<RedditPagedPostsResult> {
  const limit = Math.max(
    1,
    Math.min(100, options?.requestLimit ?? options?.maxPosts ?? 25),
  );
  const time = options?.time ?? "all";
  const params = new URLSearchParams({
    q: keyword,
    sort: options?.sort ?? "relevance",
    limit: String(limit),
    t: time,
  });

  if (options?.after) params.set("after", options.after);
  if (options?.before && !options?.after) params.set("before", options.before);

  const url = buildRedditSearchUrl(subreddit, params);
  const response = await fetchRedditResponse(url);
  const data = (await response.json()) as RedditListingResponse;
  const children = data.data?.children ?? [];
  const posts: RedditPost[] = [];

  for (const child of children) {
    if (child.data) {
      posts.push(child.data);
    }
  }

  return {
    posts: rankRedditPosts(posts, keyword),
    after: data.data?.after ?? null,
    before: data.data?.before ?? null,
  };
}

/**
 * Searches for relevant subreddits by name or topic using Reddit's search API.
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
 */
export async function getSubredditMetadataBulk(
  subreddits: string[],
): Promise<SubredditSuggestion[]> {
  const results: SubredditSuggestion[] = [];

  for (const sub of subreddits) {
    if (isSubredditThrottled(sub)) {
      continue;
    }
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
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Failed to fetch metadata for r/${sub}: ${message}`);
    }
  }

  return results;
}

/**
 * Validates whether a single subreddit exists, is active, and accessible (not banned/private/404).
 */
export async function validateSubredditExists(
  subreddit: string,
  options?: { minSubscribers?: number },
): Promise<SubredditValidationResult> {
  const cleanSub = subreddit.replace(/^r\//i, "").trim();

  if (cleanSub.toLowerCase() === "all") {
    return {
      exists: true,
      name: "all",
      title: "All Reddit Communities",
      subscribers: 100_000_000,
    };
  }

  if (cleanSub.includes("+")) {
    const parts = cleanSub
      .split("+")
      .map((s) => s.replace(/^r\//i, "").trim())
      .filter(Boolean);
    const validParts = parts.filter((part) =>
      /^[A-Za-z0-9_]{2,24}$/.test(part),
    );
    if (validParts.length === 0) {
      return {
        exists: false,
        name: cleanSub,
        reason: "invalid_name",
      };
    }
    return {
      exists: true,
      name: validParts.join("+"),
      title: `Multi-Reddit (${validParts.join(", ")})`,
    };
  }

  if (!cleanSub || !/^[A-Za-z0-9_]{3,21}$/.test(cleanSub)) {
    return {
      exists: false,
      name: cleanSub,
      reason: "invalid_name",
    };
  }

  const minSubscribers = options?.minSubscribers ?? 0;

  try {
    const url = `https://www.reddit.com/r/${cleanSub}/about.json`;
    const response = await fetchRedditResponse(url);

    if (!response.ok) {
      if (response.status === 404) {
        return { exists: false, name: cleanSub, reason: "not_found" };
      }
      if (response.status === 403) {
        return { exists: false, name: cleanSub, reason: "private" };
      }
    }

    const data = (await response.json()) as any;
    if (
      data?.error === 404 ||
      (data?.data?.name === undefined && data?.data?.display_name === undefined)
    ) {
      if (data?.reason === "banned") {
        return { exists: false, name: cleanSub, reason: "banned" };
      }
      if (data?.reason === "private") {
        return { exists: false, name: cleanSub, reason: "private" };
      }
      return { exists: false, name: cleanSub, reason: "not_found" };
    }

    const subscribers = data.data?.subscribers ?? 0;
    if (minSubscribers > 0 && subscribers < minSubscribers) {
      return {
        exists: false,
        name: data.data.display_name ?? cleanSub,
        title: data.data.title ?? "",
        subscribers,
        lowSubscribers: true,
        reason: "low_subscribers",
      };
    }

    return {
      exists: true,
      name: data.data.display_name ?? cleanSub,
      title: data.data.title ?? "",
      subscribers,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message.toLowerCase()
        : String(err).toLowerCase();
    if (message.includes("404") || message.includes("not found")) {
      return { exists: false, name: cleanSub, reason: "not_found" };
    }
    if (
      message.includes("403") ||
      message.includes("private") ||
      message.includes("forbidden")
    ) {
      return { exists: false, name: cleanSub, reason: "private" };
    }
    if (message.includes("banned")) {
      return { exists: false, name: cleanSub, reason: "banned" };
    }
    return { exists: true, name: cleanSub };
  }
}

/**
 * Validates a list of subreddit names concurrently and separates them into valid vs invalid.
 */
export async function validateSubredditsBulk(
  subreddits: string[],
  options?: { minSubscribers?: number },
): Promise<{
  valid: string[];
  invalid: Array<{ name: string; reason?: string; subscribers?: number }>;
}> {
  const uniqueSubs = Array.from(
    new Set(
      subreddits.map((s) => s.replace(/^r\//i, "").trim()).filter(Boolean),
    ),
  );

  const results = await Promise.all(
    uniqueSubs.map((sub) => validateSubredditExists(sub, options)),
  );

  const valid: string[] = [];
  const invalid: Array<{
    name: string;
    reason?: string;
    subscribers?: number;
  }> = [];

  for (const res of results) {
    if (res.exists) {
      valid.push(res.name);
    } else {
      invalid.push({
        name: res.name,
        reason: res.reason,
        subscribers: res.subscribers,
      });
    }
  }

  return { valid, invalid };
}
