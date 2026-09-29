/**
 * Header state: `is-scrolled` once the page moves, `is-reading` while
 * scrolling down (the header steps aside), and the mobile menu panel with
 * focus kept inside, Escape to close and the page locked behind it.
 */
const root = document.documentElement;
const header = document.querySelector<HTMLElement>('[data-header]');
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const label = document.querySelector<HTMLElement>('[data-menu-label]');

let lastY = window.scrollY;
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  root.classList.toggle('is-scrolled', y > 8);
  // Only hide after the first screen, and only on a clear downward move.
  if (Math.abs(y - lastY) > 6) {
    root.classList.toggle('is-reading', y > lastY && y > 480);
    lastY = y;
  }
  ticking = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
onScroll();

// Keyboard users tabbing into the header always get it back.
header?.addEventListener('focusin', () => root.classList.remove('is-reading'));

function setOpen(open: boolean) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  if (label) label.textContent = open ? 'Fermer' : 'Menu';
  root.classList.toggle('menu-open', open);
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  } else {
    menu.classList.remove('is-open');
    menu.hidden = true;
  }
  document.body.style.overflow = open ? 'hidden' : '';
}

toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

menu?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) setOpen(false);
});

document.addEventListener('keydown', (e) => {
  if (!root.classList.contains('menu-open') || !header) return;
  if (e.key === 'Escape') {
    setOpen(false);
    toggle?.focus();
    return;
  }
  if (e.key !== 'Tab') return;
  const focusables = [...header.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
    (el) => el.offsetParent !== null,
  );
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

// Close the panel if the viewport grows past the desktop breakpoint.
matchMedia('(min-width: 72rem)').addEventListener('change', (e) => {
  if (e.matches) setOpen(false);
});

export {};
