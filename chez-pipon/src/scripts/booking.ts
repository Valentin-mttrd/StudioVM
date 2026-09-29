import { CONTACT, SITE } from '../data/site';
import { arrivalTimes, formatSlotDate, formatTime, upcomingServices, type Slot } from '../lib/hours';

/**
 * "Préparer ma demande": builds a booking message from the services the
 * restaurant is really open for, then hands it to one of its two real
 * channels — copied for an Instagram DM, or read out on the phone.
 * Nothing leaves the browser.
 */
const MIN_PARTY = 1;
const MAX_PARTY = 12;
const BIG_PARTY = 7;

const shortDate = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });

export function initBooking(): void {
  const form = document.querySelector<HTMLFormElement>('[data-booking]');
  if (!form) return;

  const slotsBox = form.querySelector<HTMLElement>('[data-slots]')!;
  const timesBox = form.querySelector<HTMLElement>('[data-times]')!;
  const partyValue = form.querySelector<HTMLOutputElement>('[data-party-value]')!;
  const partyHint = form.querySelector<HTMLElement>('[data-party-hint]')!;
  const partyButtons = form.querySelectorAll<HTMLButtonElement>('[data-party]');
  const nameInput = form.querySelector<HTMLInputElement>('#booking-name')!;
  const nameError = form.querySelector<HTMLElement>('[data-name-error]')!;
  const noteInput = form.querySelector<HTMLInputElement>('#booking-note')!;
  const message = form.querySelector<HTMLElement>('[data-message]')!;
  const toast = form.querySelector<HTMLElement>('[data-toast]')!;
  const sendInstagram = form.querySelector<HTMLAnchorElement>('[data-send-instagram]')!;
  const copyButton = form.querySelector<HTMLButtonElement>('[data-copy]')!;

  const slots = upcomingServices(8);
  if (!slots.length) return; // no known opening: keep the plain phone / Instagram links

  let slot: Slot = slots[0];
  let time: string | null = null;
  let party = 2;

  // ---- Services ----------------------------------------------------------
  slotsBox.replaceChildren(
    ...slots.map((s, i) => {
      const label = document.createElement('label');
      label.className = 'chip';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'slot';
      input.value = s.id;
      input.checked = i === 0;
      const face = document.createElement('span');
      const date = document.createElement('strong');
      date.textContent = shortDate.format(new Date(s.dateUtc));
      const service = document.createElement('small');
      service.textContent = `${s.service.name} · ${formatTime(s.service.open)}–${formatTime(s.service.close)}`;
      face.append(date, service);
      input.addEventListener('change', () => {
        slot = s;
        time = null;
        renderTimes();
        renderMessage();
      });
      label.append(input, face);
      return label;
    })
  );

  // ---- Arrival time ------------------------------------------------------
  const renderTimes = () => {
    const options: (string | null)[] = [null, ...arrivalTimes(slot.service)];
    timesBox.replaceChildren(
      ...options.map((t) => {
        const label = document.createElement('label');
        label.className = 'chip';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'time';
        input.value = t ?? '';
        input.checked = t === time;
        const face = document.createElement('span');
        face.textContent = t ? formatTime(t) : 'Peu importe';
        input.addEventListener('change', () => {
          time = t;
          renderMessage();
        });
        label.append(input, face);
        return label;
      })
    );
  };

  // ---- Party size --------------------------------------------------------
  const renderParty = () => {
    partyValue.value = String(party);
    partyValue.textContent = String(party);
    partyButtons.forEach((b) => {
      const step = Number(b.dataset.party);
      b.disabled = step < 0 ? party <= MIN_PARTY : party >= MAX_PARTY;
    });
    partyHint.hidden = party < BIG_PARTY;
  };
  partyButtons.forEach((b) =>
    b.addEventListener('click', () => {
      party = Math.min(MAX_PARTY, Math.max(MIN_PARTY, party + Number(b.dataset.party)));
      renderParty();
      renderMessage();
    })
  );

  // ---- Message -----------------------------------------------------------
  const compose = (): string => {
    const name = nameInput.value.trim();
    const note = noteInput.value.trim();
    const people = `${party} personne${party > 1 ? 's' : ''}`;
    const service = slot.service.name === 'midi' ? 'au service du midi' : 'au service du soir';
    const arrival = time ? ` (arrivée vers ${formatTime(time)})` : '';
    const lines = [
      `Bonjour ${SITE.name} !`,
      `Je souhaiterais réserver une table pour ${people} le ${formatSlotDate(slot)}, ${service}${arrival}.`,
      `Nom : ${name || '…'}`,
    ];
    if (note) lines.push(`Précision : ${note}`);
    lines.push('Merci !');
    return lines.join('\n');
  };
  const renderMessage = () => {
    message.textContent = compose();
  };

  const validName = (): boolean => {
    const ok = nameInput.value.trim().length > 0;
    nameInput.setAttribute('aria-invalid', String(!ok));
    nameError.hidden = ok;
    return ok;
  };

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Older browsers / non-secure contexts
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    }
  };

  const say = (text: string) => {
    toast.textContent = '';
    window.setTimeout(() => (toast.textContent = text), 30);
  };

  nameInput.addEventListener('input', () => {
    if (nameInput.getAttribute('aria-invalid') === 'true') validName();
    renderMessage();
  });
  noteInput.addEventListener('input', renderMessage);

  // The link opens Instagram natively (no popup blocker, app on phones);
  // the copy starts inside the same click so the gesture is honoured.
  sendInstagram.addEventListener('click', (event) => {
    if (!validName()) {
      event.preventDefault();
      nameInput.focus();
      return;
    }
    void copy(compose()).then((ok) =>
      say(
        ok
          ? `Message copié. Collez-le dans la conversation Instagram avec @${CONTACT.instagramHandle}.`
          : 'La copie n’a pas fonctionné : recopiez le message ci-dessus dans Instagram.'
      )
    );
  });

  copyButton.addEventListener('click', async () => {
    if (!validName()) {
      nameInput.focus();
      return;
    }
    const ok = await copy(compose());
    say(ok ? 'Message copié dans le presse-papiers.' : 'La copie n’a pas fonctionné : sélectionnez le message pour le copier.');
  });

  form.addEventListener('submit', (event) => event.preventDefault());

  renderTimes();
  renderParty();
  renderMessage();
  form.hidden = false;
}
