// Capability queries shared by every liquid module. Read live (not cached)
// so a user flipping their OS "reduce motion" setting mid-visit is honoured
// on the next page load without a reload.
export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A real hovering pointer (mouse / trackpad / pen) — not touch. Everything
// cursor-driven (custom cursor, magnetic pull, hover sheen) keys off this.
export const hasFinePointer = (): boolean =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// Frame-rate independent exponential smoothing: `rate` is "fraction of the
// remaining distance covered per second", so behaviour is identical at 30,
// 60 or 120 Hz instead of speeding up on fast displays like a bare lerp.
export const damp = (current: number, target: number, rate: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-rate * dt));
