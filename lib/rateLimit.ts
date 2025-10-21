const MAX_REQUESTS_PER_WINDOW = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  options: { limit?: number; windowMs?: number } = {}
): { ok: boolean; remaining: number; reset: number } {
  const limit = options.limit ?? MAX_REQUESTS_PER_WINDOW;
  const windowMs = options.windowMs ?? WINDOW_MS;
  const now = Date.now();

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, reset: bucket.resetAt };
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return { ok: true, remaining: limit - bucket.count, reset: bucket.resetAt };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
