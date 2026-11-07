/*
 * Pure session logic shared by the auth controller and the UI: how the
 * header status is derived, return-URL checks, French messages.
 * No React, no Firebase, relative imports only — tested with `node --test`.
 */

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
    if (url.pathname === '/connexion') return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Error raised by the API client: HTTP status, the documented `code` and the
 * documented extra fields of the error body (`blockers`, `reason`,
 * `conflicts`, `errors`, …) in `details`.
 */
export class ApiError extends Error {
  constructor(status, code, retryAfterSeconds, details = {}) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.details = details;
  }
}

/**
 * One API call. With `getToken`, the Firebase ID token goes in the
 * Authorization header (the only documented transport) and on
 * TOKEN_EXPIRED / INVALID_TOKEN it is force-refreshed and the call repeated
 * once. Without `getToken` the call is public. Extra `headers` (e.g.
 * Idempotency-Key) are sent unchanged on the repeat.
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
}) {
  const send = async (forceRefresh) => {
    const token = getToken ? await getToken(forceRefresh) : null;
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
        signal,
      });
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      // Offline, DNS, CORS: the browser hides the reason.
      throw new ApiError(0, 'NETWORK_ERROR');
    }

    if (response.ok) {
      return response.status === 204 ? null : response.json();
    }

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      // Gateway errors may have no JSON body.
    }
    const header = Number(response.headers.get('Retry-After'));
    const retryAfter =
      typeof payload.retryAfterSeconds === 'number'
        ? payload.retryAfterSeconds
        : Number.isFinite(header) && header > 0
          ? header
          : undefined;
    // The English `message` is for logs only; the UI maps `code` to French.
    const { code, ...details } = payload ?? {};
    delete details.message;
    throw new ApiError(
      response.status,
      typeof code === 'string' ? code : `HTTP_${response.status}`,
      retryAfter,
      details
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
  'auth/invalid-credential': 'Adresse e-mail ou mot de passe incorrect.',
  'auth/invalid-login-credentials': 'Adresse e-mail ou mot de passe incorrect.',
  'auth/wrong-password': 'Adresse e-mail ou mot de passe incorrect.',
  'auth/user-not-found': 'Adresse e-mail ou mot de passe incorrect.',
  'auth/invalid-email': 'Adresse e-mail invalide.',
  'auth/missing-email': 'Indiquez votre adresse e-mail.',
  'auth/missing-password': 'Indiquez votre mot de passe.',
  'auth/weak-password': 'Mot de passe trop court : 6 caractères minimum.',
  'auth/password-does-not-meet-requirements':
    'Ce mot de passe ne respecte pas les règles de sécurité.',
  'auth/email-already-in-use':
    'Un compte existe déjà avec cette adresse. Connectez-vous à ce compte.',
  'auth/credential-already-in-use':
    'Ces identifiants sont déjà utilisés par un autre compte. Connectez-vous à ce compte.',
  'auth/account-exists-with-different-credential':
    'Un compte existe déjà avec cette adresse. Connectez-vous avec votre e-mail et votre mot de passe.',
  'auth/user-disabled': 'Ce compte est désactivé.',
  'auth/too-many-requests':
    'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
  'auth/network-request-failed':
    'Connexion impossible. Vérifiez votre accès à Internet et réessayez.',
  'auth/popup-blocked':
    'La fenêtre Google a été bloquée par le navigateur. Autorisez les fenêtres pop-up pour ce site et réessayez.',
  'auth/unauthorized-domain':
    'La connexion n’est pas autorisée sur ce domaine pour le moment.',
  'auth/operation-not-allowed':
    'Ce mode de connexion n’est pas disponible pour le moment.',
  'auth/admin-restricted-operation':
    'Ce mode de connexion n’est pas disponible pour le moment.',
  'auth/requires-recent-login':
    'Pour des raisons de sécurité, reconnectez-vous puis réessayez.',
};

const DEFAULT_MESSAGE =
  'Une erreur est survenue. Réessayez dans quelques instants.';

/** Codes that mean "the user closed the popup": nothing to show. */
export const SILENT_AUTH_ERRORS = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);

export function authErrorMessage(error) {
  return FIREBASE_MESSAGES[error?.code] ?? DEFAULT_MESSAGE;
}

/** French message for a failed profile sync (ApiError codes). */
export function profileErrorMessage(error) {
  switch (error?.code) {
    case 'AUTH_UNAVAILABLE':
      return 'Le service de compte est momentanément indisponible.';
    case 'NETWORK_ERROR':
      return 'Impossible de joindre le service de compte. Vérifiez votre connexion.';
    case 'NOT_CONFIGURED':
      return 'Le service de compte n’est pas encore configuré.';
    default:
      return 'Votre profil n’a pas pu être chargé.';
  }
}
