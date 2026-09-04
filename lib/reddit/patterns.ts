import type { RedditPost } from "./types";

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

export function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizePattern(pattern: string) {
  return pattern.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Validates whether a custom pattern string compiles into a valid regular expression.
 */
export function validateCustomPatternRegex(pattern: string): {
  valid: boolean;
  error?: string;
} {
  if (!pattern || typeof pattern !== "string" || !pattern.trim()) {
    return { valid: false, error: "Pattern cannot be empty" };
  }

  const trimmed = pattern.trim();
  try {
    new RegExp(trimmed, "i");
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Invalid regular expression",
    };
  }
}

/**
 * Validates an array of custom patterns, returning whether all patterns are valid.
 */
export function validateCustomPatterns(patterns: string[]): {
  valid: boolean;
  errors: Array<{ pattern: string; error: string }>;
} {
  const errors: Array<{ pattern: string; error: string }> = [];
  for (const pattern of patterns) {
    const res = validateCustomPatternRegex(pattern);
    if (!res.valid) {
      errors.push({ pattern, error: res.error ?? "Invalid regex" });
    }
  }
  return { valid: errors.length === 0, errors };
}

export function createPatternRegex(pattern: string) {
  const normalizedPattern = normalizePattern(pattern);
  if (!normalizedPattern) return null;

  // Check if pattern contains explicit regex syntax like (a|b), [abc], etc.
  const hasRegexSyntax = /[()[\]{}|\\^$+*?]/.test(pattern);
  if (hasRegexSyntax) {
    try {
      return new RegExp(normalizedPattern, "gi");
    } catch {
      // If invalid as raw regex, fall back to tokenized word match
    }
  }

  const parts = normalizedPattern
    .split(" ")
    .map((part) => escapeRegExp(part))
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return new RegExp(`\\b${parts.join("\\s+")}\\b`, "gi");
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
