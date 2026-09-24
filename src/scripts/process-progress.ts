let controller: AbortController | null = null;

// The connector line between the four process steps fills as the section
// scrolls past — reinforcing "process" as something that moves forward,
// instead of four static numbered circles sitting on a static line.
export function initProcessProgress(): void {
  const section = document.querySelector<HTMLElement>('[data-process]');
  const fill = document.querySelector<HTMLElement>('[data-process-fill]');
  controller?.abort();
  if (!section || !fill) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fill.style.transform = 'scaleX(1)';
    section.querySelectorAll<HTMLElement>('[data-process-step]').forEach((step) => (step.dataset.filled = 'true'));
    return;
  }

  controller = new AbortController();
  const { signal } = controller;
  let ticking = false;

  const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-process-step]'));

  const update = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height + vh * 0.5;
    const passed = vh * 0.85 - rect.top;
    const progress = total > 0 ? Math.min(Math.max(passed / total, 0), 1) : 1;
    fill.style.transform = `scaleX(${progress})`;
    // Each droplet fills once the liquid line has reached it.
    steps.forEach((step, i) => {
      const reached = progress >= (i + 0.35) / steps.length;
      if ((step.dataset.filled === 'true') !== reached) step.dataset.filled = String(reached);
    });
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
