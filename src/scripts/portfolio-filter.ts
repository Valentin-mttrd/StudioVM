export function initPortfolioFilter(): void {
  const filterBar = document.querySelector<HTMLElement>('[data-filter-bar]');
  const cards = document.querySelectorAll<HTMLElement>('[data-project-card]');
  if (!filterBar || cards.length === 0) return;

  const buttons = filterBar.querySelectorAll<HTMLButtonElement>('[data-filter]');

  function applyFilter(value: string): void {
    cards.forEach((card) => {
      const matches = value === 'all' || card.dataset.category === value;
      card.classList.toggle('hidden', !matches);
    });

    buttons.forEach((btn) => {
      const active = btn.dataset.filter === value;
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter ?? 'all'));
  });
}
