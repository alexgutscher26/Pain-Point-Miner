export interface PainPointData {
  title: string;
  body: string;
  painIntensity: number;
  urgency: number;
  monetizationScore: number;
  marketMaturity: number;
  budget?: string;
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
) => {
  const model = "google/gemini-2.0-flash-001";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const customPatternsSection =
    customPatterns.length > 0
      ? `\n    CUSTOM INTELLIGENCE PATTERNS TO MATCH:
    ${customPatterns.map((p, i) => `${i + 1}. **${p}**`).join("\n    ")}\n`
      : "";

  const prompt = `
    You are a world-class Venture Capitalist and Product Researcher. 
    Analyze the following Reddit post and its associated comments to extract high-value business opportunities.
    
    CRITICAL SIGNALS TO DETECT:
    1. **Pain Intensity (1-10)**: 1=Feature request, 10=Business-breaking crisis.
    2. **Urgency (1-10)**: 1=Someday, 10=I need this fixed immediately.
    3. **Monetization Score (1-10)**: 
       - 10: Explicit budget, professional context, "this costs me $X/hour".
       - 1: Hobbyist, "looking for free", just Venting.
    4. **Market Maturity (1-10)**: 
       - 1: No tools exist yet ("Blue Ocean").
       - 10: Saturated market where users are unhappy with current giants ("Red Ocean disruption").
    ${customPatternsSection}
    Post Title: ${post.title}
    Post Content: ${post.selftext}
    Subreddit: r/${post.subreddit}

    Top Comments for context:
    ${post.comments
      .slice(0, 10)
      .map((c) => `- ${c.body}`)
      .join("\n")}

    Format the output as a JSON object with a 'painPoints' array. Each object MUST have: 
    - title (concise headline)
    - body (deep summary)
    - painIntensity (1-10)
    - urgency (1-10)
    - monetizationScore (1-10)
    - marketMaturity (1-10)
    - budget (string)
    - switchingCosts (string)
    - triedSolutions (array of specific strings)
    - sentiment (one of: frustrated, curious, desperate, neutral, angry)

    IMPORTANT: Return ONLY valid JSON output. Be extremely critical—do not over-inflate scores.
  `;

  try {
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
          model: model,
          messages: [{ role: "user", content: prompt }],
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
    const content = extractMessageContent(data?.choices?.[0]?.message?.content)
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const parsed = JSON.parse(content);

    interface RawPainPoint {
      title: string;
      body: string;
      painIntensity: number;
      urgency: number;
      monetizationScore: number;
      marketMaturity: number;
      budget?: string;
      switchingCosts?: string;
      triedSolutions?: string[];
      sentiment: "frustrated" | "curious" | "desperate" | "neutral" | "angry";
    }

    // Normalize if needed (some models wrap it in a root object)
    const rawPainPoints: RawPainPoint[] = Array.isArray(parsed)
      ? parsed
      : parsed.painPoints || parsed.data || [parsed];

    return rawPainPoints.map((pp: RawPainPoint) => ({
      ...pp,
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
