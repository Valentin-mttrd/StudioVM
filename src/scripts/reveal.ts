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

// Modes whose "in motion" styling (a travelling mask, a clip) costs a paint
// layer even once finished — they get .is-settled afterwards so the CSS can
// drop it. Durations match global.css.
const SETTLE_AFTER: Record<string, number> = { wave: 1450, drop: 1500 };

let observer: IntersectionObserver | null = null;

export function initReveal(): void {
  groupCounts.clear();
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (els.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible', 'is-settled'));
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
        const settle = SETTLE_AFTER[el.dataset.revealMode ?? ''];
        if (settle) window.setTimeout(() => el.classList.add('is-settled'), delay + settle);
        observer?.unobserve(el);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  els.forEach((el) => observer?.observe(el));
}
