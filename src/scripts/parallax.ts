let controller: AbortController | null = null;

export function initHeroParallax(): void {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  const grid = document.querySelector<HTMLElement>('[data-parallax]');
  const object = document.querySelector<HTMLElement>('[data-parallax-object]');
  if (!grid && !object) return;

  controller?.abort();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    if (grid) grid.style.transform = '';
    if (object) object.style.transform = '';
    return;
  }

  controller = new AbortController();
  const { signal } = controller;

  let scrollT = 0;
  let scrollTicking = false;
  let gridMouseX = 0;
  let gridMouseY = 0;
  let gridTargetX = 0;
  let gridTargetY = 0;
  let objMouseX = 0;
  let objMouseY = 0;
  let objTiltX = 0;
  let objTiltY = 0;
  let objTargetX = 0;
  let objTargetY = 0;
  let objTargetTiltX = 0;
  let objTargetTiltY = 0;
  let settling = false;

  const render = () => {
    if (grid) {
      const gridScroll = Math.min(scrollT * 0.08, 48);
      grid.style.transform = `translate3d(${gridMouseX.toFixed(2)}px, ${(gridScroll + gridMouseY).toFixed(2)}px, 0)`;
    }
    if (object) {
      const objScroll = -Math.min(scrollT * 0.14, 90);
      object.style.transform = `translate3d(${objMouseX.toFixed(2)}px, ${(objScroll + objMouseY).toFixed(2)}px, 0) rotateX(${objTiltX.toFixed(2)}deg) rotateY(${objTiltY.toFixed(2)}deg)`;
    }
  };

  const updateScroll = () => {
    scrollT = window.scrollY;
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

  // Decorative-only, desktop pointers only: the background grid drifts a
  // little toward the cursor, the floating 3D render drifts more and tilts
  // slightly — two layers separating at different speeds is what reads as
  // depth rather than a single flat plane. Both lerp toward their targets
  // so they settle like a spring instead of snapping to the pointer.
  const canTrackPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const settle = () => {
    gridMouseX += (gridTargetX - gridMouseX) * 0.08;
    gridMouseY += (gridTargetY - gridMouseY) * 0.08;
    objMouseX += (objTargetX - objMouseX) * 0.09;
    objMouseY += (objTargetY - objMouseY) * 0.09;
    objTiltX += (objTargetTiltX - objTiltX) * 0.09;
    objTiltY += (objTargetTiltY - objTiltY) * 0.09;
    render();

    const settled =
      Math.abs(gridTargetX - gridMouseX) < 0.05 &&
      Math.abs(gridTargetY - gridMouseY) < 0.05 &&
      Math.abs(objTargetX - objMouseX) < 0.05 &&
      Math.abs(objTargetY - objMouseY) < 0.05 &&
      Math.abs(objTargetTiltX - objTiltX) < 0.05 &&
      Math.abs(objTargetTiltY - objTiltY) < 0.05;

    if (!settled) {
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

        gridTargetX = relX * 14;
        gridTargetY = relY * 8;
        objTargetX = relX * -22;
        objTargetY = relY * -14;
        objTargetTiltY = relX * 8;
        objTargetTiltX = relY * -6;

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
        gridTargetX = 0;
        gridTargetY = 0;
        objTargetX = 0;
        objTargetY = 0;
        objTargetTiltX = 0;
        objTargetTiltY = 0;
        if (!settling) {
          settling = true;
          requestAnimationFrame(settle);
        }
      },
      { signal }
    );
  }
}
