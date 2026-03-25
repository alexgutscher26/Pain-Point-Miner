# RPP — Reddit Pain-Point Miner

An AI-powered market research engine that mines Reddit conversations to uncover validated SaaS opportunities. It finds posts discussing real problems, extracts semantic pain points with AI, clusters them into market opportunities, and scores them by monetization potential.

## What It Does

1. **Search** — Enter a keyword or niche (e.g. "cold email", "property management") and target subreddits.
2. **Mine** — The engine fetches posts and comments in parallel, filtering for problem-signal patterns.
3. **Extract** — AI (via OpenRouter) analyzes each post to extract pain intensity, urgency, monetization score, market maturity, sentiment, budget signals, and tried solutions.
4. **Embed & Cluster** — Every pain point gets a vector embedding (1536-dim). Similar pain points are automatically grouped into clusters using PGVector cosine similarity.
5. **Score & Report** — Opportunities are scored with a weighted formula and surfaced on a real-time dashboard with trend detection.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, Shadcn UI, Radix primitives
- **Database**: PostgreSQL (Neon) + Drizzle ORM + PGVector
- **AI**: OpenRouter (Gemini 2.0 Flash, GPT-4o) for extraction; `text-embedding-3-small` for embeddings
- **Auth**: Better Auth (email/password, OAuth)
- **Payments**: Stripe (subscription billing, usage-based credits)
- **Charts**: Recharts
- **Testing**: Vitest
- **Linting**: ESLint 9, Prettier

## Project Structure

```
app/
  (auth)/              # Sign-in / sign-up pages
  (dashboard)/         # Dashboard, search, analysis, reports, settings, billing
  api/
    auth/              # Better Auth handler
    search/            # Mining API: start scan, status polling, SSE stream
    reports/           # Report CRUD
    billing/           # Stripe entitlements
    settings/          # User preferences
components/
  dashboard/           # Dashboard-specific components
  landing/             # Marketing landing page sections
  ui/                  # Shadcn UI primitives
hooks/
  use-mining-stream.ts # SSE hook for real-time mining progress
lib/
  ai.ts               # AI pain point extraction via OpenRouter
  embeddings.ts        # Vector embedding generation + semantic search (PGVector)
  clustering.ts        # Auto-clustering pain points by similarity
  mining-runner.ts     # Full mining pipeline orchestrator
  reddit.ts            # Reddit API client (OAuth + PullPush fallback)
  reddit-idempotency.ts# 24h dedup guard for AI processing
  plan-gating.ts       # Billing plan entitlements + usage tracking
  plan-resolver.ts     # Resolve user's active plan from subscriptions
  dashboard-metrics.ts # Opportunity scoring + market badges
  trend-detection.ts   # Trend direction detection for keywords
  scheduler.ts         # Frequency-based scraper scheduling
  run-status.ts        # Mining run phase normalization
  auth.ts / auth-client.ts # Better Auth server + client config
  seo.ts               # SEO metadata defaults
  db/
    schema.ts          # Drizzle schema (all tables)
    relations.ts       # Drizzle relation definitions
    index.ts           # Database client
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database with PGVector extension (Neon recommended)
- OpenRouter API key
- Reddit API credentials (client ID + secret)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable               | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string (must have PGVector enabled) |
| `BETTER_AUTH_SECRET`   | Random secret for session signing                         |
| `BETTER_AUTH_URL`      | App URL (e.g. `http://localhost:3000`)                    |
| `OPENROUTER_API_KEY`   | OpenRouter API key for AI extraction + embeddings         |
| `REDDIT_CLIENT_ID`     | Reddit app client ID for OAuth API access                 |
| `REDDIT_CLIENT_SECRET` | Reddit app client secret                                  |

Optional variables:

| Variable                | Default          | Description                              |
| ----------------------- | ---------------- | ---------------------------------------- |
| `REDDIT_USER_AGENT`     | `RPPScanner/1.0` | Custom Reddit user-agent                 |
| `DEFAULT_BILLING_PLAN`  | `starter`        | Default plan for new users               |
| `STRIPE_SECRET_KEY`     | —                | Stripe secret key for billing            |
| `STRIPE_WEBHOOK_SECRET` | —                | Stripe webhook signing secret            |
| `CRON_SECRET`           | —                | Shared secret for scheduled scan trigger |

### 3. Set up the database

Generate and run migrations:

```bash
npx drizzle-kit push
```

Or if you prefer migration files:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description               |
| --------------- | ------------------------- |
| `npm run dev`   | Start development server  |
| `npm run build` | Production build          |
| `npm run start` | Start production server   |
| `npm run lint`  | Run ESLint                |
| `npm run test`  | Run Vitest test suite     |
| `npm run write` | Format code with Prettier |

## Architecture

### Mining Pipeline

When a user starts a scan, the pipeline executes:

```
Search API (POST /api/search)
  └─> Create scraper record
  └─> executeMiningRun() [fire-and-forget]
        ├─ Phase: SCANNING
        │    └─ Fetch posts from all subreddits (parallel via Promise.allSettled)
        │    └─ Deduplicate + filter by time window
        ├─ Phase: EXTRACTING
        │    └─ Fetch comments for top posts (parallel via Promise.allSettled)
        │    └─ AI extraction per post (OpenRouter)
        │    └─ Insert pain points + comments into DB
        │    └─ Embed + cluster each pain point (fire-and-forget)
        ├─ Phase: CLUSTERING
        │    └─ Mark run as clustering while background embeds finish
        └─ Phase: COMPLETED
             └─ Finalize scraperRun record
```

### Real-Time Progress (SSE)

The analysis page streams live progress via Server-Sent Events:

- **Endpoint**: `GET /api/search/stream?id=<scraperId>`
- **Client hook**: `useMiningStream(scraperId)` — auto-falls back to polling if SSE fails.
- **Phases**: `scanning` → `extracting` → `clustering` → `completed`
- **Messages**: Contextual status like "Scanning r/SaaS and 2 more...", "Extracted 4 opportunities. Clustering insights..."

### Embedding & Clustering

- Every pain point is embedded via OpenRouter (`text-embedding-3-small`, 1536 dimensions).
- Embeddings are stored in the `pain_point_embedding` table using PGVector's `vector(1536)` type.
- `findSimilarPainPoints()` runs cosine-distance queries (`<=>` operator) for semantic search.
- The clustering worker finds the nearest existing cluster centroid (threshold: 0.82 similarity). If no match, it creates a new `painPointCluster`.

### Billing & Plan Gating

Three tiers managed by `lib/plan-gating.ts`:

- **Starter**: 10 scans/month, 3 subreddits, basic depth only.
- **Growth**: 50 scans/month, 10 subreddits, basic + advanced depth, saved reports.
- **Pro**: Unlimited scans, unlimited subreddits, all depths, trend detection.

Plans are resolved from Stripe subscriptions via `resolvePlanForIdentity()` with support for env-based overrides and trial periods.

### Scoring

Opportunity scores are computed in `lib/dashboard-metrics.ts`:

- **Pain Intensity** (35%) + **Urgency** (25%) + **Monetization** (30%) weighted base.
- **Market maturity bonus**: Blue Ocean (low maturity) gets +10, Red Ocean disruption gets +8.
- **Sentiment modifier**: `desperate` ×1.1, `angry` ×1.15, `frustrated` ×1.05.
- **Validation signal**: log-normalized upvotes (40%) + comments (35%) + mentions (25%).

## Scheduled Reddit Scans

Recurring scans run via `POST /api/search/scheduled`, triggered by a cron job.

### Scheduler env vars

| Variable                            | Default | Description                         |
| ----------------------------------- | ------- | ----------------------------------- |
| `CRON_SECRET`                       | —       | Required. Shared secret for auth.   |
| `SCHEDULED_BATCH_LIMIT`             | `5`     | Scrapers processed per trigger      |
| `SCHEDULED_MAX_POSTS_PER_SUBREDDIT` | `180`   | Post cap per subreddit per run      |
| `SCHEDULED_MAX_SUBREDDITS`          | `10`    | Subreddit count cap per run         |
| `SCHEDULED_PROCESSING_LIMIT`        | `8`     | Posts sent to AI extraction per run |

### GitHub Actions

Workflow: `.github/workflows/scheduled-reddit-scan.yml`

Required repository secrets:

- `APP_BASE_URL` — Deployed app URL (e.g. `https://your-app.vercel.app`)
- `CRON_SECRET` — Same value as the server env var

## Deployment

Optimized for [Vercel](https://vercel.com):

1. Connect your GitHub repo to Vercel.
2. Set all environment variables in the Vercel dashboard.
3. Ensure your Neon database has PGVector enabled (`CREATE EXTENSION IF NOT EXISTS vector;`).
4. Deploy. The app handles migrations via `drizzle-kit push` during setup.

## License

Private. All rights reserved.
