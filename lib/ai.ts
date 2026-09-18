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
  FREE: "google/gemini-2.0-flash-exp:free",
  GEMINI_FLASH: "google/gemini-2.5-flash",
  LLAMA_70B: "meta-llama/llama-3.3-70b-instruct:free",
  LLAMA_8B: "meta-llama/llama-3.1-8b-instruct:free",
  QWEN_72B: "qwen/qwen-2.5-72b-instruct:free",
  DEEPSEEK: "deepseek/deepseek-r1:free",
  GPT4O: "openai/gpt-4o",
  CLAUDE_SONNET: "anthropic/claude-3.5-sonnet",
} as const;

export type AiModelId = (typeof AI_MODELS)[keyof typeof AI_MODELS];

export const DEFAULT_AI_MODEL: AiModelId =
  (process.env.OPENROUTER_MODEL as AiModelId) || AI_MODELS.FREE;

/** Human-readable display label for each model, used in report metadata. */
export const AI_MODEL_LABELS: Record<AiModelId, string> = {
  [AI_MODELS.FREE]: "Gemini 2.0 Flash (Free)",
  [AI_MODELS.GEMINI_FLASH]: "Gemini 2.5 Flash",
  [AI_MODELS.LLAMA_70B]: "Llama 3.3 70B (Free)",
  [AI_MODELS.LLAMA_8B]: "Llama 3.1 8B (Free)",
  [AI_MODELS.QWEN_72B]: "Qwen 2.5 72B (Free)",
  [AI_MODELS.DEEPSEEK]: "DeepSeek R1 (Free)",
  [AI_MODELS.GPT4O]: "GPT-4o",
  [AI_MODELS.CLAUDE_SONNET]: "Claude 3.5 Sonnet",
};

// ---------------------------------------------------------------------------
// Per-model cost rates (USD per 1 token)
// ---------------------------------------------------------------------------
const MODEL_COST_RATES: Record<AiModelId, { input: number; output: number }> = {
  [AI_MODELS.FREE]: { input: 0, output: 0 },
  [AI_MODELS.GEMINI_FLASH]: { input: 0.0000001, output: 0.0000004 },
  [AI_MODELS.LLAMA_70B]: { input: 0, output: 0 },
  [AI_MODELS.LLAMA_8B]: { input: 0, output: 0 },
  [AI_MODELS.QWEN_72B]: { input: 0, output: 0 },
  [AI_MODELS.DEEPSEEK]: { input: 0, output: 0 },
  [AI_MODELS.GPT4O]: { input: 0.0000025, output: 0.00001 },
  [AI_MODELS.CLAUDE_SONNET]: { input: 0.000003, output: 0.000015 },
};

export const CURRENT_EXTRACTION_SCHEMA_VERSION = 2;

/**
 * Ordered fallback model cascade sorted from high capability down to fast/cheap free models.
 */
export const FREE_MODELS_POOL: AiModelId[] = [
  "google/gemini-2.0-flash-exp:free" as AiModelId,
  "meta-llama/llama-3.3-70b-instruct:free" as AiModelId,
  "qwen/qwen-2.5-72b-instruct:free" as AiModelId,
  "meta-llama/llama-3.1-8b-instruct:free" as AiModelId,
  "deepseek/deepseek-r1:free" as AiModelId,
  "mistralai/mistral-7b-instruct:free" as AiModelId,
  "microsoft/phi-3-medium-128k-instruct:free" as AiModelId,
];

/**
 * Builds an ordered fallback model chain starting from the primary model and descending
 * through alternative high-capacity and fast free models.
 */
export function getFallbackModelChain(
  primaryModel: string | AiModelId,
): (string | AiModelId)[] {
  const chain: (string | AiModelId)[] = [primaryModel];
  for (const fallback of FREE_MODELS_POOL) {
    if (!chain.includes(fallback)) {
      chain.push(fallback);
    }
  }
  return chain;
}

/**
 * Returns the canonical OpenRouter model ID to use for a given mining depth.
 * Can be overridden via explicit `modelOverride`.
 */
export function getModelForDepth(
  _depth: MiningDepth,
  modelOverride?: string,
): AiModelId {
  if (
    modelOverride &&
    Object.values(AI_MODELS).includes(modelOverride as AiModelId)
  ) {
    return modelOverride as AiModelId;
  }
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
  const rates = MODEL_COST_RATES[modelId] ?? MODEL_COST_RATES[AI_MODELS.FREE];
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
export const MIN_AI_CONFIDENCE_SCORE = 0.3;
export const STREAMING_LENGTH_THRESHOLD = 1500;

export const PROMPT_VERSIONS = {
  V1: "v1",
  V2: "v2",
} as const;

export type PromptVersion =
  (typeof PROMPT_VERSIONS)[keyof typeof PROMPT_VERSIONS];

export interface ExtractionOptions {
  promptVersion?: "v1" | "v2" | string;
  enableAbTest?: boolean;
  stream?: boolean;
}

export type WillingnessToPaySignal =
  | "free_only"
  | "paid_signal"
  | "explicit_budget"
  | "unknown";

export interface PainPointData {
  title: string;
  body: string;
  painIntensity: number;
  urgency: number;
  monetizationScore: number;
  marketMaturity: number;
  confidenceScore?: number;
  targetUser?: string;
  competingProducts?: string[];
  willingnessToPay?: WillingnessToPaySignal;
  featureRequested?: string;
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
  schemaVersion?: number;
  promptVersion?: string;
  rawResponse?: string;
  originalLanguage?: string;
}

export const EXTRACTION_SYSTEM_PROMPT_V1 = `You are a rigorous product researcher extracting SaaS opportunities from Reddit discussions.

Your job is to identify concrete user pain points, not to brainstorm startup ideas or inflate weak signals.

Rules:
- Be a "greedy" researcher. Your primary goal is to find any friction, dissatisfaction, or frustration mentioned in the text.
- Even if a problem seems small or currently unvalidated, extract it as an "emerging signal."
- Prioritize high-volume threads, but don't ignore unique complaints that reveal niche unmet needs.
- If a user mentions a struggle or a manual workaround, treat it as a SaaS opportunity.
- Aim to always extract at least one pain point if the thread contains any non-zero friction.
- Avoid duplicates. Merge overlapping complaints into one root pain point.
- Multi-language support: Detect the source thread's primary language and output originalLanguage (2-letter ISO 639-1 code such as 'en', 'es', 'de', 'fr', 'pt', 'ja', 'zh', 'it', 'nl', 'ru', etc.).
- Regardless of the input language, ALWAYS translate and write the extracted title, body, featureRequested, targetUser, and summaries in clear English.
- Write concise, plain-English titles and summaries.
- Calibration: Use the full 1-10 rating scale. When strong evidence is present (explicit budget quotes, severe hours lost, desperate search for alternatives), assign 9 or 10.

Scoring rubric:
- painIntensity:
  1-3 = mild annoyance, wishlist item, or convenience issue
  4-6 = meaningful workflow friction or repeated frustration
  7-8 = serious blocker causing lost time, money, or performance
  9-10 = severe operational bottleneck (>5 hrs/week lost, direct revenue loss, or risky manual workarounds where no good tool exists)
- urgency:
  1-3 = someday / exploratory
  4-6 = active frustration but not immediate
  7-8 = user is actively searching for relief now
  9-10 = immediate pain, active migration search right now, broken critical workflow, or explicit "take my money" sentiment
- monetizationScore:
  1-3 = hobbyist / free-only / low willingness to pay
  4-6 = plausible willingness to pay, but indirect evidence
  7-8 = clear professional or commercial context
  9-10 = explicit quoted budget ($/mo, $/yr), B2B enterprise buying intent, or active churn from an expensive incumbent
- marketMaturity:
  1-3 = little evidence of existing solutions (greenfield)
  4-6 = some solutions likely exist, but problem still feels open
  7-8 = established category with visible dissatisfaction
  9-10 = crowded market with many known alternatives
- difficulty:
  weekend_project = 1–2 days, no integrations, simple CRUD; e.g., a browser extension
  side_project = 1–2 weeks, 1–2 third-party integrations; e.g., a simple SaaS dashboard
  startup_mvp = 1–3 months, auth + billing + complex domain logic; e.g., an analytics platform
  vc_scale_moat = 6+ months, network effects, regulatory complexity (HIPAA, SOC2), data moat required
- confidenceScore:
  0.0-0.3 = vague, speculative, ambiguous complaint, or lacks concrete evidence
  0.4-0.6 = moderate confidence, clear struggle but limited context or edge case
  0.7-0.8 = high confidence, validated real-world workflow friction with clear evidence
  0.9-1.0 = very high confidence, unmistakable recurring business pain with explicit details
- targetUser:
  A concise label for the user persona or role experiencing this problem (e.g., "solo founder", "enterprise IT manager", "freelance designer", "early-stage CTO", "e-commerce merchant", "devops engineer", etc.)
- competingProducts:
  List of specific existing tools, competitors, or incumbent products mentioned in the post/comments (e.g., ["Notion", "Airtable", "Zapier"]). Empty array [] if none mentioned.
- willingnessToPay:
  free_only = user explicitly requests free/open-source tools or refuses to pay
  paid_signal = commercial context, business problem, or user expresses willingness to pay for a solution
  explicit_budget = explicit dollar quote or subscription budget mentioned
  unknown = no clear signal
- featureRequested:
  Concise 1-2 sentence description of the specific feature, automation, or capability the user is asking for. Empty string "" if no specific feature is requested.
- originalLanguage:
  2-letter ISO 639-1 code of the source post language (e.g., "en", "es", "de", "fr", "pt", "ja", "zh")

Field rules:
- title: 4-10 words in English, specific, no hype
- body: 2-4 sentences in English summarizing the root pain, who feels it, and why it matters
- targetUser: 2-5 words in English describing the persona experiencing this pain
- competingProducts: array of tool/competitor names or []
- willingnessToPay: choose exactly one of free_only, paid_signal, explicit_budget, unknown
- featureRequested: specific solution/feature requested or ""
- confidenceScore: float between 0.0 and 1.0 representing extraction confidence
- originalLanguage: 2-letter language code string (e.g. "en", "es", "fr", "de")
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
      "targetUser": "solo founder",
      "competingProducts": ["Zapier", "Make"],
      "willingnessToPay": "explicit_budget",
      "featureRequested": "Automated webhook retry with error alerts",
      "originalLanguage": "en",
      "confidenceScore": 0.95,
      "painIntensity": 9,
      "urgency": 9,
      "monetizationScore": 10,
      "marketMaturity": 7,
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
      "triedSolutions": ["Zapier"],
      "sentiment": "desperate",
      "difficulty": "side_project"
    }
  ]
}`;

export const EXTRACTION_SYSTEM_PROMPT_V2 = `You are a high-precision SaaS market intelligence researcher specializing in B2B pain point discovery.

Your mission: Isolate verified commercial friction, high-value workflow blockages, and explicit user willingness to pay from Reddit conversations across any language.

Core Extraction Directives:
1. Root-Cause Focus: Dig past surface complaints down to the root bottleneck, lost productivity, or financial waste.
2. Multi-Language Intelligence: Detect the source language, store originalLanguage as a 2-letter ISO code (e.g., "en", "es", "de", "fr", "pt", "ja", "zh"), and ALWAYS output all fields in English.
3. Persona & Market Clues: Identify the exact persona/role and any competing incumbent tools or painful workarounds mentioned.
4. Commercial Intent: Flag explicit budget quotes, subscription fatigue, or commercial desire as high monetization signals.
5. Actionable & Zero-Fluff: Generate clear, descriptive pain titles and concise structured summaries in English.
6. Calibrated Full-Scale Scoring: Use the full 1-10 spectrum. Assign 9-10 when strong empirical evidence (budget quote, severe time loss, desperate active search) is present.

Scoring Rubric:
- painIntensity (1-10): 1-3 minor nuisance, 4-6 repeated friction, 7-8 severe bottleneck, 9-10 critical operational/revenue blocker (>5h/wk lost or manual hazard).
- urgency (1-10): 1-3 exploratory, 4-6 passive need, 7-8 actively seeking solution, 9-10 immediate active search right now, broken workflow, or price-hike churn.
- monetizationScore (1-10): 1-3 hobbyist/free, 4-6 indirect commercial context, 7-8 clear SaaS willingness to pay, 9-10 explicit quoted budget or high B2B revenue workflow.
- marketMaturity (1-10): 1-3 greenfield/unmet, 4-6 emerging, 7-8 fragmented competition, 9-10 saturated with high switching resistance.
- difficulty: weekend_project (1-2 days, simple CRUD/extension), side_project (1-2 weeks, 1-2 APIs), startup_mvp (1-3 months, full SaaS logic), vc_scale_moat (6+ months, regulatory/data moat).
- confidenceScore (0.0-1.0): 0.0-0.3 speculative/ambiguous, 0.4-0.6 moderate evidence, 0.7-0.8 validated friction, 0.9-1.0 unequivocal high-fidelity pain with proof.

Field Specifications:
- title: 4-10 words in English, specific, objective
- body: 2-4 sentences in English explaining root friction, user impact, and commercial opportunity
- targetUser: 2-5 words persona in English (e.g. "DevOps Lead", "Solo Founder", "E-commerce Agency")
- competingProducts: string[] of named incumbent tools or []
- willingnessToPay: "free_only" | "paid_signal" | "explicit_budget" | "unknown"
- featureRequested: specific requested capability in English or ""
- originalLanguage: 2-letter ISO code of source text (e.g. "en", "es", "de", "fr", "pt")
- budget: [] unless explicit pricing quotes are present (quote, amountMinUsd, amountMaxUsd, cadence, annualizedMidpointUsd, source)
- switchingCosts: string context if migration or legacy lock-in is mentioned
- triedSolutions: string[] of past attempts or workarounds
- sentiment: "frustrated" | "curious" | "desperate" | "neutral" | "angry"

Return JSON format strictly:
{
  "painPoints": [
    {
      "title": "string",
      "body": "string",
      "targetUser": "solo founder",
      "competingProducts": ["Zapier"],
      "willingnessToPay": "explicit_budget",
      "featureRequested": "Webhook automatic failover retry",
      "originalLanguage": "en",
      "confidenceScore": 0.92,
      "painIntensity": 9,
      "urgency": 9,
      "monetizationScore": 10,
      "marketMaturity": 7,
      "budget": [
        {
          "quote": "Paying $200/mo to Zapier and it still drops hooks.",
          "amountMinUsd": 200,
          "amountMaxUsd": 200,
          "cadence": "monthly",
          "annualizedMidpointUsd": 2400,
          "source": "post"
        }
      ],
      "switchingCosts": "",
      "triedSolutions": ["Zapier"],
      "sentiment": "desperate",
      "difficulty": "side_project"
    }
  ]
}`;

export function resolveExtractionPrompt(options?: {
  promptVersion?: string;
  enableAbTest?: boolean;
}): { systemPrompt: string; promptVersion: string } {
  if (options?.promptVersion) {
    const version = options.promptVersion.toLowerCase();
    if (version === "v2") {
      return {
        systemPrompt: EXTRACTION_SYSTEM_PROMPT_V2,
        promptVersion: "v2",
      };
    }
    return {
      systemPrompt: EXTRACTION_SYSTEM_PROMPT_V1,
      promptVersion: "v1",
    };
  }

  if (options?.enableAbTest) {
    const isV2 = Math.random() < 0.5;
    const promptVersion = isV2 ? "v2" : "v1";
    const systemPrompt = isV2
      ? EXTRACTION_SYSTEM_PROMPT_V2
      : EXTRACTION_SYSTEM_PROMPT_V1;
    return { systemPrompt, promptVersion };
  }

  return { systemPrompt: EXTRACTION_SYSTEM_PROMPT_V1, promptVersion: "v1" };
}

/**
 * Consumes OpenRouter SSE stream chunks and aggregates final response text and token usage.
 */
export async function consumeOpenRouterStream(response: Response): Promise<{
  content: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}> {
  if (!response.body || typeof response.body.getReader !== "function") {
    if (typeof (response as any).json === "function") {
      try {
        const json = await (response as any).json();
        const content = extractMessageContent(
          json?.choices?.[0]?.message?.content ||
            json?.choices?.[0]?.delta?.content ||
            "",
        );
        return { content, usage: json?.usage };
      } catch {
        return { content: "" };
      }
    }
    return { content: "" };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullContent = "";
  let usage: { prompt_tokens?: number; completion_tokens?: number } | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const dataStr = trimmed.replace(/^data:\s*/, "");
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          const deltaContent = parsed.choices?.[0]?.delta?.content;
          if (deltaContent) {
            fullContent += deltaContent;
          }
          if (parsed.usage) {
            usage = parsed.usage;
          }
        } catch {
          // Ignore incomplete chunk
        }
      }
    }

    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith("data:")) {
        const dataStr = trimmed.replace(/^data:\s*/, "");
        if (dataStr !== "[DONE]") {
          try {
            const parsed = JSON.parse(dataStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              fullContent += deltaContent;
            }
            if (parsed.usage) {
              usage = parsed.usage;
            }
          } catch {
            // Ignore
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { content: fullContent, usage };
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

export interface PostWithComments {
  title: string;
  selftext: string;
  url: string;
  author: string;
  subreddit: string;
  comments: { body: string }[];
}

export const extractPainPoints = async (
  post: PostWithComments,
  customPatterns: string[] = [],
  modelOverride?: string,
  /** Pass miningDepth so the correct model tier is selected automatically. */
  miningDepth?: MiningDepth,
  /** Pass userId + scraperId for cost logging. */
  usageContext?: { userId: string; scraperId?: string | null },
  /** Pass user's BYOK OpenRouter API key if configured. */
  customApiKey?: string | null,
  /** Pass additional extraction options such as prompt versioning, A/B test flag, or explicit streaming. */
  options?: ExtractionOptions,
) => {
  const model = modelOverride
    ? modelOverride
    : miningDepth
      ? getModelForDepth(miningDepth)
      : DEFAULT_AI_MODEL;

  const apiKey = customApiKey?.trim() || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const resolvedPrompt = resolveExtractionPrompt(options);
  const systemPrompt = resolvedPrompt.systemPrompt;

  const customPatternsSection =
    customPatterns.length > 0
      ? `CUSTOM INTELLIGENCE PATTERNS TO MATCH:\n${customPatterns.map((pattern, index) => `${index + 1}. ${pattern}`).join("\n")}`
      : "";

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

  const totalTextLength =
    (post.title || "").length +
    (post.selftext || "").length +
    (post.comments || []).reduce(
      (acc, c) => acc + (c.body || "").length,
      0,
    );
  const shouldStream =
    options?.stream ?? totalTextLength > STREAMING_LENGTH_THRESHOLD;

  const baseUrl = str("OPENROUTER_BASE_URL", "https://openrouter.ai");

  try {
    let rawContent = "";
    let usageData: { prompt_tokens?: number; completion_tokens?: number } | undefined;
    let activeModel: string | AiModelId = model;
    const modelChain = getFallbackModelChain(model);

    for (const candidateModel of modelChain) {
      activeModel = candidateModel;
      try {
        const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "ThreddIQ - Reddit Intelligence Engine",
          },
          body: JSON.stringify({
            model: activeModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            ...(shouldStream ? { stream: true } : {}),
          }),
        });

        if (response.ok) {
          if (
            shouldStream &&
            response.body &&
            typeof response.body.getReader === "function"
          ) {
            const streamRes = await consumeOpenRouterStream(response);
            if (streamRes.content) {
              rawContent = streamRes.content;
              usageData = streamRes.usage;
              break;
            }
          } else {
            const resJson = await response.json();
            const extracted = extractMessageContent(
              resJson?.choices?.[0]?.message?.content,
            );
            if (extracted) {
              rawContent = extracted;
              usageData = resJson?.usage;
              break;
            }
          }
        } else {
          console.warn(
            `[AI] Model ${candidateModel} failed with status ${response.status}. Retrying with next in fallback chain...`,
          );
        }
      } catch (reqErr) {
        console.warn(
          `[AI] Model ${candidateModel} request error. Retrying with next in fallback chain...`,
          reqErr,
        );
      }
    }

    if (!rawContent) {
      throw new Error(
        "All models in fallback chain failed to produce a valid response",
      );
    }

    // Log AI usage for billing reconciliation (fire-and-forget)
    if (usageContext?.userId && usageData) {
      const inputTokens: number = usageData.prompt_tokens ?? 0;
      const outputTokens: number = usageData.completion_tokens ?? 0;
      void logAiUsage({
        userId: usageContext.userId,
        modelId: activeModel as AiModelId,
        inputTokens,
        outputTokens,
        scraperId: usageContext.scraperId,
      });
    }

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
      confidenceScore?: number | null;
      targetUser?: string | null;
      competingProducts?: string[] | null;
      willingnessToPay?: WillingnessToPaySignal | string | null;
      featureRequested?: string | null;
      originalLanguage?: string | null;
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

    const rawResponsePreview = rawContent.slice(0, 10000);

    return rawPainPoints
      .map((pp: RawPainPoint) => {
        const rawConf =
          typeof pp.confidenceScore === "number" && !isNaN(pp.confidenceScore)
            ? pp.confidenceScore
            : 0.7;
        const confidenceScore = Number(
          Math.max(0, Math.min(1, rawConf)).toFixed(2),
        );

        const targetUser =
          typeof pp.targetUser === "string" && pp.targetUser.trim().length > 0
            ? pp.targetUser.trim()
            : undefined;

        const competingProducts = Array.isArray(pp.competingProducts)
          ? pp.competingProducts
              .filter(
                (p): p is string =>
                  typeof p === "string" && p.trim().length > 0,
              )
              .map((p) => p.trim())
          : [];

        const rawWtp =
          typeof pp.willingnessToPay === "string"
            ? pp.willingnessToPay.trim().toLowerCase()
            : "";
        const validWtpList: WillingnessToPaySignal[] = [
          "free_only",
          "paid_signal",
          "explicit_budget",
          "unknown",
        ];
        const willingnessToPay: WillingnessToPaySignal = validWtpList.includes(
          rawWtp as WillingnessToPaySignal,
        )
          ? (rawWtp as WillingnessToPaySignal)
          : pp.budget && Array.isArray(pp.budget) && pp.budget.length > 0
            ? "explicit_budget"
            : "unknown";

        const featureRequested =
          typeof pp.featureRequested === "string" &&
          pp.featureRequested.trim().length > 0
            ? pp.featureRequested.trim()
            : undefined;

        const rawLang =
          typeof pp.originalLanguage === "string"
            ? pp.originalLanguage.trim().toLowerCase().slice(0, 5)
            : "en";
        const originalLanguage = rawLang || "en";

        return {
          ...pp,
          confidenceScore,
          targetUser,
          competingProducts,
          willingnessToPay,
          featureRequested,
          originalLanguage,
          budget: normalizeBudgetSignals(pp.budget),
          url: post.url,
          author: post.author,
          subreddit: post.subreddit,
          triedSolutions: pp.triedSolutions || [],
          schemaVersion: CURRENT_EXTRACTION_SCHEMA_VERSION,
          promptVersion: resolvedPrompt.promptVersion,
          rawResponse: rawResponsePreview,
        };
      })
      .filter(
        (pp) => (pp.confidenceScore ?? 0.7) >= MIN_AI_CONFIDENCE_SCORE,
      ) as PainPointData[];
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      console.error("Error in AI extraction:", error);
      return [];
    }

    console.warn(
      "[AI] OpenRouter API rate limit or credit ceiling reached. Using local heuristic NLP extraction...",
    );
    return extractPainPointsLocally(post);
  }
};

/**
 * Batches multiple posts into a single OpenRouter AI request to reduce API call overhead and latency.
 */
export const extractPainPointsBatch = async (
  posts: PostWithComments[],
  customPatterns: string[] = [],
  modelOverride?: string,
  miningDepth?: MiningDepth,
  usageContext?: { userId: string; scraperId?: string | null },
  customApiKey?: string | null,
  options?: ExtractionOptions,
): Promise<PainPointData[]> => {
  if (!posts || posts.length === 0) return [];
  if (posts.length === 1) {
    return extractPainPoints(
      posts[0],
      customPatterns,
      modelOverride,
      miningDepth,
      usageContext,
      customApiKey,
      options,
    );
  }

  const model = modelOverride
    ? modelOverride
    : miningDepth
      ? getModelForDepth(miningDepth)
      : DEFAULT_AI_MODEL;

  const apiKey = customApiKey?.trim() || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const resolvedPrompt = resolveExtractionPrompt(options);

  const customPatternsSection =
    customPatterns.length > 0
      ? `CUSTOM INTELLIGENCE PATTERNS TO MATCH:\n${customPatterns.map((pattern, index) => `${index + 1}. ${pattern}`).join("\n")}`
      : "";

  const systemPrompt = `You are a rigorous product researcher extracting SaaS opportunities from multiple Reddit discussions in batch.

Your job is to identify concrete user pain points for each provided thread across any language.

Scoring & schema rules:
- Extract up to 1 critical pain point per thread.
- Calibration: Use the full 1-10 rating scale. When strong evidence is present (explicit budget quotes, severe hours lost, desperate search for alternatives), assign 9 or 10.
- Multi-language intelligence: detect originalLanguage (2-letter ISO 639-1 code e.g. "en", "es", "de", "fr", "pt", "ja", "zh") and ALWAYS write all fields (title, body, featureRequested, targetUser) in English.
- Return JSON strictly formatted with an "extractions" array containing objects with:
  "threadIndex": number (0-based matching input order),
  "painPoints": array of pain point objects.

Fields for each pain point:
- title: 4-10 words in English, specific, no hype
- body: 2-4 sentences in English summarizing root pain, who feels it, and why it matters
- targetUser: 2-5 words persona in English (e.g. "solo founder", "e-commerce merchant")
- competingProducts: string[] of named competitors/tools
- willingnessToPay: "free_only" | "paid_signal" | "explicit_budget" | "unknown"
- featureRequested: string specific requested feature in English or ""
- originalLanguage: 2-letter language code string (e.g. "en", "es", "de", "fr")
- confidenceScore: float 0.0 to 1.0
- painIntensity: 1-10 (9-10 for severe >5h/wk or revenue blockers)
- urgency: 1-10 (9-10 for active immediate search or churn)
- monetizationScore: 1-10 (9-10 for explicit quoted budget or high B2B value)
- marketMaturity: 1-10
- sentiment: "frustrated" | "curious" | "desperate" | "neutral" | "angry"
- difficulty: "weekend_project" | "side_project" | "startup_mvp" | "vc_scale_moat"
- triedSolutions: string[]
- budget: array of { quote, amountMinUsd, amountMaxUsd, cadence, annualizedMidpointUsd, source }

Return JSON only:
{
  "extractions": [
    {
      "threadIndex": 0,
      "painPoints": [
        {
          "title": "Automated Inventory Sync Failing",
          "body": "Shopify merchants lose hours manually re-keying inventory counts.",
          "targetUser": "Shopify Merchant",
          "competingProducts": ["InventoryPlanner"],
          "willingnessToPay": "explicit_budget",
          "featureRequested": "Real-time webhook sync to warehouse",
          "originalLanguage": "en",
          "confidenceScore": 0.92,
          "painIntensity": 9,
          "urgency": 9,
          "monetizationScore": 10,
          "marketMaturity": 7,
          "sentiment": "desperate",
          "difficulty": "startup_mvp",
          "triedSolutions": ["InventoryPlanner"],
          "budget": [
            {
              "quote": "Paying $300/mo and still having sync errors.",
              "amountMinUsd": 300,
              "amountMaxUsd": 300,
              "cadence": "monthly",
              "annualizedMidpointUsd": 3600,
              "source": "post"
            }
          ]
        }
      ]
    }
  ]
}`;

  const threadsText = posts
    .map((post, idx) => {
      const topComments = (post.comments || [])
        .slice(0, 5)
        .map((c, cIdx) => `  ${cIdx + 1}. ${c.body}`)
        .join("\n");

      return `=== THREAD [INDEX: ${idx}] ===
Subreddit: r/${post.subreddit}
Title: ${post.title}
Body: ${post.selftext || "(empty)"}
Comments:
${topComments || "  (no comments)"}`;
    })
    .join("\n\n");

  const userPrompt = `Analyze the following ${posts.length} Reddit threads and extract pain points for each:\n\n${threadsText}\n\n${customPatternsSection ? `${customPatternsSection}\n\n` : ""}Return JSON with "extractions" array.`;

  const totalLength = threadsText.length;
  const shouldStream = options?.stream ?? totalLength > STREAMING_LENGTH_THRESHOLD;

  const baseUrl = str("OPENROUTER_BASE_URL", "https://openrouter.ai");

  try {
    let rawContent = "";
    let usageData: { prompt_tokens?: number; completion_tokens?: number } | undefined;
    let activeModel: string | AiModelId = model;
    const modelChain = getFallbackModelChain(model);

    for (const candidateModel of modelChain) {
      activeModel = candidateModel;
      try {
        const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "ThreddIQ - Reddit Intelligence Engine (Batch)",
          },
          body: JSON.stringify({
            model: activeModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            ...(shouldStream ? { stream: true } : {}),
          }),
        });

        if (response.ok) {
          if (
            shouldStream &&
            response.body &&
            typeof response.body.getReader === "function"
          ) {
            const streamRes = await consumeOpenRouterStream(response);
            if (streamRes.content) {
              rawContent = streamRes.content;
              usageData = streamRes.usage;
              break;
            }
          } else {
            const resJson = await response.json();
            const extracted = extractMessageContent(
              resJson?.choices?.[0]?.message?.content,
            );
            if (extracted) {
              rawContent = extracted;
              usageData = resJson?.usage;
              break;
            }
          }
        } else {
          console.warn(
            `[AI Batch] Model ${candidateModel} failed with status ${response.status}. Retrying with next in fallback chain...`,
          );
        }
      } catch (reqErr) {
        console.warn(
          `[AI Batch] Model ${candidateModel} request error. Retrying with next in fallback chain...`,
          reqErr,
        );
      }
    }

    if (!rawContent) {
      throw new Error(
        "All models in fallback chain failed to produce a valid batch response",
      );
    }

    if (usageContext?.userId && usageData) {
      const inputTokens: number = usageData.prompt_tokens ?? 0;
      const outputTokens: number = usageData.completion_tokens ?? 0;
      void logAiUsage({
        userId: usageContext.userId,
        modelId: activeModel as AiModelId,
        inputTokens,
        outputTokens,
        scraperId: usageContext.scraperId,
      });
    }

    const firstBrace = rawContent.indexOf("{");
    const lastBrace = rawContent.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in batch AI response");
    }

    const content = rawContent.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(content);
    const rawResponsePreview = rawContent.slice(0, 10000);

    const allExtracted: PainPointData[] = [];

    // Parse extractions array or fallback formats
    const extractionsList = Array.isArray(parsed.extractions)
      ? parsed.extractions
      : Array.isArray(parsed)
        ? parsed
        : parsed.painPoints
          ? [{ threadIndex: 0, painPoints: parsed.painPoints }]
          : [];

    for (let i = 0; i < extractionsList.length; i++) {
      const item = extractionsList[i];
      const threadIndex =
        typeof item.threadIndex === "number" && item.threadIndex < posts.length
          ? item.threadIndex
          : i < posts.length
            ? i
            : 0;

      const post = posts[threadIndex];
      const rawPoints = Array.isArray(item.painPoints)
        ? item.painPoints
        : Array.isArray(item)
          ? item
          : [item];

      for (const pp of rawPoints) {
        if (!pp || typeof pp !== "object" || !pp.title) continue;

        const rawConf =
          typeof pp.confidenceScore === "number" && !isNaN(pp.confidenceScore)
            ? pp.confidenceScore
            : 0.7;
        const confidenceScore = Number(
          Math.max(0, Math.min(1, rawConf)).toFixed(2),
        );
        if (confidenceScore < MIN_AI_CONFIDENCE_SCORE) continue;

        const targetUser =
          typeof pp.targetUser === "string" && pp.targetUser.trim().length > 0
            ? pp.targetUser.trim()
            : undefined;

        const competingProducts = Array.isArray(pp.competingProducts)
          ? pp.competingProducts
              .filter(
                (p: unknown): p is string =>
                  typeof p === "string" && p.trim().length > 0,
              )
              .map((p: string) => p.trim())
          : [];

        const rawWtp =
          typeof pp.willingnessToPay === "string"
            ? pp.willingnessToPay.trim().toLowerCase()
            : "";
        const validWtpList: WillingnessToPaySignal[] = [
          "free_only",
          "paid_signal",
          "explicit_budget",
          "unknown",
        ];
        const willingnessToPay: WillingnessToPaySignal = validWtpList.includes(
          rawWtp as WillingnessToPaySignal,
        )
          ? (rawWtp as WillingnessToPaySignal)
          : "unknown";

        const featureRequested =
          typeof pp.featureRequested === "string" &&
          pp.featureRequested.trim().length > 0
            ? pp.featureRequested.trim()
            : undefined;

        const rawLang =
          typeof pp.originalLanguage === "string"
            ? pp.originalLanguage.trim().toLowerCase().slice(0, 5)
            : "en";
        const originalLanguage = rawLang || "en";

        allExtracted.push({
          title: pp.title,
          body: pp.body || post.title,
          painIntensity: pp.painIntensity || 5,
          urgency: pp.urgency || 5,
          monetizationScore: pp.monetizationScore || 5,
          marketMaturity: pp.marketMaturity || 5,
          confidenceScore,
          targetUser,
          competingProducts,
          willingnessToPay,
          featureRequested,
          originalLanguage,
          budget: normalizeBudgetSignals(pp.budget),
          url: post.url,
          author: post.author,
          subreddit: post.subreddit,
          triedSolutions: pp.triedSolutions || [],
          sentiment: pp.sentiment || "frustrated",
          difficulty: pp.difficulty || "side_project",
          schemaVersion: CURRENT_EXTRACTION_SCHEMA_VERSION,
          promptVersion: resolvedPrompt.promptVersion,
          rawResponse: rawResponsePreview,
        });
      }
    }

    return allExtracted;
  } catch (err) {
    if (process.env.NODE_ENV === "test") {
      console.error("Batch AI extraction fallback triggered:", err);
    }
    // Gracefully fallback to individual extractions
    const fallbackResults = await Promise.all(
      posts.map((p) =>
        extractPainPoints(
          p,
          customPatterns,
          modelOverride,
          miningDepth,
          usageContext,
          customApiKey,
          options,
        ).catch(() => []),
      ),
    );
    return fallbackResults.flat();
  }
};

function detectTextLanguage(text: string): string {
  const lower = text.toLowerCase();
  if (
    /\b(el|la|los|las|un|una|es|por|para|con|pero|porque|como|este|esta|todo|hacer|tengo|quiero)\b/.test(
      lower,
    )
  ) {
    return "es";
  }
  if (
    /\b(der|die|das|und|ist|nicht|mit|für|auf|eine|einen|einem|wir|ich|habe|kann|aber)\b/.test(
      lower,
    )
  ) {
    return "de";
  }
  if (
    /\b(le|la|les|un|une|des|est|pour|avec|dans|mais|nous|vous|faire|cette|tout)\b/.test(
      lower,
    )
  ) {
    return "fr";
  }
  if (
    /\b(o|a|os|as|um|uma|com|para|por|mas|porque|como|tenho|fazer|isso)\b/.test(
      lower,
    )
  ) {
    return "pt";
  }
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(lower)) {
    return /[\u3040-\u30ff]/.test(lower) ? "ja" : "zh";
  }
  return "en";
}

/**
 * Local heuristic NLP pain point extractor for offline / free-tier rate-limited fallback.
 */
function extractPainPointsLocally(post: PostWithComments): PainPointData[] {
  const fullText = `${post.title}\n${post.selftext || ""}`;
  const lower = fullText.toLowerCase();
  const detectedLang = detectTextLanguage(fullText);

  let sentiment: "frustrated" | "curious" | "desperate" | "neutral" | "angry" =
    "frustrated";
  if (
    lower.includes("desperate") ||
    lower.includes("willing to pay") ||
    lower.includes("need this now")
  )
    sentiment = "desperate";
  else if (
    lower.includes("hate") ||
    lower.includes("broken") ||
    lower.includes("terrible") ||
    lower.includes("awful")
  )
    sentiment = "angry";
  else if (
    lower.includes("how to") ||
    lower.includes("curious") ||
    lower.includes("wondering")
  )
    sentiment = "curious";

  let willingnessToPay: WillingnessToPaySignal = "unknown";
  if (
    lower.includes("free") ||
    lower.includes("open source") ||
    lower.includes("cheap")
  )
    willingnessToPay = "free_only";
  if (
    lower.includes("pay") ||
    lower.includes("pricing") ||
    lower.includes("tier") ||
    lower.includes("budget") ||
    lower.includes("cost") ||
    lower.includes("subscription")
  )
    willingnessToPay = "paid_signal";

  let targetUser = "Founder & Operator";
  if (post.subreddit.toLowerCase().includes("sales"))
    targetUser = "Sales & Outreach Lead";
  else if (post.subreddit.toLowerCase().includes("marketing"))
    targetUser = "Growth Marketer";
  else if (
    post.subreddit.toLowerCase().includes("webdev") ||
    post.subreddit.toLowerCase().includes("react")
  )
    targetUser = "Software Engineer";
  else if (post.subreddit.toLowerCase().includes("ecommerce"))
    targetUser = "Store Owner";
  else if (post.subreddit.toLowerCase().includes("smallbusiness"))
    targetUser = "Small Business Owner";

  const painTitle =
    post.title.length > 80 ? post.title.slice(0, 77) + "..." : post.title;
  const painBody =
    post.selftext && post.selftext.trim().length > 30
      ? post.selftext.slice(0, 300)
      : `Discussions in r/${post.subreddit} reveal recurring friction around "${post.title}", with users actively searching for simpler and more automated alternatives.`;

  const isHighAcuity = sentiment === "desperate" || sentiment === "angry";
  const painIntensity = isHighAcuity
    ? willingnessToPay === "paid_signal"
      ? 9
      : 8
    : sentiment === "frustrated"
      ? 6
      : 4;
  const urgency = isHighAcuity ? 9 : sentiment === "frustrated" ? 6 : 4;
  const monetizationScore =
    willingnessToPay === "paid_signal" ? (isHighAcuity ? 9 : 7) : 3;
  const confidenceScore = isHighAcuity ? 0.9 : 0.82;

  return [
    {
      title: painTitle,
      body: painBody,
      targetUser,
      competingProducts: [],
      willingnessToPay,
      featureRequested: "Automated workflow tool to solve this bottleneck",
      originalLanguage: detectedLang,
      confidenceScore,
      painIntensity,
      urgency,
      monetizationScore,
      marketMaturity: 4,
      budget: [],
      switchingCosts: "",
      triedSolutions: [],
      sentiment,
      difficulty: "side_project",
      url: post.url,
      author: post.author,
      subreddit: post.subreddit,
      schemaVersion: CURRENT_EXTRACTION_SCHEMA_VERSION,
      promptVersion: "local_heuristic",
      rawResponse: "local_heuristic_nlp_extraction",
    },
  ];
}

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
    const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
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
    });

    if (!response.ok) return { description: null, url: null, category: null };

    const data = await response.json();
    const rawContent = extractMessageContent(
      data?.choices?.[0]?.message?.content,
    );
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
