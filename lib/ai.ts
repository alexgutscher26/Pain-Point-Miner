import {
  normalizeBudgetSignals,
  type BudgetSignal,
  type BudgetCadence,
} from "@/lib/budget-signals";

export const AI_MODELS = {
  GEMINI_FLASH: "google/gemini-2.0-flash-001",
  CLAUDE_SONNET: "anthropic/claude-3.5-sonnet",
  GPT4O: "openai/gpt-4o",
} as const;

export const DEFAULT_AI_MODEL = AI_MODELS.CLAUDE_SONNET;

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
) => {
  const model = modelOverride || DEFAULT_AI_MODEL;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const customPatternsSection =
    customPatterns.length > 0
      ? `CUSTOM INTELLIGENCE PATTERNS TO MATCH:
${customPatterns.map((pattern, index) => `${index + 1}. ${pattern}`).join("\n")}`
      : "";

  const systemPrompt = `You are a rigorous product researcher extracting SaaS opportunities from Reddit discussions.

Your job is to identify concrete user pain points, not to brainstorm startup ideas or inflate weak signals.

Rules:
- Be skeptical. Prefer under-scoring over over-scoring.
- Use only evidence from the post and comments. Do not invent facts, budgets, or intent.
- Focus on the underlying problem, not superficial feature requests.
- Only extract pain points that appear actionable, recurring, or costly enough to matter.
- If the thread is vague, off-topic, celebratory, or lacks a real problem, return an empty painPoints array.
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
      "sentiment": "frustrated"
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
- Extract up to 3 distinct pain points.
- Prioritize pains with urgency, repeatability, and business value.
- Ignore generic complaints unless they reveal a concrete unmet need.
- Prefer the root cause over symptoms.
- Return JSON only.`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
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
    const rawContent = extractMessageContent(data?.choices?.[0]?.message?.content);
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
