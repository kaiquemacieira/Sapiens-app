/**
 * NASA ADS provider adapter
 * Docs: https://ui.adsabs.harvard.edu/help/api/
 * Auth: Bearer token from https://ui.adsabs.harvard.edu/user/settings/token
 */

import type { RegionQuery, ScientificRecord, ScientificProvider } from "../types";

const ADS_BASE = "https://api.adsabs.harvard.edu/v1";

function getToken(): string | null {
  return process.env.ADS_API_TOKEN ?? process.env.ADS_DEV_KEY ?? null;
}

function mapAdsDoc(doc: Record<string, unknown>): ScientificRecord {
  const bibcode = (doc.bibcode as string) ?? "";
  const doiList = doc.doi as string[] | undefined;
  const doi = doiList?.[0] ?? null;
  const arxivId =
    (doc.identifier as string[] | undefined)?.find((id) =>
      /^(\d{4}\.\d{4,5}|[a-z\-]+\/\d+)/i.test(id)
    ) ??
    (doc.eid as string | undefined)?.replace(/^arXiv:/, "") ??
    null;

  const authors = (doc.author as string[]) ?? [];
  const year = doc.year ? Number(doc.year) : null;
  const openAccess =
    (doc.property as string[] | undefined)?.includes("OPENACCESS") ?? false;

  return {
    id: doi ? `doi:${doi}` : `ads:${bibcode}`,
    title: Array.isArray(doc.title) ? (doc.title[0] as string) : (doc.title as string) ?? "Untitled",
    authors,
    abstract: (doc.abstract as string) ?? null,
    publicationYear: year,
    publicationDate: (doc.pubdate as string) ?? null,
    doi,
    arxivId,
    adsBibcode: bibcode || null,
    journal: (doc.pub as string) ?? null,
    publisher: null,
    openAccess,
    citationCount: (doc.citation_count as number) ?? null,
    sourcePrimary: "ads",
    sourceUrl: bibcode
      ? `https://ui.adsabs.harvard.edu/abs/${bibcode}/abstract`
      : null,
    pdfUrl: null,
    sources: ["ads"],
  };
}

async function adsSearch(q: string, rows = 50): Promise<ScientificRecord[]> {
  const token = getToken();
  if (!token) {
    console.warn("[ADS] No ADS_API_TOKEN configured");
    return [];
  }

  const params = new URLSearchParams({
    q,
    fl: "bibcode,title,author,year,pubdate,doi,abstract,citation_count,pub,property,identifier,eid",
    rows: String(rows),
    sort: "citation_count desc",
  });

  const res = await fetch(`${ADS_BASE}/search/query?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    // Vercel: avoid hanging
    signal: AbortSignal.timeout(12000),
  });

  if (res.status === 429) {
    console.warn("[ADS] Rate limited");
    return [];
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[ADS] ${res.status}: ${text.slice(0, 200)}`);
    return [];
  }

  const data = (await res.json()) as {
    response?: { docs?: Record<string, unknown>[] };
  };
  const docs = data.response?.docs ?? [];
  return docs.map(mapAdsDoc);
}

export const adsProvider: ScientificProvider = {
  id: "ads",
  name: "NASA ADS",

  async searchByRegion(query: RegionQuery): Promise<ScientificRecord[]> {
    // Prefer object-name search when available (much better recall in ADS)
    if (query.objectName) {
      const nameQ = `object:"${query.objectName.replace(/"/g, "")}"`;
      const byObject = await adsSearch(nameQ, 80);
      if (byObject.length > 0) return byObject;
      // fallback: title/abstract mention
      return adsSearch(`"${query.objectName.replace(/"/g, "")}"`, 40);
    }

    // Coordinate-ish fallback: search by rounded position keywords
    // ADS does not have a pure cone-search for all literature; this is a pragmatic MVP.
    const ra = query.ra.toFixed(2);
    const dec = query.dec.toFixed(2);
    return adsSearch(`"${ra}" "${dec}"`, 20);
  },

  async searchByObject(name: string): Promise<ScientificRecord[]> {
    return adsSearch(`object:"${name.replace(/"/g, "")}"`, 80);
  },

  async isHealthy(): Promise<boolean> {
    const token = getToken();
    if (!token) return false;
    try {
      const res = await fetch(`${ADS_BASE}/search/query?q=star&rows=1&fl=bibcode`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

export function isAdsConfigured(): boolean {
  return !!getToken();
}
