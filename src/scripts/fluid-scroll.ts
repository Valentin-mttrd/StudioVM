import { onTick } from './liquid/ticker';
import { Spring } from './liquid/spring';
import { clamp, prefersReducedMotion } from './liquid/env';

// Media that behaves like it's suspended in water: [data-fluid] elements
// shear and stretch very slightly against the direction of scroll, in
// proportion to scroll speed, then wobble back into shape when scrolling
// stops (a soft spring, so it overshoots once). Only visible elements are
// touched, and nothing is written while the page is still.

let controller: AbortController | null = null;
let unsubscribe: (() => void) | null = null;

export function initFluidScroll(): void {
  controller?.abort();
  unsubscribe?.();
  unsubscribe = null;
  if (prefersReducedMotion()) return;

  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-fluid]'));
  if (elements.length === 0) return;

  controller = new AbortController();
  const visible = new Set<HTMLElement>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(el);
        else {
          visible.delete(el);
          el.style.transform = '';
        }
      }
    },
    { rootMargin: '15% 0px' },
  );
  elements.forEach((el) => io.observe(el));
  controller.signal.addEventListener('abort', () => io.disconnect());

  const shear = new Spring(0, { stiffness: 110, damping: 11, precision: 0.001 });
  let last = window.scrollY;
  let resting = true;

  unsubscribe = onTick((dt) => {
    const y = window.scrollY;
    const velocity = (y - last) / Math.max(dt, 1 / 240);
    last = y;
    shear.target = Math.abs(velocity) > window.innerHeight * 3 ? 0 : clamp(velocity * 0.0016, -2.4, 2.4);
    shear.step(dt);

    if (shear.settled && shear.target === 0) {
      if (!resting) {
        resting = true;
        for (const el of visible) el.style.transform = '';
      }
      return;
    }
    resting = false;
    const s = shear.value;
    for (const el of visible) {
      const k = Number(el.dataset.fluid) || 1;
      el.style.transform = `skewY(${(-s * 0.5 * k).toFixed(3)}deg) scaleY(${(1 + Math.abs(s) * 0.014 * k).toFixed(4)})`;
    }
  });
}
