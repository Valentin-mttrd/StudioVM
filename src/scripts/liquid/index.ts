import { detectTier } from './quality';
import type { LiquidEngine } from './engine';

// Light bootstrap that ships in the main bundle: decides the tier, then
// lazy-loads the WebGL engine (its own chunk) only when it will actually run.

let engine: LiquidEngine | null = null;
let loading: Promise<LiquidEngine | null> | null = null;

export function initLiquid(): void {
  if (loading) {
    // The canvas persists across navigations (transition:persist) and so
    // does the engine; a new page only needs its structure re-read.
    loading.then((e) => e?.refresh());
    return;
  }

  const tier = detectTier();
  document.documentElement.dataset.liquidTier = tier;
  if (tier === 'off') return;

  const canvas = document.getElementById('liquid-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  loading = import('./engine')
    .then(({ createEngine }) => {
      engine = createEngine(canvas, tier);
      if (engine && document.querySelector('[data-hero]')) engine.intro();
      return engine;
    })
    .catch((error) => {
      console.warn('[liquid] engine failed to load:', error);
      document.documentElement.dataset.liquidTier = 'off';
      return null;
    });
}

export const getLiquid = (): LiquidEngine | null => engine;

/** Drop something into the water at a viewport position (px). No-op without the engine. */
export function liquidDrop(x: number, y: number, radius?: number, strength?: number): void {
  engine?.drop(x, y, radius, strength);
}
