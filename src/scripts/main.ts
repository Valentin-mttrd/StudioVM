import { initReveal } from './reveal';
import { initNavbar } from './navbar';
import { initPortfolioFilter } from './portfolio-filter';
import { initContactForm } from './contact-form';
import { initCompareSliders } from './compare-slider';
import { initHeroParallax } from './parallax';

function initAll(): void {
  initReveal();
  initNavbar();
  initPortfolioFilter();
  initContactForm();
  initCompareSliders();
  initHeroParallax();
}

document.addEventListener('astro:page-load', initAll);
