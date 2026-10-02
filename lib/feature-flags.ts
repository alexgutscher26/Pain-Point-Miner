import { json } from "@/lib/env";

type FeatureFlags = Record<string, boolean>;

let _cached: FeatureFlags | null = null;

function parseFlags(): FeatureFlags {
  if (_cached) return _cached;
  _cached = json<FeatureFlags>("FEATURE_FLAGS", {});
  return _cached;
}

/**
 * Check whether a named feature flag is enabled.
 * Flags are defined by the `FEATURE_FLAGS` JSON env var, e.g.:
 *   FEATURE_FLAGS={"newPipeline":true,"batchEmbedding":true}
 */
export function isFeatureEnabled(flag: string): boolean {
  return parseFlags()[flag] === true;
}

/**
 * Force-refresh the feature flags from the env var.
 * Useful after an env var change without a full restart (e.g. via Inngest).
 */
export function reloadFeatureFlags(): FeatureFlags {
  _cached = null;
  return parseFlags();
}
