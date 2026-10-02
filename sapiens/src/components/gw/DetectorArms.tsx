"use client";

/** L-shaped interferometer schematic with strain exaggeration. */
export default function DetectorArms({ strain }: { strain: number }) {
  const s = Math.min(0.08, Math.max(0, strain)) * 80;
  return (
    <svg
      viewBox="0 0 220 220"
      className="w-full max-w-[220px] mx-auto aspect-square rounded-xl bg-black/80 border border-[var(--panel-border)]"
      role="img"
      aria-label="Interferometer schematic"
    >
      {/* arms */}
      <line
        x1="30"
        y1="190"
        x2={190 + s}
        y2="190"
        stroke="#22d3ee"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="190"
        x2="30"
        y2={30 - s}
        stroke="#22d3ee"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* mirrors */}
      <rect x={185 + s} y="182" width="10" height="16" fill="#fbbf24" />
      <rect x="22" y={22 - s} width="16" height="10" fill="#fbbf24" />
      {/* beam splitter */}
      <circle cx="30" cy="190" r="6" fill="#f472b6" />
      <text x="100" y="210" fill="#64748b" fontSize="9" textAnchor="middle">
        ΔL exaggerated ×10²¹
      </text>
      <text x="120" y="40" fill="#94a3b8" fontSize="10">
        h ~ ΔL / L
      </text>
    </svg>
  );
}
