"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** Mode number n (standing-wave-like) */
  mode: number;
  /** open vs closed string visual */
  kind: "open" | "closed";
  color?: string;
}

/** Canvas metaphor: vibrating string modes (not a physical string simulation). */
export default function StringWave({
  mode,
  kind,
  color = "#22d3ee",
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t0 = performance.now();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const t = (now - t0) / 1000;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // baseline
      ctx.strokeStyle = "rgba(100,116,139,0.35)";
      ctx.beginPath();
      ctx.moveTo(16, h / 2);
      ctx.lineTo(w - 16, h / 2);
      ctx.stroke();

      const n = Math.max(1, Math.min(12, mode));
      const amp = h * 0.28;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();

      if (kind === "open") {
        const usable = w - 32;
        for (let i = 0; i <= 120; i++) {
          const u = i / 120;
          const x = 16 + u * usable;
          // standing wave fixed ends
          const y =
            h / 2 +
            amp *
              Math.sin(Math.PI * n * u) *
              Math.cos(2 * Math.PI * n * 0.45 * t);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // closed loop projected as ellipse with traveling modulation
        const rx = (w - 40) / 2;
        const ry = h * 0.28;
        const cx = w / 2;
        const cy = h / 2;
        for (let i = 0; i <= 160; i++) {
          const u = i / 160;
          const theta = u * Math.PI * 2;
          const mod =
            1 +
            0.12 * Math.sin(n * theta - 2 * Math.PI * 0.6 * t);
          const x = cx + rx * mod * Math.cos(theta);
          const y = cy + ry * mod * Math.sin(theta);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }
      ctx.stroke();

      // endpoints markers for open string
      if (kind === "open") {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(16, h / 2, 3.5, 0, Math.PI * 2);
        ctx.arc(w - 16, h / 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [mode, kind, color]);

  return (
    <canvas
      ref={ref}
      className="w-full h-36 rounded-xl bg-black/80 border border-[var(--panel-border)]"
      aria-label="Vibrating string illustration"
    />
  );
}
