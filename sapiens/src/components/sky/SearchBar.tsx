"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSkyStore } from "@/lib/store/sky-store";
import { searchObjects, typeLabel } from "@/data/objects";
import { useLocaleStore } from "@/lib/store/locale-store";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { useProgressStore } from "@/lib/store/progress-store";

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    searchQuery,
    searchResults,
    searchOpen,
    setSearchQuery,
    setSearchResults,
    setSearchOpen,
    setSelectedObject,
    flyTo,
  } = useSkyStore();
  const t = useLocaleStore((s) => s.t);
  const pushRecent = useFavoritesStore((s) => s.pushRecent);
  const track = useProgressStore((s) => s.track);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchQuery(q);
      if (q.trim().length >= 1) {
        const results = searchObjects(q, 10);
        setSearchResults(results);
        setSearchOpen(true);
        if (q.trim().length === 1) track({ type: "search" });
      } else {
        setSearchResults([]);
        setSearchOpen(false);
      }
    },
    [setSearchQuery, setSearchResults, setSearchOpen]
  );

  const selectResult = useCallback(
    (obj: (typeof searchResults)[0]) => {
      setSelectedObject(obj);
      const targetFov =
        obj.type === "star" || obj.type === "black_hole" ? 8 : 15;
      flyTo(obj.ra, obj.dec, targetFov);
      setSearchQuery(obj.name);
      setSearchOpen(false);
      inputRef.current?.blur();
      pushRecent({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        ra: obj.ra,
        dec: obj.dec,
      });
    },
    [setSelectedObject, flyTo, setSearchQuery, setSearchOpen, pushRecent]
  );

  // Close on Escape / outside click handled simply
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        inputRef.current?.blur();
      }
      // Focus search with /
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-2 ui-panel-soft rounded-xl px-3 py-2 focus-within:border-[var(--accent-border)] transition shadow-sm">
        <svg
          className="w-4 h-4 text-cyan-500/80 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => searchQuery && setSearchOpen(true)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 bg-transparent text-sm text-cyan-50 placeholder:text-zinc-500 outline-none min-w-0"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          inputMode="search"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              setSearchOpen(false);
            }}
            className="text-zinc-500 hover:text-zinc-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {searchOpen && searchResults.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-cyan-800/50 rounded-lg shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto backdrop-blur-md">
          {searchResults.map((obj) => (
            <li key={obj.id}>
              <button
                onClick={() => selectResult(obj)}
                className="w-full text-left px-3 py-2.5 hover:bg-cyan-950/50 flex items-start gap-3 transition"
              >
                <span className="text-[10px] uppercase tracking-wider text-cyan-600 mt-0.5 w-16 shrink-0">
                  {typeLabel(obj.type)}
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-cyan-50 font-medium truncate">
                    {obj.name}
                  </div>
                  {obj.commonNames && obj.commonNames.length > 0 && (
                    <div className="text-xs text-zinc-500 truncate">
                      {obj.commonNames.slice(0, 2).join(" · ")}
                    </div>
                  )}
                </div>
                {obj.magnitude !== undefined && (
                  <span className="text-xs text-zinc-500 ml-auto shrink-0">
                    mag {obj.magnitude.toFixed(1)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchOpen && searchQuery && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-cyan-800/50 rounded-lg px-3 py-3 text-sm text-zinc-500 z-50">
          No objects found for “{searchQuery}”
        </div>
      )}
    </div>
  );
}
