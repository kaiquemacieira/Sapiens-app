/**
 * Educational QFT reference — SAPIENS Phase 22
 * Conceptual level; not a lattice/QFT simulator.
 */

export interface QftConcept {
  id: string;
  title: { en: string; pt: string };
  body: { en: string; pt: string };
  icon: string;
}

export const QFT_CONCEPTS: QftConcept[] = [
  {
    id: "fields",
    title: {
      en: "Fields are fundamental",
      pt: "Os campos são fundamentais",
    },
    body: {
      en: "In QFT, particles are excitations of underlying fields that exist everywhere. An electron is a quantum of the electron field; a photon is a quantum of the electromagnetic field.",
      pt: "Na QFT, as partículas são excitações de campos subjacentes presentes em todo o lado. Um eletrão é um quantum do campo eletrónico; um fotão é um quantum do campo eletromagnético.",
    },
    icon: "≋",
  },
  {
    id: "second-quant",
    title: {
      en: "Second quantization",
      pt: "Segunda quantização",
    },
    body: {
      en: "Instead of a wavefunction for a fixed number of particles, QFT uses operators that create and annihilate quanta — naturally handling variable particle number.",
      pt: "Em vez de uma função de onda para um número fixo de partículas, a QFT usa operadores que criam e aniquilam quanta — lidando naturalmente com número variável de partículas.",
    },
    icon: "±",
  },
  {
    id: "feynman",
    title: {
      en: "Feynman diagrams",
      pt: "Diagramas de Feynman",
    },
    body: {
      en: "Perturbative calculations are organized as diagrams: lines for propagating quanta, vertices for interactions. They are bookkeeping tools for amplitudes, not literal pictures of paths.",
      pt: "Cálculos perturbativos organizam-se em diagramas: linhas para quanta que se propagam, vértices para interações. São ferramentas de contabilidade para amplitudes, não trajetórias literais.",
    },
    icon: "⟨⟩",
  },
  {
    id: "gauge",
    title: {
      en: "Gauge symmetry",
      pt: "Simetria de gauge",
    },
    body: {
      en: "Forces in the Standard Model arise from local gauge symmetries (U(1), SU(2), SU(3)). Gauge bosons mediate the interactions.",
      pt: "As forças no Modelo Padrão vêm de simetrias de gauge locais (U(1), SU(2), SU(3)). Os bosões de gauge mediulam as interações.",
    },
    icon: "G",
  },
  {
    id: "renorm",
    title: {
      en: "Renormalization",
      pt: "Renormalização",
    },
    body: {
      en: "Infinities in naive loop calculations are absorbed into redefined parameters. Couplings can “run” with energy scale.",
      pt: "Infinidades em cálculos de loops ingénuos absorvem-se em parâmetros redefinidos. Os acoplamentos podem “correr” com a escala de energia.",
    },
    icon: "μ",
  },
  {
    id: "qft-gr",
    title: {
      en: "QFT and gravity",
      pt: "QFT e gravidade",
    },
    body: {
      en: "QFT on curved spacetime works in many regimes, but a complete quantum theory of gravity remains open — one motivation for string theory and related ideas.",
      pt: "QFT em espaço-tempo curvo funciona em muitos regimes, mas uma teoria quântica completa da gravidade continua em aberto — uma motivação para cordas e ideias afins.",
    },
    icon: "g",
  },
];

export interface SmForce {
  id: string;
  name: { en: string; pt: string };
  bosons: string;
  group: string;
  range: { en: string; pt: string };
}

export const SM_FORCES: SmForce[] = [
  {
    id: "em",
    name: { en: "Electromagnetic", pt: "Eletromagnética" },
    bosons: "γ (photon)",
    group: "U(1)ᵧ",
    range: { en: "Infinite", pt: "Infinito" },
  },
  {
    id: "weak",
    name: { en: "Weak", pt: "Fraca" },
    bosons: "W±, Z⁰",
    group: "SU(2)ₗ",
    range: { en: "~10⁻¹⁸ m", pt: "~10⁻¹⁸ m" },
  },
  {
    id: "strong",
    name: { en: "Strong (QCD)", pt: "Forte (QCD)" },
    bosons: "g (gluons)",
    group: "SU(3)c",
    range: { en: "~10⁻¹⁵ m (confinement)", pt: "~10⁻¹⁵ m (confinamento)" },
  },
];

/** Simple 1-loop inspired running of α_s (illustrative, not PDG fit) */
export function alphaSRunning(Q_GeV: number): number {
  // λ_QCD-ish toy: α_s(Q) ≈ 2π / (b ln(Q/Λ)) with b~7, Λ~0.2 GeV
  const Lambda = 0.2;
  const b = 7;
  const Q = Math.max(Q_GeV, Lambda * 1.05);
  const a = (2 * Math.PI) / (b * Math.log(Q / Lambda));
  return Math.min(Math.max(a, 0.05), 1.2);
}

export const COMPARISON: {
  topic: { en: string; pt: string };
  qm: { en: string; pt: string };
  qft: { en: string; pt: string };
}[] = [
  {
    topic: { en: "Basic object", pt: "Objeto básico" },
    qm: { en: "Wavefunction ψ(x,t)", pt: "Função de onda ψ(x,t)" },
    qft: {
      en: "Operator-valued field φ(x)",
      pt: "Campo com valores em operadores φ(x)",
    },
  },
  {
    topic: { en: "Particle number", pt: "Número de partículas" },
    qm: { en: "Usually fixed", pt: "Em geral fixo" },
    qft: {
      en: "Variable (creation/annihilation)",
      pt: "Variável (criação/aniquilação)",
    },
  },
  {
    topic: { en: "Relativity", pt: "Relatividade" },
    qm: {
      en: "Often non-relativistic",
      pt: "Muitas vezes não relativista",
    },
    qft: {
      en: "Built to be Lorentz-covariant",
      pt: "Construída para ser covariante de Lorentz",
    },
  },
  {
    topic: { en: "Forces", pt: "Forças" },
    qm: {
      en: "Potentials in a Hamiltonian",
      pt: "Potenciais num Hamiltoniano",
    },
    qft: {
      en: "Exchange of force-carrier quanta",
      pt: "Troca de quanta mediadores",
    },
  },
];
