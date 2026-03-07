
import { apiJson } from "@/lib/api-error";
import { requireApiContext } from "@/lib/api-auth";

export async function POST(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId } = authContext.context;

  try {
    const { keyword } = await req.json();

    if (!keyword || keyword.length < 3) {
      return apiJson({ subreddits: [] }, 200, correlationId);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const prompt = `You are a Reddit growth expert. Suggest 5 highly active and relevant subreddits for the niche: "${keyword}". 
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
    const subreddits = Array.isArray(content) ? content : (content.subreddits || content.data || []);

    return apiJson({ subreddits }, 200, correlationId);
  } catch (error) {
    console.error("Subreddit suggestion error:", error);
    return apiJson({ subreddits: [] }, 200, correlationId);
  }
}
