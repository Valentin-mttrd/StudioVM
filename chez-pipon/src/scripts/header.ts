/**
 * Header: colour over the storefront vs. over paper, hide-on-scroll on
 * phones, scroll-spy, the mobile menu, and the phone action bar.
 */
const mobile = window.matchMedia('(max-width: 767px)');

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const afterHero = hero?.nextElementSibling as HTMLElement | null;
  const initialTheme = header.dataset.initialTheme ?? 'light';
  const bar = document.querySelector<HTMLElement>('[data-mbar]');
  const booking = document.getElementById('reserver');
  const footer = document.querySelector('footer');
  const darkGrounds = [...document.querySelectorAll<HTMLElement>('main > .on-dark:not([data-hero]), footer.on-dark')];

  let menuOpen = false;
  let bookingVisible = false;
  let footerVisible = false;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const headerH = header.offsetHeight;
    // Over the green storefront the header is clear with light type; below
    // it takes the colour of whatever it floats over — paper or green.
    const overHero = initialTheme === 'dark' && !!afterHero && afterHero.getBoundingClientRect().top > headerH;
    if (!menuOpen) {
      const line = headerH / 2;
      const overDark = darkGrounds.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= line && r.bottom > line;
      });
      header.dataset.theme = overHero || overDark ? 'dark' : 'light';
      header.toggleAttribute('data-clear', overHero);
    }

    // Phones: the header steps aside while reading down, returns on the way up.
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (mobile.matches && !menuOpen && y > headerH * 3 && goingDown) header.setAttribute('data-hidden', '');
    else if (goingUp || y <= headerH || !mobile.matches) header.removeAttribute('data-hidden');
    lastY = y;

    if (bar) {
      const heroGone = !hero || (afterHero?.getBoundingClientRect().top ?? 0) < window.innerHeight * 0.6;
      bar.toggleAttribute('data-visible', heroGone && !bookingVisible && !footerVisible && !menuOpen);
    }
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  // The action bar would duplicate the booking section's own buttons and
  // cover the footer's legal line: it steps away over both.
  if (bar && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === booking) bookingVisible = entry.isIntersecting;
        if (entry.target === footer) footerVisible = entry.isIntersecting;
      }
      requestUpdate();
    });
    if (booking) io.observe(booking);
    if (footer) io.observe(footer);
  }

  initScrollSpy();
  initMenu(header, {
    onChange(open) {
      menuOpen = open;
      if (open) {
        header.dataset.theme = 'dark';
        header.setAttribute('data-clear', '');
        header.removeAttribute('data-hidden');
      }
      requestUpdate();
    },
  });
  update();
}

function initScrollSpy(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const targets = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter((el): el is HTMLElement => !!el);
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const setCurrent = (id: string | null) => {
    links.forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  // A section is "current" while it crosses a line a third down the screen.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
        else if (links.some((l) => l.hash === `#${entry.target.id}` && l.hasAttribute('aria-current'))) setCurrent(null);
      }
    },
    { rootMargin: '-33% 0px -66% 0px' }
  );
  targets.forEach((t) => io.observe(t));
}

function initMenu(header: HTMLElement, { onChange }: { onChange: (open: boolean) => void }): void {
  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = header.querySelector<HTMLElement>('[data-menu]');
  const label = header.querySelector<HTMLElement>('[data-menu-label]');
  if (!toggle || !menu) return;

  const outside = () => [document.querySelector('main'), document.querySelector('footer'), document.querySelector('[data-mbar]')];
  let closeTimer: number | undefined;

  const setOpen = (open: boolean, { restoreFocus = true } = {}) => {
    window.clearTimeout(closeTimer);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    outside().forEach((el) => el?.toggleAttribute('inert', open));
    document.documentElement.style.overflow = open ? 'hidden' : '';

    if (open) {
      menu.hidden = false;
      void menu.offsetWidth;
      menu.setAttribute('data-open', '');
      menu.querySelector<HTMLElement>('[data-menu-link]')?.focus({ preventScroll: true });
    } else {
      menu.removeAttribute('data-open');
      closeTimer = window.setTimeout(() => (menu.hidden = true), 700);
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }
    onChange(open);
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('[data-menu-link]').forEach((link) =>
    link.addEventListener('click', () => setOpen(false, { restoreFocus: false }))
  );
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
  });
  // Rotating to a wide screen shows the full nav: never leave the page locked.
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, { restoreFocus: false });
  });
}
