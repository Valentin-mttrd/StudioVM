let lastScrollY = 0;
let ticking = false;
let controller: AbortController | null = null;

function updateHeaderState(header: HTMLElement): void {
  const currentY = window.scrollY;
  const menuOpen = document.documentElement.classList.contains('menu-open');

  header.dataset.solid = String(currentY > 16);

  if (!menuOpen) {
    const scrollingDown = currentY > lastScrollY && currentY > 220;
    header.dataset.hidden = String(scrollingDown);
  }

  lastScrollY = currentY;
  ticking = false;
}

export function initNavbar(): void {
  const header = document.querySelector<HTMLElement>('[data-nav]');
  if (!header) return;

  // Re-running on every astro:page-load; abort the previous page's
  // window/document-level listeners so they don't pile up over a session.
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  lastScrollY = window.scrollY;
  updateHeaderState(header);

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => updateHeaderState(header));
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true, signal });

  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  const firstLink = menu?.querySelector<HTMLAnchorElement>('a');

  const openMenu = () => {
    document.documentElement.classList.add('menu-open');
    toggle?.setAttribute('aria-expanded', 'true');
    menu?.removeAttribute('inert');
    header.dataset.hidden = 'false';
    window.setTimeout(() => firstLink?.focus(), 10);
  };

  const closeMenu = () => {
    if (!document.documentElement.classList.contains('menu-open')) return;
    document.documentElement.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('inert', '');
    toggle?.focus();
  };

  toggle?.addEventListener(
    'click',
    () => {
      const isOpen = document.documentElement.classList.contains('menu-open');
      if (isOpen) closeMenu();
      else openMenu();
    },
    { signal }
  );

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu, { signal }));

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') closeMenu();
    },
    { signal }
  );

  document.addEventListener('astro:before-preparation', closeMenu, { signal });
}
