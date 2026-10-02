"use client";

import { useSkyStore } from "@/lib/store/sky-store";
import { LAYERS } from "@/lib/sky/layers";
import { useLocaleStore } from "@/lib/store/locale-store";
import { useProgressStore } from "@/lib/store/progress-store";

export default function LayersPanel() {
  const { layers, layersPanelOpen, toggleLayer, setLayersPanelOpen } =
    useSkyStore();
  const t = useLocaleStore((s) => s.t);
  const track = useProgressStore((s) => s.track);

  return (
    <div className="pointer-events-auto">
      <button
        type="button"
        onClick={() => setLayersPanelOpen(!layersPanelOpen)}
        className="ctrl-chip flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
        title={t("layers")}
      >
        <span aria-hidden>☰</span>
        {t("layers")}
      </button>

      {layersPanelOpen && (
        <div className="absolute right-0 top-full mt-2 w-[min(16rem,calc(100vw-1.5rem))] max-h-[min(70vh,28rem)] overflow-y-auto ui-panel rounded-xl p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Sky layers
            </span>
            <button
              type="button"
              onClick={() => setLayersPanelOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1">
            {LAYERS.map((layer) => (
              <li key={layer.id}>
                <label className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-cyan-950/40 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={!!layers[layer.id]}
                    onChange={() => {
                      const turningOn = !layers[layer.id];
                      toggleLayer(layer.id);
                      if (turningOn && layer.id === "constellations") {
                        track({ type: "constellations" });
                      }
                    }}
                    className="mt-0.5 accent-cyan-500"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-cyan-50">
                      {layer.label}
                    </span>
                    <span className="block text-[10px] text-zinc-500 leading-snug">
                      {layer.description}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 px-2 text-[10px] text-zinc-600 leading-relaxed">
            Scientific density is a quantitative view of catalog interest — not
            a ranking of scientific importance.
          </p>
        </div>
      )}
    </div>
  );
}
