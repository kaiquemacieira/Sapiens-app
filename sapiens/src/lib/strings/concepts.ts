/**
 * Educational string-theory reference material — SAPIENS Phase 21
 * Popular-science level; not a research toolkit.
 */

export interface StringConcept {
  id: string;
  title: { en: string; pt: string };
  body: { en: string; pt: string };
  icon: string;
}

export const CONCEPTS: StringConcept[] = [
  {
    id: "strings",
    title: { en: "Strings, not points", pt: "Cordas, não pontos" },
    body: {
      en: "In string theory, the elementary objects are one-dimensional strings (open or closed) whose vibrational modes correspond to different particles.",
      pt: "Na teoria das cordas, os objetos elementares são cordas unidimensionais (abertas ou fechadas) cujos modos de vibração correspondem a diferentes partículas.",
    },
    icon: "∿",
  },
  {
    id: "dimensions",
    title: {
      en: "Extra dimensions",
      pt: "Dimensões extras",
    },
    body: {
      en: "Consistent superstring theories require 10 spacetime dimensions (11 in M-theory). Extra dimensions may be compactified at tiny scales.",
      pt: "Teorias de supercordas consistentes exigem 10 dimensões do espaço-tempo (11 na teoria M). Dimensões extras podem ser compactificadas em escalas minúsculas.",
    },
    icon: "⧉",
  },
  {
    id: "planck",
    title: { en: "Planck scale", pt: "Escala de Planck" },
    body: {
      en: "Strings are often imagined near the Planck length ~1.6×10⁻³⁵ m — far below current experimental reach.",
      pt: "As cordas são imaginadas perto do comprimento de Planck ~1,6×10⁻³⁵ m — muito abaixo do alcance experimental atual.",
    },
    icon: "ℓ",
  },
  {
    id: "duality",
    title: { en: "Dualities", pt: "Dualidades" },
    body: {
      en: "Different-looking string theories can be physically equivalent (T-duality, S-duality), suggesting a deeper unified structure (M-theory).",
      pt: "Teorias de cordas de aparência diferente podem ser fisicamente equivalentes (dualidade T, S), sugerindo uma estrutura unificada mais profunda (teoria M).",
    },
    icon: "⇄",
  },
  {
    id: "ads",
    title: { en: "AdS/CFT & holography", pt: "AdS/CFT e holografia" },
    body: {
      en: "The AdS/CFT correspondence relates gravity in a bulk spacetime to a quantum field theory on the boundary — a major bridge to black-hole physics.",
      pt: "A correspondência AdS/CFT relaciona gravidade num bulk a uma teoria quântica de campos na fronteira — ponte importante com a física de buracos negros.",
    },
    icon: "◎",
  },
  {
    id: "status",
    title: { en: "Empirical status", pt: "Estatuto empírico" },
    body: {
      en: "String theory is a leading candidate for quantum gravity but lacks direct experimental confirmation. Treat this module as conceptual exploration.",
      pt: "A teoria das cordas é candidata principal à gravidade quântica, mas sem confirmação experimental direta. Este módulo é exploração conceptual.",
    },
    icon: "?",
  },
];

export interface StringTheoryVariant {
  id: string;
  name: string;
  dimensions: number;
  notes: { en: string; pt: string };
}

export const VARIANTS: StringTheoryVariant[] = [
  {
    id: "typeI",
    name: "Type I",
    dimensions: 10,
    notes: {
      en: "Open and closed strings; N=1 supersymmetry in 10D.",
      pt: "Cordas abertas e fechadas; supersimetria N=1 em 10D.",
    },
  },
  {
    id: "typeIIA",
    name: "Type IIA",
    dimensions: 10,
    notes: {
      en: "Closed strings; non-chiral; related to M-theory via circle compactification.",
      pt: "Cordas fechadas; não quiral; ligada à teoria M via compactificação em círculo.",
    },
  },
  {
    id: "typeIIB",
    name: "Type IIB",
    dimensions: 10,
    notes: {
      en: "Closed strings; chiral; self-dual under S-duality.",
      pt: "Cordas fechadas; quiral; auto-dual sob dualidade S.",
    },
  },
  {
    id: "hetO",
    name: "Heterotic SO(32)",
    dimensions: 10,
    notes: {
      en: "Hybrid right-moving superstring + left-moving bosonic string.",
      pt: "Híbrido: supercorda à direita + corda bosónica à esquerda.",
    },
  },
  {
    id: "hetE",
    name: "Heterotic E₈×E₈",
    dimensions: 10,
    notes: {
      en: "Historically important for phenomenology and Calabi–Yau compactifications.",
      pt: "Historicamente importante para fenomenologia e compactificações de Calabi–Yau.",
    },
  },
  {
    id: "mtheory",
    name: "M-theory",
    dimensions: 11,
    notes: {
      en: "Proposed 11D framework unifying the five superstring theories; includes membranes (branes).",
      pt: "Proposta em 11D que unifica as cinco teorias de supercordas; inclui membranas (branes).",
    },
  },
];

/** Planck units (SI) */
export const PLANCK = {
  length_m: 1.616255e-35,
  time_s: 5.391247e-44,
  mass_kg: 2.176434e-8,
  energy_GeV: 1.22089e19,
};

export const TIMELINE: {
  year: number;
  title: { en: string; pt: string };
}[] = [
  {
    year: 1968,
    title: {
      en: "Dual resonance models (Veneziano)",
      pt: "Modelos de ressonância dual (Veneziano)",
    },
  },
  {
    year: 1970,
    title: {
      en: "String interpretation (Nambu, Nielsen, Susskind)",
      pt: "Interpretação em cordas (Nambu, Nielsen, Susskind)",
    },
  },
  {
    year: 1984,
    title: {
      en: "First superstring revolution (Green–Schwarz)",
      pt: "Primeira revolução das supercordas (Green–Schwarz)",
    },
  },
  {
    year: 1995,
    title: {
      en: "Second revolution & M-theory (Witten et al.)",
      pt: "Segunda revolução e teoria M (Witten et al.)",
    },
  },
  {
    year: 1997,
    title: {
      en: "AdS/CFT correspondence (Maldacena)",
      pt: "Correspondência AdS/CFT (Maldacena)",
    },
  },
];
