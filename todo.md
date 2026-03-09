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
- **reddit Collection**: Native Fetch API with Reddit Oauth (high-concurrency).

### **Pain Point Scoring Formula (v1)**

$$Score = (\text{mentions} \times 1.0) + (\text{avg\_comments} \times 0.5) + (\text{avg\_upvotes} \times 0.2)$$

- **Mentions**: Number of unique Reddit threads discussing the same core problem.
- **Comments**: Signal of community discussion and validation.
- **Upvotes**: Signal of agreement and broader interest.

---

## 🏗️ 2. PHASE 1: Core Intelligence & Scraping (The "Mining" Engine)

### **High Priority Implementation**

- [ ] **Parallelized Scraping Engine**: Refactor `mining-runner.ts` to fetch comments for multiple posts concurrently using `Promise.allSettled`.
- [ ] **Semantic Embedding Pipeline**:
  - [ ] Auto-generate vector embeddings for every new `painPoint` using OpenAI/OpenRouter embeddings.
  - [ ] Implement a clustering worker to group similar pain points into a `painPointCluster` automatically.
  - [ ] Update `findSimilarPainPoints` logic to use semantic search (PGVector) instead of simple keyword matching.
- [ ] **Mission Control UI**: Real-time scan progress via Server-Sent Events (SSE). Show live status: "Scanning r/SaaS...", "Extracted 4 opportunities...".

### **Data & Scraper Logic**

- [ ] **Problem Pattern Filtering**: Integrate the "Problem Keyword" filter (e.g., "struggling", "frustrating", "hate", "pain").
- [ ] **Temporal Filtering**: Support last 24h, 7d, and 30d windows.
- [ ] **Idempotency Guard**: Ensure we never bill/call AI twice for the same Reddit ID within a 24h window.

---

## 🧠 3. PHASE 2: AI Analysis & Deep Opportunity Scoring

### **Intelligence Refinement**

- [ ] **Multi-Model Support**: Implement model switching in `ai.ts` (Gemini for fast scans, Sonnet 3.5 for deep market analysis).
- [ ] **Scoring Algorithm V2 (Weighted)**:
  - [ ] Weighted formula for `opportunity.score` using `painIntensity` (40%), `monetizationScore` (30%), `urgency` (20%), and `marketMaturity` (10%).
- [ ] **The "Desperate User" Index**: Extract specific quotes where users mention "I would pay $X for this" or "budget".

### **Advanced Extraction Logic**

- [ ] **MVP Action Plan**: AI-generated technical spec (Tech stack, core features, architecture) for top opportunities.
- [ ] **Estimated Build Difficulty**: Use AI to estimate if it's a "Weekend Project" vs "VC-Scale Moat".
- [ ] **Competitor Intel Engine**: Search for existing tools mentioned in `triedSolutions` to populate `competitorIntel`.

---

## 🎨 4. PHASE 3: UI/UX & "Kinetic Intelligence" Design

### **Design System & Dashboard**

- [ ] **Global Dashboard Refine**: Apply high-contrast signals, sharp geometry, and mono-typography accents.
- [ ] **Opportunity Radar Charts**: A Pentagonal radar chart showing (Pain, Urgency, Monetization, Maturity, Complexity).
- [ ] **Subreddit Heatmap**: Visualization of which communities have the most unsolved problems.
- [ ] **Command Palette (Cmd+K)**: Quick navigation and action execution: `/scan`, `/report`, `/settings`.

### **User Experience Micro-interactions**

- [ ] **Spotlight Interaction**: Subtle spotlight-hover effects for "High Opportunity" cards.
- [ ] **Glassmorphism Overlays**: Ultra-premium blurred layers for the detail view panels.
- [ ] **Mobile-First Insight Feed**: Vertical-scroll bite-sized market insights.

---

## 🔐 5. PHASE 4: Infrastructure, Security & Multi-Tenancy

### **Enterprise Readiness**

- [ ] **RBAC & Workspaces**: Support for `Owner`, `Analyst`, and `Viewer` roles within a workspace.
- [ ] **Durable Execution**: Integrate **Inngest** for long-running mining tasks (auto-resume on failure).
- [ ] **Notification System**: Threshold Alerts: "Alert me if an opportunity with Scored > 8.5 is found".
- [ ] **API Access (Early Preview)**: UI for managing `apiKey` records and public developer docs.

### **Reliability & Maintenance**

- [ ] **Soft Delete Implementation**: Robust `deletedAt` handling for "Trash/Undo" functionality.
- [ ] **Predictive Scaling**: Monitor Reddit API throughput and auto-scale background clusters.
- [ ] **Observability**: Track "Time to Insight" and Reddit API error rates (403/429).

---

## 💰 6. PHASE 5: Revenue, Growth & Growth Hacking

### **Monetization Strategy**

- [ ] **Stripe Usage Billing**: Connect 1 "Advanced Scan" to a credit-based consumption model.

### **Growth Engine**

- [x] **Social Proof & FOMO**: Implement a "⭐ Most Popular" badge for top-performing niches/plans on the landing page to drive conversion.
- [ ] **Viral Report Engine**: Public "Shareable URL" for reports with SEO-optimized meta tags.
- [ ] **Programmatic SEO**: Auto-generate landing pages for niches (e.g., `rpp.ai/opportunities/saas-monitoring`).
- [ ] **Referral Loop**: "Invite a friend, get 10 Deep Mines for free".

---

## 🧪 7. PHASE 6: Quality, QA & Evaluation

- [ ] **E2E Playwright Suite**: Full funnel testing: `Sign Up -> New Scan -> View Report`.
- [ ] **AI Evaluation Framework**: Create a manual "Golden Dataset" to benchmark extraction accuracy.
- [ ] **Performance Audit**: Optimize for < 1.0s LCP on the Dashboard.
- [ ] **Dry Run Mode**: Scraper simulation to see post matches without AI cost.

---

## 📅 Maintenance & Periodic Audits

- [ ] **Monthly Log Truncation**: Archive `scraper_run` logs every 60 days.
- [ ] **Vector Index Rebuild**: Weekly `REINDEX` for PGVector performance.
- [ ] **User Feedback Loop**: "Was this insight accurate?" button to train scoring weights.
- [ ] **Reddit User Agent Update**: Rotate headers monthly.
