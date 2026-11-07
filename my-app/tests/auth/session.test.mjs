import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ApiError,
  accountStatus,
  apiRequest,
  safeReturnPath,
} from '../../src/lib/auth/session.js';

const view = (overrides = {}) => ({
  profile: {
    role: 'client',
    authState: 'registered',
    name: null,
    email: 'a@example.com',
    ...overrides,
  },
});

const state = (overrides = {}) => ({
  phase: 'ready',
  user: { uid: 'u1', isAnonymous: false },
  profile: { uid: 'u1', status: 'ready', data: view(), error: null },
  ...overrides,
});

test('status: loading only until Firebase has restored the session', () => {
  assert.equal(accountStatus(state({ phase: 'idle', user: null })), 'loading');
  assert.equal(
    accountStatus(
      state({ phase: 'starting', user: null, sessionKnown: false })
    ),
    'loading'
  );
  // Restored, no persisted user: no permanent account, even before the
  // anonymous session exists.
  assert.equal(
    accountStatus(state({ phase: 'starting', user: null, sessionKnown: true })),
    'guest'
  );
});

test('status: a permanent account is member before its profile arrives', () => {
  assert.equal(
    accountStatus(
      state({ profile: { uid: 'u1', status: 'loading', data: null } })
    ),
    'member'
  );
});

test('status: anonymous user is a guest whatever the profile says', () => {
  const s = state({
    user: { uid: 'u1', isAnonymous: true },
    profile: { uid: 'u1', status: 'error', data: null },
  });
  assert.equal(accountStatus(s), 'guest');
});

test('status: admin only from the backend role of the current user', () => {
  assert.equal(accountStatus(state()), 'member');
  assert.equal(
    accountStatus(
      state({
        profile: { uid: 'u1', status: 'ready', data: view({ role: 'admin' }) },
      })
    ),
    'admin'
  );
  // Profile of another uid (stale) never grants anything.
  assert.equal(
    accountStatus(
      state({
        profile: { uid: 'old', status: 'ready', data: view({ role: 'admin' }) },
      })
    ),
    'member'
  );
});

test('status: registered user with a failed profile is member, never admin', () => {
  assert.equal(
    accountStatus(
      state({ profile: { uid: 'u1', status: 'error', data: null } })
    ),
    'member'
  );
});

test('status: firebase failure is unavailable', () => {
  assert.equal(accountStatus(state({ phase: 'error' })), 'unavailable');
});

test('return path: only same-site paths', () => {
  assert.equal(safeReturnPath('/compte'), '/compte');
  assert.equal(safeReturnPath('/#services'), '/#services');
  assert.equal(safeReturnPath('/reserver?x=1'), '/reserver?x=1');
  for (const bad of [
    null,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/\t/evil.example',
    'javascript:alert(1)',
    'compte',
    '/connexion',
    '/connexion?retour=/compte',
  ]) {
    assert.equal(safeReturnPath(bad, '/compte'), '/compte', String(bad));
  }
});

const response = (status, body, headers = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (name) => headers[name] ?? null },
  json: async () => body,
});

test('api: token only in the Authorization header, no-store', async () => {
  let seen;
  const result = await apiRequest({
    baseUrl: 'https://api.test',
    path: '/api/me/sync',
    method: 'POST',
    getToken: async () => 'tok',
    fetchImpl: async (url, init) => {
      seen = { url, init };
      return response(200, { ok: 1 });
    },
  });
  assert.deepEqual(result, { ok: 1 });
  assert.equal(seen.url, 'https://api.test/api/me/sync');
  assert.equal(seen.init.headers.Authorization, 'Bearer tok');
  assert.equal(seen.init.cache, 'no-store');
  assert.ok(!seen.url.includes('tok'));
});

test('api: expired token → one forced refresh and one retry', async () => {
  const forced = [];
  let calls = 0;
  const result = await apiRequest({
    baseUrl: 'https://api.test',
    path: '/x',
    getToken: async (force) => {
      forced.push(force);
      return force ? 'new' : 'old';
    },
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? response(401, { code: 'TOKEN_EXPIRED' })
        : response(200, { ok: true });
    },
  });
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(forced, [false, true]);
});

test('api: still invalid after refresh → error, no third call', async () => {
  let calls = 0;
  await assert.rejects(
    apiRequest({
      baseUrl: 'https://api.test',
      path: '/x',
      getToken: async () => 't',
      fetchImpl: async () => {
        calls += 1;
        return response(401, { code: 'INVALID_TOKEN' });
      },
    }),
    (error) => error instanceof ApiError && error.code === 'INVALID_TOKEN'
  );
  assert.equal(calls, 2);
});

test('api: AUTH_UNAVAILABLE keeps Retry-After; network errors are typed', async () => {
  await assert.rejects(
    apiRequest({
      baseUrl: 'https://api.test',
      path: '/x',
      getToken: async () => 't',
      fetchImpl: async () =>
        response(503, { code: 'AUTH_UNAVAILABLE' }, { 'Retry-After': '7' }),
    }),
    (error) =>
      error.code === 'AUTH_UNAVAILABLE' && error.retryAfterSeconds === 7
  );
  await assert.rejects(
    apiRequest({
      baseUrl: 'https://api.test',
      path: '/x',
      getToken: async () => 't',
      fetchImpl: async () => {
        throw new TypeError('Failed to fetch');
      },
    }),
    (error) => error.code === 'NETWORK_ERROR' && error.status === 0
  );
});

test('api: public call has no Authorization; extra headers and error details kept', async () => {
  let seen;
  await assert.rejects(
    apiRequest({
      baseUrl: 'https://api.test',
      path: '/api/bookings',
      method: 'POST',
      body: { serviceId: 's', startsAt: 't' },
      headers: { 'Idempotency-Key': 'key-12345678' },
      getToken: async () => 'tok',
      fetchImpl: async (url, init) => {
        seen = init.headers;
        return response(409, {
          message: 'The requested time is not available',
          code: 'SLOT_UNAVAILABLE',
          reason: 'taken',
        });
      },
    }),
    (error) =>
      error.code === 'SLOT_UNAVAILABLE' &&
      error.details.reason === 'taken' &&
      !('message' in error.details)
  );
  assert.equal(seen['Idempotency-Key'], 'key-12345678');

  let publicHeaders;
  await apiRequest({
    baseUrl: 'https://api.test',
    path: '/api/services',
    fetchImpl: async (url, init) => {
      publicHeaders = init.headers;
      return response(200, { services: [] });
    },
  });
  assert.equal('Authorization' in publicHeaders, false);
});
