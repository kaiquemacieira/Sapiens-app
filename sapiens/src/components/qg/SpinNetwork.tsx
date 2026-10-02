"use client";

import { useMemo } from "react";

/** Decorative spin-network metaphor (not a real LQG calculation). */
export default function SpinNetwork({ nodes = 12 }: { nodes?: number }) {
  const graph = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const n = Math.max(6, Math.min(20, nodes));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.2;
      const r = 40 + (i % 3) * 22;
      pts.push({ x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a) });
    }
    // center node
    pts.push({ x: 100, y: 100 });
    const edges: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      edges.push([i, (i + 1) % n]);
      edges.push([i, n]); // to center
      if (i % 2 === 0) edges.push([i, (i + 2) % n]);
    }
    return { pts, edges };
  }, [nodes]);

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full max-w-[240px] mx-auto aspect-square rounded-xl bg-black/80 border border-[var(--panel-border)]"
      role="img"
      aria-label="Spin network illustration"
    >
      {graph.edges.map(([a, b], i) => (
        <line
          key={i}
          x1={graph.pts[a].x}
          y1={graph.pts[a].y}
          x2={graph.pts[b].x}
          y2={graph.pts[b].y}
          stroke="#22d3ee"
          strokeOpacity={0.45}
          strokeWidth={1.2}
        />
      ))}
      {graph.pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === graph.pts.length - 1 ? 5 : 3}
          fill={i === graph.pts.length - 1 ? "#fbbf24" : "#67e8f9"}
        />
      ))}
      <text x="100" y="190" textAnchor="middle" fill="#64748b" fontSize="9">
        spin-network metaphor
      </text>
    </svg>
  );
}
