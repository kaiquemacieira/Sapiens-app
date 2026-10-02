/**
 * Educational dark-matter material — SAPIENS Phase 24
 */

export interface DmEvidence {
  id: string;
  title: { en: string; pt: string };
  body: { en: string; pt: string };
  icon: string;
}

export const EVIDENCE: DmEvidence[] = [
  {
    id: "rotation",
    title: {
      en: "Galaxy rotation curves",
      pt: "Curvas de rotação galácticas",
    },
    body: {
      en: "Stars in the outer disks of spirals orbit faster than visible mass predicts. A dark halo can supply the missing gravity.",
      pt: "Estrelas no disco exterior de espirais orbitam mais depressa do que a massa visível prevê. Um halo escuro pode fornecer a gravidade em falta.",
    },
    icon: "◎",
  },
  {
    id: "lensing",
    title: {
      en: "Gravitational lensing",
      pt: "Lentes gravitacionais",
    },
    body: {
      en: "Galaxy clusters bend light more strongly than their stars and gas alone would imply — mass maps reveal extended dark components.",
      pt: "Aglomerados desviam a luz mais do que estrelas e gás sugerem — mapas de massa revelam componentes escuros extensos.",
    },
    icon: "⌒",
  },
  {
    id: "cmb",
    title: {
      en: "Cosmic microwave background",
      pt: "Fundo cósmico de micro-ondas",
    },
    body: {
      en: "Acoustic peaks in the CMB power spectrum fit a universe with ~27% dark matter (ΛCDM), distinct from baryons and dark energy.",
      pt: "Picos acústicos no espectro do CMB ajustam-se a um universo com ~27% de matéria escura (ΛCDM), distinta de bariões e energia escura.",
    },
    icon: "≋",
  },
  {
    id: "bullet",
    title: {
      en: "Bullet Cluster",
      pt: "Aglomerado Bullet",
    },
    body: {
      en: "Colliding clusters show lensing mass offset from X-ray gas — hard to explain without a collisionless dark component (or modified gravity with care).",
      pt: "Aglomerados em colisão mostram massa de lente deslocada do gás em X — difícil sem componente escura sem colisões (ou gravidade modificada com cuidado).",
    },
    icon: "⚡",
  },
  {
    id: "structure",
    title: {
      en: "Large-scale structure",
      pt: "Estrutura em grande escala",
    },
    body: {
      en: "Cold dark matter simulations grow the cosmic web of filaments and voids in broad agreement with galaxy surveys.",
      pt: "Simulações de matéria escura fria formam a teia cósmica de filamentos e vazios em acordo geral com levantamentos de galáxias.",
    },
    icon: "🕸",
  },
];

export interface DmCandidate {
  id: string;
  name: string;
  type: { en: string; pt: string };
  massHint: { en: string; pt: string };
  status: { en: string; pt: string };
}

export const CANDIDATES: DmCandidate[] = [
  {
    id: "wimp",
    name: "WIMPs",
    type: {
      en: "Weakly interacting massive particles",
      pt: "Partículas massivas de interação fraca",
    },
    massHint: {
      en: "GeV–TeV scale (typical searches)",
      pt: "Escala GeV–TeV (pesquisas típicas)",
    },
    status: {
      en: "Long-favored; direct detection has not confirmed a signal",
      pt: "Longamente favorecidos; deteção direta ainda sem sinal confirmado",
    },
  },
  {
    id: "axion",
    name: "Axions / ALPs",
    type: {
      en: "Ultra-light pseudoscalars",
      pt: "Pseudoescalares ultraleves",
    },
    massHint: {
      en: "μeV–meV (QCD axion window varies)",
      pt: "μeV–meV (janela do axião QCD varia)",
    },
    status: {
      en: "Motivated by CP problem in QCD; haloscopes & helioscopes searching",
      pt: "Motivados pelo problema CP na QCD; haloscópios e helioscópios à procura",
    },
  },
  {
    id: "sterile",
    name: "Sterile neutrinos",
    type: {
      en: "Right-handed neutrino states",
      pt: "Estados de neutrino right-handed",
    },
    massHint: {
      en: "keV warm DM scenarios",
      pt: "Cenários de ME quente em keV",
    },
    status: {
      en: "Could be warm DM; X-ray anomaly claims remain debated",
      pt: "Podem ser ME quente; anomalias em X continuam debatidas",
    },
  },
  {
    id: "pbh",
    name: "Primordial black holes",
    type: {
      en: "Early-universe collapsed objects",
      pt: "Objetos colapsados no universo primordial",
    },
    massHint: {
      en: "Asteroid to stellar masses (window constraints)",
      pt: "Massas de asteroide a estelares (janelas limitadas)",
    },
    status: {
      en: "Tightly constrained by lensing, CMB, GW; niche windows remain",
      pt: "Fortemente limitados por lentes, CMB, GW; janelas estreitas restam",
    },
  },
  {
    id: "mond",
    name: "MOND / modified gravity",
    type: {
      en: "Alternative to particle DM (not a particle)",
      pt: "Alternativa à ME particulada (não é partícula)",
    },
    massHint: {
      en: "—",
      pt: "—",
    },
    status: {
      en: "Fits many rotation curves; struggles with clusters & CMB without extra dark component",
      pt: "Ajusta muitas curvas de rotação; dificuldade em aglomerados e CMB sem componente escura extra",
    },
  },
];

/** Toy flat rotation curve: v² = G M(<r)/r with NFW-like / baryon+halo mix (illustrative) */
export function rotationCurve(
  r_kpc: number,
  opts: { mBaryon: number; mHalo: number; rHalo: number }
): number {
  // baryons concentrated: M_b(r) grows then saturates
  const rb = 5; // kpc scale length
  const mb =
    opts.mBaryon * (1 - Math.exp(-r_kpc / rb) * (1 + r_kpc / rb));
  // simple cored halo
  const mh =
    opts.mHalo *
    (r_kpc ** 2 / (r_kpc ** 2 + opts.rHalo ** 2));
  const M = Math.max(mb + mh, 1e-6);
  // v in km/s with M in 1e10 Msun, r in kpc: v ≈ 210 * sqrt(M_10 / r)
  const M10 = M;
  return 210 * Math.sqrt(M10 / Math.max(r_kpc, 0.1));
}

export const COSMIC_BUDGET = [
  { id: "dark_energy", fraction: 0.68, color: "#6366f1", label: { en: "Dark energy", pt: "Energia escura" } },
  { id: "dark_matter", fraction: 0.27, color: "#22d3ee", label: { en: "Dark matter", pt: "Matéria escura" } },
  { id: "baryons", fraction: 0.05, color: "#fbbf24", label: { en: "Ordinary matter", pt: "Matéria ordinária" } },
];
