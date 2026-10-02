"use client";

import { useEffect, useRef } from "react";

/** Visual: classical field mode on a 1D lattice oscillating (mode k). */
export default function FieldMode({
  modeK,
  energy,
}: {
  modeK: number;
  /** 0–1 drives amplitude / “occupation” metaphor */
  energy: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const t0 = performance.now();

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

      const k = Math.max(1, Math.min(10, modeK));
      const amp = h * 0.22 * (0.25 + energy);
      const omega = 0.8 + k * 0.35;

      // vacuum fluctuations metaphor
      ctx.strokeStyle = "rgba(100,116,139,0.25)";
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const u = i / 80;
        const x = 12 + u * (w - 24);
        const noise =
          Math.sin(40 * u + 9 * t) * 2 + Math.sin(17 * u - 5 * t) * 1.5;
        const y = h / 2 + noise * (0.3 + 0.2 * energy);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // coherent mode
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const u = i / 120;
        const x = 12 + u * (w - 24);
        const y =
          h / 2 +
          amp * Math.sin(Math.PI * k * u) * Math.cos(omega * t * Math.PI * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // quanta dots at antinodes (metaphor for occupation)
      const nQuanta = Math.round(energy * 6);
      ctx.fillStyle = "#fbbf24";
      for (let q = 0; q < nQuanta; q++) {
        const u = (q + 0.5) / Math.max(nQuanta, 1);
        const x = 12 + u * (w - 24);
        const env = Math.sin(Math.PI * k * u);
        const y =
          h / 2 +
          amp * env * Math.cos(omega * t * Math.PI * 2) -
          8 * Math.sign(env || 1);
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.fillText(`k=${k}  ·  ⟨n⟩~${nQuanta}`, 12, 14);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [modeK, energy]);

  return (
    <canvas
      ref={ref}
      className="w-full h-40 rounded-xl bg-black/80 border border-[var(--panel-border)]"
      aria-label="Field mode illustration"
    />
  );
}
