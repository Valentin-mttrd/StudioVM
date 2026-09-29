/**
 * Hero depth: each foliage layer drifts with the pointer and the scroll at
 * its own rate, near faster than far. Pointer only on devices that have a
 * precise one; everything off with prefers-reduced-motion; sway paused
 * when the hero leaves the screen.
 */
const hero = document.querySelector<HTMLElement>('[data-hero]');
const art = hero?.querySelector<SVGSVGElement>('[data-foliage]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

if (hero && art) {
  let target = 0;
  let mx = 0;
  let sy = 0;
  let raf = 0;
  let visible = true;

  const render = () => {
    raf = 0;
    mx += (target - mx) * 0.08;
    art.style.setProperty('--mx', mx.toFixed(2));
    art.style.setProperty('--sy', sy.toFixed(1));
    if (Math.abs(target - mx) > 0.05) raf = requestAnimationFrame(render);
  };
  const kick = () => {
    if (!raf && visible && !reduce.matches) raf = requestAnimationFrame(render);
  };

  if (matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      target = (e.clientX / window.innerWidth - 0.5) * -28;
      kick();
    });
    hero.addEventListener('pointerleave', () => {
      target = 0;
      kick();
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!visible || reduce.matches) return;
      sy = Math.min(window.scrollY, window.innerHeight) * -0.18;
      kick();
    },
    { passive: true },
  );

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    hero.classList.toggle('is-offscreen', !visible);
  }).observe(hero);
}

export {};
