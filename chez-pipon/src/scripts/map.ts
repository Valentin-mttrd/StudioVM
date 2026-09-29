/**
 * Click-to-load map: Google Maps (and its cookies) only reaches the page
 * once the visitor asks for it.
 */
export function initMap(): void {
  document.querySelectorAll<HTMLElement>('[data-map]').forEach((map) => {
    const button = map.querySelector<HTMLButtonElement>('[data-map-load]');
    const src = map.dataset.src;
    if (!button || !src) return;
    button.addEventListener(
      'click',
      () => {
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.title = 'Carte : Chez Pipon, 9 avenue de la Perrière, Lorient';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.setAttribute('allowfullscreen', '');
        map.querySelector('.map__placeholder')?.remove();
        map.append(iframe);
        iframe.focus();
      },
      { once: true }
    );
  });
}
