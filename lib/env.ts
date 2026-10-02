// Centralized environment variable validation and typed access.
// Getters are evaluated lazily so importing this module never crashes at import time.
// Call `validateEnv()` from a server entry point to fail fast at startup.

export function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Set it in .env or .env.local. See .env.example for documentation.`,
    );
  }
  return val;
}

export function str(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (isNaN(n)) {
    throw new Error(
      `Environment variable ${name} must be a number, got "${raw}".`,
    );
  }
  return n;
}

export function boolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return raw === "true" || raw === "1";
}

export function json<T>(name: string, fallback: T): T {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(
      `Environment variable ${name} must be valid JSON, got "${raw}".`,
    );
  }
}

export interface EnvShape {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  OPENROUTER_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  CRON_SECRET: string;
}

/**
 * Validate ALL required env vars at once.
 * Call this from a server entry point to fail fast with descriptive messages.
 *
 * Required vars (no sensible default):
 *   DATABASE_URL, BETTER_AUTH_SECRET, OPENROUTER_API_KEY
 *
 * Conditionally required (based on feature toggles):
 *   STRIPE_WEBHOOK_SECRET — required if STRIPE_PLUGIN_ENABLED=true
 *   CRON_SECRET — should always be set in production
 */
export function validateEnv(): EnvShape {
  const errors: string[] = [];

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) errors.push("DATABASE_URL");

  const authSecret = process.env.BETTER_AUTH_SECRET;
  if (!authSecret) errors.push("BETTER_AUTH_SECRET");

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) errors.push("OPENROUTER_API_KEY");

  if (errors.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  - ${errors.join("\n  - ")}\n\n` +
        `Set them in .env or .env.local. See .env.example for documentation.`,
    );
  }

  if (boolean("STRIPE_PLUGIN_ENABLED", false)) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error(
        "STRIPE_WEBHOOK_SECRET is required when STRIPE_PLUGIN_ENABLED=true.\n" +
          "Set it in .env or .env.local.",
      );
    }
  }

  return {
    DATABASE_URL: dbUrl!,
    BETTER_AUTH_SECRET: authSecret!,
    BETTER_AUTH_URL: str("BETTER_AUTH_URL", "http://localhost:3000"),
    OPENROUTER_API_KEY: apiKey!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
    CRON_SECRET: process.env.CRON_SECRET || "",
  };
}
