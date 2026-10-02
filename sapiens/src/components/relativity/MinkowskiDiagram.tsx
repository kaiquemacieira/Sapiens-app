"use client";

import { useMemo } from "react";
import { lorentzGamma } from "@/lib/relativity/physics";

interface Props {
  /** β = v/c of the moving frame */
  beta: number;
  width?: number;
  height?: number;
}

/**
 * Simple Minkowski diagram: ct vertical, x horizontal.
 * Shows light cone, rest worldline, and a moving worldline at velocity β.
 */
export default function MinkowskiDiagram({
  beta,
  width = 360,
  height = 320,
}: Props) {
  const pad = 28;
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) / 2 - pad;

  const gamma = lorentzGamma(beta);
  // Moving worldline: x = β c t  →  in (x, ct) plane slope dx/d(ct) = β
  const tipX = cx + beta * scale * 0.9;
  const tipY = cy - scale * 0.9;

  // Length-contracted rod at t=0 in rest frame ends at L0; in diagram show simultaneous in rest frame
  const L0 = 0.55 * scale;
  const L = L0 / gamma;

  const grid = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const o = (i / 3) * scale;
      lines.push({ x1: cx - scale, y1: cy + o, x2: cx + scale, y2: cy + o });
      lines.push({ x1: cx + o, y1: cy - scale, x2: cx + o, y2: cy + scale });
    }
    return lines;
  }, [cx, cy, scale]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto max-h-[340px] rounded-xl bg-black/80 border border-[var(--panel-border)]"
      role="img"
      aria-label="Minkowski spacetime diagram"
    >
      {/* light cone */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + scale}
        y2={cy - scale}
        stroke="#22d3ee"
        strokeOpacity={0.35}
        strokeWidth={1}
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx - scale}
        y2={cy - scale}
        stroke="#22d3ee"
        strokeOpacity={0.35}
        strokeWidth={1}
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx + scale}
        y2={cy + scale}
        stroke="#22d3ee"
        strokeOpacity={0.2}
        strokeWidth={1}
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx - scale}
        y2={cy + scale}
        stroke="#22d3ee"
        strokeOpacity={0.2}
        strokeWidth={1}
      />

      {grid.map((g, i) => (
        <line
          key={i}
          {...g}
          stroke="#334155"
          strokeOpacity={0.35}
          strokeWidth={0.5}
        />
      ))}

      {/* axes */}
      <line
        x1={cx - scale}
        y1={cy}
        x2={cx + scale}
        y2={cy}
        stroke="#94a3b8"
        strokeWidth={1.2}
      />
      <line
        x1={cx}
        y1={cy + scale}
        x2={cx}
        y2={cy - scale}
        stroke="#94a3b8"
        strokeWidth={1.2}
      />
      <text x={cx + scale - 8} y={cy - 6} fill="#94a3b8" fontSize={11}>
        x
      </text>
      <text x={cx + 6} y={cy - scale + 12} fill="#94a3b8" fontSize={11}>
        ct
      </text>

      {/* rest observer worldline */}
      <line
        x1={cx}
        y1={cy + scale * 0.85}
        x2={cx}
        y2={cy - scale * 0.85}
        stroke="#a3e635"
        strokeWidth={2}
      />
      <text x={cx + 8} y={cy - scale * 0.85 + 4} fill="#a3e635" fontSize={10}>
        rest
      </text>

      {/* moving worldline */}
      <line
        x1={cx - (tipX - cx) * 0.15}
        y1={cy + (cy - tipY) * 0.15}
        x2={tipX}
        y2={tipY}
        stroke="#f472b6"
        strokeWidth={2}
      />
      <text x={tipX + 4} y={tipY} fill="#f472b6" fontSize={10}>
        β={beta.toFixed(2)}
      </text>

      {/* rod at ct=0: proper vs contracted */}
      <line
        x1={cx}
        y1={cy + 10}
        x2={cx + L0}
        y2={cy + 10}
        stroke="#64748b"
        strokeWidth={3}
        strokeOpacity={0.5}
      />
      <line
        x1={cx}
        y1={cy + 18}
        x2={cx + L}
        y2={cy + 18}
        stroke="#fbbf24"
        strokeWidth={3}
      />
      <text x={cx + L0 + 4} y={cy + 14} fill="#64748b" fontSize={9}>
        L₀
      </text>
      <text x={cx + L + 4} y={cy + 28} fill="#fbbf24" fontSize={9}>
        L=L₀/γ
      </text>

      <text x={pad} y={height - 8} fill="#64748b" fontSize={9}>
        Light cone 45° · units where c=1
      </text>
    </svg>
  );
}
