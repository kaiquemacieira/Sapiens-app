/**
 * Scientific Data Aggregation Layer — ProviderManager
 */

import type {
  RegionQuery,
  RegionSearchResult,
  ScientificRecord,
  PaperListOptions,
  PapersListResult,
  PaperSort,
  PaperSourceFilter,
} from "./types";
import { adsProvider, isAdsConfigured } from "./providers/ads";
import { arxivProvider } from "./providers/arxiv";
import { deduplicateRecords } from "./dedup";
import {
  setCachedRegionCount,
  setCachedRegionPapers,
  getCachedRegionCountAsync,
  getCachedRegionPapersAsync,
} from "./cache";
import { metrics, logEvent } from "@/lib/observability/metrics";

function isPreprint(r: ScientificRecord): boolean {
  if (r.arxivId && !r.doi) return true;
  const j = (r.journal ?? "").toLowerCase();
  return j.includes("arxiv") || j.includes("preprint");
}

function buildYearHistogram(records: ScientificRecord[]): Record<number, number> {
  const hist: Record<number, number> = {};
  for (const r of records) {
    const y = r.publicationYear;
    if (y && y > 1900 && y < 2100) {
      hist[y] = (hist[y] ?? 0) + 1;
    }
  }
  return hist;
}

function applyFilters(
  records: ScientificRecord[],
  opts: PaperListOptions
): ScientificRecord[] {
  let filtered = records;

  if (opts.openAccessOnly) {
    filtered = filtered.filter((r) => r.openAccess);
  }
  if (opts.preprintsOnly) {
    filtered = filtered.filter(isPreprint);
  }
  if (opts.yearFrom != null) {
    filtered = filtered.filter(
      (r) => (r.publicationYear ?? 0) >= (opts.yearFrom as number)
    );
  }
  if (opts.yearTo != null) {
    filtered = filtered.filter(
      (r) => (r.publicationYear ?? 9999) <= (opts.yearTo as number)
    );
  }
  if (opts.source && opts.source !== "all") {
    const src = opts.source as PaperSourceFilter;
    filtered = filtered.filter((r) => r.sources.includes(src));
  }

  return filtered;
}

function applySort(records: ScientificRecord[], sort: PaperSort): ScientificRecord[] {
  const arr = [...records];
  switch (sort) {
    case "year_desc":
      return arr.sort(
        (a, b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0)
      );
    case "year_asc":
      return arr.sort(
        (a, b) => (a.publicationYear ?? 0) - (b.publicationYear ?? 0)
      );
    case "title":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "relevance":
      // Prefer higher citations then newer — proxy for relevance without query scores
      return arr.sort((a, b) => {
        const c = (b.citationCount ?? 0) - (a.citationCount ?? 0);
        if (c !== 0) return c;
        return (b.publicationYear ?? 0) - (a.publicationYear ?? 0);
      });
    case "citations":
    default:
      return arr.sort((a, b) => {
        const c = (b.citationCount ?? 0) - (a.citationCount ?? 0);
        if (c !== 0) return c;
        return (b.publicationYear ?? 0) - (a.publicationYear ?? 0);
      });
  }
}

async function fetchAllProviders(query: RegionQuery): Promise<{
  records: ScientificRecord[];
  sourceCounts: { ads: number; arxiv: number };
  partial: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let adsRecords: ScientificRecord[] = [];
  let arxivRecords: ScientificRecord[] = [];

  const tasks: Promise<void>[] = [];

  if (isAdsConfigured()) {
    tasks.push(
      adsProvider.searchByRegion(query).then((r) => {
        adsRecords = r;
      }).catch((e) => {
        errors.push(`ADS: ${e instanceof Error ? e.message : "error"}`);
      })
    );
  } else {
    errors.push("ADS: not configured (set ADS_API_TOKEN)");
  }

  tasks.push(
    arxivProvider.searchByRegion(query).then((r) => {
      arxivRecords = r;
    }).catch((e) => {
      errors.push(`arXiv: ${e instanceof Error ? e.message : "error"}`);
    })
  );

  await Promise.all(tasks);

  const merged = deduplicateRecords([...adsRecords, ...arxivRecords]);

  return {
    records: merged,
    sourceCounts: {
      ads: adsRecords.length,
      arxiv: arxivRecords.length,
    },
    partial: errors.length > 0 || !isAdsConfigured(),
    errors,
  };
}

export async function searchRegionCount(
  query: RegionQuery
): Promise<RegionSearchResult> {
  metrics.inc("search_region_count");
  const cached = await getCachedRegionCountAsync(
    query.ra,
    query.dec,
    query.radiusDeg,
    query.objectName,
    query.objectId
  );
  if (cached) return cached;

  const { records, sourceCounts, partial, errors } =
    await fetchAllProviders(query);

  const result: RegionSearchResult = {
    region: query,
    publicationCount: records.length,
    sources: sourceCounts,
    cached: false,
    partial,
    status:
      partial && records.length === 0
        ? "unavailable"
        : partial
          ? "partial"
          : "live",
    message:
      errors.length > 0
        ? errors.join("; ")
        : records.length === 0
          ? "No publications found for this region/object in indexed sources."
          : undefined,
    timestamp: new Date().toISOString(),
  };

  setCachedRegionCount(
    query.ra,
    query.dec,
    query.radiusDeg,
    result,
    undefined,
    query.objectName,
    query.objectId
  );
  setCachedRegionPapers(
    query.ra,
    query.dec,
    query.radiusDeg,
    records,
    undefined,
    query.objectName,
    query.objectId
  );

  logEvent("region_count", {
    ra: query.ra,
    dec: query.dec,
    objectName: query.objectName,
    count: records.length,
    partial,
  });

  return result;
}

export async function searchRegionPapers(
  query: RegionQuery,
  opts: PaperListOptions = {}
): Promise<PapersListResult> {
  metrics.inc("search_region_papers");
  const page = opts.page ?? 1;
  const limit = Math.min(opts.limit ?? 20, 50);
  const sort: PaperSort = opts.sort ?? "citations";
  const source: PaperSourceFilter = opts.source ?? "all";
  const openAccessOnly = !!opts.openAccessOnly;
  const preprintsOnly = !!opts.preprintsOnly;
  const yearFrom = opts.yearFrom ?? null;
  const yearTo = opts.yearTo ?? null;

  let records = await getCachedRegionPapersAsync(
    query.ra,
    query.dec,
    query.radiusDeg,
    query.objectName,
    query.objectId
  );

  let sourceCounts = { ads: 0, arxiv: 0 };
  let partial = false;
  let message: string | undefined;
  let status: RegionSearchResult["status"] = "live";
  let cached = true;

  if (!records) {
    cached = false;
    const fetched = await fetchAllProviders(query);
    records = fetched.records;
    sourceCounts = fetched.sourceCounts;
    partial = fetched.partial;
    message = fetched.errors.join("; ") || undefined;
    status = partial ? "partial" : "live";

    setCachedRegionPapers(
      query.ra,
      query.dec,
      query.radiusDeg,
      records,
      undefined,
      query.objectName,
      query.objectId
    );
    setCachedRegionCount(
      query.ra,
      query.dec,
      query.radiusDeg,
      {
        region: query,
        publicationCount: records.length,
        sources: sourceCounts,
        cached: false,
        partial,
        status,
        message,
        timestamp: new Date().toISOString(),
      },
      undefined,
      query.objectName,
      query.objectId
    );
  } else {
    const countMeta = await getCachedRegionCountAsync(
      query.ra,
      query.dec,
      query.radiusDeg,
      query.objectName,
      query.objectId
    );
    if (countMeta) {
      sourceCounts = countMeta.sources;
      partial = countMeta.partial;
      message = countMeta.message;
      status = "cached";
    }
  }

  const filtered = applySort(
    applyFilters(records, {
      openAccessOnly,
      preprintsOnly,
      yearFrom,
      yearTo,
      source,
    }),
    sort
  );

  const yearHistogram = buildYearHistogram(filtered);
  const total = filtered.length;
  const start = (page - 1) * limit;
  const pageRecords = filtered.slice(start, start + limit);

  return {
    region: query,
    publicationCount: total,
    sources: sourceCounts,
    records: pageRecords,
    total,
    page,
    limit,
    sort,
    filters: {
      openAccessOnly,
      preprintsOnly,
      yearFrom,
      yearTo,
      source,
    },
    yearHistogram,
    cached,
    partial,
    status,
    message,
    timestamp: new Date().toISOString(),
  };
}
