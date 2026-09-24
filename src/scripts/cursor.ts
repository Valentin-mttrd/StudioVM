import { onTick } from './liquid/ticker';
import { Spring } from './liquid/spring';
import { hasFinePointer, prefersReducedMotion } from './liquid/env';
import { isDeepTone, toneAtViewportY } from './liquid/bands';

// The liquid cursor: a droplet (dot) and its meniscus (ring), each on its
// own spring so the ring trails, overshoots and stretches along its own
// velocity (volume-preserving squash & stretch). Fine pointers only, never
// under reduced motion, and the native cursor is only hidden once this one
// has a real position — if anything here fails, the system cursor stays.
//
//   default  small ring + dot
//   link     ring swells and fills (links, buttons, labels)
//   magnet   ring wraps a liquid button like a film of water (.lbtn)
//   view     glass bubble with a label (data-cursor="view")
//   drag     glass bubble "Glisser" (data-cursor="drag")
//   text     hidden — the native I-beam shows over text fields

type State = 'default' | 'link' | 'magnet' | 'view' | 'drag' | 'text';

const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], label, summary, select, input[type="radio"], input[type="checkbox"], [data-cursor="link"]';
const TEXT_FIELD =
  'input:not([type="range"]):not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]';

const SIZE: Record<State, number> = { default: 36, link: 58, magnet: 36, view: 96, drag: 96, text: 36 };

let started = false;

export function initCursor(): void {
  if (started) {
    // Persisted across navigations: only the page underneath changed.
    document.dispatchEvent(new CustomEvent('cursor:refresh'));
    return;
  }
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const root = document.getElementById('liquid-cursor');
  const ring = root?.querySelector<HTMLElement>('.cursor__ring');
  const dot = root?.querySelector<HTMLElement>('.cursor__dot');
  const label = root?.querySelector<HTMLElement>('.cursor__label');
  if (!root || !ring || !dot || !label) return;
  started = true;

  const html = document.documentElement;
  let pointerX = -200;
  let pointerY = -200;
  let hasPosition = false;
  let state: State = 'default';
  let magnetBody: HTMLElement | null = null;
  let hovered: Element | null = null;
  let unsubscribe: (() => void) | null = null;

  const dotX = new Spring(-200, { stiffness: 1500, damping: 62 });
  const dotY = new Spring(-200, { stiffness: 1500, damping: 62 });
  const ringX = new Spring(-200, { stiffness: 300, damping: 24 });
  const ringY = new Spring(-200, { stiffness: 300, damping: 24 });
  const ringW = new Spring(SIZE.default, { stiffness: 240, damping: 20 });
  const ringH = new Spring(SIZE.default, { stiffness: 240, damping: 20 });
  const ringR = new Spring(SIZE.default / 2, { stiffness: 240, damping: 20 });
  const press = new Spring(1, { stiffness: 600, damping: 16, precision: 0.002 });
  const springs = [dotX, dotY, ringX, ringY, ringW, ringH, ringR, press];

  let lastW = -1;
  let lastH = -1;
  let lastR = -1;

  const setState = (next: State, magnet: HTMLElement | null = null) => {
    magnetBody = magnet;
    if (next === state) return;
    state = next;
    root.dataset.state = next;
  };

  const resolve = (el: Element | null) => {
    hovered = el;
    if (!el || !(el instanceof Element)) return setState('default');
    if (el.closest(TEXT_FIELD)) return setState('text');
    const custom = el.closest<HTMLElement>('[data-cursor]');
    const mode = custom?.dataset.cursor;
    if (custom && (mode === 'view' || mode === 'drag')) {
      label.textContent = custom.dataset.cursorLabel ?? (mode === 'view' ? 'Voir' : 'Glisser');
      return setState(mode);
    }
    const lbtn = el.closest<HTMLElement>('.lbtn');
    if (lbtn && !lbtn.matches(':disabled, [aria-disabled="true"]')) {
      return setState('magnet', lbtn.querySelector<HTMLElement>('.lbtn__body') ?? lbtn);
    }
    if (el.closest(INTERACTIVE)) return setState('link');
    setState('default');
  };

  const tick = (dt: number) => {
    let tx = pointerX;
    let ty = pointerY;
    let tw = SIZE[state];
    let th = tw;
    let tr = tw / 2;

    if (state === 'magnet' && magnetBody?.isConnected) {
      const r = magnetBody.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // Wraps the button, but still leans a little toward the pointer.
      tx = cx + (pointerX - cx) * 0.1;
      ty = cy + (pointerY - cy) * 0.1;
      tw = r.width + 14;
      th = r.height + 14;
      tr = th / 2;
    }

    dotX.target = pointerX;
    dotY.target = pointerY;
    ringX.target = tx;
    ringY.target = ty;
    ringW.target = tw;
    ringH.target = th;
    ringR.target = tr;
    for (const s of springs) s.step(dt);

    const blob = state === 'default' || state === 'link';
    const speed = Math.hypot(ringX.velocity, ringY.velocity);
    const stretch = blob ? Math.min(speed / 4200, 0.42) : 0;
    const angle = Math.atan2(ringY.velocity, ringX.velocity);
    const p = press.value;

    const w = ringW.value;
    const h = ringH.value;
    const rad = Math.max(ringR.value, 0);
    if (Math.abs(w - lastW) > 0.1 || Math.abs(h - lastH) > 0.1) {
      ring.style.width = `${w.toFixed(1)}px`;
      ring.style.height = `${h.toFixed(1)}px`;
      lastW = w;
      lastH = h;
    }
    if (Math.abs(rad - lastR) > 0.1) {
      ring.style.borderRadius = `${rad.toFixed(1)}px`;
      lastR = rad;
    }
    ring.style.transform =
      `translate3d(${(ringX.value - w / 2).toFixed(2)}px, ${(ringY.value - h / 2).toFixed(2)}px, 0) ` +
      `rotate(${angle.toFixed(3)}rad) scale(${((1 + stretch) * p).toFixed(3)}, ${((1 - stretch * 0.55) * p).toFixed(3)}) rotate(${(-angle).toFixed(3)}rad)`;
    dot.style.transform = `translate3d(${dotX.value.toFixed(2)}px, ${dotY.value.toFixed(2)}px, 0) scale(${(0.6 + p * 0.4).toFixed(3)})`;

    // Colour follows the water under the pointer.
    const over = html.classList.contains('is-transitioning') || isDeepTone(toneAtViewportY(pointerY)) ? 'dark' : 'light';
    if (root.dataset.over !== over) root.dataset.over = over;

    if (springs.every((s) => s.settled) && state !== 'magnet') {
      unsubscribe?.();
      unsubscribe = null;
    }
  };

  const wake = () => {
    if (!unsubscribe) unsubscribe = onTick(tick);
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') {
        root.classList.remove('is-visible');
        html.classList.remove('has-cursor');
        return;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!hasPosition) {
        hasPosition = true;
        for (const s of [dotX, ringX]) s.snap(pointerX);
        for (const s of [dotY, ringY]) s.snap(pointerY);
        html.classList.add('has-cursor');
      }
      root.classList.add('is-visible');
      wake();
    },
    { passive: true },
  );

  document.addEventListener('pointerover', (event) => resolve(event.target as Element), { passive: true });

  window.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType === 'touch') return;
      press.target = 0.72;
      wake();
    },
    { passive: true },
  );

  window.addEventListener(
    'pointerup',
    () => {
      press.target = 1;
      press.velocity += 5;
      wake();
    },
    { passive: true },
  );

  document.documentElement.addEventListener('pointerleave', () => root.classList.remove('is-visible'));
  window.addEventListener('blur', () => root.classList.remove('is-visible'));

  // Content scrolls under a still pointer without any pointerover — re-read
  // what is under it once scrolling pauses.
  let scrollTimer = 0;
  window.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        if (hasPosition) resolve(document.elementFromPoint(pointerX, pointerY));
        wake();
      }, 90);
    },
    { passive: true },
  );

  document.addEventListener('cursor:refresh', () => {
    magnetBody = null;
    if (hasPosition) resolve(document.elementFromPoint(pointerX, pointerY));
    wake();
  });

  // Elements can be removed while hovered (menu closing, filtering).
  const observer = new MutationObserver(() => {
    if (hovered && !hovered.isConnected && hasPosition) resolve(document.elementFromPoint(pointerX, pointerY));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('astro:after-swap', () => observer.observe(document.body, { childList: true, subtree: true }));
}
