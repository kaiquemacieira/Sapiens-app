"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import StringWave from "@/components/strings/StringWave";
import DimensionCompact from "@/components/strings/DimensionCompact";
import { useLocaleStore } from "@/lib/store/locale-store";
import {
  CONCEPTS,
  PLANCK,
  TIMELINE,
  VARIANTS,
} from "@/lib/strings/concepts";

export default function StringsPage() {
  const locale = useLocaleStore((s) => s.locale);
  const initLocale = useLocaleStore((s) => s.init);
  const lang = locale === "pt" ? "pt" : "en";

  const [mode, setMode] = useState(2);
  const [kind, setKind] = useState<"open" | "closed">("open");
  const [compact, setCompact] = useState(0.55);
  const [variantId, setVariantId] = useState("typeIIB");

  useEffect(() => {
    initLocale();
    document.body.classList.add("literature-page");
    return () => document.body.classList.remove("literature-page");
  }, [initLocale]);

  const variant = VARIANTS.find((v) => v.id === variantId) ?? VARIANTS[2];

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
              {lang === "pt" ? "Teoria das cordas" : "String theory"}
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
            ? "Módulo conceptual e educativo. A teoria das cordas é uma candidata à gravidade quântica; não há confirmação experimental direta."
            : "Conceptual educational module. String theory is a candidate for quantum gravity; there is no direct experimental confirmation."}
        </p>

        {/* Wave demo */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "1. Modos de vibração (metáfora)"
              : "1. Vibration modes (metaphor)"}
          </h2>
          <StringWave mode={mode} kind={kind} />
          <div className="ui-panel rounded-xl p-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {lang === "pt" ? "Modo n" : "Mode n"} = {mode}
              </label>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={mode}
                onChange={(e) => setMode(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="flex items-end gap-2">
              {(["open", "closed"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${
                    kind === k
                      ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
                      : "border-[var(--panel-border)] text-[var(--text-muted)]"
                  }`}
                >
                  {k === "open"
                    ? lang === "pt"
                      ? "Aberta"
                      : "Open"
                    : lang === "pt"
                      ? "Fechada"
                      : "Closed"}
                </button>
              ))}
            </div>
            <p className="sm:col-span-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
              {lang === "pt"
                ? "Ilustração clássica de onda: na teoria das cordas, diferentes modos (e estados) associam-se a diferentes partículas — incluindo um modo de spin 2 interpretado como gravitão."
                : "Classical wave illustration: in string theory, different modes (and states) are associated with different particles — including a spin-2 mode interpreted as the graviton."}
            </p>
          </div>
        </section>

        {/* Concepts grid */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "2. Ideias-chave" : "2. Key ideas"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {CONCEPTS.map((c) => (
              <div key={c.id} className="ui-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[var(--accent)] text-lg" aria-hidden>
                    {c.icon}
                  </span>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {c.title[lang]}
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {c.body[lang]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Compactification */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "3. Compactificação (S¹)"
              : "3. Compactification (S¹)"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <DimensionCompact
              radius={compact}
              label={`R ≈ ${(compact * 10).toFixed(1)} (arb.)`}
            />
            <div className="ui-panel rounded-xl p-4 space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {lang === "pt" ? "Raio relativo" : "Relative radius"}
              </label>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.01}
                value={compact}
                onChange={(e) => setCompact(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {lang === "pt"
                  ? "Metáfora: uma dimensão espacial enrolada num círculo. Se R for minúsculo, a dimensão extra é invisível a baixas energias. Compactificações realistas usam espaços de Calabi–Yau (6D), não só círculos."
                  : "Metaphor: a spatial dimension rolled into a circle. If R is tiny, the extra dimension is invisible at low energies. Realistic models use Calabi–Yau spaces (6D), not only circles."}
              </p>
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "4. Cinco supercordas + teoria M"
              : "4. Five superstrings + M-theory"}
          </h2>
          <div className="ui-panel rounded-xl p-4 space-y-3">
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="w-full text-sm rounded-lg bg-black/30 border border-[var(--panel-border)] px-2 py-1.5 text-[var(--text-primary)]"
            >
              {VARIANTS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.dimensions}D)
                </option>
              ))}
            </select>
            <p className="text-sm text-[var(--text-secondary)]">
              {variant.name} · {variant.dimensions}D
            </p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {variant.notes[lang]}
            </p>
          </div>
        </section>

        {/* Planck scale */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "5. Escala de Planck" : "5. Planck scale"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 font-mono text-sm">
            <div className="ui-panel rounded-xl p-3">
              <div className="text-[10px] text-[var(--text-muted)]">
                ℓₚ (length)
              </div>
              <div className="text-[var(--text-primary)]">
                {PLANCK.length_m.toExponential(3)} m
              </div>
            </div>
            <div className="ui-panel rounded-xl p-3">
              <div className="text-[10px] text-[var(--text-muted)]">
                tₚ (time)
              </div>
              <div className="text-[var(--text-primary)]">
                {PLANCK.time_s.toExponential(3)} s
              </div>
            </div>
            <div className="ui-panel rounded-xl p-3">
              <div className="text-[10px] text-[var(--text-muted)]">
                mₚ (mass)
              </div>
              <div className="text-[var(--text-primary)]">
                {PLANCK.mass_kg.toExponential(3)} kg
              </div>
            </div>
            <div className="ui-panel rounded-xl p-3">
              <div className="text-[10px] text-[var(--text-muted)]">
                Eₚ (energy)
              </div>
              <div className="text-[var(--text-primary)]">
                {PLANCK.energy_GeV.toExponential(3)} GeV
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "6. Linha do tempo" : "6. Timeline"}
          </h2>
          <ol className="space-y-2">
            {TIMELINE.map((t) => (
              <li
                key={t.year}
                className="ui-panel rounded-xl px-4 py-3 flex gap-4 items-start"
              >
                <span className="font-mono text-[var(--accent)] text-sm shrink-0">
                  {t.year}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  {t.title[lang]}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-[11px] text-[var(--text-muted)]">
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
