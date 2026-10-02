"use client";

import { useCallback, useEffect, useState } from "react";
import { useSkyStore } from "@/lib/store/sky-store";
import { useProgressStore } from "@/lib/store/progress-store";

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ObserverPanel() {
  const {
    observerMode,
    observerLocation,
    observerTimeIso,
    observerPanelOpen,
    setObserverMode,
    setObserverLocation,
    setObserverTimeIso,
    setObserverPanelOpen,
    getObserverDate,
  } = useSkyStore();
  const track = useProgressStore((s) => s.track);

  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [timeInput, setTimeInput] = useState(() =>
    toLocalInputValue(getObserverDate())
  );

  // Keep time input in sync when switching to live
  useEffect(() => {
    if (!observerTimeIso) {
      const id = setInterval(() => {
        setTimeInput(toLocalInputValue(new Date()));
      }, 30000);
      return () => clearInterval(id);
    }
  }, [observerTimeIso]);

  const useGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation not available");
      return;
    }
    setGeoStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setObserverLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          elevationMeters: pos.coords.altitude ?? 0,
        });
        setGeoStatus("Location updated");
        setTimeout(() => setGeoStatus(null), 2500);
      },
      (err) => {
        setGeoStatus(err.message || "Location denied");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [setObserverLocation]);

  return (
    <div className="pointer-events-auto">
      <button
        type="button"
        onClick={() => setObserverPanelOpen(!observerPanelOpen)}
        className={`ctrl-chip flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
          observerMode
            ? "!border-[var(--accent-border)] !text-[var(--text-primary)] !bg-[var(--accent-muted)]"
            : ""
        }`}
        title="Observer mode"
      >
        <span aria-hidden>◎</span>
        Observer
      </button>

      {observerPanelOpen && (
        <div className="absolute right-0 top-full mt-2 w-[min(18rem,calc(100vw-1.5rem))] max-h-[min(75vh,32rem)] overflow-y-auto ui-panel rounded-xl p-3 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Earth observer
            </span>
            <button
              type="button"
              onClick={() => setObserverPanelOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          </div>

          <label className="flex items-center gap-2 px-1 py-1.5 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={observerMode}
              onChange={(e) => {
                setObserverMode(e.target.checked);
                if (e.target.checked) track({ type: "observer" });
              }}
              className="accent-cyan-500"
            />
            <span className="text-sm text-cyan-50">Enable observer mode</span>
          </label>

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                Location
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] text-zinc-500">Latitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    min={-90}
                    max={90}
                    value={observerLocation.latitude}
                    onChange={(e) =>
                      setObserverLocation({
                        latitude: Number(e.target.value),
                      })
                    }
                    className="w-full mt-0.5 bg-black/60 border border-zinc-700 rounded px-2 py-1 text-cyan-100 font-mono text-xs outline-none focus:border-cyan-600"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-zinc-500">Longitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    min={-180}
                    max={180}
                    value={observerLocation.longitude}
                    onChange={(e) =>
                      setObserverLocation({
                        longitude: Number(e.target.value),
                      })
                    }
                    className="w-full mt-0.5 bg-black/60 border border-zinc-700 rounded px-2 py-1 text-cyan-100 font-mono text-xs outline-none focus:border-cyan-600"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={useGeolocation}
                className="mt-2 w-full text-xs py-1.5 rounded border border-zinc-700 text-cyan-300 hover:border-cyan-600 transition"
              >
                Use my location
              </button>
              {geoStatus && (
                <p className="mt-1 text-[10px] text-zinc-500">{geoStatus}</p>
              )}
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                Date & time
              </div>
              <input
                type="datetime-local"
                value={timeInput}
                onChange={(e) => {
                  setTimeInput(e.target.value);
                  const d = new Date(e.target.value);
                  if (!Number.isNaN(d.getTime())) {
                    setObserverTimeIso(d.toISOString());
                  }
                }}
                className="w-full bg-black/60 border border-zinc-700 rounded px-2 py-1.5 text-cyan-100 font-mono text-xs outline-none focus:border-cyan-600"
              />
              <button
                type="button"
                onClick={() => {
                  setObserverTimeIso(null);
                  setTimeInput(toLocalInputValue(new Date()));
                }}
                className="mt-2 w-full text-xs py-1.5 rounded border border-zinc-700 text-zinc-400 hover:border-cyan-700 transition"
              >
                Use live clock
              </button>
              <p className="mt-1 text-[10px] text-zinc-600">
                {observerTimeIso
                  ? "Fixed time"
                  : "Following system clock"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-zinc-600 leading-relaxed">
            Shows altitude / azimuth for the view center and selection, draws
            the local horizon, and tints the sky from the Sun&apos;s altitude.
          </p>
        </div>
      )}
    </div>
  );
}
