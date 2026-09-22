import { initReveal } from './reveal';
import { initNavbar } from './navbar';
import { initPortfolioFilter } from './portfolio-filter';
import { initContactForm } from './contact-form';
import { initCompareSliders } from './compare-slider';
import { initHeroParallax } from './parallax';
import { initDashboardCharts } from './dashboard-preview';

function initAll(): void {
  initReveal();
  initNavbar();
  initPortfolioFilter();
  initContactForm();
  initCompareSliders();
  initHeroParallax();
  initDashboardCharts();
}

document.addEventListener('astro:page-load', initAll);
