"use client";

import { useEffect, useRef } from "react";
import { chirpFrequencyHz, chirpStrain } from "@/lib/gw/concepts";

/** Animated toy chirp: rising frequency & amplitude toward merger. */
export default function ChirpWaveform({
  playing,
  speed = 1,
}: {
  playing: boolean;
  speed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = (now - last) / 1000;
      last = now;
      if (playing) {
        tRef.current += dt * 0.15 * speed;
        if (tRef.current > 1.05) tRef.current = 0;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // history trail
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const t0 = tRef.current;
      for (let i = 0; i <= 200; i++) {
        const u = i / 200;
        // sample past waveform ending at t0
        const t = Math.max(0, t0 - (1 - u) * 0.35);
        const f = chirpFrequencyHz(t);
        const A = chirpStrain(t) * h * 0.22;
        const phase = 2 * Math.PI * f * t * 0.08;
        const x = 12 + u * (w - 24);
        const y = h / 2 + A * Math.sin(phase + u * 40);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const f = chirpFrequencyHz(t0);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px monospace";
      ctx.fillText(`f ≈ ${f.toFixed(0)} Hz`, 12, 16);
      ctx.fillText(
        t0 < 1 ? "inspiral →" : "merger",
        w - 80,
        16
      );
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  return (
    <canvas
      ref={ref}
      className="w-full h-40 rounded-xl bg-black/80 border border-[var(--panel-border)]"
      aria-label="Chirp waveform"
    />
  );
}
