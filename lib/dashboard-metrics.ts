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

export function toOpportunityScore(painPoints: DashboardPainPoint[]) {
  if (painPoints.length === 0) return 0;

  const factors = painPoints.map((point) => {
    const feedbackBalance = (point.userUpvotes ?? 0) - (point.userDownvotes ?? 0);
    // Use feedback signal to adjust painIntensity (point.score) weights
    const feedbackIntensityWeight =
      feedbackBalance > 0 ? 1.05 : feedbackBalance < 0 ? 0.85 : 1.0;

    const pain = (point.score || 0) * 0.35 * feedbackIntensityWeight;
    const urgency = (point.urgency || 0) * 0.25;
    const monetization = (point.monetizationScore || 0) * 0.3;

    let maturityBonus = 0;
    if ((point.marketMaturity || 0) <= 3) maturityBonus = 10;
    else if ((point.marketMaturity || 0) >= 8) maturityBonus = 8;
    else maturityBonus = 4;

    const sentimentMap: Record<string, number> = {
      desperate: 1.1,
      frustrated: 1.05,
      angry: 1.15,
      neutral: 1.0,
      curious: 0.95,
    };
    const modifier = sentimentMap[point.sentiment || ""] || 1.0;
    const validation = toValidationScore(point);
    const feedbackBoost =
      feedbackBalance > 0 ? Math.min(feedbackBalance * 2, 10) : 0;
    const feedbackPenalty =
      feedbackBalance < 0 ? Math.max(feedbackBalance * 4, -20) : 0;

    const base =
      ((pain + urgency + monetization) * 10 + maturityBonus + feedbackBoost + feedbackPenalty) * modifier;
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
