/**
 * Reveal-on-scroll for [data-reveal]. Siblings inside a [data-reveal-group]
 * get a stagger index. Everything is visible without JS or with reduced
 * motion (see global.css), and a failsafe shows anything left hidden.
 */
const items = document.querySelectorAll<HTMLElement>('[data-reveal]');

document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
  group.querySelectorAll<HTMLElement>(':scope > [data-reveal]').forEach((el, i) => {
    el.style.setProperty('--reveal-i', String(Math.min(i, 8)));
  });
});

const show = (el: Element) => el.classList.add('is-in');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
} else {
  items.forEach(show);
}

// Printing must never catch content mid-reveal.
window.addEventListener('beforeprint', () => items.forEach(show));
