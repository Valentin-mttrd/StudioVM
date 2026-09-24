import { onTick } from './liquid/ticker';
import { Spring } from './liquid/spring';
import { prefersReducedMotion } from './liquid/env';
import { getLiquid, liquidDrop } from './liquid';
import { playSwell } from './sound';

// Liquid page transition: a wave of deep water rises over the page while
// the next one loads, then keeps rising and leaves through the top,
// uncovering the new page and leaving a wake in the water behind it.
//
// The veil is one SVG path whose leading edge is driven by a spring. The
// edge's centre leads in proportion to the spring's velocity (a real wave
// front bulges forward), so it flattens and sloshes as the motion settles.
// Hooked into Astro's ClientRouter by wrapping the navigation's loader, so
// the page swaps exactly while the screen is covered.

type Phase = 'idle' | 'cover' | 'covered' | 'reveal';

const POINTS = 7;

let bound = false;

export function initPageTransitions(): void {
  if (bound) return;
  const veil = document.getElementById('liquid-veil');
  const fill = veil?.querySelector<SVGPathElement>('.veil__fill');
  const edge = veil?.querySelector<SVGPathElement>('.veil__edge');
  if (!veil || !fill || !edge) return;
  bound = true;

  const html = document.documentElement;
  const level = new Spring(0, { stiffness: 34, damping: 9.5, precision: 0.001 });
  const bulge = new Spring(0, { stiffness: 140, damping: 9, precision: 0.01 });
  let phase: Phase = 'idle';
  let time = 0;
  let unsubscribe: (() => void) | null = null;
  let resolveCover: (() => void) | null = null;
  let waitTimer = 0;

  const edgeY = (i: number): number => {
    const x = i / (POINTS - 1);
    const lead = Math.sin(Math.PI * x) * bulge.value;
    const ripple = Math.sin(x * Math.PI * 3 + time * 5.2) * 1.4 * Math.min(Math.abs(bulge.value) / 6 + 0.25, 1);
    return 100 - level.value * 100 - lead - ripple;
  };

  const curve = (ys: number[]): string => {
    // Catmull-Rom through the edge points, as cubic Béziers.
    let d = '';
    for (let i = 0; i < POINTS - 1; i++) {
      const x0 = ((i - 1) / (POINTS - 1)) * 100;
      const x1 = (i / (POINTS - 1)) * 100;
      const x2 = ((i + 1) / (POINTS - 1)) * 100;
      const x3 = ((i + 2) / (POINTS - 1)) * 100;
      const y0 = ys[Math.max(i - 1, 0)];
      const y1 = ys[i];
      const y2 = ys[i + 1];
      const y3 = ys[Math.min(i + 2, POINTS - 1)];
      const c1x = x1 + (x2 - x0) / 6;
      const c1y = y1 + (y2 - y0) / 6;
      const c2x = x2 - (x3 - x1) / 6;
      const c2y = y2 - (y3 - y1) / 6;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`;
    }
    return d;
  };

  const draw = () => {
    const ys = Array.from({ length: POINTS }, (_, i) => edgeY(i));
    const edgePath = `M0,${ys[0].toFixed(2)}${curve(ys)}`;
    // Cover: water below the edge. Reveal: water above it.
    fill.setAttribute('d', phase === 'reveal' ? `M100,0 L0,0 L0,${ys[0].toFixed(2)}${curve(ys)} Z` : `${edgePath} L100,100 L0,100 Z`);
    edge.setAttribute('d', edgePath);
    return ys;
  };

  let last = 0;
  const tick = (_dt: number, now: number) => {
    // Real elapsed time (the shared ticker clamps dt for UI springs): on a
    // slow frame the wave must still arrive on schedule, not in slow motion.
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    last = now;
    time += dt;
    const before = level.value;
    level.step(dt);
    const velocity = (level.value - before) / Math.max(dt, 1e-4);
    // The faster the water moves, the further its centre leads.
    bulge.target = velocity * 6.5;
    bulge.step(dt);
    const ys = draw();

    if (phase === 'cover' && ys.every((y) => y < -1)) {
      phase = 'covered';
      resolveCover?.();
      resolveCover = null;
    }

    if (phase === 'reveal') {
      // The wake: the water just uncovered is still moving.
      const vh = window.innerHeight;
      const lowest = Math.max(...ys);
      if (lowest > 0 && lowest < 100 && Math.random() < 0.7) {
        const i = Math.floor(Math.random() * POINTS);
        liquidDrop(((i + Math.random() - 0.5) / (POINTS - 1)) * window.innerWidth, (ys[i] / 100) * vh + 18, 34, 0.22);
      }
      if (ys.every((y) => y < -2)) finish();
    }
  };

  const run = () => {
    if (!unsubscribe) {
      last = 0;
      unsubscribe = onTick(tick);
    }
  };

  const finish = () => {
    phase = 'idle';
    veil.classList.remove('is-active', 'is-waiting');
    html.classList.remove('is-transitioning');
    level.snap(0);
    bulge.snap(0);
    unsubscribe?.();
    unsubscribe = null;
  };

  const cover = (): Promise<void> => {
    if (phase === 'covered') return Promise.resolve();
    return new Promise<void>((resolve) => {
      if (phase === 'idle') {
        level.snap(0);
        bulge.snap(0);
      }
      phase = 'cover';
      level.target = 1.34;
      resolveCover = resolve;
      veil.classList.add('is-active');
      html.classList.add('is-transitioning');
      getLiquid()?.hold(3);
      playSwell();
      run();
      // Never hold a navigation hostage to an animation.
      window.setTimeout(() => {
        if (resolveCover === resolve) {
          phase = 'covered';
          resolveCover = null;
          resolve();
        }
      }, 1100);
    });
  };

  const reveal = () => {
    if (phase === 'idle') return;
    window.clearTimeout(waitTimer);
    veil.classList.remove('is-waiting');
    phase = 'reveal';
    level.snap(0);
    bulge.snap(0);
    level.velocity = 0.6;
    level.target = 1.34;
    run();
    // Whatever happens to frame timing, the new page is never left covered.
    window.setTimeout(() => phase === 'reveal' && finish(), 1800);
  };

  document.addEventListener('astro:before-preparation', (event) => {
    if (prefersReducedMotion()) return;
    const prep = event as Event & { loader: () => Promise<void> };
    const load = prep.loader;
    prep.loader = async () => {
      const covering = cover();
      const loading = load();
      await covering;
      // Slow network: show the mark so a covered screen never looks stuck.
      waitTimer = window.setTimeout(() => veil.classList.add('is-waiting'), 350);
      await loading;
      window.clearTimeout(waitTimer);
    };
  });

  document.addEventListener('astro:after-swap', reveal);
}
