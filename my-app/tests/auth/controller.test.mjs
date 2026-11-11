import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createAuthController } from '../../src/lib/auth/controller.js';
import { accountStatus } from '../../src/lib/auth/session.js';

const flush = async (times = 5) => {
  for (let i = 0; i < times; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

const authError = (code) => Object.assign(new Error(code), { code });

function makeUser(uid, { isAnonymous = false, email = null } = {}) {
  return {
    uid,
    isAnonymous,
    email,
    emailVerified: false,
    getIdToken: async () => `token-${uid}`,
  };
}

// Minimal stand-in for the Firebase adapter (src/lib/auth/firebase.js).
function fakeFirebase({ persisted = null, anonymousFails = 0 } = {}) {
  const listeners = new Set();
  let current = persisted;
  let next = 1;
  let failuresLeft = anonymousFails;
  const calls = { anonymous: 0, signOut: 0 };
  // Firebase notifies listeners asynchronously.
  const emit = () =>
    queueMicrotask(() => listeners.forEach((listener) => listener(current)));

  return {
    calls,
    replaceUser(user) {
      current = user;
      emit();
    },
    currentUser: () => current,
    authStateReady: async () => {},
    onAuthStateChanged(listener) {
      listeners.add(listener);
      queueMicrotask(() => listener(current));
      return () => listeners.delete(listener);
    },
    async signInAnonymously() {
      calls.anonymous += 1;
      if (failuresLeft > 0) {
        failuresLeft -= 1;
        throw authError('auth/network-request-failed');
      }
      current = makeUser(`guest-${next++}`, { isAnonymous: true });
      emit();
    },
    async signOut() {
      calls.signOut += 1;
      current = null;
      emit();
    },
    async linkWithEmail(user, email) {
      // Linking keeps the same user object and UID.
      user.isAnonymous = false;
      user.email = email;
    },
    async signInWithEmail(email) {
      if (current?.email === email) return; // re-sign-in after linking
      current = makeUser('existing', { email });
      emit();
    },
    async createUserWithEmail(email) {
      current = makeUser('created', { email });
      emit();
    },
    async sendEmailVerification() {},
    async linkWithGoogle() {
      throw authError('auth/credential-already-in-use');
    },
    credentialFromError: () => ({ provider: 'google.com' }),
    async signInWithCredential() {
      current = makeUser('google-account', { email: 'g@example.com' });
      emit();
    },
    async sendPasswordResetEmail() {},
    async reloadUser() {},
  };
}

/**
 * Fake API: every request waits until the test answers it, so the order of
 * responses can be chosen.
 */
function fakeApi() {
  const pending = [];
  const fetchImpl = (url, init) =>
    new Promise((resolve) => {
      pending.push({
        url,
        method: init.method,
        body: init.body === undefined ? undefined : JSON.parse(init.body),
        token: init.headers.Authorization.replace('Bearer ', ''),
        respond(status, body) {
          resolve({
            ok: status >= 200 && status < 300,
            status,
            headers: { get: () => null },
            json: async () => body,
          });
        },
      });
    });
  return { fetchImpl, pending };
}

const profileView = (role = 'client', authState = 'registered') => ({
  profile: { role, authState, name: null, email: null, emailVerified: false },
});

function setup(options = {}) {
  const fb = fakeFirebase(options);
  const api = fakeApi();
  const timers = [];
  const controller = createAuthController({
    loadFirebase: async () => fb,
    apiBaseUrl: 'https://api.test',
    fetchImpl: api.fetchImpl,
    setTimer: (fn, ms) => timers.push({ fn, ms }) - 1,
    clearTimer: () => {},
  });
  return { fb, api, timers, controller };
}

test('first visit: one anonymous session and one sync, even if start runs twice', async () => {
  const { fb, api, controller } = setup();
  // React Strict Mode runs effects twice.
  controller.start();
  controller.start();
  await flush();

  assert.equal(fb.calls.anonymous, 1);
  assert.equal(api.pending.length, 1);
  assert.equal(api.pending[0].url, 'https://api.test/api/me/sync');
  assert.equal(accountStatus(controller.getSnapshot()), 'guest');

  api.pending[0].respond(200, profileView('client', 'anonymous'));
  await flush();
  assert.equal(controller.getSnapshot().profile.status, 'ready');
});

test('reload with a persisted account: no anonymous sign-in', async () => {
  const { fb, api, controller } = setup({
    persisted: makeUser('member-1', { email: 'm@example.com' }),
  });
  controller.start();
  await flush();

  assert.equal(fb.calls.anonymous, 0);
  assert.equal(api.pending.length, 1, 'one sync for the restored user');
  // «Mon compte» without waiting for the sync; the role waits for it.
  assert.equal(accountStatus(controller.getSnapshot()), 'member');

  api.pending[0].respond(200, profileView('admin'));
  await flush();
  assert.equal(accountStatus(controller.getSnapshot()), 'admin');
});

test('a slow answer for the previous account never reaches the new one', async () => {
  const { fb, api, controller } = setup({
    persisted: makeUser('admin-1', { email: 'a@example.com' }),
  });
  controller.start();
  await flush();
  const adminRequest = api.pending[0];

  await controller.signOut();
  await flush();
  // Profile cleared at once, new guest created and synced.
  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.user.isAnonymous, true);
  assert.equal(snapshot.profile.data, null);
  assert.equal(fb.calls.anonymous, 1);

  adminRequest.respond(200, profileView('admin'));
  await flush();
  const after = controller.getSnapshot();
  assert.notEqual(after.profile.uid, 'admin-1');
  assert.equal(after.profile.data, null);
  assert.equal(accountStatus(after), 'guest');
});

test('an API failure keeps the Firebase session', async () => {
  const { fb, api, controller } = setup({
    persisted: makeUser('member-1', { email: 'm@example.com' }),
  });
  controller.start();
  await flush();
  api.pending[0].respond(500, { code: 'INTERNAL' });
  await flush();

  const snapshot = controller.getSnapshot();
  assert.equal(fb.calls.signOut, 0);
  assert.equal(fb.calls.anonymous, 0);
  assert.equal(snapshot.user.uid, 'member-1');
  assert.equal(snapshot.profile.status, 'error');
  assert.equal(accountStatus(snapshot), 'member');
});

test('AUTH_UNAVAILABLE: one automatic retry after Retry-After, then manual only', async () => {
  const { api, timers, controller } = setup({
    persisted: makeUser('member-1'),
  });
  controller.start();
  await flush();
  api.pending[0].respond(503, {
    code: 'AUTH_UNAVAILABLE',
    retryAfterSeconds: 5,
  });
  await flush();

  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 5000);
  timers[0].fn();
  await flush();
  assert.equal(api.pending.length, 2);

  api.pending[1].respond(503, {
    code: 'AUTH_UNAVAILABLE',
    retryAfterSeconds: 5,
  });
  await flush();
  assert.equal(timers.length, 1, 'no second automatic retry');
  assert.equal(controller.getSnapshot().profile.status, 'error');
});

test('SESSION_REVOKED outside a sign-in flow: sign out, notice, new guest', async () => {
  const { fb, api, controller } = setup({ persisted: makeUser('member-1') });
  controller.start();
  await flush();
  api.pending[0].respond(401, { code: 'SESSION_REVOKED' });
  await flush();

  const snapshot = controller.getSnapshot();
  assert.equal(fb.calls.signOut, 1);
  assert.equal(snapshot.notice, 'session_revoked');
  assert.equal(snapshot.user.isAnonymous, true);
});

test('guest → new account keeps the UID and forces a fresh sync', async () => {
  const { api, controller } = setup();
  controller.start();
  await flush();
  const guestUid = controller.getSnapshot().user.uid;
  api.pending[0].respond(200, profileView('client', 'anonymous'));
  await flush();

  const flow = controller.signUpWithEmail('new@example.com', 'secret12');
  await flush();
  assert.equal(api.pending.length, 2);
  api.pending[1].respond(200, profileView('client', 'registered'));
  await flow;

  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.user.uid, guestUid);
  assert.equal(snapshot.user.isAnonymous, false);
  assert.equal(accountStatus(snapshot), 'member');
});

test('Google account already in use: guest kept until confirmed', async () => {
  const { fb, api, controller } = setup();
  controller.start();
  await flush();
  const guestUid = controller.getSnapshot().user.uid;
  api.pending[0].respond(200, profileView('client', 'anonymous'));
  await flush();

  const result = await controller.continueWithGoogle();
  assert.ok(result.conflict, 'conflict returned for confirmation');
  // Cancelling = doing nothing: the guest session is untouched.
  assert.equal(controller.getSnapshot().user.uid, guestUid);
  assert.equal(fb.calls.signOut, 0);

  const flow = controller.confirmExistingGoogle(result.conflict.credential);
  await flush();
  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.user.uid, 'google-account');
  assert.equal(snapshot.profile.data, null, 'guest profile not carried over');
  api.pending.at(-1).respond(200, profileView('client'));
  await flow;
  assert.equal(accountStatus(controller.getSnapshot()), 'member');
});

test('anonymous sign-in failure: unavailable, no loop, manual retry works', async () => {
  const { fb, controller } = setup({ anonymousFails: 1 });
  controller.start();
  await flush(10);

  assert.equal(fb.calls.anonymous, 1);
  assert.equal(accountStatus(controller.getSnapshot()), 'unavailable');

  await controller.retry();
  await flush();
  assert.equal(fb.calls.anonymous, 2);
  assert.equal(accountStatus(controller.getSnapshot()), 'guest');
});

test('ACCOUNT_DISABLED: sign out with a notice', async () => {
  const { fb, api, controller } = setup({ persisted: makeUser('member-1') });
  controller.start();
  await flush();
  api.pending[0].respond(403, { code: 'ACCOUNT_DISABLED' });
  await flush();
  assert.equal(fb.calls.signOut, 1);
  assert.equal(controller.getSnapshot().notice, 'account_disabled');
});

test('switching accounts directly clears the previous profile first', async () => {
  const { fb, api, controller } = setup({ persisted: makeUser('member-1') });
  controller.start();
  await flush();
  api.pending[0].respond(200, profileView('admin'));
  await flush();
  assert.equal(accountStatus(controller.getSnapshot()), 'admin');

  fb.replaceUser(makeUser('member-2'));
  await flush();
  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.profile.data, null);
  // The previous admin role is gone at once; the new account is a member
  // until its own profile says otherwise.
  assert.equal(accountStatus(snapshot), 'member');
});

test('updateProfile: the answer replaces the profile only for the same user', async () => {
  const { fb, api, controller } = setup({ persisted: makeUser('member-1') });
  controller.start();
  await flush();
  api.pending[0].respond(200, profileView('client'));
  await flush();

  const saving = controller.updateProfile({ name: 'Léa' });
  await flush();
  const patch = api.pending.at(-1);
  // The user switches account before the answer arrives.
  fb.replaceUser(makeUser('member-2'));
  await flush();
  patch.respond(200, {
    profile: { role: 'client', authState: 'registered', name: 'Léa' },
  });
  await saving;
  await flush();

  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.user.uid, 'member-2');
  assert.notEqual(snapshot.profile.data?.profile?.name, 'Léa');
});

test('api: SESSION_REVOKED on any request ends the session with a notice', async () => {
  const { fb, api, controller } = setup({ persisted: makeUser('member-1') });
  controller.start();
  await flush();
  api.pending[0].respond(200, profileView('client'));
  await flush();

  const call = controller.api('/api/bookings');
  await flush();
  api.pending.at(-1).respond(401, { code: 'SESSION_REVOKED' });
  await assert.rejects(call, (error) => error.code === 'SESSION_REVOKED');
  await flush();
  assert.equal(fb.calls.signOut, 1);
  assert.equal(controller.getSnapshot().notice, 'session_revoked');
});

test('guest status is known before the anonymous session exists', async () => {
  const { fb, controller } = setup();
  // Hold the anonymous sign-in to look at the state in between.
  let release;
  const realSignIn = fb.signInAnonymously;
  fb.signInAnonymously = () =>
    new Promise((resolve) => {
      release = () => resolve(realSignIn.call(fb));
    });

  controller.start();
  await flush();
  const before = controller.getSnapshot();
  assert.equal(before.user, null);
  assert.equal(before.sessionKnown, true);
  assert.equal(accountStatus(before), 'guest');

  release();
  await flush();
  assert.equal(controller.getSnapshot().user.isAnonymous, true);
});

test('restored account: exactly one sync even with the first notification', async () => {
  const { api, controller } = setup({ persisted: makeUser('member-1') });
  controller.start();
  controller.start();
  await flush(10);
  assert.equal(api.pending.length, 1);
});

test('sign-up newsletter checkbox: opt-in sent with that one sync only', async () => {
  const { api, controller } = setup();
  controller.start();
  await flush();
  assert.equal(api.pending[0].body, undefined); // the guest sync: no opt-in
  api.pending[0].respond(200, profileView('client', 'anonymous'));
  await flush();

  const flow = controller.signUpWithEmail('new@example.com', 'secret12', {
    marketingConsent: '2026-10-28.fr.1',
  });
  await flush();
  assert.deepEqual(api.pending[1].body, {
    marketingOptIn: true,
    marketingConsentTextVersion: '2026-10-28.fr.1',
  });
  api.pending[1].respond(200, {
    ...profileView('client', 'registered'),
    marketingOptIn: { outcome: 'confirmation_sent' },
  });
  await flow;

  const snapshot = controller.getSnapshot();
  assert.deepEqual(snapshot.optIn, { outcome: 'confirmation_sent' });
  // The opt-in result is not part of the stored profile.
  assert.equal(snapshot.profile.data.marketingOptIn, undefined);

  // A later sync (retry, verification) never repeats the opt-in.
  controller.retry();
  await flush();
  assert.equal(api.pending[2].body, undefined);
  controller.clearOptIn();
  assert.equal(controller.getSnapshot().optIn, null);
});

test('sign-up without the checkbox: no opt-in in the body', async () => {
  const { api, controller } = setup();
  controller.start();
  await flush();
  api.pending[0].respond(200, profileView('client', 'anonymous'));
  await flush();
  const flow = controller.signUpWithEmail('new@example.com', 'secret12');
  await flush();
  assert.equal(api.pending[1].body, undefined);
  api.pending[1].respond(200, profileView());
  await flow;
  assert.equal(controller.getSnapshot().optIn, null);
});

test('subscribeMarketing: own address, answer status applied to the profile', async () => {
  const { api, controller } = setup({
    persisted: makeUser('u1', { email: 'me@example.com' }),
  });
  controller.start();
  await flush();
  api.pending[0].respond(200, {
    ...profileView(),
    marketing: { subscribed: false, pendingConfirmation: false },
    marketingAvailable: true,
  });
  await flush();

  const call = controller.subscribeMarketing('2026-10-28.fr.1');
  await flush();
  const request = api.pending[1];
  assert.match(request.url, /\/api\/me\/marketing\/subscription$/);
  assert.equal(request.method, 'POST');
  assert.deepEqual(request.body, { consentTextVersion: '2026-10-28.fr.1' });
  request.respond(200, {
    outcome: 'subscribed',
    welcomeEmail: 'not_sent',
    marketing: { subscribed: true, pendingConfirmation: false },
  });
  const result = await call;
  assert.equal(result.outcome, 'subscribed');
  const view = controller.getSnapshot().profile.data;
  assert.equal(view.marketing.subscribed, true);
  assert.equal(view.marketingAvailable, true);
});
