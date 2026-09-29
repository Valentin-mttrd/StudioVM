import { getStatus, parisClock, type Status } from '../lib/hours';

/**
 * Fills every [data-status] element (header pill, door sign, hours card…)
 * with the real state in Europe/Paris, and marks today's row in the hours
 * tables. Re-checks at each new minute and when the tab comes back.
 */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function render(nodes: NodeListOf<HTMLElement>, status: Status): void {
  nodes.forEach((node) => {
    node.dataset.state = status.state;
    const label = node.querySelector<HTMLElement>('[data-status-label]');
    const detail = node.querySelector<HTMLElement>('[data-status-detail]');
    if (label) label.textContent = status.label;
    if (!detail) return;
    if (node.hasAttribute('data-door-sign')) detail.textContent = status.detail;
    else if (node.dataset.statusVariant === 'short') detail.textContent = ` · ${status.short}`;
    else detail.textContent = ` · ${status.detail}`;
  });
}

function markToday(): void {
  const today = String(parisClock().day);
  document.querySelectorAll<HTMLElement>('[data-day]').forEach((row) => {
    row.classList.toggle('is-today', row.dataset.day === today);
  });
}

function swing(sign: HTMLElement | null): void {
  if (!sign || reducedMotion.matches) return;
  sign.removeAttribute('data-swing');
  void sign.offsetWidth;
  sign.setAttribute('data-swing', '');
  sign.addEventListener('animationend', () => sign.removeAttribute('data-swing'), { once: true });
}

export function initStatus(): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-status]');
  const sign = document.querySelector<HTMLElement>('[data-door-sign]');
  let lastState: string | undefined;
  let timer: number | undefined;

  const update = () => {
    const status = getStatus();
    render(nodes, status);
    markToday();
    // The door sign swings when it turns to the real state, and again
    // whenever the restaurant opens or closes while the page is open.
    if (status.state !== lastState && !(lastState === 'open' && status.state === 'closing')) swing(sign);
    lastState = status.state;
  };

  const schedule = () => {
    window.clearTimeout(timer);
    const msToNextMinute = 60_000 - (Date.now() % 60_000) + 50;
    timer = window.setTimeout(() => {
      update();
      schedule();
    }, msToNextMinute);
  };

  update();
  schedule();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      update();
      schedule();
    }
  });
}
