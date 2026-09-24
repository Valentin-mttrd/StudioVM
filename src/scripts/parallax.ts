import { onTick } from './liquid/ticker';
import { hasFinePointer, prefersReducedMotion } from './liquid/env';

let controller: AbortController | null = null;
let unsubscribe: (() => void) | null = null;

// Hero depth: the fallback tile grid, the floating villa and the glass
// droplets move at different rates with scroll and pointer, so the scene
// separates into planes. All eased toward their targets on the shared
// ticker (frame-rate independent), and nothing runs once settled.
export function initHeroParallax(): void {
  controller?.abort();
  unsubscribe?.();
  unsubscribe = null;

  const section = document.querySelector<HTMLElement>('[data-hero]');
  const grid = document.querySelector<HTMLElement>('[data-parallax]');
  const object = document.querySelector<HTMLElement>('[data-parallax-object]');
  const drops = Array.from(document.querySelectorAll<HTMLElement>('.hero-drop[data-depth]'));
  if (!section || prefersReducedMotion()) return;

  controller = new AbortController();
  const { signal } = controller;

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let scroll = window.scrollY;

  const apply = () => {
    const s = Math.min(scroll, window.innerHeight * 1.2);
    if (grid) grid.style.transform = `translate3d(${(x * 14).toFixed(2)}px, ${(Math.min(s * 0.08, 48) + y * 8).toFixed(2)}px, 0)`;
    if (object) {
      object.style.transform =
        `translate3d(${(x * -22).toFixed(2)}px, ${(-Math.min(s * 0.14, 90) + y * -14).toFixed(2)}px, 0) ` +
        `rotateX(${(y * -6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
    }
    for (const drop of drops) {
      const d = Number(drop.dataset.depth) || 0.5;
      drop.style.transform = `translate3d(${(x * -40 * d).toFixed(2)}px, ${(y * -30 * d - s * 0.25 * d).toFixed(2)}px, 0)`;
    }
  };

  const tick = (dt: number) => {
    const k = 1 - Math.exp(-5 * dt);
    x += (targetX - x) * k;
    y += (targetY - y) * k;
    apply();
    if (Math.abs(targetX - x) < 0.0005 && Math.abs(targetY - y) < 0.0005) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };

  const wake = () => {
    if (!unsubscribe) unsubscribe = onTick(tick);
  };

  apply();
  window.addEventListener(
    'scroll',
    () => {
      scroll = window.scrollY;
      if (scroll < window.innerHeight * 1.4) {
        apply();
      }
    },
    { passive: true, signal },
  );

  if (hasFinePointer()) {
    section.addEventListener(
      'pointermove',
      (event) => {
        const rect = section.getBoundingClientRect();
        targetX = (event.clientX - rect.left) / rect.width - 0.5;
        targetY = (event.clientY - rect.top) / rect.height - 0.5;
        wake();
      },
      { passive: true, signal },
    );
    section.addEventListener(
      'pointerleave',
      () => {
        targetX = 0;
        targetY = 0;
        wake();
      },
      { signal },
    );
  }
}
