export const runtime = 'edge';

import { getDB } from '@/lib/db';
import { getEnv, getEnvValue } from '@/lib/env';
import { generatePostDraft } from '@/lib/jobs/generatePost';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

function authorize(request: Request, token?: string) {
  const header = request.headers.get('authorization');
  if (!header || !token) {
    return false;
  }
  return header === `Bearer ${token}`;
}

export async function POST(request: Request) {
  const token = getEnvValue("CRON_TOKEN");
  if (!authorize(request, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDB();
    const envRecord = getEnv();
    const result = await generatePostDraft({ db, env: envRecord });

    logger.info('cron_post_generated', result);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('cron_post_failed', {
      error: error instanceof Error ? error.message : 'unknown'
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}



