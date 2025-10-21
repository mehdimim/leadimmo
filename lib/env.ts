import { getRequestContext } from '@cloudflare/next-on-pages';

type EnvRecord = Record<string, string | undefined>;

export function getEnvValue(key: string): string | undefined {
  try {
    const ctx = getRequestContext();
    if (ctx?.env && typeof ctx.env === 'object' && key in ctx.env) {
      const value = ctx.env[key as keyof typeof ctx.env];
      if (typeof value === 'string') {
        return value;
      }
    }
  } catch {
    // getRequestContext is unavailable (e.g. during build or scripts)
  }

  return process.env[key];
}

export function resolveEnvValue(
  key: string,
  override?: Record<string, string | undefined>
): string | undefined {
  if (override && typeof override[key] === 'string') {
    return override[key];
  }
  return getEnvValue(key);
}

export function getEnv(): EnvRecord {
  const result: EnvRecord = {};
  try {
    const ctx = getRequestContext();
    if (ctx?.env && typeof ctx.env === 'object') {
      for (const [key, value] of Object.entries(ctx.env as Record<string, unknown>)) {
        if (typeof value === 'string') {
          result[key] = value;
        }
      }
    }
  } catch {
    // ignore
  }
  return {
    ...process.env,
    ...result
  };
}
