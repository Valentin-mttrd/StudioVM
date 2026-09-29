/**
 * Scroll reveals. <html> gets .js-reveal from an inline script in the head
 * (so nothing flashes); this module confirms with .reveal-ready — if it
 * never runs, the inline script drops .js-reveal and content stays visible.
 */
export function initReveal(): void {
  const root = document.documentElement;
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    root.classList.remove('js-reveal');
    return;
  }
  root.classList.add('reveal-ready');

  // Items of a group arrive one after the other, like plates to a table.
  const groups = new Map<string, number>();
  els.forEach((el) => {
    const group = el.dataset.revealGroup;
    if (!group || el.style.getPropertyValue('--reveal-delay')) return;
    const index = groups.get(group) ?? 0;
    groups.set(group, index + 1);
    el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 90}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  els.forEach((el) => observer.observe(el));
}
