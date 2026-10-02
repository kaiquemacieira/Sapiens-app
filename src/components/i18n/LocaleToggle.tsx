"use client";

import { useLocaleStore } from "@/lib/store/locale-store";

export default function LocaleToggle() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "pt" : "en")}
      className="ctrl-chip flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg uppercase font-medium"
      title={locale === "en" ? "Mudar para português" : "Switch to English"}
      aria-label="Toggle language"
    >
      {locale === "en" ? "EN" : "PT"}
    </button>
  );
}
