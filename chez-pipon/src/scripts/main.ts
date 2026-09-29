import { initStatus } from './status';
import { initHeader } from './header';
import { initReveal } from './reveal';
import { initBooking } from './booking';
import { initMap } from './map';
import { initGlass } from './glass';
import { initScrollers } from './scroller';
import { initHeroStick } from './hero-stick';

// One static page, no framework: each module binds to what it finds.
initStatus();
initHeader();
initReveal();
initBooking();
initMap();
initGlass();
initScrollers();
initHeroStick();
