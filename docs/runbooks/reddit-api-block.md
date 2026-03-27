# Runbook: Reddit API Block

> **Status:** Critical / Provider Outage  
> **Target:** Reddit Official API vs. PullPush Fallback  
> **Last Updated:** 2026-03-27

## 🚨 Symptom Detection
- **Error Logs**: `Reddit API returned 403: Forbidden` or `blocked` appearing in `MiningRunner` logs.
- **Failover**: Automated failover to PullPush triggers, but results may be slower or from a slightly older cache.
- **Metrics**: Spike in `isRedditBlockedError` events in observability stack (if configured).

---

## 🛠️ Step 1: Immediate Remediation (System Banner)

To manage user expectations and explain potential delays/limited results, activate the in-app banner.

### 1.1. Activate via Vercel/Environment Variables
1. Log into your **Deployment Console** (e.g., Vercel).
2. Set `NEXT_PUBLIC_MAINTENANCE_MODE` to `true`.
3. Set `NEXT_PUBLIC_MAINTENANCE_MESSAGE` to:
   > "Reddit API is currently degraded. Mining results may be delayed or limited while we use backup sources."
4. **Redeploy** or trigger a configuration refresh.

---

## 🔍 Step 2: Diagnostic Checks

### 2.1. Verify API Health
Check the official Reddit Status: [https://www.redditstatus.com/](https://www.redditstatus.com/)

### 2.2. Check User-Agent & Credentials
If 403s are persistent, Reddit may have flagged your User-Agent.
- Verify `REDDIT_USER_AGENT` follows the recommended format: `App:ID:v1.0 (by /u/username)`.
- Rotate the `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` if you suspect the app itself is blocked.

### 2.3. Check PullPush Status
Since the system automatically fails over, ensure PullPush is actually responding:
```bash
curl "https://api.pullpush.io/reddit/search/submission/?subreddit=SaaS&size=1"
```

---

## 🔧 Step 3: Manual Failover (If Automatic Fails)

If the automatic detection is failing to trigger, you can force the fallback in `lib/reddit.ts`:

1.  Locate `fetchRedditResponse` in `lib/reddit.ts`.
2.  Temporarily change it to throw a "blocked" error immediately to force all requests into the `catch` block that triggers PullPush.

```typescript
// Emergency Force Fallback
async function fetchRedditResponse(url: string): Promise<Response> {
  throw new Error("403 Forbidden (Forced Failover)");
  // ... original logic ...
}
```

---

## 📈 Step 4: Monitoring for Restoration
- **Log Sampling**: Watch for `fetchRedditResponse` succeeding again (without entering the catch block).
- **Rate Limit Reset**: Reddit blocks are often temporary (1-2 hours). Test the API periodically with a manual script.

---

## ✅ Step 5: Post-Incident
1.  Set `NEXT_PUBLIC_MAINTENANCE_MODE` to `false`.
2.  Revert any emergency code changes in `lib/reddit.ts`.
3.  Check if `OpenRouter` costs spiked (PullPush may sometimes return more content requiring more AI processing).
