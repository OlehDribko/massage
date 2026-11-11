/*
 * The single owner of the browser session (docs: Massage-backend
 * docs/auth-and-profiles.md, section 5). React only subscribes to it, so
 * re-renders and Strict Mode cannot start a second anonymous sign-in or a
 * parallel sync.
 *
 * Two independent parts of the state:
 * - Firebase session (`phase`, `user`): who is signed in;
 * - backend profile (`profile`): role and confirmed data of THAT user.
 * A profile/API failure never signs the user out by itself, except for the
 * documented SESSION_REVOKED / ACCOUNT_DISABLED / INVALID_TOKEN cases.
 *
 * Firebase is injected (`loadFirebase`), which keeps this file free of SDK
 * imports and testable with a fake.
 */

import { ApiError, apiRequest } from './session.js';

const EMPTY_PROFILE = {
  uid: null,
  status: 'idle',
  data: null,
  error: null,
};

const MAX_AUTO_RETRY_SECONDS = 30;

/** Sync body for an explicitly ticked sign-up checkbox, else nothing. */
function optInBody(consentTextVersion) {
  return consentTextVersion
    ? { marketingOptIn: true, marketingConsentTextVersion: consentTextVersion }
    : undefined;
}

function toUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
    email: user.email ?? null,
    emailVerified: user.emailVerified,
  };
}

export function createAuthController({
  loadFirebase,
  apiBaseUrl,
  fetchImpl,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
}) {
  let state = {
    phase: 'idle', // idle → starting → ready | error
    error: null,
    // True once Firebase has restored (or ruled out) a persisted session:
    // from then on "no permanent account" is known, even while the
    // anonymous session is still being created.
    sessionKnown: false,
    user: null,
    profile: EMPTY_PROFILE,
    notice: null, // 'session_revoked' | 'account_disabled'
    // `marketingOptIn` of the sign-up sync that carried the checkbox (shown
    // once, then cleared by the UI).
    optIn: null,
  };
  const listeners = new Set();

  let fb = null;
  let startPromise = null;
  let anonymousPromise = null;
  let unsubscribeAuth = null;
  // While a sign-in/link flow runs, Firebase may switch tokens under us;
  // automatic syncs and their error handling wait for the flow's own sync.
  let flowDepth = 0;
  let syncSeq = 0;
  let inFlight = null; // { uid, seq, promise }
  let retryTimer = null;
  const autoRetried = new Set(); // uids that already got their one auto-retry
  let invalidTokenSignOut = false;

  const set = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };

  const currentUid = () => fb?.currentUser()?.uid ?? null;

  const cancelRetry = () => {
    if (retryTimer !== null) clearTimer(retryTimer);
    retryTimer = null;
  };

  const request = (user, path, options = {}) =>
    apiRequest({
      baseUrl: apiBaseUrl,
      path,
      getToken: (force) => user.getIdToken(force),
      fetchImpl,
      ...options,
    });

  async function handleSyncError(user, error) {
    const code = error instanceof ApiError ? error.code : 'UNKNOWN';

    if (flowDepth === 0 && code === 'SESSION_REVOKED') {
      set({ notice: 'session_revoked' });
      await signOut();
      return;
    }
    if (code === 'ACCOUNT_DISABLED') {
      set({ notice: 'account_disabled' });
      await signOut();
      return;
    }
    // Still invalid after the forced refresh: the account was deleted or the
    // token belongs to another project. A guest keeps its session (signing
    // out would only create the same problem again); a permanent account is
    // signed out once per page load.
    if (
      flowDepth === 0 &&
      code === 'INVALID_TOKEN' &&
      !user.isAnonymous &&
      !invalidTokenSignOut
    ) {
      invalidTokenSignOut = true;
      await signOut();
      return;
    }

    set({
      profile: {
        ...state.profile,
        status: 'error',
        error: { code, retryAfterSeconds: error?.retryAfterSeconds },
      },
    });

    // Documented: retry after Retry-After. Once per user, then manual only.
    if (code === 'AUTH_UNAVAILABLE' && !autoRetried.has(user.uid)) {
      autoRetried.add(user.uid);
      const seconds = Math.min(
        Math.max(error.retryAfterSeconds ?? 5, 1),
        MAX_AUTO_RETRY_SECONDS
      );
      cancelRetry();
      retryTimer = setTimer(() => {
        retryTimer = null;
        if (currentUid() === user.uid) syncProfile(user, { force: true });
      }, seconds * 1000);
    }
  }

  /**
   * POST /api/me/sync for `user`. Concurrent calls for the same user share
   * one request unless `force` (after sign-in, linking, email verification).
   * A response is applied only if it is the latest request AND the user is
   * still the current one, so a slow answer never overwrites another
   * account's profile.
   */
  function syncProfile(user, { force = false, body } = {}) {
    if (!apiBaseUrl) {
      set({
        profile: {
          uid: user.uid,
          status: 'error',
          data: null,
          error: { code: 'NOT_CONFIGURED' },
        },
      });
      return Promise.resolve();
    }
    if (!force && inFlight && inFlight.uid === user.uid) {
      return inFlight.promise;
    }

    const seq = ++syncSeq;
    const keep = state.profile.uid === user.uid ? state.profile.data : null;
    set({
      profile: { uid: user.uid, status: 'loading', data: keep, error: null },
    });

    const isStale = () => seq !== syncSeq || currentUid() !== user.uid;
    const promise = request(user, '/api/me/sync', { method: 'POST', body })
      .then((response) => {
        if (isStale()) return;
        // The opt-in result belongs to this one sync, not to the profile.
        const { marketingOptIn, ...view } = response ?? {};
        set({
          profile: { uid: user.uid, status: 'ready', data: view, error: null },
          ...(marketingOptIn ? { optIn: marketingOptIn } : {}),
        });
      })
      .catch((error) => {
        if (isStale()) return;
        return handleSyncError(user, error);
      })
      .finally(() => {
        if (inFlight?.seq === seq) inFlight = null;
      });

    inFlight = { uid: user.uid, seq, promise };
    return promise;
  }

  /** Anonymous session — only when there is no user at all. One at a time. */
  function ensureSession() {
    if (fb.currentUser()) return Promise.resolve();
    if (!anonymousPromise) {
      anonymousPromise = fb
        .signInAnonymously()
        .then(() => {
          if (state.phase === 'error') set({ phase: 'ready', error: null });
        })
        .catch((error) => {
          set({ phase: 'error', error: { code: error?.code ?? 'unknown' } });
        })
        .finally(() => {
          anonymousPromise = null;
        });
    }
    return anonymousPromise;
  }

  function handleAuthChange(firebaseUser) {
    const previousUid = state.user?.uid ?? null;
    const nextUid = firebaseUser?.uid ?? null;

    if (previousUid !== nextUid) {
      // Account changed: drop everything that belonged to the previous one
      // before anything is rendered for the new one.
      cancelRetry();
      syncSeq += 1;
      inFlight = null;
      set({ user: toUser(firebaseUser), profile: EMPTY_PROFILE });
    } else {
      set({ user: toUser(firebaseUser) });
    }

    if (!firebaseUser) {
      // Signed out (or the session vanished): a new guest, as documented.
      if (flowDepth === 0) ensureSession();
      return;
    }
    // A user restored before the subscription has no profile yet: sync it on
    // the first notification (once — syncProfile shares a running request).
    if (
      flowDepth === 0 &&
      (previousUid !== nextUid || state.profile.uid !== nextUid)
    ) {
      syncProfile(firebaseUser);
    }
  }

  async function bootstrap() {
    set({ phase: 'starting', error: null });
    try {
      fb = fb ?? (await loadFirebase());
      // Restore the persisted session first: otherwise a signed-in user
      // would briefly have "no session" and get an anonymous one instead.
      await fb.authStateReady();
      // The header can show "Se connecter" / "Mon compte" now, without
      // waiting for the anonymous sign-in or the profile sync.
      set({ sessionKnown: true, user: toUser(fb.currentUser()) });
      if (!unsubscribeAuth) {
        // First notification: the restored user (→ sync) or none (→ the
        // documented anonymous session, once, via ensureSession).
        unsubscribeAuth = fb.onAuthStateChanged(handleAuthChange);
      }
      set({ phase: 'ready' });
    } catch (error) {
      set({ phase: 'error', error: { code: error?.code ?? 'unknown' } });
    }
  }

  /** Idempotent: React effects may call it any number of times. */
  function start() {
    if (!startPromise) startPromise = bootstrap();
    return startPromise;
  }

  /** Manual retry after a failure; never loops on its own. */
  function retry() {
    if (state.phase === 'error') {
      if (!fb || !unsubscribeAuth) {
        startPromise = bootstrap();
        return startPromise;
      }
      return ensureSession();
    }
    const user = fb?.currentUser();
    if (user) return syncProfile(user, { force: true });
    return Promise.resolve();
  }

  async function signOut() {
    cancelRetry();
    await fb.signOut();
    // onAuthStateChanged(null) clears the profile and creates a new guest.
  }

  /**
   * Runs a sign-in/link flow, then refreshes the user and forces one sync
   * with the new token. `syncBody` goes with that one sync only (the
   * sign-up newsletter checkbox): later syncs never repeat it.
   */
  async function runFlow(flow, syncBody) {
    flowDepth += 1;
    try {
      const result = await flow();
      const user = fb.currentUser();
      handleAuthChange(user);
      if (user) await syncProfile(user, { force: true, body: syncBody });
      return result;
    } finally {
      flowDepth -= 1;
    }
  }

  const requireUser = () => {
    const user = fb?.currentUser();
    if (!user) {
      const error = new Error('No session');
      error.code = 'auth/no-current-user';
      throw error;
    }
    return user;
  };

  /**
   * New permanent account. A guest is linked (same UID → same profile), then
   * signed in again: adding a password revokes the guest's earlier tokens.
   * A verification email is sent (standard Firebase email).
   */
  function signUpWithEmail(email, password, { marketingConsent } = {}) {
    return runFlow(async () => {
      const current = fb.currentUser();
      if (current?.isAnonymous) {
        await fb.linkWithEmail(current, email, password);
        await fb.signInWithEmail(email, password);
      } else {
        await fb.createUserWithEmail(email, password);
      }
      try {
        await fb.sendEmailVerification(requireUser());
      } catch {
        // The account exists; the email can be sent again from /compte.
      }
    }, optInBody(marketingConsent));
  }

  /** Existing account with email + password (replaces the guest session). */
  function signInWithEmail(email, password) {
    return runFlow(() => fb.signInWithEmail(email, password));
  }

  /**
   * Google. A guest is linked; if this Google account already has its own
   * Firebase account, nothing is switched yet: the caller gets
   * `{ conflict }` and must ask for confirmation (guest data is not moved).
   */
  async function continueWithGoogle({ marketingConsent } = {}) {
    const syncBody = optInBody(marketingConsent);
    const current = fb.currentUser();
    if (!current?.isAnonymous) {
      return runFlow(() => fb.signInWithGoogle(), syncBody);
    }
    try {
      await runFlow(() => fb.linkWithGoogle(current), syncBody);
      return { linked: true };
    } catch (error) {
      if (error?.code === 'auth/credential-already-in-use') {
        const credential = fb.credentialFromError(error);
        if (credential) return { conflict: { credential } };
      }
      throw error;
    }
  }

  /**
   * Switch to the existing Google account. The sign-up checkbox goes along
   * (the visitor ticked it for this sign-up); the server applies it at most
   * once per address and never after an unsubscribe.
   */
  function confirmExistingGoogle(credential, { marketingConsent } = {}) {
    return runFlow(
      () => fb.signInWithCredential(credential),
      optInBody(marketingConsent)
    );
  }

  function sendPasswordReset(email) {
    return fb.sendPasswordResetEmail(email);
  }

  function resendVerification() {
    return fb.sendEmailVerification(requireUser());
  }

  /** "I clicked the link": reload the user, refresh the token, sync. */
  async function refreshVerification() {
    const user = requireUser();
    await fb.reloadUser(user);
    await user.getIdToken(true);
    set({ user: toUser(user) });
    return syncProfile(user, { force: true });
  }

  /**
   * Authenticated call for the current user (bookings, admin, profile…).
   * Documented session errors end the session as for the sync; everything
   * else is returned to the caller, never retried here (writes are not
   * repeated behind the user's back).
   */
  async function api(path, options = {}) {
    const user = fb?.currentUser();
    if (!user) throw new ApiError(401, 'AUTH_REQUIRED');
    try {
      return await request(user, path, options);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === 'SESSION_REVOKED' ||
          error.code === 'ACCOUNT_DISABLED') &&
        currentUid() === user.uid
      ) {
        set({
          notice:
            error.code === 'SESSION_REVOKED'
              ? 'session_revoked'
              : 'account_disabled',
        });
        await signOut();
      }
      throw error;
    }
  }

  /** Loaded profile view of the current user, or null. */
  const currentProfile = () =>
    state.profile.uid === currentUid() ? state.profile.data : null;

  /** A fresh profile view from the API, kept only if the user is unchanged. */
  function applyProfileView(uid, view) {
    if (currentUid() !== uid) return;
    set({ profile: { uid, status: 'ready', data: view, error: null } });
  }

  /** PATCH /api/me — own `name` and `phone` only (null clears a field). */
  async function updateProfile(changes) {
    const uid = currentUid();
    const view = await api('/api/me', { method: 'PATCH', body: changes });
    applyProfileView(uid, view);
    return view;
  }

  /**
   * POST /api/me/marketing/subscription — the signed-in user's own address
   * (from the token; nothing in the body but the consent version). A
   * verified email is active at once and the answer carries `marketing`.
   */
  async function subscribeMarketing(consentTextVersion) {
    const uid = currentUid();
    const result = await api('/api/me/marketing/subscription', {
      method: 'POST',
      body: { consentTextVersion },
    });
    if (result?.marketing && currentUid() === uid) {
      const view = currentProfile();
      if (view) applyProfileView(uid, { ...view, marketing: result.marketing });
    }
    return result;
  }

  /** DELETE /api/me/marketing/subscription — returns the profile view. */
  async function unsubscribeMarketing() {
    const uid = currentUid();
    const view = await api('/api/me/marketing/subscription', {
      method: 'DELETE',
    });
    applyProfileView(uid, view);
    return view;
  }

  /**
   * Email change through Firebase (`verifyBeforeUpdateEmail`): a link goes
   * to the new address; the profile gets it with the next sync after the
   * user signs in again.
   */
  function changeEmail(newEmail) {
    return fb.verifyBeforeUpdateEmail(requireUser(), newEmail);
  }

  return {
    start,
    retry,
    signOut,
    signUpWithEmail,
    signInWithEmail,
    continueWithGoogle,
    confirmExistingGoogle,
    sendPasswordReset,
    resendVerification,
    refreshVerification,
    api,
    updateProfile,
    subscribeMarketing,
    unsubscribeMarketing,
    changeEmail,
    clearNotice: () => set({ notice: null }),
    clearOptIn: () => set({ optIn: null }),
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
