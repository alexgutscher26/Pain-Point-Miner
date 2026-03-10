import { z } from "zod";

export const runStatusSchema = z.enum([
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
  status: string | null | undefined,
): RunStatus {
  if (!status) return "running";

  const legacyMap: Record<string, RunStatus> = {
    success: "completed",
    started: "running",
    error: "failed",
  };

  const mapped = legacyMap[status] ?? status;
  const parsed = runStatusSchema.safeParse(mapped);
  return parsed.success ? parsed.data : "running";
}
