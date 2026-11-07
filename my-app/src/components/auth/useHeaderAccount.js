'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/components/auth/AuthProvider';
import { AUTH_ROUTES } from '@/config/auth';
import { rememberAccountHint } from '@/lib/auth/accountHint';
import { currentProfile } from '@/lib/auth/session';

/** `account` prop of AccountControl, derived from the shared session. */
export function useHeaderAccount() {
  const { enabled, controller, state, status } = useAuth();
  const pathname = usePathname();

  // Keep the first-paint label of the next visit in line with the session.
  useEffect(() => {
    if (enabled) rememberAccountHint(status);
  }, [enabled, status]);

  // Sign-in not configured: the neutral entry still leads to /compte, which
  // explains that the client area is not available yet.
  if (!enabled) {
    return { status: 'unavailable', accountHref: AUTH_ROUTES.account };
  }

  const profile = currentProfile(state)?.profile;
  const onSignInPage = pathname === AUTH_ROUTES.signIn;
  const returnTo =
    pathname && pathname !== '/'
      ? `?retour=${encodeURIComponent(pathname)}`
      : '';

  return {
    status,
    // Name and email only from the backend profile of the current user.
    user: profile
      ? { name: profile.name ?? undefined, email: profile.email ?? undefined }
      : {},
    signInHref: onSignInPage ? undefined : `${AUTH_ROUTES.signIn}${returnTo}`,
    accountHref: AUTH_ROUTES.account,
    bookingsHref: '/compte/reservations',
    // Shown only for the role confirmed by the backend profile; the API
    // checks every admin request itself.
    adminHref: status === 'admin' ? '/admin' : undefined,
    onSignOut: () => controller.signOut(),
    // Retry only where something failed; never automatic from here.
    onRetry: () => controller.retry(),
  };
}
