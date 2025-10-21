import { getEnvValue } from '@/lib/env';

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function write(payload: LogPayload) {
  const entry = {
    ts: new Date().toISOString(),
    ...payload
  };

  if (payload.level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (payload.level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    write({ level: 'info', message, context }),
  warn: (message: string, context?: Record<string, unknown>) =>
    write({ level: 'warn', message, context }),
  error: (message: string, context?: Record<string, unknown>) =>
    write({ level: 'error', message, context }),
  debug: (message: string, context?: Record<string, unknown>) => {
    if ((getEnvValue('NODE_ENV') ?? 'development') !== 'production') {
      write({ level: 'debug', message, context });
    }
  }
};
