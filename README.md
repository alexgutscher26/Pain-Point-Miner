# RPP — Reddit Pain-Point Miner

<div align="center">

![RPP Banner](https://raw.githubusercontent.com/alexgutscher26/Pain-Point-Miner/master/public/rpp.png)

**An AI-powered market intelligence engine that mines Reddit conversations to uncover validated, high-conviction SaaS opportunities.**

[![CI Status](https://github.com/alexgutscher26/Pain-Point-Miner/actions/workflows/ci.yml/badge.svg)](https://github.com/alexgutscher26/Pain-Point-Miner/actions)
[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![PGVector](https://img.shields.io/badge/PGVector-1536_Dimensions-336791?logo=postgresql)](https://github.com/pgvector/pgvector)
[![Tested with Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest)](https://vitest.dev/)
[![Runtime: Bun](https://img.shields.io/badge/Runtime-Bun-f472b6?logo=bun)](https://bun.sh/)

[Features](#-key-features) • [Architecture](#-architecture) • [Quickstart](#-getting-started) • [Environment Setup](#-environment-variables) • [Database Setup](#-database--migrations) • [Scripts](#-scripts-reference) • [Security](#-security--compliance)

</div>

---

## 💡 Overview

Building software without validated demand is risky. **RPP (Reddit Pain-Point Miner)** eliminates the guesswork by actively monitoring target niche subreddits, analyzing authentic discussions, and extracting structured problem signals using state-of-the-art LLMs.

Every extracted pain point is embedded into a high-dimensional vector space, clustered by semantic similarity, scored across monetization and urgency metrics, and surfaced through a real-time analytics dashboard.

---

## 🚀 Key Features

- 🔍 **Deep Multi-Subreddit Mining**: Target multiple communities simultaneously with automated post and comment hierarchy extraction.
- 🧠 **AI-Powered Semantic Extraction**: Leverages OpenRouter (Gemini 2.0 Flash / GPT-4o) to extract pain intensity, urgency, monetization potential, market maturity, and existing alternative solutions.
- 📐 **Vector Embeddings & Semantic Clustering**: Generates 1536-dimensional embeddings (`text-embedding-3-small`) with PGVector cosine distance indexing to automatically cluster recurring market complaints.
- ⚡ **Real-Time Live SSE Streaming**: Live progress updates via Server-Sent Events (`/api/search/stream`) with automatic polling fallback.
- 📊 **Opportunity Scoring Algorithm**: Multi-factor weighted formula factoring pain severity, urgency, monetization willingness, market saturation, and community engagement.
- 📈 **Trend Detection & Momentum**: Tracks historical keyword frequency and identifies rising vs. fading opportunities over time.
- ⏱️ **Automated Scheduled Scans**: Built-in cron / Inngest integration for automated background monitoring with quota enforcement.
- 💳 **Stripe Subscription & Credit Gating**: Tiered billing plans (Starter, Growth, Pro) with usage-based quota tracking and webhook synchronization.
- 📬 **Email Digests & Notifications**: Automated weekly digest reports and transaction emails powered by Loops and React Email.
- 🛡️ **Enterprise-Grade Security**: Better Auth session management, strict Zod schema validation, Drizzle parameterized queries, and 24-hour AI deduplication caching.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        UI["Next.js 16 Web Application"]
        SSE["SSE Stream Hook (useMiningStream)"]
        Dash["Interactive Analytics Dashboard (Recharts)"]
    end

    subgraph API ["Next.js App Router API"]
        SearchAPI["POST /api/search"]
        StreamAPI["GET /api/search/stream"]
        CronAPI["POST /api/search/scheduled"]
        AuthAPI["Better Auth Handler (/api/auth)"]
    end

    subgraph Pipeline ["Mining & Intelligence Pipeline"]
        Scraper["Reddit Scraper (OAuth + PullPush Fallback)"]
        Dedup["24h Idempotency Cache Guard"]
        AI["LLM Extraction Engine (OpenRouter)"]
        Embedder["Vector Embeddings (1536-dim)"]
        Cluster["Semantic Clustering Engine (Cosine Similarity)"]
    end

    subgraph Storage ["Data & External Services"]
        DB[("Neon PostgreSQL + PGVector")]
        OpenRouter["OpenRouter API"]
        Reddit["Reddit API"]
        Stripe["Stripe Payments"]
        Loops["Loops Email Engine"]
    end

    UI -->|Start Scan| SearchAPI
    SSE -->|Live Updates| StreamAPI
    SearchAPI --> Scraper
    CronAPI --> Scraper
    Scraper --> Reddit
    Scraper --> Dedup
    Dedup --> AI
    AI --> OpenRouter
    AI --> Embedder
    Embedder --> Cluster
    Cluster --> DB
    Dash --> DB
    AuthAPI --> DB
    UI --> Stripe
    CronAPI --> Loops
```

---

## 🛠️ Tech Stack

| Domain                        | Technology                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**                 | [Next.js 16 (App Router)](https://nextjs.org/)                                                                                                          |
| **Runtime & Package Manager** | [Bun](https://bun.sh/) (or Node.js 20+)                                                                                                                 |
| **UI & Styling**              | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/) |
| **Database & Vector Search**  | [Neon Serverless PostgreSQL](https://neon.tech/) + [PGVector](https://github.com/pgvector/pgvector) + [Drizzle ORM](https://orm.drizzle.team/)          |
| **AI & Embeddings**           | [OpenRouter](https://openrouter.ai/) (`gemini-2.0-flash`, `gpt-4o`, `text-embedding-3-small`)                                                           |
| **Authentication**            | [Better Auth](https://better-auth.com/) (Email/Password, OAuth, Workspaces)                                                                             |
| **Payments & Billing**        | [Stripe](https://stripe.com/) (Subscription Management & Webhooks)                                                                                      |
| **Background Jobs & Email**   | [Inngest](https://www.inngest.com/), [Loops](https://loops.so/), [React Email](https://react.email/)                                                    |
| **Data Visualization**        | [Recharts](https://recharts.org/)                                                                                                                       |
| **Testing & Quality**         | [Vitest](https://vitest.dev/), [ESLint 9](https://eslint.org/), [Prettier](https://prettier.io/)                                                        |

---

## 📁 Project Structure

```
.
├── app/
│   ├── (auth)/                # Authentication views (sign-in, sign-up)
│   ├── (dashboard)/           # Dashboard, investigation explorer, clusters, reports, billing
│   ├── api/
│   │   ├── auth/              # Better Auth endpoint
│   │   ├── search/            # Mining execution, SSE stream, scheduled scans
│   │   ├── reports/           # Saved opportunity reports CRUD
│   │   ├── billing/           # Stripe checkout, portal, and webhook handlers
│   │   ├── cron/              # Automated maintenance crons
│   │   └── inngest/           # Inngest background event handlers
│   ├── layout.tsx             # Root application shell & providers
│   └── page.tsx               # High-converting landing page
├── components/
│   ├── dashboard/             # Metric cards, opportunity matrices, pain point tables
│   ├── landing/               # Hero, feature showcases, interactive demo, pricing tables
│   └── ui/                  # Accessible Shadcn/Radix UI components
├── emails/                    # React Email templates (digests, notifications)
├── hooks/                     # Custom React hooks (useMiningStream, useDebounce, etc.)
├── lib/
│   ├── ai.ts                  # AI extraction engine with structured OpenRouter prompts
│   ├── clustering.ts          # PGVector cluster assignment & centroid calculations
│   ├── dashboard-metrics.ts   # Opportunity score computation & market badge algorithms
│   ├── embeddings.ts          # 1536-dim vector embedding generator & semantic similarity
│   ├── mining-runner.ts       # Orchestrator for Reddit search, extraction, and clustering
│   ├── plan-gating.ts         # Plan limits, scan depth access, and usage quota enforcement
│   ├── plan-resolver.ts       # Subscription tier resolver (Starter, Growth, Pro)
│   ├── reddit.ts              # Resilient Reddit API client with OAuth & exponential backoff
│   ├── reddit-idempotency.ts  # 24h AI deduplication caching layer
│   ├── trend-detection.ts     # Historical keyword velocity and momentum tracking
│   └── db/
│       ├── index.ts           # Neon / Postgres connection pool instance
│       ├── schema.ts          # Complete Drizzle database schema definitions
│       └── relations.ts       # Relational mapping definitions
└── test/                      # Comprehensive Vitest test suite
```

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed and configured:

- **[Bun](https://bun.sh/)** (v1.1+ recommended) or **Node.js** (v20+)
- **PostgreSQL Database** with `pgvector` enabled (e.g. [Neon](https://neon.tech))
- **OpenRouter API Key** for LLM extraction and vector embeddings
- **Reddit API App Credentials** (Script/App Client ID & Secret from [Reddit Apps](https://www.reddit.com/prefs/apps))

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/alexgutscher26/Pain-Point-Miner.git
cd Pain-Point-Miner

# Install dependencies via Bun
bun install
```

### 2. Configure Environment Variables

Create a `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```env
# Database (PostgreSQL with pgvector)
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-32-byte-random-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

# OpenRouter AI
OPENROUTER_API_KEY="sk-or-v1-..."

# Reddit API
REDDIT_CLIENT_ID="your_reddit_client_id"
REDDIT_CLIENT_SECRET="your_reddit_client_secret"
REDDIT_USER_AGENT="RPPScanner/1.0 (by /u/your_reddit_user)"

# Stripe (Billing & Subscriptions)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Loops)
LOOPS_API_KEY="loops_api_key_..."

# Automation & Cron
CRON_SECRET="your-random-cron-secret-key"
```

### 3. Database & Migrations

Push the Drizzle schema to your PostgreSQL database:

```bash
# Push schema directly
bun run db:push

# Or generate and run migrations
bun run db:generate
bun run db:migrate
```

To inspect your database visually in Drizzle Studio:

```bash
bun run db:studio
```

### 4. Start Development Server

```bash
bun dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Scripts Reference

| Command                | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `bun dev`              | Launch Next.js development server with hot reload     |
| `bun run build`        | Compile optimized production build                    |
| `bun run start`        | Launch Next.js production server                      |
| `bun test`             | Execute full Vitest test suite                        |
| `bun run lint`         | Run ESLint 9 static code analysis                     |
| `bun run format`       | Format entire codebase using Prettier                 |
| `bun run format:check` | Verify formatting consistency without modifying files |
| `bun run ai:eval`      | Run AI extraction evaluation benchmarking script      |
| `bun run email`        | Launch local React Email preview server               |
| `bun run db:push`      | Synchronize Drizzle schema directly with database     |
| `bun run db:migrate`   | Execute pending database migration files              |
| `bun run db:studio`    | Launch Drizzle Studio database visualizer             |

---

## 🧠 Scoring & Clustering Details

### Opportunity Score Formula

Opportunities are calculated in `lib/dashboard-metrics.ts` based on four weighted dimensions:

1. **Base Severity & Demand (60%)**:
   - Pain Intensity ($35\%$)
   - Urgency Score ($25\%$)
   - Willingness to Pay / Monetization ($30\%$)
   - Workaround Complexity ($10\%$)
2. **Market Saturation & Maturity**:
   - _Blue Ocean_ (no mature dominant tool found): **+10 point bonus**
   - _Red Ocean Disruption_ (established competitors with high dissatisfaction): **+8 point bonus**
3. **Sentiment Multiplier**:
   - `desperate` ($\times 1.10$), `angry` ($\times 1.15$), `frustrated` ($\times 1.05$)
4. **Validation Signal Strength**:
   - Log-normalized Reddit engagement ($40\%$ upvotes, $35\%$ comment depth, $25\%$ keyword occurrences)

---

## 🔒 Security & Compliance

RPP is architected with strict security controls:

- **Parameterized Database Access**: Zero raw SQL strings; all database operations use Drizzle ORM query builders.
- **Strict Tenant Isolation**: Multi-tenant workspace scoping enforced at the query level.
- **Timing-Safe Webhook Signatures**: Stripe webhooks and Cron triggers enforce timing-safe signature verification.
- **Prompt Injection Boundaries**: Scraped data is encapsulated in explicit boundary delimiters before being processed by OpenRouter.

For complete details on our threat model, vulnerability reporting guidelines, and response SLAs, please see [SECURITY.md](file:///c:/Users/gutsc/OneDrive/Desktop/Pain-Point-Miner/SECURITY.md).

---

## 📄 License

Proprietary. All rights reserved &copy; Alex Gutscher.
