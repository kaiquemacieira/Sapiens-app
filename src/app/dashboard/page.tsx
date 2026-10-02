"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useProgressStore,
  getLevelInfo,
  allAchievements,
} from "@/lib/store/progress-store";
import {
  CATEGORY_LABELS,
  weeklyChallengesForWeek,
  type AchievementCategory,
} from "@/lib/gamification/achievements";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { useLocaleStore } from "@/lib/store/locale-store";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LocaleToggle from "@/components/i18n/LocaleToggle";

export default function DashboardPage() {
  const hydrated = useProgressStore((s) => s.hydrated);
  const xp = useProgressStore((s) => s.xp);
  const unlocked = useProgressStore((s) => s.unlocked);
  const unlockedAt = useProgressStore((s) => s.unlockedAt);
  const uniqueObjects = useProgressStore((s) => s.uniqueObjects);
  const stats = useProgressStore((s) => s.stats);
  const streakDays = useProgressStore((s) => s.streakDays);
  const weekId = useProgressStore((s) => s.weekId);
  const weekStats = useProgressStore((s) => s.weekStats);
  const weekClaimed = useProgressStore((s) => s.weekClaimed);
  const initProgress = useProgressStore((s) => s.init);
  const favorites = useFavoritesStore((s) => s.favorites);
  const initFav = useFavoritesStore((s) => s.init);
  const locale = useLocaleStore((s) => s.locale);
  const initLocale = useLocaleStore((s) => s.init);
  const [notifState, setNotifState] = useState("default");
  const [filter, setFilter] = useState<AchievementCategory | "all">("all");

  useEffect(() => {
    initProgress();
    initFav();
    initLocale();
    document.body.classList.add("literature-page");
    if (typeof Notification !== "undefined") {
      setNotifState(Notification.permission);
    }
    return () => document.body.classList.remove("literature-page");
  }, [initProgress, initFav, initLocale]);

  const level = getLevelInfo(xp);
  const lang = locale === "pt" ? "pt" : "en";
  const achievements = allAchievements();
  const pct = Math.min(100, Math.round((level.into / level.need) * 100));
  const challenges = useMemo(
    () => weeklyChallengesForWeek(weekId || "2026-W1"),
    [weekId]
  );

  const filtered = achievements.filter(
    (a) => filter === "all" || a.category === filter
  );

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    setNotifState(await Notification.requestPermission());
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] literature-scroll">
      <header className="sticky top-0 z-20 border-b border-[var(--panel-border)] bg-[var(--panel-bg)] backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <Link
              href="/"
              className="text-sm text-[var(--accent)] hover:opacity-80"
            >
              ← SAPIENS
            </Link>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mt-1">
              {lang === "pt" ? "Painel" : "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <main id="main" className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {!hydrated ? (
          <p className="text-[var(--text-muted)] text-sm animate-pulse">
            Loading…
          </p>
        ) : (
          <>
            <section className="ui-panel rounded-2xl p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                    {lang === "pt" ? "Nível" : "Level"}
                  </div>
                  <div className="text-3xl font-semibold text-[var(--text-primary)]">
                    {level.level}
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">
                    {xp} XP · {unlocked.length}/{achievements.length}{" "}
                    {lang === "pt" ? "conquistas" : "achievements"}
                    {streakDays > 0 && (
                      <span className="ml-2 text-amber-400">
                        🔥 {streakDays}d
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-[var(--text-secondary)]">
                  {level.into}/{level.need} XP
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-zinc-800/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-700 to-cyan-300 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </section>

            <section>
              <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">
                {lang === "pt" ? "Desafios da semana" : "Weekly challenges"}{" "}
                <span className="opacity-60">({weekId})</span>
              </h2>
              <div className="space-y-2">
                {challenges.map((ch) => {
                  const val = weekStats[ch.stat] ?? 0;
                  const done = weekClaimed.includes(ch.id) || val >= ch.target;
                  const p = Math.min(100, Math.round((val / ch.target) * 100));
                  return (
                    <div key={ch.id} className="ui-panel rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-[var(--text-primary)]">
                          {ch.title[lang]}
                        </span>
                        <span className="text-[var(--text-muted)] text-xs">
                          {Math.min(val, ch.target)}/{ch.target}
                          {done ? " ✓" : ""} · +{ch.xp} XP
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-zinc-800/50 overflow-hidden">
                        <div
                          className={`h-full ${done ? "bg-emerald-400/80" : "bg-cyan-400/70"}`}
                          style={{ width: `${p}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">
                {lang === "pt" ? "Estatísticas" : "Stats"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: lang === "pt" ? "Objetos únicos" : "Unique objects",
                    value: uniqueObjects.length,
                  },
                  {
                    label: lang === "pt" ? "Favoritos" : "Favorites",
                    value: favorites.length,
                  },
                  {
                    label: lang === "pt" ? "Sequência" : "Streak",
                    value: `${streakDays}d`,
                  },
                  {
                    label: lang === "pt" ? "Buscas" : "Searches",
                    value: stats.searches,
                  },
                  {
                    label: lang === "pt" ? "Literatura" : "Literature",
                    value: stats.literatureOpens,
                  },
                  {
                    label: lang === "pt" ? "Perguntas IA" : "AI queries",
                    value: stats.aiQueries,
                  },
                ].map((s) => (
                  <div key={s.label} className="ui-panel rounded-xl px-3 py-3">
                    <div className="text-xl font-semibold text-[var(--text-primary)]">
                      {s.value}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="ui-panel rounded-2xl p-4">
              <h2 className="text-sm font-medium text-[var(--text-primary)]">
                {lang === "pt" ? "Notificações" : "Notifications"}
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-[var(--text-secondary)]">
                  {notifState}
                </span>
                {notifState !== "granted" && (
                  <button
                    type="button"
                    onClick={requestNotif}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
                  >
                    {lang === "pt" ? "Permitir" : "Allow"}
                  </button>
                )}
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  {lang === "pt" ? "Conquistas" : "Achievements"}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      "all",
                      "start",
                      "explore",
                      "science",
                      "habits",
                      "share",
                    ] as const
                  ).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilter(c)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border ${
                        filter === c
                          ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--text-primary)]"
                          : "border-[var(--panel-border)] text-[var(--text-muted)]"
                      }`}
                    >
                      {c === "all"
                        ? lang === "pt"
                          ? "Todas"
                          : "All"
                        : CATEGORY_LABELS[c][lang]}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="space-y-2">
                {filtered.map((a) => {
                  const on = unlocked.includes(a.id);
                  return (
                    <li
                      key={a.id}
                      className={`ui-panel rounded-xl px-4 py-3 flex items-start gap-3 ${
                        on ? "opacity-100" : "opacity-45"
                      }`}
                    >
                      <span className="text-xl" aria-hidden>
                        {a.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[var(--text-primary)]">
                          {a.title[lang]}
                          <span className="ml-2 text-[10px] text-[var(--text-muted)]">
                            +{a.xp} XP · {CATEGORY_LABELS[a.category][lang]}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {a.description[lang]}
                        </div>
                        {on && unlockedAt[a.id] && (
                          <div className="text-[10px] text-cyan-600/80 mt-0.5">
                            {new Date(unlockedAt[a.id]!).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {on ? "✓" : "·"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
