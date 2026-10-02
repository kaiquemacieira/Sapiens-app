"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import FieldMode from "@/components/qft/FieldMode";
import FeynmanSketch from "@/components/qft/FeynmanSketch";
import { useLocaleStore } from "@/lib/store/locale-store";
import {
  COMPARISON,
  QFT_CONCEPTS,
  SM_FORCES,
  alphaSRunning,
} from "@/lib/qft/concepts";

export default function QftPage() {
  const locale = useLocaleStore((s) => s.locale);
  const initLocale = useLocaleStore((s) => s.init);
  const lang = locale === "pt" ? "pt" : "en";

  const [modeK, setModeK] = useState(2);
  const [energy, setEnergy] = useState(0.5);
  const [Q, setQ] = useState(10); // GeV

  useEffect(() => {
    initLocale();
    document.body.classList.add("literature-page");
    return () => document.body.classList.remove("literature-page");
  }, [initLocale]);

  const alphaS = alphaSRunning(Q);
  const runningPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const q = 0.5 + (i / 40) * 99.5;
      const a = alphaSRunning(q);
      const x = 20 + (i / 40) * 260;
      const y = 100 - Math.min(a, 1.1) * 70;
      pts.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
    }
    return pts.join(" ");
  }, []);

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
                ? "Teoria quântica de campos"
                : "Quantum field theory"}
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
            ? "Introdução conceptual à QFT — a linguagem do Modelo Padrão. Ilustrações educativas, não um simulador de amplitudes."
            : "Conceptual introduction to QFT — the language of the Standard Model. Educational illustrations, not an amplitude simulator."}
        </p>

        {/* Field mode */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "1. Modo de campo e quanta"
              : "1. Field mode and quanta"}
          </h2>
          <FieldMode modeK={modeK} energy={energy} />
          <div className="ui-panel rounded-xl p-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                k = {modeK}
              </label>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={modeK}
                onChange={(e) => setModeK(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {lang === "pt" ? "Energia / ocupação" : "Energy / occupation"}{" "}
                {(energy * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <p className="sm:col-span-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
              {lang === "pt"
                ? "Metáfora: um modo oscila como um oscilador harmónico; aumentar a “ocupação” sugere mais quanta nesse modo. O fundo treme como flutuações do vácuo."
                : "Metaphor: a mode oscillates like a harmonic oscillator; raising “occupation” suggests more quanta in that mode. The background jitter hints at vacuum fluctuations."}
            </p>
          </div>
        </section>

        {/* Concepts */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "2. Ideias-chave" : "2. Key ideas"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {QFT_CONCEPTS.map((c) => (
              <div key={c.id} className="ui-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[var(--accent)]" aria-hidden>
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

        {/* QM vs QFT */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "3. MQ vs QFT" : "3. QM vs QFT"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  <th className="p-2">
                    {lang === "pt" ? "Tópico" : "Topic"}
                  </th>
                  <th className="p-2">QM</th>
                  <th className="p-2">QFT</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr
                    key={row.topic.en}
                    className="border-t border-[var(--panel-border)]"
                  >
                    <td className="p-2 text-[var(--text-secondary)]">
                      {row.topic[lang]}
                    </td>
                    <td className="p-2 text-[11px] text-[var(--text-muted)]">
                      {row.qm[lang]}
                    </td>
                    <td className="p-2 text-[11px] text-[var(--text-muted)]">
                      {row.qft[lang]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feynman + SM forces */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {lang === "pt"
                ? "4. Diagrama de Feynman (esquema)"
                : "4. Feynman diagram (sketch)"}
            </h2>
            <FeynmanSketch />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {lang === "pt"
                ? "5. Forças do Modelo Padrão"
                : "5. Standard Model forces"}
            </h2>
            <ul className="space-y-2">
              {SM_FORCES.map((f) => (
                <li key={f.id} className="ui-panel rounded-xl p-3 text-sm">
                  <div className="font-medium text-[var(--text-primary)]">
                    {f.name[lang]}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {f.group} · {f.bosons} · {f.range[lang]}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Running coupling */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "6. Acoplamento que “corre” (αₛ toy)"
              : "6. Running coupling (toy αₛ)"}
          </h2>
          <div className="ui-panel rounded-xl p-4 space-y-3">
            <svg
              viewBox="0 0 300 120"
              className="w-full h-28 rounded-lg bg-black/50"
            >
              <path
                d={runningPath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
              />
              {/* marker at Q */}
              {(() => {
                const i = (Math.min(Math.max(Q, 0.5), 100) - 0.5) / 99.5;
                const x = 20 + i * 260;
                const a = alphaS;
                const y = 100 - Math.min(a, 1.1) * 70;
                return (
                  <circle cx={x} cy={y} r={4} fill="#fbbf24" />
                );
              })()}
              <text x="20" y="14" fill="#64748b" fontSize="9">
                αₛ(Q)
              </text>
              <text x="250" y="114" fill="#64748b" fontSize="9">
                Q (GeV)
              </text>
            </svg>
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              Q = {Q.toFixed(1)} GeV · αₛ ≈ {alphaS.toFixed(3)}
            </label>
            <input
              type="range"
              min={0.5}
              max={100}
              step={0.5}
              value={Q}
              onChange={(e) => setQ(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {lang === "pt"
                ? "Curva ilustrativa (não um fit PDG). Em QCD, αₛ diminui a altas energias — liberdade assintótica."
                : "Illustrative curve (not a PDG fit). In QCD, αₛ decreases at high energy — asymptotic freedom."}
            </p>
          </div>
        </section>

        <p className="text-[11px] text-[var(--text-muted)]">
          <Link href="/strings" className="text-[var(--accent)]">
            {lang === "pt" ? "Cordas" : "Strings"}
          </Link>
          {" · "}
          <Link href="/relativity" className="text-[var(--accent)]">
            {lang === "pt" ? "Relatividade" : "Relativity"}
          </Link>
          {" · "}
          <Link href="/blackholes" className="text-[var(--accent)]">
            {lang === "pt" ? "Buracos negros" : "Black holes"}
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
