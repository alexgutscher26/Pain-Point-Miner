type IdempotencyEntry<T> = {
  expiresAt: number;
  inFlight?: Promise<T>;
  result?: T;
};

const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

declare global {
  var __rppIdempotencyStore: Map<string, IdempotencyEntry<unknown>> | undefined;
}

const store = globalThis.__rppIdempotencyStore ?? new Map<string, IdempotencyEntry<unknown>>();
globalThis.__rppIdempotencyStore = store;

function sweepExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

export async function runWithIdempotency<T>(
  namespacedKey: string,
  fn: () => Promise<T>
): Promise<{ result: T; replayed: boolean }> {
  sweepExpiredEntries();
  const now = Date.now();
  const existing = store.get(namespacedKey) as IdempotencyEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    if (existing.result !== undefined) {
      return { result: existing.result, replayed: true };
    }
    if (existing.inFlight) {
      const result = await existing.inFlight;
      return { result, replayed: true };
    }
  }

  const inFlight = fn();
  store.set(namespacedKey, {
    expiresAt: now + IDEMPOTENCY_TTL_MS,
    inFlight,
  });

  try {
    const result = await inFlight;
    store.set(namespacedKey, {
      expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
      result,
    });
    return { result, replayed: false };
  } catch (error) {
    store.delete(namespacedKey);
    throw error;
  }
}
