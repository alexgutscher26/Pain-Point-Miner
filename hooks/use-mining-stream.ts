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
  postsSkipped: number;
  commentsFetched: number;
  status: MiningPhase;
  subreddits: string[];
  timeWindow: string;
  customPatterns: string[];
  throttleWarnings: string[];
};

const INITIAL_STATE: MiningStreamState = {
  phase: "running",
  message: "Initializing Reddit data pipeline...",
  progress: 10,
  painPointCount: 0,
  postsFetched: 0,
  postsSkipped: 0,
  commentsFetched: 0,
  status: "running",
  subreddits: [],
  timeWindow: "Last 90d",
  customPatterns: [],
  throttleWarnings: [],
};

/**
 * Subscribe to the SSE mining stream for a given scraper ID.
 * Falls back to polling `/api/search/status` if SSE fails.
 */
export function useMiningStream(scraperId: string | null) {
  const [state, setState] = useState<MiningStreamState>(INITIAL_STATE);
  const [isDone, setIsDone] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [hydratedScraperId, setHydratedScraperId] = useState<string | null>(
    null,
  );
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const retryCountRef = useRef(0);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (fallbackRef.current) {
      clearInterval(fallbackRef.current);
      fallbackRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(
    async (id: string, onData: (data: MiningStreamState) => void) => {
      try {
        const response = await fetch(`/api/search/status?id=${id}`);
        if (!response.ok) return;

        const data = await response.json();
        const phase = data.status ?? "running";

        onData({
          phase,
          message: `Processing... Found ${data.painPointCount ?? 0} pain points.`,
          progress: phase === "completed" ? 100 : phase === "failed" ? 100 : 50,
          painPointCount: data.painPointCount ?? 0,
          postsFetched: data.latestRun?.postsFetched ?? 0,
          postsSkipped: data.latestRun?.postsSkipped ?? 0,
          commentsFetched: data.latestRun?.commentsFetched ?? 0,
          status: phase,
          subreddits: data.scraper?.subreddits ?? [],
          timeWindow: data.timeWindowLabel ?? "Last 90d",
          customPatterns: data.scraper?.customPatterns ?? [],
          throttleWarnings: data.latestRun?.throttleWarnings ?? [],
        });
      } catch {
        // ignore polling errors
      }
    },
    [],
  );

  const startPollingFallback = useCallback(
    (id: string, onData: (data: MiningStreamState) => void) => {
      if (fallbackRef.current) return;

      // Immediately fetch once
      void fetchStatus(id, onData);

      fallbackRef.current = setInterval(() => {
        void fetchStatus(id, onData);
      }, 2_000);
    },
    [fetchStatus],
  );

  useEffect(() => {
    if (!scraperId) return;

    cleanup();
    retryCountRef.current = 0;

    const handleEvent = (data: MiningStreamState) => {
      setState(data);
      setHydratedScraperId(scraperId);

      if (data.phase === "completed" || data.status === "completed") {
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

    const connectSSE = () => {
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
          es.close();
          eventSourceRef.current = null;

          // Attempt reconnection up to 2 times with exponential backoff before falling back
          if (retryCountRef.current < 2) {
            retryCountRef.current += 1;
            const delay = retryCountRef.current * 1000;
            reconnectTimeoutRef.current = setTimeout(connectSSE, delay);
          } else {
            startPollingFallback(scraperId, handleEvent);
          }
        };
      } catch {
        startPollingFallback(scraperId, handleEvent);
      }
    };

    connectSSE();

    return cleanup;
  }, [scraperId, cleanup, startPollingFallback]);

  return {
    ...state,
    isDone,
    hasFailed,
    hasHydrated: hydratedScraperId === scraperId,
  };
}
