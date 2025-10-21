import { getEnvValue } from '@/lib/env';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function validateTurnstile(response: string | undefined, ip?: string) {
  const secretKey = getEnvValue('TURNSTILE_SECRET_KEY');
  const siteKey = getEnvValue('TURNSTILE_SITE_KEY');

  if (!secretKey || !siteKey) {
    return { success: true, skipped: true };
  }

  if (!response) {
    return { success: false, skipped: false };
  }

  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', response);
  if (ip) {
    formData.append('remoteip', ip);
  }

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!res.ok) {
    return { success: false, skipped: false };
  }

  const data = (await res.json()) as { success: boolean };
  return { success: data.success, skipped: false };
}
