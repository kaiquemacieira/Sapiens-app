/**
 * Unified scientific record model (SAPIENS Phase 3+)
 */

export interface ScientificRecord {
  id: string;
  title: string;
  authors: string[];
  abstract?: string | null;
  publicationYear?: number | null;
  publicationDate?: string | null;
  doi?: string | null;
  arxivId?: string | null;
  adsBibcode?: string | null;
  journal?: string | null;
  publisher?: string | null;
  openAccess: boolean;
  citationCount?: number | null;
  sourcePrimary: "ads" | "arxiv" | "merged";
  sourceUrl?: string | null;
  pdfUrl?: string | null;
  sources: Array<"ads" | "arxiv">;
  ra?: number | null;
  dec?: number | null;
}

export interface RegionQuery {
  ra: number;
  dec: number;
  radiusDeg: number;
  objectName?: string | null;
  objectId?: string | null;
}

export type PaperSort =
  | "citations"
  | "year_desc"
  | "year_asc"
  | "relevance"
  | "title";

export type PaperSourceFilter = "all" | "ads" | "arxiv";

export interface PaperListOptions {
  page?: number;
  limit?: number;
  openAccessOnly?: boolean;
  preprintsOnly?: boolean;
  yearFrom?: number | null;
  yearTo?: number | null;
  source?: PaperSourceFilter;
  sort?: PaperSort;
}

export interface RegionSearchResult {
  region: RegionQuery;
  publicationCount: number;
  sources: {
    ads: number;
    arxiv: number;
  };
  records?: ScientificRecord[];
  cached: boolean;
  partial: boolean;
  status: "live" | "cached" | "unavailable" | "partial";
  message?: string;
  timestamp: string;
}

export interface PapersListResult extends RegionSearchResult {
  records: ScientificRecord[];
  total: number;
  page: number;
  limit: number;
  sort: PaperSort;
  filters: {
    openAccessOnly: boolean;
    preprintsOnly: boolean;
    yearFrom: number | null;
    yearTo: number | null;
    source: PaperSourceFilter;
  };
  yearHistogram: Record<number, number>;
}

export interface ScientificProvider {
  id: "ads" | "arxiv";
  name: string;
  searchByRegion(query: RegionQuery): Promise<ScientificRecord[]>;
  searchByObject?(name: string): Promise<ScientificRecord[]>;
  isHealthy(): Promise<boolean>;
}
