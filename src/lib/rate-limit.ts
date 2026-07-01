interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.windowStart + CLEANUP_INTERVAL <= now) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export function rateLimit(
  ip: string,
  method: string,
  limit: number,
  windowMs: number = 60_000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `${ip}:${method}`;

  const entry = store.get(key);

  if (!entry || entry.windowStart + windowMs <= now) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.windowStart + windowMs };
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.windowStart + windowMs };
}
