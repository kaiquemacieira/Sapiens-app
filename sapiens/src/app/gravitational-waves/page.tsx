"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import ChirpWaveform from "@/components/gw/ChirpWaveform";
import DetectorArms from "@/components/gw/DetectorArms";
import { useLocaleStore } from "@/lib/store/locale-store";
import {
  MILESTONES,
  SOURCES,
  chirpMass,
} from "@/lib/gw/concepts";

export default function GravitationalWavesPage() {
  const locale = useLocaleStore((s) => s.locale);
  const initLocale = useLocaleStore((s) => s.init);
  const lang = locale === "pt" ? "pt" : "en";

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [m1, setM1] = useState(30);
  const [m2, setM2] = useState(30);
  const [sourceId, setSourceId] = useState("bbh");

  useEffect(() => {
    initLocale();
    document.body.classList.add("literature-page");
    return () => document.body.classList.remove("literature-page");
  }, [initLocale]);

  const Mc = chirpMass(m1, m2);
  const source = SOURCES.find((s) => s.id === sourceId) ?? SOURCES[0];
  // demo strain for detector graphic
  const strainDemo = 0.02 + (Mc / 100) * 0.03;

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
                ? "Ondas gravitacionais"
                : "Gravitational waves"}
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
            ? "Ondas no espaço-tempo previstas pela RG e detetadas desde 2015. Formas de onda e números são educativos — não templates de análise LIGO."
            : "Spacetime waves predicted by GR and detected since 2015. Waveforms and numbers are educational — not LIGO analysis templates."}
        </p>

        {/* Chirp */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt"
              ? "1. Chirp de uma fusão (toy)"
              : "1. Merger chirp (toy)"}
          </h2>
          <ChirpWaveform playing={playing} speed={speed} />
          <div className="ui-panel rounded-xl p-4 flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
            >
              {playing
                ? lang === "pt"
                  ? "Pausar"
                  : "Pause"
                : "Play"}
            </button>
            <label className="text-xs text-[var(--text-muted)] flex items-center gap-2">
              {lang === "pt" ? "Velocidade" : "Speed"}
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="accent-cyan-500 w-28"
              />
            </label>
          </div>
        </section>

        {/* Chirp mass + detector */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="ui-panel rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {lang === "pt" ? "2. Massa de chirp" : "2. Chirp mass"}
            </h2>
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              m₁ = {m1} M☉
            </label>
            <input
              type="range"
              min={5}
              max={80}
              value={m1}
              onChange={(e) => setM1(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              m₂ = {m2} M☉
            </label>
            <input
              type="range"
              min={5}
              max={80}
              value={m2}
              onChange={(e) => setM2(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="font-mono text-sm text-[var(--text-primary)]">
              ℳc ≈ {Mc.toFixed(1)} M☉
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {lang === "pt"
                ? "A massa de chirp fixa a evolução da frequência no inspiral e é bem medida nos sinais."
                : "Chirp mass sets inspiral frequency evolution and is well measured from the signal."}
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {lang === "pt"
                ? "3. Interferómetro"
                : "3. Interferometer"}
            </h2>
            <DetectorArms strain={strainDemo} />
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed px-1">
              {lang === "pt"
                ? "Braços em L medem diferenças de caminho ΔL. A deformação h ∼ ΔL/L é da ordem de 10⁻²¹."
                : "L-shaped arms measure path differences ΔL. Strain h ∼ ΔL/L is of order 10⁻²¹."}
            </p>
          </div>
        </section>

        {/* Sources */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "4. Fontes" : "4. Sources"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSourceId(s.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  sourceId === s.id
                    ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
                    : "border-[var(--panel-border)] text-[var(--text-muted)]"
                }`}
              >
                {s.name[lang]}
              </button>
            ))}
          </div>
          <div className="ui-panel rounded-xl p-4 space-y-1">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              {source.name[lang]}
            </h3>
            <p className="text-xs text-[var(--accent)]">
              {source.freq[lang]} · {source.detectors}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {source.notes[lang]}
            </p>
          </div>
        </section>

        {/* Spectrum bands */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "5. Bandas de frequência" : "5. Frequency bands"}
          </h2>
          <div className="ui-panel rounded-xl p-4 overflow-x-auto">
            <div className="flex gap-1 min-w-[320px] text-[10px] text-center">
              {[
                { label: "nHz", sub: "PTA", c: "bg-indigo-500/40" },
                { label: "μHz–mHz", sub: "LISA", c: "bg-violet-500/40" },
                { label: "Hz–kHz", sub: "LIGO", c: "bg-cyan-500/40" },
              ].map((b) => (
                <div
                  key={b.label}
                  className={`flex-1 rounded-lg ${b.c} border border-[var(--panel-border)] py-3 px-1`}
                >
                  <div className="text-[var(--text-primary)] font-mono">
                    {b.label}
                  </div>
                  <div className="text-[var(--text-muted)]">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {lang === "pt" ? "6. Marcos" : "6. Milestones"}
          </h2>
          <ol className="space-y-2">
            {MILESTONES.map((m) => (
              <li
                key={m.year}
                className="ui-panel rounded-xl px-4 py-3 flex gap-4"
              >
                <span className="font-mono text-[var(--accent)] text-sm shrink-0">
                  {m.year}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  {m.title[lang]}
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
