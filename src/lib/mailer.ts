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

function isConfigured(): boolean {
  return Boolean(import.meta.env.SMTP_HOST && import.meta.env.SMTP_USER && import.meta.env.SMTP_PASS);
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
 * Sends the contact form via SMTP using credentials supplied through
 * environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
 * SMTP_SECURE, CONTACT_TO_EMAIL). No provider is hard-coded, so this works
 * with any mailbox (the domain's own host, Gmail, a transactional
 * provider's SMTP interface, etc). Returns `configured: false` rather than
 * failing silently when those variables are absent, so the caller can be
 * honest with the visitor instead of reporting a fake success.
 */
export async function sendContactEmail(
  payload: ContactPayload
): Promise<{ ok: boolean; configured: boolean }> {
  if (!isConfigured()) {
    return { ok: false, configured: false };
  }

  const transporter = nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port: Number(import.meta.env.SMTP_PORT ?? 587),
    secure: import.meta.env.SMTP_SECURE === 'true',
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    },
  });

  const to = import.meta.env.CONTACT_TO_EMAIL || SITE.email;

  await transporter.sendMail({
    from: `"Studio VM — Site" <${import.meta.env.SMTP_USER}>`,
    to,
    replyTo: payload.email,
    subject: `Nouvelle demande de projet — ${payload.projet}`,
    text: renderEmailBody(payload),
  });

  return { ok: true, configured: true };
}
