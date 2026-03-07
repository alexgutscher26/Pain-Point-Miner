# RPP Master TODO

## Backlog Rules
- [ ] Keep this as the single source of truth for roadmap work.
- [ ] Only start items in `NOW` when blockers/dependencies are resolved.
- [ ] When completing an item, append PR link and date.
- [ ] Re-prioritize every 2 weeks based on usage data and incidents.

## Priority Legend
- `P0` = production risk/security/correctness blocker
- `P1` = core product reliability and retention
- `P2` = growth and efficiency multipliers
- `P3` = nice-to-have or long-horizon

## Status Legend
- `[ ]` Not started
- `[-]` In progress
- `[x]` Done

---

## NOW (0-2 Weeks) - Stabilize Core Product

### Epic A - API Safety and Correctness (`P0`)
- [x] Add `zod` validation for `POST /api/search`.
- [x] Validate `keyword` min/max length and trim whitespace.
- [x] Validate `subreddits` format and strip invalid prefixes/symbols.
- [x] Enforce `miningDepth` enum server-side (`basic|deep`).
- [x] Enforce custom pattern count and max length per pattern.
- [x] Add `zod` validation for `GET /api/search/status?id=`.
- [x] Add `zod` validation for `GET /api/reports/[id]` params.
- [x] Add typed error responses (`code`, `message`, `details`).
- [x] Replace all generic 500 responses with internal error codes.
- [x] Add correlation IDs in every API response header.
- [x] Ensure unauthorized requests consistently return 401 JSON shape.

### Epic B - AuthZ and Multi-Tenant Boundaries (`P0`)
- [x] Enforce ownership check in `GET /api/search/status`.
- [x] Add explicit workspace scoping for every read/write query.
- [x] Add helper to centralize `session.user.id` + workspace checks.
- [x] Add tests for cross-user access attempts (must fail).
- [x] Add tests for missing/invalid `id` query param cases.

### Epic C - Job Integrity and Runtime Resilience (`P0`)
- [ ] Prevent duplicate runs from double-submit in UI + API.
- [ ] Add idempotency key support for `POST /api/search`.
- [ ] Add request timeout wrapper for Reddit requests.
- [ ] Add request timeout wrapper for OpenRouter calls.
- [ ] Add exponential backoff retries for transient upstream failures.
- [ ] Add malformed AI JSON fallback parser and defensive guards.
- [ ] Persist failed run reason in `scraper_run.error`.
- [ ] Introduce strict status flow (`queued`, `running`, `completed`, `failed`, `canceled`).
- [ ] Guarantee `updatedAt` is set on all mutation paths.

### Epic D - Observability Baseline (`P0`)
- [ ] Add structured JSON logging for API routes.
- [ ] Log request id, user id, scraper id, duration, upstream latency.
- [ ] Add basic metrics counters: runs started/completed/failed.
- [ ] Add error monitoring (Sentry or equivalent).
- [ ] Add health endpoint (`/api/health`) for DB + upstream checks.

### Epic E - Test Baseline (`P0`)
- [ ] Add route tests for auth-required endpoints.
- [ ] Add route tests for ownership checks.
- [ ] Add integration test for scrape -> extract -> report path.
- [ ] Add deterministic tests for opportunity score function.
- [ ] Add test fixtures for AI response parsing edge cases.

---

## NEXT (2-6 Weeks) - Make It Reliable and Scalable

### Epic F - Background Processing (`P1`)
- [ ] Move scrape+extract flow out of request cycle into background worker.
- [ ] Select queue runtime (BullMQ/Inngest/Trigger.dev) and implement.
- [ ] Add persisted job progress snapshots (`step`, `percent`, `message`).
- [ ] Add cancel-job endpoint and UI action.
- [ ] Add worker concurrency limits per user and globally.
- [ ] Add dead-letter handling for repeatedly failing jobs.

### Epic G - Data Integrity and DB Operations (`P1`)
- [ ] Add DB check constraints for score fields (0-10).
- [ ] Add indexes for hot paths (`scraper.userId+createdAt`, `pain_point.scraperId+createdAt`).
- [ ] Audit unused schema columns and deprecate safely.
- [ ] Add migration checklist (backup, rollback, verification).
- [ ] Add migration lint/check in CI.
- [ ] Add orphan cleanup and stale run cleanup job.
- [ ] Add seed script for local/dev environments.

### Epic H - AI Quality System (`P1`)
- [ ] Version prompts and store prompt version per run.
- [ ] Persist model, temperature, and settings per run.
- [ ] Add normalization layer for extracted pain points.
- [ ] Add confidence score and extraction rationale fields.
- [ ] Add duplicate pain point detection across posts/comments.
- [ ] Add model fallback chain for provider/model outages.
- [ ] Add token + cost tracking per extraction call.
- [ ] Build offline evaluation dataset and nightly quality regression run.

### Epic I - Dashboard UX Foundations (`P1`)
- [ ] Replace reports page mock filters with real backend filtering.
- [ ] Add search by niche/keyword/subreddit.
- [ ] Add server-side pagination and sorting.
- [ ] Add reusable loading skeletons for list/detail pages.
- [ ] Add consistent inline error + retry patterns.
- [ ] Add form validation feedback in search page.
- [ ] Implement real �Save Draft� for search configs.

### Epic J - Billing and Limits (`P1`)
- [ ] Add Stripe checkout + webhook handlers.
- [ ] Add plan entitlements and server-side enforcement.
- [ ] Gate deep mining behind paid plan.
- [ ] Add quotas (jobs/day, tokens/month, exports/month).
- [ ] Add in-app usage meter and �approaching limit� banners.
- [ ] Add billing portal and invoice history.

---

## LATER (6-12 Weeks) - Expand Product Depth

### Epic K - Reports and Collaboration (`P2`)
- [ ] Export report as PDF.
- [ ] Export report as Markdown.
- [ ] Export report as CSV.
- [ ] Add shareable private links with expiry.
- [ ] Add favorites/bookmarks for pain points.
- [ ] Add tagging and bulk operations.
- [ ] Add manual merge/split for clustered pain points.
- [ ] Add comments and @mentions on reports.

### Epic L - Growth Features (`P2`)
- [ ] Add recurring scheduled mining.
- [ ] Add �new since last report� delta summaries.
- [ ] Add keyword discovery suggestions.
- [ ] Add competitor watchlists.
- [ ] Add subreddit anomaly detection alerts.
- [ ] Add Slack/Discord/email notifications.
- [ ] Add webhooks + Zapier/Make integrations.
- [ ] Add Notion sync for report publishing.

### Epic M - Insights and Decision Support (`P2`)
- [ ] Add trend charts by keyword/subreddit/time.
- [ ] Add sentiment change tracking over time.
- [ ] Add opportunity comparison view across runs.
- [ ] Add pricing signal extraction from budget text.
- [ ] Add persona/ICP clustering.
- [ ] Add GTM suggestion generator from pain clusters.
- [ ] Add MVP feature roadmap generator.
- [ ] Add TAM/SAM/SOM assistant workflow.

### Epic N - Performance and Infrastructure (`P2`)
- [ ] Cache Reddit responses with short TTL.
- [ ] Cache expensive report aggregates.
- [ ] Replace polling with SSE/WebSocket status streaming.
- [ ] Add route latency and slow query alerts.
- [ ] Add OpenTelemetry traces across API + worker.
- [ ] Optimize bundle splitting for dashboard routes.
- [ ] Add load tests for concurrent search bursts.

---

## PLATFORM/QUALITY TRACK (Continuous)

### Security and Compliance (`P1/P2`)
- [ ] Add security review checklist for all API changes.
- [ ] Add secret scanning and dependency vulnerability scanning.
- [ ] Add Terms of Service and Privacy Policy pages.
- [ ] Add data export and account deletion flows.
- [ ] Add retention/deletion policy docs.
- [ ] Add CCPA/GDPR handling baseline.

### Developer Experience (`P1/P2`)
- [ ] Replace default README with project-specific docs.
- [ ] Add architecture doc (system context + data flow).
- [ ] Add `.env.example` with required keys and notes.
- [ ] Add CI pipeline: lint, typecheck, tests, build.
- [ ] Add preview deployments for PRs.
- [ ] Add pre-commit hooks for quick checks.
- [ ] Remove remaining `any` usage where practical.

### UX and Accessibility (`P1/P2`)
- [ ] Add keyboard navigation checks for all core flows.
- [ ] Improve color contrast to WCAG AA.
- [ ] Add reduced-motion support.
- [ ] Improve mobile layout for report table/actions.
- [ ] Standardize empty states and CTA clarity.

---

## Backlog - Product and GTM

### Marketing/SEO (`P3`)
- [ ] Add SEO metadata for landing pages.
- [ ] Add OG/Twitter cards.
- [ ] Add sitemap + robots.
- [ ] Add canonical tags and noindex for private routes.
- [ ] Add structured data (`SoftwareApplication`).
- [ ] Add case study templates.
- [ ] Add changelog page.

### Team/Enterprise (`P3`)
- [ ] Add workspace roles (`owner/admin/member/viewer`).
- [ ] Add workspace dashboards.
- [ ] Add audit log for team actions.
- [ ] Add SSO/SAML exploration.
- [ ] Add DPA + subprocessors page.

### Moonshots (`P3`)
- [ ] Autonomous weekly opportunity scout agent.
- [ ] Real-time ingestion mode for tracked subreddits.
- [ ] One-click experiment plan generator (problem -> hypothesis -> test).
- [ ] Auto-generate customer interview guides from top pain points.

---

## Dependency Map (Do This In Order)
- [ ] API validation + authz checks
- [ ] Idempotency + job state machine
- [ ] Observability + test baseline
- [ ] Background worker migration
- [ ] Billing/entitlements
- [ ] UX filters/pagination/exports
- [ ] Collaboration + integrations

## Definition of Done (For Any Item)
- [ ] Code merged with tests.
- [ ] Error handling and logging included.
- [ ] Metrics/tracing hooks added where relevant.
- [ ] Documentation updated.
- [ ] Feature flag added for risky rollout (if applicable).

## First Sprint Suggestion (Concrete 10 Items)
- [ ] `zod` validation on `/api/search`.
- [ ] Ownership check on `/api/search/status`.
- [ ] Typed error response schema + shared helper.
- [ ] Request IDs and structured logs.
- [ ] Timeout + retry wrapper for Reddit/OpenRouter.
- [ ] Idempotency key for search creation.
- [ ] Persist failure reason in run record.
- [ ] Extract shared scoring utility + tests.
- [ ] Integration test for end-to-end mining flow.
- [ ] Reports page real filter + pagination backend.
