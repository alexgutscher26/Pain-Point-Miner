import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as relations from "./relations";
import crypto from "node:crypto";
import { validateEnv } from "@/lib/env";

// Fail fast at server startup if critical env vars are missing.
// Skip in test environments where env vars are mocked per-test.
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  validateEnv();
}

const connectionString = process.env.DATABASE_URL!;

const baseClient = postgres(connectionString, {
  prepare: false,
  max: 10,
});

class SlowQueryLogger {
  async logQuery(query: string, duration: number) {
    if (duration > 500) {
      console.warn(`[SLOW QUERY] ${duration}ms: ${query.slice(0, 100)}...`);
      try {
        // Use baseClient directly to avoid proxy loop
        await baseClient`
          INSERT INTO slow_query_log (id, query, "durationMs", "createdAt")
          VALUES (${crypto.randomUUID()}, ${query}, ${duration}, ${new Date()})
        `.catch(err => console.error("Failed to log slow query:", err));
      } catch (err) {
        console.error("Critical error in slow query logger:", err);
      }
    }
  }
}

const slowLogger = new SlowQueryLogger();

// Wrap client to measure execution time
export const client = new Proxy(baseClient, {
  apply(target, thisArg, argArray) {
    const start = Date.now();
    // Use Reflect.apply to safely call the client with any arguments
    const result = Reflect.apply(target as any, thisArg, argArray);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = Date.now() - start;
        const query = typeof argArray[0] === 'string' ? argArray[0] : (argArray[0] as any)?.strings?.join('?') || 'unknown';
        slowLogger.logQuery(query, duration);
      });
    }
    return result;
  },
  // Ensure we also handle the template literal tag usage
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  }
}) as typeof baseClient;

export const db = drizzle(client, {
  schema: { ...schema, ...relations },
});
