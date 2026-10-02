/**
 * Re-export mining runner pipeline from modular sub-packages:
 * - discovery: Subreddit deduplication, post quality scoring, time-filtering
 * - extraction: Single post AI extraction, comments formatting, clustering jobs
 * - runner: Orchestration of 5-phase pipeline, adaptive concurrency, progress tracking
 */
export * from "./mining/index";
