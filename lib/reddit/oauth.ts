import {
  currentUA,
  rotateUA,
  getSubredditFromUrl,
  isSubredditThrottled,
  consecutive429CountMap,
  logRateLimitEvent,
} from "./throttle";

export const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID?.trim();
export const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET?.trim();
export const DEFAULT_TIMEOUT_MS = 15_000;
export const MAX_RETRIES = 3;
export const TOKEN_EXPIRY_SAFETY_SECONDS = 30;

export function getRedditRateLimitDelayMs(): number {
  const envVal = process.env.REDDIT_RATE_LIMIT_DELAY_MS;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

export type RedditTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

export type CachedToken = {
  token: string;
  expiresAtEpochSeconds: number;
};

let cachedToken: CachedToken | null = null;
let activeTokenPromise: Promise<string | null> | null = null;

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getOAuthCredentials() {
  const clientId = (process.env.REDDIT_CLIENT_ID ?? REDDIT_CLIENT_ID)?.trim();
  const clientSecret = (
    process.env.REDDIT_CLIENT_SECRET ?? REDDIT_CLIENT_SECRET
  )?.trim();
  if (clientId && clientSecret) {
    return { clientId, clientSecret };
  }
  return null;
}

export function hasOAuthCredentials() {
  return Boolean(getOAuthCredentials());
}

/**
 * Fetch a resource with retry logic for handling transient errors.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const defaultHeaders = {
        "User-Agent": currentUA,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
      };

      const customHeaders =
        init.headers instanceof Headers
          ? Object.fromEntries(init.headers.entries())
          : (init.headers as Record<string, string>) || {};

      const response = await fetch(url, {
        ...init,
        headers: {
          ...defaultHeaders,
          ...customHeaders,
        },
        signal: controller.signal,
      });

      if (response.ok) {
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
        // Rotate UA and update headers for the next attempt
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

    await sleep(400 * (attempt + 1));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Reddit request failed");
}

/**
 * Retrieves a valid Reddit OAuth access token.
 * Uses a single-flight promise to avoid duplicate concurrent token requests
 * and caches the token until close to expiration.
 */
export async function getRedditAccessToken(
  forceRefresh = false,
): Promise<string | null> {
  const creds = getOAuthCredentials();
  if (!creds) return null;

  const nowSeconds = Math.floor(Date.now() / 1_000);
  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.expiresAtEpochSeconds > nowSeconds + TOKEN_EXPIRY_SAFETY_SECONDS
  ) {
    return cachedToken.token;
  }

  if (activeTokenPromise) {
    return activeTokenPromise;
  }

  activeTokenPromise = (async () => {
    try {
      // Layer 2: Check persistent DB cache across requests/processes
      if (!forceRefresh) {
        try {
          const { db } = await import("../db");
          const { redditOAuthCache } = await import("../db/schema");

          const minExpiry = new Date(
            Date.now() + TOKEN_EXPIRY_SAFETY_SECONDS * 1000,
          );
          const dbCached = await db.query.redditOAuthCache.findFirst({
            where: (t, { and, eq, gt }) =>
              and(eq(t.key, creds.clientId), gt(t.expiresAt, minExpiry)),
          });

          if (dbCached?.token) {
            cachedToken = {
              token: dbCached.token,
              expiresAtEpochSeconds: Math.floor(
                dbCached.expiresAt.getTime() / 1000,
              ),
            };
            return cachedToken.token;
          }
        } catch {
          // Gracefully continue to API token fetch if DB table is unavailable
        }
      }

      const basicAuth = Buffer.from(
        `${creds.clientId}:${creds.clientSecret}`,
      ).toString("base64");

      let tokenResponse: Response | null = null;
      let lastTokenError: unknown = null;

      // Retry token fetch up to 3 attempts with progressive delay
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          tokenResponse = await fetchWithRetry(
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
          if (tokenResponse.ok) break;
        } catch (err) {
          lastTokenError = err;
          if (attempt < 2) {
            await sleep(300 * (attempt + 1));
          }
        }
      }

      if (!tokenResponse || !tokenResponse.ok) {
        cachedToken = null;
        throw lastTokenError instanceof Error
          ? lastTokenError
          : new Error("Failed to obtain Reddit access token after retries");
      }

      const payload = (await tokenResponse.json()) as RedditTokenResponse;
      if (!payload.access_token) {
        cachedToken = null;
        throw new Error(
          "Failed to obtain Reddit access token: missing token in response",
        );
      }

      const expiresIn = payload.expires_in ?? 3_600;
      const expiresAt = new Date(Date.now() + Math.max(60, expiresIn) * 1000);
      cachedToken = {
        token: payload.access_token,
        expiresAtEpochSeconds: Math.floor(expiresAt.getTime() / 1000),
      };

      // Persist token in DB cache across requests
      try {
        const { db } = await import("../db");
        const { redditOAuthCache } = await import("../db/schema");
        await db
          .insert(redditOAuthCache)
          .values({
            key: creds.clientId,
            token: payload.access_token,
            expiresAt,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: redditOAuthCache.key,
            set: {
              token: payload.access_token,
              expiresAt,
              updatedAt: new Date(),
            },
          });
      } catch (dbErr) {
        // Silently continue if DB logging fails
      }

      return cachedToken.token;
    } finally {
      activeTokenPromise = null;
    }
  })();

  return activeTokenPromise;
}

/**
 * Executes a request to Reddit API with automatic token injection and 401 token refresh retry.
 */
export async function fetchRedditResponse(
  url: string,
  retriesOnAuthFailure = 1,
): Promise<Response> {
  const delayMs = getRedditRateLimitDelayMs();
  if (delayMs > 0) {
    await sleep(delayMs);
  }

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
        retriesOnAuthFailure > 0 &&
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.toLowerCase().includes("unauthorized") ||
          error.message.toLowerCase().includes("expired"))
      ) {
        const refreshedToken = await getRedditAccessToken(true);
        if (refreshedToken) {
          return fetchRedditResponse(url, retriesOnAuthFailure - 1);
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
