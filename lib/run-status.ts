import { z } from "zod";

export const runStatusSchema = z.enum([
  "pending",
  "queued",
  "running",
  "scanning",
  "extracting",
  "clustering",
  "completed",
  "failed",
  "canceled",
]);

export type RunStatus = z.infer<typeof runStatusSchema>;

export function normalizeRunStatus(
  value: unknown,
  fallback: RunStatus = "pending",
): RunStatus {
  if (typeof value !== "string" || !value) return fallback;

  const legacyMap: Record<string, RunStatus> = {
    success: "completed",
    started: "running",
    error: "failed",
  };

  const mapped = legacyMap[value] ?? value;
  const parsed = runStatusSchema.safeParse(mapped);
  return parsed.success ? parsed.data : fallback;
}
