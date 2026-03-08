export type TrendDirection = "up" | "down" | "flat" | "new";

export type TrendInsight = {
  key: string;
  current: number;
  previous: number | null;
  direction: TrendDirection;
  delta: number;
  percentChange: number;
};

export type TrendSnapshot = {
  key: string;
  value: number;
  createdAt: Date | string;
};

const DEFAULT_FLAT_DELTA = 1;
const DEFAULT_FLAT_PERCENT = 5;

function toTime(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export function detectTrend(
  current: number,
  previous: number | null,
  flatDeltaThreshold = DEFAULT_FLAT_DELTA,
  flatPercentThreshold = DEFAULT_FLAT_PERCENT
): TrendInsight {
  if (previous === null) {
    return {
      key: "",
      current,
      previous: null,
      direction: "new",
      delta: current,
      percentChange: current > 0 ? 100 : 0,
    };
  }

  const delta = current - previous;
  const percentChange = previous === 0 ? (current > 0 ? 100 : 0) : (delta / previous) * 100;
  const isFlatByDelta = Math.abs(delta) <= flatDeltaThreshold;
  const isFlatByPercent = Math.abs(percentChange) <= flatPercentThreshold;
  const direction: TrendDirection =
    isFlatByDelta || isFlatByPercent ? "flat" : delta > 0 ? "up" : "down";

  return {
    key: "",
    current,
    previous,
    direction,
    delta,
    percentChange,
  };
}

export function buildLatestTrendInsights(snapshots: TrendSnapshot[]) {
  const grouped = new Map<string, TrendSnapshot[]>();

  for (const snapshot of snapshots) {
    const list = grouped.get(snapshot.key) ?? [];
    list.push(snapshot);
    grouped.set(snapshot.key, list);
  }

  const insights: TrendInsight[] = [];

  for (const [key, records] of grouped.entries()) {
    records.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
    const current = records[0]?.value ?? 0;
    const previous = records[1]?.value ?? null;
    const trend = detectTrend(current, previous);
    insights.push({
      ...trend,
      key,
    });
  }

  return insights.sort((a, b) => {
    const score = (entry: TrendInsight) => {
      if (entry.direction === "up") return 3;
      if (entry.direction === "new") return 2;
      if (entry.direction === "flat") return 1;
      return 0;
    };

    const byDirection = score(b) - score(a);
    if (byDirection !== 0) return byDirection;
    return b.percentChange - a.percentChange;
  });
}

export function formatTrendChangePercent(percentChange: number) {
  const rounded = Math.round(percentChange);
  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `${rounded}%`;
  return "0%";
}
