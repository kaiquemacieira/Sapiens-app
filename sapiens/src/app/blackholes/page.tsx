"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import BlackHoleView from "@/components/blackholes/BlackHoleView";
import KerrView from "@/components/blackholes/KerrView";
import { useLocaleStore } from "@/lib/store/locale-store";
import { BLACK_HOLES, RADII } from "@/lib/blackholes/catalog";
import {
  OBSERVATIONS,
  horizonOverRs,
  iscoOverRs,
  photonOrbitOverRs,
} from "@/lib/blackholes/kerr";
import {
  formatLength,
  gravitationalTimeFactor,
  lightDeflectionRadians,
  schwarzschildRadiusFromSolarMasses,
  M_SUN,
} from "@/lib/relativity/physics";
import { hawkingTemperatureKelvin } from "@/lib/qg/concepts";

export default function BlackHolesPage() {
  const locale = useLocaleStore((s) => s.locale);
  const initLocale = useLocaleStore((s) => s.init);
  const lang = locale === "pt" ? "pt" : "en";

  const [bhId, setBhId] = useState("sgrA");
  const [showDisk, setShowDisk] = useState(true);
  const [animate, setAnimate] = useState(true);
  const [rOverRs, setROverRs] = useState(6);
  const [aStar, setAStar] = useState(0.7);
  const [mode, setMode] = useState<"schwarzschild" | "kerr">("kerr");

  useEffect(() => {
    initLocale();
    document.body.classList.add("literature-page");
    return () => document.body.classList.remove("literature-page");
  }, [initLocale]);

  const bh = BLACK_HOLES.find((b) => b.id === bhId) ?? BLACK_HOLES[2];
  const rs = schwarzschildRadiusFromSolarMasses(bh.massSun);
  const rsFmt = formatLength(rs);
  const massKg = bh.massSun * M_SUN;
  const r = rOverRs * rs;
  const timeFactor = gravitationalTimeFactor(r, massKg);
  const deflect = lightDeflectionRadians(massKg, r);
  const deflectDeg = (deflect * 180) / Math.PI;
  const T_H = hawkingTemperatureKelvin(bh.massSun);

  const rPlus = horizonOverRs(aStar);
  const rIsco = iscoOverRs(aStar);
  const rPh = photonOrbitOverRs(aStar);

  const scales = useMemo(
    () => [
      {
        label: lang === "pt" ? "Horizonte (Rₛ)" : "Horizon (Rₛ)",
        k: RADII.horizon,
        color: "#22d3ee",
      },
      {
        label: lang === "pt" ? "Esfera de fótons" : "Photon sphere",
        k: RADII.photonSphere,
        color: "#a78bfa",
      },
      {
        label: "ISCO",
        k: RADII.isco,
        color: "#38bdf8",
      },
    ],
    [lang]
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] literature-scroll">
      <header className="sticky top-0 z-20 border-b border-[var(--panel-border)] bg-[var(--panel-bg)] backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/"
              className="text-sm text-[var(--accent)] hover:opacity-80"
            >
              ← SAPIENS
            </Link>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {lang === "pt" ? "Buracos negros" : "Black holes"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
          {lang === "pt"
            ? "Schwarzschild e Kerr (spin), raios característicos, temperatura de Hawking e evidências observacionais. Modelos educativos."
            : "Schwarzschild and Kerr (spin), characteristic radii, Hawking temperature, and observational evidence. Educational models."}
        </p>

        {/* Mode toggle */}
        <div className="flex gap-2">
          {(["schwarzschild", "kerr"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`text-xs px-3 py-1.5 rounded-lg border capitalize ${
                mode === m
                  ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
                  : "border-[var(--panel-border)] text-[var(--text-muted)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            {mode === "schwarzschild" ? (
              <BlackHoleView
                viewRs={Math.max(8, rOverRs + 1)}
                showDisk={showDisk}
                animate={animate}
              />
            ) : (
              <KerrView aStar={aStar} showDisk={showDisk} />
            )}
            <div className="mt-3 flex flex-wrap gap-3 justify-center text-xs text-[var(--text-muted)]">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showDisk}
                  onChange={(e) => setShowDisk(e.target.checked)}
                  className="accent-cyan-500"
                />
                {lang === "pt" ? "Disco" : "Disk"}
              </label>
              {mode === "schwarzschild" && (
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={animate}
                    onChange={(e) => setAnimate(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  {lang === "pt" ? "Animar" : "Animate"}
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="ui-panel rounded-xl p-4 space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {lang === "pt" ? "Objeto" : "Object"}
              </label>
              <select
                value={bhId}
                onChange={(e) => setBhId(e.target.value)}
                className="w-full text-sm rounded-lg bg-black/30 border border-[var(--panel-border)] px-2 py-1.5 text-[var(--text-primary)]"
              >
                {BLACK_HOLES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {bh.notes[lang]}
              </p>
              <div className="font-mono text-sm text-[var(--text-secondary)] space-y-1">
                <div>
                  M ≈{" "}
                  <span className="text-[var(--text-primary)]">
                    {bh.massSun >= 1000
                      ? bh.massSun.toExponential(2)
                      : bh.massSun}
                  </span>{" "}
                  M☉
                </div>
                <div>
                  Rₛ ≈{" "}
                  <span className="text-[var(--text-primary)]">
                    {rsFmt.value.toPrecision(4)} {rsFmt.unit}
                  </span>
                </div>
                <div>
                  T_H ≈{" "}
                  <span className="text-[var(--text-primary)]">
                    {T_H.toExponential(2)} K
                  </span>
                </div>
              </div>
              {bh.skyObjectId && (
                <Link
                  href="/?object=Sgr%20A*"
                  className="inline-block text-xs text-[var(--accent)] hover:underline"
                >
                  {lang === "pt"
                    ? "Ver no planetário →"
                    : "View in planetarium →"}
                </Link>
              )}
            </div>

            {mode === "kerr" && (
              <div className="ui-panel rounded-xl p-4 space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  {lang === "pt" ? "Spin adimensional" : "Dimensionless spin"} a*
                  = {aStar.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={0.998}
                  step={0.002}
                  value={aStar}
                  onChange={(e) => setAStar(Number(e.target.value))}
                  className="w-full accent-fuchsia-500"
                />
                <div className="font-mono text-[11px] text-[var(--text-secondary)] space-y-1">
                  <div>
                    r₊ / Rₛ = {rPlus.toFixed(3)}{" "}
                    <span className="text-[var(--text-muted)]">
                      ({lang === "pt" ? "horizonte" : "horizon"})
                    </span>
                  </div>
                  <div>
                    r_γ / Rₛ ≈ {rPh.toFixed(3)}{" "}
                    <span className="text-[var(--text-muted)]">
                      ({lang === "pt" ? "fótons" : "photon"})
                    </span>
                  </div>
                  <div>
                    ISCO / Rₛ = {rIsco.toFixed(3)}{" "}
                    <span className="text-[var(--text-muted)]">(prograde)</span>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  {lang === "pt"
                    ? "Com spin alto, o ISCO prógrado aproxima-se do horizonte — o disco pode estender-se mais para dentro."
                    : "At high spin, prograde ISCO approaches the horizon — the disk can extend farther in."}
                </p>
              </div>
            )}

            {mode === "schwarzschild" && (
              <div className="ui-panel rounded-xl p-4 space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  {lang === "pt"
                    ? "Raios (a*=0)"
                    : "Radii (a*=0)"}
                </div>
                <ul className="space-y-2">
                  {scales.map((s) => {
                    const len = formatLength(s.k * rs);
                    return (
                      <li
                        key={s.label}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: s.color }}
                          />
                          {s.label}
                        </span>
                        <span className="font-mono text-[var(--text-primary)] text-xs">
                          {s.k} Rₛ ≈ {len.value.toPrecision(3)} {len.unit}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Static observer */}
        <section className="ui-panel rounded-xl p-4 space-y-3">
          <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            {lang === "pt" ? "Observador estático em" : "Static observer at"} r /
            Rₛ = {rOverRs.toFixed(2)}
          </label>
          <input
            type="range"
            min={1.05}
            max={30}
            step={0.05}
            value={rOverRs}
            onChange={(e) => setROverRs(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="grid sm:grid-cols-2 gap-3 font-mono text-sm">
            <div className="rounded-lg border border-[var(--panel-border)] p-3">
              <div className="text-[10px] text-[var(--text-muted)]">
                dτ/dt = √(1 − Rₛ/r)
              </div>
              <div className="text-lg text-[var(--text-primary)]">
                {timeFactor.toFixed(6)}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--panel-border)] p-3">
              <div className="text-[10px] text-[var(--text-muted)]">
                {lang === "pt"
                  ? "Deflexão (campo fraco)"
                  : "Deflection (weak field)"}
              </div>
              <div className="text-lg text-[var(--text-primary)]">
                {Number.isFinite(deflectDeg)
                  ? `${deflectDeg.toPrecision(3)}°`
                  : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Observations */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "Evidências observacionais"
              : "Observational evidence"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {OBSERVATIONS.map((o) => (
              <div key={o.id} className="ui-panel rounded-xl p-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  {o.title[lang]}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {o.body[lang]}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-3 text-[11px] text-[var(--text-muted)]">
          <div className="ui-panel rounded-xl p-3 leading-relaxed">
            <div className="text-[var(--text-secondary)] font-medium mb-1">
              {lang === "pt" ? "Ergosfera" : "Ergosphere"}
            </div>
            {lang === "pt"
              ? "Região (Kerr) onde nada pode permanecer estático; permite processos do tipo Penrose de extração de energia."
              : "Region (Kerr) where nothing can remain static; enables Penrose-like energy extraction."}
          </div>
          <div className="ui-panel rounded-xl p-3 leading-relaxed">
            <div className="text-[var(--text-secondary)] font-medium mb-1">
              ISCO
            </div>
            {lang === "pt"
              ? "Depende do spin: de 3 Rₛ (Schwarzschild) até ~0,5 Rₛ (prógrado extremo)."
              : "Depends on spin: from 3 Rₛ (Schwarzschild) down to ~0.5 Rₛ (extreme prograde)."}
          </div>
          <div className="ui-panel rounded-xl p-3 leading-relaxed">
            <div className="text-[var(--text-secondary)] font-medium mb-1">
              Hawking
            </div>
            {lang === "pt"
              ? "Temperatura inversamente proporcional à massa — BN estelares e SMBH são extremamente frios."
              : "Temperature inversely proportional to mass — stellar and SMBH holes are extremely cold."}
          </div>
        </section>

        <p className="text-[11px] text-[var(--text-muted)]">
          <Link href="/relativity" className="text-[var(--accent)]">
            {lang === "pt" ? "Relatividade" : "Relativity"}
          </Link>
          {" · "}
          <Link href="/quantum-gravity" className="text-[var(--accent)]">
            {lang === "pt" ? "Gravidade quântica" : "Quantum gravity"}
          </Link>
          {" · "}
          <Link href="/simulate" className="text-[var(--accent)]">
            N-body
          </Link>
          {" · "}
          <Link href="/" className="text-[var(--accent)]">
            {lang === "pt" ? "Céu" : "Sky"}
          </Link>
        </p>
      </main>
    </div>
  );
}
