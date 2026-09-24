import { initReveal } from './reveal';
import { initNavbar } from './navbar';
import { initPortfolioFilter } from './portfolio-filter';
import { initContactForm } from './contact-form';
import { initCompareSliders } from './compare-slider';
import { initHeroParallax } from './parallax';
import { initDashboardCharts } from './dashboard-preview';
import { initScrollProgress } from './scroll-progress';
import { initMagnetic } from './magnetic';
import { initTiltCards } from './tilt-card';
import { initStickyCounter } from './sticky-counter';
import { initProcessProgress } from './process-progress';
import { initPortfolioPreview } from './portfolio-preview';

function initAll(): void {
  initReveal();
  initNavbar();
  initPortfolioFilter();
  initContactForm();
  initCompareSliders();
  initHeroParallax();
  initDashboardCharts();
  initScrollProgress();
  initMagnetic();
  initTiltCards();
  initStickyCounter();
  initProcessProgress();
  initPortfolioPreview();
}

document.addEventListener('astro:page-load', initAll);
