import { DAY_NAMES, HOURS, type Service } from '../data/site';

/**
 * Opening-hours logic, shared by the static render (hours table, JSON-LD)
 * and the browser (live "open now" status, booking helper). Everything is
 * computed in Europe/Paris wall-clock time, whatever the visitor's zone.
 */

export const TIME_ZONE = 'Europe/Paris';

/** "11:30" → 690 */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** "11:30" → "11h30", "15:00" → "15h" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

export function formatService(service: Service): string {
  return `${formatTime(service.open)} – ${formatTime(service.close)}`;
}

export interface ParisClock {
  /** Calendar date in Paris, as a UTC-midnight timestamp (safe for day arithmetic). */
  dateUtc: number;
  /** 0 = Monday … 6 = Sunday */
  day: number;
  minutes: number;
}

export function parisClock(now: Date = new Date()): ParisClock {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const dateUtc = Date.UTC(get('year'), get('month') - 1, get('day'));
  return {
    dateUtc,
    day: (new Date(dateUtc).getUTCDay() + 6) % 7,
    minutes: get('hour') * 60 + get('minute'),
  };
}

export type OpenState = 'open' | 'closing' | 'closed';

export interface Status {
  state: OpenState;
  /** Short label for pills and the door sign: "Ouvert" / "Fermé" */
  label: string;
  /** One line of context: "Service du midi jusqu'à 15h" */
  detail: string;
  /** Compact context for tight spots: "jusqu'à 15h", "demain 11h30" */
  short: string;
}

const DAY_MS = 86_400_000;
const CLOSING_SOON = 30;

function dayWord(offset: number, day: number): string {
  if (offset === 0) return 'aujourd’hui';
  if (offset === 1) return 'demain';
  return DAY_NAMES[day].toLowerCase();
}

export function getStatus(now: Date = new Date()): Status {
  const clock = parisClock(now);
  const today = HOURS[clock.day];

  for (const service of today) {
    const open = toMinutes(service.open);
    const close = toMinutes(service.close);
    if (clock.minutes >= open && clock.minutes < close) {
      const left = close - clock.minutes;
      return {
        state: left <= CLOSING_SOON ? 'closing' : 'open',
        label: 'Ouvert',
        detail:
          left <= CLOSING_SOON
            ? `Fin du service à ${formatTime(service.close)}`
            : `Service du ${service.name} jusqu’à ${formatTime(service.close)}`,
        short: `jusqu’à ${formatTime(service.close)}`,
      };
    }
  }

  // Closed: find the next service, today or in the coming week.
  for (let offset = 0; offset < 8; offset++) {
    const day = (clock.day + offset) % 7;
    const next = HOURS[day].find((s) => offset > 0 || toMinutes(s.open) > clock.minutes);
    if (!next) continue;
    const when =
      offset === 0 && next.name === 'soir' ? 'ce soir' : dayWord(offset, day);
    return {
      state: 'closed',
      label: 'Fermé',
      detail: `Réouverture ${when} à ${formatTime(next.open)}`,
      short: `réouvre ${when} ${formatTime(next.open)}`,
    };
  }

  return { state: 'closed', label: 'Fermé', detail: 'Horaires à confirmer par téléphone', short: 'appelez-nous' };
}

export interface Slot {
  /** "2026-09-30|midi" — stable value for form controls */
  id: string;
  dateUtc: number;
  day: number;
  service: Service;
}

/** The next `limit` services that haven't ended yet (today included). */
export function upcomingServices(limit = 10, now: Date = new Date()): Slot[] {
  const clock = parisClock(now);
  const slots: Slot[] = [];
  for (let offset = 0; offset < 28 && slots.length < limit; offset++) {
    const day = (clock.day + offset) % 7;
    const dateUtc = clock.dateUtc + offset * DAY_MS;
    for (const service of HOURS[day]) {
      if (offset === 0 && toMinutes(service.close) <= clock.minutes) continue;
      const iso = new Date(dateUtc).toISOString().slice(0, 10);
      slots.push({ id: `${iso}|${service.name}`, dateUtc, day, service });
      if (slots.length >= limit) break;
    }
  }
  return slots;
}

const longDate = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** "mardi 30 septembre" */
export function formatSlotDate(slot: Slot): string {
  return longDate.format(new Date(slot.dateUtc));
}

/** Half-hour arrival times within a service, leaving the last hour for the meal. */
export function arrivalTimes(service: Service): string[] {
  const times: string[] = [];
  const last = toMinutes(service.close) - 60;
  for (let m = toMinutes(service.open); m <= last; m += 30) {
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    times.push(`${h}:${mm}`);
  }
  return times;
}

/** Rows for the hours table, Monday first. */
export function weekRows() {
  return DAY_NAMES.map((name, day) => ({
    day,
    name,
    services: HOURS[day],
    text: HOURS[day].length ? HOURS[day].map(formatService).join(' · ') : 'Fermé',
  }));
}

function joinDays(days: number[]): string {
  const names = days.map((d) => DAY_NAMES[d].toLowerCase());
  const consecutive = days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  if (days.length > 2 && consecutive) return `du ${names[0]} au ${names[names.length - 1]}`;
  if (days.length === 1) return `le ${names[0]}`;
  return `le ${names.slice(0, -1).join(', le ')} et le ${names[names.length - 1]}`;
}

/** "Midi du mardi au vendredi · soir le vendredi" — derived from HOURS. */
export function hoursSummary(): string {
  const parts: string[] = [];
  for (const name of ['midi', 'soir'] as const) {
    const days = HOURS.flatMap((services, day) => (services.some((s) => s.name === name) ? [day] : []));
    if (days.length) parts.push(`${name} ${joinDays(days)}`);
  }
  const text = parts.join(' · ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
