// Shared in-memory rate limiter used by the API routes. On Vercel serverless this is per-instance and
// resets on cold start — it is BEST-EFFORT throttling, not a hard cross-instance guarantee. It evicts
// expired entries on every call so the store cannot grow unbounded across many keys (memory-DoS guard).
//
// Extracted into one pure function so the branching (allow / limited / window reset / eviction) can be
// unit-tested with fake timers instead of being duplicated across three routes.

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
  minutesLeft: number;
}

export function rateLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Evict expired windows so the Map can't grow without bound as new keys arrive.
  // (forEach avoids needing downlevelIteration for the current tsconfig target.)
  store.forEach((entry, k) => {
    if (now > entry.resetAt) store.delete(k);
  });

  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { limited: false, remaining: max - 1, resetAt, minutesLeft: 0 };
  }

  if (existing.count >= max) {
    return {
      limited: true,
      remaining: 0,
      resetAt: existing.resetAt,
      minutesLeft: Math.ceil((existing.resetAt - now) / (60 * 1000)),
    };
  }

  existing.count += 1;
  return {
    limited: false,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
    minutesLeft: 0,
  };
}
