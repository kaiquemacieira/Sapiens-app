"use client";

import type { ScientificRecord } from "@/lib/scientific/types";

interface Props {
  record: ScientificRecord;
}

export default function PaperCard({ record: r }: Props) {
  return (
    <article className="border border-cyan-900/40 rounded-xl bg-black/40 px-5 py-4 hover:border-cyan-700/50 transition group">
      <h2 className="text-base font-medium text-white leading-snug group-hover:text-cyan-50">
        {r.title}
      </h2>

      <p className="text-sm text-zinc-400 mt-1.5">
        {r.authors.slice(0, 8).join(", ")}
        {r.authors.length > 8 ? " et al." : ""}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-500">
        {(r.journal || r.publicationYear) && (
          <span>
            {[r.journal, r.publicationYear].filter(Boolean).join(" · ")}
          </span>
        )}
        {r.citationCount != null && r.citationCount > 0 && (
          <span className="text-zinc-400">
            {r.citationCount.toLocaleString()} citation
            {r.citationCount !== 1 ? "s" : ""}
          </span>
        )}
        {r.openAccess && (
          <span className="text-emerald-400 font-medium">Open Access</span>
        )}
        {r.sources.map((s) => (
          <span
            key={s}
            className="uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-400"
          >
            {s}
          </span>
        ))}
      </div>

      {r.abstract && (
        <p className="text-sm text-zinc-400 mt-3 line-clamp-3 leading-relaxed">
          {r.abstract}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {r.doi && (
          <a
            href={`https://doi.org/${r.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/50 transition"
          >
            DOI
          </a>
        )}
        {r.arxivId && (
          <a
            href={`https://arxiv.org/abs/${r.arxivId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/50 transition"
          >
            arXiv
          </a>
        )}
        {r.pdfUrl && (
          <a
            href={r.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/40 transition"
          >
            PDF
          </a>
        )}
        {r.adsBibcode && (
          <a
            href={`https://ui.adsabs.harvard.edu/abs/${r.adsBibcode}/abstract`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/50 transition"
          >
            NASA ADS
          </a>
        )}
        {r.sourceUrl && !r.doi && !r.arxivId && !r.adsBibcode && (
          <a
            href={r.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition"
          >
            View article
          </a>
        )}
      </div>
    </article>
  );
}
