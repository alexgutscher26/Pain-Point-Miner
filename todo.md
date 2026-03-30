# 🚀 RPP (Reddit Pain-Point Miner) — Master Specification & Ultimate Roadmap

> **Source of Truth** for the RPP project. Contains the MVP Core Specification (current phase) and the Advanced Scaling Roadmap (future phases).
>
> **Legend:** ✅ Done · 🔄 In Progress · ⬜ Planned · 🔴 Blocked · 🔥 High Priority

---

## 📐 Project Foundation

### Core Value Proposition

SaaS founders waste hours manually searching Reddit for idea validation. RPP automates the entire search-and-discovery loop: fetching posts → extracting semantic pain points → clustering them into ranked market opportunities.

**Goal:** A dashboard of validated, high-demand SaaS opportunities derived from real community signals.

### Tech Stack

| Layer    | Technology                                                 |
| -------- | ---------------------------------------------------------- |
| Frontend | Next.js 15 (App Router) · Tailwind CSS 4 · Shadcn UI       |
| Backend  | Next.js API Routes (TypeScript)                            |
| Database | PostgreSQL · Drizzle ORM · PGVector (semantic clustering)  |
| AI       | OpenRouter — Gemini 2.0 Flash / GPT-4o / Claude Sonnet 3.5 |
| Reddit   | Native Fetch + OAuth · PullPush fallback                   |

### Pain Point Scoring Formula (v1)

```
Score = (mentions × 1.0) + (avg_comments × 0.5) + (avg_upvotes × 0.2)
```

- **Mentions** → unique threads discussing the same root problem
- **Comments** → community discussion depth
- **Upvotes** → signal of broader agreement

### Architecture Map

| Module                           | Purpose                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `lib/mining-runner.ts`           | Full pipeline orchestrator: parallel fetch → comment fetch → AI extraction → embedding + clustering |
| `lib/embeddings.ts`              | OpenRouter embedding generation (`text-embedding-3-small`, 1536d) · PGVector cosine search          |
| `lib/clustering.ts`              | Auto-groups pain points into `painPointCluster` (threshold: 0.82 cosine similarity)                 |
| `lib/ai.ts`                      | OpenRouter-based pain point extraction from posts + comments                                        |
| `lib/reddit.ts`                  | OAuth fetch with retry · PullPush fallback for 403/blocked                                          |
| `lib/budget-signals.ts`          | Extracts willingness-to-pay signals from post bodies and comments                                   |
| `lib/community-map.ts`           | Subreddit density data for the heatmap visualization                                                |
| `lib/plan-gating.ts`             | Starter / Growth / Pro entitlements · scan usage tracking                                           |
| `lib/plan-resolver.ts`           | Subscription state resolution from Stripe                                                           |
| `lib/trend-detection.ts`         | Trend direction detection (up / down / flat / new)                                                  |
| `lib/dashboard-metrics.ts`       | Opportunity scoring · validation scoring · market badge logic                                       |
| `lib/scheduler.ts`               | `isScraperDue()` frequency-based scheduling                                                         |
| `lib/reddit-idempotency.ts`      | 24h guard — never re-process the same Reddit post ID                                                |
| `lib/rate-limit.ts`              | Sliding-window per-user rate limiting                                                               |
| `lib/api-auth.ts`                | Route-level auth enforcement                                                                        |
| `lib/run-status.ts`              | `normalizeRunStatus()` — canonical status string mapping                                            |
| `lib/time-window.ts`             | Time window helpers (24h / 7d / 30d / 90d)                                                          |
| `app/api/search/stream/route.ts` | SSE endpoint for real-time mining progress                                                          |
| `hooks/use-mining-stream.ts`     | Client SSE hook with polling fallback                                                               |

---

## 🏗️ PHASE 1 — Core Intelligence & Scraping Engine

> **Goal:** A rock-solid, parallelized data collection layer that fetches Reddit signal at scale, filters for pain-relevant content, and feeds extracted posts into the AI pipeline with zero duplicate processing.

### ✅ Completed

- [x] **Parallelized Scraping** — `mining-runner.ts` uses `Promise.allSettled` for concurrent subreddit + comment fetching
- [x] **Semantic Embedding Pipeline** — auto-generates 1536d vectors for every new `painPoint` via `lib/embeddings.ts`
- [x] **PGVector Semantic Search** — `findSimilarPainPoints()` with configurable cosine-distance threshold (`<=>`)
- [x] **Auto-Clustering** — `lib/clustering.ts` groups pain points into `painPointCluster` records (threshold: 0.82, fire-and-forget)
- [x] **Real-Time Mining via SSE** — phase-aware progress: `scanning → extracting → clustering → completed`
- [x] **`useMiningStream` Hook** — automatic polling fallback if SSE connection fails or drops
- [x] **Phase Tracking in Runner** — `scraperRun.status` updated incrementally so SSE reflects real-time state
- [x] **Problem Pattern Filtering** — configurable keyword dictionary: "struggling", "frustrating", "hate", "pain", "wish there was", "why is it so hard", "anyone else deal with"
- [x] **Pattern Match Stats** — `postsMatched` in `scraperRun` reflects filtered post count
- [x] **Temporal Filtering** — `timeWindow` field (24h / 7d / 30d / 90d) passed to `fetchSubredditPostsBatched`
- [x] **Idempotency Guard** — `reddit-idempotency.ts` 24h guard prevents re-billing the same Reddit post ID
- [x] **PullPush Fallback** — if Reddit OAuth returns 403/blocked, silently retry via PullPush historical API
- [x] **Retry Logic** — exponential backoff with jitter on transient 5xx errors from Reddit API

### 🔥 High Priority (Planned)

- [x] **Reddit Rate Limit Monitoring**
  - [x] Create `reddit_rate_limit_log` table: `id`, `subreddit`, `statusCode`, `retryAfter`, `createdAt`
  - [x] Log every 429/403 event received from Reddit OAuth or PullPush
  - [x] Auto-backoff: 3+ consecutive 429s from the same subreddit → mark it as `throttled`, skip for 15 min
  - [x] Store throttle state in Redis or in-memory `Map` with TTL
  - [x] Surface SSE warnings: _"⚠️ r/startups is rate-limited, skipping for 15 min"_
  - [x] Show per-subreddit throttle status in the scan progress UI
  - [x] _Acceptance:_ A subreddit that returns 3 consecutive 429s is automatically skipped and an SSE warning fires within 500ms

- [x] **Multi-Sort Strategy**
  - [x] Add `hot`, `new`, `top` sort modes alongside current `relevance`
  - [x] `basic` mining depth → `relevance` only (fastest, cheapest)
  - [x] `deep` mining depth → `relevance` + `hot`
  - [x] `advanced` mining depth → all 4: `relevance`, `hot`, `new`, `top`
  - [x] Merge results: deduplicate by `post.id` across sort modes before AI extraction
  - [x] Track which sort mode a post came from in `RedditPostWithMeta.sortMode` field
  - [x] _Acceptance:_ An `advanced` scan of r/SaaS returns posts from all 4 sort modes with no duplicates

- [x] **Comment Depth Control**
  - [x] `basic` → top-level comments only (depth 0), max 20 comments per post
  - [x] `deep` → top-level + first-level replies (depth 1), max 50 comments
  - [x] `advanced` → full recursive extraction (current behavior), max 200 comments
  - [x] Pass `maxDepth` and `maxComments` to `fetchComments()` based on mining depth
  - [x] Log comment count per post in `scraperPost.commentCount`
  - [x] _Acceptance:_ `basic` scan never fetches reply comments; `deep` fetches exactly one reply tier

- [x] **Post Quality Pre-Filter**
  - [x] Skip posts where `score < 2` AND `num_comments < 3` (for `basic` depth)
  - [x] Skip posts where `selftext` equals `[removed]` or `[deleted]`
  - [x] Skip link posts (where `is_self === false`) unless no self-posts exist for keyword
  - [x] Add `qualityScore` field to `scraperPost` (0–1) for downstream filtering
  - [x] Expose pre-filter stats in SSE: "Skipped 12 low-quality posts"
  - [x] _Acceptance:_ A `basic` scan of r/startups skips deleted/removed posts and logs skip reason

- [x] **Subreddit Discovery Engine**
  - [x] Given a keyword (e.g., "SEO"), auto-suggest relevant subreddits via Reddit `/subreddits/search`
  - [x] Score suggestions by: subscriber count, activity level, relevance to keyword
  - [x] Return top 10 suggestions with subscriber count + description in `/api/search/suggest-subreddits`
  - [x] Show suggestions inline in the search form before the user starts a scan
  - [x] Cache suggestions for 24h per keyword to avoid redundant Reddit API calls
  - [x] _Acceptance:_ Typing "email marketing" into the search form suggests r/emailmarketing, r/Entrepreneur, r/SaaS within 500ms

- [x] **Mining Depth Presets**
  - [x] Define 3 standard presets with cost estimates shown before scan
  - [x] `basic`: 3 subreddits, `relevance` only, depth 0 comments — ~0.5 credits
  - [x] `deep`: 5 subreddits, 2 sort modes, depth 1 comments — ~2 credits
  - [x] `advanced`: 10 subreddits, 4 sort modes, full recursive comments — ~5 credits
  - [x] Show "Estimated cost: 2 credits" in the search form before user submits
  - [x] _Acceptance:_ Pre-scan cost estimate matches actual credit deduction ±10%

### ⬜ Planned (Future)

- [x] **Adaptive Concurrency Control** — dynamically reduce parallelism if Reddit 429 rate increases above 20%
- [x] **Webhook-Based Post Ingestion** — subscribe to new Reddit posts via RSS feeds for near-real-time ingestion
- [x] **Scraper Health Dashboard** — per-subreddit success rate, avg posts per scan, last 7d trend chart
- [x] **Custom Problem Pattern Dictionary** — allow Pro users to define their own trigger phrases per search

---

## 🧠 PHASE 2 — AI Analysis & Deep Opportunity Scoring

> **Goal:** Transform raw Reddit signal into structured, scored, and explainable market intelligence that a founder can act on immediately.

### ✅ Completed

- [x] **Willingness-to-Pay Extraction** (`lib/budget-signals.ts`) — detects "I would pay $X", "shut up and take my money", "budget of $X", "willing to spend"
- [x] **Budget Signals Storage** — `painPoint.budget` holds the extracted quote text verbatim
- [x] **💰 WTP Badge** — surfaces on pain point cards where `budget IS NOT NULL`
- [x] **Cluster-Level TAM** — raw budget quotes aggregated into `painPointCluster.estimatedTam` field
- [x] **Sentiment Classification** — `frustrated | curious | desperate | neutral | angry` labels from AI extraction
- [x] **Pain Intensity Score** — AI returns 1–10 `painIntensity` stored on each `painPoint`
- [x] **Urgency Score** — AI returns 1–10 `urgency` stored on each `painPoint`
- [x] **Tried Solutions Extraction** — `painPoint.triedSolutions[]` captures tools users already attempted

### 🔥 High Priority (Planned)

- [ ] **Multi-Model Routing in `lib/ai.ts`**
  - [ ] `basic` depth → `google/gemini-2.0-flash-001` (fast, cheap, ~$0.001/post)
  - [ ] `deep` depth → `openai/gpt-4o` (better nuance, budget detection accuracy)
  - [ ] `advanced` depth → `anthropic/claude-sonnet-3-5` (best market analysis + competitor intel)
  - [ ] Add `modelId` to `aiUsage` table: `id`, `userId`, `modelId`, `inputTokens`, `outputTokens`, `costUsd`, `createdAt`
  - [ ] Track per-model cost in `aiUsage` for billing reconciliation
  - [ ] Expose `user_preferences.defaultAiModel` — allow Pro users to override the default
  - [ ] Show "Powered by GPT-4o" label in the report metadata header
  - [ ] _Acceptance:_ A `deep` scan uses GPT-4o exclusively; cost logged to `aiUsage` within 1s of extraction

- [x] **Scoring Algorithm V2 — Weighted Formula**
  - [x] Replace `toOpportunityScore()` in `lib/dashboard-metrics.ts` with a weighted multi-factor formula
  - [x] Formula: `score = (painIntensity × w1) + (monetizationScore × w2) + (urgency × w3) + (marketMaturity × w4)`
  - [x] Default weights: `w1=0.40`, `w2=0.30`, `w3=0.20`, `w4=0.10`
  - [x] Store weights as JSON in `user_preferences.scoringWeights`
  - [x] Pro user settings page: sliders for each weight, live preview of re-scored opportunities
  - [x] Add `opportunity.scoreExplanation` — human-readable string: "High score driven by 8/10 pain intensity and explicit budget mentions"
  - [x] Re-score all opportunities when user saves new weights (background job)
  - [x] _Acceptance:_ Changing weights in settings re-scores and re-sorts the opportunity dashboard within 2s

### ⬜ Planned

- [ ] **Sentiment Confidence Scoring**
  - [ ] AI returns `{ sentiment: string, confidence: number }` instead of just a label
  - [ ] Store `painPoint.sentimentConfidence` (float 0–1)
  - [ ] If `confidence < 0.6` → automatically re-extract using the next tier model
  - [ ] UI: confidence ≥ 0.8 → solid badge; 0.6–0.8 → semi-dashed; < 0.6 → dotted with "uncertain" tooltip
  - [ ] Log re-extraction events to `aiUsage` with `reason: "low_confidence_retry"`
  - [ ] _Acceptance:_ Posts extracted with < 60% confidence are re-processed with a stronger model and sentiment updated

- [ ] **MVP Action Plan Generation**
  - [ ] New AI prompt on `opportunity` record after clustering is finalized
  - [ ] `opportunity.buildPlan` → JSON: `{ stack: string[], features: string[], architecture: string, timeline: string }`
  - [ ] `opportunity.mvpFeatures[]` → ordered list of 3–5 specific feature names
  - [ ] `opportunity.targetAudience` → 2-sentence ICP description (who, what job, what pain)
  - [ ] `opportunity.whyItExists` → 1-paragraph market gap analysis (why no good solution exists yet)
  - [ ] Generate only for opportunities with `opportunityScore >= 7.0` to control cost
  - [ ] "Generate Build Plan" button in report detail page for lower-scoring opportunities (on demand)
  - [ ] _Acceptance:_ Top-scoring opportunity has a complete build plan within 30s of report finalization

- [x] **Build Difficulty Estimation**
  - [x] AI classifies each opportunity into 4 tiers based on complexity signals
  - [x] `Weekend Project` — 1–2 days, no integrations, simple CRUD; e.g., a browser extension
  - [x] `Side Project` — 1–2 weeks, 1–2 third-party integrations; e.g., a simple SaaS dashboard
  - [x] `Startup MVP` — 1–3 months, auth + billing + complex domain logic; e.g., an analytics platform
  - [x] `VC-Scale Moat` — 6+ months, network effects, regulatory complexity, data moat required
  - [x] Store in `opportunity.difficulty` (enum field)
  - [x] AI factors: number of integrations in `triedSolutions`, regulatory keywords ("HIPAA", "SOC2"), network effect signals, data moat requirements
  - [x] Show difficulty badge with color coding: green / yellow / orange / red
  - [x] _Acceptance:_ "I need a HIPAA-compliant patient management app" scores as `Startup MVP` or higher

- [x] **Competitor Intel Engine**
  - [x] Collect all `triedSolutions` strings across pain points in a cluster
  - [x] Normalize: lowercase → title-case lookup → fuzzy dedup ("HubSpot", "hubspot", "HubSpot CRM" → "HubSpot")
  - [x] For each unique tool: fire a `HEAD` or `GET` request to attempt to resolve homepage title + description
  - [x] Populate `opportunity.competitorIntel`: `[{ name, url, description, mentionCount, category }]`
  - [x] "Competitive Landscape" card on report detail page: ranked by `mentionCount`, with external links
  - [x] Cache resolved tool data in a `tool` table to avoid re-fetching on every report
  - [x] _Acceptance:_ A cluster with 5 posts mentioning "Airtable" surfaces Airtable in the Competitive Landscape card with correct description

- [ ] **Cross-Subreddit Correlation**
  - [ ] After clustering, compare pain points across different subreddit sources using embedding similarity
  - [ ] Pain points with `sourceSubreddits.length >= 3` → add `painPointCluster.crossCommunity = true`
  - [ ] Apply a `+1.5` score boost to cross-community clusters in opportunity scoring
  - [ ] Show 🔥 "Cross-Community Signal" badge on cluster cards
  - [ ] List the contributing subreddits: "Found in r/SaaS, r/startups, r/Entrepreneur"
  - [ ] _Acceptance:_ A pain point appearing in 3+ subreddits is promoted and badged within the current report cycle

- [ ] **Quote Extraction Engine**
  - [ ] AI prompt extension: "Extract the 3 most emotionally charged or budget-explicit quotes from these comments"
  - [ ] Store in `painPointComment.isGoldenQuote = true` + `painPointComment.emotionScore` (1–10)
  - [ ] If no budget quotes exist, fallback to highest `painScore` comments
  - [ ] Surface golden quotes in a highlighted block on report detail: syntax like a pull-quote with author handle (anonymized)
  - [ ] Allow users to manually flag/unflag golden quotes via 👑 button
  - [ ] _Acceptance:_ Every pain point with >3 comments surfaces at least 1 golden quote in the detail view

- [ ] **Trend Velocity Detection**
  - [ ] Extend `lib/trend-detection.ts` — add `velocity` metric alongside existing `direction`
  - [ ] Formula: `velocity = (currentPeriodMentions - previousPeriodMentions) / previousPeriodMentions`
  - [ ] Velocity buckets: `exploding` (>100% increase) · `accelerating` (>25%) · `steady` (<25%) · `declining` (negative)
  - [ ] Store `painPoint.velocity` and `painPointCluster.velocity`
  - [ ] 📈 "Accelerating" badge on dashboard cards where cluster velocity > 25%
  - [ ] Mini sparkline chart (7 data points) rendered with a lightweight SVG inline — no Recharts needed for sparklines
  - [ ] _Acceptance:_ A keyword that doubled in mentions week-over-week shows "exploding" velocity badge

- [ ] **AI Cost Tracking Dashboard**
  - [ ] Admin-only page at `/dashboard/admin/ai-costs`
  - [ ] Table: date, model, total input tokens, total output tokens, estimated cost (USD)
  - [ ] Daily spend chart (last 30 days) using Recharts `AreaChart`
  - [ ] Per-user cost breakdown for workspace owners
  - [ ] Alert when any single scan exceeds $2 in AI cost — show warning before extraction starts
  - [ ] _Acceptance:_ Admin can see yesterday's total OpenRouter spend within 1 page load

---

## 🎨 PHASE 3 — UI/UX & Kinetic Intelligence Design

> **Goal:** A premium, data-dense interface that surfaces market intelligence instantly. Every interaction should feel fast, purposeful, and visually exceptional.

### ✅ Completed

- [x] **Global Dashboard** — high-contrast signals, sharp geometry, mono-typography accents, Swiss International Style
- [x] **Subreddit Heatmap (Community Map)** — grid/treemap sized by pain point count, colored by avg intensity, drillable to filtered list
- [x] **Skeleton Loading States** — shimmer skeletons for metric cards, table rows, and analysis steps
- [x] **Toast Improvements** — pain point count on success · retry button on error · progress % on long running ops
- [x] **Budget Signal Badge** — 💰 WTP badge on pain point cards where budget signal was detected
- [x] **Analysis Page** — real-time SSE progress with phase indicators and live status messages
- [x] **Reports List Page** — sortable, filterable table of all investigations with metadata

### 🔥 High Priority (Planned)

- [x] **Empty States with CTAs**
  - [x] Dashboard (no reports) → large "Start your first investigation" hero with animated illustration
  - [x] Reports page (no saved reports) → illustration + "Run a scan" CTA button
  - [x] Analysis page (invalid or missing scraper ID) → graceful redirect to search page
  - [x] Pain points tab (empty cluster) → "No pain points found. Try adjusting your keywords."
  - [x] Use consistent illustration style across all empty states (monochrome with accent color)
  - [x] _Acceptance:_ Every page has a designed empty state instead of a blank white area

- [ ] **Dark/Light Theme Toggle**
  - [ ] Use `next-themes` with `ThemeProvider` wrapping the root layout
  - [ ] Persist chosen theme in `user_preferences.theme` (database) AND localStorage as fallback
  - [ ] System preference (`prefers-color-scheme`) as the default for new users
  - [ ] Implement light-mode equivalents for all custom CSS variables (`--foreground`, `--muted`, etc.)
  - [ ] Theme toggle button in sidebar footer and settings page
  - [ ] Prevent flash of wrong theme (FOUC) via inline `<script>` in `<head>` for SSR
  - [ ] _Acceptance:_ Toggling theme has zero flash, persists across page reloads, and works on all pages

- [ ] **Report Detail Page — Full Implementation**
  - [ ] **Pain Point Cards** — visual pain intensity bar (CSS width %), urgency badge, colored sentiment pill, subreddit chip
  - [ ] Expand card to show: full post body, top 3 comments, tried solutions chips, similar pain points panel
  - [ ] "Similar Pain Points" section powered by `findSimilarPainPoints()` — show top 3 with similarity %
  - [ ] **Cluster Summary Section** — canonical title, source count, avg pain intensity, top 2 golden quotes, drill-down toggle
  - [ ] **Export Functionality**
    - [ ] PDF: server-rendered via `@react-pdf/renderer` or Puppeteer screenshot endpoint
    - [ ] CSV: pain point title, body, score, subreddit, sentiment, budget signal, cluster
    - [ ] JSON: full structured report data for API consumers and Zapier/Make integrations
  - [ ] **Report Annotations** — inline note editor using `opportunityNote` table, show notes count badge in reports list
  - [ ] _Acceptance:_ Expanding a pain point card shows full body + comments without page navigation

### ⬜ Planned

- [ ] **Opportunity Radar Charts**
  - [ ] Pentagonal radar chart per opportunity using Recharts `RadarChart`
  - [ ] 5 axes: Pain Intensity · Urgency · Monetization Potential · Market Maturity · Build Complexity
  - [ ] Custom dark-theme styling: no grid lines, glowing fills, monospace axis labels
  - [ ] Visible in report detail sidebar AND opportunity comparison view
  - [ ] Animate in on mount using Recharts animation props
  - [ ] _Acceptance:_ Radar chart renders in < 200ms and all 5 axes show correct values from opportunity record

- [x] **Command Palette (Cmd+K)**
  - [x] Build with `cmdk` library (already in deps)
  - [x] Commands: `/scan <keyword>`, `/report <id>`, `/settings`, `/billing`, `/search`
  - [x] Recent 5 searches and recent 5 reports as auto-populated suggestions
  - [x] Keyboard shortcut indicator (e.g., `⌘K`) visible in the sidebar footer
  - [x] Fuzzy search across reports by title and keyword
  - [x] _Acceptance:_ Pressing Cmd+K opens the palette in < 100ms; typing "SEO" shows matching reports

- [ ] **Pain Point Cluster Visualization (Force Graph)**
  - [ ] Force-directed graph using `d3-force` or `react-force-graph-2d`
  - [ ] Nodes = pain point clusters; node size = `sourceCount`; node color = avg `painIntensity` (green → red)
  - [ ] Edges = cosine similarity > 0.7 between clusters
  - [ ] Click a node → expand overlay showing individual pain points in that cluster
  - [ ] Pan and zoom support; reset zoom button
  - [ ] Export graph as PNG
  - [ ] _Acceptance:_ Graph renders in < 1s for up to 50 clusters; clicking a node opens its detail panel

- [ ] **Report Comparison View**
  - [ ] Multi-select (checkboxes) in reports list → "Compare" button activates when 2–3 selected
  - [ ] Side-by-side layout: overlapping pain points (highlighted), unique findings per report, score deltas
  - [ ] Diff color coding: green = unique to A, blue = unique to B, gray = shared
  - [ ] Export comparison as PDF or generate a shareable `/compare/<slug>` link
  - [ ] _Acceptance:_ Comparing 2 reports correctly identifies overlapping pain points via embedding similarity

- [ ] **Spotlight Hover Effect**
  - [ ] CSS `radial-gradient` that follows mouse `clientX/Y` position within the card boundary
  - [ ] Only activate on opportunity cards with `opportunityScore > 70`
  - [ ] Subtle gold-tinted glow, opacity capped at 15% — not distracting
  - [ ] Remove effect on touch devices (no hover)
  - [ ] _Acceptance:_ Moving mouse across a high-score card produces a smooth gradient follow effect

- [ ] **Glassmorphism Overlays**
  - [ ] `backdrop-filter: blur(20px) saturate(180%)` on report detail right panel
  - [ ] Semi-transparent card backgrounds: `rgba(255,255,255,0.05)` in dark mode
  - [ ] Use `@supports (backdrop-filter: blur(1px))` guard for browser compatibility
  - [ ] Applies to: floating insight panels, keyboard shortcut overlay, cluster detail drawer

- [ ] **Mobile-First Insight Feed**
  - [ ] Card-based vertical-scroll feed, thumb-friendly (44px min touch target)
  - [ ] Swipe-to-bookmark gesture using touch events (detect horizontal swipe > 80px)
  - [ ] `vaul` bottom sheet (already in deps) for pain point detail on mobile
  - [ ] Responsive nav: collapse sidebar to bottom tab bar on `< 768px`
  - [ ] _Acceptance:_ Full report browsing is usable on iPhone SE without horizontal scroll

- [ ] **Keyboard Shortcuts**
  - [ ] `n` → new investigation (navigate to `/dashboard/search`)
  - [ ] `r` → reports list · `d` → dashboard home · `?` → shortcut overlay · `Esc` → close any modal
  - [ ] Disable shortcuts when user is typing in an input or textarea
  - [ ] _Acceptance:_ All shortcuts work globally; pressing `?` shows the shortcut reference modal

- [ ] **Onboarding Flow for New Users**
  - [ ] First-login redirect to a guided 3-step onboarding: Choose niche → Select subreddits → Run first scan
  - [ ] Progress bar indicator at top of onboarding pages
  - [ ] Skip option available at every step
  - [ ] After first scan completes: "You found X pain points!" celebration screen with confetti
  - [ ] Persist completion state in `user_preferences.onboardingComplete`
  - [ ] _Acceptance:_ New user can complete onboarding and run first scan in under 2 minutes

- [ ] **Accessibility Audit**
  - [ ] All interactive elements have `aria-label` or `aria-labelledby`
  - [ ] Color contrast ratio ≥ 4.5:1 for all text (WCAG AA)
  - [ ] Focus ring visible on all interactive elements (custom `focus-visible` CSS)
  - [ ] Screen reader announces SSE progress updates via `aria-live` region
  - [ ] All data tables have `<th scope>` and `<caption>` elements
  - [ ] _Acceptance:_ `axe-core` audit returns zero critical violations on dashboard and report detail pages

---

## 🔐 PHASE 4 — Infrastructure, Security & Multi-Tenancy

> **Goal:** A production-grade, multi-tenant platform where workspace isolation, durability, and observability are first-class concerns.

### ✅ Completed

- [x] **Session Security** — 30-day inactivity expiry · revocation from settings page · device info in `session.userAgent`
- [x] **CSRF Protection** — origin headers validated on all mutation endpoints
- [x] **CSP Headers** — strict Content Security Policy in `next.config.ts`
- [x] **PII Handling** — Reddit author fields anonymized · GDPR 30-day post-deletion purge
- [x] **Encryption at Rest** — PostgreSQL connection enforces SSL (`ssl: true`)
- [x] **Per-User Rate Limiting** — sliding window counter in `lib/rate-limit.ts` · `429 Retry-After` header
- [x] **Route Auth Enforcement** — `lib/api-auth.ts` guards all protected API routes
- [x] **Workspace Scoping** — partial `workspaceScope()` enforcement in query layer
- [x] **Secure Tempfile Handling** — fixed potential resource leakage/locking in `lighthouse_audit.py`

### 🔥 High Priority (Planned)

- [ ] **RBAC & Workspaces — Full Implementation**
  - [ ] 3 roles: `Owner` (full access, billing, invite/remove) · `Analyst` (scan + view + notes) · `Viewer` (read-only)
  - [ ] Schema: `workspace_member` table with `workspaceId`, `userId`, `role`, `invitedAt`, `acceptedAt`
  - [ ] Email invite flow: send invite email → unique token link → accept page → role assignment
  - [ ] Workspace settings page: member list, inline role dropdown, remove member button
  - [ ] Workspace name and slug editing (slug must be unique, URL-safe)
  - [ ] Complete `workspaceScope()` enforcement: every `SELECT`, `INSERT`, `UPDATE`, `DELETE` scoped to `workspaceId`
  - [ ] API routes return `403 Forbidden` if user attempts cross-workspace access
  - [ ] _Acceptance:_ A Viewer cannot trigger a new scan; an Analyst cannot access billing settings

- [ ] **API Key Security — Full Implementation**
  - [ ] Hash API keys with `bcrypt` before storage; store only the hash
  - [ ] Show raw key exactly once on creation, in a copy-protected UI input
  - [ ] IP allowlist: `apiKey.allowedIps[]` — reject requests from unlisted IPs
  - [ ] Log every API key usage: timestamp, endpoint, IP, response status to `api_key_usage_log`
  - [ ] Key revocation: soft-delete with `revokedAt` timestamp
  - [ ] Key rotation: generate new secret, invalidate old one atomically
  - [ ] _Acceptance:_ Creating a key shows it once; subsequent API calls use the hash for validation

- [ ] **Dependency Audit**
  - [ ] Run `npm audit --audit-level=critical` in CI on every PR
  - [ ] Block merges if critical vulnerabilities are found
  - [ ] Monthly manual review of `npm audit` output for high-severity issues
  - [ ] Maintain a `SECURITY.md` with known exemptions and reasoning

### ⬜ Planned

- [ ] **Durable Execution via Inngest**
  - [ ] Create `inngest/mining-workflow.ts` as a step-based durable workflow
  - [ ] Step 1: `fetchSubredditPosts` — retryable, idempotent by `scraperRunId`
  - [ ] Step 2: `fetchComments` — retryable, parallelized per post with `step.run`
  - [ ] Step 3: `extractPainPoints` — retryable with exponential backoff, max 3 retries
  - [ ] Step 4: `generateEmbeddingsAndCluster` — retryable
  - [ ] Step 5: `finalizeAndNotify` — update `scraperRun.status = completed`, trigger notification
  - [ ] Replace current fire-and-forget approach in `mining-runner.ts`
  - [ ] Dashboard shows Inngest run ID, current step name, and step-level progress bar
  - [ ] Failed step surfaces a "Retry from Step 3" button in the analysis UI
  - [ ] _Acceptance:_ A failed AI extraction step auto-retries 3 times before marking run as failed

- [ ] **Notification System**
  - [ ] Build on top of existing `notification` table in schema
  - [ ] Trigger types: `scan_complete`, `high_score_found`, `trial_ending`, `usage_limit_near`
  - [ ] Threshold Alerts: user configures "Alert me when opportunity score > X" in settings
  - [ ] Delivery channels: in-app bell (badge count), email digest (daily/weekly), Slack webhook URL
  - [ ] In-app notification center: dropdown panel in topbar, "Mark all read" action
  - [ ] Notification preferences page: per-type enable/disable, digest frequency, Slack webhook config
  - [ ] Notification history at `/dashboard/settings/notifications` (last 90 days)
  - [ ] _Acceptance:_ A scan that finds an opportunity with score > 8.5 triggers an in-app + email notification within 30s

- [ ] **Public API — Developer Preview**
  - [ ] API key management UI at `/dashboard/settings/api-keys`
  - [ ] Key details: name, created date, last used, scope, expiry, revoke button
  - [ ] Rate limiting by plan: 100/min Starter · 500/min Growth · unlimited Pro
  - [ ] `X-RateLimit-Remaining` and `X-RateLimit-Reset` response headers on all v1 routes
  - [ ] OpenAPI 3.0 spec generated from route types — served at `/docs/api`
  - [ ] Interactive API explorer (Swagger UI or Scalar) embedded at `/docs/api/playground`
  - [ ] Endpoints: `GET /api/v1/reports` · `GET /api/v1/reports/:id` · `GET /api/v1/pain-points` · `POST /api/v1/search`
  - [ ] Webhooks: `POST` to user-configured URL on scan complete events
  - [ ] _Acceptance:_ `curl -H "Authorization: Bearer <key>" /api/v1/reports` returns paginated report list

- [ ] **Audit Log**
  - [ ] Schema: `audit_log` table — `id`, `workspaceId`, `userId`, `action`, `resourceType`, `resourceId`, `metadata` (JSON), `ip`, `userAgent`, `createdAt`
  - [ ] Log these events: scan initiated · report exported · report deleted · API key created/revoked · member invited/removed · billing plan changed
  - [ ] Audit log viewer for workspace Owners: filterable by action, user, date range
  - [ ] Logs are immutable (no UPDATE/DELETE allowed on `audit_log`)
  - [ ] Retain logs for 1 year (auto-archive older records)
  - [ ] _Acceptance:_ Revoking an API key appears in the audit log within 1s with correct `userId` and timestamp

- [ ] **Soft Delete — Full Implementation**
  - [ ] Add `deletedAt TIMESTAMP` column to: `scraper`, `scraperRun`, `painPoint`, `opportunity`, `report`
  - [ ] Drizzle global query middleware: automatically append `WHERE deletedAt IS NULL` to all SELECT queries
  - [ ] "Move to Trash" action replaces permanent delete in the UI
  - [ ] `/dashboard/trash` page showing deleted items with "Restore" and "Delete Forever" buttons
  - [ ] Cascade soft-delete: deleting a `scraper` soft-deletes its `scraperRun`s, `painPoint`s, `opportunity`s
  - [ ] Auto-purge permanently after 30 days via scheduled Inngest function
  - [ ] _Acceptance:_ Deleting a scraper moves it to trash; restoring it recovers all child records

- [ ] **Observability Stack**
  - [ ] Track "Time to Insight": `scraperRun.firstPainPointAt - scraperRun.startedAt`
  - [ ] Track Reddit API error rates (403/429) per subreddit, rolling 5-minute window
  - [ ] Track AI extraction latency per model (p50, p95, p99)
  - [ ] Track embedding generation latency
  - [ ] Track SSE connection count and drop rate
  - [ ] Admin dashboard at `/dashboard/admin` surfacing all key metrics
  - [ ] Integrate with an external provider (Grafana Cloud or Axiom) for long-term metric storage
  - [ ] _Acceptance:_ Admin page shows real-time Time to Insight metric and Reddit API health

- [ ] **Database Performance Hardening**
  - [ ] PGVector HNSW index on `pain_point_embedding.embedding` for sub-10ms similarity search
  - [ ] Composite index on `pain_point(workspaceId, scraperId, createdAt DESC)`
  - [ ] Composite index on `scraper_run(workspaceId, status, createdAt DESC)` for dashboard queries
  - [ ] Connection pooling: verify `prepare: false` and `max: 10` for serverless environment
  - [ ] Slow query logging: log any query exceeding 500ms to `slow_query_log` table
  - [ ] Monthly `ANALYZE` on key tables to keep query planner statistics fresh
  - [ ] _Acceptance:_ `findSimilarPainPoints()` returns results in < 50ms for a corpus of 10,000 embeddings

- [ ] **Pinecone.io Integration (Vector Scaling)**
  - [ ] Migrate vector similarity search from local PGVector to dedicated Pinecone infrastructure
  - [ ] Implement `upsert` logic in `lib/embeddings.ts` alongside Postgres primary storage
  - [ ] Leverage Pinecone metadata filtering for millisecond-latency search across multiple environments
  - [ ] Support hybrid search (keyword + semantic) natively via Pinecone's vector engine
  - [ ] _Acceptance:_ Latency for top-K similar pain point queries remains < 50ms even with 1M+ embeddings

- [ ] **LLM Observability via Helicone.ai**
  - [ ] Set up Helicone proxy gateway for all OpenRouter calls in `lib/ai.ts` and `lib/embeddings.ts`
  - [ ] Add custom request properties for breakdown by `userId`, `scanId`, and `depth`
  - [ ] Enable Helicone caching for redundant extraction calls to reduce unnecessary API spend
  - [ ] _Acceptance:_ Real-time cost and latency tracking per scan is visible in the Helicone dashboard

---

## 💰 PHASE 5 — Revenue & Growth

> **Goal:** Build compounding revenue through credit-based billing, viral share loops, and SEO-driven organic acquisition. Every feature should either retain users or bring new ones.

### Pricing Strategy

| Plan        | Monthly | Annual | Scans/Mo  | Subreddits | Depth        | AI Model      |
| ----------- | ------- | ------ | --------- | ---------- | ------------ | ------------- |
| **Starter** | Free    | Free   | 3         | 3          | Basic only   | Gemini Flash  |
| **Growth**  | $29     | $23/mo | 20        | 8          | Basic + Deep | GPT-4o        |
| **Pro**     | $79     | $63/mo | Unlimited | Unlimited  | All depths   | Claude Sonnet |

### ✅ Completed

- [x] **Stripe Usage Billing** — credit-based consumption model connected to Stripe subscriptions
- [x] **Plan Enforcement** — `maxSubredditsPerSearch`, `allowedMiningDepths`, locked UI with "Upgrade" badge
- [x] **Sidebar Usage Meter** — "7/10 scans used this month" with visual progress bar
- [x] **Soft Block at 100%** — clear upgrade CTA modal, not a hard error response
- [x] **Free Trial Flow** — 3-day Pro trial on signup · countdown banner · Day 2/3/5 win-back emails
- [x] **Annual Billing Toggle** — 20% discount · "Save $48/year" callout on pricing page
- [x] **Social Proof** — ⭐ "Most Popular" badge on Growth plan card
- [x] **Landing Page Basics** — A/B headline test · live scan counter · testimonial carousel · interactive demo

### 🔥 High Priority (Planned)

- [ ] **Usage-Based Overage Packs**
  - [ ] "Buy 10 more scans for $5" one-time Stripe `price` (not subscription)
  - [ ] "Buy 50 more scans for $18" bulk pack option
  - [ ] Track overage `quantity` and `expiresAt` separately from subscription in `scan_credit` table
  - [ ] Show "You have 8 bonus scans remaining" in sidebar usage meter
  - [ ] _Acceptance:_ Purchasing an overage pack immediately unblocks scans without plan upgrade

- [ ] **Viral Report Engine — Public Sharing**
  - [ ] Generate cryptographically random 8-char slug on report creation: `/reports/share/<slug>`
  - [ ] Public report page (no auth required): summary stats, top 5 pain points, opportunity scores
  - [ ] Radar chart visible on public page (read-only Recharts render)
  - [ ] Auto-generate `og:image` via `@vercel/og` or Satori: branded card with niche name + top stat
  - [ ] SEO meta: `title`, `description`, `og:title`, `og:image`, `twitter:card`
  - [ ] "Shared via RPP" watermark + sign-up CTA banner at bottom of public page
  - [ ] "Share Report" button in authenticated report detail → copies share URL to clipboard
  - [ ] Track: `share_view` events (count), `share_conversion` events (sign-up from share link)
  - [ ] _Acceptance:_ Sharing a report URL shows full summary to an unauthenticated visitor

### ⬜ Planned

- [ ] **Programmatic SEO — Niche Landing Pages**
  - [ ] `/opportunities/<niche-slug>` pages auto-generated from completed public reports
  - [ ] Each page: top pain points for niche, market score, community sources, sign-up CTA
  - [ ] Schema.org `Article` structured data on each niche page
  - [ ] Auto-add to sitemap via `app/sitemap.ts` (already exists)
  - [ ] Internal linking: related niche pages linked in "You might also like" section
  - [ ] Target long-tail keywords: "SaaS ideas for [niche]", "[niche] pain points", "problems in [niche]"
  - [ ] _Acceptance:_ `/opportunities/email-marketing` renders with real pain point data and is indexable by Google

- [ ] **Referral Program**
  - [ ] "Invite a friend, both get 10 Deep Mines free" mechanic
  - [ ] Unique referral link per user: `app.rpp.io/signup?ref=<code>`
  - [ ] Track: invites sent, signups from link, conversions (first scan completed)
  - [ ] Referral dashboard at `/dashboard/referrals`: link, stats, earned credits
  - [ ] Apply credits automatically when referred user completes first scan
  - [ ] _Acceptance:_ Referred user signs up, runs first scan, both accounts credited within 60s

- [ ] **Email Drip Campaign (Resend or Loops)**
  - [ ] Day 0: Welcome email — "Here's how to run your first investigation in 2 minutes"
  - [ ] Day 1: Social proof — "What other founders discovered on their first scan"
  - [ ] Day 3: Re-engagement — "Your first report is waiting" (if no scan yet)
  - [ ] Day 7: Upgrade nudge — "Unlock Deep Mining for 10x more signal"
  - [ ] Day 14: Trial ending — "Your Pro trial ends tomorrow — lock in your plan"
  - [ ] Day 30: Win-back — "Come back and run a scan — here's what's trending in your niche"
  - [ ] All emails built with React Email templates (see Phase 8)
  - [ ] Unsubscribe link per email type, GDPR-compliant opt-out
  - [ ] _Acceptance:_ New signup receives Day 0 email within 60 seconds

- [ ] **Weekly Insights Digest**
  - [ ] Active users (scanned in last 7 days): "Top 3 opportunities across your scans this week"
  - [ ] Dormant users (no scan in 14+ days): "New trending pain points in your saved niches"
  - [ ] Include: opportunity title, score, top quote, "View Report" CTA
  - [ ] Scheduled via Inngest `cron` function every Monday 8am UTC
  - [ ] _Acceptance:_ Weekly digest sends only to opted-in users and links to correct reports

- [ ] **Conversion Funnel Optimization**
  - [ ] Track key events: `signup`, `first_scan_started`, `first_scan_completed`, `upgrade_modal_viewed`, `plan_upgraded`
  - [ ] PostHog or Plausible for funnel visualization
  - [ ] A/B test: free plan limits (3 vs 5 scans/month) and their effect on upgrade rate
  - [ ] A/B test: pricing page layout (feature table vs comparison cards)
  - [ ] Dashboard showing weekly MRR, churn rate, trial-to-paid conversion rate
  - [ ] _Acceptance:_ All 5 funnel events tracked and visible in analytics dashboard within 24h of implementation

- [ ] **Lifetime Deal (LTD) Launch**
  - [ ] One-time payment option: $199 (Growth forever) or $399 (Pro forever)
  - [ ] Stripe `payment_intent` flow (not subscription)
  - [ ] Available only for first 200 users (enforced by `ltd_seats_remaining` counter)
  - [ ] LTD badge in sidebar: "Lifetime Member ✨"
  - [ ] _Acceptance:_ LTD purchasers bypass monthly scan limits indefinitely

---

## 🧪 PHASE 6 — Quality, Testing & Evaluation

### ✅ Completed (Test Files Present)

> **20 test files exist** in `tests/`. The coverage targets below reflect what needs to be verified or expanded.

- [x] `tests/ai.test.ts` — AI extraction mocking
- [x] `tests/api-auth.test.ts` — Route auth enforcement
- [x] `tests/budget-signals.test.ts` — WTP signal detection
- [x] `tests/clustering.test.ts` — Cluster assignment vs creation
- [x] `tests/community-map.test.ts` — Heatmap data computation
- [x] `tests/dashboard-metrics.test.ts` — `toOpportunityScore`, `toValidationScore`, `getMarketBadge`
- [x] `tests/embeddings.test.ts` — Vector generation + PGVector query building
- [x] `tests/load-test.ts` — 50 concurrent mining run simulation
- [x] `tests/mining-runner.test.ts` — Pipeline orchestration
- [x] `tests/plan-gating.test.ts` — Plan entitlements + edge cases
- [x] `tests/plan-resolver.test.ts` — `resolvePlanForIdentity`
- [x] `tests/rate-limit.test.ts` — Sliding window counter
- [x] `tests/reddit-comments.test.ts` — Comment fetching + extraction
- [x] `tests/reddit-fetch.test.ts` — OAuth + PullPush fallback
- [x] `tests/reddit-ranking.test.ts` — Post ranking/scoring
- [x] `tests/run-status.test.ts` — `normalizeRunStatus` with all phase strings
- [x] `tests/scheduler.test.ts` — `isScraperDue` with various frequency/time combos
- [x] `tests/time-window.test.ts` — Time window helpers
- [x] `tests/trend-detection.test.ts` — `detectTrend`, `buildLatestTrendInsights`, edge cases
- [x] `tests/utils.test.ts` — Utility helpers

### 🔥 High Priority (Planned)

- [ ] **E2E Playwright Suite** (`tests/e2e/`)
  - [ ] Flow 1: Sign Up → verify email → complete onboarding → run first scan → view analysis → view report
  - [ ] Flow 2: Sign In → dashboard metrics visible → navigate to reports → open report detail
  - [ ] Flow 3: Custom problem patterns → verify patterns appear in extraction results
  - [ ] Flow 4: Billing page → select Growth plan → Stripe checkout redirect → confirm plan update
  - [ ] Flow 5: Settings → update preferences → reload page → verify persistence
  - [ ] Flow 6: Scan with plan limit hit → upgrade modal appears → CTA links to billing
  - [ ] Flow 7: Share report → visit public URL unauthenticated → verify content visible
  - [ ] Run Playwright in CI (GitHub Actions) on every PR against a test database
  - [ ] Use `page.waitForSelector` with explicit timeouts, no `page.waitForTimeout` (flake prevention)
  - [ ] Screenshot on failure (stored as GitHub Actions artifacts)
  - [ ] _Acceptance:_ All 7 flows pass on 3 consecutive CI runs without flake

- [ ] **AI Evaluation Framework**
  - [ ] Create `tests/golden-dataset/` folder with 50 handpicked Reddit posts + expected extraction output
  - [ ] JSON schema: `{ postId, subreddit, selftext, expected: { painPoint, sentiment, painIntensity, hasBudgetSignal } }`
  - [ ] Eval script: run `extractPainPoints()` against all 50 posts, compare to expected
  - [ ] Metrics: precision, recall, F1, average `painIntensity` delta
  - [ ] Alert CI if overall F1 drops below 0.70 on the golden dataset
  - [ ] Run eval monthly and log results to `ai_eval_log` table: `date`, `model`, `f1`, `precision`, `recall`
  - [ ] _Acceptance:_ Running `bun run eval:ai` on the golden dataset prints a score report in < 2 minutes

### ⬜ Planned

- [ ] **API Integration Tests** (`tests/api/`)
  - [ ] `POST /api/search` — valid payload · Zod validation errors · duplicate idempotency · plan limit hit
  - [ ] `GET /api/search/status` — valid scraper ID · not found (404) · unauthenticated (401)
  - [ ] `GET /api/search/stream` — SSE event format · auth required · terminal `completed` event fires
  - [ ] `GET /api/reports` — pagination (`cursor`, `limit`) · filter by `status` · auth required
  - [ ] `GET /api/billing/entitlements` — Starter plan limits · Pro plan unlimited · trial expiry edge case
  - [ ] `POST /api/billing/checkout` — valid plan → Stripe session created · invalid plan → 400
  - [ ] All tests use a seeded test database (separate schema) via `drizzle-kit`
  - [ ] _Acceptance:_ All API integration tests pass in < 30s using test database

- [ ] **Dry Run Mode**
  - [ ] New `miningDepth` option: `dry-run` — fetches posts + comments but skips AI extraction entirely
  - [ ] Returns: `{ postsFound, commentsFound, estimatedCredits, estimatedCost }` from a `/api/search/dry-run` endpoint
  - [ ] Show results in the search form before the user commits: "Found 47 posts · estimated cost: 2.3 credits"
  - [ ] `dry-run` uses 0 credits and doesn't create a `scraperRun` record
  - [ ] _Acceptance:_ A dry run completes in < 10s and shows post/comment count without any AI calls

- [ ] **Coverage Gates in CI**
  - [ ] Run `vitest --coverage` in GitHub Actions on every PR
  - [ ] Fail PR if coverage for `lib/` drops below 80% line coverage
  - [ ] Fail PR if any test in `tests/` fails
  - [ ] Upload coverage report to Codecov
  - [ ] Coverage badge in `README.md`

- [ ] **Error Boundary Coverage**
  - [ ] Verify `app/error.tsx` catches all async server component errors
  - [ ] Verify `app/global-error.tsx` catches root layout errors
  - [ ] Add `error.tsx` + `loading.tsx` to: `app/(dashboard)/reports/`, `app/(dashboard)/analysis/`
  - [ ] Log client-side errors to Sentry or Axiom with `sessionId`, `userId`, `route`
  - [ ] _Acceptance:_ Intentionally throwing in a server component shows the error boundary, not a blank page

- [ ] **Error Recovery**
  - [ ] If a `mining-runner.ts` step throws after posting, save partial `painPoint` records instead of rolling back
  - [ ] Add `scraperRun.failedAt` and `scraperRun.failureReason` fields
  - [ ] "Retry Failed Run" button on analysis page — resumes from the last successful step
  - [ ] Auto-retry failed embedding/clustering operations once on the next scan of the same scraper
  - [ ] _Acceptance:_ A failed AI extraction step still saves any pain points that completed before the failure

---

## 🌐 PHASE 7 — Platform Expansion & Multi-Source Intelligence

### ⬜ Planned

- [ ] **Hacker News Scraper** — `http://hn.algolia.com/api/v1/search` → map to `painPoint` schema → `hackernews` source badge
- [ ] **Twitter/X Scraper**
  - [ ] Twitter API v2 `recent_search` endpoint for keyword queries
  - [ ] Map tweets to lightweight `painPoint`: body = tweet text, `upvotes` = likes, `comments` = replies
  - [ ] Detect pain signals in tweet text using the same keyword dictionary from Phase 1
  - [ ] Tag pain points with `source: "twitter"` and show X logo badge in UI
  - [ ] Cross-reference Twitter pain points with Reddit clusters via embedding similarity
  - [ ] _Acceptance:_ Twitter pain points appear in the same report alongside Reddit pain points

- [ ] **Product Hunt Scraper**
  - [ ] PH GraphQL API: query products by `topic` matching the user's niche keyword
  - [ ] Parse: `name`, `tagline`, `votesCount`, `commentsCount`, `launchedAt`
  - [ ] Map PH launches in same niche as discovered opportunities into `competitorIntel`
  - [ ] Show "🚀 Launched on PH" badge on competitor entries with a votesCount
  - [ ] _Acceptance:_ A search for "AI writing" surfaces relevant PH launches in the Competitive Landscape card

- [ ] **Stack Overflow Monitoring**
  - [ ] SO API v2.3: `/questions?tagged=<tag>&sort=votes&filter=withbody`
  - [ ] High-vote questions with no accepted answer = strong developer pain signal
  - [ ] Map to `painPoint` schema: `title` = question title, `body` = question body
  - [ ] Tag with `source: "stackoverflow"` and show SO logo in UI
  - [ ] Cross-reference with Reddit developer subreddits (r/webdev, r/programming)
  - [ ] _Acceptance:_ SO questions with 50+ votes and no accepted answer surface as pain points

- [ ] **Company/Tool Database**
  - [ ] Schema: `tool` table — `id`, `name`, `slug`, `url`, `description`, `category`, `pricingTier`, `foundedYear`
  - [ ] Populate by resolving `triedSolutions` mentions across all pain points
  - [ ] Enrichment: HEAD request → parse `<title>` and `<meta name="description">`
  - [ ] Manual curation layer: admins can edit tool entries via `/dashboard/admin/tools`
  - [ ] Use as lookup table for `competitorIntel` across all reports — no re-fetching the same URL
  - [ ] _Acceptance:_ "Airtable" resolved to its full tool record within 1s on first mention

- [ ] **Subreddit Metadata Cache**
  - [ ] Schema: `subreddit_cache` — `name`, `subscriberCount`, `description`, `activeUsers`, `category`, `cachedAt`
  - [ ] Populate on-demand when a subreddit is first used; refresh if `cachedAt` > 7 days old
  - [ ] Use for subreddit suggestion scoring in the Discovery Engine
  - [ ] Show subscriber count badge on subreddit chips in search form and report UI
  - [ ] _Acceptance:_ Subscriber count for r/SaaS shown in the UI without an extra API call after first use

- [ ] **Historical Trend Database**
  - [ ] Schema: `trend_snapshot` — `keyword`, `subreddit`, `mentionCount`, `week` (ISO week string), `createdAt`
  - [ ] Weekly Inngest cron: for each active scraper, record current mention count into `trend_snapshot`
  - [ ] Power the 6-month trend chart in the report detail page (12 data points)
  - [ ] Enable velocity detection (Phase 2): compare current week vs prior week per snapshot
  - [ ] _Acceptance:_ A keyword with 8 weeks of data shows a correct 6-point sparkline on the dashboard

---

## 📧 PHASE 8 — Communication & Reporting

> **Goal:** Keep users engaged, informed, and converting through high-quality automated email communication and scheduled intelligence reports.

### Email Templates (React Email)

All emails use React Email components, tested locally with `email.dev` preview server, sent via Resend.

- [ ] **Welcome Email**
  - [ ] Rich HTML layout: hero banner, 3 "how it works" steps, "Run your first scan →" CTA
  - [ ] Dynamic: personalize with user's first name
  - [ ] Plain-text fallback for email clients without HTML support
  - [ ] _Acceptance:_ Email renders correctly in Gmail, Apple Mail, and Outlook preview

- [ ] **Report Ready Email**
  - [ ] Subject: "Your investigation is complete — X pain points found"
  - [ ] Body: top 3 pain points by score (title + excerpt), total count, "View Full Report →" CTA
  - [ ] Show the top opportunity's score as a visual bar
  - [ ] _Acceptance:_ Email fires within 60s of `scraperRun.status = completed`

- [ ] **Weekly Digest Email**
  - [ ] Top 3 opportunities that week: title, score, niche
  - [ ] Top trending keyword in user's saved niches
  - [ ] Usage summary: "X scans remaining this month"
  - [ ] _Acceptance:_ Sends every Monday 8am UTC; unsubscribe link works

- [ ] **Trial Expiry Warning Email**
  - [ ] Day 2 of trial: "1 day left — here's what you'll keep access to" + feature comparison table
  - [ ] Day 3 (expiry): "Your trial has ended — upgrade to keep your reports" + upgrade CTA
  - [ ] Day 5 (win-back): "We saved your reports — pick up where you left off" + discount offer
  - [ ] _Acceptance:_ All 3 emails fire at correct intervals without duplicating

- [ ] **Password Reset Email** — branded reset link, 15-min expiry, warning if not requested
- [ ] **Workspace Invitation Email** — "You've been invited to `<workspace>`" with accept button and 48h expiry
- [ ] **Alert Notification Email** — "High-score opportunity detected: `<title>`" with score bar and "View →" CTA

### Scheduled Reports

- [ ] **Daily Digest Report**
  - [ ] Inngest `cron` at 8am per user's local timezone (derive from `user_preferences.timezone`)
  - [ ] Run `isScraperDue()` for each of the user's scrapers — only email if a scraper ran since last digest
  - [ ] Tag reports as `scheduledType: "daily"` in the `report` table
  - [ ] _Acceptance:_ User receives daily digest only on days when at least one scraper ran

- [ ] **Weekly Market Summary**
  - [ ] Top 5 pain points by score across all of user's scans for the past 7 days
  - [ ] Top 3 trending keywords (highest velocity from `trend_snapshot`)
  - [ ] New clusters formed in the past week
  - [ ] Auto-save as a `report` record with `scheduledType: "weekly"`
  - [ ] _Acceptance:_ Weekly summary auto-generates each Sunday and appears in the reports list

- [ ] **Monthly Competitive Landscape Report**
  - [ ] Compare `triedSolutions` mention counts month-over-month using `trend_snapshot`
  - [ ] Surface new tools that appeared for the first time this month
  - [ ] Surface tools whose mention count grew >50% vs last month
  - [ ] _Acceptance:_ Monthly report contains at least one competitor mention change delta

---

## 🔒 PHASE 9 — Security Hardening

> **Goal:** Production-hardened security posture. No critical vulnerabilities shipped. All secrets managed correctly. All user data protected by default.

### ✅ Completed

- [x] **Session Security** — 30-day inactivity expiry · revocation from settings · device tracking
- [x] **CSRF Protection** — origin header validation on all mutation endpoints
- [x] **CSP Headers** — strict policy in `next.config.ts`
- [x] **PII Handling** — Reddit author anonymization + 30-day post-deletion purge
- [x] **SSL at Rest** — PostgreSQL connection uses SSL (`ssl: true`)
- [x] **Rate Limiting** — sliding window counter · `429 + Retry-After` header

### ⬜ Planned

- [ ] **API Key Security** — bcrypt hash before storage · show raw once · IP allowlist · usage audit log
- [ ] **Dependency Audit** — `npm audit --audit-level=critical` in CI · zero-critical policy · `SECURITY.md`
- [ ] **Secret Rotation Procedure**
  - [ ] Document rotation steps for: `DATABASE_URL`, `OPENROUTER_API_KEY`, `STRIPE_SECRET_KEY`, `BETTER_AUTH_SECRET`
  - [ ] Rotate all secrets quarterly
  - [ ] Verify no secrets in git history (`git log -S` scan)
- [ ] **Security Headers Audit**
  - [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] Verify with `securityheaders.com` scan targeting production URL
- [ ] **Penetration Test Checklist**
  - [ ] SQL injection: all queries use Drizzle parameterized statements — verify no raw SQL
  - [ ] XSS: verify all user-generated content rendered via React (auto-escape) never uses `dangerouslySetInnerHTML`
  - [ ] IDOR: verify all resource fetches enforce `workspaceId` scope — no user can access another's reports
  - [ ] Open redirect: verify `/api/auth/callback` only redirects to allow-listed origins

---

## 📅 PHASE 10 — Maintenance & Periodic Audits

> **Goal:** A platform that stays fast, clean, and reliable months after launch through proactive maintenance cadences.

### Database Maintenance

- [ ] **Monthly Log Truncation**
  - [ ] Archive `scraper_run` records older than 60 days to a `scraper_run_archive` table (same schema)
  - [ ] Or hard-delete if archive isn't needed — keep aggregate stats in a `scraper_run_summary` table
  - [ ] Inngest monthly cron scheduled for midnight, first Sunday of each month
  - [ ] _Acceptance:_ `scraper_run` table stays under 100k rows after 6 months of production use

- [ ] **Weekly PGVector REINDEX**
  - [ ] Inngest weekly cron: `REINDEX INDEX CONCURRENTLY pain_point_embedding_hnsw_idx`
  - [ ] Log index size before/after to `db_maintenance_log` table
  - [ ] Alert if index size grows >20% week-over-week
  - [ ] _Acceptance:_ Similarity search latency stays under 50ms after index rebuild

- [ ] **Dead Data Cleanup**
  - [ ] Pain points with no parent `scraperId` (orphaned by hard-delete bugs)
  - [ ] Embeddings in `pain_point_embedding` with no corresponding `pain_point` row
  - [ ] Empty clusters where `sourceCount = 0`
  - [ ] Run as weekly Inngest function, log deleted row counts
  - [ ] _Acceptance:_ Zero orphaned records found after cleanup function runs

- [ ] **Monthly Backup Verification**
  - [ ] Restore latest database backup to an isolated Neon branch
  - [ ] Run smoke test queries: count pain points, verify latest scraper run exists
  - [ ] Document restore time in ops log
  - [ ] _Acceptance:_ Backup restore completes in < 15 minutes with no data loss

### Content & Quality

- [x] **User Feedback Loop**
  - [x] 👍/👎 buttons on each pain point card in report detail
  - [x] Schema: `pain_point_feedback` — `painPointId`, `userId`, `vote` (up/down), `createdAt`
  - [x] Aggregate feedback weekly: pain points with >70% thumbs-down flagged for review
  - [x] Admin dashboard chart: feedback accuracy rate over time (% thumbs-up)
  - [x] Use feedback signal to adjust `painIntensity` weights in Scoring V2
  - [x] _Acceptance:_ Clicking 👍 on a pain point saves feedback and the card shows "Thanks for the feedback!"

- [x] **Reddit User-Agent Rotation**
  - [x] Maintain pool of 5 browser-realistic UA strings in `lib/reddit.ts`
  - [x] Rotate: randomly select UA per request batch; switch to next on 403 error
  - [x] Refresh UA pool monthly with current Chrome/Firefox version strings
  - [x] Log which UA triggered a 403 to `reddit_rate_limit_log`

  - [x] **Monthly AI Model Evaluation**
    - [x] Create `ai_golden_dataset` and `ai_eval_log` schema
    - [x] Implement `scripts/ai-eval.ts` with LLM-as-a-judge (GPT-4o)
    - [x] Run golden dataset against currently deployed model
    - [x] Compare F1 score against the best available model on OpenRouter (Claude 3.5 Sonnet, GPT-4o)
    - [x] Auto-flag for review if a newer model scores 5%+ higher on F1
    - [x] Decision logged in `ai_eval_log` with `switched` boolean and reasoning

- [x] **Monthly Dependency Updates**
  - [x] Run `npm outdated` on the first Monday of each month (Executed manually on 2026-03-27)
  - [x] Update: Drizzle ORM, Next.js, Tailwind CSS, Shadcn components on minor versions
  - [x] Pin major versions; upgrade only with full test run confirmation
  - [x] Open a PR for dependency updates; auto-merge if CI passes

### Monitoring & Alerts

| Alert                   | Threshold                                      | Channel            |
| ----------------------- | ---------------------------------------------- | ------------------ |
| Uptime Monitoring       | External ping every 5 min                      | PagerDuty / email  |
| API Error Rate          | Alert if > 5% in 15-min window                 | Slack #alerts      |
| OpenRouter Spend        | Alert if daily cost > $50                      | Email              |
| DB Connection Pool      | Alert if utilization > 80%                     | Slack #alerts      |
| Reddit API Health       | Real-time success rate dashboard per subreddit | Internal dashboard |
| Disk Space              | Alert if > 80% on any volume                   | PagerDuty          |
| Stripe Webhook Failures | Alert on 3+ consecutive failures               | Slack #billing     |

### Runbooks

- [x] **Runbook: Database Connection Exhaustion** — steps to reset connection pool, identify long-running queries, scale `max` connections — [database-connection-exhaustion.md](file:///c:/Users/gutsc/OneDrive/Desktop/Pain-Point-Miner/docs/runbooks/database-connection-exhaustion.md)
- [x] **Runbook: Reddit API Block** — switch to PullPush fallback, notify users of scan delay via in-app banner, monitor until restored — [reddit-api-block.md](file:///c:/Users/gutsc/OneDrive/Desktop/Pain-Point-Miner/docs/runbooks/reddit-api-block.md)
- [ ] **Runbook: OpenRouter Outage** — fallback to direct OpenAI API if OpenRouter returns 5xx for > 5 minutes; alert users of extended scan times
- [x] **Runbook: High AI Cost Spike** — identify which user/scraper caused spike, invoke per-scan cost cap, notify user — [high-ai-cost-spike.md](file:///c:/Users/gutsc/OneDrive/Desktop/Pain-Point-Miner/docs/runbooks/high-ai-cost-spike.md)

---

## 🏦 Technical Debt Register

> Items that should be cleaned up but aren't blocking. Address during low-priority sprints.

| Item                                                                               | File                     | Priority | Effort |
| ---------------------------------------------------------------------------------- | ------------------------ | -------- | ------ |
| Replace `any` types in `lib/reddit.ts` response parsing                            | `lib/reddit.ts`          | Medium   | Small  |
| Extract SSE event types into shared `types/sse.ts` file                            | `app/api/search/stream/` | Low      | Small  |
| Consolidate duplicate `workspaceId` extraction logic across API routes             | `app/api/**`             | High     | Medium |
| Add Zod validation to all API route inputs (some routes use raw `req.json()`)      | `app/api/**`             | High     | Medium |
| Remove `console.log` statements from production `lib/mining-runner.ts`             | `lib/mining-runner.ts`   | Low      | Small  |
| Migrate from `lib/idempotency.ts` to `lib/reddit-idempotency.ts` (duplicate logic) | `lib/`                   | Medium   | Small  |
| Add `readonly` to all Drizzle query result types                                   | `lib/db/`                | Low      | Medium |
| Replace hardcoded `0.82` clustering threshold with configurable env variable       | `lib/clustering.ts`      | Medium   | Small  |

---

## 📊 Progress Summary

| Phase                        | Status         | Completion | Blocker                         |
| ---------------------------- | -------------- | ---------- | ------------------------------- |
| Phase 1 — Mining Engine      | 🔄 In Progress | ~75%       | Rate limit monitoring           |
| Phase 2 — AI Analysis        | 🔄 In Progress | ~25%       | Multi-model routing             |
| Phase 3 — UI/UX              | 🔄 In Progress | ~35%       | Theme toggle, empty states      |
| Phase 4 — Infrastructure     | 🔄 In Progress | ~45%       | RBAC workspaces                 |
| Phase 5 — Revenue & Growth   | 🔄 In Progress | ~55%       | Overage packs, viral sharing    |
| Phase 6 — Testing & QA       | 🔄 In Progress | ~65%       | E2E Playwright suite            |
| Phase 7 — Platform Expansion | ⬜ Planned     | 0%         | Depends on P1 stable            |
| Phase 8 — Communication      | ⬜ Planned     | 0%         | Depends on email provider setup |
| Phase 9 — Security           | 🔄 In Progress | ~70%       | API key hashing                 |
| Phase 10 — Maintenance       | ⬜ Planned     | 0%         | Depends on Inngest              |

**Total open tasks (rough estimate):** ~180 items across all phases
