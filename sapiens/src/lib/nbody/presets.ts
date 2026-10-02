/**
 * Educational N-body presets — Phase 18
 * Units: mass M☉, length AU, time years. G = 4π².
 */

import {
  createBody,
  G_SOLAR,
  type Body,
  type NBodyState,
} from "./engine";

export interface PresetDef {
  id: string;
  name: { en: string; pt: string };
  description: { en: string; pt: string };
  dt: number;
  stepsPerFrame: number;
  softening: number;
  cameraDistance: number;
  build: () => Body[];
}

function circularVelocity(M: number, r: number): number {
  // v = sqrt(G M / r) for circular orbit around fixed central mass
  return Math.sqrt((G_SOLAR * M) / r);
}

export const PRESETS: PresetDef[] = [
  {
    id: "sun-earth-moon",
    name: { en: "Sun–Earth–Moon (toy)", pt: "Sol–Terra–Lua (simplificado)" },
    description: {
      en: "Simplified coplanar system. Not to scale for Moon distance aesthetics.",
      pt: "Sistema coplanar simplificado. Distâncias da Lua não em escala real.",
    },
    dt: 0.002,
    stepsPerFrame: 4,
    softening: 0.01,
    cameraDistance: 3.5,
    build: () => {
      const sun = createBody({
        id: "sun",
        name: "Sun",
        mass: 1,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        radius: 0.12,
        color: "#fbbf24",
      });
      const rE = 1;
      const vE = circularVelocity(1, rE);
      const earth = createBody({
        id: "earth",
        name: "Earth",
        mass: 3e-6,
        x: rE,
        y: 0,
        z: 0,
        vx: 0,
        vy: vE,
        vz: 0,
        radius: 0.04,
        color: "#38bdf8",
      });
      // Moon farther than reality for visibility (~0.15 AU toy)
      const rM = 0.15;
      const vM = vE + circularVelocity(3e-6, rM) * 0.15;
      const moon = createBody({
        id: "moon",
        name: "Moon",
        mass: 3.7e-8,
        x: rE + rM,
        y: 0,
        z: 0,
        vx: 0,
        vy: vM,
        vz: 0,
        radius: 0.02,
        color: "#a1a1aa",
      });
      return [sun, earth, moon];
    },
  },
  {
    id: "binary",
    name: { en: "Equal-mass binary", pt: "Binária de massas iguais" },
    description: {
      en: "Two 1 M☉ stars in a circular binary about the barycenter.",
      pt: "Duas estrelas de 1 M☉ em órbita circular em torno do baricentro.",
    },
    dt: 0.005,
    stepsPerFrame: 3,
    softening: 0.02,
    cameraDistance: 4,
    build: () => {
      const sep = 2;
      const m = 1;
      const v = 0.5 * circularVelocity(2 * m, sep);
      return [
        createBody({
          id: "a",
          name: "Star A",
          mass: m,
          x: -sep / 2,
          y: 0,
          z: 0,
          vx: 0,
          vy: -v,
          vz: 0,
          radius: 0.1,
          color: "#f472b6",
        }),
        createBody({
          id: "b",
          name: "Star B",
          mass: m,
          x: sep / 2,
          y: 0,
          z: 0,
          vx: 0,
          vy: v,
          vz: 0,
          radius: 0.1,
          color: "#22d3ee",
        }),
      ];
    },
  },
  {
    id: "three-body",
    name: { en: "Figure-eight three-body", pt: "Três corpos (figura oito)" },
    description: {
      en: "Famous choreography (Moore / Chenciner–Montgomery) — sensitive to dt.",
      pt: "Coreografia clássica (Moore / Chenciner–Montgomery) — sensível ao dt.",
    },
    dt: 0.001,
    stepsPerFrame: 6,
    softening: 0.001,
    cameraDistance: 2.5,
    build: () => {
      // Approximate figure-eight initial conditions (scaled)
      const scale = 1;
      const bodies = [
        {
          x: 0.97000436 * scale,
          y: -0.24308753 * scale,
          vx: 0.466203685 * scale,
          vy: 0.43236573 * scale,
        },
        {
          x: -0.97000436 * scale,
          y: 0.24308753 * scale,
          vx: 0.466203685 * scale,
          vy: 0.43236573 * scale,
        },
        {
          x: 0,
          y: 0,
          vx: -0.93240737 * scale,
          vy: -0.86473146 * scale,
        },
      ];
      const colors = ["#f472b6", "#22d3ee", "#a3e635"];
      return bodies.map((b, i) =>
        createBody({
          id: `b${i}`,
          name: `Body ${i + 1}`,
          mass: 1,
          x: b.x,
          y: b.y,
          z: 0,
          vx: b.vx,
          vy: b.vy,
          vz: 0,
          radius: 0.06,
          color: colors[i],
        })
      );
    },
  },
  {
    id: "inner-planets",
    name: { en: "Inner solar system", pt: "Sistema solar interno" },
    description: {
      en: "Sun + Mercury, Venus, Earth, Mars — coplanar circular orbits.",
      pt: "Sol + Mercúrio, Vênus, Terra, Marte — órbitas circulares coplanares.",
    },
    dt: 0.002,
    stepsPerFrame: 4,
    softening: 0.01,
    cameraDistance: 4,
    build: () => {
      const sun = createBody({
        id: "sun",
        name: "Sun",
        mass: 1,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        radius: 0.1,
        color: "#fbbf24",
      });
      const planets = [
        { id: "mer", name: "Mercury", a: 0.387, mass: 1.7e-7, color: "#a8a29e", r: 0.025 },
        { id: "ven", name: "Venus", a: 0.723, mass: 2.4e-6, color: "#fcd34d", r: 0.035 },
        { id: "ear", name: "Earth", a: 1.0, mass: 3e-6, color: "#38bdf8", r: 0.035 },
        { id: "mar", name: "Mars", a: 1.524, mass: 3.2e-7, color: "#f87171", r: 0.03 },
      ];
      return [
        sun,
        ...planets.map((p) => {
          const v = circularVelocity(1, p.a);
          return createBody({
            id: p.id,
            name: p.name,
            mass: p.mass,
            x: p.a,
            y: 0,
            z: 0,
            vx: 0,
            vy: v,
            vz: 0,
            radius: p.r,
            color: p.color,
          });
        }),
      ];
    },
  },
  {
    id: "cluster",
    name: { en: "Star cluster (toy)", pt: "Aglomerado estelar (toy)" },
    description: {
      en: "12 equal stars with random positions and mild velocities.",
      pt: "12 estrelas iguais com posições aleatórias e velocidades leves.",
    },
    dt: 0.01,
    stepsPerFrame: 2,
    softening: 0.08,
    cameraDistance: 6,
    build: () => {
      const bodies: Body[] = [];
      // deterministic pseudo-random
      let s = 42;
      const rnd = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
      for (let i = 0; i < 12; i++) {
        const theta = rnd() * Math.PI * 2;
        const phi = Math.acos(2 * rnd() - 1);
        const r = 0.5 + rnd() * 2;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        const vscale = 0.3;
        bodies.push(
          createBody({
            id: `s${i}`,
            name: `Star ${i + 1}`,
            mass: 1,
            x,
            y,
            z,
            vx: (rnd() - 0.5) * vscale,
            vy: (rnd() - 0.5) * vscale,
            vz: (rnd() - 0.5) * vscale,
            radius: 0.05,
            color: `hsl(${200 + i * 12}, 70%, 65%)`,
          })
        );
      }
      return bodies;
    },
  },
];

export function buildPresetState(presetId: string): NBodyState | null {
  const p = PRESETS.find((x) => x.id === presetId);
  if (!p) return null;
  return {
    bodies: p.build(),
    time: 0,
    G: G_SOLAR,
    softening: p.softening,
    maxTrail: 400,
  };
}

export function getPreset(id: string): PresetDef | undefined {
  return PRESETS.find((p) => p.id === id);
}
