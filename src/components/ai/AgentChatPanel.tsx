"use client";

import { useCallback, useState } from "react";
import { useSkyStore } from "@/lib/store/sky-store";
import { runAgentClient } from "@/lib/ai/agent-client";
import type { AgentMessage, AgentRunResponse } from "@/lib/ai/agents/types";
import { useProgressStore } from "@/lib/store/progress-store";
import {
  aiAnswerToMarkdown,
  downloadTextFile,
  safeFilename,
} from "@/lib/export/format";

const SUGGESTIONS = [
  "What do we know from the literature?",
  "Compare Andromeda and Triangulum",
  "Suggest related objects",
  "Find papers about black holes near the galactic center",
];

export default function AgentChatPanel() {
  const {
    selectedObject,
    selectedRa,
    selectedDec,
    getFovRadius,
  } = useSkyStore();
  const track = useProgressStore((s) => s.track);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AgentMessage[]>([]);
  const [last, setLast] = useState<AgentRunResponse | null>(null);
  const [showTrace, setShowTrace] = useState(false);

  const ra = selectedObject?.ra ?? selectedRa;
  const dec = selectedObject?.dec ?? selectedDec;

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || loading) return;
      setLoading(true);
      setError(null);
      setInput("");
      try {
        const data = await runAgentClient({
          message,
          context: {
            ra: ra ?? undefined,
            dec: dec ?? undefined,
            radius: getFovRadius(),
            objectName: selectedObject?.name ?? null,
            objectId: selectedObject?.id ?? null,
            objectType: selectedObject?.type ?? null,
          },
          history,
        });
        setLast(data);
        setHistory((h) => [...h, ...data.messages].slice(-30));
        track({ type: "ai" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Agent failed");
      } finally {
        setLoading(false);
      }
    },
    [loading, ra, dec, getFovRadius, selectedObject, history, track]
  );

  return (
    <div className="mt-4 pt-3 border-t border-cyan-900/40">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">
          Sapiens Agents
        </div>
        {last && (
          <span className="text-[10px] text-zinc-600">
            {last.agentsUsed.join(" · ")} · {last.mode}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={loading}
            onClick={() => send(s)}
            className="text-[10px] px-2 py-1 rounded-md border border-cyan-900/50 text-cyan-300/80 hover:bg-cyan-950/40 disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          placeholder="Ask the agent team…"
          className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg bg-black/40 border border-cyan-900/50 text-cyan-50 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-600/60"
          disabled={loading}
        />
        <button
          type="button"
          disabled={loading || !input.trim()}
          onClick={() => send(input)}
          className="text-xs px-3 py-1.5 rounded-lg border border-cyan-700/50 bg-cyan-950/50 text-cyan-100 disabled:opacity-40"
        >
          {loading ? "…" : "Send"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}

      {last && (
        <div className="mt-3 space-y-2">
          {last.warnings.map((w, i) => (
            <p key={i} className="text-[11px] text-amber-400/90">
              {w}
            </p>
          ))}
          <div className="text-xs text-cyan-50/90 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
            {last.answer}
          </div>

          {last.objects.length > 0 && (
            <div className="text-[11px] text-zinc-400">
              <span className="text-zinc-500 uppercase tracking-widest text-[10px]">
                Objects{" "}
              </span>
              {last.objects.map((o) => o.name).join(" · ")}
            </div>
          )}

          {last.citations.length > 0 && (
            <ul className="space-y-1 max-h-28 overflow-y-auto">
              {last.citations.slice(0, 8).map((c, i) => (
                <li key={c.id} className="text-[11px] text-zinc-400">
                  <span className="text-zinc-600">[{i + 1}]</span>{" "}
                  {c.sourceUrl ? (
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {c.title}
                    </a>
                  ) : (
                    c.title
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowTrace((s) => !s)}
              className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
            >
              {showTrace ? "Hide" : "Show"} agent trace
            </button>
            <button
              type="button"
              onClick={() => {
                const md = [
                  `# SAPIENS Agent`,
                  last.answer,
                  "",
                  "## Tools",
                  last.toolsUsed.join(", "),
                ].join("\n");
                downloadTextFile(
                  `${safeFilename(selectedObject?.name || "agent")}-agent.md`,
                  md,
                  "text/markdown;charset=utf-8"
                );
              }}
              className="text-[10px] uppercase tracking-widest text-cyan-500 hover:text-cyan-300"
            >
              Export
            </button>
          </div>

          {showTrace && (
            <ol className="text-[10px] text-zinc-500 space-y-1 max-h-32 overflow-y-auto border-t border-cyan-900/30 pt-2">
              {last.messages
                .filter((m) => m.role === "tool" || m.agent)
                .map((m) => (
                  <li key={m.id}>
                    <span className="text-zinc-600">
                      [{m.agent || m.role}
                      {m.toolName ? `/${m.toolName}` : ""}]
                    </span>{" "}
                    {m.content.slice(0, 160)}
                    {m.content.length > 160 ? "…" : ""}
                  </li>
                ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
