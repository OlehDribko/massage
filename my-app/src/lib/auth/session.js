/*
 * Pure session logic shared by the auth controller and the UI: how the
 * header status is derived, return-URL checks, French messages.
 * No React, no Firebase, relative imports only — tested with `node --test`.
 * Messages take an optional `t` (src/i18n, French by default).
 */

import { frenchT, msg } from '../../i18n/translate.js';

/**
 * Header/account status from the controller snapshot.
 * - known as soon as Firebase has restored the session: no permanent
 *   account → 'guest' (even while the anonymous session is being created);
 *   a permanent account → 'member' without waiting for the profile sync;
 * - 'admin' only from the backend profile of the CURRENT user, once synced
 *   (Firebase proves the account, not the role).
 */
export function accountStatus(state) {
  if (state.phase === 'error') return 'unavailable';
  if (state.user) {
    if (state.user.isAnonymous) return 'guest';
    const profile = currentProfile(state)?.profile;
    return profile?.authState === 'registered' && profile.role === 'admin'
      ? 'admin'
      : 'member';
  }
  return state.sessionKnown ? 'guest' : 'loading';
}

/** Backend profile view of the current user, or null (never another uid's). */
export function currentProfile(state) {
  const { user, profile } = state;
  if (!user || !profile || profile.uid !== user.uid || !profile.data) {
    return null;
  }
  return profile.data;
}

/**
 * Only same-site paths are accepted as a return target ("/compte",
 * "/#services"); anything else — other hosts, "//host", "/\\host",
 * schemes, the sign-in page itself — falls back to `fallback`.
 */
export function safeReturnPath(value, fallback = '/') {
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
  // Control characters and backslashes: browsers may normalise them away.
  if ([...value].some((char) => char < ' ' || char === '\\')) return fallback;

  try {
    const base = 'https://site.invalid';
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    // The sign-in page, in any language ("/connexion", "/en/connexion").
    if (/^(?:\/(?:en|uk|ru|fr))?\/connexion\/?$/.test(url.pathname)) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Error raised by the API client: HTTP status, the documented `code` and the
 * documented extra fields of the error body (`blockers`, `reason`,
 * `conflicts`, `errors`, …) in `details`. Failures that are not an HTTP
 * answer have status 0 and their own code:
 * - `TIMEOUT` — no answer within `timeoutMs` (outcome unknown);
 * - `NETWORK_ERROR` — offline, DNS, CORS (outcome unknown);
 * - `INVALID_RESPONSE` — a 2xx answer that is not JSON or misses a field
 *   the site relies on (status is the HTTP status; `details.field` is the
 *   path, never the value);
 * - `NOT_CONFIGURED` — no API URL in this build.
 * `requestId` is the server's `X-Request-Id` when the answer had one;
 * `method` and `route` (path template, no query) are for diagnostics.
 */
export class ApiError extends Error {
  constructor(status, code, retryAfterSeconds, details = {}, meta = {}) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.details = details;
    this.requestId = meta.requestId ?? null;
    this.method = meta.method ?? null;
    this.route = meta.route ?? null;
  }
}

/** Kind of failure, for messages and logs. */
export function errorKind(error) {
  if (!(error instanceof ApiError)) return 'unknown';
  switch (error.code) {
    case 'TIMEOUT':
      return 'timeout';
    case 'NETWORK_ERROR':
      return 'network';
    case 'INVALID_RESPONSE':
      return 'invalid_response';
    case 'NOT_CONFIGURED':
      return 'not_configured';
    default:
      return 'http';
  }
}

/** Default limit for one API call (a slow API must not hang the UI). */
export const DEFAULT_TIMEOUT_MS = 15_000;

/** "/api/services/abc/availability?from=…" → "/api/services/abc/availability". */
const withoutQuery = (path) => path.split(/[?#]/, 1)[0];

/**
 * One API call. With `getToken`, the Firebase ID token goes in the
 * Authorization header (the only documented transport) and on
 * TOKEN_EXPIRED / INVALID_TOKEN it is force-refreshed and the call repeated
 * once. Without `getToken` the call is public. Extra `headers` (e.g.
 * Idempotency-Key) are sent unchanged on the repeat.
 *
 * - `validate(body)` checks a 2xx JSON body: it returns null when the body
 *   is usable, or `{ path }` of the first bad field (→ INVALID_RESPONSE);
 * - `route` is the path template for diagnostics ("/api/services/{serviceId}");
 * - `timeoutMs` bounds the whole call; the caller's `signal` still cancels
 *   it (that AbortError is passed through, not turned into an ApiError).
 */
export async function apiRequest({
  baseUrl,
  path,
  method = 'GET',
  body,
  headers = {},
  getToken,
  fetchImpl = fetch,
  signal,
  validate,
  route = withoutQuery(path),
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const meta = { method, route };

  const send = async (forceRefresh) => {
    const token = getToken ? await getToken(forceRefresh) : null;
    const timeout = AbortSignal.timeout(timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    // A timeout (or the caller's abort) can hit the request or the body.
    const failure = (error) => {
      if (signal?.aborted) throw error;
      if (timeout.aborted)
        return new ApiError(0, 'TIMEOUT', undefined, {}, meta);
      return null;
    };

    let response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
        signal: combined,
      });
    } catch (error) {
      throw (
        failure(error) ??
        // Offline, DNS, CORS: the browser hides the reason.
        new ApiError(0, 'NETWORK_ERROR', undefined, {}, meta)
      );
    }

    const answered = {
      ...meta,
      requestId: response.headers?.get?.('X-Request-Id') ?? null,
    };

    if (response.ok) {
      if (response.status === 204) return null;
      let payload;
      try {
        payload = await response.json();
      } catch (error) {
        throw (
          failure(error) ??
          new ApiError(
            response.status,
            'INVALID_RESPONSE',
            undefined,
            { field: '(body)' },
            answered
          )
        );
      }
      const mismatch = validate ? validate(payload) : null;
      if (mismatch) {
        throw new ApiError(
          response.status,
          'INVALID_RESPONSE',
          undefined,
          { field: mismatch.path },
          answered
        );
      }
      return payload;
    }

    let payload = {};
    try {
      payload = (await response.json()) ?? {};
    } catch {
      // Gateway errors may have no JSON body.
    }
    if (typeof payload !== 'object' || Array.isArray(payload)) payload = {};
    const header = Number(response.headers?.get?.('Retry-After'));
    const retryAfter =
      typeof payload.retryAfterSeconds === 'number'
        ? payload.retryAfterSeconds
        : Number.isFinite(header) && header > 0
          ? header
          : undefined;
    // The English `message` is for logs only; the UI maps `code` to French.
    const { code, ...details } = payload;
    delete details.message;
    throw new ApiError(
      response.status,
      typeof code === 'string' ? code : `HTTP_${response.status}`,
      retryAfter,
      details,
      answered
    );
  };

  try {
    return await send(false);
  } catch (error) {
    if (
      getToken &&
      error instanceof ApiError &&
      (error.code === 'TOKEN_EXPIRED' || error.code === 'INVALID_TOKEN')
    ) {
      return send(true);
    }
    throw error;
  }
}

// Firebase Auth error codes → French messages for the sign-in form.
// Wrong email and wrong password share one message (no account enumeration).
const FIREBASE_MESSAGES = {
  'auth/invalid-credential': msg('Adresse e-mail ou mot de passe incorrect.'),
  'auth/invalid-login-credentials': msg(
    'Adresse e-mail ou mot de passe incorrect.'
  ),
  'auth/wrong-password': msg('Adresse e-mail ou mot de passe incorrect.'),
  'auth/user-not-found': msg('Adresse e-mail ou mot de passe incorrect.'),
  'auth/invalid-email': msg('Adresse e-mail invalide.'),
  'auth/missing-email': msg('Indiquez votre adresse e-mail.'),
  'auth/missing-password': msg('Indiquez votre mot de passe.'),
  'auth/weak-password': msg('Mot de passe trop court : 6 caractères minimum.'),
  'auth/password-does-not-meet-requirements': msg(
    'Ce mot de passe ne respecte pas les règles de sécurité.'
  ),
  'auth/email-already-in-use': msg(
    'Un compte existe déjà avec cette adresse. Connectez-vous à ce compte.'
  ),
  'auth/credential-already-in-use': msg(
    'Ces identifiants sont déjà utilisés par un autre compte. Connectez-vous à ce compte.'
  ),
  'auth/account-exists-with-different-credential': msg(
    'Un compte existe déjà avec cette adresse. Connectez-vous avec votre e-mail et votre mot de passe.'
  ),
  'auth/user-disabled': msg('Ce compte est désactivé.'),
  'auth/too-many-requests': msg(
    'Trop de tentatives. Patientez quelques minutes avant de réessayer.'
  ),
  'auth/network-request-failed': msg(
    'Connexion impossible. Vérifiez votre accès à Internet et réessayez.'
  ),
  'auth/popup-blocked': msg(
    'La fenêtre Google a été bloquée par le navigateur. Autorisez les fenêtres pop-up pour ce site et réessayez.'
  ),
  'auth/unauthorized-domain': msg(
    'La connexion n’est pas autorisée sur ce domaine pour le moment.'
  ),
  'auth/operation-not-allowed': msg(
    'Ce mode de connexion n’est pas disponible pour le moment.'
  ),
  'auth/admin-restricted-operation': msg(
    'Ce mode de connexion n’est pas disponible pour le moment.'
  ),
  'auth/requires-recent-login': msg(
    'Pour des raisons de sécurité, reconnectez-vous puis réessayez.'
  ),
};

const DEFAULT_MESSAGE = msg(
  'Une erreur est survenue. Réessayez dans quelques instants.'
);

/** Codes that mean "the user closed the popup": nothing to show. */
export const SILENT_AUTH_ERRORS = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);

export function authErrorMessage(error, t = frenchT) {
  return t(FIREBASE_MESSAGES[error?.code] ?? DEFAULT_MESSAGE);
}

/** French message for a failed profile sync (ApiError codes). */
export function profileErrorMessage(error, t = frenchT) {
  switch (error?.code) {
    case 'AUTH_UNAVAILABLE':
      return t('Le service de compte est momentanément indisponible.');
    case 'NETWORK_ERROR':
      return t(
        'Impossible de joindre le service de compte. Vérifiez votre connexion.'
      );
    case 'TIMEOUT':
      return t('Le service de compte met trop de temps à répondre.');
    case 'INVALID_RESPONSE':
      return t('Le service de compte a envoyé une réponse incomplète.');
    case 'NOT_CONFIGURED':
      return t('Le service de compte n’est pas encore configuré.');
    default:
      return t('Votre profil n’a pas pu être chargé.');
  }
}
