let controller: AbortController | null = null;

// Editorial list instead of a card grid: the image only appears once you
// hover a row, following the cursor rather than sitting fixed in a card.
// Desktop/fine-pointer only — the mobile markup already shows a small
// inline thumbnail per row with no hover dependency (see realisations
// index.astro), so this is pure enhancement, not the only way to see it.
export function initPortfolioPreview(): void {
  controller?.abort();

  const list = document.querySelector<HTMLElement>('[data-portfolio-list]');
  const preview = document.querySelector<HTMLElement>('[data-portfolio-preview]');
  if (!list || !preview) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  controller = new AbortController();
  const { signal } = controller;

  const rows = list.querySelectorAll<HTMLElement>('[data-portfolio-row]');
  const panels = preview.querySelectorAll<HTMLElement>('[data-preview-panel]');
  if (rows.length === 0 || panels.length === 0) return;

  let curX = 0;
  let curY = 0;
  let targetX = 0;
  let targetY = 0;
  let raf = 0;
  let active = false;

  const render = () => {
    curX += (targetX - curX) * 0.2;
    curY += (targetY - curY) * 0.2;
    preview.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0)`;

    if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
      raf = requestAnimationFrame(render);
    } else {
      raf = 0;
    }
  };

  list.addEventListener(
    'pointermove',
    (event) => {
      targetX = event.clientX + 32;
      targetY = event.clientY - preview.offsetHeight / 2;
      if (!raf) raf = requestAnimationFrame(render);
    },
    { passive: true, signal }
  );

  rows.forEach((row) => {
    const targetId = row.dataset.previewTarget;

    row.addEventListener(
      'pointerenter',
      () => {
        active = true;
        preview.classList.add('is-active');
        panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.previewPanel === targetId));
      },
      { signal }
    );

    row.addEventListener(
      'pointerleave',
      () => {
        active = false;
        preview.classList.remove('is-active');
      },
      { signal }
    );
  });

  list.addEventListener(
    'pointerleave',
    () => {
      if (!active) preview.classList.remove('is-active');
    },
    { signal }
  );
}
