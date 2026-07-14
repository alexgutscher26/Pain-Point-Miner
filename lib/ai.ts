import {
  normalizeBudgetSignals,
  type BudgetSignal,
  type BudgetCadence,
} from "@/lib/budget-signals";
import type { MiningDepth } from "@/lib/mining-presets";
import { str } from "@/lib/env";

// ---------------------------------------------------------------------------
// Model catalogue
// ---------------------------------------------------------------------------
export const AI_MODELS = {
  GEMINI_FLASH: "google/gemini-2.0-flash-001",
  GPT4O: "openai/gpt-4o",
  CLAUDE_SONNET: "anthropic/claude-sonnet-3-5",
} as const;

export type AiModelId = (typeof AI_MODELS)[keyof typeof AI_MODELS];

export const DEFAULT_AI_MODEL: AiModelId = AI_MODELS.GEMINI_FLASH;

/** Human-readable display label for each model, used in report metadata. */
export const AI_MODEL_LABELS: Record<AiModelId, string> = {
  [AI_MODELS.GEMINI_FLASH]: "Gemini 2.0 Flash",
  [AI_MODELS.GPT4O]: "GPT-4o",
  [AI_MODELS.CLAUDE_SONNET]: "Claude Sonnet 3.5",
};

// ---------------------------------------------------------------------------
// Per-model cost rates (USD per 1 token)
// ---------------------------------------------------------------------------
const MODEL_COST_RATES: Record<AiModelId, { input: number; output: number }> = {
  [AI_MODELS.GEMINI_FLASH]: { input: 0.0000001, output: 0.0000004 },  // $0.10 / $0.40 per 1M
  [AI_MODELS.GPT4O]:        { input: 0.0000025, output: 0.00001 },    // $2.50 / $10.00 per 1M
  [AI_MODELS.CLAUDE_SONNET]:{ input: 0.000003,  output: 0.000015 },   // $3.00 / $15.00 per 1M
};

/**
 * Returns the canonical OpenRouter model ID to use for a given mining depth.
 * Can be overridden via explicit `modelOverride`.
 */
export function getModelForDepth(
  _depth: MiningDepth,
  modelOverride?: string,
): AiModelId {
  if (modelOverride && Object.values(AI_MODELS).includes(modelOverride as AiModelId)) {
    return modelOverride as AiModelId;
  }
  // All depths use Gemini 2.0 Flash — affordable, fast, great at structured extraction.
  return AI_MODELS.GEMINI_FLASH;
}

/**
 * Compute USD cost for a given model + token counts.
 */
function computeCostUsd(
  modelId: AiModelId,
  inputTokens: number,
  outputTokens: number,
): number {
  const rates = MODEL_COST_RATES[modelId] ?? MODEL_COST_RATES[AI_MODELS.GEMINI_FLASH];
  return inputTokens * rates.input + outputTokens * rates.output;
}

// ---------------------------------------------------------------------------
// AI Usage logging
// ---------------------------------------------------------------------------
interface AiUsageInput {
  userId: string;
  modelId: AiModelId;
  inputTokens: number;
  outputTokens: number;
  scraperId?: string | null;
}

/**
 * Fire-and-forget: write one row to `ai_usage` for billing reconciliation.
 * Intentionally swallows errors so a DB issue never breaks the mining pipeline.
 */
export async function logAiUsage({
  userId,
  modelId,
  inputTokens,
  outputTokens,
  scraperId,
}: AiUsageInput): Promise<void> {
  try {
    const { db } = await import("@/lib/db");
    const { aiUsage } = await import("@/lib/db/schema");

    const costUsd = computeCostUsd(modelId, inputTokens, outputTokens);
    await db.insert(aiUsage).values({
      id: crypto.randomUUID(),
      userId,
      modelId,
      inputTokens,
      outputTokens,
      costUsd,
      scraperId: scraperId ?? null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("[logAiUsage] Failed to record AI usage:", err);
  }
}

// ---------------------------------------------------------------------------
// Pain point extraction
// ---------------------------------------------------------------------------
export interface PainPointData {
  title: string;
  body: string;
  painIntensity: number;
  urgency: number;
  monetizationScore: number;
  marketMaturity: number;
  budget: BudgetSignal[];
  switchingCosts?: string;
  triedSolutions: string[];
  sentiment: "frustrated" | "curious" | "desperate" | "neutral" | "angry";
  difficulty:
    | "weekend_project"
    | "side_project"
    | "startup_mvp"
    | "vc_scale_moat";
  url: string;
  author: string;
  subreddit: string;
}

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

export const extractPainPoints = async (
  post: {
    title: string;
    selftext: string;
    url: string;
    author: string;
    subreddit: string;
    comments: { body: string }[];
  },
  customPatterns: string[] = [],
  modelOverride?: string,
  /** Pass miningDepth so the correct model tier is selected automatically. */
  miningDepth?: MiningDepth,
  /** Pass userId + scraperId for cost logging. */
  usageContext?: { userId: string; scraperId?: string | null },
) => {
  const model = modelOverride
    ? modelOverride
    : miningDepth
      ? getModelForDepth(miningDepth)
      : DEFAULT_AI_MODEL;

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const customPatternsSection =
    customPatterns.length > 0
      ? `CUSTOM INTELLIGENCE PATTERNS TO MATCH:\n${customPatterns.map((pattern, index) => `${index + 1}. ${pattern}`).join("\n")}`
      : "";

  const systemPrompt = `You are a rigorous product researcher extracting SaaS opportunities from Reddit discussions.

Your job is to identify concrete user pain points, not to brainstorm startup ideas or inflate weak signals.

Rules:
- Be a "greedy" researcher. Your primary goal is to find any friction, dissatisfaction, or frustration mentioned in the text.
- Even if a problem seems small or currently unvalidated, extract it as an "emerging signal."
- Prioritize high-volume threads, but don't ignore unique complaints that reveal niche unmet needs.
- If a user mentions a struggle or a manual workaround, treat it as a SaaS opportunity.
- Aim to always extract at least one pain point if the thread contains any non-zero friction.
- Avoid duplicates. Merge overlapping complaints into one root pain point.
- Write concise, plain-English titles and summaries.

Scoring rubric:
- painIntensity:
  1-3 = mild annoyance, wishlist item, or convenience issue
  4-6 = meaningful workflow friction or repeated frustration
  7-8 = serious blocker causing lost time, money, or performance
  9-10 = business-critical or urgent operational failure
- urgency:
  1-3 = someday / exploratory
  4-6 = active frustration but not immediate
  7-8 = user is actively searching for relief now
  9-10 = immediate pain, escalation, or emergency language
- monetizationScore:
  1-3 = hobbyist / free-only / low willingness to pay
  4-6 = plausible willingness to pay, but indirect evidence
  7-8 = clear professional or commercial context
  9-10 = explicit budget, revenue impact, or high-value workflow
- marketMaturity:
  1-3 = little evidence of existing solutions
  4-6 = some solutions likely exist, but problem still feels open
  7-8 = established category with visible dissatisfaction
  9-10 = crowded market with many known alternatives
- difficulty:
  weekend_project = 1–2 days, no integrations, simple CRUD; e.g., a browser extension
  side_project = 1–2 weeks, 1–2 third-party integrations; e.g., a simple SaaS dashboard
  startup_mvp = 1–3 months, auth + billing + complex domain logic; e.g., an analytics platform
  vc_scale_moat = 6+ months, network effects, regulatory complexity (HIPAA, SOC2), data moat required

Field rules:
- title: 4-10 words, specific, no hype
- body: 2-4 sentences summarizing the root pain, who feels it, and why it matters
- budget: [] unless the thread contains an explicit willingness-to-pay quote such as "I would pay $50/month", "budget of $5k", "willing to spend $200", or "shut up and take my money"
- switchingCosts: empty string if not stated or strongly implied
- triedSolutions: specific tools, workarounds, or alternatives only; otherwise []
- sentiment: choose exactly one of frustrated, curious, desperate, neutral, angry
- budget[].quote must be the exact quote text from the post or a comment
- budget[].source must be exactly "post" or "comment"
- budget[].cadence must be one_time, monthly, annual, or unknown
- Do not create budget entries from vague commercial context or inferred willingness to pay

Return only valid JSON matching:
{
  "painPoints": [
    {
      "title": "string",
      "body": "string",
      "painIntensity": 1,
      "urgency": 1,
      "monetizationScore": 1,
      "marketMaturity": 1,
      "budget": [
        {
          "quote": "I'd pay $50/month for this.",
          "amountMinUsd": 50,
          "amountMaxUsd": 50,
          "cadence": "monthly",
          "annualizedMidpointUsd": 600,
          "source": "comment"
        }
      ],
      "switchingCosts": "",
      "triedSolutions": [],
      "sentiment": "frustrated",
      "difficulty": "side_project"
    }
  ]
}`;

  const topComments = post.comments
    .slice(0, 10)
    .map((comment, index) => `${index + 1}. ${comment.body}`)
    .join("\n");

  const userPrompt = `Analyze this Reddit thread and extract the strongest pain points.

Post title:
${post.title}

Post body:
${post.selftext || "(empty)"}

Subreddit:
r/${post.subreddit}

Top comments:
${topComments || "(no comments)"}

${customPatternsSection ? `${customPatternsSection}\n\n` : ""}Instructions:
- Extract ONLY the single most critical, root pain point (1 maximum).
- Prioritize pains with urgency, repeatability, and business value.
- Ignore generic complaints unless they reveal a concrete unmet need.
- Prefer the root cause over symptoms.
- Return JSON only.`;

  const baseUrl = str("OPENROUTER_BASE_URL", "https://openrouter.ai");

  try {
    const response = await fetch(
      `${baseUrl}/api/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "ThreddIQ - Reddit Intelligence Engine",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      },
    );

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}${details ? ` - ${details}` : ""}`,
      );
    }

    const data = await response.json();

    // Log AI usage for billing reconciliation (fire-and-forget)
    if (usageContext?.userId && data?.usage) {
      const inputTokens: number = data.usage.prompt_tokens ?? 0;
      const outputTokens: number = data.usage.completion_tokens ?? 0;
      void logAiUsage({
        userId: usageContext.userId,
        modelId: model as AiModelId,
        inputTokens,
        outputTokens,
        scraperId: usageContext.scraperId,
      });
    }

    const rawContent = extractMessageContent(
      data?.choices?.[0]?.message?.content,
    );
    const firstBrace = rawContent.indexOf("{");
    const lastBrace = rawContent.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in AI response");
    }

    const content = rawContent.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(content);

    interface RawPainPoint {
      title: string;
      body: string;
      painIntensity: number;
      urgency: number;
      monetizationScore: number;
      marketMaturity: number;
      budget?:
        | Array<{
            quote?: string;
            amountMinUsd?: number | null;
            amountMaxUsd?: number | null;
            cadence?: BudgetCadence;
            annualizedMidpointUsd?: number | null;
            source?: "post" | "comment";
          }>
        | string;
      switchingCosts?: string;
      triedSolutions?: string[];
      sentiment: "frustrated" | "curious" | "desperate" | "neutral" | "angry";
      difficulty:
        | "weekend_project"
        | "side_project"
        | "startup_mvp"
        | "vc_scale_moat";
    }

    const rawPainPoints: RawPainPoint[] = Array.isArray(parsed)
      ? parsed
      : parsed.painPoints || parsed.data || [parsed];

    return rawPainPoints.map((pp: RawPainPoint) => ({
      ...pp,
      budget: normalizeBudgetSignals(pp.budget),
      url: post.url,
      author: post.author,
      subreddit: post.subreddit,
      triedSolutions: pp.triedSolutions || [],
    })) as PainPointData[];
  } catch (error) {
    console.error("Error in AI extraction:", error);
    return [];
  }
};

// ---------------------------------------------------------------------------
// Competitor metadata resolution
// ---------------------------------------------------------------------------

/**
 * Uses AI to resolve metadata (description, official URL, category) for a tool by name.
 */
export async function resolveCompetitorMetadata(name: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { description: null, url: null, category: null };
  }

  const systemPrompt = `You are a market intelligence expert. 
Given a tool or company name, provide:
1. A concise (1-2 sentence) description of what they do.
2. Their official website URL (absolute URL).
3. A broad category for the tool (e.g., CRM, Analytics, Project Management, E-commerce, etc.).

Return ONLY valid JSON:
{
  "description": "string",
  "url": "string or null",
  "category": "string or null"
}`;

  const baseUrl = str("OPENROUTER_BASE_URL", "https://openrouter.ai");

  try {
    const response = await fetch(
      `${baseUrl}/api/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "ThreddIQ - Competitor Intel Engine",
        },
        body: JSON.stringify({
          model: DEFAULT_AI_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Tool name: "${name}"` },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) return { description: null, url: null, category: null };

    const data = await response.json();
    const rawContent = extractMessageContent(data?.choices?.[0]?.message?.content);
    const parsed = JSON.parse(rawContent);

    return {
      description: parsed.description || null,
      url: parsed.url || null,
      category: parsed.category || null,
    };
  } catch (err) {
    console.error(`AI metadata resolution failed for ${name}:`, err);
    return { description: null, url: null, category: null };
  }
}
