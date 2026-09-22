export function initDashboardCharts(): void {
  const charts = document.querySelectorAll<SVGSVGElement>('[data-chart]');

  charts.forEach((chart) => {
    const zones = chart.querySelectorAll<SVGRectElement>('[data-zone]');
    const dots = chart.querySelectorAll<SVGCircleElement>('[data-dot]');
    const guide = chart.querySelector<SVGLineElement>('[data-guide]');
    const tooltip = chart.parentElement?.querySelector<HTMLElement>('[data-chart-tooltip]');
    const viewBox = chart.viewBox.baseVal;
    if (!guide || !tooltip || dots.length === 0 || !viewBox.width || !viewBox.height) return;

    function activate(index: number): void {
      const dot = dots[index];
      if (!dot) return;

      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));

      const x = dot.cx.baseVal.value;
      const y = dot.cy.baseVal.value;
      guide?.setAttribute('x1', String(x));
      guide?.setAttribute('x2', String(x));
      guide?.classList.add('is-guide-active');

      tooltip!.textContent = `${dot.dataset.label} · ${dot.dataset.value}`;
      tooltip!.style.left = `${(x / viewBox.width) * 100}%`;
      tooltip!.style.top = `${(y / viewBox.height) * 100}%`;
      tooltip!.classList.add('is-active');
    }

    function reset(): void {
      const lastIndex = dots.length - 1;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === lastIndex));
      guide?.classList.remove('is-guide-active');
      tooltip?.classList.remove('is-active');
    }

    zones.forEach((zone, i) => {
      zone.addEventListener('pointerenter', () => activate(i));
      zone.addEventListener('pointerdown', () => activate(i));
    });
    chart.addEventListener('pointerleave', reset);

    reset();
  });
}
