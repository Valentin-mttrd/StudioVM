// Damped harmonic oscillator — the one physical model behind every
// "springy" motion on the site (cursor, magnetic pull, nav blob, page wave,
// kinetic letters). Values have mass and momentum: they accelerate, can
// overshoot, and settle, instead of easing along a fixed curve.

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
}

const SUBSTEP = 1 / 240;

export class Spring {
  value: number;
  target: number;
  velocity = 0;
  stiffness: number;
  damping: number;
  mass: number;
  precision: number;

  constructor(value = 0, config: SpringConfig = {}) {
    this.value = value;
    this.target = value;
    this.stiffness = config.stiffness ?? 170;
    this.damping = config.damping ?? 26;
    this.mass = config.mass ?? 1;
    this.precision = config.precision ?? 0.01;
  }

  /** Semi-implicit Euler with fixed substeps: stable for stiff springs at any frame rate. */
  step(dt: number): number {
    let remaining = dt;
    while (remaining > 1e-6) {
      const h = Math.min(SUBSTEP, remaining);
      const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
      this.velocity += (force / this.mass) * h;
      this.value += this.velocity * h;
      remaining -= h;
    }
    return this.value;
  }

  get settled(): boolean {
    return Math.abs(this.velocity) < this.precision && Math.abs(this.value - this.target) < this.precision;
  }

  /** Jump straight to a value with no motion (initial placement, reduced motion). */
  snap(value = this.target): void {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }
}
