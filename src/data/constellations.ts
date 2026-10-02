/**
 * Simplified constellation stick figures (Phase 11)
 * Coordinates: ICRS J2000, degrees. Educational outlines — not IAU boundaries.
 */

export interface ConstellationLine {
  /** Pairs of [ra, dec] endpoints */
  segments: [number, number, number, number][]; // ra1,dec1,ra2,dec2
}

export interface Constellation {
  id: string;
  name: string;
  abbr: string;
  lines: ConstellationLine;
}

/** Major constellations as stick figures */
export const CONSTELLATIONS: Constellation[] = [
  {
    id: "ori",
    name: "Orion",
    abbr: "Ori",
    lines: {
      segments: [
        // Belt
        [83.0, -1.2, 84.05, -1.94],
        [84.05, -1.94, 85.19, -1.94],
        // Shoulders / head-ish
        [88.79, 7.41, 83.0, -1.2], // Betelgeuse - Mintaka approx
        [78.63, -8.2, 85.19, -1.94], // Rigel area - Alnitak
        [88.79, 7.41, 81.28, 6.35],
        [78.63, -8.2, 83.86, -5.91],
      ],
    },
  },
  {
    id: "uma",
    name: "Ursa Major",
    abbr: "UMa",
    lines: {
      segments: [
        // Big Dipper bowl + handle
        [165.46, 56.38, 183.86, 57.03], // Dubhe - Merak
        [183.86, 57.03, 178.46, 53.69],
        [178.46, 53.69, 172.53, 49.31],
        [172.53, 49.31, 165.46, 56.38],
        [172.53, 49.31, 200.98, 54.93],
        [200.98, 54.93, 206.89, 49.31],
        [206.89, 49.31, 210.96, 43.93], // Alkaid
      ],
    },
  },
  {
    id: "cru",
    name: "Crux",
    abbr: "Cru",
    lines: {
      segments: [
        [186.65, -63.1, 187.79, -57.11], // Acrux - gamma
        [183.79, -58.75, 191.93, -59.69], // beta - delta cross
      ],
    },
  },
  {
    id: "sco",
    name: "Scorpius",
    abbr: "Sco",
    lines: {
      segments: [
        [247.35, -26.43, 240.08, -22.62], // Antares region
        [240.08, -22.62, 236.0, -28.2],
        [236.0, -28.2, 239.7, -37.1],
        [239.7, -37.1, 247.55, -42.0],
        [247.55, -42.0, 254.0, -40.0],
        [254.0, -40.0, 262.69, -37.3], // Shaula area
      ],
    },
  },
  {
    id: "cas",
    name: "Cassiopeia",
    abbr: "Cas",
    lines: {
      segments: [
        [2.29, 59.15, 14.18, 60.72],
        [14.18, 60.72, 21.45, 60.24],
        [21.45, 60.24, 28.6, 63.67],
        [28.6, 63.67, 37.04, 66.2],
      ],
    },
  },
  {
    id: "cyg",
    name: "Cygnus",
    abbr: "Cyg",
    lines: {
      segments: [
        // Northern Cross
        [310.36, 45.28, 305.56, 40.26], // Deneb - Sadr
        [305.56, 40.26, 292.68, 27.96], // Sadr - Albireo
        [311.55, 33.97, 305.56, 40.26],
        [305.56, 40.26, 296.24, 36.58],
      ],
    },
  },
];

/** Flatten all segments for WebGL line rendering */
export function allConstellationSegments(): Float32Array {
  const positions: number[] = [];
  const toXYZ = (raDeg: number, decDeg: number) => {
    const ra = (raDeg * Math.PI) / 180;
    const dec = (decDeg * Math.PI) / 180;
    return [
      Math.cos(dec) * Math.cos(ra),
      Math.sin(dec),
      Math.cos(dec) * Math.sin(ra),
    ] as const;
  };

  for (const c of CONSTELLATIONS) {
    for (const [ra1, dec1, ra2, dec2] of c.lines.segments) {
      const a = toXYZ(ra1, dec1);
      const b = toXYZ(ra2, dec2);
      positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
  }
  return new Float32Array(positions);
}
