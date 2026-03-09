"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type MiningPhase =
  | "queued"
  | "running"
  | "scanning"
  | "extracting"
  | "clustering"
  | "completed"
  | "failed"
  | "canceled";

export type MiningStreamState = {
  phase: MiningPhase;
  message: string;
  progress: number;
  painPointCount: number;
  postsFetched: number;
  commentsFetched: number;
  status: MiningPhase;
  subreddits: string[];
};

const INITIAL_STATE: MiningStreamState = {
  phase: "running",
  message: "Initializing Reddit data pipeline...",
  progress: 10,
  painPointCount: 0,
  postsFetched: 0,
  commentsFetched: 0,
  status: "running",
  subreddits: [],
};

/**
 * Subscribe to the SSE mining stream for a given scraper ID.
 * Falls back to polling `/api/search/status` if SSE fails.
 */
export function useMiningStream(scraperId: string | null) {
  const [state, setState] = useState<MiningStreamState>(INITIAL_STATE);
  const [isDone, setIsDone] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (fallbackRef.current) {
      clearInterval(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  const startPollingFallback = useCallback(
    (id: string, onData: (data: MiningStreamState) => void) => {
      if (fallbackRef.current) return;

      fallbackRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/search/status?id=${id}`);
          if (!response.ok) return;

          const data = await response.json();
          const phase = data.status ?? "running";

          onData({
            phase,
            message: `Processing... Found ${data.painPointCount ?? 0} pain points.`,
            progress:
              phase === "completed"
                ? 100
                : phase === "failed"
                  ? 100
                  : 50,
            painPointCount: data.painPointCount ?? 0,
            postsFetched: data.latestRun?.postsFetched ?? 0,
            commentsFetched: data.latestRun?.commentsFetched ?? 0,
            status: phase,
            subreddits: data.scraper?.subreddits ?? [],
          });
        } catch {
          // ignore polling errors
        }
      }, 2_000);
    },
    []
  );

  useEffect(() => {
    if (!scraperId) return;

    cleanup();

    const handleEvent = (data: MiningStreamState) => {
      setState(data);

      if (
        data.phase === "completed" ||
        data.status === "completed"
      ) {
        setIsDone(true);
        setHasFailed(false);
        cleanup();
      } else if (
        data.phase === "failed" ||
        data.phase === "canceled" ||
        data.status === "failed" ||
        data.status === "canceled"
      ) {
        setHasFailed(true);
        cleanup();
      }
    };

    // Try SSE first
    try {
      const es = new EventSource(`/api/search/stream?id=${scraperId}`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as MiningStreamState;
          handleEvent(parsed);
        } catch {
          // ignore malformed events
        }
      };

      es.onerror = () => {
        // SSE failed — fall back to polling
        es.close();
        eventSourceRef.current = null;
        startPollingFallback(scraperId, handleEvent);
      };
    } catch {
      // EventSource not available — fall back to polling
      startPollingFallback(scraperId, handleEvent);
    }

    return cleanup;
  }, [scraperId, cleanup, startPollingFallback]);

  return { ...state, isDone, hasFailed };
}
