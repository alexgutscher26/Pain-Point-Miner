/**
 * Generic Rate Limiting Utility
 * Implements a Sliding Window algorithm in-memory.
 */

type RateLimitRecord = {
  timestamps: number[];
};

const storage = new Map<string, RateLimitRecord>();

// Cleanup stale records every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      // Remove timestamps older than 1 minute
      const filtered = record.timestamps.filter(t => now - t < 60000);
      if (filtered.length === 0) {
        storage.delete(key);
      } else {
        record.timestamps = filtered;
      }
    }
  }, 60000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Seconds until window resets
}

/**
 * Check if a request is allowed
 * @param identifier Unique key (e.g. userId or IP)
 * @param limit Max requests per minute
 */
export function checkRateLimit(identifier: string, limit: number): RateLimitResult {
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  let record = storage.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    storage.set(identifier, record);
  }

  // Filter out expired timestamps
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetTime = Math.ceil((windowMs - (now - oldest)) / 1000);

    return {
      allowed: false,
      remaining: 0,
      reset: Math.max(1, resetTime),
    };
  }

  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    reset: 0,
  };
}
