"use client";

import { create } from "zustand";
import {
  ACHIEVEMENTS,
  achievementById,
  levelFromXp,
  currentWeekId,
  weeklyChallengesForWeek,
  type AchievementId,
} from "@/lib/gamification/achievements";

const STORAGE_KEY = "sapiens-progress-v2";

export interface ProgressSnapshot {
  xp: number;
  unlocked: AchievementId[];
  unlockedAt: Partial<Record<AchievementId, string>>;
  uniqueObjects: string[];
  uniqueGalaxies: string[];
  uniqueLocalGroup: string[];
  usedSearch: boolean;
  usedLiterature: boolean;
  usedAi: boolean;
  streakDays: number;
  lastVisitDay: string | null; // YYYY-MM-DD
  weekId: string;
  weekStats: {
    searches: number;
    selections: number;
    literatureOpens: number;
    aiQueries: number;
    shares: number;
    exports: number;
  };
  weekClaimed: string[]; // challenge ids claimed this week
  stats: {
    searches: number;
    selections: number;
    literatureOpens: number;
    aiQueries: number;
    shares: number;
    exports: number;
  };
}

interface ProgressState extends ProgressSnapshot {
  hydrated: boolean;
  lastUnlock: AchievementId | null;
  lastChallengeClaim: string | null;
  init: () => void;
  clearLastUnlock: () => void;
  clearLastChallengeClaim: () => void;
  track: (event: ProgressEvent) => AchievementId[];
}

export type ProgressEvent =
  | { type: "app_open" }
  | { type: "search" }
  | { type: "select_object"; objectId: string; objectType?: string }
  | { type: "favorite" }
  | { type: "literature"; objectType?: string }
  | { type: "ai" }
  | { type: "observer" }
  | { type: "constellations" }
  | { type: "share" }
  | { type: "export" };

const LOCAL_GROUP_HINTS = [
  "andromeda",
  "m31",
  "lmc",
  "smc",
  "magellanic",
  "milky",
  "sgr a",
  "sagittarius a",
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

const defaultState = (): ProgressSnapshot => ({
  xp: 0,
  unlocked: [],
  unlockedAt: {},
  uniqueObjects: [],
  uniqueGalaxies: [],
  uniqueLocalGroup: [],
  usedSearch: false,
  usedLiterature: false,
  usedAi: false,
  streakDays: 0,
  lastVisitDay: null,
  weekId: currentWeekId(),
  weekStats: {
    searches: 0,
    selections: 0,
    literatureOpens: 0,
    aiQueries: 0,
    shares: 0,
    exports: 0,
  },
  weekClaimed: [],
  stats: {
    searches: 0,
    selections: 0,
    literatureOpens: 0,
    aiQueries: 0,
    shares: 0,
    exports: 0,
  },
});

function migrate(raw: Partial<ProgressSnapshot> & { uniqueObjects?: string[] }): ProgressSnapshot {
  const base = defaultState();
  return {
    ...base,
    ...raw,
    stats: { ...base.stats, ...raw.stats },
    weekStats: { ...base.weekStats, ...raw.weekStats },
    uniqueObjects: raw.uniqueObjects ?? [],
    uniqueGalaxies: raw.uniqueGalaxies ?? [],
    uniqueLocalGroup: raw.uniqueLocalGroup ?? [],
    weekClaimed: raw.weekClaimed ?? [],
  };
}

function load(): ProgressSnapshot {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("sapiens-progress-v1");
    if (!raw) return defaultState();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function persist(s: ProgressSnapshot) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        xp: s.xp,
        unlocked: s.unlocked,
        unlockedAt: s.unlockedAt,
        uniqueObjects: s.uniqueObjects,
        uniqueGalaxies: s.uniqueGalaxies,
        uniqueLocalGroup: s.uniqueLocalGroup,
        usedSearch: s.usedSearch,
        usedLiterature: s.usedLiterature,
        usedAi: s.usedAi,
        streakDays: s.streakDays,
        lastVisitDay: s.lastVisitDay,
        weekId: s.weekId,
        weekStats: s.weekStats,
        weekClaimed: s.weekClaimed,
        stats: s.stats,
      })
    );
  } catch {
    /* ignore */
  }
}

function unlock(
  state: ProgressSnapshot,
  id: AchievementId
): { state: ProgressSnapshot; newly: boolean } {
  if (state.unlocked.includes(id)) return { state, newly: false };
  const def = achievementById(id);
  if (!def) return { state, newly: false };
  return {
    state: {
      ...state,
      xp: state.xp + def.xp,
      unlocked: [...state.unlocked, id],
      unlockedAt: {
        ...state.unlockedAt,
        [id]: new Date().toISOString(),
      },
    },
    newly: true,
  };
}

function ensureWeek(state: ProgressSnapshot): ProgressSnapshot {
  const wid = currentWeekId();
  if (state.weekId === wid) return state;
  return {
    ...state,
    weekId: wid,
    weekStats: {
      searches: 0,
      selections: 0,
      literatureOpens: 0,
      aiQueries: 0,
      shares: 0,
      exports: 0,
    },
    weekClaimed: [],
  };
}

function claimWeeklyIfReady(
  state: ProgressSnapshot
): { state: ProgressSnapshot; claimed: string | null } {
  const challenges = weeklyChallengesForWeek(state.weekId);
  let claimed: string | null = null;
  let next = state;
  for (const ch of challenges) {
    if (next.weekClaimed.includes(ch.id)) continue;
    const val = next.weekStats[ch.stat] ?? 0;
    if (val >= ch.target) {
      next = {
        ...next,
        xp: next.xp + ch.xp,
        weekClaimed: [...next.weekClaimed, ch.id],
      };
      claimed = ch.id;
    }
  }
  return { state: next, claimed };
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...defaultState(),
  hydrated: false,
  lastUnlock: null,
  lastChallengeClaim: null,

  init: () => {
    const data = load();
    set({ ...data, hydrated: true, lastUnlock: null, lastChallengeClaim: null });
    get().track({ type: "app_open" });
  },

  clearLastUnlock: () => set({ lastUnlock: null }),
  clearLastChallengeClaim: () => set({ lastChallengeClaim: null }),

  track: (event) => {
    let state = ensureWeek({
      xp: get().xp,
      unlocked: get().unlocked,
      unlockedAt: get().unlockedAt,
      uniqueObjects: get().uniqueObjects,
      uniqueGalaxies: get().uniqueGalaxies,
      uniqueLocalGroup: get().uniqueLocalGroup,
      usedSearch: get().usedSearch,
      usedLiterature: get().usedLiterature,
      usedAi: get().usedAi,
      streakDays: get().streakDays,
      lastVisitDay: get().lastVisitDay,
      weekId: get().weekId,
      weekStats: { ...get().weekStats },
      weekClaimed: [...get().weekClaimed],
      stats: { ...get().stats },
    });
    const newly: AchievementId[] = [];
    let challengeClaim: string | null = null;

    const tryUnlock = (id: AchievementId) => {
      const r = unlock(state, id);
      state = r.state;
      if (r.newly) newly.push(id);
    };

    switch (event.type) {
      case "app_open": {
        tryUnlock("first_light");
        const hour = new Date().getHours();
        if (hour >= 22) tryUnlock("night_owl");
        if (hour < 7) tryUnlock("early_bird");
        const today = todayKey();
        if (state.lastVisitDay !== today) {
          if (
            state.lastVisitDay &&
            daysBetween(state.lastVisitDay, today) === 1
          ) {
            state.streakDays = (state.streakDays || 0) + 1;
          } else if (!state.lastVisitDay) {
            state.streakDays = 1;
          } else {
            state.streakDays = 1;
          }
          state.lastVisitDay = today;
        }
        if (state.streakDays >= 3) tryUnlock("streak_3");
        if (state.streakDays >= 7) tryUnlock("streak_7");
        break;
      }
      case "search":
        state.stats.searches += 1;
        state.weekStats.searches += 1;
        state.usedSearch = true;
        tryUnlock("first_search");
        break;
      case "select_object": {
        state.stats.selections += 1;
        state.weekStats.selections += 1;
        tryUnlock("first_select");
        if (!state.uniqueObjects.includes(event.objectId)) {
          state.uniqueObjects = [...state.uniqueObjects, event.objectId].slice(
            -300
          );
        }
        if (state.uniqueObjects.length >= 5) tryUnlock("deep_sky_five");
        if (state.uniqueObjects.length >= 10) tryUnlock("catalog_ten");
        if (state.uniqueObjects.length >= 20) tryUnlock("catalog_twenty");

        if (event.objectType === "galaxy") {
          if (!state.uniqueGalaxies.includes(event.objectId)) {
            state.uniqueGalaxies = [
              ...state.uniqueGalaxies,
              event.objectId,
            ].slice(-50);
          }
          if (state.uniqueGalaxies.length >= 3) tryUnlock("galaxy_hopper");
        }
        const name = event.objectId.toLowerCase();
        if (LOCAL_GROUP_HINTS.some((h) => name.includes(h))) {
          if (!state.uniqueLocalGroup.includes(event.objectId)) {
            state.uniqueLocalGroup = [
              ...state.uniqueLocalGroup,
              event.objectId,
            ];
          }
          if (state.uniqueLocalGroup.length >= 1) tryUnlock("galaxy_native");
        }
        break;
      }
      case "favorite":
        tryUnlock("first_favorite");
        break;
      case "literature":
        state.stats.literatureOpens += 1;
        state.weekStats.literatureOpens += 1;
        state.usedLiterature = true;
        tryUnlock("first_literature");
        if (state.stats.literatureOpens >= 5) tryUnlock("archivist");
        if (event.objectType === "galaxy") tryUnlock("galaxy_scholar");
        break;
      case "ai":
        state.stats.aiQueries += 1;
        state.weekStats.aiQueries += 1;
        state.usedAi = true;
        tryUnlock("first_ai");
        break;
      case "observer":
        tryUnlock("observer_mode");
        break;
      case "constellations":
        tryUnlock("constellation_viewer");
        break;
      case "share":
        state.stats.shares += 1;
        state.weekStats.shares += 1;
        tryUnlock("sharer");
        break;
      case "export":
        state.stats.exports += 1;
        state.weekStats.exports += 1;
        tryUnlock("sharer");
        break;
    }

    if (state.usedSearch && state.usedLiterature && state.usedAi) {
      tryUnlock("polymath");
    }

    const claim = claimWeeklyIfReady(state);
    state = claim.state;
    challengeClaim = claim.claimed;

    persist(state);
    set({
      ...state,
      lastUnlock: newly[0] ?? get().lastUnlock,
      lastChallengeClaim: challengeClaim ?? get().lastChallengeClaim,
    });
    return newly;
  },
}));

export function getLevelInfo(xp: number) {
  return levelFromXp(xp);
}

export function allAchievements() {
  return ACHIEVEMENTS;
}
