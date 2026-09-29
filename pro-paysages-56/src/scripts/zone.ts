/**
 * « Intervenez-vous chez moi ? » — an accessible combobox over the
 * communes list (loaded on first use), a verdict that applies exactly the
 * rules the site states, and the chosen town drawn on the map.
 *
 *   • within 50 km of Ploemeur → yes
 *   • in the Morbihan → yes for garden upkeep (the whole department),
 *     creation projects: call to discuss
 *   • otherwise → beyond the usual radius: call to discuss
 */
import { kmFromBase, project } from '../lib/geo';
import { SITE, ZONE_RADIUS_KM } from '../data/site';

type Row = [string, string, string, number | null, number | null];

let data: Promise<Row[]> | null = null;
const load = () => (data ??= import('../data/communes.json').then((m) => m.default as Row[]));

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’\-]/g, ' ')
    .replace(/\bst\b/g, 'saint')
    .replace(/\bste\b/g, 'sainte')
    .replace(/\s+/g, ' ')
    .trim();

const DEPT: Record<string, string> = { '56': 'Morbihan', '29': 'Finistère', '22': 'Côtes-d’Armor', '35': 'Ille-et-Vilaine', '44': 'Loire-Atlantique' };

function search(rows: Row[], q: string): Row[] {
  const nq = norm(q);
  if (!nq) return [];
  const digits = /^\d{2,5}$/.test(nq);
  const scored: [number, Row][] = [];
  for (const row of rows) {
    const name = norm(row[0]);
    let score = -1;
    if (digits) {
      if (row[1].startsWith(nq)) score = 0;
    } else if (name === nq) score = 0;
    else if (name.startsWith(nq)) score = 1;
    else if (name.includes(' ' + nq)) score = 2;
    if (score < 0) continue;
    const d = row[3] !== null && row[4] !== null ? kmFromBase(row[3], row[4]) : 999;
    scored.push([score * 1000 + d, row]);
  }
  return scored.sort((a, b) => a[0] - b[0]).slice(0, 7).map((s) => s[1]);
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

document.querySelectorAll<HTMLElement>('[data-zone]').forEach((root) => {
  const form = root.querySelector<HTMLFormElement>('[data-zone-form]')!;
  const input = root.querySelector<HTMLInputElement>('[data-zone-input]')!;
  const list = root.querySelector<HTMLUListElement>('[data-zone-list]')!;
  const result = root.querySelector<HTMLElement>('[data-zone-result]')!;
  const map = root.querySelector<SVGSVGElement>('[data-zone-map]');
  const pick = root.querySelector<SVGGElement>('[data-zone-pick]');
  let options: Row[] = [];
  let active = -1;

  const K = Number(map?.dataset.k ?? 5);
  const X0 = Number(map?.dataset.x0 ?? 0);
  const Y0 = Number(map?.dataset.y0 ?? 0);

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };

  const highlight = (i: number) => {
    active = i;
    [...list.children].forEach((li, k) => li.setAttribute('aria-selected', String(k === i)));
    const li = list.children[i] as HTMLElement | undefined;
    if (li) {
      input.setAttribute('aria-activedescendant', li.id);
      li.scrollIntoView({ block: 'nearest' });
    }
  };

  const renderList = () => {
    list.replaceChildren(
      ...options.map((row, i) => {
        const li = el('li');
        li.id = `${input.id}-opt-${i}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.append(document.createTextNode(row[0]), el('span', undefined, row[1]));
        li.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          choose(row);
        });
        return li;
      }),
    );
    const open = options.length > 0;
    list.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
  };

  const drawPick = (row: Row) => {
    if (!pick || row[3] === null || row[4] === null) {
      pick?.classList.add('is-hidden');
      return;
    }
    const [kx, ky] = project(row[3], row[4]);
    const x = (kx - X0) * K;
    const y = (ky - Y0) * K;
    const bx = -X0 * K;
    const by = -Y0 * K;
    pick.querySelector('[data-zone-pick-line]')?.setAttribute('d', `M${bx} ${by}L${x.toFixed(1)} ${y.toFixed(1)}`);
    const dot = pick.querySelector('[data-zone-pick-dot]');
    dot?.setAttribute('cx', x.toFixed(1));
    dot?.setAttribute('cy', y.toFixed(1));
    const label = pick.querySelector<SVGTextElement>('[data-zone-pick-label]');
    if (label) {
      label.textContent = row[0];
      const right = x < (map?.viewBox.baseVal.width ?? 850) * 0.7;
      label.setAttribute('x', (x + (right ? 16 : -16)).toFixed(1));
      label.setAttribute('y', (y - 14).toFixed(1));
      label.setAttribute('text-anchor', right ? 'start' : 'end');
    }
    pick.classList.remove('is-hidden');
  };

  const verdict = (row: Row) => {
    const [name, cp, dept, lat, lon] = row;
    const d = lat !== null && lon !== null ? Math.round(kmFromBase(lat, lon)) : null;
    const inRadius = d !== null && d <= ZONE_RADIUS_KM;
    const where = dept === '56' ? name : `${name} (${DEPT[dept] ?? dept})`;
    let yes = true;
    let title: string;
    let text: string;

    if (name === 'Ploemeur') {
      title = 'Oui, nous sommes à Ploemeur.';
      text = 'PRO PAYSAGES est installé à Ploemeur, dans la zone de Kergantic.';
    } else if (inRadius) {
      title = `Oui, ${name} fait partie de notre zone.`;
      text = `${where} est à environ ${d} km de Ploemeur, dans notre rayon d’intervention de ${ZONE_RADIUS_KM} km.`;
    } else if (dept === '56') {
      title = `Oui pour l’entretien de votre jardin à ${name}.`;
      text = `Notre équipe intervient dans tout le Morbihan pour l’entretien${d !== null ? ` (${name} est à environ ${d} km de Ploemeur)` : ''}. Pour un projet de création, parlons-en par téléphone.`;
    } else {
      yes = false;
      title = `${name} est un peu loin de nous.`;
      text = `${where} est à environ ${d} km de Ploemeur, au-delà de notre rayon habituel de ${ZONE_RADIUS_KM} km. Appelez-nous pour en parler.`;
    }

    result.classList.toggle('is-no', !yes);
    const actions = el('div', 'zone__actions');
    const quote = el('a', 'btn', yes ? `Demander un devis à ${name}` : 'Nous écrire');
    quote.setAttribute('href', `/contact/?commune=${encodeURIComponent(name)}${cp ? `&cp=${cp}` : ''}`);
    const call = el('a', 'btn btn--ghost', SITE.phone.display);
    call.setAttribute('href', SITE.phone.href);
    actions.append(quote, call);
    result.replaceChildren(el('p', 'zone__verdict', title), el('p', 'muted', text), actions);
    drawPick(row);
  };

  const notFound = (q: string) => {
    result.classList.add('is-no');
    const p = el('p', 'muted');
    p.append(
      `Nous ne trouvons pas « ${q} ». Précisez votre commune dans la demande de devis, ou appelez-nous au `,
      Object.assign(el('a', undefined, SITE.phone.display), { href: SITE.phone.href }),
      '.',
    );
    result.replaceChildren(el('p', 'zone__verdict', 'Commune introuvable'), p);
    pick?.classList.add('is-hidden');
  };

  const choose = (row: Row) => {
    input.value = row[0];
    close();
    verdict(row);
  };

  input.addEventListener('focus', () => void load(), { once: true });
  input.addEventListener('input', async () => {
    const rows = await load();
    options = search(rows, input.value);
    renderList();
    active = -1;
  });

  input.addEventListener('keydown', (e) => {
    if (list.hidden) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlight(Math.min(options.length - 1, active + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlight(Math.max(0, active - 1));
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      choose(options[active]);
    }
  });

  input.addEventListener('blur', () => window.setTimeout(close, 120));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) {
      input.focus();
      return;
    }
    const rows = await load();
    const found = search(rows, q);
    close();
    if (found.length) choose(found[0]);
    else notFound(q);
  });

  root.querySelectorAll<HTMLButtonElement>('[data-zone-town]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const rows = await load();
      const row = rows.find((r) => r[0] === btn.dataset.zoneTown);
      if (row) choose(row);
    }),
  );
});
