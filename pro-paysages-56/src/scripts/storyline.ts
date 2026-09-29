/**
 * Home storyline: the active step (the one crossing 55 % of the viewport)
 * sets the drawing's state; during « Entretenir » the scroll position
 * inside the step moves the maintenance line across the garden.
 */
import { setState, setCut, prime, type GardenState } from './garden';

const story = document.querySelector<HTMLElement>('[data-story]');
const garden = story?.querySelector<HTMLElement>('[data-garden="scroll"]');
const steps = story ? [...story.querySelectorAll<HTMLElement>('[data-step-state]')] : [];

if (story && garden && steps.length) {
  let started = false;
  let ticking = false;

  prime(garden);

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const line = vh * 0.55;
    let active = 0;
    steps.forEach((s, i) => {
      if (s.getBoundingClientRect().top < line) active = i;
    });
    steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
    if (!started) return;

    const state = steps[active].dataset.stepState as GardenState;
    setState(garden, state);
    if (state === 'care') {
      const r = steps[active].getBoundingClientRect();
      setCut(garden, (line - r.top) / Math.max(1, r.height - vh * 0.45));
    } else {
      setCut(garden, 0);
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  // The drawing starts (and draws its plan) once it is really on screen.
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !started) {
        started = true;
        update();
      }
    },
    { threshold: 0.3 },
  ).observe(garden);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}
