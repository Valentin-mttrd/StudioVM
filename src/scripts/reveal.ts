const groupCounts = new Map<string, number>();

function nextDelay(el: HTMLElement): number {
  const explicit = el.getAttribute('data-reveal-delay');
  if (explicit) return Number(explicit);

  const group = el.getAttribute('data-reveal-group');
  if (!group) return 0;
  const count = groupCounts.get(group) ?? 0;
  groupCounts.set(group, count + 1);
  return Math.min(count, 5) * 90;
}

let observer: IntersectionObserver | null = null;

export function initReveal(): void {
  groupCounts.clear();
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (els.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = nextDelay(el);
        if (delay) el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-visible');
        observer?.unobserve(el);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  els.forEach((el) => observer?.observe(el));
}
