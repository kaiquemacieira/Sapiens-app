"use client";

import { create } from "zustand";
import { MESSAGES, type Locale, type MessageKey } from "@/lib/i18n/messages";

const STORAGE_KEY = "sapiens-locale";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  init: () => void;
  t: (key: MessageKey) => string;
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = (navigator.language || "en").toLowerCase();
  return lang.startsWith("pt") ? "pt" : "en";
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: "en",

  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
    }
    set({ locale });
  },

  init: () => {
    let locale: Locale = "en";
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "en" || saved === "pt") locale = saved;
      else locale = detectLocale();
    } catch {
      locale = detectLocale();
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
    }
    set({ locale });
  },

  t: (key) => {
    const { locale } = get();
    return MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key;
  },
}));
