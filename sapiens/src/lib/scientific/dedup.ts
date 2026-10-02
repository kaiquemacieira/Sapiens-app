import type { ScientificRecord } from "./types";

function normalizeDoi(doi?: string | null): string | null {
  if (!doi) return null;
  return doi
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:/, "")
    .trim();
}

function normalizeArxiv(id?: string | null): string | null {
  if (!id) return null;
  // strip version: 2301.12345v2 → 2301.12345
  return id
    .toLowerCase()
    .replace(/^arxiv:/, "")
    .replace(/v\d+$/, "")
    .trim();
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackKey(r: ScientificRecord): string {
  const title = normalizeTitle(r.title);
  const author = (r.authors[0] ?? "").toLowerCase().split(/[\s,]+/)[0] ?? "";
  const year = r.publicationYear ?? "";
  return `t:${title}|a:${author}|y:${year}`;
}

/**
 * Canonical id priority: DOI > arXiv > ADS bibcode > title+author+year hash
 */
export function canonicalId(r: ScientificRecord): string {
  const doi = normalizeDoi(r.doi);
  if (doi) return `doi:${doi}`;
  const arxiv = normalizeArxiv(r.arxivId);
  if (arxiv) return `arxiv:${arxiv}`;
  if (r.adsBibcode) return `ads:${r.adsBibcode}`;
  return fallbackKey(r);
}

/**
 * Merge two records preferring richer metadata
 */
function mergeRecords(a: ScientificRecord, b: ScientificRecord): ScientificRecord {
  const sources = Array.from(new Set([...a.sources, ...b.sources]));
  return {
    id: a.id.length <= b.id.length ? a.id : b.id,
    title: a.title.length >= b.title.length ? a.title : b.title,
    authors: a.authors.length >= b.authors.length ? a.authors : b.authors,
    abstract: a.abstract || b.abstract,
    publicationYear: a.publicationYear ?? b.publicationYear,
    publicationDate: a.publicationDate ?? b.publicationDate,
    doi: normalizeDoi(a.doi) ?? normalizeDoi(b.doi),
    arxivId: normalizeArxiv(a.arxivId) ?? normalizeArxiv(b.arxivId),
    adsBibcode: a.adsBibcode ?? b.adsBibcode,
    journal: a.journal ?? b.journal,
    publisher: a.publisher ?? b.publisher,
    openAccess: a.openAccess || b.openAccess,
    citationCount: Math.max(a.citationCount ?? 0, b.citationCount ?? 0) || null,
    sourcePrimary: sources.includes("ads") ? "ads" : sources[0] ?? "merged",
    sourceUrl: a.sourceUrl ?? b.sourceUrl,
    pdfUrl: a.pdfUrl ?? b.pdfUrl,
    sources: sources as Array<"ads" | "arxiv">,
    ra: a.ra ?? b.ra,
    dec: a.dec ?? b.dec,
  };
}

/**
 * Deduplicate a list of scientific records.
 * Same article appearing in ADS + arXiv becomes one record.
 */
export function deduplicateRecords(records: ScientificRecord[]): ScientificRecord[] {
  const map = new Map<string, ScientificRecord>();

  for (const r of records) {
    const key = canonicalId(r);
    const existing = map.get(key);
    if (existing) {
      map.set(key, mergeRecords(existing, { ...r, id: key }));
    } else {
      map.set(key, { ...r, id: key });
    }
  }

  return Array.from(map.values());
}
