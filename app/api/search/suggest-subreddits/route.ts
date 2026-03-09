
import { apiJson } from "@/lib/api-error";
import { requireApiContext } from "@/lib/api-auth";
import { z } from "zod";

const suggestPayloadSchema = z.object({
  keyword: z.string().trim().min(3).max(120),
  locale: z.string().trim().max(80).optional().default("United States"),
  count: z.number().int().min(1).max(15).optional().default(5),
});

const subredditNameSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^r\//i, "").replace(/[^\w]/g, "").toLowerCase())
  .pipe(z.string().regex(/^[a-z0-9_]{2,21}$/));

export async function POST(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId } = authContext.context;

  try {
    const payload = await req.json().catch(() => null);
    const parsedPayload = suggestPayloadSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return apiJson({ subreddits: [] }, 200, correlationId);
    }
    const { keyword, locale, count } = parsedPayload.data;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const prompt = `You are a Reddit growth expert. Suggest ${count} highly active and relevant subreddits for the niche: "${keyword}" for users in ${locale}. 
    Focus on communities where users post frustration, questions, and seek solutions.
    Return ONLY a JSON array of strings (the subreddit names without r/). 
    Example: ["saas", "entrepreneur", "startups"]`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("AI suggestion failed");
    
    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    const rawSubreddits = Array.isArray(content) ? content : (content.subreddits || content.data || []);
    const subreddits = Array.isArray(rawSubreddits)
      ? rawSubreddits
          .map((item) => subredditNameSchema.safeParse(item))
          .filter((result) => result.success)
          .map((result) => result.data)
          .filter((value, index, arr) => arr.indexOf(value) === index)
          .slice(0, count)
      : [];

    return apiJson({ subreddits }, 200, correlationId);
  } catch (error) {
    console.error("Subreddit suggestion error:", error);
    return apiJson({ subreddits: [] }, 200, correlationId);
  }
}
