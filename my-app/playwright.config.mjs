import os from 'node:os';
import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { E2E } from './e2e/env.mjs';

/*
 * Browser tests of the key booking flows (e2e/*.spec.mjs). Playwright
 * starts an isolated stack — PostgreSQL in Docker, the backend's migrations,
 * the Firebase Auth Emulator, the Booking API (e2e/stack.mjs) — and this
 * site in dev mode on its own port, pointed at them. Nothing reaches
 * staging, production or real Firebase. See README, « Tests navigateur ».
 *
 * One worker: the tests share one calendar (each uses its own accounts),
 * and a booked slot must not be taken by a parallel test.
 */
const firebaseEnv = {
  NEXT_PUBLIC_API_BASE_URL: E2E.apiUrl,
  NEXT_PUBLIC_FIREBASE_API_KEY: E2E.firebaseApiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${E2E.firebaseProject}.firebaseapp.com`,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: E2E.firebaseProject,
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:000000000000:web:e2e',
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: `127.0.0.1:${E2E.authPort}`,
  NEXT_PUBLIC_SITE_URL: '',
  NEXT_TELEMETRY_DISABLED: '1',
};

// Outside the project: traces written into it while a test runs make the dev
// server rebuild (Fast Refresh), which remounts the page under test.
const output =
  process.env.E2E_OUTPUT_DIR ?? path.join(os.tmpdir(), 'massage-frontend-e2e');

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.mjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: path.join(output, 'report') }],
      ]
    : 'list',
  outputDir: path.join(output, 'results'),
  use: {
    baseURL: E2E.siteUrl,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      // The mobile layout has its own action bar: the main flow runs there too.
      grep: /@mobile/,
    },
  ],
  webServer: [
    {
      command: 'node e2e/stack.mjs',
      url: `${E2E.apiUrl}/health/ready`,
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      gracefulShutdown: { signal: 'SIGTERM', timeout: 15_000 },
    },
    {
      command: `npx next dev --webpack --port ${E2E.sitePort}`,
      url: E2E.siteUrl,
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
      env: firebaseEnv,
    },
  ],
});
