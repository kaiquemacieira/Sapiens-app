/**
 * Educational relativity formulas — SAPIENS Phase 19
 * SI / geometric helpers for demos. Not a numerical GR solver.
 */

/** Speed of light (m/s) */
export const C = 299_792_458;

/** Gravitational constant (m³ kg⁻¹ s⁻²) */
export const G = 6.6743e-11;

/** Solar mass (kg) */
export const M_SUN = 1.98847e30;

/** Lorentz factor γ = 1 / sqrt(1 − β²), β = v/c */
export function lorentzGamma(beta: number): number {
  const b = Math.min(Math.max(beta, 0), 0.999999999);
  return 1 / Math.sqrt(1 - b * b);
}

/** Time dilation: Δt_moving = Δt_rest / γ  (proper time on moving clock) */
export function timeDilationProper(deltaTRest: number, beta: number): number {
  return deltaTRest / lorentzGamma(beta);
}

/** Length contraction: L = L0 / γ along motion */
export function lengthContraction(L0: number, beta: number): number {
  return L0 / lorentzGamma(beta);
}

/**
 * Relativistic velocity addition (collinear):
 * w = (v + u) / (1 + vu/c²) with velocities as β = v/c
 */
export function velocityAdditionBeta(betaV: number, betaU: number): number {
  return (betaV + betaU) / (1 + betaV * betaU);
}

/** Schwarzschild radius Rs = 2GM/c² (meters) */
export function schwarzschildRadius(massKg: number): number {
  return (2 * G * massKg) / (C * C);
}

export function schwarzschildRadiusFromSolarMasses(mSun: number): number {
  return schwarzschildRadius(mSun * M_SUN);
}

/**
 * Gravitational time dilation (Schwarzschild, static observers):
 * dτ/dt = sqrt(1 − Rs/r) for r > Rs
 */
export function gravitationalTimeFactor(rMeters: number, massKg: number): number {
  const rs = schwarzschildRadius(massKg);
  if (rMeters <= rs) return 0;
  return Math.sqrt(1 - rs / rMeters);
}

/**
 * Light deflection angle (GR, weak field, radians) ≈ 4GM/(c²b) = 2 Rs / b
 * for impact parameter b.
 */
export function lightDeflectionRadians(massKg: number, impactMeters: number): number {
  if (impactMeters <= 0) return NaN;
  const rs = schwarzschildRadius(massKg);
  return (2 * rs) / impactMeters;
}

/** Convert meters to convenient display unit */
export function formatLength(meters: number): { value: number; unit: string } {
  const abs = Math.abs(meters);
  if (abs >= 1e16) return { value: meters / 9.4607e15, unit: "ly" };
  if (abs >= 1e12) return { value: meters / 1.495978707e11, unit: "AU" };
  if (abs >= 1e6) return { value: meters / 1e3, unit: "km" };
  if (abs >= 1) return { value: meters, unit: "m" };
  if (abs >= 1e-3) return { value: meters * 1e3, unit: "mm" };
  return { value: meters * 1e6, unit: "μm" };
}

/** Famous reference masses (solar masses) */
export const REF_MASSES: {
  id: string;
  name: { en: string; pt: string };
  mSun: number;
}[] = [
  { id: "sun", name: { en: "Sun", pt: "Sol" }, mSun: 1 },
  { id: "earth", name: { en: "Earth", pt: "Terra" }, mSun: 3.003e-6 },
  {
    id: "sgrA",
    name: { en: "Sgr A* (approx.)", pt: "Sgr A* (aprox.)" },
    mSun: 4.15e6,
  },
  {
    id: "m87",
    name: { en: "M87* (approx.)", pt: "M87* (aprox.)" },
    mSun: 6.5e9,
  },
  {
    id: "ns",
    name: { en: "Neutron star ~1.4 M☉", pt: "Estrela de nêutrons ~1.4 M☉" },
    mSun: 1.4,
  },
];
