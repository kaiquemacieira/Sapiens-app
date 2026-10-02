"use client";

import { useEffect, useState } from "react";
import { useLocaleStore } from "@/lib/store/locale-store";

const SEEN_KEY = "sapiens-onboarding-v1";

export default function Onboarding() {
  const t = useLocaleStore((s) => s.t);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/70 p-4 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t("onboardingTitle")}
    >
      <div className="ui-panel w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-wide">
          {t("onboardingTitle")}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
          {t("onboardingBody")}
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-2">
            <span className="text-[var(--accent)]">⌕</span>
            {t("onboardingSearch")}
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--accent)]">☰</span>
            {t("onboardingLayers")}
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--accent)]">↗</span>
            {t("onboardingShare")}
          </li>
        </ul>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] py-2.5 text-sm font-medium text-[var(--text-primary)] hover:opacity-90 transition"
        >
          {t("onboardingStart")}
        </button>
      </div>
    </div>
  );
}
