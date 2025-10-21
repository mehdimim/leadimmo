import nodemailer from 'nodemailer';
import { Resend } from 'resend';

import { getEnvValue } from '@/lib/env';

type LeadPayload = {
  id: string;
  firstName: string;
  phone: string;
  email?: string | null;
  budget?: string | null;
  propertyType?: string | null;
  areas?: string[];
  timing?: string | null;
  message?: string | null;
  locale: string;
};

export async function sendLeadNotification(lead: LeadPayload) {
  const fromEmail = getEnvValue('FROM_EMAIL') ?? 'noreply@example.com';
  const toEmail = getEnvValue('CONTACT_EMAIL') ?? fromEmail;
  const resendKey = getEnvValue('RESEND_API_KEY');
  const smtpHost = getEnvValue('SMTP_HOST');
  const smtpUser = getEnvValue('SMTP_USER');
  const smtpPass = getEnvValue('SMTP_PASS');
  const smtpPort = Number(getEnvValue('SMTP_PORT') ?? 587);

  if (resendKey) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New lead ${lead.firstName}`,
      text: formatLeadText(lead)
    });
    return { delivered: true, provider: 'resend' as const };
  }

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `New lead ${lead.firstName}`,
      text: formatLeadText(lead)
    });
    return { delivered: true, provider: 'smtp' as const };
  }

  return { delivered: false, provider: null };
}

function formatLeadText(lead: LeadPayload) {
  return [
    `Lead ID: ${lead.id}`,
    `Locale: ${lead.locale}`,
    `Name: ${lead.firstName}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email ?? 'n/a'}`,
    `Budget: ${lead.budget ?? 'n/a'}`,
    `Property type: ${lead.propertyType ?? 'n/a'}`,
    `Areas: ${(lead.areas ?? []).join(', ') || 'n/a'}`,
    `Timing: ${lead.timing ?? 'n/a'}`,
    `Message: ${lead.message ?? 'n/a'}`
  ].join('\n');
}
