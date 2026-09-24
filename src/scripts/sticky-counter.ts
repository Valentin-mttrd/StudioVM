let observer: IntersectionObserver | null = null;

// A large ghost numeral tracks whichever item is centered in the viewport —
// the scroll-spy pattern editorial sites use so a long list of short items
// still has one thing anchoring your eye instead of four flat blocks.
export function initStickyCounter(): void {
  const display = document.querySelector<HTMLElement>('[data-counter-display]');
  const items = document.querySelectorAll<HTMLElement>('[data-counter-item]');
  observer?.disconnect();
  if (!display || items.length === 0) return;

  const setActive = (index: string) => {
    if (display.dataset.current === index) return;
    display.dataset.current = index;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      display.textContent = index;
      return;
    }

    display.style.opacity = '0';
    window.setTimeout(() => {
      display.textContent = index;
      display.style.opacity = '1';
    }, 150);
  };

  setActive(items[0].dataset.counterIndex ?? '01');

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        const el = visible[0].target as HTMLElement;
        setActive(el.dataset.counterIndex ?? '01');
      }
    },
    { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
  );

  items.forEach((item) => observer?.observe(item));
}
