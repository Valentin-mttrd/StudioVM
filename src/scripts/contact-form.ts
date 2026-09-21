import { SITE } from '../lib/constants';

interface ContactResponse {
  ok: boolean;
  message?: string;
}

const PROJECT_LABELS: Record<string, string> = {
  web: 'Site web',
  application: 'Application',
  '3d': '3D',
};

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const submitBtn = form.querySelector<HTMLButtonElement>('[data-submit]');
  const statusEl = form.querySelector<HTMLElement>('[data-form-status]');
  const successPanel = document.querySelector<HTMLElement>('[data-form-success]');

  // Anti-bot time-trap (see src/pages/api/contact.ts): records when the
  // form actually became interactive in this browser, not build time.
  const timestampField = form.querySelector<HTMLInputElement>('input[name="ts"]');
  if (timestampField) timestampField.value = String(Date.now());

  const params = new URLSearchParams(window.location.search);
  const projet = params.get('projet');
  const presetLabel = projet ? PROJECT_LABELS[projet] : undefined;
  if (presetLabel) {
    const radio = form.querySelector<HTMLInputElement>(`input[name="projet"][value="${presetLabel}"]`);
    if (radio) radio.checked = true;
  }

  function setStatus(message: string): void {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.hidden = message.length === 0;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const honeypot = form.querySelector<HTMLInputElement>('input[name="societe_web"]');
    if (honeypot && honeypot.value) return;

    const payload = Object.fromEntries(new FormData(form).entries());

    submitBtn?.setAttribute('disabled', 'true');
    submitBtn?.setAttribute('data-loading', 'true');
    setStatus('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: ContactResponse = await response.json().catch(() => ({ ok: false }));

      if (response.ok && data.ok) {
        form.hidden = true;
        if (successPanel) {
          successPanel.hidden = false;
          successPanel.focus();
        }
      } else {
        setStatus(
          data.message ??
            `Une erreur est survenue. Écrivez-nous directement à ${SITE.email}, nous reviendrons vers vous rapidement.`
        );
      }
    } catch {
      setStatus(`Impossible d'envoyer votre message pour le moment. Écrivez-nous directement à ${SITE.email}.`);
    } finally {
      submitBtn?.removeAttribute('disabled');
      submitBtn?.removeAttribute('data-loading');
    }
  });
}
