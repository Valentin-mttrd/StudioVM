import { onTick } from './liquid/ticker';
import { Spring } from './liquid/spring';
import { hasFinePointer, prefersReducedMotion } from './liquid/env';
import { isDeepTone, toneAtViewportY, watchBands } from './liquid/bands';
import { setScrollLocked } from './smooth-scroll';

// Smart header: part of the page at the top, a floating glass capsule once
// you scroll (recoloured to the water under it), hidden while scrolling
// down and back as soon as you scroll up. A liquid blob — two springs of
// different stiffness merged by an SVG goo filter — slides between links
// and stretches as it goes, like a drop pulled along a surface.

let controller: AbortController | null = null;
let stopBlob: (() => void) | null = null;

export function initNavbar(): void {
  const header = document.querySelector<HTMLElement>('[data-nav]');
  if (!header) return;

  controller?.abort();
  stopBlob?.();
  controller = new AbortController();
  const { signal } = controller;
  const html = document.documentElement;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const menuOpen = html.classList.contains('menu-open');
    header.dataset.state = y > 40 ? 'float' : 'top';
    if (!menuOpen) {
      const down = y > lastY + 2;
      const up = y < lastY - 2;
      if (down && y > 320) header.dataset.hidden = 'true';
      else if (up || y <= 320) header.dataset.hidden = 'false';
    }
    lastY = y;
    const over = menuOpen || isDeepTone(toneAtViewportY(44)) ? 'dark' : 'light';
    if (header.dataset.over !== over) header.dataset.over = over;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', scrollable > 0 ? Math.min(Math.max(y / scrollable, 0), 1).toFixed(4) : '0');
  };

  const schedule = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener('scroll', schedule, { passive: true, signal });
  const unwatch = watchBands(schedule);
  signal.addEventListener('abort', unwatch);

  // Keyboard users tabbing into a hidden header get it back.
  header.addEventListener('focusin', () => (header.dataset.hidden = 'false'), { signal });

  stopBlob = initBlob(header, signal);
  initMenu(header, signal, update);
}

function initBlob(header: HTMLElement, signal: AbortSignal): (() => void) | null {
  const nav = header.querySelector<HTMLElement>('[data-nav-links]');
  const goo = nav?.querySelector<HTMLElement>('[data-nav-goo]');
  const lead = goo?.querySelector<HTMLElement>('[data-blob="lead"]');
  const trail = goo?.querySelector<HTMLElement>('[data-blob="trail"]');
  if (!nav || !goo || !lead || !trail || !hasFinePointer()) return null;

  const links = Array.from(nav.querySelectorAll<HTMLElement>('.nav-link'));
  const current = links.find((link) => link.getAttribute('aria-current') === 'page') ?? null;
  const reduced = prefersReducedMotion();
  const leadX = new Spring(0, { stiffness: 320, damping: 26 });
  const leadW = new Spring(0, { stiffness: 320, damping: 26 });
  const trailX = new Spring(0, { stiffness: 110, damping: 15 });
  const trailW = new Spring(0, { stiffness: 110, damping: 15 });
  const springs = [leadX, leadW, trailX, trailW];
  let unsubscribe: (() => void) | null = null;
  let shown = false;

  const render = () => {
    lead.style.transform = `translateX(${leadX.value.toFixed(2)}px)`;
    lead.style.width = `${Math.max(leadW.value, 0).toFixed(2)}px`;
    trail.style.transform = `translateX(${trailX.value.toFixed(2)}px)`;
    trail.style.width = `${Math.max(trailW.value, 0).toFixed(2)}px`;
  };

  const tick = (dt: number) => {
    for (const s of springs) s.step(dt);
    render();
    if (springs.every((s) => s.settled)) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };

  const moveTo = (link: HTMLElement | null) => {
    if (!link) {
      goo.classList.add('is-empty');
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    if (r.width === 0) return;
    const x = r.left - navRect.left;
    for (const s of [leadX, trailX]) s.target = x;
    for (const s of [leadW, trailW]) s.target = r.width;
    if (!shown || reduced) {
      // First appearance: materialise in place rather than sliding in from 0.
      for (const s of springs) s.snap();
      shown = true;
    }
    goo.classList.remove('is-empty');
    render();
    if (!unsubscribe && !reduced) unsubscribe = onTick(tick);
  };

  links.forEach((link) => {
    link.addEventListener('pointerenter', () => moveTo(link), { signal });
    link.addEventListener('focus', () => moveTo(link), { signal });
  });
  nav.addEventListener('pointerleave', () => moveTo(current), { signal });
  nav.addEventListener('focusout', (event) => {
    if (!nav.contains(event.relatedTarget as Node)) moveTo(current);
  }, { signal });

  // Fonts shift link widths; place the resting blob once they're in.
  const place = () => {
    shown = false;
    moveTo(current);
  };
  place();
  document.fonts?.ready.then(() => !signal.aborted && place());
  window.addEventListener('resize', place, { passive: true, signal });

  return () => {
    unsubscribe?.();
    unsubscribe = null;
  };
}

function initMenu(header: HTMLElement, signal: AbortSignal, refresh: () => void): void {
  const html = document.documentElement;
  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  if (!toggle || !menu) return;
  const firstLink = menu.querySelector<HTMLAnchorElement>('a');

  const open = () => {
    // The water floods out from the button itself.
    const r = toggle.getBoundingClientRect();
    menu.style.setProperty('--ox', `${(r.left + r.width / 2).toFixed(0)}px`);
    menu.style.setProperty('--oy', `${(r.top + r.height / 2).toFixed(0)}px`);
    html.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer le menu');
    menu.removeAttribute('inert');
    header.dataset.hidden = 'false';
    setScrollLocked(true);
    refresh();
    window.setTimeout(() => firstLink?.focus({ preventScroll: true }), 60);
  };

  const close = (restoreFocus = true) => {
    if (!html.classList.contains('menu-open')) return;
    html.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    menu.setAttribute('inert', '');
    setScrollLocked(false);
    refresh();
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => (html.classList.contains('menu-open') ? close() : open()), { signal });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => close(false), { signal }));
  document.addEventListener('keydown', (event) => event.key === 'Escape' && close(), { signal });
  document.addEventListener('astro:before-preparation', () => close(false), { signal });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && close(false), { signal });
}
