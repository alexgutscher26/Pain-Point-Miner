# Security Policy & Architecture

This document outlines the security policies, threat model, defense-in-depth architecture, and responsible disclosure practices for **RPP (Reddit Pain-Point Miner)**.

---

## 1. Supported Versions

Only the latest release on the `master`/`main` branch receives active security updates and vulnerability patches.

| Version | Supported          | Severity SLA (Patch Release) |
| ------- | ------------------ | ---------------------------- |
| Latest  | :white_check_mark: | Critical: 72h / High: 7 days |
| Older   | :x:                | None                         |

---

## 2. Reporting a Vulnerability & Responsible Disclosure

If you discover a security vulnerability, please **do not open a public issue or discussion**.

### Reporting Channels

- **Email**: Send detailed findings to **`security@rpp.dev`**.
- **PGP Encryption**: For highly sensitive reports, encrypt your message using our security team PGP key (available upon request).
- **Security.txt**: Standard disclosure metadata is hosted at `/.well-known/security.txt`.

### What to Include

1. **Summary & Impact**: Clear description of the vulnerability and attack scenario.
2. **Steps to Reproduce / PoC**: Minimal, reproducible proof-of-concept steps or payload.
3. **Target Component**: Affected route, database query, background worker, or authentication handler.
4. **Suggested Remediation**: Optional patch recommendation or configuration fix.

### Response Timelines & SLAs

| Severity Level                                                    | Initial Acknowledgment | Remediation Target | Status Updates |
| ----------------------------------------------------------------- | ---------------------- | ------------------ | -------------- |
| **Critical (P0)** (RCE, Auth Bypass, Data Exfiltration)           | < 24 hours             | < 72 hours         | Every 24 hours |
| **High (P1)** (Privilege Escalation, IDOR, SSRF)                  | < 48 hours             | < 7 days           | Every 48 hours |
| **Medium (P2)** (Rate limit bypass, CSRF on low-risk actions)     | < 5 business days      | < 30 days          | Weekly         |
| **Low (P3)** (Information disclosure without direct exploitation) | < 7 business days      | Next release cycle | As needed      |

### Safe Harbor Guarantee

We consider security research conducted under this policy to be authorized. We will not pursue legal action or report researchers to law enforcement provided you:

- Make a good-faith effort to avoid privacy violations, data destruction, and service disruption.
- Do not access, modify, or exfiltrate customer data beyond the minimum necessary for PoC validation.
- Provide reasonable time for remediation before any public disclosure.
- Comply with all applicable responsible disclosure norms.

---

## 3. Defense-in-Depth Security Architecture

```
                                  ┌────────────────────────┐
                                  │   Client / Browser     │
                                  └───────────┬────────────┘
                                              │ HTTPS / TLS 1.3
                                              ▼
                        ┌─────────────────────────────────────────────┐
                        │ Next.js Edge / API Gateway (App Router)     │
                        │ - Security Headers (HSTS, CSP, X-Frame)     │
                        │ - Zod Input Validation & Sanitization       │
                        │ - Correlation IDs (x-correlation-id)        │
                        └──────────────┬──────────────┬───────────────┘
                                       │              │
                   ┌───────────────────┘              └──────────────────┐
                   ▼                                                     ▼
    ┌──────────────────────────────┐                      ┌──────────────────────────────┐
    │ Better Auth & Session Guard  │                      │ Webhook & Cron Auth Guard    │
    │ - Cryptographic Session JWTs │                      │ - Stripe HMAC SHA-256 Verif. │
    │ - HttpOnly, Secure, SameSite │                      │ - Timing-Safe CRON_SECRET    │
    │ - Workspace Scope Isolation  │                      │ - Inngest Signing Signature  │
    └──────────────┬───────────────┘                      └──────────────┬───────────────┘
                   │                                                     │
                   ▼                                                     ▼
    ┌────────────────────────────────────────────────────────────────────────────────────┐
    │ Application Layer & Execution Engine                                               │
    │ - Plan-Based Entitlements (plan-gating.ts) & Usage Quota Enforcement               │
    │ - AI Prompt Boundary Isolation & Extraction Sanitization (OpenRouter)              │
    │ - Reddit OAuth Token Lifecycle & Rate-Limiting Backoff Engine                      │
    │ - 24-Hour AI Idempotency Cache Guard (reddit-idempotency.ts)                       │
    └────────────────────────────────────────┬───────────────────────────────────────────┘
                                             │ Parameterized Queries (SSL Required)
                                             ▼
                        ┌─────────────────────────────────────────────┐
                        │ PostgreSQL + PGVector (Neon Cloud)          │
                        │ - Strict Workspace ID & User ID Tenancy     │
                        │ - 1536-dim Vector Cosine Isolation          │
                        │ - Zero Raw SQL / Drizzle ORM Parameterized  │
                        └─────────────────────────────────────────────┘
```

---

## 4. Security Controls by Domain

### 4.1 Authentication & Session Management

- **Framework**: Powered by [Better Auth](https://better-auth.com) with secure password hashing (Argon2id/Bcrypt) and OAuth 2.0 PKCE providers.
- **Session Tokens**: Cryptographically signed, high-entropy server-side session tokens stored in the `session` table.
- **Cookie Security**:
  - `HttpOnly: true` — Prevents JavaScript/XSS session extraction.
  - `Secure: true` — Enforced over HTTPS in production.
  - `SameSite: Lax` — Protects cross-site request context.
- **Session Validation**: Server-side verification via `auth.api.getSession({ headers })` on every API route invocation.

### 4.2 Multi-Tenancy & Authorization Boundaries

- **Workspace Isolation**: Database queries enforce tenant boundaries via `workspaceScope()` filtering. Resources cannot be accessed or mutated across workspaces without valid ownership.
- **Plan Gating**: Mining depth, subreddit limits, search concurrency, and monthly scan quotas are validated before pipeline execution in `lib/plan-gating.ts`.
- **RBAC & Impersonation Protection**: Administrative operations and billing modifications require verified session identities matching Stripe subscription customer IDs.

### 4.3 API Security & Input Sanitization

- **Strict Schema Validation**: All incoming requests are validated against strict [Zod](https://zod.dev) schemas before handler execution. Invalid payloads return HTTP `400 VALIDATION_ERROR` without parsing deeper logic.
- **SQL Injection Prevention**: Built entirely on [Drizzle ORM](https://orm.drizzle.team) with parameterized query builders. Raw SQL concatenation is forbidden.
- **Safe Error Responses**: Structured error handler `apiError()` strips stack traces, internal paths, and database error strings from client-facing responses in production.
- **Request Tracing**: Every inbound and outbound operation attaches an `x-correlation-id` header for end-to-end auditability.

### 4.4 AI & LLM Security

- **Prompt Injection Defense**: Raw user inputs and scraped Reddit post bodies are isolated within designated delimiter boundaries (`<post_content>...</post_content>`) in LLM prompts.
- **Model Output Validation**: Structured outputs from OpenRouter (Gemini, GPT models) are validated against strict Zod parsing schemas before database ingestion.
- **Idempotency & Cost Defense**: `lib/reddit-idempotency.ts` prevents redundant LLM token expenditures on identical Reddit posts within 24 hours.

### 4.5 Third-Party Integrations & Webhook Verification

- **Stripe Webhooks**: Incoming Stripe webhooks (`POST /api/billing/webhook`) verify `Stripe-Signature` headers using HMAC-SHA256 with timing-safe comparison via `stripe.webhooks.constructEvent()`.
- **Scheduled Scans & Crons**: Scheduled scan triggers enforce Bearer token verification against `CRON_SECRET` using timing-safe buffer comparisons to prevent timing attacks.
- **Reddit API OAuth**: Client credentials and user-agent strings are strictly loaded from environment variables. Access tokens are stored in-memory with automatic TTL expiration and refresh cycles.
- **External Communications**: OpenRouter, Loops, and Reddit communications occur exclusively over TLS 1.3 / HTTPS.

### 4.6 Secrets Management & Environment Security

- **Zero Plaintext Secrets in Version Control**: All API keys (`OPENROUTER_API_KEY`, `STRIPE_SECRET_KEY`, `BETTER_AUTH_SECRET`, `LOOPS_API_KEY`) are managed through environment variables.
- **Local Isolation**: `.env.local` and environment artifacts are excluded via `.gitignore`.
- **Database Transport**: PostgreSQL connections require SSL (`sslmode=require`) through Neon's connection pooler.

---

## 5. Security Checklist for Developers

When contributing to RPP, ensure all changes adhere to:

- [ ] **Auth Check**: Is `auth.api.getSession()` called before any privileged data access?
- [ ] **Tenant Scope**: Does every DB query include `eq(table.userId, session.user.id)` or `workspaceScope()`?
- [ ] **Input Validation**: Are all route parameters and request bodies validated with a Zod schema?
- [ ] **No Raw Queries**: Are all database queries constructed via Drizzle ORM query builders?
- [ ] **Safe Errors**: Are unexpected errors wrapped in `apiError()` rather than throwing raw exceptions to the client?
- [ ] **Secrets Hygiene**: Ensure no secrets, tokens, or private keys are hardcoded in test fixtures or mock files.
- [ ] **Tests & Lints**: Ensure all automated tests (`bun test`) and linter checks (`bun run lint`) pass cleanly.

---

## 6. Dependency & Supply Chain Auditing

We practice continuous dependency hygiene:

```bash
# Audit dependencies for known vulnerabilities
bun pm audit  # or npm audit

# Check code formatting and static analysis
bun run lint
bun run format:check
```

Security-critical packages (`better-auth`, `drizzle-orm`, `stripe`, `zod`) are pinned and updated through automated dependency analysis.
