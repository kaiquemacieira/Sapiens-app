"use client";

import { useEffect, useMemo, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { fetchRegionPapers } from "@/lib/scientific/client";
import type {
  ScientificRecord,
  PaperSort,
  PaperSourceFilter,
} from "@/lib/scientific/types";
import { formatRA, formatDec, formatFOV } from "@/lib/coordinates/format";
import PaperCard from "@/components/literature/PaperCard";
import ThemeToggle from "@/components/theme/ThemeToggle";
import ExportMenu from "@/components/export/ExportMenu";
import ShareRichButton from "@/components/export/ShareRichButton";
import { useProgressStore } from "@/lib/store/progress-store";

interface PageProps {
  params: Promise<{ ra: string; dec: string }>;
}

const SORT_OPTIONS: { value: PaperSort; label: string }[] = [
  { value: "citations", label: "Citations" },
  { value: "year_desc", label: "Newest" },
  { value: "year_asc", label: "Oldest" },
  { value: "relevance", label: "Relevance" },
  { value: "title", label: "Title A–Z" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
        active
          ? "bg-cyan-900/50 border-cyan-600 text-cyan-100"
          : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function LiteraturePage({ params }: PageProps) {
  const { ra: raStr, dec: decStr } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const ra = Number(raStr);
  const dec = Number(decStr);
  const radius = Number(searchParams.get("radius") ?? "0.5");
  const objectName = searchParams.get("objectName");

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const sort = (searchParams.get("sort") as PaperSort) || "citations";
  const source = (searchParams.get("source") as PaperSourceFilter) || "all";
  const openAccess = searchParams.get("openAccess") === "1";
  const preprint = searchParams.get("preprint") === "1";
  const yearFrom = searchParams.get("yearFrom")
    ? Number(searchParams.get("yearFrom"))
    : null;
  const yearTo = searchParams.get("yearTo")
    ? Number(searchParams.get("yearTo"))
    : null;

  const [records, setRecords] = useState<ScientificRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [sources, setSources] = useState({ ads: 0, arxiv: 0 });
  const [yearHistogram, setYearHistogram] = useState<Record<number, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") sp.delete(k);
        else sp.set(k, v);
      }
      if (!("page" in patch)) sp.delete("page");
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRegionPapers({
          ra,
          dec,
          radius,
          page,
          limit,
          openAccess,
          preprint,
          yearFrom,
          yearTo,
          source,
          sort,
          objectName,
        });
        if (!cancelled) {
          setRecords(data.records);
          setTotal(data.total);
          setStatus(data.status);
          setSources(data.sources);
          setYearHistogram(data.yearHistogram ?? {});
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load papers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    ra,
    dec,
    radius,
    page,
    openAccess,
    preprint,
    yearFrom,
    yearTo,
    source,
    sort,
    objectName,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const yearButtons = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { label: "Any year", from: null as number | null, to: null as number | null },
      { label: "Last 12 months", from: currentYear - 1, to: currentYear },
      { label: "Last 5 years", from: currentYear - 4, to: currentYear },
      { label: "Last 10 years", from: currentYear - 9, to: currentYear },
      { label: "Before 2000", from: null, to: 1999 },
    ];
  }, []);

  const histogramEntries = useMemo(() => {
    return Object.entries(yearHistogram)
      .map(([y, c]) => [Number(y), c] as [number, number])
      .sort((a, b) => b[0] - a[0])
      .slice(0, 12);
  }, [yearHistogram]);

  const maxHist = Math.max(1, ...histogramEntries.map(([, c]) => c));

  useEffect(() => {
    document.body.classList.add("literature-page");
    useProgressStore.getState().track({ type: "literature" });
    return () => document.body.classList.remove("literature-page");
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] literature-scroll">
      <header className="sticky top-0 z-20 border-b border-[var(--panel-border)] bg-[var(--panel-bg)] backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/"
                className="text-sm text-[var(--accent)] hover:opacity-80 transition"
              >
                ← Back to sky
              </Link>
              <h1 className="text-xl font-semibold text-[var(--text-primary)] mt-1">
                Literature of this region
              </h1>
              <p className="font-mono text-xs text-[var(--text-muted)] mt-1">
                RA {Number.isFinite(ra) ? formatRA(ra) : "—"} · DEC{" "}
                {Number.isFinite(dec) ? formatDec(dec) : "—"} · radius{" "}
                {formatFOV(radius)}
                {objectName ? (
                  <span className="text-[var(--accent)]"> · {objectName}</span>
                ) : null}
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <ShareRichButton
                  meta={{
                    ra,
                    dec,
                    radiusDeg: radius,
                    objectName,
                  }}
                  paperCount={total}
                />
                <ExportMenu
                  records={records}
                  meta={{
                    ra,
                    dec,
                    radiusDeg: radius,
                    objectName,
                  }}
                />
                <ThemeToggle compact />
              </div>
              <div className="text-2xl font-semibold text-[var(--text-secondary)]">
                📚 {total.toLocaleString()}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                ADS {sources.ads} · arXiv {sources.arxiv}
                {status ? ` · ${status}` : ""}
                {records.length > 0 && records.length < total
                  ? ` · exporting page (${records.length})`
                  : ""}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0 space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Access
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  active={!openAccess && !preprint}
                  onClick={() =>
                    updateParams({ openAccess: null, preprint: null })
                  }
                >
                  All
                </Chip>
                <Chip
                  active={openAccess}
                  onClick={() =>
                    updateParams({
                      openAccess: openAccess ? null : "1",
                      preprint: null,
                    })
                  }
                >
                  Open Access
                </Chip>
                <Chip
                  active={preprint}
                  onClick={() =>
                    updateParams({
                      preprint: preprint ? null : "1",
                      openAccess: null,
                    })
                  }
                >
                  Preprints
                </Chip>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Source
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "ads", "arxiv"] as PaperSourceFilter[]).map((s) => (
                  <Chip
                    key={s}
                    active={source === s}
                    onClick={() =>
                      updateParams({ source: s === "all" ? null : s })
                    }
                  >
                    {s === "all" ? "All sources" : s.toUpperCase()}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Period
              </div>
              <div className="flex flex-col gap-1.5">
                {yearButtons.map((yb) => {
                  const active =
                    (yb.from ?? null) === yearFrom &&
                    (yb.to ?? null) === yearTo;
                  return (
                    <Chip
                      key={yb.label}
                      active={active}
                      onClick={() =>
                        updateParams({
                          yearFrom:
                            yb.from != null ? String(yb.from) : null,
                          yearTo: yb.to != null ? String(yb.to) : null,
                        })
                      }
                    >
                      {yb.label}
                    </Chip>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Sort by
              </div>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="w-full text-sm bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-cyan-100 outline-none focus:border-cyan-600"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {histogramEntries.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                  Years (filtered)
                </div>
                <div className="space-y-1">
                  {histogramEntries.map(([year, count]) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() =>
                        updateParams({
                          yearFrom: String(year),
                          yearTo: String(year),
                        })
                      }
                      className="w-full flex items-center gap-2 text-[11px] text-zinc-400 hover:text-cyan-300 group"
                    >
                      <span className="w-8 text-right font-mono">{year}</span>
                      <div className="flex-1 h-1.5 bg-zinc-900 rounded overflow-hidden">
                        <div
                          className="h-full bg-cyan-700/70 group-hover:bg-cyan-500/80 transition-all"
                          style={{ width: `${(count / maxHist) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-zinc-600">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="flex-1 min-w-0">
            {loading && (
              <div className="text-cyan-300/70 animate-pulse py-16 text-center">
                Loading publications…
              </div>
            )}

            {error && (
              <div className="text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-lg px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            {!loading && !error && records.length === 0 && (
              <div className="text-zinc-500 text-center py-16">
                <p className="text-lg text-zinc-400">No publications match</p>
                <p className="mt-2 text-sm">
                  Try clearing filters or selecting a different region on the
                  sky.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateParams({
                      openAccess: null,
                      preprint: null,
                      source: null,
                      yearFrom: null,
                      yearTo: null,
                      sort: null,
                      page: null,
                    })
                  }
                  className="mt-4 text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Clear all filters
                </button>
              </div>
            )}

            <ul className="space-y-4">
              {records.map((r) => (
                <li key={r.id}>
                  <PaperCard record={r} />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10 pb-8">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() =>
                    updateParams({ page: String(Math.max(1, page - 1)) })
                  }
                  className="text-sm px-4 py-2 rounded-lg border border-zinc-700 disabled:opacity-30 hover:border-cyan-700 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-400 font-mono">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() =>
                    updateParams({
                      page: String(Math.min(totalPages, page + 1)),
                    })
                  }
                  className="text-sm px-4 py-2 rounded-lg border border-zinc-700 disabled:opacity-30 hover:border-cyan-700 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
