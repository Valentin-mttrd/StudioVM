/**
 * Horizontal strips (the photo gallery on phones) must be reachable with
 * the keyboard when — and only when — they actually scroll.
 */
export function initScrollers(): void {
  const scrollers = document.querySelectorAll<HTMLElement>('[data-scroller]');
  if (!scrollers.length) return;
  const sync = () =>
    scrollers.forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1) el.tabIndex = 0;
      else el.removeAttribute('tabindex');
    });
  sync();
  window.addEventListener('resize', sync, { passive: true });
}
