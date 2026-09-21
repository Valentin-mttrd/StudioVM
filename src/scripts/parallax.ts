let controller: AbortController | null = null;

export function initHeroParallax(): void {
  const layer = document.querySelector<HTMLElement>('[data-parallax]');
  if (!layer) return;

  controller?.abort();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    layer.style.transform = '';
    return;
  }

  controller = new AbortController();
  let ticking = false;

  const update = () => {
    const offset = Math.min(window.scrollY * 0.08, 48);
    layer.style.transform = `translateY(${offset}px)`;
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
    { passive: true, signal: controller.signal }
  );
}
