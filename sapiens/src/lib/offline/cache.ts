/**
 * Offline cache for scientific + AI responses — Phase 15
 */

import {
  idbGet,
  idbSet,
  PAPERS_TTL_MS,
  AI_TTL_MS,
} from "@/lib/offline/idb";
import type {
  RegionSearchResult,
  PapersListResult,
} from "@/lib/scientific/types";
import type { AiRegionResponse } from "@/lib/ai/types";

type CachedPaperPayload = RegionSearchResult | PapersListResult;

export function papersCacheKey(params: {
  ra: number;
  dec: number;
  radius: number;
  page?: number;
  limit?: number;
  sort?: string;
  source?: string;
  objectName?: string | null;
}): string {
  const {
    ra,
    dec,
    radius,
    page = 1,
    limit = 20,
    sort = "citations",
    source = "all",
    objectName,
  } = params;
  return `papers:${ra.toFixed(4)}:${dec.toFixed(4)}:${radius.toFixed(3)}:p${page}:l${limit}:${sort}:${source}:${objectName || "region"}`;
}

export function aiCacheKey(params: {
  ra: number;
  dec: number;
  radius: number;
  kind: string;
  question: string;
  objectName?: string | null;
}): string {
  const q = params.question.slice(0, 80).toLowerCase().replace(/\s+/g, "_");
  return `ai:${params.ra.toFixed(4)}:${params.dec.toFixed(4)}:${params.radius.toFixed(3)}:${params.kind}:${params.objectName || "region"}:${q}`;
}

interface CachedPapers {
  key: string;
  data: CachedPaperPayload;
  savedAt: number;
}

interface CachedAi {
  key: string;
  data: AiRegionResponse;
  savedAt: number;
}

export async function getCachedPapers(
  key: string
): Promise<CachedPaperPayload | null> {
  const row = await idbGet<CachedPapers>("papers", key);
  if (!row) return null;
  if (Date.now() - row.savedAt > PAPERS_TTL_MS) return null;
  return {
    ...row.data,
    status: `${row.data.status || "ok"} · offline-cache`,
  };
}

export async function setCachedPapers(
  key: string,
  data: CachedPaperPayload
): Promise<void> {
  await idbSet("papers", { key, data, savedAt: Date.now() });
}

export async function getCachedAi(
  key: string
): Promise<AiRegionResponse | null> {
  const row = await idbGet<CachedAi>("ai", key);
  if (!row) return null;
  if (Date.now() - row.savedAt > AI_TTL_MS) return null;
  return {
    ...row.data,
    warnings: [
      ...(row.data.warnings || []),
      "Served from offline cache — reconnect for fresh literature.",
    ],
  };
}

export async function setCachedAi(
  key: string,
  data: AiRegionResponse
): Promise<void> {
  await idbSet("ai", { key, data, savedAt: Date.now() });
}
