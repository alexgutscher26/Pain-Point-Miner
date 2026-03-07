export function isScraperDue(
  lastRunAt: Date | null | undefined,
  frequencyMinutes: number | null | undefined,
  now = new Date()
) {
  if (!lastRunAt) return true;

  const intervalMinutes = Number.isFinite(frequencyMinutes)
    ? Math.max(1, Math.floor(frequencyMinutes as number))
    : 60;

  const elapsedMs = now.getTime() - new Date(lastRunAt).getTime();
  return elapsedMs >= intervalMinutes * 60_000;
}

export function parsePositiveIntFromEnv(
  value: string | undefined,
  fallback: number,
  min = 1,
  max = Number.MAX_SAFE_INTEGER
) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}
