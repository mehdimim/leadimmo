import {cookies} from 'next/headers';

import {getEnvValue} from '@/lib/env';

const ADMIN_COOKIE = 'leadimmo_admin_session';

function getCredentials() {
  return {
    username: getEnvValue('ADMIN_USER') ?? 'admin',
    password: getEnvValue('ADMIN_PASS') ?? 'change-me-strong'
  };
}

function getSessionSalt() {
  return getEnvValue('CRON_TOKEN') ?? 'leadimmo-default-salt';
}

async function hashString(value: string) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API is not available in this runtime.');
  }

  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function expectedHash() {
  const {username, password} = getCredentials();
  return hashString(`${username}:${password}${getSessionSalt()}`);
}

export function verifyAdminCredentials(username: string, password: string) {
  const creds = getCredentials();
  return username === creds.username && password === creds.password;
}

export async function createAdminSession() {
  const token = await expectedHash();
  const store = await cookies();
  store.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: (getEnvValue('NODE_ENV') ?? 'production') === 'production',
    sameSite: 'lax',
    path: '/'
  });
  return token;
}

export async function getAdminSession() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value;
}

export async function isAdminAuthenticated() {
  const token = await getAdminSession();
  const expected = await expectedHash();
  return token === expected;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
