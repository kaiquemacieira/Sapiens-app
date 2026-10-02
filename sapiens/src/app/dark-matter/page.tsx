"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import RotationCurveChart from "@/components/darkmatter/RotationCurveChart";
import CosmicBudget from "@/components/darkmatter/CosmicBudget";
import { useLocaleStore } from "@/lib/store/locale-store";
import { CANDIDATES, EVIDENCE } from "@/lib/darkmatter/concepts";

export default function DarkMatterPage() {
  const locale = useLocaleStore((s) => s.locale);
  const initLocale = useLocaleStore((s) => s.init);
  const lang = locale === "pt" ? "pt" : "en";

  const [mHalo, setMHalo] = useState(40);
  const [candidateId, setCandidateId] = useState("wimp");

  useEffect(() => {
    initLocale();
    document.body.classList.add("literature-page");
    return () => document.body.classList.remove("literature-page");
  }, [initLocale]);

  const candidate =
    CANDIDATES.find((c) => c.id === candidateId) ?? CANDIDATES[0];

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
              {lang === "pt" ? "Matéria escura" : "Dark matter"}
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
            ? "A maior parte da matéria no universo não emite luz. Este módulo resume evidências, candidatos e um modelo toy de curva de rotação."
            : "Most matter in the universe does not emit light. This module summarizes evidence, candidates, and a toy rotation-curve model."}
        </p>

        {/* Cosmic budget */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "1. Orçamento cósmico (ΛCDM)"
              : "1. Cosmic budget (ΛCDM)"}
          </h2>
          <div className="ui-panel rounded-xl p-4">
            <CosmicBudget lang={lang} />
          </div>
        </section>

        {/* Rotation curve */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "2. Curva de rotação (toy)"
              : "2. Rotation curve (toy)"}
          </h2>
          <RotationCurveChart mHalo={mHalo} />
          <div className="ui-panel rounded-xl p-4 space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              {lang === "pt" ? "Massa do halo" : "Halo mass"} ≈ {mHalo}×10¹⁰ M☉
            </label>
            <input
              type="range"
              min={0}
              max={120}
              step={1}
              value={mHalo}
              onChange={(e) => setMHalo(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {lang === "pt"
                ? "Sem halo (slider à esquerda), a curva cai; com halo, permanece mais plana — o padrão observado em muitas espirais."
                : "With no halo (slider left), the curve falls; with a halo it stays flatter — the pattern seen in many spirals."}
            </p>
          </div>
        </section>

        {/* Evidence */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "3. Evidências" : "3. Evidence"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {EVIDENCE.map((e) => (
              <div key={e.id} className="ui-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[var(--accent)]" aria-hidden>
                    {e.icon}
                  </span>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {e.title[lang]}
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {e.body[lang]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Candidates */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "4. Candidatos" : "4. Candidates"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {CANDIDATES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCandidateId(c.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  candidateId === c.id
                    ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
                    : "border-[var(--panel-border)] text-[var(--text-muted)]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="ui-panel rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              {candidate.name}
            </h3>
            <p className="text-xs text-[var(--accent)]">
              {candidate.type[lang]}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {lang === "pt" ? "Massa / escala: " : "Mass / scale: "}
              {candidate.massHint[lang]}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {candidate.status[lang]}
            </p>
          </div>
        </section>

        {/* Detection */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "5. Como procurar" : "5. How we search"}
          </h2>
          <div className="grid sm:grid-cols-3 gap-3 text-[11px] text-[var(--text-muted)]">
            <div className="ui-panel rounded-xl p-3 leading-relaxed">
              <div className="text-[var(--text-secondary)] font-medium mb-1">
                {lang === "pt" ? "Deteção direta" : "Direct detection"}
              </div>
              {lang === "pt"
                ? "Recuos nucleares em detetores subterrâneos (WIMPs) ou cavidades de micro-ondas (axiões)."
                : "Nuclear recoils in underground detectors (WIMPs) or microwave cavities (axions)."}
            </div>
            <div className="ui-panel rounded-xl p-3 leading-relaxed">
              <div className="text-[var(--text-secondary)] font-medium mb-1">
                {lang === "pt" ? "Deteção indireta" : "Indirect detection"}
              </div>
              {lang === "pt"
                ? "Produtos de aniquilação ou decaimento: raios gama, neutrinos, raios cósmicos."
                : "Annihilation or decay products: gamma rays, neutrinos, cosmic rays."}
            </div>
            <div className="ui-panel rounded-xl p-3 leading-relaxed">
              <div className="text-[var(--text-secondary)] font-medium mb-1">
                {lang === "pt" ? "Colisores" : "Colliders"}
              </div>
              {lang === "pt"
                ? "Assinaturas de energia em falta no LHC e futuros colisores."
                : "Missing-energy signatures at the LHC and future colliders."}
            </div>
          </div>
        </section>

        <p className="text-[11px] text-[var(--text-muted)]">
          <Link href="/?object=Andromeda" className="text-[var(--accent)]">
            {lang === "pt" ? "Andrómeda no céu" : "Andromeda in the sky"}
          </Link>
          {" · "}
          <Link href="/quantum-gravity" className="text-[var(--accent)]">
            {lang === "pt" ? "Gravidade quântica" : "Quantum gravity"}
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
