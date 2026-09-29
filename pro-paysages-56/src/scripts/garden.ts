/**
 * Drives the « coupe de principe » drawings (components/art/GardenSection).
 *
 *   intro  — draws itself in plan, then fills in (réaliser), once, on view
 *   slider — the visitor drags the maintenance line across the wild garden
 *   scroll — left to scripts/storyline.ts, which calls setState / setCut
 *
 * Without JS, or with prefers-reduced-motion, the finished garden shows.
 */
export type GardenState = 'plan' | 'build' | 'care';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const CUT_FROM = 30;
const CUT_TO = 1190;

export function setState(root: HTMLElement, state: GardenState) {
  const primed = root.classList.contains('is-pre');
  if (root.dataset.state === state && !primed) return;
  root.dataset.state = state;
  if (primed) {
    root.classList.remove('is-pre');
    if (!reduce.matches) {
      root.classList.add('is-drawing');
      window.setTimeout(() => root.classList.remove('is-drawing'), 2600);
    }
  }
}

/**
 * Moves the maintenance line; `progress` 0 (all wild) → 1 (all trimmed).
 * `exact` maps it to the full width, so a dragged line stays under the finger.
 */
export function setCut(root: HTMLElement, progress: number, exact = false) {
  const p = Math.min(1, Math.max(0, progress));
  const x = exact ? p * 1200 : CUT_FROM + p * (CUT_TO - CUT_FROM);
  const rect = root.querySelector<SVGRectElement>('[data-cut-rect]');
  const line = root.querySelector<SVGGElement>('[data-cutline]');
  rect?.setAttribute('x', x.toFixed(1));
  rect?.setAttribute('width', Math.max(0, 1200 - x).toFixed(1));
  line?.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
  root.querySelectorAll<HTMLElement>('[data-tag-x]').forEach((tag) => {
    tag.classList.toggle('is-done', x >= Number(tag.dataset.tagX));
  });
}

/** Prepares a drawing that will be drawn in plan before being built. */
export function prime(root: HTMLElement) {
  if (reduce.matches) return;
  root.classList.add('is-pre');
  root.dataset.state = 'plan';
}

// Pause the watering animation while off screen.
const visibility = new IntersectionObserver((entries) => {
  for (const e of entries) (e.target as HTMLElement).classList.toggle('is-paused', !e.isIntersecting);
});

document.querySelectorAll<HTMLElement>('[data-garden]').forEach((root) => {
  visibility.observe(root);
  const mode = root.dataset.garden;

  if (mode === 'intro') {
    if (reduce.matches) return;
    prime(root);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setState(root, 'plan');
        window.setTimeout(() => setState(root, 'build'), 1900);
      },
      { threshold: 0.35 },
    );
    io.observe(root);
  }

  if (mode === 'slider') {
    const range = root.querySelector<HTMLInputElement>('[data-garden-range]');
    root.dataset.state = 'care';
    const update = () => {
      const v = Number(range?.value ?? 0);
      setCut(root, v / 100, true);
      range?.setAttribute(
        'aria-valuetext',
        v === 0 ? 'Jardin avant entretien' : v === 100 ? 'Jardin entièrement entretenu' : `Entretien à ${v} %`,
      );
    };
    range?.addEventListener('input', () => {
      root.classList.add('is-touched');
      update();
    });
    update();

    // Once, when it comes into view: nudge the line to show it can move.
    if (range && !reduce.matches) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          const start = performance.now();
          const nudge = (t: number) => {
            if (root.classList.contains('is-touched')) return;
            const k = Math.min(1, (t - start) / 1800);
            const v = Math.sin(k * Math.PI) * 14;
            range.value = String(Math.round(v));
            update();
            if (k < 1) requestAnimationFrame(nudge);
          };
          window.setTimeout(() => requestAnimationFrame(nudge), 700);
        },
        { threshold: 0.6 },
      );
      io.observe(root);
    }
  }
});
