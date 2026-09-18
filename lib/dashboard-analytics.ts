import {
  DashboardPainPoint,
  DEFAULT_WEIGHTS,
  ScoringWeights,
  toValidationScore,
} from "./dashboard-metrics";

export interface TopOpportunityItem {
  id: string;
  title: string;
  body: string;
  reportId: string;
  reportKeyword: string;
  subreddit: string | null;
  score: number;
  urgency: number;
  monetizationScore: number;
  marketMaturity: number;
  opportunityScore: number;
  difficulty: string | null;
  budgetSignalsCount: number;
  createdAt: string;
}

export function calculateSingleOpportunityScore(
  point: DashboardPainPoint,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): number {
  const painIntensity = point.score || 0;
  const monetizationScore = point.monetizationScore || 0;
  const urgency = point.urgency || 0;
  const marketMaturity = point.marketMaturity || 0;

  const weightedSum =
    painIntensity * weights.w1 +
    monetizationScore * weights.w2 +
    urgency * weights.w3 +
    marketMaturity * weights.w4;

  const sentimentMap: Record<string, number> = {
    desperate: 1.15,
    frustrated: 1.1,
    angry: 1.2,
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

  const base = (weightedSum * 10 + feedbackBoost + feedbackPenalty) * modifier;
  const validationBonus = (validation / 100) * 15;

  return Math.min(Math.max(Math.round(base + validationBonus), 0), 100);
}

export function getTopOpportunities(
  painPoints: Array<{
    id: string;
    title: string;
    body: string;
    score: number;
    urgency: number | null;
    monetizationScore: number | null;
    marketMaturity: number | null;
    sentiment: string | null;
    subreddit: string | null;
    difficulty?: string | null;
    budget?: unknown;
    reportId: string;
    reportKeyword: string;
    createdAt: Date | string;
    userUpvotes?: number;
    userDownvotes?: number;
    commentCount?: number | null;
    mentionCount?: number | null;
  }>,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  limit = 5,
): TopOpportunityItem[] {
  const scored = painPoints.map((p) => {
    const oppScore = calculateSingleOpportunityScore(
      {
        score: p.score,
        urgency: p.urgency,
        monetizationScore: p.monetizationScore,
        marketMaturity: p.marketMaturity,
        sentiment: p.sentiment,
        userUpvotes: p.userUpvotes,
        userDownvotes: p.userDownvotes,
        commentCount: p.commentCount,
        mentionCount: p.mentionCount,
      },
      weights,
    );

    const budgetArray = Array.isArray(p.budget) ? p.budget : [];

    return {
      id: p.id,
      title: p.title,
      body: p.body,
      reportId: p.reportId,
      reportKeyword: p.reportKeyword,
      subreddit: p.subreddit,
      score: p.score,
      urgency: p.urgency ?? 0,
      monetizationScore: p.monetizationScore ?? 0,
      marketMaturity: p.marketMaturity ?? 0,
      opportunityScore: oppScore,
      difficulty: p.difficulty ?? "weekend_project",
      budgetSignalsCount: budgetArray.length,
      createdAt:
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : String(p.createdAt),
    };
  });

  return scored.sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, limit);
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  count: number;
  painPointsCount: number;
  runsCount: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmapData {
  days: HeatmapDay[];
  totalActivity: number;
  totalPainPoints: number;
  longestStreak: number;
  currentStreak: number;
  mostActiveDate: string | null;
  maxDayCount: number;
}

export function calculateActivityHeatmap(
  items: Array<{ createdAt: Date | string; type?: "painPoint" | "scan" }>,
  daysCount = 91, // ~13 weeks
): ActivityHeatmapData {
  const now = new Date();
  const dayMap = new Map<string, { painPoints: number; scans: number }>();

  // Initialize all days in the window
  const daysList: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    daysList.push(key);
    dayMap.set(key, { painPoints: 0, scans: 0 });
  }

  // Populate counts
  for (const item of items) {
    const d =
      item.createdAt instanceof Date
        ? item.createdAt
        : new Date(item.createdAt);
    if (isNaN(d.getTime())) continue;

    const key = d.toISOString().slice(0, 10);
    if (dayMap.has(key)) {
      const entry = dayMap.get(key)!;
      if (item.type === "scan") {
        entry.scans += 1;
      } else {
        entry.painPoints += 1;
      }
    }
  }

  let totalActivity = 0;
  let totalPainPoints = 0;
  let maxCount = 0;
  let mostActiveDate: string | null = null;

  const days: HeatmapDay[] = daysList.map((dateStr) => {
    const entry = dayMap.get(dateStr) || { painPoints: 0, scans: 0 };
    const combined = entry.painPoints + entry.scans;
    totalActivity += combined;
    totalPainPoints += entry.painPoints;

    if (combined > maxCount) {
      maxCount = combined;
      mostActiveDate = dateStr;
    }

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (combined >= 10) level = 4;
    else if (combined >= 6) level = 3;
    else if (combined >= 3) level = 2;
    else if (combined >= 1) level = 1;

    const d = new Date(dateStr + "T00:00:00");
    return {
      date: dateStr,
      dayOfWeek: d.getDay(),
      count: combined,
      painPointsCount: entry.painPoints,
      runsCount: entry.scans,
      level,
    };
  });

  // Calculate streaks
  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < days.length; i++) {
    if (days[i].count > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Current streak (working backwards from today)
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      currentStreak++;
    } else {
      // If today is empty, check if yesterday was active
      if (i === days.length - 1) {
        continue;
      }
      break;
    }
  }

  return {
    days,
    totalActivity,
    totalPainPoints,
    longestStreak,
    currentStreak,
    mostActiveDate,
    maxDayCount: maxCount,
  };
}

export interface ClusterGrowthPoint {
  date: string;
  formattedDate: string;
  newClusters: number;
  cumulativeClusters: number;
  newPainPoints: number;
  cumulativePainPoints: number;
}

export interface ClusterGrowthData {
  timeline: ClusterGrowthPoint[];
  totalClusters: number;
  totalPainPoints: number;
  growthPercent: number;
  avgDensity: number;
  topClusterTitle: string | null;
}

export function calculateClusterGrowth(
  clusters: Array<{
    id: string;
    canonicalTitle?: string | null;
    sourceCount?: number | null;
    createdAt: Date | string;
  }>,
  painPoints: Array<{
    id: string;
    clusterId?: string | null;
    createdAt: Date | string;
  }>,
  daysCount = 30,
): ClusterGrowthData {
  const now = new Date();
  const dateMap = new Map<string, { newClusters: number; newPoints: number }>();

  const dateKeys: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dateKeys.push(key);
    dateMap.set(key, { newClusters: 0, newPoints: 0 });
  }

  // Count past clusters before window for baseline
  let baseClusters = 0;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - daysCount);

  for (const c of clusters) {
    const d = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
    if (isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    if (dateMap.has(key)) {
      dateMap.get(key)!.newClusters += 1;
    } else if (d < cutoff) {
      baseClusters += 1;
    }
  }

  let basePoints = 0;
  for (const p of painPoints) {
    const d = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt);
    if (isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    if (dateMap.has(key)) {
      dateMap.get(key)!.newPoints += 1;
    } else if (d < cutoff) {
      basePoints += 1;
    }
  }

  let cumulativeClusters = baseClusters;
  let cumulativePainPoints = basePoints;

  const timeline: ClusterGrowthPoint[] = dateKeys.map((k) => {
    const item = dateMap.get(k) || { newClusters: 0, newPoints: 0 };
    cumulativeClusters += item.newClusters;
    cumulativePainPoints += item.newPoints;

    const d = new Date(k + "T00:00:00");
    const formattedDate = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      date: k,
      formattedDate,
      newClusters: item.newClusters,
      cumulativeClusters,
      newPainPoints: item.newPoints,
      cumulativePainPoints,
    };
  });

  const totalClusters = clusters.length;
  const totalPainPoints = painPoints.length;

  const initialClusterCount = baseClusters;
  const growthPercent =
    initialClusterCount > 0
      ? Math.round(((totalClusters - initialClusterCount) / initialClusterCount) * 100)
      : totalClusters > 0
        ? 100
        : 0;

  const avgDensity =
    totalClusters > 0 ? Number((totalPainPoints / totalClusters).toFixed(1)) : 0;

  // Find top cluster by source count
  const sortedClusters = [...clusters].sort(
    (a, b) => (b.sourceCount || 1) - (a.sourceCount || 1),
  );
  const topClusterTitle = sortedClusters[0]?.canonicalTitle || null;

  return {
    timeline,
    totalClusters,
    totalPainPoints,
    growthPercent,
    avgDensity,
    topClusterTitle,
  };
}

export type RadarQuadrant =
  | "blue-ocean"
  | "battleground"
  | "uncharted"
  | "commodity";

export interface RadarPoint {
  id: string;
  title: string;
  reportId: string;
  reportKeyword: string;
  painIntensity: number; // 0 to 10
  marketMaturity: number; // 0 to 10
  urgency: number;
  monetizationScore: number;
  opportunityScore: number;
  subreddit: string | null;
  quadrant: RadarQuadrant;
}

export function calculateMarketRadarPoints(
  painPoints: Array<{
    id: string;
    title: string;
    reportId: string;
    reportKeyword: string;
    score: number;
    marketMaturity: number | null;
    urgency: number | null;
    monetizationScore: number | null;
    subreddit: string | null;
    sentiment?: string | null;
    userUpvotes?: number;
    userDownvotes?: number;
    commentCount?: number | null;
    mentionCount?: number | null;
  }>,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): RadarPoint[] {
  return painPoints.map((p) => {
    const painIntensity = Math.min(Math.max(p.score || 0, 0), 10);
    const marketMaturity = Math.min(Math.max(p.marketMaturity ?? 5, 0), 10);
    const oppScore = calculateSingleOpportunityScore(
      {
        score: p.score,
        urgency: p.urgency,
        monetizationScore: p.monetizationScore,
        marketMaturity: p.marketMaturity,
        sentiment: p.sentiment ?? null,
        userUpvotes: p.userUpvotes,
        userDownvotes: p.userDownvotes,
        commentCount: p.commentCount,
        mentionCount: p.mentionCount,
      },
      weights,
    );

    let quadrant: RadarQuadrant;
    if (painIntensity >= 5 && marketMaturity < 5) {
      quadrant = "blue-ocean";
    } else if (painIntensity >= 5 && marketMaturity >= 5) {
      quadrant = "battleground";
    } else if (painIntensity < 5 && marketMaturity < 5) {
      quadrant = "uncharted";
    } else {
      quadrant = "commodity";
    }

    return {
      id: p.id,
      title: p.title,
      reportId: p.reportId,
      reportKeyword: p.reportKeyword,
      painIntensity,
      marketMaturity,
      urgency: p.urgency ?? 0,
      monetizationScore: p.monetizationScore ?? 0,
      opportunityScore: oppScore,
      subreddit: p.subreddit,
      quadrant,
    };
  });
}

