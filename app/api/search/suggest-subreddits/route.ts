import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext } from "@/lib/api-auth";
import { z } from "zod";
import { getPlanEntitlements } from "@/lib/plan-gating";
import { resolvePlanContext } from "@/lib/plan-resolver";
import { db } from "@/lib/db";
import { discoveryCache, subredditCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { searchSubreddits, type SubredditSuggestion } from "@/lib/reddit";

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const suggestPayloadSchema = z.object({
  keyword: z.string().trim().min(3).max(120),
  locale: z.string().trim().max(80).optional(),
  count: z.number().int().min(1).max(15).optional().default(10),
});

/**
 * Weighted scoring for subreddit relevance.
 */
function calculateRelevanceScore(
  sub: SubredditSuggestion,
  rank: number,
): number {
  let score = (20 - rank) * 5; // Preference for Reddit's relevance ranking
  score += Math.log10(Math.max(1, sub.subscribers)) * 8; // Popularity weight
  score += Math.log10(Math.max(1, sub.activeUsers ?? 0)) * 12; // Real-time activity weight
  return Math.round(score);
}

export async function POST(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, userEmail } = authContext.context;

  try {
    const payload = await req.json().catch(() => null);
    const parsedPayload = suggestPayloadSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return apiJson({ subreddits: [] }, 200, correlationId);
    }
    const { keyword, count } = parsedPayload.data;
    const normalizedKeyword = keyword.toLowerCase().trim();

    const planContext = await resolvePlanContext({
      userId,
      email: userEmail,
      requestHeaders: req.headers,
    });

    if (planContext.planPurchaseRequired) {
      return apiError(
        403,
        "PLAN_REQUIRED",
        "Start your 2-day trial with a credit card to unlock AI subreddit suggestions.",
        { trialEnded: true },
        correlationId,
      );
    }

    const plan = planContext.plan;
    const entitlements = getPlanEntitlements(plan);
    const cappedCount =
      entitlements.maxSubredditsPerSearch === null
        ? count
        : Math.min(count, entitlements.maxSubredditsPerSearch);

    // 1. Check Discovery Cache
    const cached = await db.query.discoveryCache.findFirst({
      where: eq(discoveryCache.keyword, normalizedKeyword),
    });

    const isCacheValid =
      cached &&
      Date.now() - new Date(cached.cachedAt).getTime() < CACHE_DURATION_MS;

    if (isCacheValid) {
      return apiJson(
        {
          subreddits: (cached.suggestions as SubredditSuggestion[]).slice(
            0,
            cappedCount,
          ),
          cached: true,
        },
        200,
        correlationId,
      );
    }

    // 2. Fetch from Reddit
    const suggestions = await searchSubreddits(normalizedKeyword, 25);

    // 3. Score and Sort
    const scoredSuggestions = suggestions
      .map((sub, i) => ({
        ...sub,
        relevanceScore: calculateRelevanceScore(sub, i),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 15); // Store top 15 in cache

    // 4. Update Cache
    await db
      .insert(discoveryCache)
      .values({
        keyword: normalizedKeyword,
        suggestions: scoredSuggestions,
        cachedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [discoveryCache.keyword],
        set: {
          suggestions: scoredSuggestions,
          cachedAt: new Date(),
        },
      });

    const recordValues = scoredSuggestions.map((s) => ({
      name: s.name.toLowerCase(),
      subscriberCount: s.subscribers,
      description: s.description,
      activeUsers: s.activeUsers || 0,
      category: null,
      cachedAt: new Date(),
    }));

    if (recordValues.length > 0) {
      Promise.all(recordValues.map(record =>
        db.insert(subredditCache)
          .values(record)
          .onConflictDoUpdate({
            target: subredditCache.name,
            set: {
              subscriberCount: record.subscriberCount,
              description: record.description,
              activeUsers: record.activeUsers,
              cachedAt: record.cachedAt,
            }
          })
      )).catch(err => console.error("Failed to populate subredditCache", err));
    }

    return apiJson(
      {
        subreddits: scoredSuggestions.slice(0, cappedCount),
        cached: false,
      },
      200,
      correlationId,
    );
  } catch (error) {
    console.error("Subreddit suggestion error:", error);
    return apiJson({ subreddits: [] }, 200, correlationId);
  }
}
