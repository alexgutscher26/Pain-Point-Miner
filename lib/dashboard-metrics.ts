export type DashboardPainPoint = {
  score: number;
  urgency: number | null;
  monetizationScore: number | null;
  marketMaturity: number | null;
  sentiment: string | null;
  mentionCount?: number | null;
  commentCount?: number | null;
  upvoteSignal?: number | null;
  userUpvotes?: number;
  userDownvotes?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toNormalizedSignal(value: number) {
  return clamp((Math.log1p(Math.max(0, value)) / Math.log(101)) * 100, 0, 100);
}

export function toValidationScore(
  point: Pick<
    DashboardPainPoint,
    "upvoteSignal" | "commentCount" | "mentionCount"
  >,
) {
  const upvotes = toNormalizedSignal(point.upvoteSignal ?? 0);
  const comments = toNormalizedSignal(point.commentCount ?? 0);
  const mentions = toNormalizedSignal(point.mentionCount ?? 0);
  return Math.round(upvotes * 0.4 + comments * 0.35 + mentions * 0.25);
}

export interface ScoringWeights {
  w1: number; // painIntensity
  w2: number; // monetizationScore
  w3: number; // urgency
  w4: number; // marketMaturity
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  w1: 0.4,
  w2: 0.3,
  w3: 0.2,
  w4: 0.1,
};

export function generateScoreExplanation(
  point: DashboardPainPoint,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
) {
  const pain = point.score || 0;
  const monetization = point.monetizationScore || 0;
  const urgency = point.urgency || 0;
  const maturity = point.marketMaturity || 0;

  const contributions = [
    { label: "pain intensity", value: pain, weight: weights.w1 },
    { label: "monetization potential", value: monetization, weight: weights.w2 },
    { label: "urgency", value: urgency, weight: weights.w3 },
    { label: "market maturity", value: maturity, weight: weights.w4 },
  ].sort((a, b) => b.value * b.weight - a.value * a.weight);

  const topFactor = contributions[0];
  const secondFactor = contributions[1];

  let explanation = `Score primarily driven by ${topFactor.value}/10 ${topFactor.label}`;

  if (secondFactor && secondFactor.value >= 7) {
    explanation += ` and high ${secondFactor.label}`;
  }

  // Special checks for budget/signals
  if (point.upvoteSignal && point.upvoteSignal > 50) {
    explanation += ". Significant community validation detected via upvotes";
  } else if (point.commentCount && point.commentCount > 15) {
    explanation += ". Heavy discussion volume indicates strong market interest";
  }

  return explanation;
}

export function toOpportunityScore(
  painPoints: DashboardPainPoint[],
  weights: ScoringWeights = DEFAULT_WEIGHTS,
) {
  if (painPoints.length === 0) return 0;

  const factors = painPoints.map((point) => {
    // Basic weight-based components
    const painIntensity = point.score || 0;
    const monetizationScore = point.monetizationScore || 0;
    const urgency = point.urgency || 0;
    const marketMaturity = point.marketMaturity || 0;

    // Apply weights (0.40, 0.30, 0.20, 0.10 by default)
    const weightedSum =
      painIntensity * weights.w1 +
      monetizationScore * weights.w2 +
      urgency * weights.w3 +
      marketMaturity * weights.w4;

    const sentimentMap: Record<string, number> = {
      desperate: 1.1,
      frustrated: 1.05,
      angry: 1.15,
      neutral: 1.0,
      curious: 0.95,
    };
    const modifier = sentimentMap[point.sentiment || ""] || 1.0;
    const validation = toValidationScore(point);

    const feedbackBalance =
      (point.userUpvotes ?? 0) - (point.userDownvotes ?? 0);
    const feedbackBoost =
      feedbackBalance > 0 ? Math.min(feedbackBalance * 2, 10) : 0;
    const feedbackPenalty =
      feedbackBalance < 0 ? Math.max(feedbackBalance * 4, -20) : 0;

    const base =
      (weightedSum * 10 + feedbackBoost + feedbackPenalty) * modifier;

    return base * 0.75 + validation * 0.25;
  });

  const average = Math.round(
    factors.reduce((a, b) => a + b, 0) / factors.length,
  );
  return clamp(average, 0, 100);
}

export function getMarketBadge(marketScore: number) {
  if (marketScore >= 80) return "High Potential";
  if (marketScore >= 50) return "Solid Opportunity";
  return "Early Signal";
}
