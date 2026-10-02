/**
 * Export helpers — SAPIENS Phase 13
 */

import type { ScientificRecord } from "@/lib/scientific/types";
import type { AiRegionResponse } from "@/lib/ai/types";

export interface RegionExportMeta {
  ra: number;
  dec: number;
  radiusDeg?: number;
  objectName?: string | null;
  generatedAt?: string;
  source?: string;
}

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function papersToCsv(records: ScientificRecord[]): string {
  const header = [
    "title",
    "authors",
    "year",
    "journal",
    "doi",
    "arxiv_id",
    "ads_bibcode",
    "citations",
    "open_access",
    "sources",
    "url",
  ];
  const rows = records.map((r) =>
    [
      r.title,
      r.authors.join("; "),
      r.publicationYear ?? "",
      r.journal ?? "",
      r.doi ?? "",
      r.arxivId ?? "",
      r.adsBibcode ?? "",
      r.citationCount ?? "",
      r.openAccess ? "yes" : "no",
      r.sources.join("|"),
      r.sourceUrl ??
        (r.doi ? `https://doi.org/${r.doi}` : "") ??
        (r.arxivId ? `https://arxiv.org/abs/${r.arxivId}` : ""),
    ]
      .map((c) => csvEscape(String(c)))
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export function papersToMarkdown(
  records: ScientificRecord[],
  meta: RegionExportMeta
): string {
  const when = meta.generatedAt ?? new Date().toISOString();
  const label =
    meta.objectName ||
    `RA ${meta.ra.toFixed(4)}°, Dec ${meta.dec.toFixed(4)}°`;
  const lines = [
    `# SAPIENS literature export`,
    ``,
    `- **Target:** ${label}`,
    `- **Coordinates:** RA ${meta.ra.toFixed(5)}°, Dec ${meta.dec.toFixed(5)}°`,
    meta.radiusDeg != null ? `- **Radius:** ${meta.radiusDeg}°` : null,
    `- **Papers:** ${records.length}`,
    `- **Generated:** ${when}`,
    `- **Note:** Metadata from ADS/arXiv via SAPIENS — verify before citation.`,
    ``,
    `## Records`,
    ``,
  ].filter(Boolean) as string[];

  records.forEach((r, i) => {
    const year = r.publicationYear ?? "n.d.";
    const authors =
      r.authors.length > 0
        ? r.authors.slice(0, 6).join(", ") +
          (r.authors.length > 6 ? " et al." : "")
        : "Unknown";
    lines.push(`### ${i + 1}. ${r.title}`);
    lines.push(`${authors} (${year})`);
    if (r.journal) lines.push(`*${r.journal}*`);
    if (r.citationCount != null) lines.push(`Citations: ${r.citationCount}`);
    if (r.doi) lines.push(`- DOI: https://doi.org/${r.doi}`);
    if (r.arxivId) lines.push(`- arXiv: https://arxiv.org/abs/${r.arxivId}`);
    if (r.adsBibcode)
      lines.push(
        `- ADS: https://ui.adsabs.harvard.edu/abs/${r.adsBibcode}/abstract`
      );
    lines.push("");
  });

  return lines.join("\n");
}

export function papersToJson(
  records: ScientificRecord[],
  meta: RegionExportMeta
): string {
  return JSON.stringify(
    {
      meta: {
        ...meta,
        generatedAt: meta.generatedAt ?? new Date().toISOString(),
        generator: "SAPIENS",
        paperCount: records.length,
      },
      records,
    },
    null,
    2
  );
}

export function aiAnswerToMarkdown(
  result: AiRegionResponse,
  meta: RegionExportMeta
): string {
  const label =
    meta.objectName ||
    `RA ${meta.ra.toFixed(4)}°, Dec ${meta.dec.toFixed(4)}°`;
  const lines = [
    `# SAPIENS AI — ${label}`,
    ``,
    `- Mode: ${result.mode}`,
    `- Papers grounded: ${result.paperCount}`,
    `- Generated: ${result.timestamp}`,
    ``,
    `## Answer`,
    ``,
    result.answer,
    ``,
    `## Sources`,
    ``,
  ];
  result.citations.forEach((c, i) => {
    const link = c.sourceUrl || (c.doi ? `https://doi.org/${c.doi}` : "");
    lines.push(
      `${i + 1}. ${c.title}${c.year ? ` (${c.year})` : ""}${link ? ` — ${link}` : ""}`
    );
  });
  lines.push(
    "",
    "_Answer grounded in retrieved literature only. SAPIENS does not invent papers._"
  );
  return lines.join("\n");
}

export function shareTextForRegion(meta: RegionExportMeta, paperCount?: number): string {
  const label =
    meta.objectName ||
    `RA ${meta.ra.toFixed(3)}°, Dec ${meta.dec.toFixed(3)}°`;
  const count =
    paperCount != null ? ` — ${paperCount} indexed publications` : "";
  return `SAPIENS: ${label}${count}\nExplore the Universe. Discover what humanity already knows about it.`;
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/plain;charset=utf-8"
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function safeFilename(base: string): string {
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "sapiens-export";
}
