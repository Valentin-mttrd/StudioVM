// Registry of the page's full-width "water bands" — every element carrying
// data-tone (Section.astro, the hero, page headers, the footer). The water
// engine paints each band's water type behind it, the navbar and cursor use
// it to know what they are floating over. Page-space coordinates, so a band
// list stays valid while scrolling and only needs re-scanning on layout
// changes.

export type Tone = 'ink' | 'paper' | 'sand' | 'anthracite';

export interface Band {
  top: number;
  bottom: number;
  tone: Tone;
  /** data-water: 'hero' | 'header' | 'abyss' | '' — extra treatment in the shader. */
  kind: string;
}

const TONES = new Set<string>(['ink', 'paper', 'sand', 'anthracite']);

let bands: Band[] = [];
let docHeight = 0;

export function scanBands(): Band[] {
  const scrollY = window.scrollY;
  const next: Band[] = [];
  document.querySelectorAll<HTMLElement>('[data-tone]').forEach((el) => {
    const tone = el.dataset.tone ?? '';
    if (!TONES.has(tone)) return;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) return;
    next.push({ top: rect.top + scrollY, bottom: rect.bottom + scrollY, tone: tone as Tone, kind: el.dataset.water ?? '' });
  });
  next.sort((a, b) => a.top - b.top);
  bands = next;
  docHeight = document.documentElement.scrollHeight;
  return bands;
}

export const getBands = (): Band[] => bands;
export const getDocHeight = (): number => docHeight;

export const isDeepTone = (tone: Tone): boolean => tone === 'ink' || tone === 'anthracite';

export function toneAtPageY(y: number): Tone {
  let tone: Tone = bands[0]?.tone ?? 'ink';
  for (const band of bands) {
    if (y >= band.top) tone = band.tone;
    else break;
  }
  return tone;
}

export const toneAtViewportY = (y: number): Tone => toneAtPageY(y + window.scrollY);

const listeners = new Set<() => void>();
let observer: ResizeObserver | null = null;
let pending = 0;

function schedule(): void {
  if (pending) return;
  pending = requestAnimationFrame(() => {
    pending = 0;
    scanBands();
    listeners.forEach((fn) => fn());
  });
}

/** Keep the registry fresh (layout changes, fonts, navigation) and optionally get notified. */
export function watchBands(fn?: () => void): () => void {
  if (fn) listeners.add(fn);
  if (!observer) {
    observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('astro:after-swap', () => {
      // The body element is replaced on swap — re-attach to the new one.
      observer?.disconnect();
      observer?.observe(document.body);
      schedule();
    });
    document.addEventListener('astro:page-load', schedule);
    document.fonts?.ready.then(schedule).catch(() => {});
  }
  if (bands.length === 0) scanBands();
  schedule();
  return () => {
    if (fn) listeners.delete(fn);
  };
}
