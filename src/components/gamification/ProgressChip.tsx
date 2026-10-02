"use client";

import Link from "next/link";
import { useProgressStore, getLevelInfo } from "@/lib/store/progress-store";

/** Compact level / streak indicator for the sky chrome */
export default function ProgressChip() {
  const hydrated = useProgressStore((s) => s.hydrated);
  const xp = useProgressStore((s) => s.xp);
  const streakDays = useProgressStore((s) => s.streakDays);
  const unlocked = useProgressStore((s) => s.unlocked);

  if (!hydrated) return null;

  const level = getLevelInfo(xp);
  const pct = Math.min(100, Math.round((level.into / level.need) * 100));

  return (
    <Link
      href="/dashboard"
      className="ctrl-chip hidden sm:flex flex-col gap-0.5 text-[10px] px-2.5 py-1 rounded-lg min-w-[4.5rem]"
      title={`${unlocked.length} achievements · ${streakDays}d streak`}
    >
      <span className="flex items-center justify-between gap-2 text-[var(--text-secondary)]">
        <span>Lv {level.level}</span>
        {streakDays > 0 && (
          <span className="text-amber-400/90">🔥{streakDays}</span>
        )}
      </span>
      <span className="block h-1 rounded-full bg-zinc-700/60 overflow-hidden">
        <span
          className="block h-full bg-cyan-400/80"
          style={{ width: `${pct}%` }}
        />
      </span>
    </Link>
  );
}
