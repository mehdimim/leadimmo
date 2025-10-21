import type { D1Database, ExportedHandlerScheduledHandler } from '@cloudflare/workers-types';
import worker from '@cloudflare/next-on-pages';

import { createDBFromBinding } from '../db/client';
import { generatePostDraft } from '../lib/jobs/generatePost';

export default worker;

const toEnvRecord = (env: Record<string, unknown>) => {
  const record: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') {
      record[key] = value;
    }
  }
  return record;
};

export const scheduled: ExportedHandlerScheduledHandler = async (controller, env, ctx) => {
  const typedEnv = env as Record<string, unknown> & { DB: D1Database };
  const db = createDBFromBinding(typedEnv.DB);
  const envRecord = toEnvRecord(typedEnv);

  ctx.waitUntil(
    (async () => {
      try {
        const result = await generatePostDraft({ db, env: envRecord });
        console.log(JSON.stringify({ level: 'info', message: 'cron_post_generated', result }));
      } catch (error) {
        console.error(
          JSON.stringify({
            level: 'error',
            message: 'cron_post_failed',
            error: error instanceof Error ? error.message : 'unknown'
          })
        );
      }
    })()
  );
};

