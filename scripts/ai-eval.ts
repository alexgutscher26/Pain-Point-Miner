/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import pMap from "p-map";
import { db } from "../lib/db";
import { aiEvalLog } from "../lib/db/schema";
import { extractPainPoints, AI_MODELS } from "../lib/ai";

const CURRENT_MODEL = process.env.AI_EVAL_MODEL || AI_MODELS.FREE;
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

interface EvalMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  avgIntensityDelta: number;
  tp: number;
  fp: number;
  fn: number;
  sampleRawResponse?: string;
}

// Semantic/keyword matching check for evaluation
function stringSimilarity(s1: string, s2: string): number {
  const set1 = new Set(
    s1.toLowerCase().split(/\W+/).filter((w) => w.length > 2),
  );
  const set2 = new Set(
    s2.toLowerCase().split(/\W+/).filter((w) => w.length > 2),
  );
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

async function evaluateDataset(
  dataset: GoldenPost[],
  promptVersion: "v1" | "v2",
): Promise<EvalMetrics> {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let intensityDiffSum = 0;
  let matchesCount = 0;
  let sampleRawResponse: string | undefined;

  await pMap(
    dataset,
    async (item) => {
      const post = {
        title: item.title || "",
        selftext: item.selftext,
        url: "https://reddit.com/r/" + item.subreddit,
        author: "eval-tester",
        subreddit: item.subreddit,
        comments: item.comments || [],
      };

      const candidateExtractions = await extractPainPoints(
        post,
        [],
        CURRENT_MODEL,
        undefined,
        undefined,
        undefined,
        { promptVersion },
      );

      if (!sampleRawResponse && candidateExtractions.length > 0) {
        sampleRawResponse = candidateExtractions[0].rawResponse;
      }

      let postTp = 0;
      const candidateMatches = new Set<number>();

      for (const expected of item.expected) {
        let bestMatchIdx = -1;
        let highestSim = 0;

        for (const [cIdx, cand] of candidateExtractions.entries()) {
          if (candidateMatches.has(cIdx)) continue;
          const sim = stringSimilarity(
            expected.painPoint,
            cand.body + " " + cand.title,
          );
          if (sim > highestSim && sim > 0.05) {
            highestSim = sim;
            bestMatchIdx = cIdx;
          }
        }

        if (bestMatchIdx !== -1) {
          postTp++;
          candidateMatches.add(bestMatchIdx);
          matchesCount++;
          intensityDiffSum += Math.abs(
            expected.painIntensity -
              candidateExtractions[bestMatchIdx].painIntensity,
          );
        } else {
          fn++;
        }
      }

      const postFp = candidateExtractions.length - candidateMatches.size;
      fp += postFp;
      tp += postTp;
    },
    { concurrency: 5 },
  );

  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1Score = (2 * precision * recall) / (precision + recall || 1);
  const avgIntensityDelta =
    matchesCount > 0 ? intensityDiffSum / matchesCount : 0;

  return {
    precision,
    recall,
    f1Score,
    avgIntensityDelta,
    tp,
    fp,
    fn,
    sampleRawResponse,
  };
}

async function runEvaluation() {
  console.log("=== Starting ThreddIQ AI Golden Dataset Evaluation Pipeline ===");

  if (!fs.existsSync(GOLDEN_DATASET_DIR)) {
    console.error(`Directory not found: ${GOLDEN_DATASET_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(GOLDEN_DATASET_DIR)
    .filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.warn(
      "No golden dataset files found. Please populate tests/golden-dataset/",
    );
    process.exit(0);
  }

  const dataset: GoldenPost[] = files.map((file) => {
    const content = fs.readFileSync(
      path.join(GOLDEN_DATASET_DIR, file),
      "utf-8",
    );
    return JSON.parse(content) as GoldenPost;
  });

  const args = process.argv.slice(2);
  const isAbTest =
    args.includes("--ab") ||
    args.includes("--ab-test") ||
    !args.some((a) => a.startsWith("--prompt-version="));
  const explicitVersionArg = args.find((a) =>
    a.startsWith("--prompt-version="),
  );
  const targetPromptVersion = explicitVersionArg
    ? (explicitVersionArg.split("=")[1] as "v1" | "v2")
    : "v1";

  if (isAbTest) {
    console.log(
      `\nRunning A/B Prompt Benchmark (V1 vs V2) on ${dataset.length} labeled posts using ${CURRENT_MODEL}...`,
    );

    console.log("Evaluating Prompt Version V1 (Baseline)...");
    const metricsV1 = await evaluateDataset(dataset, "v1");

    console.log("Evaluating Prompt Version V2 (Challenger)...");
    const metricsV2 = await evaluateDataset(dataset, "v2");

    const improvementPercentage =
      ((metricsV2.f1Score - metricsV1.f1Score) / (metricsV1.f1Score || 1)) *
      100;

    console.log("\n=================== A/B EVALUATION RESULTS ===================");
    console.log(`Prompt V1: Precision=${metricsV1.precision.toFixed(3)}, Recall=${metricsV1.recall.toFixed(3)}, F1=${metricsV1.f1Score.toFixed(3)}`);
    console.log(`Prompt V2: Precision=${metricsV2.precision.toFixed(3)}, Recall=${metricsV2.recall.toFixed(3)}, F1=${metricsV2.f1Score.toFixed(3)}`);
    console.log(`Improvement: ${improvementPercentage >= 0 ? "+" : ""}${improvementPercentage.toFixed(2)}%`);
    console.log("==============================================================");

    try {
      await db.insert(aiEvalLog).values([
        {
          id: crypto.randomUUID(),
          modelId: CURRENT_MODEL,
          f1Score: metricsV1.f1Score,
          precision: metricsV1.precision,
          recall: metricsV1.recall,
          promptVersion: "v1",
          rawResponse: metricsV1.sampleRawResponse?.slice(0, 5000),
          reasoning: `Baseline eval on ${dataset.length} golden dataset posts`,
          flaggedForReview: metricsV1.f1Score < 0.65,
          switched: false,
          runDate: new Date(),
        },
        {
          id: crypto.randomUUID(),
          modelId: CURRENT_MODEL,
          f1Score: metricsV2.f1Score,
          precision: metricsV2.precision,
          recall: metricsV2.recall,
          promptVersion: "v2",
          comparisonModelId: "v1",
          improvementPercentage,
          rawResponse: metricsV2.sampleRawResponse?.slice(0, 5000),
          reasoning: `Challenger V2 eval. Delta: ${improvementPercentage.toFixed(2)}%`,
          flaggedForReview: metricsV2.f1Score < 0.65,
          switched: improvementPercentage > 5.0,
          runDate: new Date(),
        },
      ]);
      console.log("💾 Successfully logged A/B benchmark evaluation metrics to ai_eval_log table.");
    } catch (err) {
      console.warn("Could not insert A/B log to database:", err);
    }

    const isPassing = metricsV1.f1Score >= 0.65 || metricsV2.f1Score >= 0.65;
    if (!isPassing && dataset.length >= 10) {
      console.error("\n🚨 ALERT: Both prompt versions fell below the 0.65 F1 threshold.");
      process.exit(1);
    }
    console.log("\n✅ A/B Prompt Validation complete.");
    process.exit(0);
  } else {
    console.log(
      `\nEvaluating Prompt Version ${targetPromptVersion.toUpperCase()} on ${dataset.length} posts...`,
    );
    const metrics = await evaluateDataset(dataset, targetPromptVersion);

    console.log("\n--- Evaluation Results ---");
    console.log(`Precision: ${metrics.precision.toFixed(3)}`);
    console.log(`Recall:    ${metrics.recall.toFixed(3)}`);
    console.log(`F1 Score:  ${metrics.f1Score.toFixed(3)}`);
    console.log(
      `Avg Pain Intensity Delta: ${metrics.avgIntensityDelta.toFixed(2)}`,
    );
    console.log(
      `(TruePos: ${metrics.tp}, FalsePos: ${metrics.fp}, FalseNeg: ${metrics.fn})`,
    );

    const isPassing = metrics.f1Score >= 0.65;

    try {
      await db.insert(aiEvalLog).values({
        id: crypto.randomUUID(),
        modelId: CURRENT_MODEL,
        f1Score: metrics.f1Score,
        precision: metrics.precision,
        recall: metrics.recall,
        promptVersion: targetPromptVersion,
        rawResponse: metrics.sampleRawResponse?.slice(0, 5000),
        runDate: new Date(),
        flaggedForReview: !isPassing,
        reasoning: `Avg Pain Intensity Delta: ${metrics.avgIntensityDelta.toFixed(2)}`,
        switched: false,
      });
      console.log("💾 Saved evaluation log to DB");
    } catch (err: any) {
      console.warn("Could not insert log into database:", err);
    }

    if (!isPassing && dataset.length >= 10) {
      console.error(
        `\n🚨 ALERT: F1 score (${metrics.f1Score.toFixed(3)}) fell below threshold.`,
      );
      process.exit(1);
    }
    console.log("\n✅ Evaluation passed validation.");
    process.exit(0);
  }
}

runEvaluation().catch((err) => {
  console.error("\n❌ Evaluation failed with exception:", err);
  process.exit(1);
});
