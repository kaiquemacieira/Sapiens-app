/**
 * Educational quantum-gravity material — SAPIENS Phase 23
 */

export interface QgApproach {
  id: string;
  name: { en: string; pt: string };
  tagline: { en: string; pt: string };
  body: { en: string; pt: string };
  status: { en: string; pt: string };
}

export const APPROACHES: QgApproach[] = [
  {
    id: "semiclassical",
    name: {
      en: "Semiclassical gravity",
      pt: "Gravidade semiclassica",
    },
    tagline: {
      en: "QFT on a classical curved spacetime",
      pt: "QFT num espaço-tempo curvo clássico",
    },
    body: {
      en: "Treats geometry as classical (GR) while matter fields are quantum. Predicts Hawking radiation and cosmological particle creation. Breaks down near singularities or the Planck regime.",
      pt: "Trata a geometria como clássica (RG) e os campos de matéria como quânticos. Prevê radiação de Hawking e criação de partículas cosmológicas. Falha perto de singularidades ou na escala de Planck.",
    },
    status: {
      en: "Widely used; incomplete as full QG",
      pt: "Muito usada; incompleta como QG completa",
    },
  },
  {
    id: "strings",
    name: {
      en: "String theory / M-theory",
      pt: "Teoria das cordas / teoria M",
    },
    tagline: {
      en: "Gravity emerges from string excitations",
      pt: "A gravidade emerge de excitações de cordas",
    },
    body: {
      en: "A spin-2 mode of the closed string behaves as a graviton. Extra dimensions, dualities, and holography (AdS/CFT) connect gravity to quantum field theory.",
      pt: "Um modo de spin 2 da corda fechada comporta-se como gravitão. Dimensões extras, dualidades e holografia (AdS/CFT) ligam a gravidade à teoria quântica de campos.",
    },
    status: {
      en: "Leading candidate; not experimentally confirmed",
      pt: "Candidata principal; sem confirmação experimental",
    },
  },
  {
    id: "lqg",
    name: {
      en: "Loop quantum gravity",
      pt: "Gravidade quântica em laços",
    },
    tagline: {
      en: "Geometry itself is quantized",
      pt: "A própria geometria é quantizada",
    },
    body: {
      en: "Canonical approach: space is built from spin-network states; area and volume have discrete spectra. Aims to quantize GR without embedding it in a larger particle framework.",
      pt: "Abordagem canónica: o espaço é feito de estados de redes de spin; área e volume têm espectros discretos. Procura quantizar a RG sem a embutir num quadro de partículas maior.",
    },
    status: {
      en: "Active research program",
      pt: "Programa de investigação ativo",
    },
  },
  {
    id: "asymptotic",
    name: {
      en: "Asymptotic safety",
      pt: "Segurança assintótica",
    },
    tagline: {
      en: "Gravity may be renormalizable non-perturbatively",
      pt: "A gravidade pode ser renormalizável não perturbativamente",
    },
    body: {
      en: "Suggests a nontrivial ultraviolet fixed point for Newton’s constant and related couplings, so GR could make sense as a quantum field theory at all scales.",
      pt: "Sugere um ponto fixo ultravioleta não trivial para a constante de Newton e acoplamentos relacionados, de modo que a RG faça sentido como QFT em todas as escalas.",
    },
    status: {
      en: "Evidence from functional RG studies",
      pt: "Evidência de estudos de RG funcional",
    },
  },
  {
    id: "causal",
    name: {
      en: "Causal set / CDT",
      pt: "Causal sets / CDT",
    },
    tagline: {
      en: "Discrete spacetime with causal order",
      pt: "Espaço-tempo discreto com ordem causal",
    },
    body: {
      en: "Causal dynamical triangulations and causal sets replace smooth manifolds with discrete building blocks constrained by causality, recovering classical geometry in a continuum limit.",
      pt: "Triangulações dinâmicas causais e causal sets substituem variedades suaves por blocos discretos com causalidade, recuperando geometria clássica no limite contínuo.",
    },
    status: {
      en: "Numerical and conceptual progress",
      pt: "Progresso numérico e conceptual",
    },
  },
];

export const PROBLEMS: {
  title: { en: string; pt: string };
  body: { en: string; pt: string };
}[] = [
  {
    title: { en: "Non-renormalizability", pt: "Não renormalizabilidade" },
    body: {
      en: "Perturbative quantum GR generates uncontrollable divergences at high loop order — Newton’s constant has negative mass dimension.",
      pt: "A RG quântica perturbativa gera divergências incontroláveis em loops altos — a constante de Newton tem dimensão de massa negativa.",
    },
  },
  {
    title: { en: "Problem of time", pt: "Problema do tempo" },
    body: {
      en: "In canonical GR the Hamiltonian constraint implies a “frozen” formal dynamics; recovering everyday time evolution is subtle.",
      pt: "Na RG canónica, a restrição hamiltoniana implica uma dinâmica formal “congelada”; recuperar a evolução temporal quotidiana é subtil.",
    },
  },
  {
    title: {
      en: "Black-hole information",
      pt: "Informação em buracos negros",
    },
    body: {
      en: "Hawking radiation appears thermal. Whether information is preserved in a full quantum theory is a central puzzle linking QFT, gravity, and holography.",
      pt: "A radiação de Hawking parece térmica. Se a informação se preserva numa teoria quântica completa é um enigma central que liga QFT, gravidade e holografia.",
    },
  },
  {
    title: {
      en: "Empirical access",
      pt: "Acesso empírico",
    },
    body: {
      en: "Planck-scale effects are far beyond collider energies. Clues may come from cosmology, gravitational waves, or precision tests — still largely open.",
      pt: "Efeitos na escala de Planck estão muito além dos colisores. Pistas podem vir da cosmologia, ondas gravitacionais ou testes de precisão — ainda em aberto.",
    },
  },
];

/** Hawking temperature for Schwarzschild BH: T = ħ c³ / (8 π G M k_B) */
export function hawkingTemperatureKelvin(massSun: number): number {
  // T ≈ 6.17e-8 K * (M☉ / M)
  return (6.17e-8) / Math.max(massSun, 1e-30);
}

export function hawkingWavelengthMeters(massSun: number): number {
  // characteristic ħc / (kT) scale — order-of-magnitude
  const T = hawkingTemperatureKelvin(massSun);
  const k = 1.380649e-23;
  const hbar = 1.054571817e-34;
  const c = 299792458;
  return (hbar * c) / (k * T);
}
