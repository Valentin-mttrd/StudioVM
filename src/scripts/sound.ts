// Optional sound — off by default, never on load, never on hover: it only
// ever answers something the visitor deliberately does (a press, a click).
// Everything is synthesised with WebAudio (no audio files to download) and
// kept very quiet behind a gentle low-pass. The choice lasts for the visit
// (sessionStorage), so every new visit starts silent again.

const KEY = 'vm-sound';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = false;
let bound = false;
let controller: AbortController | null = null;

function context(): AudioContext | null {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 2600;
  master.connect(lowpass).connect(ctx.destination);
  return ctx;
}

export const isSoundOn = (): boolean => enabled;

/** A single water drop: a bubble's resonance, rising in pitch as it closes. */
export function playDrop(intensity = 1): void {
  if (!enabled) return;
  const c = context();
  if (!c || !master) return;
  const t = c.currentTime + 0.004;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const f0 = 360 + Math.random() * 260;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(f0 * 3.1, t + 0.06);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.055 * intensity, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + 0.16);
}

/** A soft swell of moving water, for the page transition. */
export function playSwell(): void {
  if (!enabled) return;
  const c = context();
  if (!c || !master) return;
  if (!noise) {
    noise = c.createBuffer(1, Math.floor(c.sampleRate * 1.4), c.sampleRate);
    const data = noise.getChannelData(0);
    // Brown-ish noise: smoother, more "water" than white noise.
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
  }
  const t = c.currentTime + 0.01;
  const src = c.createBufferSource();
  src.buffer = noise;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(260, t);
  filter.frequency.exponentialRampToValueAtTime(1300, t + 0.5);
  filter.frequency.exponentialRampToValueAtTime(220, t + 1.25);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.05, t + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
  src.connect(filter).connect(gain).connect(master);
  src.start(t);
  src.stop(t + 1.4);
}

function sync(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Couper le son' : 'Activer le son');
    button.title = enabled ? 'Couper le son' : 'Activer le son (discret)';
  });
}

export function setSound(on: boolean): void {
  enabled = on;
  try {
    sessionStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* storage unavailable — the choice just won't survive a reload */
  }
  sync();
  if (on) playDrop(1);
}

export function initSound(): void {
  if (!bound) {
    bound = true;
    try {
      enabled = sessionStorage.getItem(KEY) === '1';
    } catch {
      enabled = false;
    }
    // One listener for the whole visit: every deliberate press makes a drop.
    window.addEventListener(
      'pointerdown',
      (event) => {
        if (!enabled || event.button !== 0) return;
        const target = event.target as Element | null;
        if (target?.closest('[data-sound-toggle]')) return;
        playDrop(target?.closest('a, button, [role="button"], label') ? 1 : 0.55);
      },
      { passive: true },
    );
  }

  controller?.abort();
  controller = new AbortController();
  document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach((button) => {
    button.addEventListener('click', () => setSound(!enabled), { signal: controller!.signal });
  });
  sync();
}
