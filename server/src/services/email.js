import nodemailer from 'nodemailer';

export function createMailer() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

export async function sendMail({ to, subject, text }) {
  const mailer = createMailer();
  if (!mailer) return { skipped: true };
  return mailer.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}
