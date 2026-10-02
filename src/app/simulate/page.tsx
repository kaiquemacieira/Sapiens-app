"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  PRESETS,
  buildPresetState,
  getPreset,
} from "@/lib/nbody/presets";
import { stepSystem, totalEnergy, type NBodyState } from "@/lib/nbody/engine";
import NBodyCanvas from "@/components/nbody/NBodyCanvas";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import { useLocaleStore } from "@/lib/store/locale-store";

export default function SimulatePage() {
  const locale = useLocaleStore((s) => s.locale);
  const lang = locale === "pt" ? "pt" : "en";
  const initLocale = useLocaleStore((s) => s.init);

  const [presetId, setPresetId] = useState("binary");
  const [state, setState] = useState<NBodyState | null>(null);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showTrails, setShowTrails] = useState(true);
  const [energy0, setEnergy0] = useState<number | null>(null);

  const stateRef = useRef<NBodyState | null>(null);
  const runningRef = useRef(running);
  const speedRef = useRef(speed);
  runningRef.current = running;
  speedRef.current = speed;

  const preset = getPreset(presetId);

  const reset = useCallback((id: string) => {
    const s = buildPresetState(id);
    if (!s) return;
    stateRef.current = s;
    setState(s);
    setEnergy0(totalEnergy(s));
    setRunning(true);
  }, []);

  useEffect(() => {
    initLocale();
    document.body.classList.add("literature-page");
    reset(presetId);
    return () => document.body.classList.remove("literature-page");
  }, [initLocale, presetId, reset]);

  // Physics loop
  useEffect(() => {
    let raf = 0;
    const p = getPreset(presetId);
    if (!p) return;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!runningRef.current || !stateRef.current) return;
      let s = stateRef.current;
      const steps = Math.max(1, Math.round(p.stepsPerFrame * speedRef.current));
      for (let i = 0; i < steps; i++) {
        s = stepSystem(s, p.dt);
      }
      stateRef.current = s;
      setState(s);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [presetId]);

  const energy = state ? totalEnergy(state) : null;
  const energyDrift =
    energy != null && energy0 != null && Math.abs(energy0) > 1e-12
      ? ((energy - energy0) / Math.abs(energy0)) * 100
      : null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] literature-scroll">
      <header className="sticky top-0 z-20 border-b border-[var(--panel-border)] bg-[var(--panel-bg)] backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/" className="text-sm text-[var(--accent)] hover:opacity-80">
              ← SAPIENS
            </Link>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {lang === "pt" ? "Simulação N-corpos" : "N-body simulation"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <main id="main" className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
          {lang === "pt"
            ? "Motor educativo com gravidade newtoniana amortecida (unidades: M☉, UA, anos). Não substitui efemérides de pesquisa."
            : "Educational engine with softened Newtonian gravity (units: M☉, AU, years). Not a research ephemeris."}
        </p>

        <div className="grid lg:grid-cols-[1fr_240px] gap-4">
          <div className="h-[min(60vh,520px)]">
            {state && preset && (
              <NBodyCanvas
                state={state}
                cameraDistance={preset.cameraDistance}
                showTrails={showTrails}
              />
            )}
          </div>

          <aside className="space-y-3">
            <div className="ui-panel rounded-xl p-3 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                Preset
              </label>
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className="w-full text-sm rounded-lg bg-black/30 border border-[var(--panel-border)] px-2 py-1.5 text-[var(--text-primary)]"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name[lang]}
                  </option>
                ))}
              </select>
              {preset && (
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {preset.description[lang]}
                </p>
              )}
            </div>

            <div className="ui-panel rounded-xl p-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
              >
                {running
                  ? lang === "pt"
                    ? "Pausar"
                    : "Pause"
                  : lang === "pt"
                    ? "Play"
                    : "Play"}
              </button>
              <button
                type="button"
                onClick={() => reset(presetId)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--panel-border)] text-[var(--text-secondary)]"
              >
                Reset
              </button>
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] ml-auto">
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                  className="accent-cyan-500"
                />
                Trails
              </label>
            </div>

            <div className="ui-panel rounded-xl p-3 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {lang === "pt" ? "Velocidade" : "Speed"} ×{speed.toFixed(1)}
              </label>
              <input
                type="range"
                min={0.25}
                max={4}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="ui-panel rounded-xl p-3 font-mono text-[11px] text-[var(--text-secondary)] space-y-1">
              <div>
                t = {state ? state.time.toFixed(3) : "—"} yr
              </div>
              <div>
                N = {state?.bodies.length ?? "—"}
              </div>
              <div>
                E = {energy != null ? energy.toExponential(3) : "—"}
              </div>
              {energyDrift != null && (
                <div
                  className={
                    Math.abs(energyDrift) > 5
                      ? "text-amber-400"
                      : "text-[var(--text-muted)]"
                  }
                >
                  ΔE/E₀ = {energyDrift.toFixed(2)}%
                </div>
              )}
            </div>

            {state && (
              <div className="ui-panel rounded-xl p-3 max-h-40 overflow-y-auto">
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  Bodies
                </div>
                <ul className="space-y-1">
                  {state.bodies.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: b.color }}
                      />
                      {b.name}
                      <span className="text-[var(--text-muted)] ml-auto">
                        {b.mass >= 0.01
                          ? `${b.mass.toFixed(2)} M☉`
                          : `${b.mass.toExponential(1)} M☉`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
