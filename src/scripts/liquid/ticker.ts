// One requestAnimationFrame loop for the whole site. Every animated system
// (water engine, cursor springs, magnetic buttons, smooth scroll, kinetic
// type…) subscribes here instead of running its own rAF chain, so there is
// exactly one callback per frame, one shared clock, and — when nothing is
// subscribed — no loop running at all.
//
// Two phases per frame: "early" subscribers run first. Anything that READS
// layout (getBoundingClientRect…) belongs there, before the normal phase
// WRITES styles — otherwise each read after a write forces an extra
// synchronous layout in the middle of the frame.

export type TickFn = (dt: number, now: number) => void;

const early = new Set<TickFn>();
const normal = new Set<TickFn>();
let rafId = 0;
let last = 0;

function frame(now: number): void {
  // Clamp: a backgrounded tab or a long GC pause must not hand springs a
  // half-second step (they would explode or teleport).
  const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20);
  last = now;
  for (const fn of early) fn(dt, now);
  for (const fn of normal) fn(dt, now);
  rafId = early.size + normal.size > 0 ? requestAnimationFrame(frame) : 0;
}

/** Subscribe to the shared frame loop. Returns an unsubscribe function. */
export function onTick(fn: TickFn, options: { early?: boolean } = {}): () => void {
  const set = options.early ? early : normal;
  set.add(fn);
  if (!rafId) {
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  return () => {
    set.delete(fn);
  };
}
