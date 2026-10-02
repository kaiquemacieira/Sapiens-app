/**
 * Educational black-hole reference catalog — SAPIENS Phase 20
 * Masses are approximate literature values for demos.
 */

export interface BlackHoleRef {
  id: string;
  name: string;
  /** Solar masses */
  massSun: number;
  type: "stellar" | "intermediate" | "supermassive";
  distanceLy?: number;
  notes: { en: string; pt: string };
  /** Optional sky link */
  skyObjectId?: string;
}

export const BLACK_HOLES: BlackHoleRef[] = [
  {
    id: "stellar-10",
    name: "Stellar ~10 M☉",
    massSun: 10,
    type: "stellar",
    notes: {
      en: "Typical stellar-mass black hole from a collapsed massive star.",
      pt: "Buraco negro estelar típico de uma estrela massiva colapsada.",
    },
  },
  {
    id: "cygx1",
    name: "Cygnus X-1 (approx.)",
    massSun: 21,
    type: "stellar",
    distanceLy: 7200,
    notes: {
      en: "Famous high-mass X-ray binary; mass estimates ~21 M☉.",
      pt: "Binária de raios X famosa; massa estimada ~21 M☉.",
    },
  },
  {
    id: "sgrA",
    name: "Sagittarius A*",
    massSun: 4.15e6,
    type: "supermassive",
    distanceLy: 26000,
    skyObjectId: "sgr-a",
    notes: {
      en: "Milky Way’s central SMBH. Event Horizon Telescope imaged the shadow.",
      pt: "SMBH central da Via Láctea. Sombra observada pelo EHT.",
    },
  },
  {
    id: "m87",
    name: "M87*",
    massSun: 6.5e9,
    type: "supermassive",
    distanceLy: 53e6,
    notes: {
      en: "First black-hole shadow imaged by the EHT (2019).",
      pt: "Primeira sombra de buraco negro imageada pelo EHT (2019).",
    },
  },
  {
    id: "ton618",
    name: "TON 618 (approx.)",
    massSun: 6.6e10,
    type: "supermassive",
    distanceLy: 18e9,
    notes: {
      en: "Extreme quasar-hosted BH; mass highly uncertain.",
      pt: "BH extremo em quasar; massa muito incerta.",
    },
  },
];

/** Characteristic radii in units of Rs (Schwarzschild, non-spinning) */
export const RADII = {
  horizon: 1,
  photonSphere: 1.5,
  isco: 3,
  /** EHT shadow size scale ~ √27 Rs / 2 for critical impact — educational */
  shadowImpact: Math.sqrt(27) / 2, // ~2.598 Rs
} as const;
