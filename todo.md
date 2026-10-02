# 📋 RPP — Reddit Pain-Point Miner: Comprehensive TODO

> **Last Updated:** 2026-07-14  
> **Project:** AI-powered Reddit market research engine  
> **Stack:** Next.js 16, React 19, TypeScript 5, Drizzle ORM, PGVector, Neon, Better Auth, Stripe, OpenRouter

---

## Legend

| Symbol | Status                   |
| ------ | ------------------------ |
| `[ ]`  | Not started              |
| `[/]`  | In progress              |
| `[x]`  | Completed                |
| `[!]`  | Blocked / needs decision |
| `[~]`  | Deferred / backlog       |

---

## 🏗️ 1. Core Infrastructure & Architecture

### 1.1 Database & Schema

- [z] Add `HNSW` index tuning parameters (`m`, `ef_construction`) to `pain_point_embedding` for better ANN recall at scale
- [x] Add a composite GIN index on `pain_point.tags` array column for fast tag filtering
- [x] Create a materialized view for the dashboard opportunity scoring query (avoids full scans on every page load)
- [x] Add `pain_point.upvoteCount` column (currently using `score` which conflates upvotes + downvotes)
- [x] Add `scraper.lastSuccessfulRunAt` column separate from `lastRunAt` (currently ambiguous if last run errored)
- [x] Implement soft-delete cascade: when `scraper.deletedAt` is set, also set `pain_point.deletedAt` in a trigger/job
- [x] Add `pain_point_cluster.memberCount` denormalized column (avoid COUNT(\*) on every cluster render)
- [x] Add `workspace.plan` column so workspace-level entitlements can override user-level plan
- [x] Add a `changelog` table to track schema migrations with description + applied_at for ops visibility
- [x] Create `user_notification_preferences` table (email digest, scan complete alerts, threshold notifications)
- [x] Partition `scraper_run` by month for improved query performance at scale (>1M rows)
- [x] Add `pain_point.sourceType` enum: `post | comment | cross_post` for source attribution
- [x] Add `pain_point.redditPostId` column to de-duplicate at the pain point level (not just AI idempotency)
- [x] Create `scraper_run_event` table for granular per-phase timing/metrics instead of only start/finish timestamps
- [x] Add `ai_usage.runId` FK to `scraper_run` for complete cost-per-run attribution

### 1.2 Environment & Configuration

- [x] Validate all required env vars at startup (throw descriptive errors, not cryptic runtime failures)
- [x] Add `OPENROUTER_BASE_URL` override env var for self-hosted or proxy setups
- [x] Add `MAX_CONCURRENT_AI_EXTRACTIONS` env var to throttle parallelism (currently hardcoded)
- [x] Add `PGVECTOR_COSINE_THRESHOLD` env var to make cluster similarity configurable without deploys
- [x] Add `EMBEDDING_BATCH_SIZE` env var (currently embeds pain points one by one)
- [x] Document all env vars in `.env.example` with type annotations and valid values
- [x] Validate `STRIPE_WEBHOOK_SECRET` is set before registering webhook route (fail fast)
- [x] Add `FEATURE_FLAGS` JSON env var for runtime feature toggling without deploys

### 1.3 Error Handling & Observability

- [x] Implement structured logging with `pino` or `winston` (replace scattered `console.log/error`)
- [x] Add OpenTelemetry traces to the mining pipeline phases (SCANNING → EXTRACTING → CLUSTERING)
- [ ] Set up Sentry error monitoring for both server-side and client-side errors (DSN in env, `SentryErrorBoundary` wrapper in `app/layout.tsx`)
- [x] Add `X-Request-ID` header propagation through the mining pipeline for request tracing
- [x] Create an `/api/health` endpoint with DB connectivity, Redis, and external API checks
- [ ] Add a `metrics` endpoint compatible with Prometheus scraping (scan counts, error rates, latency p50/p95/p99)
- [ ] Log all Reddit API 429 responses to `reddit_rate_limit_log` table and surface throttle graph in admin dashboard
- [ ] Create alert thresholds: notify admin if error rate > 5% in a rolling 10-minute window (via Inngest or cron)
- [ ] Add dead-letter queue for failed AI extractions (retry with exponential backoff up to 3 times, then move to `extraction_failures` table)
- [ ] Emit structured audit log events for all billing-affecting actions (scan start, plan upgrade, credit purchase, LTD redemption)
- [ ] Add `requestId` correlation across all log lines in a single mining run for easy tracing in Datadog/Logflare

---

## 🤖 2. Mining Pipeline

### 2.1 Reddit API & Scraping

- [x] Add Reddit OAuth token refresh logic with automatic retry (currently token can expire mid-run)
- [x] Implement subreddit existence validation before starting a scan (avoid silent 404s)
- [x] Add support for Reddit's `after`/`before` pagination cursors to fetch more than 100 posts per subreddit
- [x] Cache Reddit OAuth tokens in Redis/DB across requests (not per-request re-auth)
- [x] Add `REDDIT_RATE_LIMIT_DELAY_MS` env var to insert deliberate delays and stay within Reddit's API limits
- [x] Support fetching from multiple Reddit sort modes in a single run (new + hot + top) without duplicating posts
- [x] Add PullPush.io as a more robust fallback for historical data (currently partially implemented)
- [x] Validate that `customPatterns` regex strings compile without errors before accepting a scan config
- [x] Add subreddit subscriber count check — skip subreddits with < 1,000 subscribers (low signal)
- [x] Track which subreddit each post came from in `scraperPost` for per-subreddit analytics
- [x] Add support for `r/all` search using Reddit's global search endpoint
- [x] Implement `multiReddit` scraping (combine multiple subreddits into a single Reddit API call)
- [x] Add `miningDepth` = `"ultra"` tier for exhaustive comment tree traversal (Pro plan only)
- [ ] Add Reddit `flair` filter support: only scrape posts with specific flairs (e.g., "Question", "Help Needed")
- [ ] Implement cross-post detection: if a post appears in multiple subreddits, merge and de-duplicate at ingest
- [ ] Add `awards` count to post metadata — award count is a strong signal of high community validation
- [ ] Implement `saved-replies` scraping: collect top-voted comment threads, not just posts, as first-class entities
- [ ] Add domain filter: skip posts that are only link posts with no body text (low extraction value)
- [ ] Build a subreddit health checker: warn if a subreddit has < 5 posts/day activity before starting a scan
- [ ] Throttle per-subreddit concurrency dynamically: slow down if response time > 2s (adaptive rate limiting)
- [ ] Add a `botAccountFilter`: exclude posts from known bot accounts (flair-based heuristic or allowlist)

### 2.2 AI Extraction

- [x] Batch multiple posts into a single OpenRouter request to reduce API call overhead and latency
- [x] Add a confidence score to each AI extraction (0–1) and filter out low-confidence results
- [x] Implement fallback model chain: if primary model fails, retry with a cheaper/faster model
- [x] Add extraction schema versioning — when the prompt changes, re-run extraction on cached posts
- [x] Extract `targetUser` persona from posts (e.g., "solo founder", "enterprise IT manager")
- [x] Extract `competingProducts` from post text automatically during AI extraction
- [x] Add `willingnessToPay` signal extraction (free-tier vs paid signal from post language)
- [x] Support multi-language posts — detect language and extract in English with `originalLanguage` stored
- [x] Add `featureRequested` extraction field: what specific solution/feature is the user asking for
- [x] Implement streaming AI responses for long posts to reduce timeout risk
- [x] Create a golden dataset validation pipeline: run extractions against `ai_golden_dataset` on every deploy
- [x] Add A/B testing for prompt versions (randomly assign prompts, compare F1 scores in `ai_eval_log`)
- [x] Store raw LLM response alongside structured extraction for debugging and prompt improvement
- [ ] Add `ai.ts` TypeScript interfaces for all OpenRouter response shapes (eliminate `any` types) — blocked by schema variance across models
- [ ] Implement extraction result caching keyed by `(postId, promptVersion)`: avoid re-extracting unchanged posts
- [ ] Add a `extractionQualityGate`: if average confidence < 0.6 in a batch, flag the run for manual review
- [ ] Support structured output / JSON mode for all models that support it (reduces hallucination rate)
- [ ] Add `problemCategory` extraction field (e.g., "workflow", "pricing", "reliability", "onboarding") for cluster taxonomy
- [ ] Implement `urgencySignals` extraction: detect language indicating acute frustration vs. mild annoyance
- [ ] Add `postSentiment` field: overall post sentiment score (negative / mixed / neutral) independent of pain extraction
- [ ] Create a "re-extraction" job: for any pain point with confidence < 0.5, re-run against a higher-quality model
- [ ] Build a prompt playground in admin: enter a raw Reddit post, compare extraction results across models side-by-side

### 2.3 Embedding & Clustering

- [ ] Batch embedding API calls (currently one call per pain point — very expensive at scale; target batches of 50+)
- [ ] Add a HNSW index rebuild job when `m` or `ef_construction` parameters change (trigger via Inngest event)
- [ ] Implement hierarchical clustering: micro-clusters → macro-themes for top-level report generation
- [x] Add cluster merge job: when two clusters drift too close (cosine > 0.95), merge them automatically
- [ ] Store the cluster centroid as a `vector(1536)` type (currently stored as `double_precision[]` — loses PGVector operators)
- [ ] Add cluster quality score (intra-cluster similarity variance — lower = tighter cluster, surface in admin)
- [ ] Implement cluster labels auto-generation using LLM summarization of the top 3 canonical pain point bodies
- [ ] Add `clusterVersion` integer to track when a cluster's centroid was last recalculated (incremented on each update)
- [ ] Implement incremental cluster updates (update centroid on new member, not full recompute — use Welford's algorithm)
- [ ] Add `orphan detection` job: pain points not assigned to any cluster after 24h should trigger a re-cluster pass
- [ ] Add cluster taxonomy: allow users to manually label a cluster with a category tag that persists across re-clusters
- [ ] Implement "cluster splitting": if a cluster's variance score > threshold, auto-split into two sub-clusters
- [ ] Build a cluster similarity graph view: show how clusters relate to each other using force-directed layout

### 2.4 Pipeline Reliability

- [ ] Implement `circuitBreaker` for OpenRouter calls (open after 5 consecutive failures, half-open after 60s)
- [ ] Add per-run timeout: if the pipeline exceeds 15 minutes, mark as `timeout` and clean up orphaned DB records
- [ ] Implement idempotent run creation: calling start-scan twice for the same config returns the existing in-progress run
- [ ] Add run resumption: if a run fails mid-EXTRACTING, resume from the last successfully processed post batch
- [ ] Add pipeline step checkpoints — save `currentPhase` + `processedCount` to DB so server restarts don't lose work
- [ ] Implement graceful shutdown: on `SIGTERM`, finish current AI request batch then stop cleanly, marking run as `paused`
- [ ] Add scan queue with concurrency limit (max 2 simultaneous runs per user, 20 global — enforced via Inngest)
- [ ] Create a `scraper_run.retryCount` column and auto-retry failed runs up to 2 times with full pipeline reset
- [ ] Add `estimatedCompletionAt` field on `scraperRun`: calculate based on post count × avg extraction time and surface in UI
- [ ] Emit `run:progress` SSE events for each pipeline stage completion (SCANNING done → EXTRACTING done → etc.)

---

## 📊 3. Dashboard & Analytics

### 3.1 Main Dashboard

- [x] Add a global "active scans" indicator in the nav showing live scan count across all scrapers (implemented in `components/dashboard/active-scans-indicator.tsx` + `/api/scans/active` route)
- [x] Implement dashboard card drag-to-reorder with persisted layout in `userPreferences.dashboardLayout` (implemented in `components/dashboard/dashboard-grid.tsx` + `app/api/settings/layout/route.ts`)
- [x] Add "Top Opportunities This Week" summary card showing highest-scored pain points (implemented in `components/dashboard/dashboard-top-opportunities.tsx`)
- [x] Implement a pain point heatmap calendar (GitHub-style) showing scan activity over time (implemented in `components/dashboard/dashboard-activity-heatmap.tsx`)
- [x] Add "Cluster Growth" sparkline chart showing how clusters evolved over past 30 days (implemented in `components/dashboard/dashboard-cluster-growth.tsx`)
- [x] Add a "Market Competition Radar" chart: plot pain points on a 2D axis (pain intensity × market maturity) (implemented in `components/dashboard/dashboard-market-radar.tsx` + `lib/dashboard-analytics.ts`)
- [x] Implement a "Quick Actions" panel: start scan, view latest report, jump to top opportunity (implemented in `components/dashboard/dashboard-quick-actions.tsx`)
- [x] Add configurable time-range selector (7d, 30d, 90d, 1y, all-time) that applies globally to all dashboard metrics (implemented in `components/dashboard/dashboard-time-range-selector.tsx` + `app/(dashboard)/dashboard/page.tsx`)
- [x] Add "Comparison Mode": select two scrapers/keywords and compare their pain point distributions side-by-side (implemented in `app/(dashboard)/dashboard/compare/page.tsx` + `lib/comparison.ts` + `components/dashboard/comparison-view.tsx`)
- [x] Implement "Saved Filters" — save complex filter combinations and switch between them instantly (implemented in `components/dashboard/saved-filters-menu.tsx` + `app/api/settings/saved-filters/route.ts`)
- [ ] Add a "My Watchlist" widget: pin specific keywords or clusters to the dashboard for at-a-glance monitoring
- [ ] Build a "Daily Brief" card: auto-generated 3-sentence AI summary of new pain points found in the last 24h
- [ ] Add a "Momentum Score" metric to each dashboard scraper card: are pain signals rising or falling this week?
- [ ] Implement a "Zero Results" diagnostic panel: if a scan found 0 pain points, show probable causes and suggestions
- [ ] Add a "Recent Activity" feed in the sidebar: last 10 scans, saves, and report views with timestamps
- [ ] Build a "Streak" gamification element: show how many consecutive days the user has run at least one scan

### 3.2 Pain Point Analytics

- [ ] Build a pain point detail view: full post body, comments, AI extraction scores, cluster membership, source link
- [ ] Add pain point timeline view: show how many pain points per keyword were found per day (sparkline chart)
- [ ] Implement pain point tagging UX: let users add custom tags on top of AI-extracted tags (with autocomplete from existing tags)
- [ ] Add pain point bookmark/star feature (saved to `pain_point_bookmark` table, visible across sessions and in sidebar)
- [ ] Implement batch actions on pain points: bulk delete, bulk export, bulk tag, bulk move to cluster
- [ ] Add "Pain Point Evolution" view: show how a cluster's average severity scores changed over the past 90 days
- [ ] Build "Similar Pain Points" panel on the detail view using PGVector cosine search (top 5 nearest neighbors)
- [ ] Add pain point voting UI (thumbs up/down — `pain_point_feedback` table exists but has no UI surface)
- [ ] Implement pain point annotation: let users add private notes to any pain point (stored in `pain_point_note` table)
- [ ] Add "Ignore" action: flag a pain point as irrelevant so it's excluded from future cluster scoring (soft filter)
- [ ] Add "Source Context" panel: show the surrounding Reddit thread context (parent comment chain) for each pain point
- [ ] Build a "Competitor Mentions" section on the detail view: all competing products mentioned in the same thread
- [ ] Implement pain point deduplication UI: show potentially duplicate pain points side-by-side with "merge" action

### 3.3 Opportunity Scoring & Reports

- [ ] Add a "Score Explanation" modal showing exactly how the weighted score was computed (painIntensity × w1 + urgency × w2...)
- [ ] Implement custom scoring weights UI (sliders for painIntensity/urgency/monetization weights — stored in `scoringWeights`)
- [ ] Add "Validation Signals" breakdown: show upvotes, comments, and mention count contributions in a horizontal bar
- [ ] Build a full Report builder: select pain points → organize into sections → export as PDF/Markdown/Notion
- [ ] Add report versioning: save report snapshots in `report_version` table so historical reports remain accurate
- [ ] Implement report sharing: generate a public read-only URL (`/reports/public/[token]`) with configurable expiry
- [ ] Add report templates: "SaaS Opportunity Brief", "Competitive Landscape", "Market Validation Summary"
- [ ] Create a "One-Pager" report format: AI-generated executive summary from the top 5 clusters in < 400 words
- [ ] Add Notion/Google Docs export integration for reports (via OAuth + Notion API)
- [ ] Implement scheduled report emails: weekly digest of top opportunities in a watch-list (via Loops/Resend)
- [ ] Add a "Confidence Meter" on the report: aggregate AI confidence scores across all included pain points
- [ ] Build a "Report Comparison" view: place two report snapshots side-by-side to track market changes over time

### 3.4 Trend Detection

- [ ] Build a trend detection dashboard page showing keyword momentum (rising / falling / stable) with 30-day charts
- [ ] Add "New vs Recurring" split: distinguish freshly discovered pain points vs. those seen in previous runs (by `redditPostId`)
- [ ] Implement velocity metrics: pain points found per hour during a scan (mining efficiency rate, surface per run)
- [ ] Add cross-scraper trend detection: detect when the same pain phrase appears across multiple keyword searches
- [ ] Build a "Trend Alert" system: notify when a keyword's pain point count increases >20% week-over-week
- [ ] Add seasonality detection: flag keywords that spike at specific times of year (compare month-over-month baseline)
- [ ] Create a "Breakthrough Opportunities" feed: pain points with sudden sharp score increases (>15 points in 7 days)
- [ ] Add a "Fading Opportunities" feed: pain points whose scores are declining (market may be getting solved)
- [ ] Build a "Whitespace Map": visualize which niches have high demand but low existing product competition

---

## 🔐 4. Authentication & Authorization

### 4.1 Auth System (Better Auth)

- [ ] Add Google OAuth provider (currently email/password only — high-friction for new signups)
- [ ] Add GitHub OAuth provider (relevant for developer-focused niches, reduces friction for technical users)
- [ ] Implement magic-link email authentication as a lower-friction alternative to password
- [ ] Add passkey / WebAuthn support for passwordless login (browser native, no app needed)
- [ ] Implement two-factor authentication (TOTP via authenticator app — store `totpSecret` encrypted in `user` table)
- [ ] Add session management page: list active sessions with device/browser info, revoke individual sessions
- [ ] Implement `remember me` (30-day session extension) vs. automatic session expiry on browser close
- [ ] Add account lockout after 10 failed login attempts (store `failedLoginAttempts` + `lockedUntil` in `user` table)
- [ ] Implement email change flow with re-verification of new address before applying change
- [ ] Add password strength enforcement on registration (minimum entropy score using zxcvbn)
- [ ] Add `last_login_at` and `last_login_ip` tracking on the `user` table for security audit

### 4.2 Authorization & Multi-tenancy

- [ ] Implement workspace role-based access control: `owner | admin | member | viewer` enforced at API layer
- [ ] Add workspace invitation flow: invite by email → pending `workspace_invitation` record → accept/reject link in email
- [ ] Implement workspace transfer of ownership (with confirmation email to both parties)
- [ ] Add audit log per workspace: who ran which scan, who changed settings, who invited/removed members
- [ ] Implement data isolation: add ESLint rule enforcing all DB queries include `workspaceId` or `userId` scope
- [ ] Add API key system for programmatic access (create/revoke keys, per-key rate limits, usage tracking)
- [ ] Implement fine-grained permissions: viewer role cannot start scans, delete reports, or change settings
- [ ] Add IP allowlist per workspace (enterprise feature — `workspace_ip_allowlist` table)
- [ ] Build a "Leave Workspace" flow: member can exit with data ownership transfer prompt

---

## 💳 5. Billing & Monetization

### 5.1 Stripe Integration

- [x] Wire Stripe webhook handler to update subscription status on `customer.subscription.updated` events
- [ ] Handle `invoice.payment_failed` webhook: send email, show persistent in-app banner, 3-day grace period before downgrade
- [x] Handle `customer.subscription.deleted` webhook: immediately revoke plan access and notify user
- [ ] Implement Stripe Customer Portal link for self-serve plan changes, payment method update, and cancellation
- [ ] Add proration handling when users upgrade mid-cycle (Stripe `proration_behavior: 'create_prorations'`)
- [ ] Implement annual billing option (20% discount) with correct proration and clear UI toggle
- [ ] Add Stripe metered billing for AI credit top-ups (record usage events for overages via Stripe usage records)
- [ ] Create a billing history page showing all invoices with amounts, dates, and PDF download links
- [ ] Implement coupon/promo code support at checkout with campaign tracking
- [ ] Add dunning automation: email sequence for failed payments (day 1, 3, 7) before suspension
- [ ] Add `stripe_customer_id` null-check before any billing API calls with graceful "complete profile" redirect
- [ ] Implement `checkout.session.expired` webhook handler: clean up any pending plan flags and retry prompt

### 5.2 Credits & Usage

- [ ] Build a credits purchase flow: user can buy top-up packs (50/100/500 credits) without changing their plan
- [ ] Add real-time credit balance display in the dashboard sidebar with animated depletion on scan start
- [ ] Implement credit expiry: purchased top-up credits expire after 12 months (flag `expiresAt` in `credit_ledger`)
- [ ] Add usage analytics page: credits consumed per day, per scan, per model with cost breakdown chart
- [ ] Create credit usage breakdown by model — GPT-4o vs Gemini Flash costs differ 10×, surface this clearly
- [ ] Add a scan cost estimator: show estimated credits consumed before starting a scan (based on subreddit count × depth)
- [ ] Implement credit gifting: admin can manually add credits to any user account with an audit reason
- [ ] Add low-credit warnings at 20% and 10% remaining (toast notification + persistent dashboard banner)
- [ ] Create automated monthly usage report email: credits used, scans run, top keywords researched

### 5.3 Plan Management

- [ ] Add a clear plan comparison page in billing section (interactive features matrix table with hover details)
- [ ] Implement plan downgrade protection: show modal warning what features/data will be lost before confirming downgrade
- [ ] Add trial period support (7-day Pro trial for new signups — store `trialEndsAt` on `user` table)
- [ ] Implement LTD activation code redemption flow: `/billing/redeem` page with code input and instant plan upgrade
- [ ] Create admin panel to manually override any user's plan for support/compensation purposes (with audit log entry)
- [ ] Add `plan_change_history` table: track all plan transitions with `fromPlan`, `toPlan`, `changedAt`, `reason`
- [ ] Implement team/seat-based billing for workspace plans (per-seat pricing with seat management UI)
- [ ] Add revenue analytics in admin: MRR, ARR, churn rate, LTV by plan, expansion revenue, contraction revenue
- [ ] Build a "Pause Subscription" feature: freeze plan for up to 3 months (keeps data, suspends new scans)

---

## 🎨 6. UI/UX & Frontend

### 6.1 Design System & Components

- [x] Audit all color usages — ensure full dark mode support with no hardcoded light-mode values
- [x] Add skeleton loading states to all data-fetching components (replace spinner with content-shaped skeletons)
- [x] Implement consistent empty state components with actionable CTAs (e.g., "Start your first scan")
- [x] Add `ErrorBoundary` components around all major dashboard sections
- [x] Create a unified toast notification system (success, error, warning, info) with queue deduplication
- [ ] Audit and fix all Radix/Shadcn accessibility attributes (aria-labels, focus traps, keyboard navigation)
- [ ] Add keyboard shortcuts for common actions (`Cmd+K` for command palette, `Cmd+N` for new scan, `Cmd+S` to save report)
- [ ] Build a command palette (`Cmd+K`) for quick navigation and action execution using `cmdk` (already installed)
- [x] Create `<PlanGate>` React component that wraps features with upgrade prompts
- [x] Add a `<Tooltip>` component with feature explanations on all score/metric labels
- [ ] Build a `<ConfirmDialog>` reusable component for all destructive actions (delete scan, delete report, leave workspace)
- [ ] Add a `<CopyButton>` component for one-click copying of pain point text, report snippets, and API keys
- [ ] Implement a `<VirtualTable>` component using `@tanstack/react-virtual` for pain point lists > 100 rows
- [ ] Add focus-visible styles to all interactive elements for keyboard accessibility compliance
- [ ] Create a `<ProgressRing>` component for circular credit usage display in the sidebar

### 6.2 Mining & Analysis UX

- [x] Add a scan wizard UX: step-by-step guided scan setup for new users
- [x] Implement live post counter during scanning phase (WebSocket or SSE update)
- [ ] Add "Pause" and "Cancel" buttons during an active scan (call `/api/search/cancel` → set `status: cancelled`)
- [ ] Show per-subreddit progress during scanning (posts found per sub, success/fail indicator per sub)
- [ ] Add a pain point preview during extraction phase (stream results as they come in, not just at the end)
- [ ] Build a subreddit search/autocomplete component fetching suggestions from `subredditCache` via `/api/search/suggest-subreddits`
- [ ] Add a keyword suggestion panel: when user types, suggest related terms from previous successful scans
- [x] Implement scan presets (quick-start templates for popular niches: "SaaS tools", "Developer tools", "E-commerce")
- [ ] Add a "Clone Scan" button to duplicate an existing scraper configuration with one click
- [ ] Show scan history per scraper: list of all `scraperRun` records with status, post count, pain points found, and cost
- [ ] Add a "Retry Failed Scan" button on runs with `status: error` that re-queues with the same config
- [ ] Build an "Advanced Settings" collapsible section in scan config: custom patterns, mining depth, dedup mode
- [ ] Add a scan schedule builder: run a scraper automatically on a daily/weekly cadence (store as `scraper.schedule`)

### 6.3 Onboarding

- [x] Build a multi-step onboarding flow (currently `onboardingComplete` flag exists but flow is minimal)
- [x] Add an interactive product tour using `driver.js` or similar (highlight key features on first login)
- [x] Create sample/demo data for new accounts (show what results look like before first scan)
- [ ] Add contextual help tooltips throughout the app (linked to `/docs` sections with `?` icon trigger)
- [ ] Implement `checklist` onboarding widget: "Complete your profile", "Run your first scan", "Save your first report"
- [ ] Add a "Welcome" email sequence via Loops/Resend for new signups (Day 0, Day 2 tips, Day 7 feature highlight)
- [ ] Build an "Aha Moment" detector: when user views their first pain point with score > 80, trigger a celebration prompt
- [ ] Add a "Sample Report" view accessible before first scan (static pre-generated report showing platform capabilities)
- [ ] Implement onboarding progress persistence: if user closes mid-flow, resume from where they left off

### 6.4 Mobile & Responsive Design

- [x] Audit all dashboard pages for mobile responsiveness (currently primarily desktop-focused)
- [x] Make the data tables horizontally scrollable with fixed first column on mobile
- [x] Add a mobile-optimized bottom tab navigation for dashboard sections
- [x] Ensure all modals/dialogs have proper mobile keyboard-aware scroll behavior
- [x] Test and fix chart rendering on small screen sizes (Recharts responsive containers)
- [ ] Add swipe gesture support for dismissing toasts and closing mobile sidebar
- [ ] Optimize touch targets: all interactive elements minimum 44×44px on mobile
- [ ] Add pull-to-refresh on the dashboard main page for mobile users
- [ ] Test and fix landscape orientation layout on tablet-size screens

---

## 🧪 7. Testing & Quality

### 7.1 Unit Tests

- [x] Write unit tests for `lib/dashboard-metrics.ts` (score formula edge cases)
- [x] Write unit tests for `lib/plan-gating.ts` (all plan entitlement checks, credit calculations)
- [x] Write unit tests for `lib/trend-detection.ts` (rising, falling, stable classification logic)
- [x] Write unit tests for `lib/clustering.ts` (similarity threshold, new cluster creation, merge logic)
- [x] Write unit tests for `lib/budget-signals.ts` (signal extraction pattern matching)
- [x] Write unit tests for `lib/plan-resolver.ts` (priority ordering, LTD tier handling)
- [x] Write unit tests for `lib/run-status.ts` (phase normalization edge cases)
- [x] Write unit tests for `lib/notifications.ts` (deduplication window, disableDedupe override)
- [x] Write unit tests for `components/ui/section-error-boundary.tsx` (lifecycle and fallback rendering)
- [ ] Write unit tests for `lib/reddit/ranking.ts` — weighted ranking formula edge cases
- [ ] Write unit tests for `lib/comparison.ts` — distribution delta calculation correctness
- [ ] Write unit tests for `lib/saved-filters.ts` — preset serialization and filter application logic
- [ ] Add property-based tests for scoring formula: fuzz with random inputs, assert output always in 0–100 range
- [ ] Write unit tests for `lib/mining/extraction.ts` — batching logic and error isolation per post
- [ ] Reach 80%+ branch coverage on all `lib/` files (configure `@vitest/coverage-v8` reporter in CI)

### 7.2 Integration Tests

- [ ] Write integration tests for `POST /api/search` (create scan, verify `scraper`, `scraperRun` DB records created)
- [ ] Write integration tests for `GET /api/search/stream` SSE endpoint (verify phase event sequence: scanning → extracting → clustering → completed)
- [ ] Write integration tests for `/api/billing/` Stripe webhook handler (mock all webhook event types)
- [ ] Write integration tests for `/api/reports/` CRUD endpoints (create, read, update, delete with auth checks)
- [ ] Write integration tests for `/api/settings/saved-filters` (save, load, delete filter presets)
- [ ] Test plan gating at the API layer: verify 403 responses when plan scan limits are exceeded
- [ ] Write integration tests for workspace creation, member invitation, and role enforcement on API routes
- [ ] Add integration tests for `/api/settings/layout` (save and retrieve card order, verify DB persistence)

### 7.3 End-to-End Tests (Playwright)

- [ ] E2E: Full sign-up → onboarding → first scan → view results → save report flow
- [ ] E2E: Billing upgrade flow in Stripe test mode (click Upgrade → complete checkout → verify plan change in UI)
- [ ] E2E: Report save → generate public share link → view via public URL in incognito
- [ ] E2E: Workspace creation → invite member → member logs in → runs scan → owner views results
- [ ] E2E: SSE stream completes correctly (verify all phase events render in the correct order in UI)
- [ ] Add visual regression tests for key dashboard screenshots using `toHaveScreenshot` with baseline images
- [ ] Set up CI Playwright runs against a Vercel preview deployment with seeded test data via API
- [ ] E2E: Dark mode toggle persists across page navigations and page reloads

### 7.4 AI Evaluation

- [ ] Expand `ai_golden_dataset` to at least 100 labeled examples across 10 distinct niches
- [ ] Automate golden dataset evaluation on every PR (fail CI if overall F1 drops > 2% vs main branch)
- [ ] Add per-niche F1 score breakdown (extraction quality often varies by domain — B2B vs consumer)
- [ ] Compare Gemini 2.0 Flash vs GPT-4o on extraction quality and cost per 1000 pain points
- [ ] Build a UI for reviewing AI evaluation results and flagging model disagreements for dataset labeling
- [ ] Add semantic similarity evaluation: compare extracted pain point text to source post using embedding distance

---

## 🔒 8. Security

### 8.1 API Security

- [ ] Implement rate limiting on all public API routes — audit `lib/rate-limit.ts` coverage vs. all route handlers
- [ ] Add CSRF protection for all state-mutating API routes (use `next-csrf` or `better-auth` built-in CSRF)
- [ ] Validate and sanitize all user-supplied inputs before DB insertion (especially `keywords`, `customPatterns` regex fields)
- [ ] Ensure Reddit post `author` field is anonymized at query time when `anonymizeRedditUsernames` is true
- [x] Add Content-Security-Policy headers to all pages
- [ ] Implement request size limits: reject payloads > 50KB on `/api/search` to prevent large payload DoS
- [ ] Audit all API routes: ensure every state-mutating route validates session before proceeding (no auth bypass)
- [x] Add SQL injection protection audit: verify all DB queries use parameterized Drizzle ORM calls
- [ ] Implement API key hashing: store only SHA-256 hash of API key in DB, never the plaintext value
- [ ] Add `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` headers globally
- [ ] Implement `Referrer-Policy: strict-origin-when-cross-origin` on all API responses

### 8.2 Data Privacy

- [ ] Implement GDPR-compliant data export: "Download My Data" button generates ZIP with all user data as JSON
- [ ] Implement full account deletion: cascade delete all user data (pain points, scrapers, runs, embeddings, billing records)
- [ ] Add data retention policy: auto-delete `scraper_run` records older than 1 year with user-configurable override
- [ ] Implement Right to Erasure for Reddit author data: wipe all `author` fields on user request via admin or self-service
- [ ] Add a privacy settings page: data retention preferences, anonymization settings, third-party data sharing toggles
- [x] Add cookie consent banner (GDPR/CCPA compliance)
- [x] Review third-party scripts (analytics, support widgets) for data transfer compliance
- [ ] Add `data_processing_agreement` acceptance tracking for workspace creation (required for B2B compliance)

### 8.3 Dependency Security

- [x] Set up `bun audit` in CI pipeline (fail on high severity CVEs)
- [ ] Enable Dependabot or Renovate for automated dependency update PRs with auto-merge for patch updates
- [ ] Pin all production dependencies to exact versions in `package.json` (remove `^` caret ranges on critical deps)
- [ ] Audit OpenRouter SDK usage: ensure API keys are never logged or included in error message strings
- [ ] Review Stripe Webhook signature verification: confirm `stripe.webhooks.constructEvent` is always used, never skipped

---

## 🚀 9. Performance

### 9.1 Database Performance

- [ ] Add `EXPLAIN ANALYZE` logging for all queries taking > 100ms in development (use Drizzle logger hook)
- [ ] Add PGVector HNSW index with optimized `ef_search=64` for `findSimilarPainPoints` queries
- [ ] Implement query result caching with Redis for dashboard metrics (5-minute TTL, invalidate on new run complete)
- [ ] Paginate all listing queries: pain points, scraper runs — enforce `LIMIT/OFFSET` or cursor-based pagination
- [ ] Add DB connection pooling configuration (Neon serverless pooler: `max=20`, `idleTimeoutMs=30000`)
- [ ] Create a weekly `VACUUM ANALYZE` Inngest job on large tables (`pain_point`, `pain_point_embedding`)
- [ ] Add a slow query detection middleware that logs queries > 200ms to `slow_query_log` table
- [ ] Add composite indexes on frequently filtered column combinations (e.g., `(workspaceId, status, createdAt)`)

### 9.2 API & Server Performance

- [ ] Implement React Server Component streaming for the dashboard main page (move heavy data fetches to Server Components)
- [ ] Add `next/cache` `unstable_cache` for expensive server-side data fetches (5-min TTL on opportunity scores)
- [ ] Configure `staleWhileRevalidate` ISR for public-facing pages: landing, blog posts, docs, feature pages
- [ ] Bundle size audit: run `@next/bundle-analyzer` and split chunks > 250KB into async boundaries
- [ ] Lazy load heavy dashboard components (charts, report builder, cluster map) using `next/dynamic`
- [ ] Add image optimization: ensure all images (avatars, thumbnails, og images) use `next/image` with proper `sizes`
- [ ] Implement API response compression for large pain point list responses (gzip via `next.config.js compress: true`)
- [ ] Add HTTP caching headers (`Cache-Control: stale-while-revalidate`) on read-only API endpoints

### 9.3 Frontend Performance

- [ ] Virtualize long pain point tables using `@tanstack/react-virtual` (already installed) for > 100 rows
- [ ] Debounce all search/filter inputs with 250ms delay to reduce API calls during rapid typing
- [ ] Implement optimistic UI updates for common actions (star pain point, save report, update tag — reflect immediately)
- [ ] Prefetch next page data in paginated lists using `router.prefetch` on page N when rendering page N-1
- [ ] Add `loading.tsx` Suspense boundaries to all dashboard route segments (`/dashboard/reports`, `/dashboard/search`, etc.)
- [ ] Measure and optimize Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1) — target green on PageSpeed Insights
- [ ] Remove unused Shadcn UI components from the bundle (run `knip` or similar to detect dead component imports)
- [ ] Replace synchronous `JSON.parse` calls in hot paths with streaming JSON parsers for large payloads

---

## 📈 10. Growth & SEO

### 10.1 SEO & Content

- [x] Generate dynamic `sitemap.ts` to include all public blog posts, docs, and feature pages
- [x] Add structured data (JSON-LD) to landing page, blog posts, and feature pages
- [x] Implement OG image generation for blog posts and report share pages (`@vercel/og`)
- [x] Write and publish 10 SEO-targeted blog posts around "Reddit market research", "SaaS idea validation", etc.
- [x] Create landing pages for high-intent keywords ("Reddit pain point finder", "SaaS opportunity discovery tool")
- [x] Add `robots.txt` with correct crawl directives for dashboard (noindex) vs. public pages (index)
- [x] Implement canonical tags on all pages to prevent duplicate content penalties
- [x] Add a `llms.txt` file for AI crawler context (review and update quarterly)
- [x] Implement breadcrumb structured data for blog and docs navigation
- [ ] Add FAQ structured data (JSON-LD `FAQPage`) to the landing page pricing section and features pages
- [ ] Build a "Niche Directory" at `/niches/[slug]` pre-populating pain point summaries for 50 popular niches (programmatic SEO)
- [ ] Add internal linking strategy: blog posts → feature pages → pricing (currently minimal cross-linking)
- [ ] Submit to Google Search Console and Bing Webmaster Tools, verify ownership, submit sitemap
- [ ] Add `hreflang` tags if international expansion is planned (even placeholder `en` declaration)

### 10.2 Referral & Growth Loops

- [ ] Build referral program UI: generate unique referral link per user, track referred signups, reward 10 credits per conversion
- [ ] Implement `referralCode` generation on user registration (`referralCode` column already exists in schema)
- [ ] Award bonus credits when a referred user completes their first scan (Inngest event handler)
- [x] Add social sharing buttons to report pages ("Share this opportunity on Twitter/X")
- [x] Implement "Made with RPP" public showcase (opt-in embeddable badge on user reports)
- [ ] Add a Product Hunt launch integration: countdown timer widget and announcement modal for launch day
- [ ] Create an affiliate program with unique tracking codes and commission payout via Stripe Connect
- [ ] Build an "Invite Team" prompt after a user's 5th scan: "Working with others? Invite them to collaborate"
- [ ] Add a "Share a Pain Point" feature: generate a public snippet card (OG image) from a single pain point for Twitter/LinkedIn

### 10.3 Analytics & Product Intelligence

- [ ] Integrate PostHog for product analytics (feature flags, session recording, funnel analysis, autocapture)
- [ ] Track key conversion events: sign-up → first scan → saved report → billing upgrade (funnel with dropoff rates)
- [ ] Add funnel tracking for billing upgrade flow (which step has highest abandonment?)
- [ ] Implement feature-usage heatmaps to identify under-used (Comparison Mode, Saved Filters) vs. over-used features
- [ ] Set up WAU/MAU dashboards in PostHog with cohort retention charts (D1, D7, D30)
- [ ] Add NPS survey trigger after user's 5th scan (in-app modal, store response in `user_feedback` table)
- [ ] Track scan-to-insight time: how long from scan start to user viewing a pain point detail (engagement quality metric)

---

## 🛠️ 11. Admin & Ops

### 11.1 Admin Dashboard

- [ ] Build admin user listing: search users by email, view plan, usage stats, last login, credit balance
- [ ] Add admin impersonation: log in as any user for support debugging (store original admin ID in session for audit)
- [ ] Build admin scan monitoring: view all in-progress scans across all users with ability to forcibly cancel
- [ ] Add admin AI usage dashboard: total tokens consumed, cost per day, cost per model, top spending users
- [ ] Create admin Reddit health monitor: recent rate limit logs, OAuth token status, success/failure rates per timeframe
- [ ] Build cluster management UI: view all clusters, merge two clusters, force split, delete orphan clusters
- [ ] Add admin announcement system: broadcast messages visible as dashboard banners (target: all users or specific plan)
- [ ] Implement admin "golden dataset" management UI: add/edit/delete labeled examples for AI eval without code deploys
- [ ] Build admin plan override tool: change any user's plan immediately with required reason field (audit log entry)
- [ ] Add admin "Feature Flag Manager" UI: toggle `FEATURE_FLAGS` JSON values without requiring a deploy

### 11.2 Scheduled Jobs & Cron

- [ ] Migrate cron from GitHub Actions to Vercel Cron Jobs for simpler orchestration and unified logs
- [ ] Add a `database maintenance` cron: run `VACUUM ANALYZE`, rebuild HNSW indexes nightly, purge rate limit logs > 30 days
- [ ] Add a `stale scraper cleanup` cron: email user and delete scrapers not run in 6+ months (with 7-day warning)
- [ ] Add a `cluster refresh` cron: recalculate cluster centroids weekly for all workspaces with new pain points
- [ ] Add an `AI eval` cron: run golden dataset evaluation weekly, auto-create GitHub Issue if F1 drops > 3%
- [ ] Add a `re-score` cron: re-compute opportunity scores for all pain points using the latest custom scoring weights
- [ ] Add `credit expiry` cron: expire purchased credits older than 12 months and notify affected users 14 days in advance
- [ ] Create a cron health monitoring page in admin: last run timestamp, duration, success/failure, and output log per job

### 11.3 Inngest Background Jobs

- [ ] Wire all mining pipeline phases to Inngest step functions (currently `mining-runner.ts` is synchronous HTTP handler)
- [ ] Add Inngest function for batch embedding: nightly job embeds all `pain_point` records missing embeddings
- [ ] Create Inngest fan-out pattern for large scans (> 500 posts): split into parallel extraction sub-jobs to avoid timeouts
- [ ] Add Inngest retry policies for all functions: 3 retries with exponential backoff (1s, 4s, 16s)
- [ ] Monitor Inngest function execution in admin dashboard (event log, function failure rate, avg duration)
- [ ] Add Inngest step checkpointing: save phase progress to DB so step re-runs pick up where they left off

---

## 📧 12. Email & Notifications

### 12.1 Transactional Emails (Loops/Resend)

- [ ] Design and send "Scan Complete" email with top 3 pain points found (pain text, score, subreddit source)
- [ ] Design and send "Weekly Digest" email: new opportunities found since last login for all watched keywords
- [ ] Send "Credits Running Low" warning email at 20% remaining with direct top-up CTA link
- [ ] Send "Plan Limit Reached" email with specific feature that was blocked and upgrade CTA
- [ ] Send "New High-Score Cluster" email when a cluster with score > 85 first emerges in a watched keyword
- [ ] Design onboarding email sequence: Day 0 (welcome + quickstart), Day 2 (tips), Day 7 (feature highlight), Day 14 (check-in)
- [ ] Add per-email-type unsubscribe management (currently `emailNotifications` is a single boolean — needs granularity)
- [ ] Implement email preview in admin: "Send test email" to admin's own address for any template
- [ ] Add email open/click tracking via Loops webhooks: store events in `email_engagement_log` for product analytics

### 12.2 In-App Notifications

- [ ] Build notification center in dashboard header (bell icon with unread count badge, dropdown list)
- [ ] Add real-time scan completion notifications via SSE (not just email) — push event when `scraperRun.status` changes
- [ ] Add notification when a monitored keyword hits a new all-time high pain score
- [ ] Add notification when a shared report link is first viewed by an external user
- [ ] Implement notification grouping: if 5+ scans complete within 1 hour, batch into a single "5 scans completed" notification
- [ ] Add `mark all as read` action and per-notification dismiss on the notification center dropdown
- [ ] Persist notification read/unread state in `user_notification` table (not just client-side)

---

## 🌐 13. Integrations & APIs

### 13.1 Export & Integrations

- [ ] Add CSV export for pain point lists with all scored fields (pain text, score, urgency, cluster, subreddit, date)
- [ ] Add JSON export for raw pain point data compatible with the public REST API schema
- [ ] Build Notion integration: push clusters and opportunity summaries to a Notion database via OAuth + Notion API
- [ ] Build Airtable integration: sync pain points to an Airtable base with field mapping (via Airtable REST API)
- [ ] Add Zapier/Make webhook support: fire a webhook on scan complete, new cluster detected, high-score pain point found
- [ ] Build a public REST API with API key auth for programmatic pain point access (`GET /api/v1/pain-points`)
- [ ] Add Slack notification webhook: post scan summary to a Slack channel when a scan completes (block kit format)
- [ ] Build a Chrome extension that overlays RPP pain point insights when the user is browsing a relevant subreddit

### 13.2 Public API

- [ ] Design and publish v1 public API spec (OpenAPI 3.1) at `/api/v1/openapi.json`
- [ ] Implement API versioning strategy: all public routes under `/api/v1/`, deprecation notices on version upgrade
- [ ] Add API key management UI: create named keys, view last-used timestamp, rotate, revoke
- [ ] Implement per-API-key rate limiting: default 100 req/min, configurable per plan tier
- [ ] Build API usage dashboard: total requests per day, breakdown by endpoint, by key, with latency histogram
- [ ] Add SDK generation from OpenAPI spec (TypeScript + Python clients via `openapi-generator`)
- [ ] Create interactive API docs using Scalar (`@scalar/nextjs-api-reference`) at `/docs/api`

---

## 📚 14. Documentation & Content

### 14.1 Technical Docs

- [ ] Write comprehensive API documentation for all public and internal endpoints (route, method, auth, request, response)
- [ ] Document the mining pipeline architecture with a Mermaid sequence diagram (`docs/architecture.md`)
- [ ] Write a "How Scoring Works" explainer page for users (link from all score labels in dashboard)
- [ ] Document all plan features and limits in a comparison table (`docs/plans.md`)
- [ ] Write a "Getting Started" guide in `/docs` with 5-minute quickstart (currently directory exists — audit content quality)
- [ ] Add a Changelog page at `/changelog` showing product updates (one entry per week minimum)
- [ ] Document all database tables and their relationships with an ERD diagram (`docs/schema.md`)
- [ ] Add JSDoc comments to all public-facing `lib/` functions (enables IDE autocompletion for contributors)

### 14.2 User-Facing Help

- [ ] Build a searchable help center (FAQ categories, step-by-step tutorials, troubleshooting guide)
- [ ] Create 3 video tutorials: scan setup walkthrough, interpreting the results dashboard, creating and sharing reports
- [ ] Add contextual help tooltips throughout the app (`?` icon opens a popover with explanation + link to docs)
- [ ] Create a "What is a pain point?" onboarding explainer card with 3 real Reddit examples and their extracted data
- [ ] Write 3 detailed case studies: "How [persona] used RPP to validate [product idea]" (currently `case-studies` dir exists)

---

## 🔧 15. Developer Experience

### 15.1 Local Development

- [ ] Add `docker-compose.yml` with Postgres + PGVector for fully offline local development (no Neon dependency in dev)
- [ ] Create a database seed script (`scripts/seed.ts`) with realistic sample users, scrapers, runs, and pain points
- [ ] Add `Makefile` with common dev commands: `make setup`, `make dev`, `make test`, `make db:reset`, `make db:seed`
- [ ] Document complete local development setup in `DEVELOPMENT.md` (prerequisites, env vars, first run checklist)
- [ ] Add Storybook for UI component development and visual testing (`components/ui/` catalog)
- [ ] Configure VSCode workspace settings and recommended extensions (`.vscode/extensions.json`, `settings.json`)
- [ ] Add pre-commit hooks: lint → type-check → run affected unit tests (via `husky` + `lint-staged`)

### 15.2 CI/CD Pipeline

- [ ] Add GitHub Actions workflow: lint → type-check → unit tests → integration tests → Vercel preview deploy
- [ ] Add `tsc --noEmit` type-check step in CI: fail the build on any TypeScript errors (not just warnings)
- [ ] Set up Vercel preview deployments on every PR with automatic environment variable inheritance
- [ ] Add branch protection rules: require CI green + 1 approved review before merge to `main`
- [ ] Implement semantic-release for automated versioning (`CHANGELOG.md` generation + GitHub release tags)
- [ ] Add deployment notification to Slack: post when production deploy completes (with diff summary)
- [ ] Set up Lighthouse CI: track Core Web Vitals on every PR, fail if LCP regresses > 20%
- [ ] Add bundle size tracking in CI: fail if client bundle increases > 10KB unexpectedly vs. `main`

### 15.3 Code Quality

- [ ] Enforce strict TypeScript (`"strict": true` in `tsconfig.json`) — fix any resulting type errors in `lib/` and `app/`
- [ ] Add `eslint-plugin-react-hooks` rules (`exhaustive-deps`) to catch stale closure bugs in dashboard components
- [ ] Configure `prettier` to enforce consistent import ordering (group: built-in → external → internal → relative)
- [ ] Add `eslint-plugin-security` to catch common security anti-patterns (no `eval`, no `innerHTML`, etc.)
- [ ] Enforce no `any` types in `lib/` files — use `unknown` + type guards or proper interfaces instead
- [ ] Add `@typescript-eslint/no-floating-promises` rule to catch unhandled async errors across all route handlers
- [ ] Create `ARCHITECTURE.md` explaining design decisions, module boundaries, and key data flow diagrams
- [ ] Run `knip` to detect and remove all dead code (unused exports, unreferenced files, zombie imports)

---

## 🗺️ 16. Product Roadmap (Planned Features)

### 16.1 Multi-Source Mining (Beyond Reddit)

- [ ] Add Hacker News mining via HN Algolia API — high signal for dev-tool and B2B SaaS niches (comments on "Ask HN: What's your biggest pain point with X?")
- [ ] Add Twitter/X mining via v2 API: search for high-engagement tweets complaining about specific tools
- [ ] Add Product Hunt comment mining: extract pain points from product reviews and "What would make this better?" comments
- [ ] Add G2/Capterra review mining: structured pain point extraction from competitor product reviews
- [ ] Add IndieHackers post mining: founders discussing problems is extremely high-signal for B2B niches
- [ ] Add YouTube comment mining using YouTube Data API v3 (tutorial videos have extremely candid pain points in comments)
- [ ] Add LinkedIn post mining (scrape public posts in professional communities — requires proxy + rate limit care)

### 16.2 AI & ML Enhancements

- [ ] Fine-tune a custom embedding model on pain-point-specific text using a labeled dataset for better clustering accuracy
- [ ] Build an opportunity-to-MVP feature generator: given a cluster, auto-generate a feature spec with user stories
- [ ] Implement real-time competitive intelligence updates: monitor competitor mentions across sources daily
- [ ] Add a "Market Size Estimator": auto-estimate TAM from pain point cluster signals and Reddit subreddit size
- [ ] Build a "Landing Page Copy Generator" from pain point insights: auto-generate hero copy, CTA, and FAQs
- [ ] Implement natural language search across all pain points ("Show me pain points about pricing confusion")
- [ ] Add a pain point classifier fine-tuned on labeled data (outperform zero-shot LLM extraction on recall)
- [ ] Build an "Idea Score" that combines cluster size, pain intensity, competition, and market trend into a single investment signal

### 16.3 Collaboration Features

- [ ] Add real-time collaborative annotation: multiple team members annotating simultaneously with live cursor indicators
- [ ] Build a `comments` system on pain points and reports for internal team discussions (threaded, with @mentions)
- [ ] Implement `@mention` notifications within workspace: tag a teammate in a comment to notify them instantly
- [ ] Add a "Research Board" (Kanban) for organizing opportunities into stages: Discovery → Validation → Building → Shipped
- [ ] Create workspace-level shared saved searches and filter presets (visible to all members, owned by creator)
- [ ] Add version control for reports: track who made which changes with diff view and restore to any version

### 16.4 Marketplace & Ecosystem

- [ ] Build a "Research Marketplace" where users can sell anonymized research reports to other users
- [ ] Create a public community showcase of validated opportunities (opt-in, curated by moderation team)
- [ ] Build partner integrations with popular no-code tools: Webflow, Bubble, Softr (embed pain point data widgets)
- [ ] Create an embeddable "Live Pain Point Ticker" widget for niche newsletters and communities
- [ ] Build a "Pain Point API" product tier: external tools can query the shared pain point database by niche

---

## 🐛 17. Known Bugs & Technical Debt

### High Priority Bugs

- [x] SSE stream sometimes disconnects without sending `completed` event — fixed: added reconnect logic and final event guarantee
- [x] `resolvePlanForIdentity` doesn't handle `founder`/`professional` plans from Stripe subscriptions
- [x] `planFromString` returns `null` for "founder" and "professional" plan strings from Stripe — mapping added
- [x] Cluster centroid stored as `double_precision[]` not `vector(1536)` — prevents cosine distance operations on clusters
- [x] `scraperRun.finishedAt` marked `notNull` but errored runs may not set it — made nullable with clean completion/error updates
- [x] `workspaceId` filtering not consistently applied on all pain point queries — standardized with `workspaceScope`
- [x] `community-map.ts` and `competitor-intel.ts` verified as actively used (not dead code)
- [ ] `ai.ts` uses `any` types in several places — add proper TypeScript interfaces for all OpenRouter response shapes
- [ ] Race condition in credit deduction: two concurrent scans can both read the same credit balance before either deducts — add DB-level `FOR UPDATE` lock on credit read + deduct
- [ ] `customPatterns` regex values are stored but not validated on edit — user can save invalid regex that crashes extraction phase
- [ ] Dashboard metrics query runs without a `LIMIT` clause when time-range is "all-time" — can return unbounded result set on large accounts
- [ ] `scraperRun` records with `status: in-progress` are never cleaned up if the server crashed mid-run — need a `stuck run` cleanup cron

### Medium Priority Technical Debt

- [x] `mining-runner.ts` (19KB) split into modular pipeline stages under `lib/mining/`
- [x] `reddit.ts` (31KB) split into modular sub-packages under `lib/reddit/`
- [x] `app/(dashboard)/dashboard/page.tsx` (27KB) extracted into sub-components
- [x] Remove unused `re-score-job.ts` — audited: actively utilized, retained
- [ ] Replace all remaining `console.log` in production code paths with structured `pino` logger calls
- [ ] `ai.ts` uses `any` types in several places — add proper TypeScript interfaces for OpenRouter responses
- [x] `embeddings.ts` error handling fixed: added robust error detail and text extraction to `generateEmbedding`
- [x] `discoveryCache` vs `subredditCache` deduplication — merged and unified
- [x] `health-metrics.ts` audited: actively powers `/api/stats/health` endpoint
- [x] `tool` table audited: retained for competitor intelligence caching
- [ ] `lib/comparison.ts` has no input validation — if passed undefined scraperIds, throws uncaught runtime error
- [ ] `lib/trend-detection.ts` returns `stable` for keywords with 0 data points — should return `insufficient-data` sentinel
- [ ] `dashboard-analytics.ts` computes market radar positions synchronously on each request — should be pre-computed and cached
- [ ] API routes in `app/api/` inconsistently handle `try/catch` — some return 500 with stack traces exposed in development
- [ ] Multiple components import directly from `sonner` instead of the unified `@/lib/notifications` wrapper — migrate all usages

### Low Priority Cleanup

- [ ] Consolidate `idempotency.ts` and `reddit-idempotency.ts` into a single unified idempotency module at `lib/idempotency/index.ts`
- [ ] Add a barrel `index.ts` to `lib/` to clean up import paths in consuming files (reduce deep relative imports)
- [ ] Remove `llms.txt` duplicated content if it's auto-generated from sitemap (audit and deduplicate)
- [ ] Rename `mining-presets.ts` entries to match UI terminology (e.g., `"basic"` → `"Standard"`, `"ultra"` → `"Deep Dive"`)
- [ ] Clean up unused CSS variables in `app/globals.css` — several custom tokens are defined but never referenced
- [ ] Remove the `@types/pg` dependency if Neon/Drizzle abstracts all raw PG access (check for direct `pg` usage)
- [ ] Consolidate the two separate `cn()` utility definitions (one in `lib/utils.ts`, one inline in `progress-bar.tsx`)
- [ ] Move all `CARD_TITLES` type definitions in `dashboard-grid.tsx` to a shared constants file for reuse across components
- [ ] Audit `app/(dashboard)/dashboard/reports/page.tsx` for any remaining `toast.` calls that should use `notify.` instead

---

## 📅 Sprint Planning Reference

### Sprint 1 — Fix & Stabilize (Immediate)

1. Fix `planFromString` to handle founder/professional from Stripe ✅
2. Fix `scraperRun.finishedAt` null constraint issue ✅
3. Add env var validation at startup ✅
4. Add structured logging (`pino`) ✅
5. Fix workspace data isolation in pain point queries ✅
6. Add CSRF protection for state-mutating routes
7. Write unit tests for `plan-gating.ts` and `dashboard-metrics.ts` ✅
8. Fix race condition in credit deduction (DB-level `FOR UPDATE` lock)
9. Add stuck run cleanup cron (clear `in-progress` runs older than 30 minutes)

### Sprint 2 — Core UX (Short Term)

1. Add pain point detail view with source context and similar pain points panel
2. Implement pain point bookmarking (star/save to `pain_point_bookmark`)
3. Add CSV/JSON export for pain point lists
4. Build notification center (bell icon, unread count, dropdown list)
5. Implement "Score Explanation" modal
6. Add custom scoring weights UI with sliders
7. Add "Pause" and "Cancel" scan buttons
8. Build a `<ConfirmDialog>` component for all destructive actions

### Sprint 3 — Growth (Medium Term)

1. Google OAuth integration (high signup friction reduction)
2. Referral program: generate codes, track conversions, award credits
3. Add Hacker News mining source
4. Build public report sharing with expiry
5. Implement natural language semantic search across pain points
6. Add weekly digest email via Loops
7. Write 5 additional SEO blog posts targeting high-intent keywords
8. Integrate PostHog for funnel analytics and feature usage tracking

### Sprint 4 — Scale (Longer Term)

_Generated: 2026-07-14 | Version: 1.0 | Review quarterly and update as features ship._
