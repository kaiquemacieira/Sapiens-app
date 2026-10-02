"use client";

const RUNGS: { label: string; scale_m: number }[] = [
  { label: "Human", scale_m: 1 },
  { label: "Cell", scale_m: 1e-5 },
  { label: "Atom", scale_m: 1e-10 },
  { label: "Nucleus", scale_m: 1e-15 },
  { label: "LHC energy*", scale_m: 1e-19 },
  { label: "GUT*", scale_m: 1e-31 },
  { label: "Planck", scale_m: 1.6e-35 },
];

/** Log-scale ladder from human size to Planck length (illustrative). */
export default function PlanckLadder({ highlight }: { highlight?: number }) {
  return (
    <div className="ui-panel rounded-xl p-4 space-y-2">
      {RUNGS.map((r, i) => {
        const logSpan = Math.log10(1) - Math.log10(1.6e-35);
        const pos =
          (Math.log10(1) - Math.log10(r.scale_m)) / logSpan;
        return (
          <div key={r.label} className="flex items-center gap-3 text-xs">
            <span className="w-20 text-[var(--text-muted)] shrink-0">
              {r.label}
            </span>
            <div className="flex-1 h-2 rounded-full bg-zinc-800/80 relative">
              <div
                className={`absolute top-0 h-2 rounded-full ${
                  highlight === i ? "bg-amber-400" : "bg-cyan-600/80"
                }`}
                style={{ width: `${Math.max(4, pos * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[var(--text-secondary)] w-24 text-right">
              {r.scale_m.toExponential(1)} m
            </span>
          </div>
        );
      })}
      <p className="text-[10px] text-[var(--text-muted)] pt-1">
        * Effective length scales from energies via ħc/E — order-of-magnitude only.
      </p>
    </div>
  );
}
