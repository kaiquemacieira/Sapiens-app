"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import SpinNetwork from "@/components/qg/SpinNetwork";
import PlanckLadder from "@/components/qg/PlanckLadder";
import { useLocaleStore } from "@/lib/store/locale-store";
import {
  APPROACHES,
  PROBLEMS,
  hawkingTemperatureKelvin,
  hawkingWavelengthMeters,
} from "@/lib/qg/concepts";
import { formatLength } from "@/lib/relativity/physics";

export default function QuantumGravityPage() {
  const locale = useLocaleStore((s) => s.locale);
  const initLocale = useLocaleStore((s) => s.init);
  const lang = locale === "pt" ? "pt" : "en";

  const [approachId, setApproachId] = useState("semiclassical");
  const [massSun, setMassSun] = useState(1); // stellar default for visible T
  const [nodes, setNodes] = useState(12);

  useEffect(() => {
    initLocale();
    document.body.classList.add("literature-page");
    return () => document.body.classList.remove("literature-page");
  }, [initLocale]);

  const approach =
    APPROACHES.find((a) => a.id === approachId) ?? APPROACHES[0];
  const T = hawkingTemperatureKelvin(massSun);
  const lambda = hawkingWavelengthMeters(massSun);
  const lambdaFmt = formatLength(lambda);

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
              {lang === "pt" ? "Gravidade quântica" : "Quantum gravity"}
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
            ? "Mapa conceptual do problema de quantizar a gravidade. Nenhuma abordagem está experimentalmente estabelecida."
            : "Conceptual map of the problem of quantizing gravity. No approach is experimentally established."}
        </p>

        {/* Approaches */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "1. Abordagens" : "1. Approaches"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {APPROACHES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setApproachId(a.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  approachId === a.id
                    ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
                    : "border-[var(--panel-border)] text-[var(--text-muted)]"
                }`}
              >
                {a.name[lang]}
              </button>
            ))}
          </div>
          <div className="ui-panel rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              {approach.name[lang]}
            </h3>
            <p className="text-xs text-[var(--accent)]">
              {approach.tagline[lang]}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {approach.body[lang]}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">
              {approach.status[lang]}
            </p>
          </div>
        </section>

        {/* Problems */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "2. Problemas centrais" : "2. Core problems"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROBLEMS.map((p) => (
              <div key={p.title.en} className="ui-panel rounded-xl p-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  {p.title[lang]}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {p.body[lang]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hawking */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "3. Temperatura de Hawking (semiclassica)"
              : "3. Hawking temperature (semiclassical)"}
          </h2>
          <div className="ui-panel rounded-xl p-4 space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              M / M☉ = {massSun < 1 ? massSun.toExponential(2) : massSun}
            </label>
            <input
              type="range"
              min={-2}
              max={6}
              step={0.05}
              value={Math.log10(massSun)}
              onChange={(e) => setMassSun(10 ** Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="grid sm:grid-cols-2 gap-3 font-mono text-sm">
              <div className="rounded-lg border border-[var(--panel-border)] p-3">
                <div className="text-[10px] text-[var(--text-muted)]">T_H</div>
                <div className="text-[var(--text-primary)]">
                  {T.toExponential(3)} K
                </div>
              </div>
              <div className="rounded-lg border border-[var(--panel-border)] p-3">
                <div className="text-[10px] text-[var(--text-muted)]">
                  λ ~ ħc / kT
                </div>
                <div className="text-[var(--text-primary)]">
                  {lambdaFmt.value.toPrecision(3)} {lambdaFmt.unit}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {lang === "pt"
                ? "Buracos negros estelares são ultrafrios; só buracos primordiais minúsculos teriam T alta. Fórmula semiclassica de Schwarzschild."
                : "Stellar black holes are ultra-cold; only tiny primordial holes would be hot. Schwarzschild semiclassical formula."}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { m: 1, label: "1 M☉" },
                { m: 4e6, label: "Sgr A*" },
                { m: 1e-19, label: "tiny primordial" },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setMassSun(p.m)}
                  className="px-2 py-1 rounded-md border border-[var(--panel-border)] text-[var(--text-secondary)] hover:border-[var(--accent-border)]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* LQG visual + Planck ladder */}
        <section className="grid md:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {lang === "pt"
                ? "4. Rede de spin (metáfora LQG)"
                : "4. Spin network (LQG metaphor)"}
            </h2>
            <SpinNetwork nodes={nodes} />
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              nodes = {nodes}
            </label>
            <input
              type="range"
              min={6}
              max={18}
              step={1}
              value={nodes}
              onChange={(e) => setNodes(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {lang === "pt"
                ? "5. Escada até Planck"
                : "5. Ladder to Planck"}
            </h2>
            <PlanckLadder highlight={6} />
          </div>
        </section>

        <p className="text-[11px] text-[var(--text-muted)]">
          <Link href="/qft" className="text-[var(--accent)]">
            QFT
          </Link>
          {" · "}
          <Link href="/strings" className="text-[var(--accent)]">
            {lang === "pt" ? "Cordas" : "Strings"}
          </Link>
          {" · "}
          <Link href="/blackholes" className="text-[var(--accent)]">
            {lang === "pt" ? "Buracos negros" : "Black holes"}
          </Link>
          {" · "}
          <Link href="/relativity" className="text-[var(--accent)]">
            {lang === "pt" ? "Relatividade" : "Relativity"}
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
