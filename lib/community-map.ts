import { toValidationScore } from "@/lib/dashboard-metrics";

export type CommunityPainPointRow = {
  id: string;
  title: string;
  reportId: string;
  reportTitle: string;
  score: number;
  urgency: number | null;
  sentiment: string | null;
  mentionCount: number | null;
  commentCount: number | null;
  subreddit: string;
  label: string;
};

export type SubredditCommunityNode = {
  subreddit: string;
  label: string;
  painPointCount: number;
  averageIntensity: number;
  averageUrgency: number;
  topPainPoints: CommunityPainPointRow[];
};

type CommunityMapSourceRow = {
  id: string;
  title: string;
  reportId: string;
  reportTitle: string;
  score: number;
  urgency: number | null;
  sentiment: string | null;
  mentionCount: number | null;
  commentCount: number | null;
  subreddit: string | null;
  subredditDisplayName?: string | null;
};

function roundToNearestInt(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function normalizeSubredditKey(value: string) {
  return value.trim().replace(/^r\//i, "").toLowerCase();
}

function toCommunityPainPointRow(
  row: CommunityMapSourceRow,
): CommunityPainPointRow | null {
  const rawSubreddit = row.subredditDisplayName || row.subreddit;
  if (!rawSubreddit?.trim()) {
    return null;
  }

  const normalizedSubreddit = normalizeSubredditKey(rawSubreddit);
  if (!normalizedSubreddit) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    reportId: row.reportId,
    reportTitle: row.reportTitle,
    score: row.score ?? 0,
    urgency: row.urgency ?? null,
    sentiment: row.sentiment ?? null,
    mentionCount: row.mentionCount ?? 0,
    commentCount: row.commentCount ?? 0,
    subreddit: normalizedSubreddit,
    label: `r/${normalizedSubreddit}`,
  };
}

export function buildCommunityMapNodes(
  rows: CommunityMapSourceRow[],
): SubredditCommunityNode[] {
  const grouped = new Map<string, CommunityPainPointRow[]>();

  rows.forEach((row) => {
    const mapped = toCommunityPainPointRow(row);
    if (!mapped) {
      return;
    }

    const existing = grouped.get(mapped.subreddit) ?? [];
    existing.push(mapped);
    grouped.set(mapped.subreddit, existing);
  });

  return Array.from(grouped.entries())
    .map(([subreddit, painPoints]) => {
      const sortedPainPoints = [...painPoints].sort((left, right) => {
        const leftValidation = toValidationScore({
          upvoteSignal: left.score,
          commentCount: left.commentCount,
          mentionCount: left.mentionCount,
        });
        const rightValidation = toValidationScore({
          upvoteSignal: right.score,
          commentCount: right.commentCount,
          mentionCount: right.mentionCount,
        });

        return (
          rightValidation - leftValidation ||
          (right.urgency ?? 0) - (left.urgency ?? 0) ||
          right.score - left.score
        );
      });

      const averageIntensity =
        painPoints.reduce((sum, painPoint) => sum + painPoint.score, 0) /
        painPoints.length;
      const averageUrgency =
        painPoints.reduce((sum, painPoint) => sum + (painPoint.urgency ?? 0), 0) /
        painPoints.length;

      return {
        subreddit,
        label: painPoints[0]?.label ?? `r/${subreddit}`,
        painPointCount: painPoints.length,
        averageIntensity: roundToNearestInt(averageIntensity),
        averageUrgency: roundToNearestInt(averageUrgency),
        topPainPoints: sortedPainPoints,
      };
    })
    .sort((left, right) => {
      return (
        right.painPointCount - left.painPointCount ||
        right.averageIntensity - left.averageIntensity ||
        left.label.localeCompare(right.label)
      );
    });
}
