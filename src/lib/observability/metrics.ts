/**
 * Lightweight process metrics for SAPIENS (Phase 8)
 * Suitable for Vercel serverless warm instances + /api/health
 */

type CounterMap = Record<string, number>;

const counters: CounterMap = {};
const startedAt = Date.now();

export const metrics = {
  inc(name: string, by = 1) {
    counters[name] = (counters[name] ?? 0) + by;
  },
  get(name: string): number {
    return counters[name] ?? 0;
  },
  snapshot() {
    return {
      uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
      counters: { ...counters },
    };
  },
  reset() {
    for (const k of Object.keys(counters)) delete counters[k];
  },
};

export function logEvent(
  event: string,
  data?: Record<string, unknown>
): void {
  const payload = {
    ts: new Date().toISOString(),
    event,
    ...data,
  };
  // Structured logs for Vercel log drain
  console.log(JSON.stringify(payload));
}
