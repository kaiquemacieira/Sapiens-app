"use client";

import {
  ergosphereEqRs,
  horizonOverRs,
  iscoOverRs,
  photonOrbitOverRs,
} from "@/lib/blackholes/kerr";

interface Props {
  aStar: number;
  showDisk?: boolean;
}

/** Schematic Kerr geometry in units of Rs (outer scale ~ 4 Rs). */
export default function KerrView({ aStar, showDisk = true }: Props) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const viewRs = 4;
  const scale = (size * 0.42) / viewRs;

  const rH = horizonOverRs(aStar) * scale;
  const rPh = Math.max(photonOrbitOverRs(aStar), 0.5) * scale;
  const rIsco = Math.max(iscoOverRs(aStar), horizonOverRs(aStar) * 1.05) * scale;
  const rErg = ergosphereEqRs() * scale; // = Rs at equator

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-md mx-auto aspect-square rounded-2xl bg-black border border-[var(--panel-border)]"
      role="img"
      aria-label="Kerr black hole schematic"
    >
      <defs>
        <radialGradient id="kerr-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kerr-disk" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c026d3" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c026d3" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <circle cx={cx} cy={cy} r={viewRs * scale * 1.1} fill="url(#kerr-glow)" />

      {/* Ergosphere (equatorial static limit ~ Rs) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rErg}
        ry={rErg * (0.75 + 0.25 * (1 - Math.abs(aStar)))}
        fill="#a78bfa"
        fillOpacity={0.12}
        stroke="#a78bfa"
        strokeWidth={1}
        strokeDasharray="4 3"
      />

      {/* Photon orbit */}
      <circle
        cx={cx}
        cy={cy}
        r={rPh}
        fill="none"
        stroke="#c4b5fd"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />

      {/* ISCO */}
      <circle
        cx={cx}
        cy={cy}
        r={rIsco}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={1.2}
      />

      {showDisk && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={viewRs * scale * 0.95}
          ry={viewRs * scale * 0.28}
          fill="url(#kerr-disk)"
          opacity={0.85}
        />
      )}
      {showDisk && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rIsco * 0.92}
          ry={rIsco * 0.26}
          fill="#000008"
        />
      )}

      {/* Horizon */}
      <circle
        cx={cx}
        cy={cy}
        r={rH}
        fill="#000"
        stroke="#e879f9"
        strokeWidth={2}
      />

      <text x={cx + rH + 3} y={cy - 2} fill="#e879f9" fontSize={9}>
        r+
      </text>
      <text x={cx + rIsco + 3} y={cy + 14} fill="#7dd3fc" fontSize={9}>
        ISCO
      </text>
      <text x={12} y={18} fill="#c4b5fd" fontSize={10}>
        a* = {aStar.toFixed(2)}
      </text>
    </svg>
  );
}
