/**
 * Educational Kerr (spinning BH) formulas — Phase 25
 * Geometric units where G = c = 1 unless converted via Rs.
 */

/** Dimensionless spin |a*| ≤ 1 */
export function clampSpin(aStar: number): number {
  return Math.min(1, Math.max(-1, aStar));
}

/**
 * Horizon radius in units of M (G=c=1): r_+ = M (1 + sqrt(1 - a*²))
 * In units of Schwarzschild Rs = 2M: r_+/Rs = (1 + sqrt(1-a*²))/2
 */
export function horizonOverRs(aStar: number): number {
  const a = clampSpin(aStar);
  return (1 + Math.sqrt(1 - a * a)) / 2;
}

/**
 * Ergosphere outer edge (static limit) in equatorial plane: r_erg/M = 1 + sqrt(1 - a*² cos²θ)
 * At equator cosθ=0: r_erg/M = 1 + sqrt(1-a*²) → /Rs = same/2
 */
export function ergosphereEquatorOverRs(aStar: number): number {
  const a = clampSpin(aStar);
  return (1 + Math.sqrt(1 - a * a)) / 2; // equals r_+ for equator outer... wait
  // Actually r_erg/M = 1 + sqrt(1 - a² cos²θ); equator cosθ=0 → 1+1 = 2 → r_erg = 2M = Rs
  // For equator: r_erg/M = 2 always when a≠0? sqrt(1-0)=1 → 1+1=2 → r=2M=Rs
  // At poles cosθ=±1: r_erg/M = 1+sqrt(1-a²) = r_+/M
  // So equatorial ergosphere extends to Rs. Return Rs units:
  return 1; // equatorial static limit is at Rs = 2M
}

/** Correct equatorial ergosphere in Rs units is always 1 (i.e. 2M) for Kerr */
export function ergosphereEqRs(): number {
  return 1;
}

/**
 * Prograde ISCO / M for Kerr (Bardeen et al.).
 * Returns r_ISCO / M; divide by 2 for units of Rs.
 */
export function iscoOverM(aStar: number): number {
  const a = clampSpin(aStar);
  // For retrograde use negative a
  const Z1 =
    1 +
    Math.pow(1 - a * a, 1 / 3) *
      (Math.pow(1 + a, 1 / 3) + Math.pow(1 - a, 1 / 3));
  const Z2 = Math.sqrt(3 * a * a + Z1 * Z1);
  // prograde (upper sign convention for a>0 prograde)
  if (a >= 0) {
    return 3 + Z2 - Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2));
  }
  return 3 + Z2 + Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2));
}

export function iscoOverRs(aStar: number): number {
  return iscoOverM(aStar) / 2;
}

/** Photon orbit (unstable) in equatorial plane for prograde — approximate educational */
export function photonOrbitOverRs(aStar: number): number {
  // Schwarzschild: 1.5 Rs. Kerr prograde decreases toward 0.5 Rs as a→1
  const a = Math.abs(clampSpin(aStar));
  // Simple interpolation educational (exact formula is more involved)
  return 1.5 - a * 1.0;
}

export const OBSERVATIONS: {
  id: string;
  title: { en: string; pt: string };
  body: { en: string; pt: string };
}[] = [
  {
    id: "eht",
    title: {
      en: "Event Horizon Telescope",
      pt: "Event Horizon Telescope",
    },
    body: {
      en: "Images of M87* (2019) and Sgr A* (2022) show a bright ring consistent with a black-hole shadow lensed by strong gravity.",
      pt: "Imagens de M87* (2019) e Sgr A* (2022) mostram um anel brilhante consistente com a sombra de um buraco negro sob lente gravitacional forte.",
    },
  },
  {
    id: "s2",
    title: {
      en: "S-stars at the Galactic Center",
      pt: "Estrelas S no Centro Galáctico",
    },
    body: {
      en: "Orbits of stars such as S2 around Sgr A* constrain the central mass to ~4×10⁶ M☉ and test GR in the strong-field regime.",
      pt: "Órbitas de estrelas como S2 em torno de Sgr A* fixam a massa central em ~4×10⁶ M☉ e testam a RG em campo forte.",
    },
  },
  {
    id: "xrbs",
    title: {
      en: "X-ray binaries",
      pt: "Binárias de raios X",
    },
    body: {
      en: "Stellar-mass black holes in systems like Cygnus X-1 reveal accretion physics and spin constraints from continuum and iron-line methods.",
      pt: "Buracos negros estelares em sistemas como Cygnus X-1 revelam física de acreção e vinculos ao spin via contínuo e linha de ferro.",
    },
  },
  {
    id: "gw",
    title: {
      en: "Gravitational waves",
      pt: "Ondas gravitacionais",
    },
    body: {
      en: "LIGO/Virgo/KAGRA detect mergers of stellar-mass black holes, measuring masses, spins, and testing the remnant ringdown.",
      pt: "LIGO/Virgo/KAGRA detetam fusões de buracos negros estelares, medindo massas, spins e testando o ringdown do remnant.",
    },
  },
];
