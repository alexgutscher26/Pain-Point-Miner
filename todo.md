# 🚀 RPP (Reddit Pain Point) - Master Specification & Ultimate Roadmap

This document serves as the combined source of truth for the RPP (Reddit Pain-Point Miner) Project. It contains the **MVP Core Specification** (Current Phase) and the **Advanced Scaling Roadmap** (Future Phases).

---

## 🎯 1. Project Foundation: Reddit Pain-Point Miner MVP

### **Core Value Proposition**

SaaS founders often validate ideas by manually searching Reddit. The RPP Engine automates this search-and-discovery process by finding recent posts discussing problems, extracting semantic pain points, and clustering them into market opportunities.
**Goal:** A dashboard of validated, high-demand SaaS opportunities.

### **MVP Feature Set**

- **Search Engine**: Input keyword/niche (e.g., "SEO", "Email Marketing") + Optional Subreddit filters.
- **Discovery Engine**: Automatically filters for "problem" patterns (e.g., "how do you handle", "this sucks", "struggling").
- **AI Extraction**: Deep analysis of post bodies and comments to find the "root pain".
- **Engagement Tracking**: Upvotes, comment volume, and "mention count" used to calculate validation signals.

### **MVP Tech Stack (Integrated)**

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS 4 + Shadcn UI.
- **Backend**: Next.js API Routes (TypeScript) for logic orchestration.
- **Database**: PostgreSQL + Drizzle ORM (PGVector for semantic clustering).
- **AI Layer**: OpenRouter (Gemini 2.0 Flash / GPT-4o) for extraction.
- **Reddit Collection**: Native Fetch API with Reddit OAuth (high-concurrency) + PullPush fallback.

### **Pain Point Scoring Formula (v1)**

$$Score = (\text{mentions} \times 1.0) + (\text{avg\_comments} \times 0.5) + (\text{avg\_upvotes} \times 0.2)$$

- **Mentions**: Number of unique Reddit threads discussing the same core problem.
- **Comments**: Signal of community discussion and validation.
- **Upvotes**: Signal of agreement and broader interest.

### **Current Architecture Summary**

- `lib/mining-runner.ts` — Orchestrates the full mining pipeline: parallel subreddit fetch → parallel comment fetch → AI extraction → embedding + clustering (fire-and-forget).
- `lib/embeddings.ts` — OpenRouter embedding generation (`text-embedding-3-small`, 1536 dims), PGVector cosine-distance semantic search.
- `lib/clustering.ts` — Auto-clusters pain points into `painPointCluster` records (threshold: 0.82 cosine similarity).
- `lib/ai.ts` — OpenRouter-based pain point extraction from posts + comments.
- `lib/reddit.ts` — Reddit OAuth fetch with retry, PullPush fallback for 403/blocked.
- `lib/plan-gating.ts` — Starter / Growth / Pro plan entitlements with monthly scan usage tracking.
- `lib/trend-detection.ts` — Trend direction detection (up/down/flat/new) for keyword mentions.
- `lib/dashboard-metrics.ts` — Opportunity scoring, validation scoring, market badge logic.
- `lib/scheduler.ts` — `isScraperDue()` frequency-based scheduling.
- `lib/reddit-idempotency.ts` — 24h idempotency guard for Reddit post AI processing.
- `app/api/search/stream/route.ts` — SSE endpoint for real-time mining progress.
- `hooks/use-mining-stream.ts` — Client-side SSE hook with polling fallback.

---

## 🏗️ 2. PHASE 1: Core Intelligence & Scraping (The "Mining" Engine)

### **High Priority Implementation**

- [x] **Parallelized Scraping Engine**: Refactor `mining-runner.ts` to fetch posts from multiple subreddits concurrently using `Promise.allSettled`.
- [x] **Parallelized Comment Fetching**: Fetch comments for all analyzed posts concurrently using `Promise.allSettled`.
- [x] **Semantic Embedding Pipeline**:
  - [x] Auto-generate vector embeddings for every new `painPoint` using OpenRouter embeddings (`text-embedding-3-small`, 1536 dimensions).
  - [x] Implement a clustering worker (`lib/clustering.ts`) to group similar pain points into a `painPointCluster` automatically.
  - [x] Implement `findSimilarPainPoints()` using PGVector cosine-distance (`<=>` operator) with configurable similarity threshold.
  - [x] Fire-and-forget embedding + clustering in the mining runner so it doesn't block extraction.
- [x] **Mission Control UI**: Real-time scan progress via Server-Sent Events (SSE).
  - [x] SSE endpoint (`/api/search/stream`) with phase-aware progress: `scanning` → `extracting` → `clustering` → `completed`.
  - [x] `useMiningStream` React hook with automatic polling fallback if SSE fails.
  - [x] Live status messages: "Scanning r/SaaS and 2 more...", "Extracted 4 opportunities. Clustering insights...".
- [x] **Phase Tracking in Mining Runner**: `scraperRun.status` updated incrementally (`scanning` → `extracting` → `clustering` → `completed`) so the SSE endpoint reflects real-time progress.

### **Data & Scraper Logic**

- [x] **Problem Pattern Filtering**: Integrate the "Problem Keyword" filter directly into post selection.
  - [x] Add a configurable keyword dictionary: "struggling", "frustrating", "hate", "pain", "wish there was", "why is it so hard", "anyone else deal with".
  - [x] Score posts by how many problem patterns appear in title + selftext.
  - [x] Expose pattern matching stats in the `scraperRun` record (e.g., `postsMatched` reflects pattern-filtered count).
- [x] **Temporal Filtering**: Support last 24h, 7d, 30d, and 90d windows.
  - [x] Add a `timeWindow` field to the search payload schema.
  - [x] Pass `time` parameter to `fetchSubredditPostsBatched` based on selected window.
  - [x] Show the active time window in the analysis page and report header.
- [x] **Idempotency Guard**: `reddit-idempotency.ts` ensures we never bill/call AI twice for the same Reddit post ID within a 24h window.
- [ ] **Reddit Rate Limit Monitoring**: Track 429/403 error rates per-subreddit.
  - [ ] Log rate limit events to a `reddit_rate_limit_log` table.
  - [ ] Auto-backoff: if a subreddit returns 3+ consecutive 429s, skip it for 15 minutes.
  - [ ] Surface rate limit warnings in the SSE stream: "r/startups is rate-limited, skipping...".
- [ ] **Multi-Sort Strategy**: Fetch posts across multiple Reddit sort modes per subreddit.
  - [ ] Current: only `relevance`. Add support for `hot`, `new`, `top` (configurable per mining depth).
  - [ ] Merge and deduplicate results across sort modes.
  - [ ] `advanced` depth should use all 4 sort modes; `basic` should use `relevance` only.
- [ ] **Comment Depth Control**: Limit recursive comment extraction based on mining depth.
  - [ ] `basic`: top-level comments only (depth 0).
  - [ ] `deep`: top-level + first-level replies (depth 1).
  - [ ] `advanced`: full recursive extraction (current behavior).
- [ ] **Post Quality Signals**: Pre-filter posts before AI extraction.
  - [ ] Skip posts with `score < 2` and `num_comments < 3` for `basic` depth.
  - [ ] Skip `[removed]` and `[deleted]` selftext posts.
  - [ ] Prefer self-posts over link posts for pain point extraction.

---

## 🧠 3. PHASE 2: AI Analysis & Deep Opportunity Scoring

### **Intelligence Refinement**

- [ ] **Multi-Model Support**: Implement model switching in `ai.ts`.
  - [ ] `basic` depth: Gemini 2.0 Flash (fast, cheap, good for pattern matching).
  - [ ] `deep` depth: GPT-4o (better nuance, budget detection, sentiment accuracy).
  - [ ] `advanced` depth: Claude Sonnet 3.5 (best for deep market analysis and competitor intel).
  - [ ] Store the model used in `aiUsage` records for cost tracking.
  - [ ] Expose model selection in user preferences (`user_preferences.defaultAiModel`).
- [ ] **Scoring Algorithm V2 (Weighted)**:
  - [ ] Replace the current `toOpportunityScore()` in `dashboard-metrics.ts` with a configurable weighted formula.
  - [ ] Default weights: `painIntensity` (40%), `monetizationScore` (30%), `urgency` (20%), `marketMaturity` (10%).
  - [ ] Allow Pro users to customize weights via the settings page.
  - [ ] Add a `scoreExplanation` breakdown to each opportunity: "High score driven by 8/10 pain intensity and explicit budget mentions."
- [ ] **The "Desperate User" Index**: Extract specific willingness-to-pay signals.
  - [ ] Detect phrases: "I would pay $X", "shut up and take my money", "budget of $X", "willing to spend".
  - [ ] Store extracted budget quotes in `painPoint.budget` with the original quote text.
  - [ ] Surface a "💰 Willingness to Pay" badge on pain points that have budget signals.
  - [ ] Aggregate budget signals into a `painPointCluster`-level "Estimated TAM" field.
- [ ] **Sentiment Confidence Scoring**: Add confidence level to AI sentiment classification.
  - [ ] Instead of just `frustrated | curious | desperate | neutral | angry`, also return a confidence float (0-1).
  - [ ] Use low-confidence results to trigger a re-extraction with a more capable model.
  - [ ] Show confidence indicators in the report UI (e.g., solid vs dotted sentiment badges).

### **Advanced Extraction Logic**

- [ ] **MVP Action Plan Generation**: AI-generated technical spec for top opportunities.
  - [ ] Populate `opportunity.buildPlan` with: suggested tech stack, core features (3-5), architecture diagram description, estimated timeline.
  - [ ] Populate `opportunity.mvpFeatures` array with specific feature names.
  - [ ] Populate `opportunity.targetAudience` with a 2-sentence ICP description.
  - [ ] Populate `opportunity.whyItExists` with a market gap analysis.
- [ ] **Estimated Build Difficulty**: Use AI to classify opportunity complexity.
  - [ ] Categories: "Weekend Project" (1-2 days), "Side Project" (1-2 weeks), "Startup MVP" (1-3 months), "VC-Scale Moat" (6+ months).
  - [ ] Store in `opportunity.difficulty` field.
  - [ ] Factor in: number of integrations needed, regulatory requirements, data moat, network effects.
- [ ] **Competitor Intel Engine**: Automated competitor discovery.
  - [ ] Parse `triedSolutions` arrays across all pain points in a cluster.
  - [ ] Deduplicate and normalize tool names (e.g., "hubspot" and "HubSpot" → "HubSpot").
  - [ ] For each tool, attempt to fetch the homepage title/description via a simple HEAD request.
  - [ ] Populate `opportunity.competitorIntel` with a structured competitor summary.
  - [ ] Show a "Competitive Landscape" section in the report detail page.
- [ ] **Cross-Subreddit Correlation**: Detect when the same pain point appears across multiple communities.
  - [ ] Use embedding similarity to match pain points across different scrapers/subreddits.
  - [ ] Pain points that appear in 3+ subreddits get a "🔥 Cross-Community Signal" badge.
  - [ ] Weight cross-community pain points higher in opportunity scoring.
- [ ] **Quote Extraction Engine**: Pull the most impactful direct quotes from comments.
  - [ ] Extract 3-5 "golden quotes" per pain point — the most emotionally charged or budget-explicit comments.
  - [ ] Store in `painPointComment.painScore` (already exists) and add a `isGoldenQuote` boolean.
  - [ ] Surface golden quotes prominently in the report detail page.
- [ ] **Trend Velocity Detection**: Track how fast a pain point is growing.
  - [ ] Extend `trend-detection.ts` to calculate velocity (rate of change over time, not just direction).
  - [ ] Pain points with accelerating mention velocity get a "📈 Accelerating" badge.
  - [ ] Show a mini sparkline chart on the dashboard for top trending pain points.

---

## 🎨 4. PHASE 3: UI/UX & "Kinetic Intelligence" Design

### **Design System & Dashboard**

- [x] **Global Dashboard Refine**: Applied high-contrast signals, sharp geometry, mono-typography accents, and Swiss International Style.
- [ ] **Opportunity Radar Charts**: Pentagonal radar chart per opportunity.
  - [ ] Axes: Pain Intensity, Urgency, Monetization Potential, Market Maturity, Build Complexity.
  - [ ] Use Recharts (already in deps) with custom dark theme styling.
  - [ ] Show radar chart in report detail page and opportunity comparison view.
- [ ] **Subreddit Heatmap**: Visualization of community problem density.
  - [ ] Grid/treemap showing subreddits sized by pain point count and colored by average intensity.
  - [ ] Clickable cells that drill into filtered pain point lists.
  - [ ] Available on the main dashboard as a "Community Map" panel.
- [ ] **Command Palette (Cmd+K)**: Quick navigation and action execution.
  - [ ] Use `cmdk` (already in deps) to build the palette.
  - [ ] Actions: `/scan <keyword>`, `/report <id>`, `/settings`, `/billing`, `/search`.
  - [ ] Recent searches and reports as suggestions.
  - [ ] Keyboard shortcut indicator in the sidebar.
- [ ] **Pain Point Cluster Visualization**: Interactive cluster map.
  - [ ] Force-directed graph showing pain point clusters as nodes, with edges for similarity.
  - [ ] Node size = `sourceCount`, node color = average `painIntensity`.
  - [ ] Click a node to expand and see individual pain points within the cluster.
- [ ] **Report Comparison View**: Side-by-side comparison of two or more investigations.
  - [ ] Select 2-3 reports from the reports list.
  - [ ] Show overlapping pain points, unique findings, and score deltas.
  - [ ] Export comparison as a PDF or shareable link.
- [ ] **Dark/Light Theme Toggle**: Respect user preference.
  - [ ] `next-themes` (already in deps) for theme management.
  - [ ] Store preference in `user_preferences.theme` (already in schema).
  - [ ] Ensure all custom colors have light-mode equivalents.

### **User Experience Micro-interactions**

- [ ] **Spotlight Interaction**: Subtle spotlight-hover effects for "High Opportunity" cards.
  - [ ] CSS radial-gradient that follows cursor position on hover.
  - [ ] Only activate for cards with opportunity score > 70.
- [ ] **Glassmorphism Overlays**: Ultra-premium blurred layers for detail panels.
  - [ ] `backdrop-filter: blur(20px)` on the report detail sidebar.
  - [ ] Semi-transparent card backgrounds for the floating insight panels.
- [ ] **Mobile-First Insight Feed**: Vertical-scroll bite-sized market insights.
  - [ ] Card-based feed optimized for thumb-scrolling.
  - [ ] Swipe-to-save gesture for bookmarking opportunities.
  - [ ] Bottom sheet for pain point detail (use `vaul` drawer, already in deps).
- [ ] **Skeleton Loading States**: Replace all loading spinners with content-aware skeletons.
  - [ ] Dashboard metric cards: skeleton boxes matching exact layout.
  - [ ] Report table: skeleton rows with shimmer animation.
  - [ ] Analysis page: skeleton steps with pulsing indicators.
- [ ] **Empty States with CTAs**: Design compelling empty states for all pages.
  - [ ] Dashboard with no reports: "Start your first investigation" hero.
  - [ ] Reports page with no saved reports: illustration + "Run a scan" button.
  - [ ] Analysis page with no scraper ID: redirect to search page.
- [ ] **Toast Notification Improvements**: Enhance `sonner` toast usage.
  - [ ] Success: show pain point count in toast after mining completes.
  - [ ] Error: include retry button in error toasts.
  - [ ] Info: show progress percentage for long-running operations.
- [ ] **Keyboard Shortcuts**:
  - [ ] `n` — New investigation (navigate to search page).
  - [ ] `r` — Go to reports.
  - [ ] `d` — Go to dashboard.
  - [ ] `?` — Show keyboard shortcut overlay.
  - [ ] `Escape` — Close any open dialog/drawer.

### **Report Detail Page Enhancements**

- [ ] **Pain Point Cards**: Redesign individual pain point display.
  - [ ] Show: title, body excerpt, pain intensity bar, urgency badge, sentiment pill, subreddit source.
  - [ ] Expand to show full body, top comments, and tried solutions.
  - [ ] "Similar Pain Points" section powered by `findSimilarPainPoints()`.
- [ ] **Cluster Summary Section**: Show pain point clusters with canonical titles.
  - [ ] Each cluster shows: canonical title, source count, average pain intensity, top quotes.
  - [ ] Expand to see all individual pain points in the cluster.
- [ ] **Export Functionality**:
  - [ ] Export report as PDF (server-rendered).
  - [ ] Export report as CSV (pain points + scores + metadata).
  - [ ] Export report as JSON (full structured data for API consumers).
- [ ] **Report Annotations**: Allow users to add notes to reports and pain points.
  - [ ] `opportunityNote` table already exists — build the UI for creating/editing notes.
  - [ ] Inline note editor on the report detail page.
  - [ ] Show notes count badge on the reports list.

---

## 🔐 5. PHASE 4: Infrastructure, Security & Multi-Tenancy

### **Enterprise Readiness**

- [ ] **RBAC & Workspaces**: Full workspace-based access control.
  - [ ] `Owner`: full access, can invite/remove members, manage billing.
  - [ ] `Analyst`: can run scans, view reports, add notes. Cannot manage members or billing.
  - [ ] `Viewer`: read-only access to reports and dashboard.
  - [ ] Workspace invitation flow: email invite → accept → role assignment.
  - [ ] Workspace settings page: member list, role management, workspace name/slug editing.
  - [ ] Enforce workspace scope in all API routes (already partially implemented via `workspaceScope()`).
- [ ] **Durable Execution with Inngest**: Replace fire-and-forget mining with durable workflows.
  - [ ] `inngest/mining-workflow.ts`: step-based mining pipeline with auto-retry on failure.
  - [ ] Step 1: Fetch subreddit posts (retryable).
  - [ ] Step 2: Fetch comments (retryable, parallelized).
  - [ ] Step 3: AI extraction (retryable with exponential backoff).
  - [ ] Step 4: Embedding + clustering (retryable).
  - [ ] Step 5: Finalize scraperRun + send notification.
  - [ ] Dashboard shows Inngest run status and step-level progress.
- [ ] **Notification System**: Multi-channel alerting.
  - [ ] Threshold Alerts: "Alert me if an opportunity with Score > 8.5 is found."
  - [ ] Channels: in-app notification bell, email digest (daily/weekly), Slack webhook.
  - [ ] `notification` table already exists — build the delivery pipeline.
  - [ ] User preferences for notification frequency and channels.
  - [ ] Notification history page under `/dashboard/settings`.
- [ ] **API Access (Developer Preview)**:
  - [ ] `apiKey` table already exists — build the management UI.
  - [ ] API key creation with name, expiry, and scope (read-only vs read-write).
  - [ ] API key revocation and rotation.
  - [ ] Rate limiting per API key (100 requests/minute for Starter, 500 for Growth, unlimited for Pro).
  - [ ] Public API docs page at `/docs/api` with OpenAPI spec.
  - [ ] API endpoints: `GET /api/v1/reports`, `GET /api/v1/pain-points`, `POST /api/v1/search`.
- [ ] **Audit Log**: Track sensitive actions for compliance.
  - [ ] Log: scan initiated, report exported, API key created/revoked, member invited/removed.
  - [ ] Store in an `audit_log` table with: `userId`, `action`, `resource`, `metadata`, `createdAt`.
  - [ ] Audit log viewer for workspace owners under settings.

### **Reliability & Maintenance**

- [ ] **Soft Delete Implementation**: Robust `deletedAt` handling.
  - [ ] Global query middleware to filter out `deletedAt IS NOT NULL` records.
  - [ ] "Trash" page showing recently deleted items with restore/permanent-delete options.
  - [ ] Auto-purge permanently after 30 days.
  - [ ] Cascade soft-delete for related records (e.g., deleting a scraper soft-deletes its pain points).
- [ ] **Predictive Scaling**: Monitor Reddit API throughput.
  - [ ] Track requests/minute to Reddit API in a rolling window.
  - [ ] If approaching rate limits, queue excess requests instead of dropping them.
  - [ ] Dashboard widget showing Reddit API health status.
- [ ] **Observability Stack**:
  - [ ] Track "Time to Insight" metric: time from scan initiation to first pain point extracted.
  - [ ] Track Reddit API error rates (403/429) per subreddit.
  - [ ] Track AI extraction latency per model.
  - [ ] Track embedding generation latency.
  - [ ] Track cluster assignment accuracy (via user feedback).
  - [ ] Surface key metrics on an admin-only `/dashboard/admin` page.
- [ ] **Database Performance**:
  - [ ] Add PGVector HNSW index on `pain_point_embedding.embedding` for faster similarity search.
  - [ ] Add composite index on `pain_point(userId, scraperId, createdAt)` for report queries.
  - [ ] Connection pooling configuration for serverless (already using `prepare: false`).
  - [ ] Query performance monitoring: log slow queries (> 500ms).
- [ ] **Error Recovery**:
  - [ ] If a mining run fails mid-extraction, save partial results instead of discarding everything.
  - [ ] Add a "Retry Failed Run" button on the analysis page.
  - [ ] Auto-retry failed embedding/clustering operations on next scan.

---

## 💰 6. PHASE 5: Revenue, Growth & Growth Hacking

### **Monetization Strategy**

- [x] **Stripe Usage Billing**: Credit-based consumption model connected to Stripe.
- [ ] **Plan Enforcement Improvements**:
  - [ ] Enforce `maxSubredditsPerSearch` from `plan-gating.ts` in the search API.
  - [ ] Enforce `allowedMiningDepths` — show locked depth options with "Upgrade" badge in the search UI.
  - [ ] Show usage meter in the sidebar: "7/10 scans used this month".
  - [ ] Soft-block at 100% usage with a clear upgrade CTA (not a hard error).
- [ ] **Free Trial Flow**:
  - [ ] 7-day free trial of Pro plan for new sign-ups.
  - [ ] Trial banner in dashboard with countdown: "3 days remaining in your Pro trial".
  - [ ] Trial expiry email sequence: Day 5 warning, Day 7 expiry, Day 10 win-back.
  - [ ] Graceful downgrade to Starter on trial expiry (preserve all data, just limit features).
- [ ] **Annual Billing Discount**: 20% off for annual plans.
  - [ ] Toggle in the billing page: Monthly / Annual.
  - [ ] Show savings callout: "Save $48/year with annual billing".
- [ ] **Usage-Based Overage**: Allow Starter/Growth users to buy additional scans.
  - [ ] "Buy 10 more scans for $5" one-time purchase.
  - [ ] Track overage purchases separately from subscription.

### **Growth Engine**

- [x] **Social Proof & FOMO**: "⭐ Most Popular" badge on landing page pricing.
- [ ] **Viral Report Engine**: Public shareable reports.
  - [ ] Generate a unique slug for each report: `/reports/share/<slug>`.
  - [ ] Public report page with: summary, top 5 pain points, radar chart, CTA to sign up.
  - [ ] SEO-optimized meta tags: title, description, og:image (auto-generated).
  - [ ] "Shared via RPP" watermark + sign-up CTA at bottom.
  - [ ] Track share views and conversions.
- [ ] **Programmatic SEO**: Auto-generated landing pages for niches.
  - [ ] `/opportunities/<niche-slug>` pages generated from completed reports.
  - [ ] Each page shows: top pain points for that niche, market score, community sources.
  - [ ] Schema.org structured data for rich search results.
  - [ ] Auto-generated sitemap entries via `app/sitemap.ts` (already exists).
  - [ ] Internal linking between related niche pages.
- [ ] **Referral Program**: Invite-based growth loop.
  - [ ] "Invite a friend, both get 10 Deep Mines free" mechanic.
  - [ ] Unique referral link per user.
  - [ ] Track: invites sent, sign-ups, conversions.
  - [ ] Referral dashboard showing earnings/credits.
- [ ] **Email Drip Campaign**: Onboarding sequence for new users.
  - [ ] Day 0: Welcome + first scan guide.
  - [ ] Day 1: "Here's what other founders found" social proof.
  - [ ] Day 3: "Your first report is waiting" (if they haven't scanned yet).
  - [ ] Day 7: "Unlock Deep Mining" upgrade CTA.
  - [ ] Day 14: "Your trial is ending" (if on trial).
- [ ] **Weekly Insights Digest**: Automated email with top findings.
  - [ ] For active users: "This week's top 3 opportunities across your scans".
  - [ ] For dormant users: "New trending pain points in your saved niches".
  - [ ] Unsubscribe link per notification type.
- [ ] **Landing Page Optimization**:
  - [ ] A/B test hero headline copy.
  - [ ] Add live counter: "X pain points discovered this week".
  - [ ] Add customer logos / testimonial carousel (existing `Testimonial.tsx` component).
  - [ ] Add interactive demo: run a sample scan without signing up.

---

## 🧪 7. PHASE 6: Quality, QA & Evaluation

### **Testing Infrastructure**

- [ ] **E2E Playwright Suite**: Full funnel testing.
  - [ ] Flow 1: Sign Up → New Scan → View Analysis → View Report.
  - [ ] Flow 2: Sign In → Dashboard metrics visible → Navigate to reports.
  - [ ] Flow 3: Search with custom patterns → Verify patterns in extraction.
  - [ ] Flow 4: Billing page → Plan selection → Stripe checkout redirect.
  - [ ] Flow 5: Settings → Update preferences → Verify persistence.
- [ ] **Unit Test Coverage**: Target 80% coverage for core modules.
  - [ ] `lib/dashboard-metrics.ts`: test `toOpportunityScore`, `toValidationScore`, `getMarketBadge`.
  - [ ] `lib/trend-detection.ts`: test `detectTrend`, `buildLatestTrendInsights`, edge cases.
  - [ ] `lib/run-status.ts`: test `normalizeRunStatus` with all status strings including new phases.
  - [ ] `lib/plan-gating.ts`: test all plan entitlements, `resolvePlanForIdentity`, edge cases.
  - [ ] `lib/scheduler.ts`: test `isScraperDue` with various frequency/time combinations.
  - [ ] `lib/embeddings.ts`: mock OpenRouter API, test vector generation and PGVector query building.
  - [ ] `lib/clustering.ts`: mock embeddings, test cluster assignment vs creation logic.
- [ ] **AI Evaluation Framework**: Benchmark extraction accuracy.
  - [ ] Create a "Golden Dataset" of 50 manually-labeled Reddit posts with expected pain points.
  - [ ] Run extraction against golden dataset, measure precision/recall.
  - [ ] Track accuracy across model changes (Gemini vs GPT-4o vs Claude).
  - [ ] Alert if accuracy drops below 70% on the golden dataset.
- [ ] **API Integration Tests**: Test all API routes.
  - [ ] `POST /api/search`: valid payload, validation errors, duplicate detection, plan limits.
  - [ ] `GET /api/search/status`: valid scraper, not found, auth required.
  - [ ] `GET /api/search/stream`: SSE event format, auth required, terminal events.
  - [ ] `GET /api/reports`: pagination, filtering, auth required.
  - [ ] `POST /api/reports`: report generation, validation errors.
  - [ ] `GET /api/billing/entitlements`: plan resolution, usage calculation.

### **Performance & Reliability**

- [ ] **Performance Audit**: Optimize for < 1.0s LCP on the Dashboard.
  - [ ] Audit with Lighthouse CI on every PR.
  - [ ] Lazy-load heavy components (radar charts, heatmaps).
  - [ ] Optimize database queries: ensure all dashboard queries use indexes.
  - [ ] Cache dashboard metrics for 30 seconds to reduce DB load.
- [ ] **Dry Run Mode**: Scraper simulation without AI cost.
  - [ ] New mining depth option: `dry-run` that fetches posts + comments but skips AI extraction.
  - [ ] Show post count, comment count, and estimated AI cost.
  - [ ] Useful for validating subreddit selection before committing credits.
- [ ] **Load Testing**:
  - [ ] Simulate 50 concurrent mining runs.
  - [ ] Measure: DB connection pool exhaustion, Reddit API rate limiting, SSE connection limits.
  - [ ] Establish baseline performance metrics.
- [ ] **Error Boundary Coverage**: Ensure all pages have proper error boundaries.
  - [ ] `app/error.tsx` and `app/global-error.tsx` already exist — verify they catch all error types.
  - [ ] Add error boundaries to dashboard sub-pages.
  - [ ] Log client-side errors to a monitoring service.

---

## 🌐 8. PHASE 7: Platform Expansion & Data Sources

### **Multi-Platform Intelligence**

- [ ] **Hacker News Scraper**: Extend mining to HN discussions.
  - [ ] Use HN Algolia API for search: `http://hn.algolia.com/api/v1/search`.
  - [ ] Map HN comments to the same `painPoint` schema.
  - [ ] Tag pain points with source: `reddit` vs `hackernews`.
  - [ ] Show source badge in the UI.
- [ ] **Twitter/X Scraper**: Monitor Twitter for pain point signals.
  - [ ] Use Twitter API v2 for keyword search.
  - [ ] Map tweets to lightweight pain points (shorter body, engagement as score).
  - [ ] Cross-reference Twitter pain points with Reddit clusters.
- [ ] **Product Hunt Scraper**: Monitor launched products for validation signals.
  - [ ] Track products in the same niche as discovered opportunities.
  - [ ] Use Product Hunt GraphQL API.
  - [ ] Populate `competitorIntel` with PH launches.
- [ ] **Stack Overflow Monitoring**: Detect developer pain points.
  - [ ] Search SO questions by tag/keyword.
  - [ ] High-vote questions with no accepted answer = developer pain point.
  - [ ] Cross-reference with Reddit developer subreddits.

### **Data Enrichment**

- [ ] **Company/Tool Database**: Build a normalized database of SaaS tools.
  - [ ] When `triedSolutions` mentions a tool, resolve it to a canonical entry.
  - [ ] Store: name, URL, category, pricing tier, founded date.
  - [ ] Use this database for competitor analysis in opportunities.
- [ ] **Subreddit Metadata Cache**: Cache subreddit info for better UX.
  - [ ] Store: subscriber count, description, activity level, category.
  - [ ] Use for the subreddit suggestion feature (`/api/search/suggest-subreddits`).
  - [ ] Refresh cache weekly.
- [ ] **Historical Trend Database**: Store pain point mention counts over time.
  - [ ] Weekly snapshot of mention counts per keyword/subreddit.
  - [ ] Power the trend detection and velocity features.
  - [ ] Enable "6-month trend" charts on the dashboard.

---

## 📧 9. PHASE 8: Communication & Reporting

### **Email Templates (React Email)**

- [ ] **Welcome Email**: Rich HTML welcome with first-scan CTA.
- [ ] **Report Ready Email**: "Your investigation is complete" with summary stats and link.
- [ ] **Weekly Digest Email**: Top opportunities, trending niches, usage summary.
- [ ] **Trial Expiry Warning**: Countdown with feature comparison table.
- [ ] **Password Reset Email**: Branded reset flow.
- [ ] **Workspace Invitation Email**: "You've been invited to <workspace>" with accept button.
- [ ] **Alert Notification Email**: "High-score opportunity detected: <title>".

### **Scheduled Reports**

- [ ] **Daily Digest**: Automated scan of saved keywords, email results at 8am user-local-time.
  - [ ] Use `scraper.frequency` and `scheduler.ts` to determine which scrapers are due.
  - [ ] `report.scheduledType` field already exists — use it to tag automated reports.
- [ ] **Weekly Market Summary**: Aggregated insights across all user's scans for the week.
  - [ ] Top 5 pain points by score, top 3 trending keywords, new clusters formed.
  - [ ] Auto-generate and save as a `report` record.
- [ ] **Monthly Competitive Landscape**: Track how competitor mentions change over time.
  - [ ] Compare `triedSolutions` mentions month-over-month.
  - [ ] Surface new competitors that appeared this month.

---

## 🔒 10. PHASE 9: Security Hardening

### **Authentication & Authorization**

- [ ] **Session Security**: Review `better-auth` session configuration.
  - [ ] Ensure sessions expire after 30 days of inactivity.
  - [ ] Support session revocation from settings page.
  - [ ] Track active sessions with device info (`session.userAgent` already stored).
- [ ] **API Key Security**:
  - [ ] Hash API keys before storage (store only the hash, show key once on creation).
  - [ ] Add IP allowlist per API key.
  - [ ] Log all API key usage for audit trail.
- [ ] **CSRF Protection**: Validate origin headers on all mutation endpoints.
- [ ] **Content Security Policy**: Add strict CSP headers via `next.config.ts`.
- [ ] **Dependency Audit**: Run `npm audit` monthly, zero critical vulnerabilities policy.

### **Data Protection**

- [ ] **PII Handling**: Ensure Reddit usernames are anonymized in reports.
  - [ ] Option to strip `author` fields before storing pain points.
  - [ ] GDPR-compliant data retention: auto-delete user data 30 days after account deletion.
- [ ] **Encryption at Rest**: Ensure database connection uses SSL.
- [ ] **Rate Limiting**: Implement per-user rate limiting on all API endpoints.
  - [ ] Use a sliding window counter in Redis or in-memory.
  - [ ] Return `429 Too Many Requests` with `Retry-After` header.

---

## 📅 11. Maintenance & Periodic Audits

### **Database Maintenance**

- [ ] **Monthly Log Truncation**: Archive `scraper_run` logs every 60 days.
  - [ ] Move old records to a `scraper_run_archive` table or delete.
  - [ ] Keep aggregate stats (total runs, total pain points) in a summary table.
- [ ] **Vector Index Rebuild**: Weekly `REINDEX` for PGVector performance.
  - [ ] Schedule via cron job or Inngest scheduled function.
  - [ ] Monitor index size and query performance before/after rebuild.
- [ ] **Dead Data Cleanup**: Remove orphaned records.
  - [ ] Pain points with no scraper (orphaned by hard-delete).
  - [ ] Embeddings with no corresponding pain point.
  - [ ] Empty clusters with `sourceCount = 0`.
- [ ] **Database Backup Verification**: Monthly test of backup restoration.

### **Content & Quality**

- [ ] **User Feedback Loop**: "Was this insight accurate?" button.
  - [ ] Thumbs up/down on each pain point in the report view.
  - [ ] Store feedback in a `pain_point_feedback` table.
  - [ ] Use feedback to adjust scoring weights over time.
  - [ ] Dashboard showing feedback accuracy metrics for admin.
- [ ] **Reddit User Agent Rotation**: Update headers monthly.
  - [ ] Maintain a pool of 3-5 user agent strings.
  - [ ] Rotate on each request or on 403 errors.
- [ ] **AI Model Evaluation**: Monthly benchmark of extraction quality.
  - [ ] Run golden dataset against current model.
  - [ ] Compare with latest available models.
  - [ ] Switch default model if a newer one scores 5%+ better.
- [ ] **Dependency Updates**: Monthly update cycle.
  - [ ] Run `npm outdated` and review breaking changes.
  - [ ] Update Drizzle ORM, Next.js, and Tailwind CSS on minor versions.
  - [ ] Pin major versions and test before upgrading.

### **Monitoring & Alerts**

- [ ] **Uptime Monitoring**: External ping every 5 minutes.
- [ ] **Error Rate Alerting**: Alert if API error rate exceeds 5% in a 15-minute window.
- [ ] **Cost Alerting**: Alert if daily OpenRouter spend exceeds $50.
- [ ] **Database Connection Pool Alerting**: Alert if pool utilization exceeds 80%.
- [ ] **Reddit API Health Dashboard**: Real-time view of request success rates per subreddit.
