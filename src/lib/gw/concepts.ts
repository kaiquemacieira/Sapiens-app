/**
 * Educational gravitational-wave material — SAPIENS Phase 26
 */

export interface GwSource {
  id: string;
  name: { en: string; pt: string };
  freq: { en: string; pt: string };
  detectors: string;
  notes: { en: string; pt: string };
}

export const SOURCES: GwSource[] = [
  {
    id: "bbh",
    name: {
      en: "Binary black holes",
      pt: "Binárias de buracos negros",
    },
    freq: { en: "Hz – kHz (late inspiral)", pt: "Hz – kHz (inspiral tardio)" },
    detectors: "LIGO / Virgo / KAGRA",
    notes: {
      en: "First direct detection: GW150914. Stellar-mass mergers out to cosmological distances.",
      pt: "Primeira deteção direta: GW150914. Fusões estelares até distâncias cosmológicas.",
    },
  },
  {
    id: "bns",
    name: {
      en: "Binary neutron stars",
      pt: "Binárias de estrelas de nêutrons",
    },
    freq: { en: "Hz – kHz", pt: "Hz – kHz" },
    detectors: "LIGO / Virgo + EM follow-up",
    notes: {
      en: "GW170817 + kilonova: multi-messenger milestone; constrains Hubble constant and nuclear EOS.",
      pt: "GW170817 + kilonova: marco multi-mensageiro; restringe H₀ e a EOS nuclear.",
    },
  },
  {
    id: "emri",
    name: {
      en: "EMRIs / massive BH binaries",
      pt: "EMRIs / binárias de BN massivos",
    },
    freq: { en: "mHz", pt: "mHz" },
    detectors: "LISA (future)",
    notes: {
      en: "Millihertz band: capture of stellar objects by SMBHs and SMBH mergers in galaxies.",
      pt: "Banda milhertz: captura por SMBHs e fusões de SMBHs em galáxias.",
    },
  },
  {
    id: "ptas",
    name: {
      en: "Supermassive BH nHz background",
      pt: "Fundo nHz de SMBHs",
    },
    freq: { en: "nHz", pt: "nHz" },
    detectors: "Pulsar timing arrays",
    notes: {
      en: "PTAs (NANOGrav, EPTA, PPTA, IPTA) report evidence for a stochastic nHz background.",
      pt: "PTAs (NANOGrav, EPTA, PPTA, IPTA) reportam evidência de um fundo estocástico em nHz.",
    },
  },
];

export const MILESTONES: {
  year: number;
  title: { en: string; pt: string };
}[] = [
  {
    year: 1916,
    title: {
      en: "Einstein predicts gravitational waves",
      pt: "Einstein prevê ondas gravitacionais",
    },
  },
  {
    year: 1974,
    title: {
      en: "Hulse–Taylor pulsar (indirect evidence)",
      pt: "Pulsar Hulse–Taylor (evidência indireta)",
    },
  },
  {
    year: 2015,
    title: {
      en: "GW150914 — first direct detection",
      pt: "GW150914 — primeira deteção direta",
    },
  },
  {
    year: 2017,
    title: {
      en: "GW170817 — multi-messenger BNS",
      pt: "GW170817 — BNS multi-mensageiro",
    },
  },
  {
    year: 2023,
    title: {
      en: "PTA evidence for nHz background",
      pt: "Evidência PTA de fundo em nHz",
    },
  },
];

/**
 * Toy inspiral frequency evolution (Newtonian chirp):
 * f(t) rises as coalescence approaches.
 * Returns frequency in Hz for demo timeline t in [0,1] (1 = near merger).
 */
export function chirpFrequencyHz(
  tNorm: number,
  fMin = 30,
  fMax = 250
): number {
  const u = Math.min(1, Math.max(0, tNorm));
  // f ∝ (tc − t)^(−3/8) → sharp rise near the end
  const tau = Math.max(1e-4, 1 - u);
  const f = fMin * Math.pow(tau, -3 / 8);
  return Math.min(f, fMax);
}

/** Rough strain amplitude scale (arbitrary educational units) */
export function chirpStrain(tNorm: number): number {
  const u = Math.min(1, Math.max(0, tNorm));
  const tau = Math.max(1e-4, 1 - u);
  // amplitude grows toward merger then we cut (no full ringdown model)
  return Math.pow(tau, -1 / 4) * (u < 0.98 ? 1 : Math.exp(-(u - 0.98) * 80));
}

/**
 * Chirp mass Mc / M☉ from component masses (equal mass demo).
 * Mc = μ^{3/5} M^{2/5}
 */
export function chirpMass(m1: number, m2: number): number {
  const M = m1 + m2;
  const mu = (m1 * m2) / M;
  return Math.pow(mu, 0.6) * Math.pow(M, 0.4);
}
