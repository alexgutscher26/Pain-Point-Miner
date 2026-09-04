import { db } from "@/lib/db";
import { scraper, scraperRun, painPoint } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { headers } from "next/headers";
import { normalizeRunStatus, type RunStatus } from "@/lib/run-status";
import { getTimeWindowLabel, normalizeTimeWindow } from "@/lib/time-window";

const querySchema = z.object({
  id: z.string().uuid("Invalid scraper id"),
});

const POLL_INTERVAL_MS = 2_000;
const MAX_DURATION_MS = 5 * 60 * 1_000; // 5 minutes max

type StreamEvent = {
  phase: RunStatus;
  message: string;
  progress: number;
  painPointCount: number;
  postsFetched: number;
  postsSkipped: number;
  commentsFetched: number;
  status: RunStatus;
  subreddits: string[];
  timeWindow: string;
  customPatterns: string[];
  throttleWarnings: string[];
};

function phaseToProgress(phase: RunStatus): number {
  switch (phase) {
    case "queued":
      return 5;
    case "running":
    case "scanning":
      return 20;
    case "extracting":
      return 55;
    case "clustering":
      return 80;
    case "completed":
      return 100;
    case "failed":
    case "canceled":
      return 100;
    default:
      return 10;
  }
}

function phaseToMessage(
  phase: RunStatus,
  subreddits: string[],
  painPointCount: number,
  postsFetched: number,
  postsSkipped: number,
): string {
  switch (phase) {
    case "queued":
      return "Initializing Reddit data pipeline...";
    case "running":
    case "scanning":
      return subreddits.length > 0
        ? `Scanning r/${subreddits[0]}${subreddits.length > 1 ? ` and ${subreddits.length - 1} more...` : "..."}`
        : "Scanning Reddit communities...";
    case "extracting":
      return `Analyzing ${postsFetched} high-signal posts. Skipped ${postsSkipped} noisy results.`;
    case "clustering":
      return `Extracted ${painPointCount} opportunities. Clustering insights...`;
    case "completed":
      return `Analysis complete. Found ${painPointCount} pain points.`;
    case "failed":
      return "Analysis failed. Please retry this scan.";
    case "canceled":
      return "Analysis was canceled.";
    default:
      return "Processing...";
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(await headers());
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ id: searchParams.get("id") });
  if (!parsed.success) {
    return new Response("Invalid scraper id", { status: 400 });
  }

  const scraperId = parsed.data.id;
  const userId = session.user.id;

  // Verify scraper ownership
  const scraperRecord = await db.query.scraper.findFirst({
    where: and(eq(scraper.id, scraperId), eq(scraper.userId, userId)),
  });

  if (!scraperRecord) {
    return new Response("Scraper not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const startedAt = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      let isTerminal = false;

      const poll = async () => {
        try {
          const latestRun = await db.query.scraperRun.findFirst({
            where: eq(scraperRun.scraperId, scraperId),
            orderBy: [desc(scraperRun.startedAt)],
          });

          const results = await db.query.painPoint.findMany({
            where: and(
              eq(painPoint.scraperId, scraperId),
              eq(painPoint.userId, userId),
            ),
            columns: { id: true },
          });

          const phase = normalizeRunStatus(latestRun?.status);
          const painPointCount = results.length;
          const subreddits = scraperRecord.subreddits ?? [];
          const timeWindow = getTimeWindowLabel(
            normalizeTimeWindow(scraperRecord.timeWindow),
          );

          const event: StreamEvent = {
            phase,
            message: phaseToMessage(
              phase,
              subreddits,
              painPointCount,
              latestRun?.postsFetched ?? 0,
              latestRun?.postsSkipped ?? 0,
            ),
            progress: phaseToProgress(phase),
            painPointCount,
            postsFetched: latestRun?.postsFetched ?? 0,
            postsSkipped: latestRun?.postsSkipped ?? 0,
            commentsFetched: latestRun?.commentsFetched ?? 0,
            status: phase,
            subreddits,
            timeWindow,
            customPatterns: scraperRecord.customPatterns ?? [],
            throttleWarnings: (latestRun?.throttleWarnings as string[]) ?? [],
          };

          send(event);

          if (
            phase === "completed" ||
            phase === "failed" ||
            phase === "canceled"
          ) {
            isTerminal = true;
            if (interval) clearInterval(interval);
            try {
              controller.close();
            } catch {
              // already closed
            }
          }
        } catch (err) {
          console.error("SSE poll error:", err);
        }
      };

      let interval: ReturnType<typeof setInterval> | null = null;

      // Initial send
      await poll();

      if (!isTerminal) {
        interval = setInterval(async () => {
          if (isTerminal || Date.now() - startedAt > MAX_DURATION_MS) {
            if (interval) clearInterval(interval);
            try {
              controller.close();
            } catch {
              // already closed
            }
            return;
          }
          await poll();
        }, POLL_INTERVAL_MS);
      }

      // Cleanup if client disconnects
      req.signal.addEventListener("abort", () => {
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
