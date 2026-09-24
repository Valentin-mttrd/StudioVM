let controller: AbortController | null = null;

// Cards marked [data-tilt] rest at a slight static angle (set in CSS, like a
// product shot propped up for a photo) and straighten toward the cursor on
// hover instead of tracking it edge to edge — the resting skew is what sells
// "real object with depth"; a flat card that only tilts on hover reads as a
// gimmick. Lerped so it settles instead of snapping.
export function initTiltCards(): void {
  controller?.abort();

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    return;
  }

  const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');
  if (cards.length === 0) return;

  controller = new AbortController();
  const { signal } = controller;

  cards.forEach((card) => {
    // Listen on the parent, not the card: a 3D-rotated element's own
    // getBoundingClientRect() is the axis-aligned box around a now-warped
    // quadrilateral, so the browser's own hit-testing at "the card's
    // center" can miss the card and land on whatever is behind it. The
    // untransformed parent doesn't have that problem and — since nothing
    // in this layout pads it away from the card — covers the same area.
    const hitZone = card.parentElement ?? card;
    const maxTilt = Number(card.dataset.tiltMax) || 5;
    let curX = 0;
    let curY = 0;
    let targetX = 0;
    let targetY = 0;
    let raf = 0;
    let hovering = false;

    const apply = () => {
      curX += (targetX - curX) * 0.15;
      curY += (targetY - curY) * 0.15;

      if (hovering) {
        card.style.transform = `perspective(1400px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg) translateY(-6px) scale(1.012)`;
      } else {
        card.style.transform = `perspective(1400px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;
      }

      const settled = Math.abs(targetX - curX) < 0.05 && Math.abs(targetY - curY) < 0.05;
      if (!settled || hovering) {
        raf = requestAnimationFrame(apply);
      } else {
        if (targetX === 0 && targetY === 0 && !hovering) card.style.transform = '';
        raf = 0;
      }
    };

    hitZone.addEventListener(
      'pointermove',
      (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        targetX = -py * maxTilt;
        targetY = px * maxTilt;
        if (!raf) raf = requestAnimationFrame(apply);
      },
      { signal }
    );

    hitZone.addEventListener(
      'pointerenter',
      () => {
        hovering = true;
        card.classList.add('is-hovering');
        if (!raf) raf = requestAnimationFrame(apply);
      },
      { signal }
    );

    hitZone.addEventListener(
      'pointerleave',
      () => {
        hovering = false;
        card.classList.remove('is-hovering');
        targetX = 0;
        targetY = 0;
        if (!raf) raf = requestAnimationFrame(apply);
      },
      { signal }
    );
  });
}
