# RPP Master TODO

## Backlog Rules

- [x] Keep this as the single source of truth for roadmap work.
- [ ] Only start items in `NOW` when blockers/dependencies are resolved.
- [ ] When completing an item, append date completed if possible.
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

- [x] Add `zod` validation for `POST /api/search`. (2026-03-07)
- [x] Validate `keyword` min/max length and trim whitespace.
- [x] Validate `subreddits` format and strip invalid prefixes/symbols.
- [x] Enforce `miningDepth` enum server-side (`basic|deep`).
- [x] Enforce custom pattern count and max length per pattern.
- [x] Add `zod` validation for `GET /api/search/status?id=`.
- [x] Add `zod` validation for `GET /api/reports/[id]` params.
- [x] Add typed error responses (`code`, `message`, `details`).
- [x] Add correlation IDs in every API response header via `api-error` lib.
- [x] Ensure unauthorized requests consistently return 401 JSON shape.
- [ ] Replace remaining generic 500 responses with internal error codes.

### Epic B - AuthZ and Multi-Tenant Boundaries (`P0`)

- [x] Enforce ownership check in `GET /api/search/status`.
- [x] Add explicit workspace scoping for every read/write query.
- [x] Add helper to centralize `session.user.id` + workspace checks (`lib/api-auth.ts`).
- [ ] Add integration tests for cross-user/cross-workspace access attempts (must fail).
- [x] Refactor Sign-in/Sign-up pages to match current branding.

### Epic C - Search Engine & AI Core (`P0`)

- [x] Implement business signal extraction (Urgency, Monetization, Market Maturity).
- [x] Add Weighted Opportunity Scoring algorithm.
- [x] Add AI-driven subreddit auto-suggestions.
- [x] Add custom extraction patterns support.
- [ ] Prevent duplicate runs from double-submit in UI + API.
- [ ] Add idempotency key support for `POST /api/search`.
- [ ] Move search processing from request cycle to Background Jobs (Inngest).
- [ ] Persist failed run reason in `scraper_run.error`.
- [ ] Introduce strict status flow (`queued`, `running`, `completed`, `failed`, `canceled`).

### Epic D - Dashboard & UX Foundation (`P1`)

- [x] Design "Kinetic Intelligence" aesthetic for Search & Main Dashboard.
- [x] Implement functional Detailed Report View (`/dashboard/reports/[id]`).
- [x] Implement dynamic filtering (Date, Status, Score) on Reports page. (2026-03-07)
- [ ] Implement functional "Save Draft" for search configurations.
- [ ] Add real-time status updates via polling or SSE for active scans.
- [ ] Implement "Market Score" and "Pain Points Found" aggregations on Dashboard.

### Epic E - Observability Baseline (`P0`)

- [x] Structured JSON logging baseline via `api-error`.
- [ ] Add request id, user id, scraper id, duration to server logs.
- [ ] Add basic metrics counters: runs started/completed/failed.
- [ ] Add error monitoring (Sentry or equivalent).
- [ ] Add health endpoint (`/api/health`) for DB + Reddit API status.

---

## NEXT (2-6 Weeks) - Reliability and Scalability

### Epic F - Background Processing (`P1`)

- [ ] Select queue runtime (Inngest/BullMQ) and migrate `/api/search` processing.
- [ ] Add persisted job progress snapshots (`step`, `percent`, `message`).
- [ ] Add cancel-job endpoint and UI action.
- [ ] Add dead-letter handling for repeatedly failing Reddit/AI calls.

### Epic G - AI Quality & Usage (`P1`)

- [x] Add `ai_usage` table to Drizzle schema. (2026-03-07)
- [ ] Integrate usage recording in `lib/ai.ts` (store token/cost counts).
- [ ] Version prompts and store prompt version per run.
- [ ] Add extraction rationale fields to report UI.
- [ ] Add confidence score to AI extractions.
- [ ] Build offline evaluation dataset for quality regression.

### Epic H - Billing and Limits (`P1`)

- [ ] Add Stripe checkout + webhook handlers.
- [ ] Add plan entitlements and server-side enforcement.
- [ ] Gate "Deep Mine" depth behind paid plan.
- [ ] Add quotas (jobs/day, seats, etc.).
- [ ] Add in-app usage meter and billing portal.

### Epic I - Data Integrity and DB Operations (`P1`)

- [ ] Add indexes for hot paths (`scraper.userId+createdAt`, `painPoint.scraperId`).
- [ ] Audit unused schema columns and deprecate safely.
- [ ] Add seed script for local/dev environments.
- [ ] Add DB check constraints for score fields (0-10).

---

## LATER (6-12 Weeks) - Expansion

### Epic J - Reports and Collaboration (`P2`)

- [ ] Export report (PDF, Markdown, CSV).
- [ ] Add shareable private links with expiry.
- [ ] Add favorites/bookmarks for pain points.
- [ ] Add manual merge/split for clustered pain points.
- [ ] Add comments and @mentions on reports.

### Epic K - Growth Features (`P2`)

- [ ] Add recurring scheduled mining.
- [ ] Add "New since last report" delta summaries.
- [ ] Add competitor watchlists.
- [ ] Add Slack/Discord/email notifications.
- [ ] Add Notion sync for report publishing.

### Epic L - Insights and Decision Support (`P2`)

- [ ] Add trend charts (keyword/subreddit sentiment over time).
- [ ] Add persona/ICP clustering.
- [ ] Add GTM suggestion generator from pain clusters.
- [ ] Add MVP feature roadmap generator.

---

## PLATFORM/QUALITY TRACK (Continuous)

### Security and Compliance (`P1/P2`)

- [ ] Add secret scanning and dependency scanning in CI.
- [ ] Add Terms of Service and Privacy Policy pages.
- [ ] Add account deletion/data export flows.
- [ ] Add CCPA/GDPR handling baseline.

### Developer Experience (`P1/P2`)

- [ ] Add architecture doc (system context + data flow).
- [ ] Add CI pipeline (lint, typecheck, tests, build).
- [ ] Add preview deployments for PRs.
- [ ] Standardize `use-toast` and error boundary patterns.

### UX and Accessibility (`P1/P2`)

- [ ] Keyboard navigation audit.
- [ ] Improve mobile layout for complex report tables.
- [ ] Standardize empty states for all views.

---

## Backlog - Product and GTM

### Marketing/SEO (`P3`)

- [ ] Add SEO metadata for landing pages.
- [ ] Add OG/Twitter cards.
- [ ] Add structured data (`SoftwareApplication`).
- [ ] Add changelog page.

### Moonshots (`P3`)

- [ ] Autonomous weekly opportunity scout agent.
- [ ] Real-time ingestion mode for tracked subreddits.
- [ ] Auto-generate customer interview guides from pain points.

---

## Dependency Map (Order of Ops)

1. **Remove Mock Data**: Hook up Dashboard/Reports tables to real DB data.
2. **Background Jobs**: Migrate intensive AI processing to Inngest.
3. **Usage Tracking**: Finalize token/cost recording in AI calls.
4. **Billing**: Stripe integration to monetize "Deep Mine".
5. **Collaboration**: PDF exports and shared links.

## Definition of Done

- [ ] Code merged with tests (where applicable).
- [ ] Error handling and structured logging included.
- [ ] Schema migrations applied and verified.
- [ ] Documentation updated (`todo.md` updated).
- [ ] Mobile/UX review passed.
