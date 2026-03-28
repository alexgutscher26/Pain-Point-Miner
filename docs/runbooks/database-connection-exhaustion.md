# Runbook: Database Connection Exhaustion

> **Status:** Critical / Service Degradation  
> **Target:** PostgreSQL (Neon / Serverless) via `postgres-js`  
> **Last Updated:** 2026-03-27

## 🚨 Symptom Detection

- **Error Logs**: `postgres: too many clients already` or `connection limit exceeded`.
- **API Status**: HTTP 500 responses on all data-fetching routes.
- **Neon Dashboard**: Connection graph hitting the ceiling (e.g., 100/100 connections).

---

## 🔍 Step 1: Identify the Culprits

Run these queries in the **Neon SQL Console** or any PG client to see what's holding connections.

### 1.1. Summary of Connections by State

```sql
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;
```

- **Active**: Queries currently running.
- **Idle in transaction**: Transactions that were opened but never `COMMIT`ted or `ROLLBACK`ed. **(High Risk)**
- **Idle**: Connections waiting for a new command.

### 1.2. List the Longest Running Queries

```sql
SELECT
    pid,
    now() - query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC
LIMIT 10;
```

---

## 🛠️ Step 2: Immediate Remediation

### 2.1. Terminate a Specific Problematic Process

If you find a single query (PID) that is hanging:

```sql
SELECT pg_terminate_backend(<PID>);
```

### 2.2. Emergency Flush: Kill All Idle Connections

If the pool is full of "Idle" connections that haven't closed:

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND pid <> pg_backend_pid();
```

### 2.3. Reset the Neon Connection Pooler

If using the `.pooler.neon.tech` endpoint:

1. Log into the **Neon Console**.
2. Go to **Settings** > **Connection Pooling**.
3. Toggle the Pooler **OFF** and then **ON** again.
   _(Warning: This will drop all active connections, but will immediately clear the exhaustion.)_

---

## ⚙️ Step 3: Scaling & Configuration

### 3.1. Adjusting Code-Level Pool Size

In `lib/db/index.ts`, the default `postgres-js` pool size is 10. If you are hitting limits due to high traffic, you can explicitly set the `max` connections.

```typescript
// lib/db/index.ts
export const client = postgres(connectionString, {
  prepare: false,
  max: 20, // Increase if the DB instance supports higher limits
  idle_timeout: 30, // Force close idle connections after 30s
  connect_timeout: 10, // Timeout if connection takes too long
});
```

### 3.2. Scaling the Database

If traffic has permanently increased:

- **Neon**: Upgrade compute size in the dashboard to increase the native connection limit (non-pooler).
- **Pooler**: Increase the pooler limit in Neon (default is often 100).

---

## 🛡️ Step 4: Prevention Checklist

- [ ] **Check Transactional Logic**: Ensure all `db.transaction()` blocks are small and always complete.
- [ ] **Avoid Fetch in Loops**: Ensure you aren't opening new connections inside a `.map()` or loop.
- [ ] **Serverless Warmup**: In Vercel, frequent cold starts can spike connections. Use the **Neon HTTP Driver** if you are strictly serverless and don't need persistent transactions.
