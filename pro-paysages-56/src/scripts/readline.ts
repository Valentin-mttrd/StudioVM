/**
 * Word-by-word reading: sets --p (0 → 1) on [data-readline] as the
 * paragraph travels from the bottom of the screen to its upper third.
 */
const lines = [...document.querySelectorAll<HTMLElement>('[data-readline]')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

if (lines.length && !reduce.matches) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of lines) {
      const r = el.getBoundingClientRect();
      const p = (vh * 0.92 - r.top) / (vh * 0.92 - vh * 0.3 + r.height * 0.5);
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
    }
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

export {};
