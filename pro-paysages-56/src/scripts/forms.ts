/**
 * Forms: French validation messages shown inline, stepped navigation for
 * [data-steps] forms, submission to Netlify Forms with fetch, and — if the
 * submission fails for any reason — a ready-written e-mail as fallback so
 * a request is never lost. Links from the rest of the site can pre-fill
 * the quote: /contact/?projet=<service id>&commune=<name>&cp=<code>.
 */
import { SITE } from '../data/site';

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const EMAIL = SITE.email;

function messageFor(el: Control): string {
  const v = el.validity;
  if (el.dataset.msg && !el.checkValidity()) return el.dataset.msg;
  if (el instanceof HTMLInputElement && el.type === 'checkbox' && el.name === 'consentement') {
    return 'Votre accord est nécessaire pour que nous puissions vous répondre.';
  }
  if (el instanceof HTMLInputElement && el.type === 'radio' && v.valueMissing) return 'Choisissez une option.';
  if (v.valueMissing) return 'Ce champ est nécessaire pour vous répondre.';
  if (v.typeMismatch && el.type === 'email') return 'Adresse e-mail incomplète (exemple : nom@domaine.fr).';
  if (el instanceof HTMLInputElement && el.type === 'file') return 'Fichier trop lourd : 8 Mo au maximum.';
  if (v.patternMismatch && el.type === 'tel') return 'Numéro incomplet : 10 chiffres, par exemple 06 12 34 56 78.';
  if (v.patternMismatch) return 'Format non reconnu.';
  return 'Vérifiez ce champ.';
}

function errorSlot(form: HTMLFormElement, name: string): HTMLElement | null {
  return form.querySelector<HTMLElement>(`[data-error-for="${CSS.escape(name)}"]`);
}

function setError(form: HTMLFormElement, name: string, message: string, controls: Control[]) {
  const slot = errorSlot(form, name);
  if (slot) slot.textContent = message;
  controls.forEach((c) => (message ? c.setAttribute('aria-invalid', 'true') : c.removeAttribute('aria-invalid')));
}

/** Validates every control inside `scope`; returns the first invalid one. */
function validate(form: HTMLFormElement, scope: HTMLElement): Control | null {
  let first: Control | null = null;
  const seen = new Set<string>();

  // "At least one" checkbox groups.
  const groups = [
    ...(scope.matches('[data-group-required]') ? [scope as HTMLFieldSetElement] : []),
    ...scope.querySelectorAll<HTMLFieldSetElement>('[data-group-required]'),
  ];
  groups.forEach((fs) => {
    const name = fs.dataset.group!;
    seen.add(name);
    const boxes = [...fs.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    const ok = boxes.some((b) => b.checked);
    setError(form, name, ok ? '' : 'Choisissez au moins une option.', boxes);
    if (!ok && !first) first = boxes[0];
  });

  scope.querySelectorAll<Control>('input, select, textarea').forEach((el) => {
    if (el.type === 'hidden' || el.name === 'bot-field' || !el.name || seen.has(el.name)) return;
    if (el instanceof HTMLInputElement && el.type === 'radio') {
      seen.add(el.name);
      const group = [...scope.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(el.name)}"]`)];
      const invalid = group.find((r) => !r.checkValidity());
      setError(form, el.name, invalid ? messageFor(invalid) : '', group);
      if (invalid && !first) first = group[0];
      return;
    }
    // Trim so a field full of spaces doesn't count as filled.
    if ((el instanceof HTMLInputElement && el.type !== 'checkbox') || el instanceof HTMLTextAreaElement) {
      if (el.value.trim() === '' && el.value !== '') el.value = '';
    }
    const ok = el.checkValidity();
    setError(form, el.name, ok ? '' : messageFor(el), [el]);
    if (!ok && !first) first = el;
  });

  return first;
}

function summary(form: HTMLFormElement): string {
  const data = new FormData(form);
  const lines: string[] = [];
  const labelOf = (name: string) =>
    form.querySelector(`[for$="-${name}"]`)?.firstChild?.textContent?.trim() ??
    form.querySelector(`[data-group="${name}"] legend`)?.firstChild?.textContent?.trim() ??
    name;
  const keys = [...new Set([...data.keys()])].filter((k) => !['form-name', 'bot-field', 'subject', 'consentement', 'photo'].includes(k));
  for (const key of keys) {
    const values = data
      .getAll(key)
      .map((v) => String(v).trim())
      .filter(Boolean);
    if (values.length) lines.push(`${labelOf(key)} : ${values.join(', ')}`);
  }
  return lines.join('\n');
}

function initForm(form: HTMLFormElement) {
  const shell = form.closest<HTMLElement>('[data-form-shell]')!;
  const success = shell.querySelector<HTMLElement>('[data-form-success]');
  const failure = form.querySelector<HTMLElement>('[data-form-error]');
  const status = shell.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  let attempted = false;

  // ── Steps ──
  const steps = [...form.querySelectorAll<HTMLElement>('[data-step]')];
  const stepped = form.hasAttribute('data-steps') && steps.length > 1;
  const next = form.querySelector<HTMLButtonElement>('[data-next]');
  const prev = form.querySelector<HTMLButtonElement>('[data-prev]');
  const progress = [...form.querySelectorAll<HTMLElement>('[data-progress-item]')];
  let current = 0;

  const show = (index: number, focus = true) => {
    current = index;
    steps.forEach((s, i) => s.classList.toggle('is-current', i === index));
    progress.forEach((p, i) => {
      p.classList.toggle('is-done', i < index);
      p.classList.toggle('is-current', i === index);
      if (i === index) p.setAttribute('aria-current', 'step');
      else p.removeAttribute('aria-current');
    });
    const last = index === steps.length - 1;
    form.classList.toggle('is-last', last);
    if (next) next.hidden = last;
    if (prev) prev.hidden = index === 0;
    if (last) fillRecap();
    if (focus) {
      const heading = steps[index].querySelector<HTMLElement>('[data-step-title]');
      heading?.focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const fillRecap = () => {
    const recap = form.querySelector<HTMLElement>('[data-recap]');
    if (!recap) return;
    const picked = (name: string) =>
      [...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)].map((i) => i.dataset.label ?? i.value);
    const value = (name: string) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      return el && 'value' in el ? el.value.trim() : '';
    };
    const rows: [string, string][] = [
      ['Prestations', picked('projet').join(', ')],
      ['Vous êtes', picked('client').join(', ')],
      ['Commune', value('commune')],
      ['Surface', value('surface')],
      ['Fréquence', picked('frequence').join(', ')],
      ['Délai', picked('delai').join(', ')],
    ];
    recap.replaceChildren(
      ...rows
        .filter(([, v]) => v)
        .map(([k, v]) => {
          const row = document.createElement('div');
          const dt = document.createElement('dt');
          const dd = document.createElement('dd');
          dt.textContent = k;
          dd.textContent = v;
          row.append(dt, dd);
          return row;
        }),
    );
    recap.closest<HTMLElement>('[data-recap-wrap]')?.toggleAttribute('hidden', recap.children.length === 0);
  };

  if (stepped) {
    form.classList.add('is-stepped');
    form.style.setProperty('--steps', String(steps.length));
    show(0, false);
    next?.addEventListener('click', () => {
      const bad = validate(form, steps[current]);
      if (bad) {
        attempted = true;
        bad.focus();
        return;
      }
      show(current + 1);
    });
    prev?.addEventListener('click', () => show(Math.max(0, current - 1)));
    // Enter in a text field moves on instead of submitting half a form.
    form.addEventListener('keydown', (e) => {
      const t = e.target as HTMLElement;
      if (e.key === 'Enter' && t instanceof HTMLInputElement && t.type !== 'checkbox' && t.type !== 'radio' && !form.classList.contains('is-last')) {
        e.preventDefault();
        next?.click();
      }
    });
  }

  // Pre-fill from links elsewhere on the site (zone checker, service pages).
  const params = new URLSearchParams(location.search);
  params.getAll('projet').forEach((wanted) => {
    const box = form.querySelector<HTMLInputElement>(`input[name="projet"][value="${CSS.escape(wanted)}"]`);
    if (box) box.checked = true;
  });
  const commune = params.get('commune');
  const communeField = form.elements.namedItem('commune') as HTMLInputElement | null;
  if (commune && communeField && !communeField.value) {
    const cp = params.get('cp');
    communeField.value = cp && /^\d{5}$/.test(cp) ? `${commune} (${cp})` : commune;
  }

  // Keep the phone action bar from covering the keyboard and buttons.
  form.addEventListener('focusin', () => document.documentElement.classList.add('form-focus'));
  form.addEventListener('focusout', () => document.documentElement.classList.remove('form-focus'));

  // Netlify Forms caps a submission at 8 MB.
  form.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) =>
    input.addEventListener('change', () => {
      const tooBig = [...(input.files ?? [])].some((f) => f.size > 8 * 1024 * 1024);
      input.setCustomValidity(tooBig ? 'too-big' : '');
    }),
  );

  // Re-check a field as soon as it changes once an error has been shown.
  form.addEventListener('input', (e) => revalidate(e.target));
  form.addEventListener('change', (e) => revalidate(e.target));
  function revalidate(target: EventTarget | null) {
    if (!attempted || !(target instanceof HTMLElement)) return;
    const scope = target.closest<HTMLElement>('.field, .choices, .form-foot');
    if (scope) validate(form, scope);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    attempted = true;
    if (failure) failure.hidden = true;

    // Validate every step; jump back to the first one with a problem.
    const bad = validate(form, form);
    if (bad) {
      if (stepped) {
        const idx = steps.findIndex((s) => s.contains(bad));
        if (idx >= 0 && idx !== current) show(idx, false);
      }
      bad.focus();
      if (status) status.textContent = 'Certains champs sont à compléter.';
      return;
    }

    submit?.setAttribute('aria-busy', 'true');
    if (submit) submit.disabled = true;
    const label = submitLabel?.textContent;
    if (submitLabel) submitLabel.textContent = 'Envoi en cours…';

    try {
      const data = new FormData(form);
      const multipart = form.enctype === 'multipart/form-data';
      let res: Response;
      if (multipart) {
        // Files: let the browser set the multipart boundary.
        res = await fetch(form.getAttribute('action') || '/', { method: 'POST', body: data });
      } else {
        const body = new URLSearchParams();
        data.forEach((v, k) => body.append(k, String(v)));
        res = await fetch(form.getAttribute('action') || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
      }
      if (!res.ok) throw new Error(String(res.status));
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
      if (status) status.textContent = 'Demande envoyée.';
    } catch {
      const mail = form.querySelector<HTMLAnchorElement>('[data-mailto]');
      if (mail) {
        const subject = form.dataset.subject ?? 'Demande depuis le site';
        mail.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary(form))}`;
      }
      if (failure) {
        failure.hidden = false;
        failure.focus();
      }
    } finally {
      submit?.removeAttribute('aria-busy');
      if (submit) submit.disabled = false;
      if (submitLabel && label) submitLabel.textContent = label;
    }
  });
}

document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach(initForm);
