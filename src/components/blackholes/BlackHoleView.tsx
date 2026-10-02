"use client";

import { useMemo } from "react";
import { RADII } from "@/lib/blackholes/catalog";

interface Props {
  /** Outer view radius in units of Rs */
  viewRs?: number;
  /** Show accretion disk */
  showDisk?: boolean;
  /** Animate disk */
  animate?: boolean;
}

/**
 * Schematic Schwarzschild black hole: horizon, photon sphere, ISCO, disk.
 * Pure SVG — educational, not GR ray-traced.
 */
export default function BlackHoleView({
  viewRs = 8,
  showDisk = true,
  animate = true,
}: Props) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const scale = (size * 0.42) / viewRs;

  const rH = RADII.horizon * scale;
  const rPh = RADII.photonSphere * scale;
  const rIsco = RADII.isco * scale;
  const rOut = Math.min(viewRs * scale, size * 0.42);

  const diskPath = useMemo(() => {
    // Elliptical disk ring between ISCO and outer
    const rx = rOut;
    const ry = rOut * 0.28;
    const rxIn = rIsco;
    const ryIn = rIsco * 0.28;
    return {
      outer: `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`,
      inner: `M ${cx - rxIn} ${cy} A ${rxIn} ${ryIn} 0 1 1 ${cx + rxIn} ${cy} A ${rxIn} ${ryIn} 0 1 1 ${cx - rxIn} ${cy}`,
    };
  }, [cx, cy, rOut, rIsco]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-md mx-auto aspect-square rounded-2xl bg-black border border-[var(--panel-border)]"
      role="img"
      aria-label="Schematic black hole"
    >
      <defs>
        <radialGradient id="bh-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
          <stop offset="55%" stopColor="#0e7490" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="disk-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
          <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#fef3c7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
        </linearGradient>
        {animate && (
          <style>{`
            @keyframes disk-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .disk-rot {
              transform-origin: ${cx}px ${cy}px;
              animation: disk-spin 16s linear infinite;
            }
          `}</style>
        )}
      </defs>

      <circle cx={cx} cy={cy} r={rOut * 1.15} fill="url(#bh-glow)" />

      {/* Photon sphere */}
      <circle
        cx={cx}
        cy={cy}
        r={rPh}
        fill="none"
        stroke="#a78bfa"
        strokeWidth={1.5}
        strokeDasharray="5 4"
        opacity={0.8}
      />

      {/* ISCO */}
      <circle
        cx={cx}
        cy={cy}
        r={rIsco}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.7}
      />

      {/* Accretion disk (schematic ellipse) */}
      {showDisk && (
        <g className={animate ? "disk-rot" : undefined}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={rOut}
            ry={rOut * 0.3}
            fill="url(#disk-grad)"
            opacity={0.9}
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx={rIsco * 0.95}
            ry={rIsco * 0.28}
            fill="#000008"
          />
        </g>
      )}

      {/* Horizon */}
      <circle cx={cx} cy={cy} r={rH} fill="#000" stroke="#22d3ee" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={rH * 0.55} fill="#020617" />

      {/* Labels */}
      <text x={cx + rH + 4} y={cy - 4} fill="#67e8f9" fontSize={9}>
        Rₛ
      </text>
      <text x={cx + rPh + 4} y={cy + 12} fill="#c4b5fd" fontSize={9}>
        1.5 Rₛ
      </text>
      <text x={cx + rIsco + 4} y={cy + 28} fill="#7dd3fc" fontSize={9}>
        ISCO 3 Rₛ
      </text>

      <path d={diskPath.outer} fill="none" opacity={0} />
    </svg>
  );
}
