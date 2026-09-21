import nodemailer from 'nodemailer';
import { SITE } from './constants';

export interface ContactPayload {
  nom: string;
  entreprise?: string;
  email: string;
  telephone?: string;
  projet: string;
  budget?: string;
  description: string;
}

/**
 * Reads real runtime secrets via `process.env`, not `import.meta.env`.
 * Vite statically inlines `import.meta.env.X` at build time — since these
 * variables are only ever set on the deployed server (never during
 * `astro build`), that would permanently bake in `undefined` regardless of
 * what's configured at runtime. `process.env` is a plain Node global, so
 * it's read fresh on every request instead.
 */
function env(name: string): string | undefined {
  return process.env[name];
}

function isConfigured(): boolean {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));
}

function renderEmailBody(payload: ContactPayload): string {
  const lines = [
    `Nom : ${payload.nom}`,
    payload.entreprise ? `Entreprise : ${payload.entreprise}` : null,
    `Email : ${payload.email}`,
    payload.telephone ? `Téléphone : ${payload.telephone}` : null,
    `Type de projet : ${payload.projet}`,
    payload.budget ? `Budget indicatif : ${payload.budget}` : null,
    '',
    'Description du projet :',
    payload.description,
  ].filter((line): line is string => line !== null);

  return lines.join('\n');
}

/**
 * Sends the contact form via SMTP using credentials supplied entirely
 * through environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER,
 * SMTP_PASS, CONTACT_TO). No provider or password is hard-coded, so this
 * works with any mailbox — OVH's own SMTP included. `secure` is inferred
 * from the port (465 = implicit TLS, anything else = STARTTLS/plain, which
 * covers OVH's usual 587) instead of a separate env var, since one flag
 * would otherwise have to track the port by hand.
 *
 * Returns `configured: false` rather than failing silently when the
 * required variables are absent, so the API route can be honest with the
 * visitor instead of reporting a fake success.
 */
export async function sendContactEmail(
  payload: ContactPayload
): Promise<{ ok: boolean; configured: boolean }> {
  if (!isConfigured()) {
    return { ok: false, configured: false };
  }

  const port = Number(env('SMTP_PORT') ?? 587);
  const user = env('SMTP_USER');

  const transporter = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure: port === 465,
    auth: {
      user,
      pass: env('SMTP_PASS'),
    },
  });

  const to = env('CONTACT_TO') || SITE.email;

  await transporter.sendMail({
    from: `"Studio VM — Site" <${user}>`,
    to,
    replyTo: payload.email,
    subject: `Nouvelle demande de projet — ${payload.projet}`,
    text: renderEmailBody(payload),
  });

  return { ok: true, configured: true };
}
