"use client";

import { useToastStore } from "@/lib/store/toast-store";

export default function ToastViewport() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[120] flex flex-col gap-2 max-w-sm w-[min(100vw-2rem,22rem)] pointer-events-auto"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`ui-panel rounded-xl px-4 py-3 shadow-2xl border-l-2 animate-[splash-fade-up_0.25s_ease] ${
            t.kind === "achievement"
              ? "border-l-amber-400"
              : t.kind === "success"
                ? "border-l-cyan-400"
                : t.kind === "warning"
                  ? "border-l-amber-500"
                  : "border-l-zinc-500"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {t.title}
              </div>
              {t.body && (
                <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  {t.body}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-[var(--text-muted)] text-xs shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
