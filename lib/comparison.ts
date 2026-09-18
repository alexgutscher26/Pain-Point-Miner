import {
  toOpportunityScore,
  DEFAULT_WEIGHTS,
  ScoringWeights,
} from "./dashboard-metrics";
import { calculateMarketRadarPoints, RadarPoint } from "./dashboard-analytics";

export interface ComparisonReport {
  id: string;
  keyword: string;
  subreddits: string[];
  createdAt: Date | string;
  painPoints: Array<{
    id: string;
    title: string;
    score: number;
    urgency: number | null;
    monetizationScore: number | null;
    marketMaturity: number | null;
    sentiment: string | null;
    subreddit: string | null;
    userUpvotes?: number;
    userDownvotes?: number;
    commentCount?: number | null;
    mentionCount?: number | null;
    budget?: Array<{ amount?: number; currency?: string; period?: string }>;
  }>;
}

export interface MetricDelta {
  valueA: number;
  valueB: number;
  diff: number;
  percentChange: number; // e.g. +25% or -12%
  isHigherBetter: boolean;
  favors: "A" | "B" | "neutral";
}

export interface ReportComparisonResult {
  reportA: {
    id: string;
    keyword: string;
    createdAt: string;
    subreddits: string[];
    opportunityScore: number;
    painPointsCount: number;
    avgUrgency: number;
    avgMonetization: number;
    avgMarketMaturity: number;
    budgetSignalsCount: number;
    radarPoints: RadarPoint[];
    quadrantBreakdown: {
      blueOcean: number;
      battleground: number;
      uncharted: number;
      commodity: number;
    };
    sentimentBreakdown: {
      desperate: number;
      frustrated: number;
      neutral: number;
    };
  };
  reportB: {
    id: string;
    keyword: string;
    createdAt: string;
    subreddits: string[];
    opportunityScore: number;
    painPointsCount: number;
    avgUrgency: number;
    avgMonetization: number;
    avgMarketMaturity: number;
    budgetSignalsCount: number;
    radarPoints: RadarPoint[];
    quadrantBreakdown: {
      blueOcean: number;
      battleground: number;
      uncharted: number;
      commodity: number;
    };
    sentimentBreakdown: {
      desperate: number;
      frustrated: number;
      neutral: number;
    };
  };
  deltas: {
    opportunityScore: MetricDelta;
    painPointsCount: MetricDelta;
    avgUrgency: MetricDelta;
    avgMonetization: MetricDelta;
    avgMarketMaturity: MetricDelta;
    budgetSignalsCount: MetricDelta;
    blueOceanCount: MetricDelta;
  };
  topPainPointsHeadToHead: Array<{
    rank: number;
    painPointA?: {
      id: string;
      title: string;
      score: number;
      urgency: number;
      sentiment: string;
      subreddit: string | null;
    };
    painPointB?: {
      id: string;
      title: string;
      score: number;
      urgency: number;
      sentiment: string;
      subreddit: string | null;
    };
  }>;
  summaryVerdict: {
    overallWinner: "A" | "B" | "tie";
    winnerKeyword: string;
    verdictStatement: string;
  };
}

export function computeMetricDelta(
  valueA: number,
  valueB: number,
  isHigherBetter = true,
): MetricDelta {
  const diff = Number((valueB - valueA).toFixed(1));
  let percentChange = 0;
  if (valueA === 0) {
    percentChange = valueB > 0 ? 100 : 0;
  } else {
    percentChange = Number((((valueB - valueA) / valueA) * 100).toFixed(1));
  }

  let favors: "A" | "B" | "neutral" = "neutral";
  if (diff > 0) {
    favors = isHigherBetter ? "B" : "A";
  } else if (diff < 0) {
    favors = isHigherBetter ? "A" : "B";
  }

  return {
    valueA,
    valueB,
    diff,
    percentChange,
    isHigherBetter,
    favors,
  };
}

export function compareReports(
  rawA: ComparisonReport,
  rawB: ComparisonReport,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): ReportComparisonResult {
  const scoreA = toOpportunityScore(rawA.painPoints, weights);
  const scoreB = toOpportunityScore(rawB.painPoints, weights);

  const radarA = calculateMarketRadarPoints(
    rawA.painPoints.map((p) => ({
      ...p,
      reportId: rawA.id,
      reportKeyword: rawA.keyword,
    })),
    weights,
  );

  const radarB = calculateMarketRadarPoints(
    rawB.painPoints.map((p) => ({
      ...p,
      reportId: rawB.id,
      reportKeyword: rawB.keyword,
    })),
    weights,
  );

  const countQuadrants = (points: RadarPoint[]) => ({
    blueOcean: points.filter((p) => p.quadrant === "blue-ocean").length,
    battleground: points.filter((p) => p.quadrant === "battleground").length,
    uncharted: points.filter((p) => p.quadrant === "uncharted").length,
    commodity: points.filter((p) => p.quadrant === "commodity").length,
  });

  const countSentiment = (points: ComparisonReport["painPoints"]) => {
    let desperate = 0;
    let frustrated = 0;
    let neutral = 0;
    for (const p of points) {
      const s = (p.sentiment || "").toLowerCase();
      if (s.includes("desperate")) desperate++;
      else if (s.includes("frustrat") || s.includes("angry") || s.includes("annoy")) frustrated++;
      else neutral++;
    }
    return { desperate, frustrated, neutral };
  };

  const avg = (arr: (number | null | undefined)[]) => {
    if (arr.length === 0) return 0;
    const valid = arr.filter((v): v is number => typeof v === "number");
    if (valid.length === 0) return 0;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1));
  };

  const budgetCountA = rawA.painPoints.filter(
    (p) => p.budget && p.budget.length > 0,
  ).length;
  const budgetCountB = rawB.painPoints.filter(
    (p) => p.budget && p.budget.length > 0,
  ).length;

  const avgUrgA = avg(rawA.painPoints.map((p) => p.urgency));
  const avgUrgB = avg(rawB.painPoints.map((p) => p.urgency));
  const avgMonA = avg(rawA.painPoints.map((p) => p.monetizationScore));
  const avgMonB = avg(rawB.painPoints.map((p) => p.monetizationScore));
  const avgMatA = avg(rawA.painPoints.map((p) => p.marketMaturity));
  const avgMatB = avg(rawB.painPoints.map((p) => p.marketMaturity));

  const quadA = countQuadrants(radarA);
  const quadB = countQuadrants(radarB);

  // Top 3 Pain Points Head-to-Head
  const sortedA = [...rawA.painPoints].sort((a, b) => b.score - a.score);
  const sortedB = [...rawB.painPoints].sort((a, b) => b.score - a.score);

  const headToHead = [0, 1, 2].map((idx) => {
    const itemA = sortedA[idx];
    const itemB = sortedB[idx];
    return {
      rank: idx + 1,
      painPointA: itemA
        ? {
            id: itemA.id,
            title: itemA.title,
            score: itemA.score,
            urgency: itemA.urgency ?? 0,
            sentiment: itemA.sentiment ?? "neutral",
            subreddit: itemA.subreddit,
          }
        : undefined,
      painPointB: itemB
        ? {
            id: itemB.id,
            title: itemB.title,
            score: itemB.score,
            urgency: itemB.urgency ?? 0,
            sentiment: itemB.sentiment ?? "neutral",
            subreddit: itemB.subreddit,
          }
        : undefined,
    };
  });

  // Deltas
  const deltas = {
    opportunityScore: computeMetricDelta(scoreA, scoreB, true),
    painPointsCount: computeMetricDelta(rawA.painPoints.length, rawB.painPoints.length, true),
    avgUrgency: computeMetricDelta(avgUrgA, avgUrgB, true),
    avgMonetization: computeMetricDelta(avgMonA, avgMonB, true),
    avgMarketMaturity: computeMetricDelta(avgMatA, avgMatB, false), // lower market maturity is easier competition
    budgetSignalsCount: computeMetricDelta(budgetCountA, budgetCountB, true),
    blueOceanCount: computeMetricDelta(quadA.blueOcean, quadB.blueOcean, true),
  };

  // Verdict calculation
  let scorePointsA = 0;
  let scorePointsB = 0;

  if (deltas.opportunityScore.favors === "A") scorePointsA += 3;
  if (deltas.opportunityScore.favors === "B") scorePointsB += 3;

  if (deltas.blueOceanCount.favors === "A") scorePointsA += 2;
  if (deltas.blueOceanCount.favors === "B") scorePointsB += 2;

  if (deltas.avgMonetization.favors === "A") scorePointsA += 1;
  if (deltas.avgMonetization.favors === "B") scorePointsB += 1;

  if (deltas.avgUrgency.favors === "A") scorePointsA += 1;
  if (deltas.avgUrgency.favors === "B") scorePointsB += 1;

  let overallWinner: "A" | "B" | "tie" = "tie";
  let winnerKeyword = "Both Opportunities";
  let verdictStatement = "Both investigations demonstrate comparable commercial viability and audience struggle intensity.";

  if (scorePointsA > scorePointsB) {
    overallWinner = "A";
    winnerKeyword = rawA.keyword;
    verdictStatement = `"${rawA.keyword}" exhibits a stronger commercial signal with higher overall opportunity score (${scoreA} vs ${scoreB}) and ${quadA.blueOcean} Blue Ocean niches.`;
  } else if (scorePointsB > scorePointsA) {
    overallWinner = "B";
    winnerKeyword = rawB.keyword;
    verdictStatement = `"${rawB.keyword}" outperforms "${rawA.keyword}" with higher monetization signals (${scoreB} vs ${scoreA}) and greater unmet customer demand.`;
  }

  return {
    reportA: {
      id: rawA.id,
      keyword: rawA.keyword,
      createdAt: typeof rawA.createdAt === "string" ? rawA.createdAt : rawA.createdAt.toISOString(),
      subreddits: rawA.subreddits,
      opportunityScore: scoreA,
      painPointsCount: rawA.painPoints.length,
      avgUrgency: avgUrgA,
      avgMonetization: avgMonA,
      avgMarketMaturity: avgMatA,
      budgetSignalsCount: budgetCountA,
      radarPoints: radarA,
      quadrantBreakdown: quadA,
      sentimentBreakdown: countSentiment(rawA.painPoints),
    },
    reportB: {
      id: rawB.id,
      keyword: rawB.keyword,
      createdAt: typeof rawB.createdAt === "string" ? rawB.createdAt : rawB.createdAt.toISOString(),
      subreddits: rawB.subreddits,
      opportunityScore: scoreB,
      painPointsCount: rawB.painPoints.length,
      avgUrgency: avgUrgB,
      avgMonetization: avgMonB,
      avgMarketMaturity: avgMatB,
      budgetSignalsCount: budgetCountB,
      radarPoints: radarB,
      quadrantBreakdown: quadB,
      sentimentBreakdown: countSentiment(rawB.painPoints),
    },
    deltas,
    topPainPointsHeadToHead: headToHead,
    summaryVerdict: {
      overallWinner,
      winnerKeyword,
      verdictStatement,
    },
  };
}
