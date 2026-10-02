/**
 * Bright stars catalog for SAPIENS Sky Engine (MVP)
 * RA/Dec in degrees (ICRS/J2000), magnitude (V), common name
 * Source: public domain bright star data (subset of BSC / Hipparcos)
 */
export interface Star {
  ra: number; // degrees 0-360
  dec: number; // degrees -90 to 90
  mag: number;
  name?: string;
  hr?: number; // Harvard Revised number
}

export const BRIGHT_STARS: Star[] = [
  // Magnitude < 2.5 approximately, plus some famous ones
  { ra: 101.287, dec: -16.716, mag: 0.45, name: "Sirius", hr: 2491 },
  { ra: 219.902, dec: -60.834, mag: 0.01, name: "Canopus", hr: 2326 },
  { ra: 213.915, dec: 19.182, mag: 0.03, name: "Arcturus", hr: 5340 },
  { ra: 279.235, dec: 38.784, mag: 0.03, name: "Vega", hr: 7001 },
  { ra: 79.172, dec: 45.998, mag: 0.08, name: "Capella", hr: 1708 },
  { ra: 88.793, dec: 7.407, mag: 0.13, name: "Rigel", hr: 1713 },
  { ra: 297.696, dec: 8.868, mag: 0.34, name: "Altair", hr: 7557 },
  { ra: 247.352, dec: -26.432, mag: 0.61, name: "Antares", hr: 6134 },
  { ra: 24.429, dec: -57.237, mag: 0.46, name: "Achernar", hr: 472 },
  { ra: 68.980, dec: 16.509, mag: 0.87, name: "Aldebaran", hr: 1457 },
  { ra: 114.827, dec: 5.225, mag: 1.16, name: "Procyon", hr: 2943 },
  { ra: 152.093, dec: 11.967, mag: 1.35, name: "Regulus", hr: 3982 },
  { ra: 186.650, dec: 12.895, mag: 1.98, name: "Denebola", hr: 4534 },
  { ra: 310.358, dec: 45.280, mag: 1.25, name: "Deneb", hr: 7924 },
  { ra: 165.932, dec: 61.751, mag: 1.79, name: "Dubhe", hr: 4301 },
  { ra: 183.857, dec: 57.033, mag: 2.23, name: "Merak", hr: 4295 },
  { ra: 193.507, dec: 55.960, mag: 2.37, name: "Phecda", hr: 4554 },
  { ra: 206.885, dec: 49.313, mag: 1.76, name: "Alioth", hr: 4905 },
  { ra: 200.981, dec: 54.925, mag: 2.44, name: "Megrez", hr: 4660 },
  { ra: 210.956, dec: 49.228, mag: 1.86, name: "Mizar", hr: 5054 },
  { ra: 222.677, dec: 74.156, mag: 1.77, name: "Alkaid", hr: 5191 },
  { ra: 51.079, dec: 49.861, mag: 2.09, name: "Mirfak", hr: 1017 },
  { ra: 37.955, dec: 89.264, mag: 1.97, name: "Polaris", hr: 424 },
  { ra: 95.988, dec: -52.696, mag: 1.86, name: "Adhara", hr: 2618 },
  { ra: 141.897, dec: -8.658, mag: 1.98, name: "Alphard", hr: 3748 },
  { ra: 263.054, dec: -5.707, mag: 2.43, name: "Sabik", hr: 6378 },
  { ra: 276.043, dec: -34.384, mag: 2.02, name: "Kaus Australis", hr: 6879 },
  { ra: 283.816, dec: -26.297, mag: 2.05, name: "Nunki", hr: 7121 },
  { ra: 345.944, dec: 28.083, mag: 2.38, name: "Enif", hr: 8681 },
  { ra: 2.295, dec: 59.150, mag: 2.23, name: "Schedar", hr: 168 },
  { ra: 14.177, dec: 60.717, mag: 2.27, name: "Caph", hr: 21 },
  { ra: 17.433, dec: 35.621, mag: 2.06, name: "Almach", hr: 337 },
  { ra: 31.793, dec: 23.463, mag: 2.64, name: "Hamal", hr: 617 },
  { ra: 46.458, dec: 40.955, mag: 2.26, name: "Algol", hr: 936 },
  { ra: 83.001, dec: -0.299, mag: 1.69, name: "Bellatrix", hr: 1790 },
  { ra: 83.183, dec: -0.187, mag: 1.64, name: "Elnath", hr: 1791 },
  { ra: 84.053, dec: -1.202, mag: 2.23, name: "Mintaka", hr: 1852 },
  { ra: 85.190, dec: -1.943, mag: 1.70, name: "Alnilam", hr: 1903 },
  { ra: 86.939, dec: -1.943, mag: 1.74, name: "Alnitak", hr: 1948 },
  { ra: 88.793, dec: -9.670, mag: 2.05, name: "Saiph", hr: 2004 },
  { ra: 99.428, dec: 16.399, mag: 1.93, name: "Castor", hr: 2891 },
  { ra: 116.329, dec: 28.026, mag: 1.14, name: "Pollux", hr: 2990 },
  { ra: 122.383, dec: -47.337, mag: 1.86, name: "Avior", hr: 3307 },
  { ra: 125.628, dec: -59.689, mag: 1.68, name: "Miaplacidus", hr: 3685 },
  { ra: 130.898, dec: -57.034, mag: 2.25, name: "Aspidiske", hr: 3699 },
  { ra: 148.191, dec: 16.124, mag: 2.56, name: "Zosma", hr: 3775 },
  { ra: 154.993, dec: 19.842, mag: 2.98, name: "Chertan", hr: 4031 },
  { ra: 165.460, dec: 56.382, mag: 2.34, name: "Phad", hr: 4295 },
  { ra: 177.675, dec: 14.572, mag: 2.14, name: "Algieba", hr: 4357 },
  { ra: 192.730, dec: -57.113, mag: 1.25, name: "Acrux", hr: 4730 },
  { ra: 193.649, dec: -59.689, mag: 1.59, name: "Mimosa", hr: 4853 },
  { ra: 201.298, dec: -53.319, mag: 1.63, name: "Gacrux", hr: 4763 },
  { ra: 219.896, dec: -60.834, mag: 0.01, name: "Canopus", hr: 2326 },
  { ra: 247.555, dec: -15.724, mag: 2.29, name: "Rasalhague", hr: 6556 },
  { ra: 252.166, dec: -34.293, mag: 2.29, name: "Shaula", hr: 6527 },
  { ra: 263.402, dec: 12.560, mag: 2.76, name: "Rasalgethi", hr: 6406 },
  { ra: 269.152, dec: 51.489, mag: 2.23, name: "Eltanin", hr: 6705 },
  { ra: 279.235, dec: 38.784, mag: 0.03, name: "Vega", hr: 7001 },
  { ra: 283.626, dec: 36.898, mag: 2.98, name: "Sheliak", hr: 7106 },
  { ra: 310.358, dec: 45.280, mag: 1.25, name: "Deneb", hr: 7924 },
  { ra: 326.046, dec: 9.875, mag: 2.38, name: "Enif", hr: 8308 },
  { ra: 340.751, dec: -44.459, mag: 1.17, name: "Fomalhaut", hr: 8728 },
  { ra: 344.413, dec: -29.622, mag: 2.04, name: "Alnair", hr: 8722 },
  // Sagittarius A* approximate position for testing selection
  { ra: 266.417, dec: -29.008, mag: 99, name: "Sgr A*", hr: 0 },
];

/** Convert RA (deg), Dec (deg) to unit vector (Three.js Y-up, Z towards RA=0) */
export function raDecToVector(raDeg: number, decDeg: number): [number, number, number] {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  // Standard astronomical: x = cos(dec)*cos(ra), y = cos(dec)*sin(ra), z = sin(dec)
  // For Three.js (Y-up): map so that equatorial plane is XZ, north is +Y
  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.sin(dec);
  const z = Math.cos(dec) * Math.sin(ra);
  return [x, y, z];
}

/** Convert unit vector back to RA/Dec (degrees) */
export function vectorToRaDec(x: number, y: number, z: number): { ra: number; dec: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const dec = (Math.asin(y / r) * 180) / Math.PI;
  let ra = (Math.atan2(z, x) * 180) / Math.PI;
  if (ra < 0) ra += 360;
  return { ra, dec };
}
