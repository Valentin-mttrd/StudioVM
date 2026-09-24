import type Lenis from 'lenis';
import { onTick } from './liquid/ticker';
import { hasFinePointer, prefersReducedMotion } from './liquid/env';

// Inertial scrolling (Lenis) — justified here beyond "smoothness": wheel
// input arrives in 100px notches, and everything scroll-driven on this site
// (the water's scroll shift, waterline swell, fluid media, parallax) would
// visibly step with it. Lenis turns those notches into one continuous
// velocity with momentum and friction. Desktop pointers only — touch keeps
// native scrolling, which already has real inertia — and never under
// reduced motion. Loaded as its own chunk, only where it runs.

let lenis: Lenis | null = null;
let loading = false;

export function initSmoothScroll(): void {
  if (lenis) {
    lenis.resize();
    return;
  }
  if (loading || prefersReducedMotion() || !hasFinePointer()) return;
  loading = true;

  import('lenis')
    .then(({ default: LenisCtor }) => {
      lenis = new LenisCtor({
        lerp: 0.095,
        wheelMultiplier: 0.95,
        anchors: true,
        stopInertiaOnNavigate: true,
        autoRaf: false,
      });
      onTick((_dt, now) => lenis?.raf(now));
      // Astro restores/zeroes the scroll position itself on navigation;
      // drop any momentum left over from the previous page and re-measure.
      document.addEventListener('astro:after-swap', () => {
        lenis?.resize();
        lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
      });
    })
    .catch(() => {
      loading = false;
    });
}

/** Freeze scrolling (open mobile menu) without touching the scroll position. */
export function setScrollLocked(locked: boolean): void {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
