"use client";

import { useEffect, useState } from "react";

interface Props {
  /** When true, begin exit animation */
  ready: boolean;
  /** Called after fade-out completes */
  onExited?: () => void;
  minDisplayMs?: number;
}

export default function SplashScreen({
  ready,
  onExited,
  minDisplayMs = 1200,
}: Props) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mountedAt] = useState(() => Date.now());

  // Simulated progress while loading
  useEffect(() => {
    if (ready) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 88) return p;
        return p + Math.random() * 6 + 1;
      });
    }, 120);
    return () => clearInterval(id);
  }, [ready]);

  // Complete and exit when engine is ready + min time
  useEffect(() => {
    if (!ready) return;
    setProgress(100);
    const elapsed = Date.now() - mountedAt;
    const wait = Math.max(0, minDisplayMs - elapsed);
    const t1 = setTimeout(() => setExiting(true), wait);
    const t2 = setTimeout(() => {
      setVisible(false);
      onExited?.();
    }, wait + 550);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [ready, mountedAt, minDisplayMs, onExited]);

  if (!visible) return null;

  return (
    <div
      className={`splash-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#000008] ${
        exiting ? "splash-exit" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading SAPIENS"
    >
      {/* Soft radial glow */}
      <div className="splash-glow pointer-events-none" aria-hidden />

      {/* Orbital ring */}
      <div className="relative mb-10" aria-hidden>
        <div className="splash-ring" />
        <div className="splash-ring splash-ring-delay" />
        <div className="splash-core" />
      </div>

      <h1 className="splash-title text-3xl sm:text-4xl font-semibold tracking-[0.35em] text-cyan-50 ml-[0.35em]">
        SAPIENS
      </h1>
      <p className="mt-3 text-xs sm:text-sm text-cyan-500/80 tracking-wide text-center px-6 max-w-sm">
        Explore the Universe. Discover what humanity already knows about it.
      </p>

      {/* Progress */}
      <div className="mt-10 w-48 sm:w-56">
        <div className="h-[2px] rounded-full bg-cyan-950 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-700 to-cyan-300 transition-[width] duration-200 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 text-center">
          {ready ? "Ready" : "Initializing sky engine"}
        </p>
      </div>
    </div>
  );
}
