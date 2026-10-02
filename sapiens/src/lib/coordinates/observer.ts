/**
 * Observer / local horizontal coordinates — SAPIENS Phase 6
 * Uses astronomy-engine for EQJ ↔ horizontal transforms.
 */

import * as Astronomy from "astronomy-engine";

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  elevationMeters: number;
}

export interface HorizontalCoords {
  altitude: number;
  azimuth: number;
}

export function makeObserver(loc: ObserverLocation): Astronomy.Observer {
  return new Astronomy.Observer(
    loc.latitude,
    loc.longitude,
    loc.elevationMeters
  );
}

/**
 * Equatorial J2000 RA/Dec (degrees) → local altitude/azimuth.
 * Horizon() expects RA in sidereal hours.
 */
export function raDecToAltAz(
  raDeg: number,
  decDeg: number,
  loc: ObserverLocation,
  when: Date
): HorizontalCoords {
  const observer = makeObserver(loc);
  const time = Astronomy.MakeTime(when);
  const raHours = raDeg / 15;
  const hor = Astronomy.Horizon(time, observer, raHours, decDeg, "normal");
  return {
    altitude: hor.altitude,
    azimuth: hor.azimuth,
  };
}

/** Solar altitude (degrees) for day/night sky appearance */
export function sunAltitudeDegrees(loc: ObserverLocation, when: Date): number {
  const observer = makeObserver(loc);
  const time = Astronomy.MakeTime(when);
  const equ = Astronomy.Equator(
    Astronomy.Body.Sun,
    time,
    observer,
    true,
    true
  );
  const hor = Astronomy.Horizon(
    time,
    observer,
    equ.ra,
    equ.dec,
    "normal"
  );
  return hor.altitude;
}

export function formatAltitude(alt: number): string {
  const sign = alt >= 0 ? "+" : "−";
  const a = Math.abs(alt);
  const deg = Math.floor(a);
  const min = Math.round((a - deg) * 60);
  return `${sign}${deg}° ${min.toString().padStart(2, "0")}'`;
}

export function formatAzimuth(az: number): string {
  const a = ((az % 360) + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(a / 45) % 8;
  return `${a.toFixed(1)}° ${dirs[idx]}`;
}

/** Sample local horizon as RA/Dec points on the celestial sphere */
export function sampleHorizonRaDec(
  loc: ObserverLocation,
  when: Date,
  samples = 96
): { ra: number; dec: number }[] {
  const observer = makeObserver(loc);
  const time = Astronomy.MakeTime(when);
  const rot = Astronomy.Rotation_HOR_EQJ(time, observer);
  const points: { ra: number; dec: number }[] = [];

  for (let i = 0; i <= samples; i++) {
    const az = (i / samples) * 360;
    const sph = new Astronomy.Spherical(0, az, 1);
    const horVec = Astronomy.VectorFromHorizon(sph, time, null);
    const eqj = Astronomy.RotateVector(rot, horVec);
    const equ = Astronomy.EquatorFromVector(eqj);
    points.push({
      ra: equ.ra * 15,
      dec: equ.dec,
    });
  }
  return points;
}

export function defaultObserverLocation(): ObserverLocation {
  return {
    latitude: -23.55,
    longitude: -46.63,
    elevationMeters: 760,
  };
}

/** Sky background color from solar altitude */
export function skyColorFromSunAlt(sunAlt: number): number {
  // Night
  if (sunAlt < -12) return 0x000008;
  // Astronomical twilight
  if (sunAlt < -6) return 0x050518;
  // Nautical / civil twilight
  if (sunAlt < 0) return 0x1a1530;
  // Day — still show stars faintly; sky not pure blue (planetarium style)
  if (sunAlt < 15) return 0x1a2840;
  return 0x0a1828;
}
