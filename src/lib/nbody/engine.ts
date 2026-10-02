/**
 * Educational N-body gravity engine — SAPIENS Phase 18
 * Softened Newtonian gravity, leapfrog / velocity Verlet.
 * Not for research-grade orbital ephemerides.
 */

export interface Body {
  id: string;
  name: string;
  /** mass in solar masses (M☉) */
  mass: number;
  /** position in AU */
  x: number;
  y: number;
  z: number;
  /** velocity in AU / year */
  vx: number;
  vy: number;
  vz: number;
  /** display radius (visual only) */
  radius: number;
  color: string;
  /** trail of recent positions */
  trail: { x: number; y: number; z: number }[];
}

export interface NBodyState {
  bodies: Body[];
  time: number; // years
  G: number; // gravitational constant in AU³ / (M☉ · yr²) ≈ 4π²
  softening: number; // AU
  maxTrail: number;
}

/** Gaussian units-ish: G = 4π² so Earth orbits Sun in ~1 year at 1 AU */
export const G_SOLAR = 4 * Math.PI * Math.PI;

export function createBody(
  partial: Omit<Body, "trail"> & { trail?: Body["trail"] }
): Body {
  return { ...partial, trail: partial.trail ?? [] };
}

function accelOn(
  i: number,
  bodies: Body[],
  G: number,
  soft2: number
): [number, number, number] {
  let ax = 0,
    ay = 0,
    az = 0;
  const bi = bodies[i];
  for (let j = 0; j < bodies.length; j++) {
    if (i === j) continue;
    const bj = bodies[j];
    const dx = bj.x - bi.x;
    const dy = bj.y - bi.y;
    const dz = bj.z - bi.z;
    const r2 = dx * dx + dy * dy + dz * dz + soft2;
    const invR3 = 1 / (r2 * Math.sqrt(r2));
    const f = G * bj.mass * invR3;
    ax += f * dx;
    ay += f * dy;
    az += f * dz;
  }
  return [ax, ay, az];
}

/** Velocity Verlet step; dt in years */
export function stepSystem(state: NBodyState, dt: number): NBodyState {
  const { bodies, G, softening, maxTrail } = state;
  const soft2 = softening * softening;
  const n = bodies.length;

  const a0 = bodies.map((_, i) => accelOn(i, bodies, G, soft2));

  const next = bodies.map((b, i) => {
    const [ax, ay, az] = a0[i];
    const x = b.x + b.vx * dt + 0.5 * ax * dt * dt;
    const y = b.y + b.vy * dt + 0.5 * ay * dt * dt;
    const z = b.z + b.vz * dt + 0.5 * az * dt * dt;
    return { ...b, x, y, z };
  });

  const a1 = next.map((_, i) => accelOn(i, next, G, soft2));

  const bodiesOut: Body[] = next.map((b, i) => {
    const [ax0, ay0, az0] = a0[i];
    const [ax1, ay1, az1] = a1[i];
    const vx = b.vx + 0.5 * (ax0 + ax1) * dt;
    const vy = b.vy + 0.5 * (ay0 + ay1) * dt;
    const vz = b.vz + 0.5 * (az0 + az1) * dt;
    const trail = [...b.trail, { x: b.x, y: b.y, z: b.z }];
    if (trail.length > maxTrail) trail.splice(0, trail.length - maxTrail);
    return { ...b, vx, vy, vz, trail };
  });

  return {
    ...state,
    bodies: bodiesOut,
    time: state.time + dt,
  };
}

export function totalEnergy(state: NBodyState): number {
  const { bodies, G, softening } = state;
  const soft2 = softening * softening;
  let ke = 0;
  let pe = 0;
  for (let i = 0; i < bodies.length; i++) {
    const bi = bodies[i];
    ke += 0.5 * bi.mass * (bi.vx * bi.vx + bi.vy * bi.vy + bi.vz * bi.vz);
    for (let j = i + 1; j < bodies.length; j++) {
      const bj = bodies[j];
      const dx = bj.x - bi.x;
      const dy = bj.y - bi.y;
      const dz = bj.z - bi.z;
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz + soft2);
      pe -= (G * bi.mass * bj.mass) / r;
    }
  }
  return ke + pe;
}

export function centerOfMass(bodies: Body[]): {
  x: number;
  y: number;
  z: number;
} {
  let m = 0,
    x = 0,
    y = 0,
    z = 0;
  for (const b of bodies) {
    m += b.mass;
    x += b.mass * b.x;
    y += b.mass * b.y;
    z += b.mass * b.z;
  }
  if (m === 0) return { x: 0, y: 0, z: 0 };
  return { x: x / m, y: y / m, z: z / m };
}
