/**
 * Scientific Cache — Phase 8
 *
 * L1: process-local Map (warm serverless invocations)
 * L2: Supabase `scientific_cache` when configured (shared across instances)
 */

import type { RegionSearchResult, ScientificRecord } from "./types";
import {
  isSupabaseAdminConfigured,
  getSupabaseAdmin,
} from "@/lib/supabase/client";
import { metrics } from "@/lib/observability/metrics";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const store = new Map<string, CacheEntry<unknown>>();

/** Normalize region cache key (includes object identity when present) */
export function regionKey(
  ra: number,
  dec: number,
  radius: number,
  kind: string,
  objectName?: string | null,
  objectId?: string | null
): string {
  const raB = Math.round(ra * 100) / 100;
  const decB = Math.round(dec * 100) / 100;
  const rB = Math.round(radius * 100) / 100;
  const obj = (objectId || objectName || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .slice(0, 64);
  return `region:${kind}:${raB}:${decB}:${rB}:${obj || "coord"}`;
}

function getL1<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function setL1<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  // Soft bound memory on long-lived instances
  if (store.size > 500) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }
}

async function getL2<T>(key: string): Promise<T | null> {
  if (!isSupabaseAdminConfigured()) return null;
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("scientific_cache")
      .select("payload, expires_at")
      .eq("cache_key", key)
      .maybeSingle();
    if (error || !data) return null;
    if (new Date(data.expires_at).getTime() < Date.now()) {
      // best-effort delete expired
      void sb.from("scientific_cache").delete().eq("cache_key", key);
      return null;
    }
    metrics.inc("cache_l2_hit");
    return data.payload as T;
  } catch {
    return null;
  }
}

async function setL2<T>(key: string, value: T, ttlMs: number): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;
  try {
    const sb = getSupabaseAdmin();
    const expires = new Date(Date.now() + ttlMs).toISOString();
    await sb.from("scientific_cache").upsert(
      {
        cache_key: key,
        payload: value as object,
        expires_at: expires,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "cache_key" }
    );
    metrics.inc("cache_l2_write");
  } catch {
    // non-fatal
  }
}

export function getCachedRegionCount(
  ra: number,
  dec: number,
  radius: number,
  objectName?: string | null,
  objectId?: string | null
): RegionSearchResult | null {
  const key = regionKey(ra, dec, radius, "count", objectName, objectId);
  const hit = getL1<RegionSearchResult>(key);
  if (hit) {
    metrics.inc("cache_l1_hit");
    return { ...hit, cached: true, status: "cached" };
  }
  metrics.inc("cache_l1_miss");
  return null;
}

/** Async count lookup with L2 fallback */
export async function getCachedRegionCountAsync(
  ra: number,
  dec: number,
  radius: number,
  objectName?: string | null,
  objectId?: string | null
): Promise<RegionSearchResult | null> {
  const key = regionKey(ra, dec, radius, "count", objectName, objectId);
  const l1 = getL1<RegionSearchResult>(key);
  if (l1) {
    metrics.inc("cache_l1_hit");
    return { ...l1, cached: true, status: "cached" };
  }
  const l2 = await getL2<RegionSearchResult>(key);
  if (l2) {
    setL1(key, l2, DEFAULT_TTL_MS);
    return { ...l2, cached: true, status: "cached" };
  }
  metrics.inc("cache_miss");
  return null;
}

export function setCachedRegionCount(
  ra: number,
  dec: number,
  radius: number,
  value: RegionSearchResult,
  ttlMs = DEFAULT_TTL_MS,
  objectName?: string | null,
  objectId?: string | null
): void {
  const key = regionKey(ra, dec, radius, "count", objectName, objectId);
  setL1(key, value, ttlMs);
  void setL2(key, value, ttlMs);
}

export function getCachedRegionPapers(
  ra: number,
  dec: number,
  radius: number,
  objectName?: string | null,
  objectId?: string | null
): ScientificRecord[] | null {
  const key = regionKey(ra, dec, radius, "papers", objectName, objectId);
  const hit = getL1<ScientificRecord[]>(key);
  if (hit) {
    metrics.inc("cache_l1_hit");
    return hit;
  }
  metrics.inc("cache_l1_miss");
  return null;
}

export async function getCachedRegionPapersAsync(
  ra: number,
  dec: number,
  radius: number,
  objectName?: string | null,
  objectId?: string | null
): Promise<ScientificRecord[] | null> {
  const key = regionKey(ra, dec, radius, "papers", objectName, objectId);
  const l1 = getL1<ScientificRecord[]>(key);
  if (l1) {
    metrics.inc("cache_l1_hit");
    return l1;
  }
  const l2 = await getL2<ScientificRecord[]>(key);
  if (l2) {
    setL1(key, l2, DEFAULT_TTL_MS);
    return l2;
  }
  metrics.inc("cache_miss");
  return null;
}

export function setCachedRegionPapers(
  ra: number,
  dec: number,
  radius: number,
  records: ScientificRecord[],
  ttlMs = DEFAULT_TTL_MS,
  objectName?: string | null,
  objectId?: string | null
): void {
  const key = regionKey(ra, dec, radius, "papers", objectName, objectId);
  setL1(key, records, ttlMs);
  void setL2(key, records, ttlMs);
}

export function cacheStats() {
  return { size: store.size };
}
