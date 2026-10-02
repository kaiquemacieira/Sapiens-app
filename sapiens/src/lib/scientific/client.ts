/**
 * Client-side helpers to call SAPIENS scientific APIs
 * Phase 15: offline cache via IndexedDB
 */

import type {
  RegionSearchResult,
  PapersListResult,
  PaperSort,
  PaperSourceFilter,
} from "./types";
import {
  papersCacheKey,
  getCachedPapers,
  setCachedPapers,
} from "@/lib/offline/cache";

export async function fetchRegionCount(params: {
  ra: number;
  dec: number;
  radius: number;
  objectName?: string | null;
  objectId?: string | null;
}): Promise<RegionSearchResult> {
  const key = papersCacheKey({
    ra: params.ra,
    dec: params.dec,
    radius: params.radius,
    page: 0,
    limit: 0,
    objectName: params.objectName,
  });

  const sp = new URLSearchParams({
    ra: String(params.ra),
    dec: String(params.dec),
    radius: String(params.radius),
  });
  if (params.objectName) sp.set("objectName", params.objectName);
  if (params.objectId) sp.set("objectId", params.objectId);

  try {
    const res = await fetch(`/api/sky/region?${sp}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as RegionSearchResult;
    await setCachedPapers(key, data as PapersListResult);
    return data;
  } catch (err) {
    const cached = await getCachedPapers(key);
    if (cached) return cached;
    throw err;
  }
}

export async function fetchRegionPapers(params: {
  ra: number;
  dec: number;
  radius: number;
  page?: number;
  limit?: number;
  openAccess?: boolean;
  preprint?: boolean;
  yearFrom?: number | null;
  yearTo?: number | null;
  source?: PaperSourceFilter;
  sort?: PaperSort;
  objectName?: string | null;
}): Promise<PapersListResult> {
  const key = papersCacheKey({
    ra: params.ra,
    dec: params.dec,
    radius: params.radius,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sort: params.sort ?? "citations",
    source: params.source ?? "all",
    objectName: params.objectName,
  });

  const sp = new URLSearchParams({
    ra: String(params.ra),
    dec: String(params.dec),
    radius: String(params.radius),
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
    sort: params.sort ?? "citations",
    source: params.source ?? "all",
  });
  if (params.openAccess) sp.set("openAccess", "1");
  if (params.preprint) sp.set("preprint", "1");
  if (params.yearFrom != null) sp.set("yearFrom", String(params.yearFrom));
  if (params.yearTo != null) sp.set("yearTo", String(params.yearTo));
  if (params.objectName) sp.set("objectName", params.objectName);

  try {
    const res = await fetch(`/api/sky/region/papers?${sp}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as PapersListResult;
    await setCachedPapers(key, data);
    return data;
  } catch (err) {
    const cached = await getCachedPapers(key);
    if (cached) return cached as PapersListResult;
    throw err;
  }
}
