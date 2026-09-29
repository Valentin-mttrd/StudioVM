/**
 * The street's reflection sliding across the shop window as the pointer
 * moves — depth for the hero, nothing else. Fine pointers only, off when
 * the visitor prefers reduced motion; one rAF-throttled custom property.
 */
export function initGlass(): void {
  const facade = document.querySelector<HTMLElement>('[data-glass]');
  if (!facade) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  let x = 0;
  let y = 0;
  facade.addEventListener(
    'pointermove',
    (event) => {
      const rect = facade.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        facade.style.setProperty('--gx', x.toFixed(3));
        facade.style.setProperty('--gy', y.toFixed(3));
      });
    },
    { passive: true }
  );
}
