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

- [ ] Implement structured logging with `pino` or `winston` (replace scattered `console.log/error`)
- [ ] Add OpenTelemetry traces to the mining pipeline phases (SCANNING → EXTRACTING → CLUSTERING)
- [ ] Set up Sentry error monitoring for both server-side and client-side errors
- [ ] Add `X-Request-ID` header propagation through the mining pipeline for request tracing
- [ ] Create an `/api/health` endpoint with DB connectivity, Redis, and external API checks
- [ ] Add a `metrics` endpoint compatible with Prometheus scraping (scan counts, error rates, latency)
- [ ] Log all Reddit API 429 responses to `reddit_rate_limit_log` and surface in admin dashboard
- [ ] Create alert thresholds: notify admin if error rate > 5% in a rolling 10-minute window
- [ ] Add dead-letter queue for failed AI extractions (retry with exponential backoff up to 3 times)
- [ ] Emit structured audit log events for all billing-affecting actions (scan start, plan upgrade, credit purchase)

---

## 🤖 2. Mining Pipeline

### 2.1 Reddit API & Scraping

- [x] Add Reddit OAuth token refresh logic with automatic retry (currently token can expire mid-run)
- [x] Implement subreddit existence validation before starting a scan (avoid silent 404s)
- [x] Add support for Reddit's `after`/`before` pagination cursors to fetch more than 100 posts per subreddit
- [ ] Cache Reddit OAuth tokens in Redis/DB across requests (not per-request re-auth)
- [ ] Add `REDDIT_RATE_LIMIT_DELAY_MS` env var to insert deliberate delays and stay within Reddit's API limits
- [ ] Support fetching from multiple Reddit sort modes in a single run (new + hot + top) without duplicating posts
- [x] Add PullPush.io as a more robust fallback for historical data (currently partially implemented)
- [x] Validate that `customPatterns` regex strings compile without errors before accepting a scan config
- [x] Add subreddit subscriber count check — skip subreddits with < 1,000 subscribers (low signal)
- [ ] Track which subreddit each post came from in `scraperPost` for per-subreddit analytics
- [x] Add support for `r/all` search using Reddit's global search endpoint
- [x] Implement `multiReddit` scraping (combine multiple subreddits into a single Reddit API call)
- [x] Add `miningDepth` = `"ultra"` tier for exhaustive comment tree traversal (Pro plan only)

### 2.2 AI Extraction

- [ ] Batch multiple posts into a single OpenRouter request to reduce API call overhead and latency
- [x] Add a confidence score to each AI extraction (0–1) and filter out low-confidence results
- [ ] Implement fallback model chain: if primary model fails, retry with a cheaper/faster model
- [ ] Add extraction schema versioning — when the prompt changes, re-run extraction on cached posts
- [x] Extract `targetUser` persona from posts (e.g., "solo founder", "enterprise IT manager")
- [x] Extract `competingProducts` from post text automatically during AI extraction
- [x] Add `willingnessToPay` signal extraction (free-tier vs paid signal from post language)
- [ ] Support multi-language posts — detect language and extract in English with `originalLanguage` stored
- [x] Add `featureRequested` extraction field: what specific solution/feature is the user asking for
- [ ] Implement streaming AI responses for long posts to reduce timeout risk
- [ ] Create a golden dataset validation pipeline: run extractions against `ai_golden_dataset` on every deploy
- [ ] Add A/B testing for prompt versions (randomly assign prompts, compare F1 scores in `ai_eval_log`)
- [ ] Store raw LLM response alongside structured extraction for debugging and prompt improvement

### 2.3 Embedding & Clustering

- [ ] Batch embedding API calls (currently one call per pain point — very expensive at scale)
- [ ] Add a HNSW index rebuild job when `m` or `ef_construction` parameters change
- [ ] Implement hierarchical clustering: micro-clusters → macro-themes for report generation
- [ ] Add cluster merge job: when two clusters drift too close (cosine > 0.95), merge them automatically
- [ ] Store the cluster centroid as a `vector(1536)` type (currently stored as `double_precision[]` — loses PGVector operators)
- [ ] Add cluster quality score (intra-cluster similarity variance — lower = tighter cluster)
- [ ] Implement cluster labels auto-generation using LLM summarization of canonical bodies
- [ ] Add `clusterVersion` to track when a cluster's centroid was last recalculated
- [ ] Implement incremental cluster updates (update centroid on new member, not full recompute)
- [ ] Add `orphan detection` job: pain points not assigned to any cluster after 24h should be re-clustered

### 2.4 Pipeline Reliability

- [ ] Implement `circuitBreaker` for OpenRouter calls (open after 5 consecutive failures, half-open after 60s)
- [ ] Add per-run timeout: if the pipeline exceeds 15 minutes, mark as `timeout` and clean up
- [ ] Implement idempotent run creation: calling start-scan twice for the same config returns the existing run
- [ ] Add run resumption: if a run fails mid-EXTRACTING, resume from the last successfully processed post
- [ ] Add pipeline step checkpoints — save progress to DB so server restarts don't lose work
- [ ] Implement graceful shutdown: on `SIGTERM`, finish current AI request then stop cleanly
- [ ] Add scan queue with concurrency limit (max N simultaneous runs per user, M global)
- [ ] Create a `scraper_run.retryCount` column and auto-retry failed runs up to 2 times

---

## 📊 3. Dashboard & Analytics

### 3.1 Main Dashboard

- [ ] Add a global "active scans" indicator in the nav showing live scan count across all scrapers
- [ ] Implement dashboard card drag-to-reorder with persisted layout in `userPreferences.dashboardLayout`
- [ ] Add "Top Opportunities This Week" summary card showing highest-scored pain points
- [ ] Implement a pain point heatmap calendar (GitHub-style) showing scan activity over time
- [ ] Add "Cluster Growth" sparkline chart showing how clusters evolved over past 30 days
- [ ] Add a "Market Competition Radar" chart: plot pain points on a 2D axis (pain intensity × market maturity)
- [ ] Implement a "Quick Actions" panel: start scan, view latest report, jump to top opportunity
- [ ] Add configurable time-range selector (7d, 30d, 90d, 1y, all-time) that applies globally to all dashboard metrics
- [ ] Add "Comparison Mode": select two scrapers/keywords and compare their pain point distributions side-by-side
- [ ] Implement "Saved Filters" — save complex filter combinations and switch between them instantly

### 3.2 Pain Point Analytics

- [ ] Build a pain point detail view: full post body, comments, AI extraction scores, cluster membership
- [ ] Add pain point timeline view: show how many pain points per keyword were found per day
- [ ] Implement pain point tagging UX: let users add custom tags on top of AI-extracted tags
- [ ] Add pain point bookmark/star feature (saved to DB, visible across sessions)
- [ ] Implement batch actions on pain points: bulk delete, bulk export, bulk tag
- [ ] Add "Pain Point Evolution" view: show how a cluster's severity scores changed over time
- [ ] Build "Similar Pain Points" panel on the detail view using PGVector cosine search
- [ ] Add pain point voting UI (thumbs up/down — currently `pain_point_feedback` table exists but no UI)
- [ ] Implement pain point annotation: let users add private notes to any pain point
- [ ] Add "Ignore" action: flag a pain point as irrelevant so it's excluded from future scoring

### 3.3 Opportunity Scoring & Reports

- [ ] Add a "Score Explanation" modal showing exactly how the weighted score was computed for each pain point
- [ ] Implement custom scoring weights UI (sliders for painIntensity/urgency/monetization weights — stored in `scoringWeights`)
- [ ] Add "Validation Signals" breakdown: show upvotes, comments, and mention count contributions separately
- [ ] Build a full Report builder: select pain points → organize into sections → export as PDF/Markdown
- [ ] Add report versioning: save report snapshots so historical reports remain accurate even as data changes
- [ ] Implement report sharing: generate a public read-only URL for a report (with expiry option)
- [ ] Add report templates: "SaaS Opportunity Brief", "Competitive Landscape", "Market Validation Summary"
- [ ] Create a "One-Pager" report format: AI-generated executive summary from the top 5 clusters
- [ ] Add Notion/Google Docs export integration for reports
- [ ] Implement scheduled report emails: weekly digest of top opportunities in a watch-list

### 3.4 Trend Detection

- [ ] Build a trend detection dashboard page showing keyword momentum (rising / falling / stable)
- [ ] Add "New vs Recurring" split: distinguish freshly discovered pain points vs. those seen in previous runs
- [ ] Implement velocity metrics: pain points found per hour during a scan (mining efficiency)
- [ ] Add cross-scraper trend detection: detect when the same pain appears across multiple keyword searches
- [ ] Build a "Trend Alert" system: notify when a keyword's pain point count increases >20% week-over-week
- [ ] Add seasonality detection: flag keywords that spike at specific times of year
- [ ] Create a "Breakthrough Opportunities" feed: pain points with sudden sharp score increases

---

## 🔐 4. Authentication & Authorization

### 4.1 Auth System (Better Auth)

- [ ] Add Google OAuth provider (currently email/password only based on schema)
- [ ] Add GitHub OAuth provider (relevant for developer-focused niches)
- [ ] Implement magic-link email authentication as a lower-friction alternative to password
- [ ] Add passkey / WebAuthn support for passwordless login
- [ ] Implement two-factor authentication (TOTP via authenticator app)
- [ ] Add session management page: list active sessions, revoke individual sessions
- [ ] Implement `remember me` (30-day session) vs. session-expiry on browser close
- [ ] Add account lockout after N failed login attempts (store failed attempts in `account` table)
- [ ] Implement email change flow with re-verification
- [ ] Add password strength enforcement on registration (zxcvbn or similar)

### 4.2 Authorization & Multi-tenancy

- [ ] Implement workspace role-based access control: `owner | admin | member | viewer`
- [ ] Add workspace invitation flow: invite by email, pending invitations list, accept/reject
- [ ] Implement workspace transfer of ownership
- [ ] Add audit log per workspace: who ran which scan, who changed settings
- [ ] Implement data isolation: ensure all DB queries are scoped to `userId` OR `workspaceId` (no cross-user data leaks)
- [ ] Add API key system for programmatic access (create/revoke keys, per-key rate limits)
- [ ] Implement fine-grained permissions: e.g., viewer role cannot start scans or delete reports
- [ ] Add IP allowlist per workspace (enterprise feature)

---

## 💳 5. Billing & Monetization

### 5.1 Stripe Integration

- [x] Wire Stripe webhook handler to update subscription status on `customer.subscription.updated` events
- [ ] Handle `invoice.payment_failed` webhook: send email, show banner, grace period before downgrade
- [x] Handle `customer.subscription.deleted` webhook: immediately revoke plan access
- [ ] Implement Stripe Customer Portal link for self-serve plan changes and cancellation
- [ ] Add proration handling when users upgrade mid-cycle
- [ ] Implement annual billing option (20% discount) with correct proration
- [ ] Add Stripe metered billing for AI credit top-ups (Stripe usage records)
- [ ] Create a billing history page showing all invoices with download links
- [ ] Implement coupon/promo code support at checkout
- [ ] Add dunning automation: email sequence for failed payments (day 1, 3, 7 before cancellation)

### 5.2 Credits & Usage

- [ ] Build a credits purchase flow: user can buy top-up credits without changing their plan
- [ ] Add real-time credit balance display in the dashboard header
- [ ] Implement credit expiry: purchased credits expire after 12 months
- [ ] Add usage analytics page: credits used per day, per scan, per model
- [ ] Create credit usage breakdown by model (GPT-4o vs Gemini costs differ significantly)
- [ ] Add a scan cost estimator: show estimated credits before starting a scan
- [ ] Implement credit gifting: admin can manually add credits to any user account
- [ ] Add low-credit warning notification at 20% and 10% remaining
- [ ] Create automated monthly usage report email with cost breakdown

### 5.3 Plan Management

- [ ] Add a clear plan comparison page in billing section (features matrix table)
- [ ] Implement plan downgrade protection: warn about data/feature loss before confirming downgrade
- [ ] Add trial period support (7-day Pro trial for new signups)
- [ ] Implement LTD (Lifetime Deal) activation code redemption flow
- [ ] Create admin panel to manually override any user's plan for support purposes
- [ ] Add `plan_change_history` table to audit all plan transitions with timestamps
- [ ] Implement team/seat-based billing for workspace plans (per-seat pricing)
- [ ] Add revenue analytics in admin: MRR, ARR, churn rate, LTV by plan

---

## 🎨 6. UI/UX & Frontend

### 6.1 Design System & Components

- [ ] Audit all color usages — ensure full dark mode support with no hardcoded light-mode values
- [x] Add skeleton loading states to all data-fetching components (replace spinner with content-shaped skeletons)
- [x] Implement consistent empty state components with actionable CTAs (e.g., "Start your first scan")
- [ ] Add `ErrorBoundary` components around all major dashboard sections
- [ ] Create a unified toast notification system (success, error, warning, info) with queue management
- [ ] Audit and fix all Radix/Shadcn accessibility attributes (aria-labels, focus traps, keyboard navigation)
- [ ] Add keyboard shortcuts for common actions (e.g., `Cmd+K` for command palette, `Cmd+N` for new scan)
- [ ] Build a command palette (`Cmd+K`) for quick navigation and action execution
- [x] Create `<PlanGate>` React component that wraps features with upgrade prompts
- [x] Add a `<Tooltip>` component with feature explanations on all score/metric labels

### 6.2 Mining & Analysis UX

- [x] Add a scan wizard UX: step-by-step guided scan setup for new users
- [x] Implement live post counter during scanning phase (WebSocket or SSE update)
- [ ] Add "Pause" and "Cancel" buttons during an active scan
- [ ] Show per-subreddit progress during scanning (how many posts found in each sub)
- [ ] Add a pain point preview during extraction phase (show results as they come in, not just at the end)
- [ ] Build a subreddit search/autocomplete component that fetches suggestions from `subredditCache`
- [ ] Add a keyword suggestion panel: when user types a keyword, suggest related terms from `discoveryCache`
- [x] Implement scan presets (quick-start templates for popular niches: "SaaS tools", "Developer tools", "E-commerce")
- [ ] Add a "Clone Scan" button to duplicate an existing scraper configuration
- [ ] Show scan history per scraper: list of all `scraperRun` records with status, post count, pain points found

### 6.3 Onboarding

- [x] Build a multi-step onboarding flow (currently `onboardingComplete` flag exists but flow is minimal)
- [x] Add an interactive product tour using `driver.js` or similar (highlight key features on first login)
- [x] Create sample/demo data for new accounts (show what results look like before first scan)
- [ ] Add contextual help tooltips throughout the app (linked to docs)
- [ ] Implement `checklist` onboarding widget: "Complete your profile", "Run your first scan", "Save your first report"
- [ ] Add a "Welcome" email sequence via Loops/Postmark for new signups

### 6.4 Mobile & Responsive Design

- [x] Audit all dashboard pages for mobile responsiveness (currently primarily desktop-focused)
- [x] Make the data tables horizontally scrollable with fixed first column on mobile
- [x] Add a mobile-optimized bottom tab navigation for dashboard sections
- [x] Ensure all modals/dialogs have proper mobile keyboard-aware scroll behavior
- [x] Test and fix chart rendering on small screen sizes (Recharts responsive containers)

---

## 🧪 7. Testing & Quality

### 7.1 Unit Tests

- [ ] Write unit tests for `lib/dashboard-metrics.ts` (score formula edge cases)
- [ ] Write unit tests for `lib/plan-gating.ts` (all plan entitlement checks, credit calculations)
- [ ] Write unit tests for `lib/trend-detection.ts` (rising, falling, stable logic)
- [ ] Write unit tests for `lib/clustering.ts` (similarity threshold, new cluster creation)
- [ ] Write unit tests for `lib/budget-signals.ts` (signal extraction patterns)
- [ ] Write unit tests for `lib/plan-resolver.ts` (priority ordering, LTD tier handling)
- [ ] Write unit tests for `lib/run-status.ts` (phase normalization)
- [ ] Write unit tests for `lib/reddit.ts` — mock Reddit API responses for all fetch paths
- [ ] Add property-based tests for scoring formula (fuzz with random inputs, ensure 0–100 output range)
- [ ] Reach 80%+ coverage on all `lib/` files

### 7.2 Integration Tests

- [ ] Write integration tests for `POST /api/search` (create scan, verify DB record creation)
- [ ] Write integration tests for `GET /api/search/stream` SSE endpoint (verify event sequence)
- [ ] Write integration tests for `/api/billing/` Stripe webhook handler (mock Stripe events)
- [ ] Write integration tests for `/api/reports/` CRUD endpoints
- [ ] Write integration tests for `/api/settings/` preferences save/load
- [ ] Test plan gating at the API layer: verify 403s when plan limits are exceeded
- [ ] Write integration tests for workspace creation, member invitation, and role enforcement

### 7.3 End-to-End Tests (Playwright)

- [ ] E2E: Full sign-up → onboarding → first scan → view results flow
- [ ] E2E: Billing upgrade flow (Stripe test mode)
- [ ] E2E: Report save → share → view via public URL
- [ ] E2E: Workspace creation → invite member → member logs in → runs scan
- [ ] E2E: SSE stream completes correctly (verify all phases rendered in UI)
- [ ] Add visual regression tests for key dashboard screenshots (Playwright `toHaveScreenshot`)
- [ ] Set up CI Playwright runs against a staging environment with seeded test data

### 7.4 AI Evaluation

- [ ] Expand `ai_golden_dataset` to at least 100 labeled examples across 10 niches
- [ ] Automate golden dataset eval on every PR (fail if F1 drops > 2%)
- [ ] Add per-niche F1 score breakdown (model may perform differently in B2B vs. consumer niches)
- [ ] Compare Gemini 2.0 Flash vs GPT-4o on extraction quality and cost per run
- [ ] Build a UI for reviewing AI evaluation results and flagging disagreements
- [ ] Add semantic similarity evaluation: extracted pain point vs. source post (embedding distance)

---

## 🔒 8. Security

### 8.1 API Security

- [ ] Implement rate limiting on all public API routes (currently `lib/rate-limit.ts` exists — verify coverage)
- [ ] Add CSRF protection for all state-mutating API routes
- [ ] Validate and sanitize all user-supplied inputs before DB insertion (especially `keywords`, `customPatterns`)
- [ ] Ensure Reddit post `author` field is anonymized when `anonymizeRedditUsernames` is true at query time
- [x] Add Content-Security-Policy headers to all pages
- [ ] Implement request size limits (prevent large payload DOS on `/api/search`)
- [ ] Audit all API routes: ensure every route checks authentication before proceeding
- [x] Add SQL injection protection audit: verify all DB queries use parameterized Drizzle ORM calls
- [ ] Implement API key hashing (store only hash of API key, never the plaintext)

### 8.2 Data Privacy

- [ ] Implement GDPR-compliant data export: "Download My Data" button exports all user data as JSON/ZIP
- [ ] Implement account deletion: cascade delete all user data (pain points, scrapers, runs, embeddings)
- [ ] Add data retention policy: auto-delete scraper runs older than 1 year (configurable)
- [ ] Implement `Right to Erasure` for Reddit author data: wipe `author` fields on request
- [ ] Add a privacy settings page: data retention preferences, anonymization settings
- [ ] Ensure all S3/storage URLs are signed with short expiry (if file storage is added in future)
- [x] Add cookie consent banner (GDPR/CCPA compliance)
- [x] Review third-party scripts (analytics, support widgets) for data transfer compliance

### 8.3 Dependency Security

- [x] Set up `npm audit` or `bun audit` in CI pipeline (fail on high severity)
- [ ] Enable Dependabot or Renovate for automated dependency update PRs
- [ ] Pin all production dependencies to exact versions in `package.json`
- [ ] Audit OpenRouter SDK usage: ensure API keys are never logged or exposed in error messages
- [ ] Review Stripe Webhook signature verification (ensure `stripe.webhooks.constructEvent` is always used)

---

## 🚀 9. Performance

### 9.1 Database Performance

- [ ] Add `EXPLAIN ANALYZE` logging for queries taking > 100ms in development
- [ ] Add PGVector HNSW index with optimized `ef_search` for `findSimilarPainPoints` queries
- [ ] Implement query result caching with Redis for dashboard metrics (5-minute TTL)
- [ ] Paginate all listing queries (pain points, scraper runs) — avoid loading unbounded result sets
- [ ] Add DB connection pooling configuration (Neon serverless pooler settings)
- [ ] Create a weekly `VACUUM ANALYZE` job on large tables (`pain_point`, `pain_point_embedding`)
- [ ] Profile and optimize the dashboard main page query (`page.tsx` at 27KB is likely doing heavy lifting)
- [ ] Add a slow query detection hook that logs to `slow_query_log` table

### 9.2 API & Server Performance

- [ ] Implement React Server Component streaming for the dashboard main page
- [ ] Add `unstable_cache` / `next/cache` for expensive server-side data fetches
- [ ] Configure `staleWhileRevalidate` for public-facing pages (landing, blog, docs)
- [ ] Bundle size audit: run `@next/bundle-analyzer` and split large chunks
- [ ] Lazy load heavy dashboard components (charts, report builder) using `next/dynamic`
- [ ] Add image optimization for all dashboard avatars and thumbnails (next/image)
- [ ] Implement API response compression (gzip/brotli) for large pain point list responses

### 9.3 Frontend Performance

- [ ] Virtualize long lists: use `@tanstack/react-virtual` for pain point tables > 100 rows
- [ ] Debounce search/filter inputs to reduce unnecessary API calls
- [ ] Implement optimistic UI updates for common actions (save report, tag pain point)
- [ ] Prefetch next page data in paginated lists
- [ ] Add `loading.tsx` Suspense boundaries to all dashboard route segments
- [ ] Measure and optimize Core Web Vitals (LCP, INP, CLS) — target green scores on PageSpeed Insights
- [ ] Remove unused Shadcn UI components from the bundle

---

## 📈 10. Growth & SEO

### 10.1 SEO & Content

- [x] Generate dynamic `sitemap.ts` to include all public blog posts, docs, and feature pages
- [x] Add structured data (JSON-LD) to landing page, blog posts, and feature pages
- [x] Implement OG image generation for blog posts and report share pages (`@vercel/og`)
- [x] Write and publish 10 SEO-targeted blog posts around "Reddit market research", "SaaS idea validation", etc.
- [x] Create landing pages for high-intent keywords ("Reddit pain point finder", "SaaS opportunity discovery tool")
- [x] Add `robots.txt` with correct crawl directives for dashboard (noindex) vs. public pages (index)
- [x] Implement canonical tags on all pages to prevent duplicate content
- [x] Add a `llms.txt` file for AI crawler context (already exists — review and update quarterly)
- [x] Implement breadcrumb structured data for blog and docs navigation

### 10.2 Referral & Growth Loops

- [ ] Build referral program UI: generate unique referral link, track signups, reward credits
- [ ] Implement `referralCode` generation on user registration (column already exists in schema)
- [ ] Award bonus credits when a referred user completes their first scan
- [x] Add social sharing buttons to report pages ("Share this opportunity on Twitter/X")
- [x] Implement "Made with RPP" public showcase (opt-in embeddable badge on user reports)

- [ ] Add a product hunt / launch integration helper (count-down timer, launch announcement modal)
- [ ] Create an affiliate program with unique tracking codes and payout via Stripe

### 10.3 Analytics & Product Intelligence

- [ ] Integrate PostHog for product analytics (feature flags, session recording, funnel analysis)
- [ ] Track key conversion events: sign-up → first scan, scan → saved report, report → upgrade
- [ ] Add funnel tracking for billing upgrade flow (where do users drop off?)
- [ ] Implement feature-usage heatmaps to identify under-used vs. over-used features
- [ ] Set up weekly active user (WAU) and monthly active user (MAU) dashboards in PostHog
- [ ] Add NPS survey trigger after user's 5th scan

---

## 🛠️ 11. Admin & Ops

### 11.1 Admin Dashboard

- [ ] Build admin user listing: search users by email, view plan, usage, last login
- [ ] Add admin impersonation: log in as any user for support debugging
- [ ] Build admin scan monitoring: view all active scans across all users with ability to cancel
- [ ] Add admin AI usage dashboard: total tokens used, cost per day, cost per model
- [ ] Create admin Reddit health monitor: show recent rate limit logs, success/failure rates
- [ ] Build cluster management UI: view, merge, split, and delete clusters
- [ ] Add admin announcement system: broadcast messages visible in the dashboard header
- [ ] Implement admin "golden dataset" management: add/edit labeled examples for AI evaluation

### 11.2 Scheduled Jobs & Cron

- [ ] Migrate cron from GitHub Actions to Vercel Cron Jobs for simpler orchestration
- [ ] Add a `database maintenance` cron: run `VACUUM`, rebuild HNSW indexes, purge old rate limit logs
- [ ] Add a `stale scraper cleanup` cron: delete scrapers not run in 6+ months (with user email warning)
- [ ] Add a `cluster refresh` cron: recalculate cluster centroids weekly
- [ ] Add an `AI eval` cron: run golden dataset evaluation weekly, auto-switch model if F1 improves > 5%
- [ ] Add a `re-score` cron: re-compute opportunity scores for all pain points using latest weights
- [ ] Add `credit expiry` cron: expire purchased credits older than 12 months
- [ ] Create a cron health monitoring page in admin: last run time, success/failure for each job

### 11.3 Inngest Background Jobs

- [ ] Wire all mining pipeline phases to Inngest functions (currently `mining-runner.ts` is fire-and-forget)
- [ ] Add Inngest function for batch embedding (run nightly for any un-embedded pain points)
- [ ] Create Inngest fan-out pattern for large scans (> 500 posts) to avoid serverless timeouts
- [ ] Add Inngest retry policies for transient failures (3 retries with exponential backoff)
- [ ] Monitor Inngest function execution in admin dashboard (event log, failure rate)
- [ ] Add Inngest step functions for pipeline checkpointing (resume from last completed step)

---

## 📧 12. Email & Notifications

### 12.1 Transactional Emails (Loops/Resend)

- [ ] Design and send "Scan Complete" email with top 3 pain points found
- [ ] Design and send "Weekly Digest" email with new opportunities since last login
- [ ] Send "Credits Running Low" warning email at 20% remaining
- [ ] Send "Plan Limit Reached" email with upgrade CTA
- [ ] Send "New Cluster Detected" email when a high-scoring new cluster emerges
- [ ] Design onboarding email sequence: Day 0 (welcome), Day 2 (tips), Day 7 (feature highlight)
- [ ] Add unsubscribe management per email type (currently `emailNotifications` is a single boolean)
- [ ] Implement email preview in admin (send test email to admin email address)

### 12.2 In-App Notifications

- [ ] Build notification center in dashboard header (bell icon with badge count)
- [ ] Add real-time notifications via SSE for completed scans (not just email)
- [ ] Add notification for when a monitored keyword hits a new high pain score
- [ ] Add notification when a shared report is viewed for the first time
- [ ] Implement notification grouping (don't spam if 10 scans complete at once)

---

## 🌐 13. Integrations & APIs

### 13.1 Export & Integrations

- [ ] Add CSV export for pain point lists (currently no export functionality)
- [ ] Add JSON export for raw pain point data (for API consumers)
- [ ] Build Notion integration: push clusters and opportunities to a Notion database
- [ ] Build Airtable integration: sync pain points to an Airtable base
- [ ] Add Zapier/Make webhook support: trigger external automations on scan complete
- [ ] Build a public REST API with API key auth for programmatic access to pain points
- [ ] Add Slack notification webhook: post summary to a Slack channel when scan completes
- [ ] Build a Chrome extension that shows RPP insights when browsing Reddit

### 13.2 Public API

- [ ] Design and document v1 public API spec (OpenAPI 3.1)
- [ ] Implement API versioning strategy (`/api/v1/`, `/api/v2/`)
- [ ] Add API key management UI: create, rotate, revoke keys
- [ ] Implement per-key rate limiting and usage tracking
- [ ] Build API usage dashboard: requests per day, per endpoint, per key
- [ ] Add SDK generation from OpenAPI spec (TypeScript + Python clients)
- [ ] Create interactive API docs (Swagger UI or Scalar)

---

## 📚 14. Documentation & Content

### 14.1 Technical Docs

- [ ] Write comprehensive API documentation for all endpoints
- [ ] Document the mining pipeline architecture with sequence diagrams
- [ ] Write a "How Scoring Works" explainer for users (link from dashboard score labels)
- [ ] Document all plan features and limits in a comparison table
- [ ] Write a "Getting Started" guide in `/docs` (currently exists as directory — audit content)
- [ ] Add Changelog page showing product updates (updated monthly)
- [ ] Write a contributing guide (`CONTRIBUTING.md`) for open-source contributors
- [ ] Document all database tables and their relationships (`docs/schema.md`)

### 14.2 User-Facing Help

- [ ] Build a searchable help center (FAQ, tutorials, troubleshooting)
- [ ] Create video tutorials for core workflows (scan setup, interpreting results, creating reports)
- [ ] Add contextual help tooltips throughout the app with links to relevant docs
- [ ] Create a "What is a pain point?" onboarding explainer with examples
- [ ] Write case studies: "How [user type] used RPP to validate [idea]" (currently `case-studies` dir exists)

---

## 🔧 15. Developer Experience

### 15.1 Local Development

- [ ] Add `docker-compose.yml` with Postgres + PGVector for local development (no need for Neon in dev)
- [ ] Create a database seed script with realistic sample data for local development
- [ ] Add `Makefile` with common dev commands: `make setup`, `make dev`, `make test`, `make db:reset`
- [ ] Document local development setup in `DEVELOPMENT.md`
- [ ] Add Storybook for UI component development and visual regression testing
- [ ] Configure VSCode workspace settings and recommended extensions (`.vscode/`)
- [ ] Add pre-commit hooks (lint, type-check, unit tests) via `husky` + `lint-staged`

### 15.2 CI/CD Pipeline

- [ ] Add GitHub Actions workflow for: lint → type-check → unit tests → integration tests → deploy
- [ ] Add type-check step (`tsc --noEmit`) to CI to catch TypeScript errors before merge
- [ ] Set up preview deployments on Vercel for every PR
- [ ] Add branch protection rules: require CI green + 1 reviewer before merge to `main`
- [ ] Implement semantic-release for automated versioning and changelog generation
- [ ] Add deployment notification to Slack when production deploy completes
- [ ] Set up Lighthouse CI to track Core Web Vitals on every PR
- [ ] Add bundle size tracking: fail CI if bundle increases > 10KB unexpectedly

### 15.3 Code Quality

- [ ] Enforce strict TypeScript (`"strict": true` in `tsconfig.json`) — fix any resulting errors
- [ ] Add `eslint-plugin-react-hooks` rules (exhaustive-deps) to catch stale closure bugs
- [ ] Configure `prettier` to enforce consistent import ordering
- [ ] Add `eslint-plugin-security` to catch common security anti-patterns
- [ ] Enforce no `any` types in lib files — use `unknown` + type guards instead
- [ ] Add `@typescript-eslint/no-floating-promises` rule to catch unhandled async errors
- [ ] Create `ARCHITECTURE.md` explaining design decisions and module boundaries
- [ ] Add JSDoc comments to all public-facing lib functions

---

## 🗺️ 16. Product Roadmap (Planned Features)

### 16.1 Multi-Source Mining (Beyond Reddit)

- [ ] Add Hacker News mining (HN Algolia API) — especially for dev-tool and B2B SaaS niches
- [ ] Add Twitter/X mining (v2 API academic access) for real-time pain signal detection
- [ ] Add Product Hunt comment mining for product validation signals
- [ ] Add G2/Capterra review mining for competitive analysis
- [ ] Add IndieHackers post mining for founder pain points
- [ ] Add YouTube comment mining using the YouTube Data API

### 16.2 AI & ML Enhancements

- [ ] Fine-tune a custom embedding model on pain-point-specific text for better clustering accuracy
- [ ] Build an opportunity-to-MVP feature generator: given a cluster, auto-generate feature specs
- [ ] Implement real-time competitive intelligence updates: monitor competitor mentions across sources
- [ ] Add a "Market Size Estimator": auto-estimate TAM from pain point cluster signals
- [ ] Build a "Landing Page Copy Generator" from pain point insights (for rapid validation)
- [ ] Implement semantic search across all pain points using natural language queries
- [ ] Add a pain point classifier trained on labeled data (not just LLM zero-shot)

### 16.3 Collaboration Features

- [ ] Add real-time collaborative annotation (multiple team members can annotate simultaneously)
- [ ] Build a `comments` system on pain points and reports (internal team discussions)
- [ ] Implement `@mention` notifications within workspace (tag a teammate in a comment)
- [ ] Add a `research board` (Kanban) for organizing opportunities into stages: Discovery → Validation → Building
- [ ] Create workspace-level shared saved searches and filter presets

### 16.4 Marketplace & Ecosystem

- [ ] Build a "Research Marketplace" where users can sell anonymized research reports
- [ ] Create a public community showcase of validated opportunities (opt-in)
- [ ] Build partner integrations with popular no-code tools (Webflow, Bubble, Softr)
- [ ] Create an embeddable widget showing live pain point trends for a niche
- [ ] Build a "Pain Point API" product: let other tools query the pain point database by niche

---

## 🐛 17. Known Bugs & Technical Debt

### High Priority Bugs

- [x] SSE stream sometimes disconnects without sending `completed` event — investigate and add reconnect logic
- [x] `resolvePlanForIdentity` doesn't handle `founder`/`professional` plans from Stripe subscriptions (only LTD tier)
- [x] `planFromString` returns `null` for "founder" and "professional" plan strings from Stripe — add mapping
- [x] Cluster centroid stored as `double_precision[]` not `vector(1536)` — prevents cosine distance operations on clusters

- [x] `scraperRun.finishedAt` is marked `notNull` but runs that error out may not set it — fixed in `lib/db/schema.ts` by making `finishedAt` nullable with clean completion/error updates
- [x] `workspaceId` filtering is not consistently applied on all pain point queries — standardized with `workspaceScope` in `/api/reports`, `/api/feedback`, and dashboard caching
- [x] `community-map.ts` and `competitor-intel.ts` are likely unused after AI extraction redesign — audited: verified actively used in `LazyCommunityMapPanel` and cluster competitor intel aggregation

### Medium Priority Technical Debt

- [x] `mining-runner.ts` (19KB) is too large — split into modular pipeline stages under `lib/mining/` (`discovery.ts`, `extraction.ts`, `runner.ts`)
- [x] `reddit.ts` (31KB) has mixed concerns: API client + parsing + filtering — split into modular sub-packages under `lib/reddit/` (`types`, `patterns`, `ranking`, `throttle`, `oauth`, `client`)
- [x] `app/(dashboard)/dashboard/page.tsx` (27KB) is doing too much — extracted `MetricCard`, `ReportRow`, and `DashboardMarketPulse` sub-components with workspace scoping
- [x] Remove unused `re-score-job.ts` if it's not called anywhere in the pipeline — audited: actively utilized by `app/api/settings/route.ts` when updating custom scoring weights
- [ ] Replace all `console.log` in production code with structured logger calls
- [ ] `ai.ts` uses `any` types in several places — add proper TypeScript interfaces for OpenRouter responses
- [x] `embeddings.ts` has no error handling for when the embedding API returns a non-200 — fixed: added robust error detail and text extraction to `generateEmbedding`
- [x] Dedup `discoveryCache` vs `subredditCache` — merged and unified in `app/api/search/suggest-subreddits/route.ts` using in-memory TTL cache and canonical `subredditCache`
- [x] `health-metrics.ts` (3KB) — audit whether this is used in the health dashboard or is dead code — audited: actively powers `/api/stats/health` endpoint for diagnostics
- [x] Remove the `tool` table if unused — audited: retained and typed in `lib/db/schema.ts` for competitor intelligence caching in `lib/competitor-intel.ts`

### Low Priority Cleanup

- [ ] Consolidate `idempotency.ts` and `reddit-idempotency.ts` into a single unified idempotency module
- [ ] Add a barrel `index.ts` to `lib/` to clean up import paths in consuming files
- [ ] Remove `llms.txt` duplicated content if it's auto-generated from sitemap
- [ ] Audit `community-map.ts` — likely stale code from an earlier feature iteration
- [ ] Rename `mining-presets.ts` entries to match UI terminology (e.g., "basic" → "Standard")

---

## 📅 Sprint Planning Reference

### Sprint 1 — Fix & Stabilize (Immediate)

1. Fix `planFromString` to handle founder/professional from Stripe
2. Fix `scraperRun.finishedAt` null constraint issue
3. Add env var validation at startup
4. Add structured logging (`pino`)
5. Fix workspace data isolation in pain point queries
6. Add CSRF protection
7. Write unit tests for `plan-gating.ts` and `dashboard-metrics.ts`

### Sprint 2 — Core UX (Short Term)

1. Add pain point detail view
2. Add scan wizard for new users
3. Implement pain point bookmarking
4. Add CSV/JSON export
5. Build notification center
6. Implement "Score Explanation" modal
7. Add custom scoring weights UI

### Sprint 3 — Growth (Medium Term)

1. Google OAuth integration
2. Referral program implementation
3. Add Hacker News mining source
4. Build public report sharing
5. Implement semantic search across pain points
6. Add weekly digest email
7. Write 5 SEO blog posts

### Sprint 4 — Scale (Longer Term)

1. Migrate pipeline to Inngest fan-out
2. Add Redis caching for dashboard queries
3. Build public REST API v1
4. Multi-language post support
5. Fine-tune embedding model
6. Team collaboration features
7. Marketplace MVP

---

_Generated: 2026-07-14 | Version: 1.0 | Review quarterly and update as features ship._
