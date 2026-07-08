import { Resend } from 'resend';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta variable de entorno requerida: ${name}`);
  }
  return value;
}

function getResendClient(): Resend {
  const apiKey = getRequiredEnv('RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const from = getRequiredEnv('MAIL_FROM');
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
