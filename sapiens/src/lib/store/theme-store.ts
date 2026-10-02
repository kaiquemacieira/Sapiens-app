"use client";

import { create } from "zustand";

export type ThemeMode = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  init: () => void;
}

const STORAGE_KEY = "sapiens-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function resolve(mode: ThemeMode): ResolvedTheme {
  return mode === "system" ? getSystemTheme() : mode;
}

function applyToDocument(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  // Meta theme-color for mobile browser chrome
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute(
      "content",
      resolved === "dark" ? "#000008" : "#f0f4f8"
    );
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "dark",
  resolved: "dark",

  setMode: (mode) => {
    const resolved = resolve(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* private mode */
    }
    applyToDocument(resolved);
    set({ mode, resolved });
  },

  init: () => {
    let mode: ThemeMode = "dark";
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === "dark" || saved === "light" || saved === "system") {
        mode = saved;
      }
    } catch {
      /* ignore */
    }
    const resolved = resolve(mode);
    applyToDocument(resolved);
    set({ mode, resolved });

    // React to OS theme when mode === system
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      const onChange = () => {
        if (get().mode === "system") {
          const r = getSystemTheme();
          applyToDocument(r);
          set({ resolved: r });
        }
      };
      mq.addEventListener("change", onChange);
    }
  },
}));
