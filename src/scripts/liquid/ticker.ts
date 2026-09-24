// One requestAnimationFrame loop for the whole site. Every animated system
// (water engine, cursor springs, magnetic buttons, smooth scroll, kinetic
// type…) subscribes here instead of running its own rAF chain, so there is
// exactly one callback per frame, one shared clock, and — when nothing is
// subscribed — no loop running at all.

export type TickFn = (dt: number, now: number) => void;

const subscribers = new Set<TickFn>();
let rafId = 0;
let last = 0;

function frame(now: number): void {
  // Clamp: a backgrounded tab or a long GC pause must not hand springs a
  // half-second step (they would explode or teleport).
  const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20);
  last = now;
  for (const fn of subscribers) fn(dt, now);
  rafId = subscribers.size > 0 ? requestAnimationFrame(frame) : 0;
}

/** Subscribe to the shared frame loop. Returns an unsubscribe function. */
export function onTick(fn: TickFn): () => void {
  subscribers.add(fn);
  if (!rafId) {
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  return () => {
    subscribers.delete(fn);
  };
}
