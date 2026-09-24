let controller: AbortController | null = null;

export function initScrollProgress(): void {
  const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
  if (!bar) return;

  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  let ticking = false;

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
    bar.style.transform = `scaleX(${progress})`;
    ticking = false;
  };
  update();

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true, signal }
  );

  window.addEventListener('resize', update, { passive: true, signal });
}
