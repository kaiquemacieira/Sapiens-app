/**
 * Sky layer system — SAPIENS Phase 5
 */

export type LayerId =
  | "stars"
  | "galaxies"
  | "nebulae"
  | "clusters"
  | "exoplanets"
  | "high_energy"
  | "special"
  | "literature"
  | "constellations"
  | "equator";

export interface LayerDef {
  id: LayerId;
  label: string;
  description: string;
  defaultOn: boolean;
  /** Maps to AstronomicalObject.type values */
  objectTypes?: string[];
}

export const LAYERS: LayerDef[] = [
  {
    id: "stars",
    label: "Stars",
    description: "Bright catalog stars",
    defaultOn: true,
    objectTypes: ["star"],
  },
  {
    id: "galaxies",
    label: "Galaxies",
    description: "Galaxies and satellite galaxies",
    defaultOn: true,
    objectTypes: ["galaxy"],
  },
  {
    id: "nebulae",
    label: "Nebulae",
    description: "Emission, planetary and remnant nebulae",
    defaultOn: true,
    objectTypes: ["nebula"],
  },
  {
    id: "clusters",
    label: "Clusters",
    description: "Open and globular clusters",
    defaultOn: true,
    objectTypes: ["cluster", "globular", "open_cluster"],
  },
  {
    id: "exoplanets",
    label: "Exoplanets",
    description: "Notable exoplanet host systems",
    defaultOn: true,
    objectTypes: ["exoplanet"],
  },
  {
    id: "high_energy",
    label: "High energy",
    description: "Pulsars, XRBs, gamma-ray sources",
    defaultOn: true,
    objectTypes: ["high_energy"],
  },
  {
    id: "special",
    label: "Special targets",
    description: "Galactic center and unique objects",
    defaultOn: true,
    objectTypes: ["black_hole", "planet", "other"],
  },
  {
    id: "literature",
    label: "📚 Scientific density",
    description: "Visual weight of indexed literature interest (quantitative, not importance)",
    defaultOn: true,
  },
  {
    id: "constellations",
    label: "Constellations",
    description: "Stick-figure outlines (educational, not IAU boundaries)",
    defaultOn: true,
  },
  {
    id: "equator",
    label: "Celestial equator",
    description: "Equatorial guide line",
    defaultOn: true,
  },
];

export type LayerVisibility = Record<LayerId, boolean>;

export function defaultLayerVisibility(): LayerVisibility {
  const v = {} as LayerVisibility;
  for (const layer of LAYERS) {
    v[layer.id] = layer.defaultOn;
  }
  return v;
}

/** Which object types are currently visible given layer toggles */
export function visibleObjectTypes(layers: LayerVisibility): Set<string> {
  const types = new Set<string>();
  for (const layer of LAYERS) {
    if (!layers[layer.id] || !layer.objectTypes) continue;
    for (const t of layer.objectTypes) types.add(t);
  }
  return types;
}
