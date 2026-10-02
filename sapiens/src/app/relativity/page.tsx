"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import MinkowskiDiagram from "@/components/relativity/MinkowskiDiagram";
import { useLocaleStore } from "@/lib/store/locale-store";
import {
  C,
  REF_MASSES,
  formatLength,
  gravitationalTimeFactor,
  lengthContraction,
  lightDeflectionRadians,
  lorentzGamma,
  schwarzschildRadiusFromSolarMasses,
  timeDilationProper,
  velocityAdditionBeta,
} from "@/lib/relativity/physics";

export default function RelativityPage() {
  const locale = useLocaleStore((s) => s.locale);
  const initLocale = useLocaleStore((s) => s.init);
  const lang = locale === "pt" ? "pt" : "en";

  const [beta, setBeta] = useState(0.6);
  const [betaU, setBetaU] = useState(0.6);
  const [massId, setMassId] = useState("sgrA");
  const [customMass, setCustomMass] = useState(4.15e6);
  const [rOverRs, setROverRs] = useState(3);

  useEffect(() => {
    initLocale();
    document.body.classList.add("literature-page");
    return () => document.body.classList.remove("literature-page");
  }, [initLocale]);

  const gamma = lorentzGamma(beta);
  const properOneYear = timeDilationProper(1, beta);
  const L = lengthContraction(1, beta);
  const w = velocityAdditionBeta(beta, betaU);

  const mSun = useMemo(() => {
    const ref = REF_MASSES.find((m) => m.id === massId);
    return massId === "custom" ? customMass : (ref?.mSun ?? 1);
  }, [massId, customMass]);

  const rs = schwarzschildRadiusFromSolarMasses(mSun);
  const rsFmt = formatLength(rs);
  const r = rOverRs * rs;
  const gravFactor = gravitationalTimeFactor(r, mSun * 1.98847e30);
  const deflect = lightDeflectionRadians(mSun * 1.98847e30, r);
  const deflectArcsec = (deflect * 180 * 3600) / Math.PI;

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
              {lang === "pt"
                ? "Relatividade (explorador)"
                : "Relativity explorer"}
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
            ? "Demonstrações educativas de relatividade especial e efeitos de Schwarzschild. Não é um solver numérico de RG."
            : "Educational demos of special relativity and Schwarzschild effects. Not a numerical GR solver."}
        </p>

        {/* Special relativity */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">
            {lang === "pt"
              ? "1. Relatividade especial"
              : "1. Special relativity"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="ui-panel rounded-2xl p-4 space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                β = v/c = {beta.toFixed(3)}
              </label>
              <input
                type="range"
                min={0}
                max={0.99}
                step={0.01}
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="font-mono text-sm text-[var(--text-secondary)] space-y-1">
                <div>
                  γ = <span className="text-[var(--text-primary)]">{gamma.toFixed(4)}</span>
                </div>
                <div>
                  {lang === "pt" ? "1 ano no solo →" : "1 year on ground →"}{" "}
                  <span className="text-[var(--text-primary)]">
                    {properOneYear.toFixed(4)}
                  </span>{" "}
                  {lang === "pt" ? "ano próprio (relógio em movimento)" : "proper year (moving clock)"}
                </div>
                <div>
                  L/L₀ ={" "}
                  <span className="text-[var(--text-primary)]">
                    {L.toFixed(4)}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  v ≈ {((beta * C) / 1000).toExponential(3)} km/s
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--panel-border)] space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  {lang === "pt"
                    ? "Composição de velocidades"
                    : "Velocity addition"}
                </div>
                <label className="text-[11px] text-[var(--text-muted)]">
                  u/c = {betaU.toFixed(3)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={0.99}
                  step={0.01}
                  value={betaU}
                  onChange={(e) => setBetaU(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="font-mono text-sm text-[var(--text-secondary)]">
                  (v ⊕ u)/c ={" "}
                  <span className="text-[var(--text-primary)]">
                    {w.toFixed(4)}
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px] ml-2">
                    {lang === "pt"
                      ? "(nunca ≥ 1)"
                      : "(never ≥ 1)"}
                  </span>
                </div>
              </div>
            </div>

            <MinkowskiDiagram beta={beta} />
          </div>
        </section>

        {/* Schwarzschild / GR lite */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">
            {lang === "pt"
              ? "2. Schwarzschild (buracos negros)"
              : "2. Schwarzschild (black holes)"}
          </h2>

          <div className="ui-panel rounded-2xl p-4 space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[12rem]">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  {lang === "pt" ? "Massa" : "Mass"}
                </label>
                <select
                  value={massId}
                  onChange={(e) => setMassId(e.target.value)}
                  className="mt-1 w-full text-sm rounded-lg bg-black/30 border border-[var(--panel-border)] px-2 py-1.5 text-[var(--text-primary)]"
                >
                  {REF_MASSES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name[lang]}
                    </option>
                  ))}
                  <option value="custom">
                    {lang === "pt" ? "Custom (M☉)" : "Custom (M☉)"}
                  </option>
                </select>
              </div>
              {massId === "custom" && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                    M / M☉
                  </label>
                  <input
                    type="number"
                    value={customMass}
                    onChange={(e) => setCustomMass(Number(e.target.value))}
                    className="mt-1 w-36 text-sm rounded-lg bg-black/30 border border-[var(--panel-border)] px-2 py-1.5 text-[var(--text-primary)]"
                  />
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 font-mono text-sm">
              <div className="rounded-xl border border-[var(--panel-border)] p-3">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">
                  Rₛ
                </div>
                <div className="text-[var(--text-primary)] text-lg">
                  {rsFmt.value.toPrecision(4)} {rsFmt.unit}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--panel-border)] p-3">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">
                  {lang === "pt" ? "Fator temporal" : "Time factor"} √(1−Rₛ/r)
                </div>
                <div className="text-[var(--text-primary)] text-lg">
                  {gravFactor.toFixed(6)}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--panel-border)] p-3">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">
                  {lang === "pt" ? "Deflexão da luz" : "Light deflection"}{" "}
                  (≈2Rₛ/b)
                </div>
                <div className="text-[var(--text-primary)] text-lg">
                  {Number.isFinite(deflectArcsec)
                    ? `${deflectArcsec.toPrecision(4)}″`
                    : "—"}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                r / Rₛ = {rOverRs.toFixed(2)}
              </label>
              <input
                type="range"
                min={1.05}
                max={50}
                step={0.05}
                value={rOverRs}
                onChange={(e) => setROverRs(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                {lang === "pt"
                  ? "Observadores estáticos em r ≤ Rₛ não são descritos por este fator; o horizonte está em r = Rₛ."
                  : "Static observers at r ≤ Rₛ are not described by this factor; the horizon is at r = Rₛ."}
              </p>
            </div>

            {/* Visual: circle Rs vs r */}
            <div className="flex justify-center py-2">
              <svg
                viewBox="0 0 200 200"
                className="w-48 h-48"
                aria-hidden
              >
                <circle
                  cx="100"
                  cy="100"
                  r={Math.min(90, 90 * (rOverRs > 1 ? 1 : rOverRs))}
                  fill="none"
                  stroke="#22d3ee"
                  strokeOpacity={0.3}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={Math.min(90, 90 / Math.max(rOverRs, 1))}
                  fill="#0e7490"
                  fillOpacity={0.35}
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
                <text
                  x="100"
                  y="104"
                  textAnchor="middle"
                  fill="#a5f3fc"
                  fontSize="11"
                >
                  Rₛ
                </text>
              </svg>
            </div>
          </div>
        </section>

        <section className="ui-panel rounded-2xl p-4 text-[11px] text-[var(--text-muted)] leading-relaxed space-y-2">
          <p>
            {lang === "pt"
              ? "Ligação com o céu: selecione Sgr A* no planetário e abra a literature — a massa ~4×10⁶ M☉ implica Rₛ de ordem de 0,08 UA."
              : "Sky link: select Sgr A* in the planetarium and open the literature — a mass ~4×10⁶ M☉ implies Rₛ of order 0.08 AU."}
          </p>
          <p>
            <Link href="/simulate" className="text-[var(--accent)]">
              {lang === "pt" ? "Simulação N-corpos" : "N-body simulation"}
            </Link>
            {" · "}
            <Link href="/" className="text-[var(--accent)]">
              {lang === "pt" ? "Voltar ao céu" : "Back to sky"}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
