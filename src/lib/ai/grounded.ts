/**
 * Grounded AI answers — only from provided ScientificRecords.
 * Never invent papers, DOIs, or coordinates.
 */

import type { ScientificRecord } from "@/lib/scientific/types";
import type { AiCitation, AiQuestionKind, AiRegionResponse } from "./types";
import { recordToCitation } from "./types";

function topCited(records: ScientificRecord[], n = 8): ScientificRecord[] {
  return [...records]
    .sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0))
    .slice(0, n);
}

function byYearDesc(records: ScientificRecord[]): ScientificRecord[] {
  return [...records].sort(
    (a, b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0)
  );
}

function yearRange(records: ScientificRecord[]): string {
  const years = records
    .map((r) => r.publicationYear)
    .filter((y): y is number => typeof y === "number" && y > 1800);
  if (years.length === 0) return "unknown years";
  return `${Math.min(...years)}–${Math.max(...years)}`;
}

function formatAuthorShort(r: ScientificRecord): string {
  if (!r.authors.length) return "Unknown authors";
  if (r.authors.length === 1) return r.authors[0];
  return `${r.authors[0]} et al.`;
}

function citeLine(r: ScientificRecord, i: number): string {
  const year = r.publicationYear ?? "n.d.";
  const cites =
    r.citationCount != null ? ` · ${r.citationCount} citations` : "";
  return `${i + 1}. ${r.title} (${formatAuthorShort(r)}, ${year})${cites}`;
}

export function buildExtractiveAnswer(
  records: ScientificRecord[],
  ctx: {
    kind: AiQuestionKind;
    objectName?: string | null;
    ra: number;
    dec: number;
    question?: string;
  }
): { answer: string; citations: AiCitation[] } {
  const label = ctx.objectName || `region RA ${ctx.ra.toFixed(3)}°, Dec ${ctx.dec.toFixed(3)}°`;

  if (records.length === 0) {
    return {
      answer: `No indexed publications were retrieved for ${label} from the configured sources (NASA ADS / arXiv). SAPIENS cannot invent literature. Try a named object (e.g. Andromeda, Sgr A*) or check that ADS_API_TOKEN is set.`,
      citations: [],
    };
  }

  const citations = records.slice(0, 40).map(recordToCitation);

  if (ctx.kind === "timeline") {
    const ordered = byYearDesc(records).slice(0, 15);
    const lines = ordered.map((r, i) => {
      const y = r.publicationYear ?? "n.d.";
      return `${y} — ${r.title} (${formatAuthorShort(r)})`;
    });
    return {
      answer: [
        `Timeline of indexed works about ${label} (${records.length} papers, ${yearRange(records)}).`,
        `Based only on titles/years returned by ADS/arXiv — not a complete discovery history.`,
        "",
        ...lines,
        "",
        "Sources listed below.",
      ].join("\n"),
      citations: ordered.map(recordToCitation),
    };
  }

  if (ctx.kind === "top_cited") {
    const top = topCited(records, 10);
    return {
      answer: [
        `Most cited indexed papers related to ${label} (among ${records.length} retrieved).`,
        "Citation counts come from the source API when available.",
        "",
        ...top.map((r, i) => citeLine(r, i)),
        "",
        "Sources listed below.",
      ].join("\n"),
      citations: top.map(recordToCitation),
    };
  }

  if (ctx.kind === "open_access") {
    const oa = records.filter((r) => r.openAccess);
    if (oa.length === 0) {
      return {
        answer: `Among ${records.length} indexed papers for ${label}, none were flagged as open access in the retrieved metadata.`,
        citations: [],
      };
    }
    const sample = topCited(oa, 8);
    return {
      answer: [
        `${oa.length} of ${records.length} retrieved papers for ${label} are marked open access.`,
        "",
        ...sample.map((r, i) => citeLine(r, i)),
        "",
        "Sources listed below.",
      ].join("\n"),
      citations: sample.map(recordToCitation),
    };
  }

  // summary + custom (extractive)
  const top = topCited(records, 6);
  const recent = byYearDesc(records).slice(0, 4);
  const oaCount = records.filter((r) => r.openAccess).length;
  const sources = {
    ads: records.filter((r) => r.sources.includes("ads")).length,
    arxiv: records.filter((r) => r.sources.includes("arxiv")).length,
  };

  const parts = [
    `Summary grounded in ${records.length} indexed publications about ${label}.`,
    `Coverage: ${yearRange(records)} · ADS matches: ${sources.ads} · arXiv matches: ${sources.arxiv} · Open access: ${oaCount}.`,
    "",
    "Highly cited in this sample:",
    ...top.map((r, i) => citeLine(r, i)),
    "",
    "Recent in this sample:",
    ...recent.map((r, i) => citeLine(r, i)),
  ];

  if (ctx.question && ctx.kind === "custom") {
    parts.unshift(
      `Question: ${ctx.question}`,
      "(Extractive mode: answer derived only from retrieved metadata; no external claims.)",
      ""
    );
  }

  parts.push(
    "",
    "Important: this is not a peer-reviewed review. Every item above is tied to a retrieved record. Links are in the sources list."
  );

  return {
    answer: parts.join("\n"),
    citations,
  };
}

/** Optional OpenAI-compatible chat completion using only provided paper context */
export async function buildGenerativeAnswer(
  records: ScientificRecord[],
  ctx: {
    kind: AiQuestionKind;
    objectName?: string | null;
    ra: number;
    dec: number;
    question?: string;
  }
): Promise<{ answer: string; citations: AiCitation[] } | null> {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.XAI_API_KEY;
  const baseUrl =
    process.env.AI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    (process.env.XAI_API_KEY ? "https://api.x.ai/v1" : "https://api.openai.com/v1");
  const model =
    process.env.AI_MODEL ||
    process.env.XAI_MODEL ||
    "grok-3";

  if (!apiKey || records.length === 0) return null;

  const corpus = records.slice(0, 25).map((r, i) => ({
    index: i + 1,
    title: r.title,
    authors: r.authors.slice(0, 5),
    year: r.publicationYear,
    journal: r.journal,
    citations: r.citationCount,
    openAccess: r.openAccess,
    abstract: r.abstract?.slice(0, 400) ?? null,
    doi: r.doi,
    arxivId: r.arxivId,
  }));

  const userQuestion =
    ctx.question ||
    (ctx.kind === "timeline"
      ? "Provide a chronological overview of these works."
      : ctx.kind === "top_cited"
        ? "Which works are most cited and what topics do they cover?"
        : `What do these papers tell us about ${ctx.objectName || "this sky region"}?`);

  const system = `You are SAPIENS AI, a scientific literature assistant for an astronomy sky explorer.
STRICT RULES:
- Use ONLY the papers in the JSON corpus provided by the user.
- Do NOT invent papers, DOIs, authors, coordinates, or findings not supported by the corpus.
- If the corpus is insufficient, say so clearly.
- Cite papers by their index number like [3].
- Prefer cautious language ("according to the retrieved metadata", "titles/abstracts suggest").
- End with a short "Sources" list of index numbers used.
- Answer in the same language as the user question when possible; default to English if unclear.`;

  const body = {
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: JSON.stringify({
          question: userQuestion,
          objectName: ctx.objectName,
          ra: ctx.ra,
          dec: ctx.dec,
          kind: ctx.kind,
          corpus,
        }),
      },
    ],
  };

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) {
      console.warn("[ai] generative failed", res.status);
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return null;
    return {
      answer: text,
      citations: records.slice(0, 25).map(recordToCitation),
    };
  } catch (e) {
    console.warn("[ai] generative error", e);
    return null;
  }
}

export async function answerAboutRegion(
  records: ScientificRecord[],
  ctx: {
    kind: AiQuestionKind;
    objectName?: string | null;
    ra: number;
    dec: number;
    question?: string;
    preferGenerative?: boolean;
  }
): Promise<AiRegionResponse> {
  const warnings: string[] = [];
  let mode: "extractive" | "generative" = "extractive";
  let answer = "";
  let citations: AiCitation[] = [];

  if (ctx.preferGenerative !== false) {
    const gen = await buildGenerativeAnswer(records, ctx);
    if (gen) {
      mode = "generative";
      answer = gen.answer;
      citations = gen.citations;
    } else if (process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.XAI_API_KEY) {
      warnings.push("Generative model unavailable; fell back to extractive summary.");
    }
  }

  if (!answer) {
    const ext = buildExtractiveAnswer(records, ctx);
    answer = ext.answer;
    citations = ext.citations;
    mode = "extractive";
  }

  return {
    answer,
    kind: ctx.kind,
    mode,
    paperCount: records.length,
    citations,
    warnings,
    timestamp: new Date().toISOString(),
  };
}
