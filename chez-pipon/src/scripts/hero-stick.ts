/**
 * The storefront hero is sticky on large screens (the page slides over
 * it). When it's taller than the window, stick it by its bottom edge
 * instead of its top so its lower part stays reachable.
 */
export function initHeroStick(): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const update = () => hero.style.setProperty('--hero-stick', `${Math.min(0, window.innerHeight - hero.offsetHeight)}px`);
  update();
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(hero);
  window.addEventListener('resize', update, { passive: true });
}
