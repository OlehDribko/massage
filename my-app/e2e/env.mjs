/*
 * Ports and ids of the isolated browser-test stack (e2e/stack.mjs). Shared by
 * the stack, the Playwright config and the fixtures.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = (name, fallback) => Number(process.env[name] ?? fallback);

const sitePort = port('E2E_SITE_PORT', 3100);
const apiPort = port('E2E_API_PORT', 3101);
const authPort = port('E2E_AUTH_PORT', 9099);

export const E2E = {
  sitePort,
  apiPort,
  authPort,
  pgPort: port('E2E_PG_PORT', 55432),
  siteUrl: `http://localhost:${sitePort}`,
  siteOrigins: [`http://localhost:${sitePort}`, `http://127.0.0.1:${sitePort}`],
  apiUrl: `http://127.0.0.1:${apiPort}`,
  authUrl: `http://127.0.0.1:${authPort}`,
  // `demo-` projects never reach real Firebase (emulator only).
  firebaseProject: 'demo-massage-it',
  firebaseApiKey: 'demo-api-key',
};

/** Checkout of Massage-backend: E2E_BACKEND_DIR, else next to this repo. */
export const BACKEND_DIR = process.env.E2E_BACKEND_DIR
  ? path.resolve(process.cwd(), process.env.E2E_BACKEND_DIR)
  : (['../../Massage-backend', '../Massage-backend']
      .map((candidate) => path.resolve(here, '..', candidate))
      .find((candidate) => existsSync(path.join(candidate, 'package.json'))) ??
    path.resolve(here, '../../Massage-backend'));

// Local test values only (same as the backend's compose.yaml).
export const PG = {
  admin: 'local-admin-password',
  migrator: 'local-migrator-password',
  app: 'local-app-password',
};

/** URL of the throw-away test database for a role. */
export const testDatabaseUrl = (role, password) =>
  `postgresql://${role}:${password}@127.0.0.1:${E2E.pgPort}/booking`;
