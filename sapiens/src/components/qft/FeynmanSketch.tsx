"use client";

/** Minimal SVG Feynman-like sketch for e⁺e⁻ → μ⁺μ⁻ via photon (s-channel). */
export default function FeynmanSketch() {
  return (
    <svg
      viewBox="0 0 280 160"
      className="w-full max-w-sm mx-auto rounded-xl bg-black/80 border border-[var(--panel-border)]"
      role="img"
      aria-label="Feynman diagram sketch"
    >
      {/* incoming e- */}
      <line x1="20" y1="30" x2="110" y2="80" stroke="#38bdf8" strokeWidth="2" />
      <polygon points="100,72 112,80 100,88" fill="#38bdf8" />
      <text x="24" y="24" fill="#7dd3fc" fontSize="11">
        e⁻
      </text>

      {/* incoming e+ */}
      <line x1="20" y1="130" x2="110" y2="80" stroke="#38bdf8" strokeWidth="2" />
      <polygon points="100,72 112,80 100,88" fill="#38bdf8" opacity="0" />
      <text x="24" y="144" fill="#7dd3fc" fontSize="11">
        e⁺
      </text>

      {/* virtual photon */}
      <path
        d="M110 80 Q140 60 170 80 Q140 100 110 80"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <text x="138" y="52" fill="#fcd34d" fontSize="11">
        γ*
      </text>

      {/* outgoing mu- */}
      <line x1="170" y1="80" x2="260" y2="30" stroke="#f472b6" strokeWidth="2" />
      <text x="240" y="24" fill="#f9a8d4" fontSize="11">
        μ⁻
      </text>

      {/* outgoing mu+ */}
      <line x1="170" y1="80" x2="260" y2="130" stroke="#f472b6" strokeWidth="2" />
      <text x="240" y="144" fill="#f9a8d4" fontSize="11">
        μ⁺
      </text>

      <text x="70" y="156" fill="#64748b" fontSize="9">
        Sketch only — not a computed amplitude
      </text>
    </svg>
  );
}
