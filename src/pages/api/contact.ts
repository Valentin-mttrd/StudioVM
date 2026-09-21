import type { APIRoute } from 'astro';
import { sendContactEmail, type ContactPayload } from '../../lib/mailer';
import { SITE } from '../../lib/constants';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A human can't realistically load the page, read it, and submit in under
// this long — anything faster is almost certainly a script. Paired with the
// honeypot field below; neither needs any external storage or service.
const MIN_FILL_MS = 1200;

const MAX_LENGTHS = {
  nom: 200,
  entreprise: 200,
  email: 254,
  telephone: 40,
  projet: 60,
  budget: 100,
  description: 5000,
} as const;

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function fakeSuccess(): Response {
  // Bots get a normal-looking 200 so they don't learn to adapt; no email
  // is sent and nothing is logged as an error since this is expected traffic.
  return json({ ok: true }, 200);
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: 'Requête invalide.' }, 400);
  }

  // Honeypot: a hidden field no human ever sees or fills in.
  if (typeof body.societe_web === 'string' && body.societe_web.trim() !== '') {
    return fakeSuccess();
  }

  // Time-trap: missing/malformed timestamp (a direct API call that skipped
  // the page entirely) or a implausibly fast submission both look automated.
  // A negative elapsed time (client clock behind the server's) is not held
  // against the sender — that's clock skew, not a bot signal.
  const submittedAt = typeof body.ts === 'string' ? Number(body.ts) : NaN;
  const elapsed = Date.now() - submittedAt;
  const looksAutomated = !Number.isFinite(submittedAt) || (elapsed >= 0 && elapsed < MIN_FILL_MS);
  if (looksAutomated) {
    return fakeSuccess();
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

  const tooLong =
    nom.length > MAX_LENGTHS.nom ||
    email.length > MAX_LENGTHS.email ||
    projet.length > MAX_LENGTHS.projet ||
    description.length > MAX_LENGTHS.description ||
    (entreprise?.length ?? 0) > MAX_LENGTHS.entreprise ||
    (telephone?.length ?? 0) > MAX_LENGTHS.telephone ||
    (budget?.length ?? 0) > MAX_LENGTHS.budget;

  if (tooLong) {
    return json({ ok: false, message: 'Un ou plusieurs champs dépassent la longueur autorisée.' }, 400);
  }

  const payload: ContactPayload = { nom, email, projet, description, entreprise, telephone, budget };

  try {
    const result = await sendContactEmail(payload);

    if (!result.configured) {
      console.error('[contact] SMTP not configured — set SMTP_HOST/SMTP_USER/SMTP_PASS to enable delivery.');
      return json(
        {
          ok: false,
          message: `L'envoi automatique n'est pas encore activé. Écrivez-nous directement à ${SITE.email}, nous reviendrons vers vous rapidement.`,
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
        message: `Une erreur est survenue lors de l'envoi. Écrivez-nous directement à ${SITE.email}.`,
      },
      502
    );
  }
};
