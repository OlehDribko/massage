/*
 * Public configuration of sign-in: the Firebase web app and the booking API.
 * None of these values is a secret (they ship in every browser bundle); the
 * Firebase Admin key stays on the backend. Staging and production use
 * different Firebase projects and API URLs — see .env.example.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so each one is read with a
 * literal `process.env.NAME`.
 */

const FIREBASE_ENV = {
  apiKey: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  ],
  authDomain: [
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  ],
  projectId: [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  ],
  appId: [
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ],
};

// The ID token is sent to the API, so only HTTPS is accepted — except a
// backend running on this machine during development.
function resolveApiBaseUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    const allowed =
      url.protocol === 'https:' ||
      (url.protocol === 'http:' &&
        local &&
        process.env.NODE_ENV === 'development');
    if (!allowed) {
      console.warn(
        `[auth] NEXT_PUBLIC_API_BASE_URL ignored (not https): ${value}`
      );
      return null;
    }
    return url.origin;
  } catch {
    console.warn(
      `[auth] NEXT_PUBLIC_API_BASE_URL is not a valid URL: ${value}`
    );
    return null;
  }
}

const firebaseEntries = Object.entries(FIREBASE_ENV);

/** Names of the variables that are missing (empty list when complete). */
export const AUTH_MISSING_ENV = [
  ...firebaseEntries
    .filter(([, [, value]]) => !value)
    .map(([, [name]]) => name),
  ...(resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)
    ? []
    : ['NEXT_PUBLIC_API_BASE_URL']),
];

/** Firebase web app options, or null while any of them is missing. */
export const FIREBASE_OPTIONS = firebaseEntries.every(([, [, value]]) => value)
  ? Object.fromEntries(firebaseEntries.map(([key, [, value]]) => [key, value]))
  : null;

/** Booking API origin, e.g. "https://api.example.fr", or null. */
export const API_BASE_URL = resolveApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL
);

/**
 * Firebase Auth Emulator ("127.0.0.1:9099") for local runs and browser
 * tests only: honoured in development builds and for a local host, ignored
 * (with a warning) anywhere else, so a production build can never talk to
 * an emulator. Use it with a `demo-*` project id.
 */
function resolveAuthEmulator(value) {
  if (!value) return null;
  const local = /^(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(value);
  if (!local || process.env.NODE_ENV !== 'development') {
    console.warn(`[auth] NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ignored: ${value}`);
    return null;
  }
  return `http://${value}`;
}

export const FIREBASE_AUTH_EMULATOR_URL = resolveAuthEmulator(
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST
);

/** Sign-in works only when both Firebase and the API are configured. */
export const AUTH_ENABLED = AUTH_MISSING_ENV.length === 0;

export const AUTH_ROUTES = {
  signIn: '/connexion',
  account: '/compte',
};
