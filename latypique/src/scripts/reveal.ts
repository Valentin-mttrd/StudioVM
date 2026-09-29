/**
 * Adds `.is-in` to [data-reveal] elements the first time they enter the
 * viewport. Siblings inside a [data-reveal-group] get a stagger index.
 * CSS (global.css) owns the motion and skips it under reduced motion.
 */
const items = document.querySelectorAll<HTMLElement>('[data-reveal]');

document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
  group.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => {
    el.style.setProperty('--reveal-i', String(i));
  });
});

if (!('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('is-in'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((el) => observer.observe(el));
}
