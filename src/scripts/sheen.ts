import { hasFinePointer } from './liquid/env';

let controller: AbortController | null = null;

// Light that follows the pointer across a liquid-glass surface: writes
// --mx/--my on the hovered element only (never on :root, which would
// restyle the whole page every frame).
export function initSheen(): void {
  controller?.abort();
  if (!hasFinePointer()) return;
  controller = new AbortController();
  const { signal } = controller;

  document.querySelectorAll<HTMLElement>('[data-sheen]').forEach((el) => {
    el.addEventListener(
      'pointermove',
      (event) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${(event.clientX - rect.left).toFixed(1)}px`);
        el.style.setProperty('--my', `${(event.clientY - rect.top).toFixed(1)}px`);
      },
      { passive: true, signal },
    );
  });
}
