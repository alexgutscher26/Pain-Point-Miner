import type { RedditPost } from "./types";
import {
  DEFAULT_PROBLEM_PATTERNS,
  getProblemPatternMatchStats,
  normalizeText,
  escapeRegExp,
} from "./patterns";

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

export function scoreRedditPostRelevance(
  post: RedditPost,
  keyword: string,
  problemPatterns: string[] = [...DEFAULT_PROBLEM_PATTERNS],
) {
  const normalizedKeyword = normalizeText(keyword);
  const keywordTokens = tokenizeKeyword(keyword);
  const title = normalizeText(post.title ?? "");
  const body = normalizeText(post.selftext ?? "");
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
