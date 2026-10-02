"use client";

import { useMemo } from "react";
import { rotationCurve } from "@/lib/darkmatter/concepts";

interface Props {
  /** Halo mass in 1e10 M☉ */
  mHalo: number;
  mBaryon?: number;
  rHalo?: number;
}

export default function RotationCurveChart({
  mHalo,
  mBaryon = 5,
  rHalo = 8,
}: Props) {
  const { pathAll, pathBaryon, maxV } = useMemo(() => {
    const ptsAll: string[] = [];
    const ptsB: string[] = [];
    let maxV = 0;
    for (let i = 0; i <= 40; i++) {
      const r = 0.5 + (i / 40) * 29.5;
      const v = rotationCurve(r, { mBaryon, mHalo, rHalo });
      const vb = rotationCurve(r, { mBaryon, mHalo: 0, rHalo });
      maxV = Math.max(maxV, v, vb);
      const x = 40 + (i / 40) * 240;
      ptsAll.push(`${i === 0 ? "M" : "L"} ${x} ${0}`);
      ptsB.push(`${i === 0 ? "M" : "L"} ${x} ${0}`);
    }
    // rebuild with scale
    const pa: string[] = [];
    const pb: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const r = 0.5 + (i / 40) * 29.5;
      const v = rotationCurve(r, { mBaryon, mHalo, rHalo });
      const vb = rotationCurve(r, { mBaryon, mHalo: 0, rHalo });
      const x = 40 + (i / 40) * 240;
      const y = 120 - (v / maxV) * 95;
      const yb = 120 - (vb / maxV) * 95;
      pa.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
      pb.push(`${i === 0 ? "M" : "L"} ${x} ${yb}`);
    }
    return { pathAll: pa.join(" "), pathBaryon: pb.join(" "), maxV };
  }, [mHalo, mBaryon, rHalo]);

  return (
    <svg
      viewBox="0 0 300 150"
      className="w-full h-40 rounded-xl bg-black/80 border border-[var(--panel-border)]"
      role="img"
      aria-label="Galaxy rotation curve"
    >
      {/* axes */}
      <line x1="40" y1="120" x2="280" y2="120" stroke="#475569" strokeWidth="1" />
      <line x1="40" y1="120" x2="40" y2="20" stroke="#475569" strokeWidth="1" />
      <text x="150" y="142" fill="#64748b" fontSize="9" textAnchor="middle">
        r (kpc)
      </text>
      <text
        x="12"
        y="70"
        fill="#64748b"
        fontSize="9"
        transform="rotate(-90 12 70)"
      >
        v (km/s)
      </text>

      <path d={pathBaryon} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" />
      <path d={pathAll} fill="none" stroke="#22d3ee" strokeWidth="2.5" />

      <text x="200" y="36" fill="#fbbf24" fontSize="9">
        baryons only
      </text>
      <text x="200" y="50" fill="#22d3ee" fontSize="9">
        + dark halo
      </text>
      <text x="48" y="28" fill="#94a3b8" fontSize="9">
        vmax ~ {maxV.toFixed(0)} km/s
      </text>
    </svg>
  );
}
