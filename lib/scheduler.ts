/**
 * Determines if the scraper is due to run based on the last run time and frequency.
 *
 * This function checks if the last run time is provided. If not, it returns true, indicating that the scraper is due.
 * It calculates the interval in minutes, ensuring it is at least 1, and then computes the elapsed time since the last run.
 * Finally, it compares the elapsed time with the calculated interval to determine if the scraper should run again.
 *
 * @param lastRunAt - The date and time when the scraper was last run.
 * @param frequencyMinutes - The frequency in minutes at which the scraper should run.
 * @param now - The current date and time, defaults to the current moment.
 */
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

/**
 * Parses a positive integer from an environment variable string.
 */
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
