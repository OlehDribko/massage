/*
 * Reproducible test data for the browser tests, created through the same
 * public interfaces as a real visitor — the Auth Emulator REST API and the
 * Booking API — never by writing to the database:
 * - `readyClient()`: a registered client with a verified email, a name and
 *   a phone (bookingReadiness.ready = true);
 * - `client({ phone: null })`: a registered client missing a step;
 * - `firstFreeSlot(serviceId)`: the first free start the site will show
 *   (today's week, first day with a start);
 * - `bookAs(user, …)`, `bookingsOf(user)`: the API as that client;
 * - `admin()`: a registered account given the admin role by the backend's
 *   own owner command (src/admin/assign-role.ts) on the throw-away test
 *   database — there is no HTTP route for roles.
 * Every account has a unique address, so tests never share a profile.
 */
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { test as base } from '@playwright/test';

import { BACKEND_DIR, E2E, PG, testDatabaseUrl } from './env.mjs';

const identity = `${E2E.authUrl}/identitytoolkit.googleapis.com/v1`;
const PASSWORD = 'e2e-password-1';

async function json(response, what) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${what}: HTTP ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function signIn(email) {
  const body = await json(
    await fetch(
      `${identity}/accounts:signInWithPassword?key=${E2E.firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: PASSWORD,
          returnSecureToken: true,
        }),
      }
    ),
    'emulator sign-in'
  );
  return body.idToken;
}

export async function api(
  token,
  path,
  { method = 'GET', body, headers = {} } = {}
) {
  const response = await fetch(`${E2E.apiUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    body: await response.json().catch(() => null),
  };
}

/** Registered client; `name` / `phone` null leave that step missing. */
export async function client({
  name = 'Client Test',
  phone = '+33612345678',
  verified = true,
} = {}) {
  const email = `e2e-${randomUUID()}@example.test`;
  const created = await json(
    await fetch(`${identity}/accounts:signUp?key=${E2E.firebaseApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: PASSWORD,
        returnSecureToken: true,
      }),
    }),
    'emulator sign-up'
  );
  if (verified) {
    await json(
      await fetch(
        `${identity}/projects/${E2E.firebaseProject}/accounts:update`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer owner',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            localId: created.localId,
            emailVerified: true,
          }),
        }
      ),
      'emulator verify email'
    );
  }
  // A token issued after verification carries email_verified.
  const token = await signIn(email);
  const synced = await api(token, '/api/me/sync', { method: 'POST' });
  if (synced.status !== 200) throw new Error(`sync: ${synced.status}`);
  const changes = {};
  if (name) changes.name = name;
  if (phone) changes.phone = phone;
  if (Object.keys(changes).length) {
    const patched = await api(token, '/api/me', {
      method: 'PATCH',
      body: changes,
    });
    if (patched.status !== 200) {
      throw new Error(
        `profile: ${patched.status} ${JSON.stringify(patched.body)}`
      );
    }
  }
  return {
    email,
    password: PASSWORD,
    token,
    name,
    profileId: synced.body.profile.id,
  };
}

export const readyClient = () => client();

/** Registered account with the admin role (local test database only). */
export async function admin() {
  const user = await client({ name: 'Admin Test' });
  execFileSync(
    'npx',
    [
      'tsx',
      'src/admin/assign-role.ts',
      '--profile-id',
      user.profileId,
      '--email',
      user.email,
      '--role',
      'admin',
      '--apply',
    ],
    {
      cwd: path.join(BACKEND_DIR, 'services/booking'),
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl('booking_app', PG.app),
        DATABASE_SSL_MODE: 'disable',
        DOTENV_CONFIG_PATH: '/dev/null',
      },
      stdio: 'pipe',
    }
  );
  const synced = await api(user.token, '/api/me/sync', { method: 'POST' });
  if (synced.body?.profile?.role !== 'admin') {
    throw new Error(`admin role not granted: ${synced.status}`);
  }
  return user;
}

/** Free starts of one date for a service (public availability). */
export async function slotsOn(serviceId, date) {
  const response = await fetch(
    `${E2E.apiUrl}/api/services/${serviceId}/availability?from=${date}&to=${date}`
  );
  const { days } = await json(response, 'availability');
  return days.find((item) => item.date === date)?.slots ?? [];
}

/** First free start in the site's first week (what the picker preselects). */
export async function firstFreeSlot(serviceId) {
  const response = await fetch(
    `${E2E.apiUrl}/api/services/${serviceId}/availability`
  );
  const { days } = await json(response, 'availability');
  const day = days.find((item) => item.slots.length);
  if (!day) throw new Error(`no free start for ${serviceId}`);
  return { date: day.date, ...day.slots[0] };
}

export function bookAs(user, serviceId, startsAt, key = randomUUID()) {
  return api(user.token, '/api/bookings', {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body: { serviceId, startsAt },
  });
}

export async function bookingsOf(user) {
  const { status, body } = await api(user.token, '/api/bookings');
  if (status !== 200) throw new Error(`bookings: ${status}`);
  return body.bookings;
}

/** "10:45" as the site shows it (studio time). */
export const studioTime = (startsAt) =>
  new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(startsAt));

/** Signs in through the site's own form, then waits for the return page. */
export async function signInOnSite(page, user, returnTo) {
  const target = returnTo
    ? `/connexion?retour=${encodeURIComponent(returnTo)}`
    : '/connexion';
  if (!page.url().includes('/connexion')) await page.goto(target);
  await page.getByLabel('Adresse e-mail').fill(user.email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(user.password);
  await page
    .locator('form')
    .getByRole('button', { name: 'Se connecter' })
    .click();
  await page.waitForURL((url) => !url.pathname.startsWith('/connexion'));
}

// Ids of the « Massage sportif » durations (backend initial catalogue).
export const SPORTIF = {
  min55: '11a5f7a9-4e3a-4fe1-bfcb-ad85073b7ec4',
  min90: 'dea5ef63-6ab1-4338-aa05-2fab089ee070',
  min120: 'e416e435-88a8-458c-8737-3f9b5b9b5e6f',
};

export const test = base;
export { expect } from '@playwright/test';
