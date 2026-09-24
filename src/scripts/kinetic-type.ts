import { onTick } from './liquid/ticker';
import { hasFinePointer, prefersReducedMotion } from './liquid/env';

// Kinetic headline: [data-kinetic] is split into letters that surface one
// after another (see global.css), then — for a real pointer — each letter
// leans away from the cursor and swells in weight (the variable font's
// wght axis) as it passes, with a gaussian falloff, like letters floating
// in water around a finger. The heading keeps its full text as aria-label;
// the letters themselves are aria-hidden.

let controller: AbortController | null = null;
let unsubscribe: (() => void) | null = null;

interface Glyph {
  el: HTMLElement;
  cx: number;
  cy: number;
  x: number;
  y: number;
  w: number;
  base: number;
  swell: boolean;
}

function split(heading: HTMLElement, stagger: number, start: number): void {
  if (heading.classList.contains('is-split')) return;
  // innerText respects the block-level line spans (textContent would
  // run "digitales" and "pour" together).
  heading.setAttribute('aria-label', heading.innerText.replace(/\s+/g, ' ').trim());
  let i = 0;
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of (child.textContent ?? '').split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(' ');
            continue;
          }
          const word = document.createElement('span');
          word.className = 'kin-w';
          word.setAttribute('aria-hidden', 'true');
          for (const ch of Array.from(part)) {
            const glyph = document.createElement('span');
            glyph.className = 'kin-c';
            glyph.textContent = ch;
            glyph.style.setProperty('--d', String(start + i * stagger));
            i++;
            word.append(glyph);
          }
          frag.append(word);
        }
        child.replaceWith(frag);
      } else if (child instanceof HTMLElement) {
        if (child.hasAttribute('data-kinetic-keep')) {
          // Kept whole (e.g. the liquid-light word, whose gradient must
          // span the word): surfaces as one unit, never swells.
          child.classList.add('kin-c');
          child.setAttribute('aria-hidden', 'true');
          child.style.setProperty('--d', String(start + i * stagger));
          i += Math.max(1, (child.textContent ?? '').length);
        } else {
          walk(child);
        }
      }
    }
  };
  walk(heading);
  heading.classList.add('is-split');
  wavefront(heading, start);
}

// Re-time the entrance as a wave travelling across the whole headline: each
// letter's delay follows its horizontal position (all lines at once, a
// little later per line), and it starts sunk on a sine-shaped swell, tipped
// slightly — so the words rise through a moving surface rather than
// appearing one character at a time.
function wavefront(heading: HTMLElement, start: number): void {
  const glyphs = Array.from(heading.querySelectorAll<HTMLElement>('.kin-c'));
  const width = heading.offsetWidth || 1;
  const lineHeight = parseFloat(getComputedStyle(heading).lineHeight) || heading.offsetHeight || 1;
  for (const glyph of glyphs) {
    const x = glyph.offsetLeft + glyph.offsetWidth / 2;
    const line = Math.round(glyph.offsetTop / lineHeight);
    const u = x / width;
    glyph.style.setProperty('--d', String(Math.round(start + u * 620 + line * 110)));
    glyph.style.setProperty('--wy', `${(0.55 + Math.sin(u * 9 + line * 1.7) * 0.22).toFixed(3)}em`);
    glyph.style.setProperty('--wr', `${(Math.cos(u * 9 + line * 1.7) * 5).toFixed(2)}deg`);
  }
}

export function initKineticType(): void {
  controller?.abort();
  unsubscribe?.();
  unsubscribe = null;

  const headings = document.querySelectorAll<HTMLElement>('[data-kinetic]');
  if (headings.length === 0 || prefersReducedMotion()) return;
  controller = new AbortController();
  const { signal } = controller;

  headings.forEach((heading) => {
    split(heading, Number(heading.dataset.kineticStagger) || 17, Number(heading.dataset.kineticDelay) || 0);
    // Two frames: let the hidden initial state paint before surfacing.
    requestAnimationFrame(() => requestAnimationFrame(() => heading.classList.add('is-in')));
    if (hasFinePointer()) interact(heading, signal);
  });
}

function interact(heading: HTMLElement, signal: AbortSignal): void {
  const zone = heading.closest<HTMLElement>('[data-kinetic-zone]') ?? heading;
  const glyphs: Glyph[] = Array.from(heading.querySelectorAll<HTMLElement>('.kin-c')).map((el) => ({
    el,
    cx: 0,
    cy: 0,
    x: 0,
    y: 0,
    w: 0,
    base: 0,
    swell: !el.hasAttribute('data-kinetic-keep'),
  }));
  let mx = -1e4;
  let my = -1e4;
  let inside = false;
  let measured = false;

  const measure = () => {
    // Pin every letter's box at its resting width, so a letter swelling
    // in weight overlaps its neighbours slightly instead of reflowing the
    // whole line on every frame.
    for (const g of glyphs) {
      g.el.style.width = '';
      g.el.style.fontWeight = '';
    }
    for (const g of glyphs) {
      g.cx = g.el.offsetLeft + g.el.offsetWidth / 2;
      g.cy = g.el.offsetTop + g.el.offsetHeight / 2;
      // Each letter swells from its own weight (light words and the bold
      // emphasis alike), never below it.
      g.base = parseFloat(getComputedStyle(g.el).fontWeight) || 300;
      if (g.swell) g.el.style.width = `${g.el.offsetWidth}px`;
    }
    measured = true;
  };

  const tick = (dt: number) => {
    if (!measured) measure();
    const rect = heading.getBoundingClientRect();
    const px = mx - rect.left;
    const py = my - rect.top;
    const sigma = Math.max(rect.height * 0.28, 70);
    const k = 1 - Math.exp(-11 * dt);
    let moving = false;
    for (const g of glyphs) {
      const dx = g.cx - px;
      const dy = g.cy - py;
      const d2 = dx * dx + dy * dy;
      const f = inside ? Math.exp(-d2 / (2 * sigma * sigma)) : 0;
      const inv = 1 / Math.sqrt(d2 + 1);
      const tx = dx * inv * 12 * f;
      const ty = dy * inv * 9 * f - 4 * f;
      const tw = g.swell ? 260 * f : 0;
      g.x += (tx - g.x) * k;
      g.y += (ty - g.y) * k;
      g.w += (tw - g.w) * k;
      if (Math.abs(tx - g.x) > 0.02 || Math.abs(ty - g.y) > 0.02 || Math.abs(tw - g.w) > 0.5) moving = true;
      g.el.style.transform = Math.abs(g.x) + Math.abs(g.y) < 0.01 ? '' : `translate(${g.x.toFixed(2)}px, ${g.y.toFixed(2)}px)`;
      if (g.swell) g.el.style.fontWeight = g.w < 1 ? '' : String(Math.min(Math.round(g.base + g.w * (g.base > 500 ? 0.5 : 1)), 820));
    }
    if (!moving && !inside) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };

  const wake = () => {
    if (!unsubscribe) unsubscribe = onTick(tick);
  };

  zone.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      mx = event.clientX;
      my = event.clientY;
      inside = true;
      wake();
    },
    { passive: true, signal },
  );
  zone.addEventListener(
    'pointerleave',
    () => {
      inside = false;
      wake();
    },
    { signal },
  );

  let resizeTimer = 0;
  const remeasure = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measured = false;
      measure();
    }, 120);
  };
  window.addEventListener('resize', remeasure, { passive: true, signal });
  document.fonts?.ready.then(() => {
    if (!signal.aborted) remeasure();
  });
}
