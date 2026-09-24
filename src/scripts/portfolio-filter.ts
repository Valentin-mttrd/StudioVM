import { prefersReducedMotion } from './liquid/env';

// Category filter for /realisations. Whole rows (their <li>) are hidden —
// hiding only the link would leave empty list items and doubled borders —
// and rows coming back surface one after another rather than popping in.
export function initPortfolioFilter(): void {
  const filterBar = document.querySelector<HTMLElement>('[data-filter-bar]');
  const cards = document.querySelectorAll<HTMLElement>('[data-project-card]');
  if (!filterBar || cards.length === 0) return;

  const buttons = filterBar.querySelectorAll<HTMLButtonElement>('[data-filter]');
  const reduced = prefersReducedMotion();

  function applyFilter(value: string): void {
    let shown = 0;
    cards.forEach((card) => {
      const row = card.closest<HTMLElement>('li') ?? card;
      const matches = value === 'all' || card.dataset.category === value;
      const returning = matches && row.hidden;
      row.hidden = !matches;
      if (returning && !reduced) {
        row.style.setProperty('--i', String(shown));
        row.classList.remove('is-surfacing');
        requestAnimationFrame(() => row.classList.add('is-surfacing'));
      }
      if (matches) shown++;
    });

    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === value));
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter ?? 'all'));
  });
}
