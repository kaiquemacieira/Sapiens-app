/**
 * Simple token-bucket rate limiter (per-instance).
 * For multi-region production, prefer Upstash Redis / Vercel KV.
 */

import { metrics } from "./metrics";

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let b = buckets.get(opts.key);
  if (!b) {
    b = { tokens: opts.limit, updatedAt: now };
    buckets.set(opts.key, b);
  }

  const elapsed = now - b.updatedAt;
  if (elapsed > 0) {
    const refill = (elapsed / opts.windowMs) * opts.limit;
    b.tokens = Math.min(opts.limit, b.tokens + refill);
    b.updatedAt = now;
  }

  if (b.tokens < 1) {
    metrics.inc("rate_limited");
    return { allowed: false, remaining: 0 };
  }

  b.tokens -= 1;
  return { allowed: true, remaining: Math.floor(b.tokens) };
}

/** Extract a coarse client key from request headers */
export function clientKeyFromHeaders(h: Headers): string {
  const fwd = h.get("x-forwarded-for") || h.get("x-real-ip") || "anon";
  return fwd.split(",")[0].trim().slice(0, 64);
}
