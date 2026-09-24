import { onTick } from './liquid/ticker';
import { Spring } from './liquid/spring';
import { hasFinePointer, prefersReducedMotion } from './liquid/env';
import { liquidDrop } from './liquid';

// Pointer physics for .lbtn liquid buttons (markup: components/ui/Button.astro,
// states: global.css). The CSS owns how each state looks; this only feeds it
// the pointer's entry / exit / press coordinates and runs the magnetic pull.

let controller: AbortController | null = null;
let stopMagnet: (() => void) | null = null;

function setPoint(body: HTMLElement, event: PointerEvent, xVar: string, yVar: string): void {
  const rect = body.getBoundingClientRect();
  body.style.setProperty(xVar, `${(event.clientX - rect.left).toFixed(1)}px`);
  body.style.setProperty(yVar, `${(event.clientY - rect.top).toFixed(1)}px`);
  body.style.setProperty('--bw', `${rect.width.toFixed(0)}px`);
}

export function initLiquidButtons(): void {
  controller?.abort();
  stopMagnet?.();
  controller = new AbortController();
  const { signal } = controller;
  const fine = hasFinePointer();

  document.querySelectorAll<HTMLElement>('[data-liquid-btn]').forEach((button) => {
    const body = button.querySelector<HTMLElement>('.lbtn__body');
    const ring = button.querySelector<HTMLElement>('.lbtn__ring');
    if (!body) return;
    const inactive = () => button.matches(':disabled, [aria-disabled="true"], [data-loading="true"]');

    if (fine) {
      button.addEventListener(
        'pointerenter',
        (event) => {
          if (inactive()) return;
          // The liquid floods in from exactly where the pointer came in…
          setPoint(body, event, '--ex', '--ey');
          button.classList.add('is-hover', 'is-wobble');
        },
        { signal },
      );
      button.addEventListener('pointermove', (event) => setPoint(body, event, '--mx', '--my'), { passive: true, signal });
      button.addEventListener(
        'pointerleave',
        (event) => {
          // …and drains back out the way it left.
          setPoint(body, event, '--ex', '--ey');
          button.classList.remove('is-hover');
        },
        { signal },
      );
      button.addEventListener(
        'animationend',
        (event) => {
          if (event.animationName === 'jelly') button.classList.remove('is-wobble');
        },
        { signal },
      );
    }

    button.addEventListener(
      'pointerdown',
      (event) => {
        if (inactive() || event.button !== 0) return;
        setPoint(body, event, '--px', '--py');
        if (ring) {
          ring.classList.remove('is-on');
          requestAnimationFrame(() => ring.classList.add('is-on'));
        }
        // The press travels on into the water behind the page.
        liquidDrop(event.clientX, event.clientY, 22, 0.55);
      },
      { signal },
    );
  });

  if (fine && !prefersReducedMotion()) stopMagnet = initMagnetic(signal);
}

interface Magnet {
  el: HTMLElement;
  body: HTMLElement;
  label: HTMLElement | null;
  strength: number;
  x: Spring;
  y: Spring;
  rect: DOMRect | null;
}

// Magnetic pull on [data-magnetic]: a spring (low damping, so it overshoots
// a little when released — the button has mass), not a lerp. The label
// travels further than the capsule for a sense of depth inside it.
function initMagnetic(signal: AbortSignal): (() => void) | null {
  const magnets: Magnet[] = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]')).map((el) => ({
    el,
    body: el.querySelector<HTMLElement>('.lbtn__body') ?? el,
    label: el.querySelector<HTMLElement>('.lbtn__label'),
    strength: Number(el.dataset.magnetic) || 0.32,
    x: new Spring(0, { stiffness: 180, damping: 13, precision: 0.02 }),
    y: new Spring(0, { stiffness: 180, damping: 13, precision: 0.02 }),
    rect: null,
  }));
  if (magnets.length === 0) return null;

  let pointerX = -1e4;
  let pointerY = -1e4;
  let unsubscribe: (() => void) | null = null;

  const tick = (dt: number) => {
    // Read every rect first, then write — no layout thrash.
    for (const m of magnets) m.rect = m.el.getBoundingClientRect();
    let active = false;
    for (const m of magnets) {
      const r = m.rect!;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = pointerX - cx;
      const dy = pointerY - cy;
      const radius = Math.max(r.width, r.height) / 2 + 70;
      const dist = Math.hypot(dx, dy);
      const pull = dist < radius ? 1 - dist / radius : 0;
      m.x.target = dx * m.strength * pull;
      m.y.target = dy * m.strength * pull;
      m.x.step(dt);
      m.y.step(dt);
      m.body.style.translate = `${m.x.value.toFixed(2)}px ${m.y.value.toFixed(2)}px`;
      if (m.label) m.label.style.translate = `${(m.x.value * 0.35).toFixed(2)}px ${(m.y.value * 0.35).toFixed(2)}px`;
      if (pull > 0 || !m.x.settled || !m.y.settled) active = true;
    }
    if (!active) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!unsubscribe) unsubscribe = onTick(tick);
    },
    { passive: true, signal },
  );

  return () => {
    unsubscribe?.();
    unsubscribe = null;
    for (const m of magnets) {
      m.body.style.translate = '';
      if (m.label) m.label.style.translate = '';
    }
  };
}
