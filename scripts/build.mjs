#!/usr/bin/env node
import {spawn} from 'node:child_process';
import {access, mkdir, writeFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import {platform, env} from 'node:process';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const npxCommand = platform === 'win32' ? 'npx.cmd' : 'npx';

function run(command, args, extraEnv = {}, useShell = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: {...env, ...extraEnv},
      shell: useShell
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function findBashPath() {
  if (env.CF_PAGES_BUILD_BASH_PATH) {
    return env.CF_PAGES_BUILD_BASH_PATH;
  }

  const candidates =
    platform === 'win32'
      ? [
          'C:/Program Files/Git/bin/bash.exe',
          'C:/Program Files (x86)/Git/bin/bash.exe',
          'C:/git/bin/bash.exe',
          'C:/Windows/System32/bash.exe'
        ]
      : ['/bin/bash', '/usr/bin/bash'];

  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // continue searching
    }
  }

  return null;
}

async function ensureWinBashShim(bashPath) {
  const dir = join(projectRoot, '.cf-next-on-pages', 'bin');
  await mkdir(dir, {recursive: true});
  const shimPath = join(dir, 'bash.cmd');
  const shimContent = `@"${bashPath.replace(/"/g, '""')}" %*\r\n`;
  await writeFile(shimPath, shimContent, 'utf8');
  return dir;
}

async function main() {
  await run(npxCommand, ['next', 'build'], {}, platform === 'win32');

  if (env.CF_PAGES_SKIP_NEXT_ON_PAGES === '1') {
    console.warn(
      "[build] Variable CF_PAGES_SKIP_NEXT_ON_PAGES=1 détectée, exécution de @cloudflare/next-on-pages sautée."
    );
    return;
  }

  const bashPath = await findBashPath();

  if (!bashPath) {
    console.warn(
      "[build] Bash introuvable sur cette machine. Génération @cloudflare/next-on-pages sautée.\n" +
        "       Installez Git Bash ou définissez CF_PAGES_BUILD_BASH_PATH pour l'activer."
    );
    return;
  }

  const extraEnv = {};

  if (platform === 'win32') {
    const shimDir = await ensureWinBashShim(bashPath);
    extraEnv.PATH = `${shimDir};${env.PATH || ''}`;
    extraEnv.CF_PAGES_BUILD_BASH_PATH = bashPath;
  }

  try {
    await run(npxCommand, ['@cloudflare/next-on-pages'], extraEnv, platform === 'win32');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes('spawn bash ENOENT') ||
      message.includes('spawn npx ENOENT') ||
      message.includes('@cloudflare/next-on-pages exited with code')
    ) {
      console.warn(
        "[build] Échec de l'exécution de @cloudflare/next-on-pages sur Windows. " +
          'Le build Next.js est terminé ; exécutez la génération depuis WSL ou un environnement Linux/macOS ' +
          'pour obtenir le bundle Cloudflare.'
      );
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
