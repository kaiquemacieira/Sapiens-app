"use client";

import { useThemeStore, type ThemeMode } from "@/lib/store/theme-store";

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "dark", label: "Dark", icon: "◐" },
  { mode: "light", label: "Light", icon: "〇" },
  { mode: "system", label: "Auto", icon: "◎" },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, setMode, resolved } = useThemeStore();

  if (compact) {
    const next: ThemeMode =
      mode === "dark" ? "light" : mode === "light" ? "system" : "dark";
    return (
      <button
        type="button"
        onClick={() => setMode(next)}
        className="ctrl-chip flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
        title={`Theme: ${mode} (${resolved}). Click to cycle.`}
        aria-label={`Theme ${mode}, resolved ${resolved}. Click to change.`}
      >
        <span aria-hidden>
          {mode === "dark" ? "◐" : mode === "light" ? "〇" : "◎"}
        </span>
        <span className="hidden sm:inline capitalize">{mode}</span>
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-lg border bg-[var(--panel-bg)] border-[var(--panel-border)]"
      role="group"
      aria-label="Color theme"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.mode}
          type="button"
          onClick={() => setMode(o.mode)}
          className={`text-[11px] px-2 py-1 rounded-md transition ${
            mode === o.mode
              ? "bg-[var(--accent-muted)] text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
          aria-pressed={mode === o.mode}
        >
          <span className="mr-1" aria-hidden>
            {o.icon}
          </span>
          {o.label}
        </button>
      ))}
    </div>
  );
}
