"use client";

import { useEffect, useState } from "react";

const SHORTCUTS = [
  { keys: "Drag", action: "Pan the sky" },
  { keys: "Scroll", action: "Zoom (field of view)" },
  { keys: "Click", action: "Select region or object" },
  { keys: "/", action: "Focus search" },
  { keys: "Esc", action: "Close search / panels" },
  { keys: "?", action: "Toggle this help" },
];

export default function HelpModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ctrl-chip flex items-center justify-center text-xs w-8 h-8 rounded-lg"
        title="Help (?)"
        aria-label="Open help"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 pointer-events-auto"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <div
            className="ui-panel w-full max-w-sm rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Controls & shortcuts
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2">
              {SHORTCUTS.map((s) => (
                <li
                  key={s.keys}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <kbd className="rounded border border-[var(--panel-border)] bg-[var(--panel-bg-soft)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                    {s.keys}
                  </kbd>
                  <span className="text-[var(--text-muted)] text-right">
                    {s.action}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] text-[var(--text-muted)] leading-relaxed">
              Share the current view: the URL updates with RA, Dec and FOV. Open
              Layers for constellations and scientific density. Educational
              N-body:{" "}
              <a href="/simulate" className="text-[var(--accent)] underline">
                /simulate
              </a>
              {" · "}
              Relativity:{" "}
              <a href="/relativity" className="text-[var(--accent)] underline">
                /relativity
              </a>
              {" · "}
              Black holes:{" "}
              <a href="/blackholes" className="text-[var(--accent)] underline">
                /blackholes
              </a>
              {" · "}
              Strings:{" "}
              <a href="/strings" className="text-[var(--accent)] underline">
                /strings
              </a>
              {" · "}
              QFT:{" "}
              <a href="/qft" className="text-[var(--accent)] underline">
                /qft
              </a>
              {" · "}
              QG:{" "}
              <a href="/quantum-gravity" className="text-[var(--accent)] underline">
                /quantum-gravity
              </a>
              {" · "}
              DM:{" "}
              <a href="/dark-matter" className="text-[var(--accent)] underline">
                /dark-matter
              </a>
              {" · "}
              GW:{" "}
              <a href="/gravitational-waves" className="text-[var(--accent)] underline">
                /gravitational-waves
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </>
  );
}
