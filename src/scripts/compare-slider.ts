export function initCompareSliders(): void {
  const wrappers = document.querySelectorAll<HTMLElement>('[data-compare]');

  wrappers.forEach((wrapper) => {
    const input = wrapper.querySelector<HTMLInputElement>('input[type="range"]');
    if (!input) return;

    const update = () => {
      wrapper.style.setProperty('--reveal-pos', `${input.value}%`);
    };

    input.addEventListener('input', update);
    update();
  });
}
