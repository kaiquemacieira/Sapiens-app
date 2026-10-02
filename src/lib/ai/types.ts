import type { ScientificRecord } from "@/lib/scientific/types";

export type AiQuestionKind =
  | "summary"
  | "timeline"
  | "top_cited"
  | "open_access"
  | "custom";

export interface AiRegionRequest {
  ra: number;
  dec: number;
  radius: number;
  objectName?: string | null;
  objectId?: string | null;
  question?: string;
  kind?: AiQuestionKind;
}

export interface AiCitation {
  id: string;
  title: string;
  year?: number | null;
  authors: string[];
  sourceUrl?: string | null;
  doi?: string | null;
  arxivId?: string | null;
  adsBibcode?: string | null;
  citationCount?: number | null;
}

export interface AiRegionResponse {
  answer: string;
  kind: AiQuestionKind;
  mode: "extractive" | "generative";
  paperCount: number;
  citations: AiCitation[];
  warnings: string[];
  timestamp: string;
}

export function recordToCitation(r: ScientificRecord): AiCitation {
  return {
    id: r.id,
    title: r.title,
    year: r.publicationYear,
    authors: r.authors.slice(0, 6),
    sourceUrl:
      r.sourceUrl ||
      (r.doi ? `https://doi.org/${r.doi}` : null) ||
      (r.arxivId ? `https://arxiv.org/abs/${r.arxivId}` : null),
    doi: r.doi,
    arxivId: r.arxivId,
    adsBibcode: r.adsBibcode,
    citationCount: r.citationCount,
  };
}
