import { prefersReducedMotion } from './env';

// Rendering tiers for the water. The engine starts at the tier the device
// probably handles, then the FrameGovernor steps it down at runtime if frames
// actually run long — so a weak laptop ends up on a lighter tier instead of
// a janky one, without us having to guess perfectly up front.
//
//   high    desktop, 8+ threads / 8 GB+: full-resolution-ish water, 2 caustic layers
//   medium  other desktops/laptops
//   low     phones & tablets (and the first step down from medium)
//   static  reduced motion, data saver, or the last step down: one still frame,
//           re-rendered only when you scroll — no ripples, no motion
//   off     no WebGL2 at all: sections keep their plain CSS backgrounds
export type Tier = 'off' | 'static' | 'low' | 'medium' | 'high';

export interface TierSettings {
  /** Canvas pixels per CSS pixel. Water is soft, so well under 1 is invisible. */
  renderScale: number;
  /** Hard cap on canvas pixels, whatever the screen size. */
  maxPixels: number;
  /** Ripple-simulation cells per CSS pixel. */
  simScale: number;
  particles: number;
  causticLayers: 1 | 2;
  /** Frame cap while the visitor is interacting / after a few idle seconds. */
  fps: number;
  idleFps: number;
  ripples: boolean;
  animate: boolean;
}

export const TIER_SETTINGS: Record<Exclude<Tier, 'off'>, TierSettings> = {
  high: { renderScale: 0.72, maxPixels: 1_250_000, simScale: 1 / 3, particles: 380, causticLayers: 2, fps: 60, idleFps: 30, ripples: true, animate: true },
  medium: { renderScale: 0.55, maxPixels: 780_000, simScale: 1 / 4, particles: 220, causticLayers: 2, fps: 60, idleFps: 30, ripples: true, animate: true },
  low: { renderScale: 0.5, maxPixels: 360_000, simScale: 1 / 5, particles: 90, causticLayers: 1, fps: 60, idleFps: 24, ripples: true, animate: true },
  static: { renderScale: 0.5, maxPixels: 600_000, simScale: 1 / 4, particles: 0, causticLayers: 1, fps: 60, idleFps: 60, ripples: false, animate: false },
};

export const NEXT_TIER_DOWN: Record<Tier, Tier> = {
  high: 'medium',
  medium: 'low',
  low: 'static',
  static: 'static',
  off: 'off',
};

const TIERS: Tier[] = ['off', 'static', 'low', 'medium', 'high'];

export function detectTier(): Tier {
  // ?liquid=high|medium|low|static|off pins a tier (and disables the
  // governor) — for testing on real devices and for headless QA.
  const forced = new URLSearchParams(window.location.search).get('liquid');
  if (forced && (TIERS as string[]).includes(forced)) return forced as Tier;

  if (prefersReducedMotion()) return 'static';

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return 'static';

  if (window.matchMedia('(pointer: coarse)').matches) return 'low';

  const threads = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ?? 8;
  return threads >= 8 && memory >= 8 ? 'high' : 'medium';
}

export const isTierForced = (): boolean => new URLSearchParams(window.location.search).has('liquid');

/**
 * Watches real frame intervals. Sustained frames slower than the budget
 * (≈ under 38 fps for two seconds straight) means the current tier is too
 * heavy for this machine. Warm-up and pauses cover shader compilation and
 * page transitions, which are slow for reasons a lighter tier won't fix.
 */
export class FrameGovernor {
  private ema = 16.7;
  private slowFor = 0;
  private hold = 2;

  constructor(
    private readonly budgetMs = 26,
    private readonly sustain = 2,
  ) {}

  pause(seconds: number): void {
    this.hold = Math.max(this.hold, seconds);
  }

  /** Feed every frame's dt (seconds). Returns true when the tier should step down. */
  sample(dt: number): boolean {
    if (this.hold > 0) {
      this.hold -= dt;
      return false;
    }
    this.ema += (dt * 1000 - this.ema) * 0.06;
    if (this.ema > this.budgetMs) this.slowFor += dt;
    else this.slowFor = Math.max(0, this.slowFor - dt * 0.5);

    if (this.slowFor > this.sustain) {
      this.slowFor = 0;
      this.ema = 16.7;
      this.hold = 2;
      return true;
    }
    return false;
  }
}
