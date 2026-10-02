"use client";

/**
 * Visual metaphor for compactified dimensions:
 * a circle (S¹) whose radius the user can shrink.
 */
export default function DimensionCompact({
  radius,
  label,
}: {
  /** 0–1 */
  radius: number;
  label: string;
}) {
  const R = 20 + radius * 70;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[220px] mx-auto aspect-square rounded-xl bg-black/80 border border-[var(--panel-border)]"
      role="img"
      aria-label={label}
    >
      {/* large dimension axis */}
      <line
        x1={24}
        y1={cy}
        x2={size - 24}
        y2={cy}
        stroke="#64748b"
        strokeWidth={2}
      />
      <text x={size - 28} y={cy - 8} fill="#94a3b8" fontSize={11}>
        x
      </text>

      {/* compact circle sitting on the line */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={2}
        opacity={0.85}
      />
      <circle cx={cx + R} cy={cy} r={3} fill="#f472b6" />
      <text
        x={cx}
        y={cy + R + 16}
        textAnchor="middle"
        fill="#67e8f9"
        fontSize={10}
      >
        {label}
      </text>
      <text
        x={cx}
        y={24}
        textAnchor="middle"
        fill="#64748b"
        fontSize={9}
      >
        compact S¹ radius
      </text>
    </svg>
  );
}
