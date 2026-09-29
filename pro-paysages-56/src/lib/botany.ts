/**
 * Build-time generators for the site's botanical drawings. They run in
 * component frontmatter only, so visitors download static SVG paths and no
 * script. Everything is seeded: the same drawing comes out on every build.
 */

export type Rng = () => number;

/** Small, fast, seedable PRNG (mulberry32). */
export function rng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const range = (r: Rng, min: number, max: number) => min + r() * (max - min);

/**
 * Coordinate precision. One decimal by default; large drawings (the
 * 1600-unit hero) switch to whole units with `precision(0)` — invisible at
 * that scale, and it halves the markup.
 */
let decimals = 1;
export const precision = (d: 0 | 1) => {
  decimals = d;
};

export const n = (v: number) => (decimals === 0 ? Math.round(v) : Math.round(v * 10) / 10);

type Pt = [number, number];

/**
 * A lanceolate leaf from `p`, heading `angle` (radians), length `len`,
 * maximum half-width `w`. `bend` curves the midrib sideways.
 */
export function leaf(p: Pt, angle: number, len: number, w: number, bend = 0): string {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const px = -sa;
  const py = ca;
  const tip: Pt = [p[0] + ca * len + px * bend, p[1] + sa * len + py * bend];
  const mx = p[0] + ca * len * 0.46 + px * bend * 0.6;
  const my = p[1] + sa * len * 0.46 + py * bend * 0.6;
  // A quadratic control point at 2w puts the widest point at w.
  const c1: Pt = [mx + px * w * 2, my + py * w * 2];
  const c2: Pt = [mx - px * w * 2, my - py * w * 2];
  return `M${n(p[0])} ${n(p[1])}Q${n(c1[0])} ${n(c1[1])} ${n(tip[0])} ${n(tip[1])}Q${n(c2[0])} ${n(c2[1])} ${n(p[0])} ${n(p[1])}Z`;
}

export interface FrondOptions {
  x: number;
  y: number;
  /** Initial heading, radians (−π/2 = straight up). */
  angle: number;
  length: number;
  /** Total change of heading along the rachis, radians (sign = direction). */
  curl: number;
  /** Longest pinna. */
  width: number;
  pairs: number;
  /** Bare stipe, as a share of the length. */
  stipe?: number;
}

/**
 * A fern frond: a curving rachis carrying alternate pinnae, longest in the
 * lower third, tapering to the tip. Returns the rachis (to stroke) and the
 * pinnae (to fill), plus its base for sway animations.
 */
export function frond(o: FrondOptions) {
  const steps = 64;
  const ds = o.length / steps;
  const stipe = o.stipe ?? 0.14;
  const pts: [number, number, number][] = [];
  let x = o.x;
  let y = o.y;
  let a = o.angle;
  for (let i = 0; i <= steps; i++) {
    pts.push([x, y, a]);
    const t = i / steps;
    a += (o.curl / steps) * (0.35 + 1.3 * t);
    x += Math.cos(a) * ds;
    y += Math.sin(a) * ds;
  }

  const rachis = 'M' + pts.map(([px, py]) => `${n(px)} ${n(py)}`).join('L');

  let pinnae = '';
  for (let k = 0; k < o.pairs; k++) {
    for (const side of [-1, 1]) {
      // Alternate: one side sits half a step higher.
      const u = (k + (side > 0 ? 0.5 : 0)) / o.pairs;
      const t = stipe + (1 - stipe) * u;
      const [px, py, pa] = pts[Math.min(steps, Math.round(t * steps))];
      const profile = Math.pow(Math.sin(Math.PI * (0.14 + 0.86 * u)), 0.55) * (1 - 0.62 * u);
      const len = Math.max(3, o.width * profile);
      const spread = (1.12 - 0.42 * u) * Math.sign(o.curl || 1) * side;
      pinnae += leaf([px, py], pa + spread, len, len * 0.17, side * len * 0.06);
    }
  }
  return { rachis, pinnae, base: [o.x, o.y] as Pt };
}

/** One grass blade, tapered, leaning by `lean` (tip offset / height). */
export function blade(x: number, y: number, h: number, lean: number, w: number): string {
  const tipX = x + lean * h;
  const tipY = y - h;
  const cx = x + lean * h * 0.22;
  const cy = y - h * 0.62;
  return `M${n(x - w)} ${n(y)}Q${n(cx - w * 0.35)} ${n(cy)} ${n(tipX)} ${n(tipY)}Q${n(cx + w * 0.35)} ${n(cy)} ${n(x + w)} ${n(y)}Z`;
}

/** A tuft of blades fanning out from a base point. */
export function tuft(r: Rng, x: number, y: number, h: number, count: number, w = 2.2, spread = 0.55): string {
  let d = '';
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const lean = (t - 0.5) * 2 * spread + range(r, -0.12, 0.12);
    const hh = h * range(r, 0.55, 1) * (1 - Math.abs(t - 0.5) * 0.5);
    d += blade(x + (t - 0.5) * w * count * 0.8, y, hh, lean, w * range(r, 0.8, 1.2));
  }
  return d;
}

/**
 * A closed, softly irregular outline around a centre — a clipped box ball,
 * a canopy, a shrub. `amp` is the leafy roughness as a share of the radius.
 */
export function blob(r: Rng, cx: number, cy: number, rx: number, ry: number, bumps = 26, amp = 0.05): string {
  const pts: Pt[] = [];
  for (let i = 0; i < bumps; i++) {
    const a = (i / bumps) * Math.PI * 2;
    const k = 1 + (i % 2 ? amp : -amp * 0.4) * range(r, 0.55, 1.1);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smoothClosed(pts);
}

/** Smooth closed curve through points (quadratic, via midpoints). */
export function smoothClosed(pts: Pt[]): string {
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(pts[pts.length - 1], pts[0]);
  let d = `M${n(m0[0])} ${n(m0[1])}`;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % pts.length]);
    d += `Q${n(p[0])} ${n(p[1])} ${n(m[0])} ${n(m[1])}`;
  }
  return d + 'Z';
}

/** Circle as a path fragment, to merge many into one element. */
export function circle(cx: number, cy: number, r: number): string {
  return `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0Z`;
}

/**
 * Rectangle whose top edge (and optionally sides) is leafy: the silhouette
 * of a hedge. `rough` = 0 gives the crisp, freshly clipped version.
 */
export function hedge(r: Rng, x: number, y: number, w: number, h: number, radius: number, rough: number): string {
  const pts: Pt[] = [];
  const stepsV = Math.max(4, Math.round(h / 14));
  const stepsH = Math.max(6, Math.round(w / 14));
  const j = () => range(r, 0.2, 1) * rough;
  // Left side, bottom → top
  for (let i = 0; i <= stepsV; i++) {
    const yy = y + h - (i / stepsV) * (h - radius);
    pts.push([x - (i % 2 ? j() : j() * 0.3), yy]);
  }
  // Top, left → right
  for (let i = 1; i < stepsH; i++) {
    const xx = x + radius * 0.4 + (i / stepsH) * (w - radius * 0.8);
    pts.push([xx, y - (i % 2 ? j() : j() * 0.3)]);
  }
  // Right side, top → bottom
  for (let i = stepsV; i >= 0; i--) {
    const yy = y + h - (i / stepsV) * (h - radius);
    pts.push([x + w + (i % 2 ? j() : j() * 0.3), yy]);
  }
  const first = pts[0];
  const last = pts[pts.length - 1];
  let d = `M${n(first[0])} ${n(y + h)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    d += `Q${n(a[0])} ${n(a[1])} ${n((a[0] + b[0]) / 2)} ${n((a[1] + b[1]) / 2)}`;
  }
  return d + `L${n(last[0])} ${n(y + h)}Z`;
}
