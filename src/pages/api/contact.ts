import type { APIRoute } from 'astro';
import { sendContactEmail, type ContactPayload } from '../../lib/mailer';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: 'Requête invalide.' }, 400);
  }

  // Honeypot: bots that fill hidden fields get a fake success, silently.
  if (typeof body.societe_web === 'string' && body.societe_web.trim() !== '') {
    return json({ ok: true }, 200);
  }

  const nom = typeof body.nom === 'string' ? body.nom.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const projet = typeof body.projet === 'string' ? body.projet.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const entreprise = typeof body.entreprise === 'string' ? body.entreprise.trim() : undefined;
  const telephone = typeof body.telephone === 'string' ? body.telephone.trim() : undefined;
  const budget = typeof body.budget === 'string' ? body.budget.trim() : undefined;

  if (!nom || !email || !projet || !description) {
    return json({ ok: false, message: 'Merci de renseigner tous les champs obligatoires.' }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, message: 'Merci de renseigner une adresse email valide.' }, 400);
  }

  const payload: ContactPayload = { nom, email, projet, description, entreprise, telephone, budget };

  try {
    const result = await sendContactEmail(payload);

    if (!result.configured) {
      console.error('[contact] SMTP not configured — set SMTP_HOST/SMTP_USER/SMTP_PASS to enable delivery.');
      return json(
        {
          ok: false,
          message:
            "L'envoi automatique n'est pas encore activé. Écrivez-nous directement à contact@studiovm.fr, nous reviendrons vers vous rapidement.",
        },
        503
      );
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error('[contact] Failed to send email:', error);
    return json(
      {
        ok: false,
        message: "Une erreur est survenue lors de l'envoi. Écrivez-nous directement à contact@studiovm.fr.",
      },
      502
    );
  }
};
