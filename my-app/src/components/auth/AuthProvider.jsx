'use client';

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';

import { API_BASE_URL, AUTH_ENABLED, FIREBASE_OPTIONS } from '@/config/auth';
import { createAuthController } from '@/lib/auth/controller';
import { loadFirebase, preloadFirebaseSdk } from '@/lib/auth/firebase';
import { accountStatus } from '@/lib/auth/session';

// Browser only: fetch the SDK while the page hydrates (async, non-blocking);
// the session itself still starts after hydration.
if (AUTH_ENABLED && typeof window !== 'undefined') {
  preloadFirebaseSdk().catch(() => {
    // A failed download is reported by the controller when it starts.
  });
}

// One controller per browser page, shared by every component and kept across
// client-side navigation. Never created on the server.
let browserController = null;

function getController() {
  if (!AUTH_ENABLED || typeof window === 'undefined') return null;
  if (!browserController) {
    browserController = createAuthController({
      loadFirebase: () => loadFirebase(FIREBASE_OPTIONS),
      apiBaseUrl: API_BASE_URL,
    });
  }
  return browserController;
}

// Same object on the server and during hydration: nothing about the session
// is known yet, so the server HTML never claims a signed-in state.
const INITIAL_STATE = {
  phase: 'idle',
  error: null,
  sessionKnown: false,
  user: null,
  profile: { uid: null, status: 'idle', data: null, error: null },
  notice: null,
};
const noop = () => () => {};

const AuthContext = createContext(null);

/**
 * Wraps the page without making it a client tree: server components passed
 * as children stay server-rendered. The session starts after hydration and
 * never delays the page.
 */
export default function AuthProvider({ children }) {
  const controller = getController();

  useEffect(() => {
    controller?.start();
  }, [controller]);

  return (
    <AuthContext.Provider value={controller}>{children}</AuthContext.Provider>
  );
}

/**
 * Session snapshot for the UI.
 * `enabled` is false while the Firebase/API configuration is missing.
 */
export function useAuth() {
  const controller = useContext(AuthContext);
  const state = useSyncExternalStore(
    controller ? controller.subscribe : noop,
    controller ? controller.getSnapshot : () => INITIAL_STATE,
    () => INITIAL_STATE
  );

  return {
    enabled: AUTH_ENABLED,
    controller,
    state,
    status: AUTH_ENABLED ? accountStatus(state) : 'unavailable',
  };
}
