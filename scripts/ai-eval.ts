/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { db } from "../lib/db";
import { aiGoldenDataset, aiEvalLog } from "../lib/db/schema";
import { extractPainPoints } from "../lib/ai";
import crypto from "crypto";

/**
 * AI MODEL EVALUATOR
 * This script runs the currently deployed AI model against a "golden dataset"
 * of known high-quality Reddit threads and compares the output against
 * ideal results using a "Judge" model.
 */

const CURRENT_MODEL = "anthropic/claude-3.5-sonnet";
const BENCHMARK_MODELS = [
  "google/gemini-2.0-flash-001",
  "openai/gpt-4o"
];
const JUDGE_MODEL = "openai/gpt-4o"; // High-reasoning judge

async function callJudge(goldenExtractions: any[], candidateExtractions: any[]): Promise<{
  precision: number;
  recall: number;
  f1: number;
  reasoning: string;
}> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const prompt = `You are a meta-evaluator for a SaaS opportunity engine.
Your task is to compare two sets of extracted pain points from a Reddit thread and determine how well the "Candidate" matches the "Ideal" ground truth.

IDEAL GROUND TRUTH EXTRACTIONS:
${JSON.stringify(goldenExtractions, null, 2)}

CANDIDATE EXTRACTIONS TO EVALUATE:
${JSON.stringify(candidateExtractions, null, 2)}

EVALUATION CRITERIA:
1. Precision: Of the items the candidate extracted, how many are actually valid pain points present in the Ideal set? (0.0 to 1.0)
2. Recall: Of the items in the Ideal set, how many did the candidate successfully identify? (0.0 to 1.0)
3. F1 Score: Harmomic mean of Precision and Recall.

RULES:
- Be strict on quality.
- If the candidate extracted the same pain point but with a slightly different title, consider it a match if the core insight is identical.
- If the candidate missed a critical high-intensity pain point, penalize Recall.
- If the candidate hallucinated a pain point not in the Ideal set, penalize Precision.

Return JSON only:
{
  "precision": number,
  "recall": number,
  "f1": number,
  "reasoning": "Brief explanation of the score"
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: JUDGE_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function seedGoldenDataset() {
  const existing = await db.select().from(aiGoldenDataset);
  if (existing.length > 0) return;

  console.log("Seeding initial golden dataset...");
  await db.insert(aiGoldenDataset).values([
    {
      id: crypto.randomUUID(),
      title: "I am so sick of Excel for tracking my inventory. It's a mess.",
      selftext: "I run a small e-commerce shop selling vintage watches. I've tried using Excel/Google Sheets to track my inventory, but it's impossible to handle different conditions, serial numbers, and multiple sales channels (Etsy + eBay). Anyone have a better way?",
      subreddit: "smallbusiness",
      comments: [
        { body: "Same here. I lost two watches last month because of a sheet error." },
        { body: "I'd pay a monthly fee if something just integrated with Etsy and eBay properly without costing $500/month." }
      ],
      expectedPainPoints: [
        {
          title: "Multi-channel Inventory Tracking for High-Value Goods",
          body: "Small business owners struggle with Excel for inventory when selling on multiple platforms (Etsy/eBay), leading to data loss and operational errors.",
          painIntensity: 8,
          urgency: 7,
          monetizationScore: 8,
          marketMaturity: 6,
          sentiment: "frustrated"
        }
      ],
      updatedAt: new Date(),
    }
  ]);
}

async function runEvaluation() {
  console.log("--- Starting AI Model Evaluation ---");
  await seedGoldenDataset();

  const dataset = await db.select().from(aiGoldenDataset);
  const results: any[] = [];

  for (const modelId of [CURRENT_MODEL, ...BENCHMARK_MODELS]) {
    console.log(`Evaluating model: ${modelId}...`);
    let totalF1 = 0;
    let totalPrecision = 0;
    let totalRecall = 0;
    let totalReasoning = "";

    for (const item of dataset) {
      // Mock the post structure for extractPainPoints
      const post = {
        title: item.title,
        selftext: item.selftext ?? "",
        url: "",
        author: "eval-bot",
        subreddit: item.subreddit,
        comments: item.comments as any[],
      };

      // We need to modify extractPainPoints to accept a modelId or temporarily overwrite it
      // For now, we'll assume we can pass it or I will update lib/ai.ts to support it.
      // Mocking the call for now:
      const candidateExtractions = await extractPainPoints(post, [], modelId); 
      
      const evalResult = await callJudge(item.expectedPainPoints as any[], candidateExtractions);
      totalF1 += evalResult.f1;
      totalPrecision += evalResult.precision;
      totalRecall += evalResult.recall;
      totalReasoning += `[${item.title.substring(0, 20)}]: ${evalResult.reasoning}\n`;
    }

    const avgF1 = totalF1 / dataset.length;
    const avgPrecision = totalPrecision / dataset.length;
    const avgRecall = totalRecall / dataset.length;

    results.push({
      modelId,
      f1: avgF1,
      precision: avgPrecision,
      recall: avgRecall,
      reasoning: totalReasoning
    });
  }

  // Find the current model's result and compare with others
  const currentResult = results.find(r => r.modelId === CURRENT_MODEL);
  const bestBenchmark = results
    .filter(r => r.modelId !== CURRENT_MODEL)
    .sort((a, b) => b.f1 - a.f1)[0];

  const improvement = bestBenchmark ? (bestBenchmark.f1 - currentResult.f1) : 0;
  const shouldFlag = improvement > 0.05;

  console.log(`Current Model F1: ${currentResult.f1.toFixed(3)}`);
  console.log(`Best Benchmark (${bestBenchmark.modelId}) F1: ${bestBenchmark.f1.toFixed(3)}`);
  
  await db.insert(aiEvalLog).values({
    id: crypto.randomUUID(),
    modelId: CURRENT_MODEL,
    f1Score: currentResult.f1,
    precision: currentResult.precision,
    recall: currentResult.recall,
    switched: false,
    flaggedForReview: shouldFlag,
    reasoning: `Status check against ${bestBenchmark.modelId}. ${shouldFlag ? "Flagged for 5%+ improvement." : "Current model is still competitive."}`,
    comparisonModelId: bestBenchmark.modelId,
    improvementPercentage: improvement * 100,
    evalMetadata: { fullResults: results },
  });

  console.log("Evaluation complete. Logs saved to DB.");
}

runEvaluation().catch(console.error);
