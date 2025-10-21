import { NextResponse } from 'next/server';

import { getDB, consents, events, leads } from '@/lib/db';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateTurnstile } from '@/lib/turnstile';
import { sendLeadNotification } from '@/lib/mail';
import { leadSubmissionSchema } from '@/lib/validation';
import { getEnvValue } from '@/lib/env';

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = leadSubmissionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const clientIp = getClientIp(request);

    const rate = checkRateLimit(`lead:${clientIp}`);
    if (!rate.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const turnstile = await validateTurnstile(data.turnstileToken, clientIp);
    if (!turnstile.success) {
      return NextResponse.json({ error: 'Captcha failed' }, { status: 400 });
    }

    const db = getDB();
    const leadId = crypto.randomUUID();
    const leadLocale = data.locale ?? 'en';
    const defaultTimezone = getEnvValue('DEFAULT_TIMEZONE') ?? 'Asia/Bangkok';
    const timezone = data.timezone ?? defaultTimezone;

    await db.insert(leads).values({
      id: leadId,
      firstName: data.firstName,
      phone: data.phone,
      email: data.email ?? null,
      budget: data.budget,
      propertyType: data.propertyType,
      areas: data.areas ?? [],
      timing: data.timing,
      callPreference: data.callPreference,
      timezone,
      message: data.message,
      locale: leadLocale,
      ip: clientIp
    });

    await db.insert(consents).values({
      id: crypto.randomUUID(),
      leadId,
      textVersion: 'v1-pdpa-fr'
    });

    await db.insert(events).values({
      id: crypto.randomUUID(),
      type: 'lead_submit',
      metaJson: {
        locale: leadLocale,
        message: data.message
      },
      leadId
    });

    await sendLeadNotification({
      id: leadId,
      firstName: data.firstName,
      phone: data.phone,
      email: data.email,
      budget: data.budget,
      propertyType: data.propertyType,
      areas: data.areas ?? [],
      timing: data.timing,
      message: data.message,
      locale: leadLocale
    });

    logger.info('lead_submitted', { leadId, locale: leadLocale });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.error('lead_submit_failed', {
      error: error instanceof Error ? error.message : 'unknown'
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

