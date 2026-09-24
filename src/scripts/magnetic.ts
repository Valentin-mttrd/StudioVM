let controller: AbortController | null = null;

interface MagneticState {
  el: HTMLElement;
  strength: number;
  radius: number;
  targetX: number;
  targetY: number;
  curX: number;
  curY: number;
  raf: number;
}

function settle(state: MagneticState): void {
  state.curX += (state.targetX - state.curX) * 0.2;
  state.curY += (state.targetY - state.curY) * 0.2;
  state.el.style.transform = `translate(${state.curX.toFixed(2)}px, ${state.curY.toFixed(2)}px)`;

  if (Math.abs(state.targetX - state.curX) > 0.05 || Math.abs(state.targetY - state.curY) > 0.05) {
    state.raf = requestAnimationFrame(() => settle(state));
  } else {
    state.curX = state.targetX;
    state.curY = state.targetY;
    state.el.style.transform = `translate(${state.curX}px, ${state.curY}px)`;
    state.raf = 0;
  }
}

// A CTA drifts a few pixels toward the cursor before it even arrives, and
// eases back once the cursor leaves its pull radius — decorative only, so a
// lerp toward the target reads as a soft spring rather than the button
// snapping to the pointer. Skipped entirely for touch (no cursor to react
// to) and reduced motion.
export function initMagnetic(): void {
  controller?.abort();

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    return;
  }

  const elements = document.querySelectorAll<HTMLElement>('[data-magnetic]');
  if (elements.length === 0) return;

  controller = new AbortController();
  const { signal } = controller;

  const states: MagneticState[] = Array.from(elements).map((el) => ({
    el,
    strength: Number(el.dataset.magnetic) || 0.4,
    radius: el.offsetWidth / 2 + 56,
    targetX: 0,
    targetY: 0,
    curX: 0,
    curY: 0,
    raf: 0,
  }));

  window.addEventListener(
    'pointermove',
    (event) => {
      for (const state of states) {
        const rect = state.el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);

        if (distance < state.radius) {
          const pull = 1 - distance / state.radius;
          state.targetX = dx * state.strength * pull;
          state.targetY = dy * state.strength * pull;
        } else {
          state.targetX = 0;
          state.targetY = 0;
        }

        if (!state.raf) state.raf = requestAnimationFrame(() => settle(state));
      }
    },
    { passive: true, signal }
  );
}
