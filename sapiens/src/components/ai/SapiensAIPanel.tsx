"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSkyStore } from "@/lib/store/sky-store";
import { askAboutRegion } from "@/lib/ai/client";
import type { AiQuestionKind, AiRegionResponse } from "@/lib/ai/types";
import {
  aiAnswerToMarkdown,
  downloadTextFile,
  safeFilename,
} from "@/lib/export/format";
import { useProgressStore } from "@/lib/store/progress-store";

const PRESETS: { kind: AiQuestionKind; label: string }[] = [
  { kind: "summary", label: "What do we know?" },
  { kind: "timeline", label: "Timeline" },
  { kind: "top_cited", label: "Most cited" },
  { kind: "open_access", label: "Open access" },
];

function contextualSuggestions(
  objectName?: string | null,
  objectType?: string | null
): string[] {
  const name = objectName || "this region";
  const base = [
    `What is scientifically notable about ${name}?`,
    `Summarize recent research on ${name}.`,
  ];
  switch (objectType) {
    case "galaxy":
      return [
        ...base,
        `What distance and morphology studies exist for ${name}?`,
        `Are there papers about star formation in ${name}?`,
      ];
    case "black_hole":
      return [
        ...base,
        `What mass measurements are discussed for ${name}?`,
        `Which instruments observed ${name}?`,
      ];
    case "exoplanet":
      return [
        ...base,
        `What is known about habitability or atmosphere for ${name}?`,
        `How was ${name} discovered according to the literature?`,
      ];
    case "high_energy":
      return [
        ...base,
        `What high-energy emission is reported for ${name}?`,
        `Are there multi-wavelength studies of ${name}?`,
      ];
    case "nebula":
      return [
        ...base,
        `What is the physical structure of ${name} in the papers?`,
      ];
    default:
      return [
        ...base,
        `List open-access reviews related to ${name}.`,
      ];
  }
}

export default function SapiensAIPanel() {
  const { selectedObject, selectedRa, selectedDec, getFovRadius } =
    useSkyStore();

  const ra = selectedObject?.ra ?? selectedRa;
  const dec = selectedObject?.dec ?? selectedDec;
  const objectName =
    selectedObject?.name ?? selectedObject?.commonNames?.[0] ?? null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiRegionResponse | null>(null);
  const [customQ, setCustomQ] = useState("");
  const [showSources, setShowSources] = useState(true);
  const track = useProgressStore((s) => s.track);

  // Reset AI answer when selection changes
  useEffect(() => {
    setResult(null);
    setError(null);
    setCustomQ("");
  }, [ra, dec, selectedObject?.id]);

  const suggestions = useMemo(
    () => contextualSuggestions(objectName, selectedObject?.type),
    [objectName, selectedObject?.type]
  );

  const run = useCallback(
    async (kind: AiQuestionKind, question?: string) => {
      if (ra == null || dec == null) return;
      setLoading(true);
      setError(null);
      try {
        const data = await askAboutRegion({
          ra,
          dec,
          radius: getFovRadius(),
          objectName: objectName,
          objectId: selectedObject?.id,
          kind,
          question,
        });
        setResult(data);
        setShowSources(true);
        track({ type: "ai" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "AI request failed");
      } finally {
        setLoading(false);
      }
    },
    [ra, dec, selectedObject, getFovRadius, objectName]
  );

  if (ra == null || dec == null) return null;

  return (
    <div className="mt-3 pt-3 border-t border-cyan-900/40">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-zinc-500">Sapiens AI</div>
        {result && (
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
            {result.mode} · {result.paperCount} papers
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {PRESETS.map((p) => (
          <button
            key={p.kind}
            type="button"
            disabled={loading}
            onClick={() => run(p.kind)}
            className="text-[11px] px-2.5 py-1.5 rounded-md border border-cyan-800/40 text-cyan-200 active:bg-cyan-950/50 hover:bg-cyan-950/50 disabled:opacity-40 transition touch-manipulation"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Contextual suggestions */}
      {!result && !loading && (
        <div className="mb-2 space-y-1">
          {suggestions.slice(0, 3).map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => {
                setCustomQ(q);
                run("custom", q);
              }}
              className="block w-full text-left text-[11px] text-zinc-400 hover:text-cyan-300 active:text-cyan-200 px-1 py-1 transition"
            >
              → {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!customQ.trim()) return;
          run("custom", customQ.trim());
        }}
      >
        <input
          type="text"
          value={customQ}
          onChange={(e) => setCustomQ(e.target.value)}
          placeholder="Ask about this region…"
          enterKeyHint="send"
          className="flex-1 min-w-0 bg-black/50 border border-zinc-700 rounded-md px-2 py-2 text-xs text-cyan-50 placeholder:text-zinc-600 outline-none focus:border-cyan-600"
        />
        <button
          type="submit"
          disabled={loading || !customQ.trim()}
          className="text-xs px-3 py-2 rounded-md bg-cyan-900/50 border border-cyan-700/40 text-cyan-100 disabled:opacity-40 touch-manipulation"
        >
          Ask
        </button>
      </form>

      {loading && (
        <p className="mt-2 text-xs text-cyan-300/70 animate-pulse">
          Grounding answer in retrieved literature…
        </p>
      )}

      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}

      {result && (
        <div className="mt-3 space-y-3">
          {result.warnings.map((w, i) => (
            <p key={i} className="text-[11px] text-amber-400/90">
              {w}
            </p>
          ))}

          <div className="text-xs text-cyan-50/90 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto overscroll-contain">
            {result.answer}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setShowSources((s) => !s)}
              className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
            >
              {showSources ? "Hide" : "Show"} sources ({result.citations.length})
            </button>
            <button
              type="button"
              onClick={() => {
                const md = aiAnswerToMarkdown(result, {
                  ra: ra!,
                  dec: dec!,
                  objectName,
                });
                downloadTextFile(
                  `${safeFilename(objectName || "region")}-sapiens-ai.md`,
                  md,
                  "text/markdown;charset=utf-8"
                );
              }}
              className="text-[10px] uppercase tracking-widest text-cyan-500 hover:text-cyan-300"
            >
              Export MD
            </button>
            <button
              type="button"
              onClick={async () => {
                const md = aiAnswerToMarkdown(result, {
                  ra: ra!,
                  dec: dec!,
                  objectName,
                });
                try {
                  await navigator.clipboard.writeText(md);
                } catch {
                  /* ignore */
                }
              }}
              className="text-[10px] uppercase tracking-widest text-cyan-500 hover:text-cyan-300"
            >
              Copy
            </button>
          </div>

          {showSources && (
            <ul className="space-y-1.5 max-h-36 overflow-y-auto overscroll-contain">
              {result.citations.slice(0, 12).map((c, i) => (
                <li key={c.id} className="text-[11px] text-zinc-400">
                  <span className="text-zinc-500">[{i + 1}]</span>{" "}
                  {c.sourceUrl ? (
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 break-words"
                    >
                      {c.title}
                    </a>
                  ) : (
                    <span className="text-zinc-300">{c.title}</span>
                  )}
                  {c.year != null && (
                    <span className="text-zinc-600"> ({c.year})</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Grounded only in literature retrieved for this region — SAPIENS does
            not invent papers.
          </p>
        </div>
      )}
    </div>
  );
}
