"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/lib/store/progress-store";
import { useToastStore } from "@/lib/store/toast-store";
import { achievementById } from "@/lib/gamification/achievements";
import { useLocaleStore } from "@/lib/store/locale-store";

/** Hydrate progress + show achievement / weekly challenge toasts */
export default function ProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const init = useProgressStore((s) => s.init);
  const lastUnlock = useProgressStore((s) => s.lastUnlock);
  const clearLastUnlock = useProgressStore((s) => s.clearLastUnlock);
  const lastChallengeClaim = useProgressStore((s) => s.lastChallengeClaim);
  const clearLastChallengeClaim = useProgressStore(
    (s) => s.clearLastChallengeClaim
  );
  const push = useToastStore((s) => s.push);
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!lastUnlock) return;
    const def = achievementById(lastUnlock);
    if (!def) return;
    const lang = locale === "pt" ? "pt" : "en";
    push({
      kind: "achievement",
      title: `${def.icon} ${def.title[lang]}`,
      body: `+${def.xp} XP — ${def.description[lang]}`,
    });
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(def.title[lang], {
          body: def.description[lang],
          icon: "/favicon.ico",
        });
      } catch {
        /* ignore */
      }
    }
    clearLastUnlock();
  }, [lastUnlock, clearLastUnlock, push, locale]);

  useEffect(() => {
    if (!lastChallengeClaim) return;
    push({
      kind: "success",
      title:
        locale === "pt" ? "Desafio semanal concluído" : "Weekly challenge done",
      body:
        locale === "pt"
          ? `Recompensa creditada (${lastChallengeClaim}).`
          : `Reward credited (${lastChallengeClaim}).`,
    });
    clearLastChallengeClaim();
  }, [lastChallengeClaim, clearLastChallengeClaim, push, locale]);

  return <>{children}</>;
}
