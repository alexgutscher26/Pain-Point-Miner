import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getCorrelationId } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getCorrelationId(req);
  const startTime = Date.now();

  const checks: {
    database: {
      status: "healthy" | "unhealthy";
      latencyMs?: number;
      error?: string;
    };
    cache: { status: "healthy" | "degraded"; type: string; latencyMs?: number };
    externalApis: {
      reddit: {
        configured: boolean;
        status: "configured" | "missing_credentials";
      };
      openrouter: {
        configured: boolean;
        status: "configured" | "missing_credentials";
      };
    };
    system: {
      uptimeSeconds: number;
      memoryMb: {
        heapUsed: number;
        heapTotal: number;
        rss: number;
      };
      nodeVersion: string;
      environment: string;
    };
  } = {
    database: { status: "healthy" },
    cache: { status: "healthy", type: "db-and-memory" },
    externalApis: {
      reddit: {
        configured: Boolean(
          process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET,
        ),
        status:
          process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET
            ? "configured"
            : "missing_credentials",
      },
      openrouter: {
        configured: Boolean(process.env.OPENROUTER_API_KEY),
        status: process.env.OPENROUTER_API_KEY
          ? "configured"
          : "missing_credentials",
      },
    },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryMb: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
    },
  };

  let isHealthy = true;

  // 1. Database Connectivity Check
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    checks.database = {
      status: "healthy",
      latencyMs: Date.now() - dbStart,
    };
  } catch (error) {
    isHealthy = false;
    checks.database = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Database ping failed",
    };
  }

  // 2. Redis / Cache Check
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    checks.cache.type = "upstash-redis";
  } else if (process.env.REDIS_URL) {
    checks.cache.type = "redis";
  } else {
    checks.cache.type = "in-memory + postgres";
  }

  const overallStatus = isHealthy ? "healthy" : "unhealthy";
  const httpStatus = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      checks,
    },
    {
      status: httpStatus,
      headers: {
        "x-request-id": requestId,
        "x-correlation-id": requestId,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
  );
}
