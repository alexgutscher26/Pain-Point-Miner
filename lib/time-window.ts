export type TimeWindow = "24h" | "7d" | "30d" | "90d";

export type RedditSearchTimeRange = "day" | "week" | "month" | "year";

export const DEFAULT_TIME_WINDOW: TimeWindow = "90d";

export function normalizeTimeWindow(
  value: string | null | undefined,
): TimeWindow {
  if (value === "24h" || value === "7d" || value === "30d") {
    return value;
  }
  return "90d";
}

export function getTimeWindowLabel(timeWindow: TimeWindow): string {
  switch (timeWindow) {
    case "24h":
      return "Last 24h";
    case "7d":
      return "Last 7d";
    case "30d":
      return "Last 30d";
    case "90d":
    default:
      return "Last 90d";
  }
}

export function getRedditTimeRangeForWindow(
  timeWindow: TimeWindow,
): RedditSearchTimeRange {
  switch (timeWindow) {
    case "24h":
      return "day";
    case "7d":
      return "week";
    case "30d":
      return "month";
    case "90d":
    default:
      return "year";
  }
}

export function getTimeWindowAgeSeconds(timeWindow: TimeWindow): number {
  switch (timeWindow) {
    case "24h":
      return 24 * 60 * 60;
    case "7d":
      return 7 * 24 * 60 * 60;
    case "30d":
      return 30 * 24 * 60 * 60;
    case "90d":
    default:
      return 90 * 24 * 60 * 60;
  }
}
