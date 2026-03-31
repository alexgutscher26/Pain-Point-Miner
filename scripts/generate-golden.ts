import "dotenv/config";
import fs from "fs";
import path from "path";

const TARGET_COUNT = 50;
const DIR = path.join(process.cwd(), "tests/golden-dataset");

async function generateBatch(batchSize: number): Promise<any[]> {
  const prompt = `You are a data engineer generating synthetic test cases for an AI evaluation framework.
Generate a JSON array of exactly ${batchSize} highly realistic Reddit posts discussing deep B2B/SaaS software problems. 

For each post, provide exactly this schema:
{
  "postId": "p_unique_id",
  "subreddit": "string (e.g. Sales, devops, HR, recruiting, agency)",
  "title": "string (The Reddit thread title)",
  "selftext": "string (The main post body detailing a specific workflow friction, software limitation, or missing tool)",
  "comments": [ { "body": "string" } ],
  "expected": [
    {
      "painPoint": "string (Clear summary of the core unmet need or friction)",
      "sentiment": "string (MUST BE exactly one of: frustrated, curious, desperate, neutral, angry)",
      "painIntensity": number (1 to 10),
      "hasBudgetSignal": boolean (true if any text implies willingness to pay)
    }
  ]
}

Make the scenarios highly realistic, specific to niche industries (e.g. medical billing, construction scheduling, enterprise SSO, freelance accounting), and detailed. Ensure variety in sentiments and budget signals.

CRITICAL: Return ONLY a valid JSON array of these objects. Do not wrap in markdown \`\`\`json blocks. Return the raw array starting with [ and ending with ].`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
     const txt = await response.text();
     throw new Error(`API failed: ${response.status} ${txt}`);
  }
  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  // Clean up any potential markdown wrapper
  let cleanContent = content;
  if (cleanContent.startsWith("```json")) {
    cleanContent = cleanContent.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.replace(/^```/, "").replace(/```$/, "").trim();
  }
  
  return JSON.parse(cleanContent);
}

async function run() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  
  console.log(`Checking existing dataset in ${DIR}...`);
  while (true) {
    const currentFiles = fs.readdirSync(DIR).filter(f => f.endsWith(".json"));
    const currentCount = currentFiles.length;
    
    if (currentCount >= TARGET_COUNT) {
      console.log(`✅ Target of ${TARGET_COUNT} golden posts reached! (${currentCount} found)`);
      break;
    }

    const needed = Math.min(10, TARGET_COUNT - currentCount); // Generate in batches of 10
    console.log(`Generating batch of ${needed} posts via OpenRouter... (${currentCount}/${TARGET_COUNT} completed)`);
    
    try {
      const posts = await generateBatch(needed);
      if (!Array.isArray(posts)) {
         throw new Error("API did not return a JSON array");
      }
      
      for (const p of posts) {
        // Double check count before writing
        const countCheck = fs.readdirSync(DIR).filter(f => f.endsWith(".json")).length;
        if (countCheck >= TARGET_COUNT) break;
        
        const safeId = p.postId || `auto_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const filePath = path.join(DIR, `post-${safeId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(p, null, 2));
      }
    } catch (e: any) {
      console.error("Batch failed, retrying in 2 seconds...", e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

run().catch(console.error);
