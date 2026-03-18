import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext } from "@/lib/api-auth";
import { z } from "zod";
import { getPlanEntitlements } from "@/lib/plan-gating";
import { resolvePlanContext } from "@/lib/plan-resolver";

const suggestPayloadSchema = z.object({
  keyword: z.string().trim().min(3).max(120),
  locale: z.string().trim().max(80).optional().default("United States"),
  count: z.number().int().min(1).max(15).optional().default(5),
});

const subredditNameSchema = z
  .string()
  .trim()
  .transform((value) =>
    value.replace(/^r\//i, "").replace(/[^\w]/g, "").toLowerCase(),
  )
  .pipe(z.string().regex(/^[a-z0-9_]{2,21}$/));

const extractMessageContent = (content: unknown): string => {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (
        part &&
        typeof part === "object" &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text;
      }

      return "";
    })
    .join("")
    .trim();
};

const parseSuggestedSubreddits = (
  rawContent: unknown,
  cappedCount: number,
): string[] => {
  const normalizedContent = extractMessageContent(rawContent)
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  if (!normalizedContent) {
    return [];
  }

  const parsed = JSON.parse(normalizedContent);
  const rawSubreddits = Array.isArray(parsed)
    ? parsed
    : parsed.subreddits || parsed.data || [];

  if (!Array.isArray(rawSubreddits)) {
    return [];
  }

  return rawSubreddits
    .map((item) => subredditNameSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .slice(0, cappedCount);
};

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
    const { keyword, locale, count } = parsedPayload.data;
    const planContext = await resolvePlanContext({
      userId,
      email: userEmail,
      requestHeaders: req.headers,
    });
    if (planContext.planPurchaseRequired) {
      return apiError(
        403,
        "PLAN_REQUIRED",
        "Your free trial has ended. Purchase a plan to continue.",
        {
          trialEnded: true,
        },
        correlationId,
      );
    }
    const plan = planContext.plan;
    const entitlements = getPlanEntitlements(plan);
    const cappedCount =
      entitlements.maxSubredditsPerSearch === null
        ? count
        : Math.min(count, entitlements.maxSubredditsPerSearch);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const prompt = `You are a Reddit growth expert. Suggest ${cappedCount} highly active and relevant subreddits for the niche: "${keyword}" for users in ${locale}. 
    Focus on communities where users post frustration, questions, and seek solutions.
    Return ONLY a JSON array of strings (the subreddit names without r/). 
    Example: ["saas", "entrepreneur", "startups"]`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "RPP - Reddit Intelligence Engine",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(
        `AI suggestion failed: ${response.status} ${response.statusText}${details ? ` - ${details}` : ""}`,
      );
    }

    const data = await response.json();
    const subreddits = parseSuggestedSubreddits(
      data?.choices?.[0]?.message?.content,
      cappedCount,
    );

    return apiJson({ subreddits }, 200, correlationId);
  } catch (error) {
    console.error("Subreddit suggestion error:", error);
    return apiJson({ subreddits: [] }, 200, correlationId);
  }
}
