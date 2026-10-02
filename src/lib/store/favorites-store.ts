"use client";

import { create } from "zustand";

const FAV_KEY = "sapiens-favorites";
const RECENT_KEY = "sapiens-recent";
const MAX_RECENT = 12;

export interface FavEntry {
  id: string;
  name: string;
  type: string;
  ra: number;
  dec: number;
  savedAt: number;
}

interface FavoritesState {
  favorites: FavEntry[];
  recent: FavEntry[];
  init: () => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (entry: Omit<FavEntry, "savedAt">) => void;
  pushRecent: (entry: Omit<FavEntry, "savedAt">) => void;
}

function load(key: string): FavEntry[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(key: string, list: FavEntry[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  recent: [],

  init: () => {
    set({
      favorites: load(FAV_KEY),
      recent: load(RECENT_KEY),
    });
  },

  isFavorite: (id) => get().favorites.some((f) => f.id === id),

  toggleFavorite: (entry) => {
    const { favorites } = get();
    const exists = favorites.some((f) => f.id === entry.id);
    const next = exists
      ? favorites.filter((f) => f.id !== entry.id)
      : [{ ...entry, savedAt: Date.now() }, ...favorites].slice(0, 50);
    save(FAV_KEY, next);
    set({ favorites: next });
  },

  pushRecent: (entry) => {
    const filtered = get().recent.filter((r) => r.id !== entry.id);
    const next = [{ ...entry, savedAt: Date.now() }, ...filtered].slice(
      0,
      MAX_RECENT
    );
    save(RECENT_KEY, next);
    set({ recent: next });
  },
}));
