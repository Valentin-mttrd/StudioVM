import { initLiquid } from './liquid';
import { initSmoothScroll } from './smooth-scroll';
import { initPageTransitions } from './page-transition';
import { initCursor } from './cursor';
import { initSound } from './sound';
import { initLiquidButtons } from './liquid-button';
import { initSheen } from './sheen';
import { initKineticType } from './kinetic-type';
import { initFluidScroll } from './fluid-scroll';
import { initReveal } from './reveal';
import { initNavbar } from './navbar';
import { initPortfolioFilter } from './portfolio-filter';
import { initContactForm } from './contact-form';
import { initCompareSliders } from './compare-slider';
import { initHeroParallax } from './parallax';
import { initDashboardCharts } from './dashboard-preview';
import { initTiltCards } from './tilt-card';
import { initStickyCounter } from './sticky-counter';
import { initProcessProgress } from './process-progress';
import { initPortfolioPreview } from './portfolio-preview';

// Runs on first load and after every client-side navigation. The
// environment modules (water, scroll, transitions, cursor, sound) are
// idempotent singletons that survive navigations; everything else is
// page-level and re-binds to the new DOM.
function initAll(): void {
  document.documentElement.classList.add('js-ready');
  initLiquid();
  initSmoothScroll();
  initPageTransitions();
  initCursor();
  initSound();

  initKineticType();
  initReveal();
  initNavbar();
  initLiquidButtons();
  initSheen();
  initFluidScroll();
  initPortfolioFilter();
  initContactForm();
  initCompareSliders();
  initHeroParallax();
  initDashboardCharts();
  initTiltCards();
  initStickyCounter();
  initProcessProgress();
  initPortfolioPreview();
}

// Astro replaces <html>'s attributes with the incoming page's on every
// swap, which would drop the state classes set at runtime (js, liquid,
// lenis, has-cursor…) and the tier. Carry them over to the new document.
document.addEventListener('astro:before-swap', (event) => {
  const next = (event as Event & { newDocument: Document }).newDocument.documentElement;
  const current = document.documentElement;
  current.classList.forEach((name) => {
    if (name !== 'menu-open') next.classList.add(name);
  });
  const tier = current.getAttribute('data-liquid-tier');
  if (tier) next.setAttribute('data-liquid-tier', tier);
});

document.addEventListener('astro:page-load', initAll);
