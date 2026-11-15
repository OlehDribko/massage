#!/usr/bin/env node
/*
 * Isolated backend for the browser tests: a throw-away PostgreSQL container,
 * the backend's own migrations (catalogue + default weekly hours), the
 * Firebase Auth Emulator (`demo-` project) and the Booking API from a local
 * checkout of Massage-backend. Nothing here talks to staging, production,
 * real Firebase, Brevo or AWS; emails and marketing stay off.
 *
 * Started by Playwright (playwright.config.mjs → webServer) and stopped with
 * it: on exit the container and both processes are removed.
 *
 *   E2E_BACKEND_DIR   checkout of Massage-backend with `npm ci` done
 *                     (default ../../Massage-backend next to this repo)
 *   E2E_API_PORT      (3101)   E2E_PG_PORT (55432)   E2E_AUTH_PORT (9099)
 *   E2E_SITE_ORIGINS  CORS origins of the site under test
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { E2E } from './env.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const backend = path.resolve(
  here,
  '..',
  process.env.E2E_BACKEND_DIR ?? '../../Massage-backend'
);
const service = path.join(backend, 'services/booking');
const container = `massage-fe-e2e-pg-${E2E.pgPort}`;
// Local test values only (same as the backend's compose.yaml).
const PG = {
  admin: 'local-admin-password',
  migrator: 'local-migrator-password',
  app: 'local-app-password',
};

const children = [];
let stopping = false;

function log(message) {
  console.log(`[e2e-stack] ${message}`);
}

function docker(args, { allowFail = false } = {}) {
  const result = spawnSync('docker', args, { encoding: 'utf8' });
  if (result.status !== 0 && !allowFail) {
    throw new Error(`docker ${args[0]} failed: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function run(command, args, env, { name, background = false } = {}) {
  const child = spawn(command, args, {
    cwd: service,
    env: { ...process.env, ...env },
    stdio: background ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (background) {
    const prefix = (chunk) =>
      chunk
        .toString()
        .split('\n')
        .filter(Boolean)
        .forEach((line) => console.log(`[${name}] ${line}`));
    child.stdout.on('data', prefix);
    child.stderr.on('data', prefix);
    children.push(child);
    child.on('exit', (code) => {
      if (!stopping) {
        log(`${name} exited (${code}); stopping the stack`);
        stop(1);
      }
    });
    return child;
  }
  return new Promise((resolve, reject) => {
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${name} exited ${code}`))
    );
  });
}

async function waitFor(url, label, { timeoutMs = 120_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${label} did not start in time (${url})`);
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  docker(['rm', '-f', '-v', container], { allowFail: true });
  log('stopped');
  process.exit(code);
}

async function main() {
  if (!existsSync(path.join(backend, 'node_modules'))) {
    throw new Error(
      `No backend checkout with node_modules at ${backend}. Set E2E_BACKEND_DIR (see README, « Tests navigateur »).`
    );
  }
  if (!existsSync(path.join(service, 'src/generated/prisma/client.ts'))) {
    throw new Error(
      `Prisma Client is not generated in ${service}: run \`npm run prisma -- generate\` there once.`
    );
  }
  log(`backend: ${backend}`);

  docker(['rm', '-f', '-v', container], { allowFail: true });
  docker([
    'run',
    '-d',
    '--name',
    container,
    '--label',
    'massage-frontend.e2e=1',
    '-e',
    'POSTGRES_DB=booking',
    '-e',
    'POSTGRES_USER=booking_admin',
    '-e',
    `POSTGRES_PASSWORD=${PG.admin}`,
    '-e',
    `BOOKING_MIGRATOR_PASSWORD=${PG.migrator}`,
    '-e',
    `BOOKING_APP_PASSWORD=${PG.app}`,
    '-v',
    `${path.join(backend, 'docker/postgres/init')}:/docker-entrypoint-initdb.d:ro`,
    '-p',
    `127.0.0.1:${E2E.pgPort}:5432`,
    'postgres:17.11-bookworm',
  ]);
  log(`postgres container ${container} on 127.0.0.1:${E2E.pgPort}`);

  // Ready = init scripts done and the server restarted on TCP.
  const deadline = Date.now() + 60_000;
  for (;;) {
    const ready = spawnSync('docker', [
      'exec',
      container,
      'pg_isready',
      '-h',
      '127.0.0.1',
      '-U',
      'booking_admin',
      '-d',
      'booking',
    ]);
    if (ready.status === 0) break;
    if (Date.now() > deadline) throw new Error('postgres did not start');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const db = (role, password) =>
    `postgresql://${role}:${password}@127.0.0.1:${E2E.pgPort}/booking`;

  await run(
    'npx',
    ['tsx', 'src/migrate/run-migrations.ts'],
    {
      MIGRATION_DATABASE_URL: db('booking_migrator', PG.migrator),
      MIGRATION_DATABASE_SSL_MODE: 'disable',
      BOOKING_RUNTIME_ROLE: 'booking_app',
      LOG_LEVEL: 'warn',
    },
    { name: 'migrate' }
  );
  log('migrations applied');

  run(
    'npx',
    [
      '--yes',
      'firebase-tools@15.34.1',
      'emulators:start',
      '--only',
      'auth',
      '--project',
      E2E.firebaseProject,
      '--config',
      path.join(here, 'firebase.json'),
    ],
    {},
    { name: 'auth-emulator', background: true }
  );
  await waitFor(`http://127.0.0.1:${E2E.authPort}/`, 'Auth Emulator');
  log(`auth emulator on 127.0.0.1:${E2E.authPort}`);

  run(
    'npx',
    ['tsx', 'src/server.ts'],
    {
      NODE_ENV: 'development',
      PORT: String(E2E.apiPort),
      LOG_LEVEL: process.env.E2E_API_LOG_LEVEL ?? 'warn',
      APP_VERSION: 'e2e',
      DATABASE_URL: db('booking_app', PG.app),
      DATABASE_SSL_MODE: 'disable',
      FIREBASE_PROJECT_ID: E2E.firebaseProject,
      FIREBASE_CREDENTIALS: 'none',
      FIREBASE_AUTH_EMULATOR_HOST: `127.0.0.1:${E2E.authPort}`,
      REQUIRE_FIREBASE_AUTH: 'true',
      CORS_ALLOWED_ORIGINS: E2E.siteOrigins.join(','),
      ENABLE_MARKETING_SUBSCRIPTION: 'false',
      // The backend's dev script reads ../../.env — never here.
      DOTENV_CONFIG_PATH: '/dev/null',
    },
    { name: 'api', background: true }
  );
  await waitFor(`${E2E.apiUrl}/health/ready`, 'Booking API');
  log(`api on ${E2E.apiUrl}`);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
main().catch((error) => {
  console.error(`[e2e-stack] ${error.message}`);
  stop(1);
});
