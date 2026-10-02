/**
 * arXiv API provider
 * Docs: https://info.arxiv.org/help/api/user-manual.html
 * No auth required. Respect rate limits.
 */

import type { RegionQuery, ScientificRecord, ScientificProvider } from "../types";

const ARXIV_API = "https://export.arxiv.org/api/query";

function parseAtom(xml: string): ScientificRecord[] {
  const records: ScientificRecord[] = [];
  // Lightweight XML extraction (avoid heavy parser dependency for MVP)
  const entries = xml.split("<entry>").slice(1);

  for (const entry of entries) {
    const title =
      entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, " ").trim() ??
      "Untitled";
    const idUrl = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() ?? "";
    const arxivId =
      idUrl.replace("http://arxiv.org/abs/", "").replace("https://arxiv.org/abs/", "") ??
      null;
    const summary =
      entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, " ").trim() ??
      null;
    const published =
      entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() ?? null;
    const year = published ? Number(published.slice(0, 4)) : null;

    const authors: string[] = [];
    const authorBlocks = entry.match(/<author>([\s\S]*?)<\/author>/g) ?? [];
    for (const ab of authorBlocks) {
      const name = ab.match(/<name>([\s\S]*?)<\/name>/)?.[1]?.trim();
      if (name) authors.push(name);
    }

    const doi =
      entry.match(/<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/)?.[1]?.trim() ?? null;

    const pdfUrl = arxivId
      ? `https://arxiv.org/pdf/${arxivId.replace(/v\d+$/, "")}.pdf`
      : null;

    records.push({
      id: arxivId ? `arxiv:${arxivId.replace(/v\d+$/, "")}` : `arxiv-unknown-${records.length}`,
      title,
      authors,
      abstract: summary,
      publicationYear: year,
      publicationDate: published,
      doi,
      arxivId: arxivId?.replace(/v\d+$/, "") ?? null,
      adsBibcode: null,
      journal: "arXiv",
      publisher: "arXiv",
      openAccess: true,
      citationCount: null,
      sourcePrimary: "arxiv",
      sourceUrl: arxivId ? `https://arxiv.org/abs/${arxivId}` : null,
      pdfUrl,
      sources: ["arxiv"],
    });
  }

  return records;
}

async function arxivQuery(searchQuery: string, maxResults = 40): Promise<ScientificRecord[]> {
  const params = new URLSearchParams({
    search_query: searchQuery,
    start: "0",
    max_results: String(maxResults),
    sortBy: "relevance",
    sortOrder: "descending",
  });

  const res = await fetch(`${ARXIV_API}?${params}`, {
    headers: { Accept: "application/atom+xml" },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    console.error(`[arXiv] ${res.status}`);
    return [];
  }

  const xml = await res.text();
  return parseAtom(xml);
}

export const arxivProvider: ScientificProvider = {
  id: "arxiv",
  name: "arXiv",

  async searchByRegion(query: RegionQuery): Promise<ScientificRecord[]> {
    if (query.objectName) {
      const name = query.objectName.replace(/"/g, "");
      // all: searches title, abstract, authors
      return arxivQuery(`all:"${name}"`, 40);
    }

    // Weak positional fallback
    const ra = query.ra.toFixed(1);
    const dec = query.dec.toFixed(1);
    return arxivQuery(`all:"${ra}" AND all:"${dec}"`, 15);
  },

  async searchByObject(name: string): Promise<ScientificRecord[]> {
    return arxivQuery(`all:"${name.replace(/"/g, "")}"`, 40);
  },

  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${ARXIV_API}?search_query=all:star&max_results=1`, {
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
