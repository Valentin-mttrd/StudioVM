let controller: AbortController | null = null;

export function initHeroParallax(): void {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  const layer = document.querySelector<HTMLElement>('[data-parallax]');
  if (!layer) return;

  controller?.abort();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    layer.style.transform = '';
    return;
  }

  controller = new AbortController();
  const { signal } = controller;

  let scrollY = 0;
  let scrollTicking = false;
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let settling = false;

  const render = () => {
    layer.style.transform = `translate3d(${mouseX.toFixed(2)}px, ${(scrollY + mouseY).toFixed(2)}px, 0)`;
  };

  const updateScroll = () => {
    scrollY = Math.min(window.scrollY * 0.08, 48);
    render();
    scrollTicking = false;
  };
  updateScroll();

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateScroll);
      }
    },
    { passive: true, signal }
  );

  // Decorative-only: the watermark drifts a few pixels toward the cursor,
  // eased with a lerp so it settles like a spring instead of snapping to
  // the pointer. Desktop pointers only — touch has no hover, and this adds
  // nothing functional worth reproducing there.
  const canTrackPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const settle = () => {
    mouseX += (targetX - mouseX) * 0.08;
    mouseY += (targetY - mouseY) * 0.08;
    render();

    if (Math.abs(targetX - mouseX) > 0.05 || Math.abs(targetY - mouseY) > 0.05) {
      requestAnimationFrame(settle);
    } else {
      settling = false;
    }
  };

  if (canTrackPointer && section) {
    section.addEventListener(
      'pointermove',
      (event) => {
        const rect = section.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;
        targetX = relX * 14;
        targetY = relY * 8;

        if (!settling) {
          settling = true;
          requestAnimationFrame(settle);
        }
      },
      { passive: true, signal }
    );

    section.addEventListener(
      'pointerleave',
      () => {
        targetX = 0;
        targetY = 0;
        if (!settling) {
          settling = true;
          requestAnimationFrame(settle);
        }
      },
      { signal }
    );
  }
}
