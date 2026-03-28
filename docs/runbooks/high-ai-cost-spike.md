# Runbook: High AI Cost Spike

> **Status:** Warning / Financial Risk  
> **Target:** OpenRouter / AI Extraction Engine  
> **Last Updated:** 2026-03-27

## 🚨 Symptom Detection

- **OpenRouter Alerts**: Email notification of credit threshold or daily spend spike.
- **Billing Dashboard**: Unexpectedly high usage in the "Activity" tab of OpenRouter.
- **Log Volume**: Monitoring logs show a massive volume of `extractPainPoints` calls in a short window.

---

## 🔍 Step 1: Identify the Source

Run this query in your SQL console to find which user or scraper is driving the volume.

### 1.1. Top 10 High-Consumption Scrapers (Past 24h)

```sql
SELECT
    s.id as scraper_id,
    u.email as user_email,
    count(sr.id) as run_count,
    sum(sr.posts_matched) as potential_ai_calls
FROM scraper s
JOIN scraper_run sr ON s.id = sr.scraper_id
JOIN "user" u ON s.userId = u.id
WHERE sr.started_at > now() - interval '24 hours'
GROUP BY s.id, u.email
ORDER BY run_count DESC
LIMIT 10;
```

### 1.2. Check Mining Depth

Identify if the user is using `advanced` depth (up to 20 AI calls per scan) instead of `basic` (3 calls).

```sql
SELECT mining_depth, count(*)
FROM scraper
WHERE status = 'running'
GROUP BY mining_depth;
```

---

## 🛠️ Step 2: Immediate Containment

### 2.1. Pause the Offending Scraper

If a single scraper is malfunctioning or being abused:

```sql
UPDATE scraper
SET status = 'paused', last_error = 'Temporarily paused due to high consumption'
WHERE id = '<SCRAPER_ID>';
```

### 2.2. Emergency Global Cap

If the entire system is under a spike, manually lower the `processingLimit` in `lib/mining-runner.ts` to reduce costs while investigating.

```typescript
// lib/mining-runner.ts
// Emergency Override: Set all depths to 1 or 2 while debugging spike
const analyzeLimit = 1; // Temporary override
```

### 2.3. Key Rotation (Total Kill Switch)

If you suspect an API key leak, immediately rotate `OPENROUTER_API_KEY` in your environment variables.

---

## 📢 Step 3: User Notification

Use the manual email template to notify the user of the temporary hold.

> **Subject**: Action Required: Your ThreddIQ Scan is Temporarily Paused
>
> **Body**:
> Hello,
>
> Our automated monitoring detected an unusually high volume of AI analysis requests from your account. To protect system stability and prevent billing spikes, we have temporarily paused your active scraper: [Scraper ID].
>
> Please review your mining depth settings and subreddit selection. You can resume your scan from the dashboard once you've adjusted your configuration.
>
> Best,
> ThreddIQ Ops

---

## ✅ Step 4: Prevention & Restoration

- [ ] **Implement Credits**: Accelerate Phase 5 task `scan_credit` enforcement.
- [ ] **Rate Limits**: Verify `per-user rate limiting` in `lib/rate-limit.ts` is correctly capturing AI calls.
- [ ] **Model Fallback**: If using `GPT-4o`, consider forcing all runs to `Gemini Flash` until the audit is complete.
