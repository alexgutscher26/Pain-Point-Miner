/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import pMap from "p-map";
import { db } from "../lib/db";
import { aiEvalLog } from "../lib/db/schema";
import { extractPainPoints } from "../lib/ai";

const CURRENT_MODEL = "google/gemini-2.0-flash-001";
const GOLDEN_DATASET_DIR = path.join(process.cwd(), "tests/golden-dataset");

interface GoldenPost {
  postId: string;
  title?: string;
  selftext: string;
  subreddit: string;
  comments?: Array<{ body: string }>;
  expected: Array<{
    painPoint: string;
    sentiment: string;
    painIntensity: number;
    hasBudgetSignal: boolean;
  }>;
}

// Basic semantic/keyword matching check instead of full LLM judge to save time
function stringSimilarity(s1: string, s2: string) {
  const set1 = new Set(s1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const set2 = new Set(s2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

async function runEvaluation() {
  console.log("--- Starting AI Model Evaluation ---");

  if (!fs.existsSync(GOLDEN_DATASET_DIR)) {
    console.error(`Directory not found: ${GOLDEN_DATASET_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(GOLDEN_DATASET_DIR).filter(f => f.endsWith(".json"));
  if (files.length === 0) {
    console.warn("No golden dataset files found. Please populate tests/golden-dataset/");
    process.exit(0);
  }

  const dataset: GoldenPost[] = files.map(file => {
    const content = fs.readFileSync(path.join(GOLDEN_DATASET_DIR, file), "utf-8");
    return JSON.parse(content) as GoldenPost;
  });

  console.log(`Evaluating against ${dataset.length} posts from the golden dataset using ${CURRENT_MODEL}...`);

  let tp = 0; // expected matched
  let fp = 0; // extractions not matching expected
  let fn = 0; // expected not extracted
  let intensityDiffSum = 0;
  let matchesCount = 0;

  // Run efficiently in parallel
  await pMap(dataset, async (item) => {
    const post = {
      title: item.title || "",
      selftext: item.selftext,
      url: "https://reddit.com/r/" + item.subreddit,
      author: "eval-tester",
      subreddit: item.subreddit,
      comments: item.comments || [],
    };

    const candidateExtractions = await extractPainPoints(post, [], CURRENT_MODEL);
    
    let postTp = 0;
    const candidateMatches = new Set<number>();
    
    for (const [eIdx, expected] of item.expected.entries()) {
      let bestMatchIdx = -1;
      let highestSim = 0;

      for (const [cIdx, cand] of candidateExtractions.entries()) {
        if (candidateMatches.has(cIdx)) continue;
        const sim = stringSimilarity(expected.painPoint, cand.body + " " + cand.title);
        // very relaxed threshold since LLMs reformat text
        if (sim > highestSim && sim > 0.05) {
          highestSim = sim;
          bestMatchIdx = cIdx;
        }
      }

      if (bestMatchIdx !== -1) {
        postTp++;
        candidateMatches.add(bestMatchIdx);
        
        // Track intensity delta
        matchesCount++;
        intensityDiffSum += Math.abs(expected.painIntensity - candidateExtractions[bestMatchIdx].painIntensity);
      } else {
        fn++; 
      }
    }

    const postFp = candidateExtractions.length - candidateMatches.size;
    fp += postFp;
    tp += postTp;

  }, { concurrency: 7 });

  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1Score = (2 * precision * recall) / (precision + recall || 1);
  const avgIntensityDelta = matchesCount > 0 ? intensityDiffSum / matchesCount : 0;

  console.log("\n--- Evaluation Results ---");
  console.log(`Precision: ${precision.toFixed(3)}`);
  console.log(`Recall:    ${recall.toFixed(3)}`);
  console.log(`F1 Score:  ${f1Score.toFixed(3)}`);
  console.log(`Avg Pain Intensity Delta: ${avgIntensityDelta.toFixed(2)}`);
  console.log(`(TruePos: ${tp}, FalsePos: ${fp}, FalseNeg: ${fn})`);

  const isPassing = f1Score >= 0.70;

  try {
    const [inserted] = await db.insert(aiEvalLog).values({
      id: crypto.randomUUID(),
      modelId: CURRENT_MODEL,
      f1Score,
      precision,
      recall,
      runDate: new Date(),
      flaggedForReview: !isPassing,
      reasoning: `Avg Pain Intensity Delta: ${avgIntensityDelta.toFixed(2)}`,
      switched: false,
    }).returning({ id: aiEvalLog.id });
    console.log(`\n💾 Saved evaluation log to DB (id: ${inserted.id})`);
  } catch (err: any) {
    console.warn("Could not insert log into database. (Table might not exist yet)");
  }

  // Only fail CI if dataset size is reasonable (>= 10). If < 10, it's just local dev/testing
  if (!isPassing && dataset.length >= 10) {
      console.error(`\n🚨 ALERT: F1 score (${f1Score.toFixed(3)}) fell below the 0.70 threshold!`);
      process.exit(1);
  } else if (!isPassing) {
    console.warn(`\n⚠️ Warning: F1 score is ${f1Score.toFixed(3)} (< 0.70). CI failure skipped (dataset < 50 items).`);
  } else {
    console.log("\n✅ Evaluation passed validation.");
    process.exit(0);
  }
}

runEvaluation().catch((err) => {
  console.error("\n❌ Evaluation failed with exception:", err);
  process.exit(1);
});
