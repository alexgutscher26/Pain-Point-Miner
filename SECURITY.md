# Security Policy

## Supported Versions

Only the latest release on the `master` branch receives security patches. There are no LTS or legacy branches.

| Version | Supported |
| ------- | --------- |
| latest  | Yes       |
| older   | No        |

## Reporting a Vulnerability

If you discover a security vulnerability in RPP, **do not open a public GitHub issue**.

Instead, please email **security@rpp.dev** with:

1. A description of the vulnerability and its potential impact.
2. Steps to reproduce or a proof-of-concept.
3. The affected component (e.g. API route, database query, auth flow).
4. Any suggested fix, if you have one.

You will receive an acknowledgment within **48 hours**. We aim to provide a fix or mitigation within **7 days** for critical issues and **30 days** for lower-severity issues.

We will credit reporters in release notes unless you prefer to remain anonymous.

## Security Architecture

### Authentication

- **Provider**: [Better Auth](https://better-auth.com) with email/password and OAuth flows.
- **Sessions**: Server-side session tokens stored in the `session` table. Tokens are validated on every authenticated API request via `auth.api.getSession()`.
- **Password storage**: Handled by Better Auth's built-in bcrypt hashing. Passwords are never stored in plaintext.

### Authorization

- All API routes validate the authenticated session before processing.
- Workspace-scoped resources enforce ownership via `workspaceScope()` (checks `workspaceId` match or `IS NULL` for personal scope).
- Plan-based access gating enforced via `plan-gating.ts` — mining depth, subreddit limits, and monthly scan caps are checked before execution.

### API Security

- **Input validation**: All API inputs are validated with [Zod](https://zod.dev) schemas before processing. Malformed payloads return `400 VALIDATION_ERROR`.
- **Idempotency**: The search API supports idempotency keys to prevent duplicate submissions. The `idempotency-key` header is validated against a strict format.
- **Reddit AI dedup**: `reddit-idempotency.ts` prevents billing the same Reddit post for AI processing twice within a 24-hour window.
- **Correlation IDs**: Every API response includes an `x-correlation-id` header for request tracing.
- **Error handling**: Internal errors never leak stack traces or sensitive details to the client. All errors go through `apiError()` which returns structured `{ code, message }` responses.

### Data Protection

- **Database connection**: PostgreSQL connections use SSL (`sslmode=require`) via Neon's connection pooler.
- **No plaintext secrets in code**: All secrets (API keys, database credentials, Stripe keys) are loaded from environment variables. The `.env.local` file is gitignored.
- **Reddit credentials**: OAuth client credentials are stored as environment variables, never committed. Access tokens are cached in-memory with expiry tracking and refreshed automatically.
- **Stripe webhook verification**: Webhook payloads are verified using the `STRIPE_WEBHOOK_SECRET` before processing.

### Third-Party API Security

- **OpenRouter**: API key transmitted via `Authorization: Bearer` header over HTTPS only.
- **Reddit API**: OAuth 2.0 client credentials flow. Access tokens auto-refresh on 401. Fallback to PullPush API (public, no auth) only when Reddit returns 403.
- **Stripe**: Server-side only — the Stripe secret key is never exposed to the client.

### Rate Limiting & Abuse Prevention

- **Duplicate submission guard**: The search API rejects identical submissions within a 30-second window.
- **Reddit rate limiting**: Built-in retry logic with exponential backoff for 429/5xx responses. Requests are capped at 3 retries with a 15-second timeout per request.
- **Plan-based limits**: Monthly scan quotas are enforced per user, preventing runaway usage.

### What We Don't Do (Yet)

The following are on the roadmap but not yet implemented:

- Per-endpoint rate limiting (beyond plan-based scan limits).
- API key hashing (keys are currently stored as-is in the `api_key` table).
- Content Security Policy headers.
- CSRF token validation (mutations rely on same-origin session cookies).
- PII anonymization for Reddit author names in stored pain points.

See `todo.md` Phase 9 (Security Hardening) and Phase 10 (Maintenance) for the full security roadmap.

## Dependencies

We monitor dependencies for known vulnerabilities. Key security-relevant packages:

- `better-auth` — Authentication framework.
- `stripe` — Payment processing (server-side only).
- `postgres` / `drizzle-orm` — Database access (parameterized queries prevent SQL injection).
- `zod` — Input validation.

Run `npm audit` to check for known vulnerabilities in the dependency tree.

## Responsible Disclosure

We follow responsible disclosure practices. If you report a vulnerability:

- We will not take legal action against researchers acting in good faith.
- We will work with you to understand and resolve the issue.
- We will publicly credit you (unless you opt out) once a fix is released.
