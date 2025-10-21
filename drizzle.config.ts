﻿import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    wranglerConfigPath: './wrangler.toml',
    dbName: 'samui'
  }
} as any);
