/**
 * Unified astronomical objects catalog for SAPIENS (Phases 2–5)
 * Stars, deep-sky, exoplanets, high-energy, special targets.
 * Coordinates: ICRS / J2000, degrees.
 */

export type ObjectType =
  | "star"
  | "galaxy"
  | "nebula"
  | "cluster"
  | "globular"
  | "open_cluster"
  | "black_hole"
  | "planet"
  | "exoplanet"
  | "high_energy"
  | "other";

export interface AstronomicalObject {
  id: string;
  name: string;
  commonNames?: string[];
  type: ObjectType;
  ra: number; // degrees
  dec: number; // degrees
  magnitude?: number; // visual magnitude (lower = brighter)
  /** Relative literature interest 0–1 (heuristic for density layer; not scientific rank) */
  scientificWeight?: number;
  identifiers?: {
    hr?: number;
    hd?: number;
    hip?: number;
    messier?: string;
    ngc?: string;
    ic?: string;
    simbad?: string;
  };
  description?: string;
  constellation?: string;
}

/** Angular distance in degrees between two points (haversine-like on sphere) */
export function angularDistance(
  ra1: number,
  dec1: number,
  ra2: number,
  dec2: number
): number {
  const toRad = Math.PI / 180;
  const dRa = (ra2 - ra1) * toRad;
  const dDec = (dec2 - dec1) * toRad;
  const a =
    Math.sin(dDec / 2) ** 2 +
    Math.cos(dec1 * toRad) * Math.cos(dec2 * toRad) * Math.sin(dRa / 2) ** 2;
  return (2 * Math.asin(Math.sqrt(a)) * 180) / Math.PI;
}

/** Find nearest object within maxDistance degrees (optionally restricted by type) */
export function findNearestObject(
  ra: number,
  dec: number,
  maxDistanceDeg: number = 2,
  allowedTypes?: Set<string> | null
): AstronomicalObject | null {
  let nearest: AstronomicalObject | null = null;
  let minDist = maxDistanceDeg;

  for (const obj of ALL_OBJECTS) {
    if (allowedTypes && !allowedTypes.has(obj.type)) continue;
    const dist = angularDistance(ra, dec, obj.ra, obj.dec);
    if (dist < minDist) {
      minDist = dist;
      nearest = obj;
    }
  }
  return nearest;
}

/** Simple search by name / identifier (case-insensitive, partial) */
export function searchObjects(query: string, limit = 12): AstronomicalObject[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: { obj: AstronomicalObject; score: number }[] = [];

  for (const obj of ALL_OBJECTS) {
    let score = 0;
    const name = obj.name.toLowerCase();
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 50;

    if (obj.commonNames) {
      for (const cn of obj.commonNames) {
        const c = cn.toLowerCase();
        if (c === q) score = Math.max(score, 95);
        else if (c.startsWith(q)) score = Math.max(score, 75);
        else if (c.includes(q)) score = Math.max(score, 40);
      }
    }

    if (obj.identifiers) {
      const ids = [
        obj.identifiers.messier,
        obj.identifiers.ngc,
        obj.identifiers.ic,
        obj.identifiers.simbad,
        obj.identifiers.hr?.toString(),
      ].filter(Boolean) as string[];
      for (const id of ids) {
        if (id.toLowerCase() === q) score = Math.max(score, 90);
        else if (id.toLowerCase().includes(q)) score = Math.max(score, 45);
      }
    }

    if (score > 0) scored.push({ obj, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.obj);
}

// ---------------------------------------------------------------------------
// Catalog data
// ---------------------------------------------------------------------------

const STARS: AstronomicalObject[] = [
  {
    id: "sirius",
    name: "Sirius",
    commonNames: ["Alpha Canis Majoris", "Dog Star"],
    type: "star",
    ra: 101.287,
    dec: -16.716,
    magnitude: -1.46,
    constellation: "Canis Major",
    identifiers: { hr: 2491, hip: 32349 },
    description: "Brightest star in the night sky.",
  },
  {
    id: "canopus",
    name: "Canopus",
    commonNames: ["Alpha Carinae"],
    type: "star",
    ra: 95.988,
    dec: -52.696,
    magnitude: -0.74,
    constellation: "Carina",
    identifiers: { hr: 2326 },
  },
  {
    id: "arcturus",
    name: "Arcturus",
    commonNames: ["Alpha Boötis"],
    type: "star",
    ra: 213.915,
    dec: 19.182,
    magnitude: -0.05,
    constellation: "Boötes",
    identifiers: { hr: 5340 },
  },
  {
    id: "vega",
    name: "Vega",
    commonNames: ["Alpha Lyrae"],
    type: "star",
    ra: 279.235,
    dec: 38.784,
    magnitude: 0.03,
    constellation: "Lyra",
    identifiers: { hr: 7001 },
  },
  {
    id: "capella",
    name: "Capella",
    commonNames: ["Alpha Aurigae"],
    type: "star",
    ra: 79.172,
    dec: 45.998,
    magnitude: 0.08,
    constellation: "Auriga",
    identifiers: { hr: 1708 },
  },
  {
    id: "rigel",
    name: "Rigel",
    commonNames: ["Beta Orionis"],
    type: "star",
    ra: 78.634,
    dec: -8.202,
    magnitude: 0.13,
    constellation: "Orion",
    identifiers: { hr: 1713 },
  },
  {
    id: "procyon",
    name: "Procyon",
    commonNames: ["Alpha Canis Minoris"],
    type: "star",
    ra: 114.827,
    dec: 5.225,
    magnitude: 0.34,
    constellation: "Canis Minor",
    identifiers: { hr: 2943 },
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    commonNames: ["Alpha Orionis"],
    type: "star",
    ra: 88.793,
    dec: 7.407,
    magnitude: 0.42,
    constellation: "Orion",
    identifiers: { hr: 2061 },
    description: "Red supergiant, one of the largest stars known.",
  },
  {
    id: "altair",
    name: "Altair",
    commonNames: ["Alpha Aquilae"],
    type: "star",
    ra: 297.696,
    dec: 8.868,
    magnitude: 0.76,
    constellation: "Aquila",
    identifiers: { hr: 7557 },
  },
  {
    id: "aldebaran",
    name: "Aldebaran",
    commonNames: ["Alpha Tauri"],
    type: "star",
    ra: 68.98,
    dec: 16.509,
    magnitude: 0.85,
    constellation: "Taurus",
    identifiers: { hr: 1457 },
  },
  {
    id: "antares",
    name: "Antares",
    commonNames: ["Alpha Scorpii"],
    type: "star",
    ra: 247.352,
    dec: -26.432,
    magnitude: 0.96,
    constellation: "Scorpius",
    identifiers: { hr: 6134 },
  },
  {
    id: "spica",
    name: "Spica",
    commonNames: ["Alpha Virginis"],
    type: "star",
    ra: 201.298,
    dec: -11.161,
    magnitude: 0.98,
    constellation: "Virgo",
    identifiers: { hr: 5056 },
  },
  {
    id: "pollux",
    name: "Pollux",
    commonNames: ["Beta Geminorum"],
    type: "star",
    ra: 116.329,
    dec: 28.026,
    magnitude: 1.14,
    constellation: "Gemini",
    identifiers: { hr: 2990 },
  },
  {
    id: "fomalhaut",
    name: "Fomalhaut",
    commonNames: ["Alpha Piscis Austrini"],
    type: "star",
    ra: 344.413,
    dec: -29.622,
    magnitude: 1.16,
    constellation: "Piscis Austrinus",
    identifiers: { hr: 8728 },
  },
  {
    id: "deneb",
    name: "Deneb",
    commonNames: ["Alpha Cygni"],
    type: "star",
    ra: 310.358,
    dec: 45.28,
    magnitude: 1.25,
    constellation: "Cygnus",
    identifiers: { hr: 7924 },
  },
  {
    id: "regulus",
    name: "Regulus",
    commonNames: ["Alpha Leonis"],
    type: "star",
    ra: 152.093,
    dec: 11.967,
    magnitude: 1.35,
    constellation: "Leo",
    identifiers: { hr: 3982 },
  },
  {
    id: "polaris",
    name: "Polaris",
    commonNames: ["Alpha Ursae Minoris", "North Star"],
    type: "star",
    ra: 37.955,
    dec: 89.264,
    magnitude: 1.98,
    constellation: "Ursa Minor",
    identifiers: { hr: 424 },
    description: "The current north pole star.",
  },
  // Orion belt
  {
    id: "mintaka",
    name: "Mintaka",
    commonNames: ["Delta Orionis"],
    type: "star",
    ra: 83.002,
    dec: -0.299,
    magnitude: 2.23,
    constellation: "Orion",
    identifiers: { hr: 1852 },
  },
  {
    id: "alnilam",
    name: "Alnilam",
    commonNames: ["Epsilon Orionis"],
    type: "star",
    ra: 84.053,
    dec: -1.202,
    magnitude: 1.69,
    constellation: "Orion",
    identifiers: { hr: 1903 },
  },
  {
    id: "alnitak",
    name: "Alnitak",
    commonNames: ["Zeta Orionis"],
    type: "star",
    ra: 85.19,
    dec: -1.943,
    magnitude: 1.74,
    constellation: "Orion",
    identifiers: { hr: 1948 },
  },
];

const DEEP_SKY: AstronomicalObject[] = [
  // Messier objects
  {
    id: "m31",
    name: "Andromeda Galaxy",
    commonNames: ["M31", "NGC 224", "Andromeda"],
    type: "galaxy",
    ra: 10.685,
    dec: 41.269,
    magnitude: 3.4,
    constellation: "Andromeda",
    identifiers: { messier: "M31", ngc: "NGC 224" },
    description: "Nearest major galaxy to the Milky Way.",
  },
  {
    id: "m42",
    name: "Orion Nebula",
    commonNames: ["M42", "NGC 1976"],
    type: "nebula",
    ra: 83.822,
    dec: -5.391,
    magnitude: 4.0,
    constellation: "Orion",
    identifiers: { messier: "M42", ngc: "NGC 1976" },
    description: "Brightest diffuse nebula in the sky; stellar nursery.",
  },
  {
    id: "m45",
    name: "Pleiades",
    commonNames: ["M45", "Seven Sisters", "Subaru"],
    type: "open_cluster",
    ra: 56.75,
    dec: 24.117,
    magnitude: 1.6,
    constellation: "Taurus",
    identifiers: { messier: "M45" },
    description: "Famous open cluster visible to the naked eye.",
  },
  {
    id: "m13",
    name: "Hercules Cluster",
    commonNames: ["M13", "NGC 6205"],
    type: "globular",
    ra: 250.423,
    dec: 36.46,
    magnitude: 5.8,
    constellation: "Hercules",
    identifiers: { messier: "M13", ngc: "NGC 6205" },
  },
  {
    id: "m51",
    name: "Whirlpool Galaxy",
    commonNames: ["M51", "NGC 5194"],
    type: "galaxy",
    ra: 202.47,
    dec: 47.195,
    magnitude: 8.4,
    constellation: "Canes Venatici",
    identifiers: { messier: "M51", ngc: "NGC 5194" },
  },
  {
    id: "m57",
    name: "Ring Nebula",
    commonNames: ["M57", "NGC 6720"],
    type: "nebula",
    ra: 283.396,
    dec: 33.029,
    magnitude: 8.8,
    constellation: "Lyra",
    identifiers: { messier: "M57", ngc: "NGC 6720" },
  },
  {
    id: "m87",
    name: "Virgo A",
    commonNames: ["M87", "NGC 4486"],
    type: "galaxy",
    ra: 187.706,
    dec: 12.391,
    magnitude: 8.6,
    constellation: "Virgo",
    identifiers: { messier: "M87", ngc: "NGC 4486" },
    description: "Giant elliptical galaxy with a supermassive black hole.",
  },
  {
    id: "m104",
    name: "Sombrero Galaxy",
    commonNames: ["M104", "NGC 4594"],
    type: "galaxy",
    ra: 189.998,
    dec: -11.623,
    magnitude: 8.0,
    constellation: "Virgo",
    identifiers: { messier: "M104", ngc: "NGC 4594" },
  },
  {
    id: "m1",
    name: "Crab Nebula",
    commonNames: ["M1", "NGC 1952"],
    type: "nebula",
    ra: 83.633,
    dec: 22.014,
    magnitude: 8.4,
    constellation: "Taurus",
    identifiers: { messier: "M1", ngc: "NGC 1952" },
    description: "Supernova remnant from SN 1054.",
  },
  {
    id: "m8",
    name: "Lagoon Nebula",
    commonNames: ["M8", "NGC 6523"],
    type: "nebula",
    ra: 270.904,
    dec: -24.387,
    magnitude: 6.0,
    constellation: "Sagittarius",
    identifiers: { messier: "M8", ngc: "NGC 6523" },
  },
  {
    id: "m16",
    name: "Eagle Nebula",
    commonNames: ["M16", "NGC 6611", "Pillars of Creation"],
    type: "nebula",
    ra: 274.7,
    dec: -13.807,
    magnitude: 6.0,
    constellation: "Serpens",
    identifiers: { messier: "M16", ngc: "NGC 6611" },
  },
  {
    id: "m20",
    name: "Trifid Nebula",
    commonNames: ["M20", "NGC 6514"],
    type: "nebula",
    ra: 270.604,
    dec: -23.03,
    magnitude: 6.3,
    constellation: "Sagittarius",
    identifiers: { messier: "M20", ngc: "NGC 6514" },
  },
  {
    id: "m27",
    name: "Dumbbell Nebula",
    commonNames: ["M27", "NGC 6853"],
    type: "nebula",
    ra: 299.902,
    dec: 22.721,
    magnitude: 7.5,
    constellation: "Vulpecula",
    identifiers: { messier: "M27", ngc: "NGC 6853" },
  },
  {
    id: "m33",
    name: "Triangulum Galaxy",
    commonNames: ["M33", "NGC 598"],
    type: "galaxy",
    ra: 23.462,
    dec: 30.66,
    magnitude: 5.7,
    constellation: "Triangulum",
    identifiers: { messier: "M33", ngc: "NGC 598" },
  },
  {
    id: "m81",
    name: "Bode's Galaxy",
    commonNames: ["M81", "NGC 3031"],
    type: "galaxy",
    ra: 148.888,
    dec: 69.065,
    magnitude: 6.9,
    constellation: "Ursa Major",
    identifiers: { messier: "M81", ngc: "NGC 3031" },
  },
  {
    id: "omega-cen",
    name: "Omega Centauri",
    commonNames: ["NGC 5139", "ω Cen"],
    type: "globular",
    ra: 201.691,
    dec: -47.479,
    magnitude: 3.7,
    constellation: "Centaurus",
    identifiers: { ngc: "NGC 5139" },
    description: "Largest and brightest globular cluster in the Milky Way.",
  },
  {
    id: "47-tuc",
    name: "47 Tucanae",
    commonNames: ["NGC 104", "47 Tuc"],
    type: "globular",
    ra: 6.024,
    dec: -72.081,
    magnitude: 4.0,
    constellation: "Tucana",
    identifiers: { ngc: "NGC 104" },
  },
];

const SPECIAL: AstronomicalObject[] = [
  {
    id: "sgr-a-star",
    name: "Sagittarius A*",
    commonNames: ["Sgr A*", "Galactic Center", "SgrA*"],
    type: "black_hole",
    ra: 266.417,
    dec: -29.008,
    magnitude: undefined,
    constellation: "Sagittarius",
    identifiers: { simbad: "Sgr A*" },
    description:
      "Supermassive black hole at the center of the Milky Way. Mass ≈ 4.3 million solar masses.",
  },
  {
    id: "lmc",
    name: "Large Magellanic Cloud",
    commonNames: ["LMC", "Nubecula Major"],
    type: "galaxy",
    ra: 80.894,
    dec: -69.756,
    magnitude: 0.9,
    constellation: "Dorado / Mensa",
    identifiers: { simbad: "LMC" },
    description: "Satellite galaxy of the Milky Way.",
  },
  {
    id: "smc",
    name: "Small Magellanic Cloud",
    commonNames: ["SMC", "Nubecula Minor"],
    type: "galaxy",
    ra: 13.158,
    dec: -72.8,
    magnitude: 2.7,
    constellation: "Tucana",
    identifiers: { simbad: "SMC" },
    scientificWeight: 0.75,
  },
];

const EXOPLANETS: AstronomicalObject[] = [
  {
    id: "trappist-1",
    name: "TRAPPIST-1",
    commonNames: ["TRAPPIST-1 system"],
    type: "exoplanet",
    ra: 346.622,
    dec: -5.041,
    magnitude: 18.8,
    scientificWeight: 0.9,
    constellation: "Aquarius",
    identifiers: { simbad: "TRAPPIST-1" },
    description: "Ultra-cool dwarf with seven Earth-sized planets.",
  },
  {
    id: "proxima-cen",
    name: "Proxima Centauri",
    commonNames: ["Proxima Cen", "Alpha Centauri C"],
    type: "exoplanet",
    ra: 217.429,
    dec: -62.679,
    magnitude: 11.05,
    scientificWeight: 0.88,
    constellation: "Centaurus",
    identifiers: { simbad: "Proxima Centauri" },
    description: "Nearest star to the Sun; hosts Proxima b.",
  },
  {
    id: "kepler-186",
    name: "Kepler-186",
    commonNames: ["Kepler-186f host"],
    type: "exoplanet",
    ra: 301.564,
    dec: 43.955,
    magnitude: 14.9,
    scientificWeight: 0.7,
    constellation: "Cygnus",
    description: "Host of Kepler-186f, an Earth-size planet in the habitable zone.",
  },
  {
    id: "hd-209458",
    name: "HD 209458",
    commonNames: ["HD 209458 b", "Osiris"],
    type: "exoplanet",
    ra: 330.795,
    dec: 18.884,
    magnitude: 7.65,
    scientificWeight: 0.8,
    constellation: "Pegasus",
    description: "First transiting exoplanet confirmed; hot Jupiter.",
  },
  {
    id: "51-peg",
    name: "51 Pegasi",
    commonNames: ["51 Peg", "Helvetios"],
    type: "exoplanet",
    ra: 344.368,
    dec: 20.769,
    magnitude: 5.49,
    scientificWeight: 0.85,
    constellation: "Pegasus",
    description: "Host of the first exoplanet around a Sun-like star (51 Peg b).",
  },
];

const HIGH_ENERGY: AstronomicalObject[] = [
  {
    id: "crab-pulsar",
    name: "Crab Pulsar",
    commonNames: ["PSR B0531+21", "NP 0532"],
    type: "high_energy",
    ra: 83.633,
    dec: 22.014,
    magnitude: 16.5,
    scientificWeight: 0.95,
    constellation: "Taurus",
    identifiers: { messier: "M1", simbad: "Crab Pulsar" },
    description: "Pulsar in the Crab Nebula; iconic high-energy source.",
  },
  {
    id: "cygnus-x1",
    name: "Cygnus X-1",
    commonNames: ["Cyg X-1"],
    type: "high_energy",
    ra: 299.590,
    dec: 35.202,
    magnitude: 8.95,
    scientificWeight: 0.92,
    constellation: "Cygnus",
    identifiers: { simbad: "Cygnus X-1" },
    description: "First widely accepted stellar-mass black hole candidate.",
  },
  {
    id: "vela-pulsar",
    name: "Vela Pulsar",
    commonNames: ["PSR J0835-4510"],
    type: "high_energy",
    ra: 128.836,
    dec: -45.176,
    scientificWeight: 0.8,
    constellation: "Vela",
    identifiers: { simbad: "Vela Pulsar" },
    description: "Bright gamma-ray pulsar associated with the Vela SNR.",
  },
  {
    id: "sco-x1",
    name: "Scorpius X-1",
    commonNames: ["Sco X-1"],
    type: "high_energy",
    ra: 244.979,
    dec: -15.640,
    magnitude: 12.2,
    scientificWeight: 0.78,
    constellation: "Scorpius",
    identifiers: { simbad: "Sco X-1" },
    description: "Brightest persistent extrasolar X-ray source.",
  },
  {
    id: "ss433",
    name: "SS 433",
    commonNames: ["V1343 Aquilae"],
    type: "high_energy",
    ra: 287.957,
    dec: 4.983,
    magnitude: 14.2,
    scientificWeight: 0.72,
    constellation: "Aquila",
    description: "Microquasar with relativistic jets.",
  },
];

/** Heuristic scientific weight when not set on the object */
export function getScientificWeight(obj: AstronomicalObject): number {
  if (obj.scientificWeight != null) return obj.scientificWeight;
  switch (obj.type) {
    case "black_hole":
      return 1.0;
    case "galaxy":
      return obj.identifiers?.messier ? 0.75 : 0.55;
    case "nebula":
      return obj.identifiers?.messier ? 0.7 : 0.5;
    case "globular":
    case "open_cluster":
    case "cluster":
      return 0.55;
    case "high_energy":
      return 0.8;
    case "exoplanet":
      return 0.7;
    case "star":
      return obj.magnitude != null && obj.magnitude < 1 ? 0.45 : 0.25;
    default:
      return 0.3;
  }
}

export const ALL_OBJECTS: AstronomicalObject[] = [
  ...STARS,
  ...DEEP_SKY,
  ...SPECIAL,
  ...EXOPLANETS,
  ...HIGH_ENERGY,
];

/** All objects that can be drawn as sky points */
export const RENDERABLE_OBJECTS = ALL_OBJECTS;

/** @deprecated use RENDERABLE_OBJECTS */
export const RENDERABLE_STARS = RENDERABLE_OBJECTS;

/** Convert RA (deg), Dec (deg) to unit vector (Three.js Y-up) */
export function raDecToVector(
  raDeg: number,
  decDeg: number
): [number, number, number] {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.sin(dec);
  const z = Math.cos(dec) * Math.sin(ra);
  return [x, y, z];
}

/** Convert unit vector back to RA/Dec (degrees) */
export function vectorToRaDec(
  x: number,
  y: number,
  z: number
): { ra: number; dec: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const dec = (Math.asin(y / r) * 180) / Math.PI;
  let ra = (Math.atan2(z, x) * 180) / Math.PI;
  if (ra < 0) ra += 360;
  return { ra, dec };
}

export function typeLabel(type: ObjectType): string {
  const labels: Record<ObjectType, string> = {
    star: "Star",
    galaxy: "Galaxy",
    nebula: "Nebula",
    cluster: "Cluster",
    globular: "Globular Cluster",
    open_cluster: "Open Cluster",
    black_hole: "Black Hole / Galactic Center",
    planet: "Planet",
    exoplanet: "Exoplanet System",
    high_energy: "High-Energy Source",
    other: "Object",
  };
  return labels[type] ?? type;
}
