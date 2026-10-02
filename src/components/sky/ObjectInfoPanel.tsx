"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSkyStore } from "@/lib/store/sky-store";
import { typeLabel } from "@/data/objects";
import { formatRA, formatDec } from "@/lib/coordinates/format";
import { fetchRegionCount } from "@/lib/scientific/client";
import type { RegionSearchResult } from "@/lib/scientific/types";
import type { AstronomicalObject } from "@/data/objects";
import SapiensAIPanel from "@/components/ai/SapiensAIPanel";
import AgentChatPanel from "@/components/ai/AgentChatPanel";
import { useLocaleStore } from "@/lib/store/locale-store";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { useProgressStore } from "@/lib/store/progress-store";

export default function ObjectInfoPanel() {
  const { selectedObject, selectedRa, selectedDec, setSelected, getFovRadius } =
    useSkyStore();
  const t = useLocaleStore((s) => s.t);
  const { isFavorite, toggleFavorite, pushRecent } = useFavoritesStore();
  const track = useProgressStore((s) => s.track);

  const [sci, setSci] = useState<RegionSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const ra = selectedObject?.ra ?? selectedRa;
  const dec = selectedObject?.dec ?? selectedDec;

  useEffect(() => {
    if (ra === null || dec === null) {
      setSci(null);
      setError(null);
      return;
    }
    setExpanded(true);

    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const radius = getFovRadius();
        const result = await fetchRegionCount({
          ra,
          dec,
          radius,
          objectName: selectedObject?.name ?? selectedObject?.commonNames?.[0],
          objectId: selectedObject?.id,
        });
        if (!cancelled) setSci(result);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load literature");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [ra, dec, selectedObject, getFovRadius]);

  if (!selectedObject && selectedRa === null) return null;

  const isObject = !!selectedObject;
  const papersHref =
    ra !== null && dec !== null
      ? `/sky/${ra.toFixed(5)}/${dec.toFixed(5)}/papers?radius=${getFovRadius().toFixed(3)}${
          selectedObject?.name
            ? `&objectName=${encodeURIComponent(selectedObject.name)}`
            : ""
        }`
      : "#";

  const title = isObject ? selectedObject!.name : t("region");

  useEffect(() => {
    if (!selectedObject) return;
    pushRecent({
      id: selectedObject.id,
      name: selectedObject.name,
      type: selectedObject.type,
      ra: selectedObject.ra,
      dec: selectedObject.dec,
    });
    track({
      type: "select_object",
      objectId: selectedObject.id,
      objectType: selectedObject.type,
    });
  }, [selectedObject, pushRecent, track]);

  return (
    <>
      {/* Desktop floating card */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[110%] pointer-events-auto z-20">
        <PanelCard
          isObject={isObject}
          title={title}
          selectedObject={selectedObject}
          ra={ra}
          dec={dec}
          sci={sci}
          loading={loading}
          error={error}
          papersHref={papersHref}
          onClose={() => setSelected(null, null)}
          isFav={selectedObject ? isFavorite(selectedObject.id) : false}
          onToggleFav={() => {
            if (!selectedObject) return;
            const was = isFavorite(selectedObject.id);
            toggleFavorite({
              id: selectedObject.id,
              name: selectedObject.name,
              type: selectedObject.type,
              ra: selectedObject.ra,
              dec: selectedObject.dec,
            });
            if (!was) track({ type: "favorite" });
          }}
          labels={{
            literature: t("literature"),
            explore: t("exploreArticles"),
            searching: t("searchingLiterature"),
            region: t("region"),
            close: t("close"),
            save: t("addFavorite"),
            saved: t("removeFavorite"),
          }}
        />
      </div>

      {/* Mobile bottom sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-30 pointer-events-auto pb-[env(safe-area-inset-bottom)]">
        <div className="ui-panel rounded-t-2xl border-t text-[var(--text-primary)]">
          <div className="w-full flex flex-col items-center pt-2">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="flex flex-col items-center w-full"
              aria-expanded={expanded}
            >
              <span className="w-10 h-1 rounded-full bg-zinc-600 mb-2" />
            </button>
            <div className="w-full px-4 flex items-center justify-between gap-2 pb-2">
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="min-w-0 text-left flex-1"
              >
                <div className="text-[10px] uppercase tracking-widest text-cyan-500">
                  {isObject ? typeLabel(selectedObject!.type) : "Region"}
                </div>
                <div className="text-base font-semibold text-white truncate">
                  {title}
                </div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                {sci && (
                  <span className="text-sm text-cyan-200 font-medium">
                    📚 {sci.publicationCount.toLocaleString()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelected(null, null)}
                  className="text-zinc-500 hover:text-zinc-300 text-sm px-2 py-1"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {expanded && (
            <div className="px-4 pb-4 max-h-[55vh] overflow-y-auto overscroll-contain">
              <div className="space-y-1 font-mono text-xs text-cyan-100/90">
                {ra !== null && dec !== null && (
                  <div>
                    RA <span className="text-white">{formatRA(ra)}</span>
                    {" · "}
                    DEC <span className="text-white">{formatDec(dec)}</span>
                  </div>
                )}
                {isObject && selectedObject!.magnitude !== undefined && (
                  <div>
                    Mag{" "}
                    <span className="text-white">
                      {selectedObject!.magnitude.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {isObject && selectedObject!.description && (
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {selectedObject!.description}
                </p>
              )}

              <div className="mt-3">
                {loading && (
                  <div className="text-xs text-cyan-300/70 animate-pulse">
                    Searching literature…
                  </div>
                )}
                {error && <div className="text-xs text-amber-400">{error}</div>}
                {!loading && sci && (
                  <>
                    <div className="text-[11px] text-zinc-500">
                      ADS {sci.sources.ads} · arXiv {sci.sources.arxiv}
                    </div>
                    {sci.publicationCount > 0 && (
                      <Link
                        href={papersHref}
                        className="mt-2 block w-full text-center text-sm py-2.5 rounded-lg bg-cyan-900/50 active:bg-cyan-800/60 text-cyan-100 border border-cyan-700/40 transition"
                      >
                        Explore articles →
                      </Link>
                    )}
                  </>
                )}
              </div>

              <SapiensAIPanel />
              <AgentChatPanel />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PanelCard({
  isObject,
  title,
  selectedObject,
  ra,
  dec,
  sci,
  loading,
  error,
  papersHref,
  onClose,
  isFav,
  onToggleFav,
  labels,
}: {
  isObject: boolean;
  title: string;
  selectedObject: AstronomicalObject | null;
  ra: number | null;
  dec: number | null;
  sci: RegionSearchResult | null;
  loading: boolean;
  error: string | null;
  papersHref: string;
  onClose: () => void;
  isFav: boolean;
  onToggleFav: () => void;
  labels: {
    literature: string;
    explore: string;
    searching: string;
    region: string;
    close: string;
    save: string;
    saved: string;
  };
}) {
  return (
    <div className="ui-panel rounded-2xl px-5 py-4 min-w-[280px] max-w-[340px] max-h-[min(70vh,560px)] overflow-y-auto">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-cyan-500 mb-0.5">
            {isObject && selectedObject
              ? typeLabel(selectedObject.type)
              : labels.region}
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">
            {title}
          </h2>
          {isObject &&
            selectedObject?.commonNames &&
            selectedObject.commonNames.length > 0 && (
              <div className="text-xs text-zinc-400 mt-0.5">
                {selectedObject.commonNames.slice(0, 3).join(" · ")}
              </div>
            )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isObject && (
            <button
              type="button"
              onClick={onToggleFav}
              className={`text-sm px-1.5 ${isFav ? "text-amber-300" : "text-zinc-500 hover:text-amber-200"}`}
              title={isFav ? labels.saved : labels.save}
              aria-label={isFav ? labels.saved : labels.save}
            >
              {isFav ? "★" : "☆"}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-sm"
            aria-label={labels.close}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-1 font-mono text-sm text-cyan-100/90 mt-3">
        {ra !== null && (
          <div>
            RA <span className="text-white">{formatRA(ra)}</span>
          </div>
        )}
        {dec !== null && (
          <div>
            DEC <span className="text-white">{formatDec(dec)}</span>
          </div>
        )}
        {isObject && selectedObject?.magnitude !== undefined && (
          <div>
            Mag{" "}
            <span className="text-white">
              {selectedObject.magnitude.toFixed(2)}
            </span>
          </div>
        )}
        {isObject && selectedObject?.constellation && (
          <div className="text-zinc-400">{selectedObject.constellation}</div>
        )}
      </div>

      {isObject && selectedObject?.description && (
        <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
          {selectedObject.description}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-cyan-900/40">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          {labels.literature}
        </div>
        {loading && (
          <div className="text-sm text-cyan-300/70 animate-pulse">
            {labels.searching}
          </div>
        )}
        {error && <div className="text-sm text-amber-400">{error}</div>}
        {!loading && sci && (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-cyan-200">
                📚 {sci.publicationCount.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500">{sci.status}</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              ADS {sci.sources.ads} · arXiv {sci.sources.arxiv}
            </div>
            {sci.publicationCount > 0 && (
              <Link
                href={papersHref}
                className="mt-3 block w-full text-center text-sm py-2 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/60 text-cyan-100 border border-cyan-700/40 transition"
              >
                {labels.explore}
              </Link>
            )}
          </>
        )}
        {!loading && !sci && !error && (
          <div className="text-sm text-zinc-500">—</div>
        )}
      </div>

      <SapiensAIPanel />
      <AgentChatPanel />
    </div>
  );
}
