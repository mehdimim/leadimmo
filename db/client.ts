import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';

import type { D1Database } from '@cloudflare/workers-types';

export function getDB() {
  const { env } = getRequestContext();
  if (!env || !('DB' in env)) {
    throw new Error('D1 binding "DB" is not available in this context.');
  }

  return createDBFromBinding(env.DB as D1Database);
}

export function createDBFromBinding(binding: D1Database) {
  return drizzle(binding);
}

