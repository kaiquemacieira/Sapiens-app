"use client";

import { COSMIC_BUDGET } from "@/lib/darkmatter/concepts";

export default function CosmicBudget({ lang }: { lang: "en" | "pt" }) {
  let acc = 0;
  const segments = COSMIC_BUDGET.map((s) => {
    const start = acc;
    acc += s.fraction;
    return { ...s, start, end: acc };
  });

  const R = 54;
  const cx = 70;
  const cy = 70;
  const toXY = (frac: number) => {
    const a = -Math.PI / 2 + frac * Math.PI * 2;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 140 140" className="w-36 h-36">
        {segments.map((s) => {
          const a0 = toXY(s.start);
          const a1 = toXY(s.end);
          const large = s.fraction > 0.5 ? 1 : 0;
          const d = `M ${cx} ${cy} L ${a0.x} ${a0.y} A ${R} ${R} 0 ${large} 1 ${a1.x} ${a1.y} Z`;
          return <path key={s.id} d={d} fill={s.color} opacity={0.85} />;
        })}
        <circle cx={cx} cy={cy} r={28} fill="#000008" />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
        >
          ΛCDM
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {COSMIC_BUDGET.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-[var(--text-secondary)]">
              {s.label[lang]}
            </span>
            <span className="text-[var(--text-muted)] font-mono text-xs ml-auto">
              ~{Math.round(s.fraction * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
