"use client";

import { useState } from "react";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { useLocaleStore } from "@/lib/store/locale-store";
import { useSkyStore } from "@/lib/store/sky-store";
import { ALL_OBJECTS } from "@/data/objects";

export default function FavoritesPanel() {
  const [open, setOpen] = useState(false);
  const t = useLocaleStore((s) => s.t);
  const { favorites, recent } = useFavoritesStore();
  const { flyTo, setSelectedObject } = useSkyStore();

  const goTo = (id: string, ra: number, dec: number) => {
    const obj = ALL_OBJECTS.find((o) => o.id === id);
    if (obj) {
      setSelectedObject(obj);
      flyTo(obj.ra, obj.dec, obj.type === "star" ? 8 : 15);
    } else {
      flyTo(ra, dec, 12);
    }
    setOpen(false);
  };

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="ctrl-chip flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
        title={t("favorites")}
        aria-label={t("favorites")}
      >
        <span aria-hidden>★</span>
        <span className="hidden sm:inline">{t("favorites")}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(18rem,calc(100vw-1.5rem))] max-h-[min(70vh,24rem)] overflow-y-auto ui-panel rounded-xl p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              {t("favorites")}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[var(--text-muted)] text-xs"
            >
              ✕
            </button>
          </div>

          {favorites.length === 0 ? (
            <p className="text-[11px] text-[var(--text-muted)] mb-3">
              {t("noFavorites")}
            </p>
          ) : (
            <ul className="space-y-1 mb-3">
              {favorites.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => goTo(f.id, f.ra, f.dec)}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--accent-muted)] text-sm text-[var(--text-primary)]"
                  >
                    <span className="font-medium">{f.name}</span>
                    <span className="block text-[10px] text-[var(--text-muted)] uppercase">
                      {f.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {recent.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
                {t("recent")}
              </div>
              <ul className="space-y-1">
                {recent.slice(0, 6).map((r) => (
                  <li key={`r-${r.id}`}>
                    <button
                      type="button"
                      onClick={() => goTo(r.id, r.ra, r.dec)}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--accent-muted)] text-sm text-[var(--text-secondary)]"
                    >
                      {r.name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
