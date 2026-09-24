import { onTick } from './liquid/ticker';
import { Spring } from './liquid/spring';
import { clamp, hasFinePointer, prefersReducedMotion } from './liquid/env';

let controller: AbortController | null = null;
let unsubscribe: (() => void) | null = null;

// Editorial list instead of a card grid: each project's cover appears in a
// glass lens that trails the pointer on a spring — it lags, leans into its
// direction of travel and stretches slightly with speed, as if dragged
// through water. Desktop/fine-pointer only: the mobile markup shows an
// inline thumbnail per row, so this never gates access to the image.
export function initPortfolioPreview(): void {
  controller?.abort();
  unsubscribe?.();
  unsubscribe = null;

  const list = document.querySelector<HTMLElement>('[data-portfolio-list]');
  const preview = document.querySelector<HTMLElement>('[data-portfolio-preview]');
  const lens = preview?.querySelector<HTMLElement>('[data-preview-lens]');
  if (!list || !preview || !lens || !hasFinePointer()) return;

  controller = new AbortController();
  const { signal } = controller;

  const rows = list.querySelectorAll<HTMLElement>('[data-portfolio-row]');
  const panels = preview.querySelectorAll<HTMLElement>('[data-preview-panel]');
  if (rows.length === 0 || panels.length === 0) return;

  const reduced = prefersReducedMotion();
  const x = new Spring(0, { stiffness: 150, damping: 19 });
  const y = new Spring(0, { stiffness: 150, damping: 19 });
  let placed = false;

  const tick = (dt: number) => {
    x.step(dt);
    y.step(dt);
    const lean = clamp(x.velocity * 0.012, -9, 9);
    const speed = Math.hypot(x.velocity, y.velocity);
    const stretch = reduced ? 0 : Math.min(speed / 9000, 0.12);
    preview.style.transform = `translate3d(${x.value.toFixed(1)}px, ${y.value.toFixed(1)}px, 0)`;
    lens.style.transform = reduced ? '' : `rotate(${lean.toFixed(2)}deg) scale(${(1 + stretch).toFixed(3)}, ${(1 - stretch * 0.5).toFixed(3)})`;
    if (x.settled && y.settled) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };

  list.addEventListener(
    'pointermove',
    (event) => {
      x.target = event.clientX + 48;
      y.target = event.clientY - preview.offsetHeight / 2;
      if (!placed || reduced) {
        x.snap();
        y.snap();
        placed = true;
      }
      if (!unsubscribe) unsubscribe = onTick(tick);
    },
    { passive: true, signal },
  );

  rows.forEach((row) => {
    const targetId = row.dataset.previewTarget;
    row.addEventListener(
      'pointerenter',
      () => {
        preview.classList.add('is-active');
        panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.previewPanel === targetId));
      },
      { signal },
    );
    row.addEventListener('pointerleave', () => preview.classList.remove('is-active'), { signal });
  });

  list.addEventListener(
    'pointerleave',
    () => {
      preview.classList.remove('is-active');
      placed = false;
    },
    { signal },
  );
}
