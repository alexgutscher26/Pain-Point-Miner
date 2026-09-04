import { gt } from "drizzle-orm";
import { db } from "../db";
import { redditRateLimitLog } from "../db/schema";

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

export function getRandomUA() {
  return UA_POOL[Math.floor(Math.random() * UA_POOL.length)] ?? "Threddiq/1.0";
}

/** The currently active User-Agent string for the current execution instance. */
export let currentUA = getRandomUA();

/** Switches to a different UA from the pool. */
export function rotateUA() {
  const others = UA_POOL.filter((ua) => ua !== currentUA);
  const pool = others.length > 0 ? others : UA_POOL;
  currentUA = pool[Math.floor(Math.random() * pool.length)] ?? getRandomUA();
  return currentUA;
}

/** In-memory map of throttled subreddits (subreddit -> timestamp when throttle expires). */
const throttledUntilMap = new Map<string, number>();

/** Track consecutive 429s per subreddit. */
export const consecutive429CountMap = new Map<string, number>();

const THROTTLE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** Extracts subreddit name from a Reddit URL. */
export function getSubredditFromUrl(url: string): string | null {
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
export async function logRateLimitEvent(
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
