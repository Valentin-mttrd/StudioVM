import { hours, TIME_ZONE, type DayHours, type Slot } from '@/data/business';

/** "09:30" → "9h30", "14:00" → "14h" (French convention). */
export function formatTime(time: string): string {
  const [h, m] = time.split(':');
  return `${Number(h)}h${m === '00' ? '' : m}`;
}

export function formatSlots(slots: readonly Slot[]): string {
  if (slots.length === 0) return 'Fermé';
  return slots.map(([open, close]) => `${formatTime(open)} – ${formatTime(close)}`).join(', ');
}

/** Consecutive days sharing the same hours, e.g. "Mardi – vendredi · 9h30 – 19h". */
export function groupedHours(): { days: string; hours: string; closed: boolean }[] {
  const groups: { first: DayHours; last: DayHours; key: string }[] = [];
  for (const day of hours) {
    const key = formatSlots(day.slots);
    const current = groups.at(-1);
    if (current && current.key === key) current.last = day;
    else groups.push({ first: day, last: day, key });
  }
  return groups.map(({ first, last, key }) => ({
    days: first === last ? first.label : `${first.label} – ${last.label.toLowerCase()}`,
    hours: key,
    closed: key === 'Fermé',
  }));
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** Day of week and minutes since midnight, in the institute's time zone. */
export function parisNow(date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export type OpenState = 'open' | 'closing' | 'closed';

export interface OpenStatus {
  state: OpenState;
  /** Short badge text: "Ouvert", "Ferme bientôt", "Fermé". */
  label: string;
  /** Complement: "jusqu'à 19h", "ouvre demain à 9h30"… */
  detail: string;
}

const byDay = (day: number) => hours.find((d) => d.day === day);

export function openStatus(date = new Date()): OpenStatus {
  const { day, minutes } = parisNow(date);
  const today = byDay(day);

  for (const [open, close] of today?.slots ?? []) {
    const start = toMinutes(open);
    const end = toMinutes(close);
    if (minutes >= start && minutes < end) {
      const closing = end - minutes <= 30;
      return {
        state: closing ? 'closing' : 'open',
        label: closing ? 'Ferme bientôt' : 'Ouvert',
        detail: `jusqu’à ${formatTime(close)}`,
      };
    }
    if (minutes < start) {
      return { state: 'closed', label: 'Fermé', detail: `ouvre aujourd’hui à ${formatTime(open)}` };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const next = byDay((day + offset) % 7);
    const first = next?.slots[0];
    if (next && first) {
      const when = offset === 1 ? 'demain' : next.label.toLowerCase();
      return { state: 'closed', label: 'Fermé', detail: `ouvre ${when} à ${formatTime(first[0])}` };
    }
  }

  return { state: 'closed', label: 'Fermé', detail: '' };
}
