import type { RedditPost } from "@/lib/reddit";
import { getTimeWindowAgeSeconds, type TimeWindow } from "@/lib/time-window";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

export function dedupePosts(posts: RedditPost[]): RedditPost[] {
  const seen = new Set<string>();
  const deduped: RedditPost[] = [];
  for (const post of posts) {
    if (seen.has(post.id)) continue;
    seen.add(post.id);
    deduped.push(post);
  }
  return deduped;
}

export function cleanCommentBody(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}

export function calculatePostQualityScore(post: RedditPost): number {
  let score = 1.0;
  const body = (post.selftext || "").toLowerCase();

  // Low engagement penalty
  if (post.score < 5 && post.num_comments < 10) score -= 0.2;

  // High engagement boost
  if (post.score > 100 || post.num_comments > 50) score += 0.2;

  // Link post penalty if the body is very sparse
  if (post.is_self === false && body.length < 50) score -= 0.3;

  return Math.max(0, Math.min(1.0, Number(score.toFixed(2))));
}

export function filterPostsByTimeAndQuality(
  posts: RedditPost[],
  timeWindow: TimeWindow,
): { filteredPosts: RedditPost[]; postsSkipped: number } {
  const nowSeconds = Math.floor(Date.now() / 1_000);
  const oldestAllowedUtc = nowSeconds - getTimeWindowAgeSeconds(timeWindow);
  const timeFiltered = posts.filter(
    (post) => post.created_utc >= oldestAllowedUtc,
  );

  const hasSelfPosts = timeFiltered.some((p) => p.is_self !== false);
  const preFiltered = timeFiltered.filter((post) => {
    // 1. Skip removed/deleted content
    const body = (post.selftext || "").toLowerCase();
    if (body === "[removed]" || body === "[deleted]") return false;

    // 2. Skip link posts unless no self-posts exist
    if (post.is_self === false && hasSelfPosts) {
      return false;
    }

    return true;
  });

  const postsSkipped = timeFiltered.length - preFiltered.length;
  return { filteredPosts: preFiltered, postsSkipped };
}
