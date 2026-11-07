'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';

import MaskIcon from '@/components/ui/MaskIcon';

/**
 * Account element of the header. Purely presentational: it never reads the
 * session itself, so it cannot become a second source of auth state.
 *
 * `account` (omit it while the site has no auth — nothing is rendered):
 *   status      'loading'     session not restored yet → neutral «Espace
 *                             personnel» link (same size, server-rendered)
 *               'guest'       anonymous visitor        → «Se connecter»
 *               'member'      permanent account        → «Mon compte» menu
 *               'admin'       role confirmed by server → menu + admin link
 *               'unavailable' auth/profile failed      → retry if supported
 *   user        { name?, email? } — only data confirmed by the backend
 *   signInHref, accountHref, bookingsHref, adminHref — hidden when absent
 *   onSignOut   real sign-out (returns a promise); onRetry — one manual retry
 *
 * Hiding the admin link is not access control: admin routes must be checked
 * on the server.
 */

// Secondary control, deliberately quieter than the gold «Prendre
// rendez-vous»: a thin outlined pill in sentence case. Below 1024 px a round
// 44 px button (label kept for screen readers; the mobile menu repeats it
// with text). From 1024 px icon + label in a fixed width — sized for the
// longest label, «Espace personnel» — so no state change moves the header.
const slot =
  'relative flex size-11 shrink-0 items-center justify-center lg:h-12 lg:w-[12.5rem]';

const tones = {
  overlay:
    'border-white/35 text-on-dark hover:border-on-dark focus-visible:outline-on-dark',
  solid:
    'border-black/15 text-third-900 hover:border-third-900 focus-visible:outline-third-900',
};

function Label({ children }) {
  return (
    <span className="sr-only lg:not-sr-only lg:whitespace-nowrap">
      {children}
    </span>
  );
}

function Avatar({ name }) {
  const initial = name?.trim().charAt(0).toUpperCase();

  if (!initial) {
    return <MaskIcon src="/icons/person.svg" className="size-6" />;
  }

  return (
    <span
      aria-hidden
      className="bg-third-200 text-on-dark flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] leading-none font-semibold"
    >
      {initial}
    </span>
  );
}

function AccountMenu({ account, triggerClasses }) {
  const [open, setOpen] = useState(false);
  const [signOutState, setSignOutState] = useState('idle');
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const {
    user = {},
    status,
    accountHref,
    bookingsHref,
    adminHref,
    onSignOut,
  } = account;

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  const close = ({ restoreFocus = false } = {}) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const handleSignOut = async () => {
    setSignOutState('pending');
    try {
      await onSignOut();
      setSignOutState('idle');
      setOpen(false);
    } catch {
      setSignOutState('error');
    }
  };

  const itemClasses =
    'font-montserrat flex w-full items-center gap-3 px-4 py-3 text-left text-[16px] tracking-[0.16px] text-gray-50 transition-colors hover:bg-white/5 hover:text-third-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gray-50 motion-reduce:transition-none';

  return (
    <div
      ref={wrapperRef}
      className={slot}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          close({ restoreFocus: true });
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={triggerClasses}
      >
        <Avatar name={user.name} />
        <Label>Mon compte</Label>
      </button>

      {/* Always rendered so aria-controls points to an existing element. */}
      <div
        id={panelId}
        hidden={!open}
        className="rounded-card bg-secondary-900 absolute top-full left-0 z-10 mt-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden border border-white/15 py-2 shadow-xl sm:right-0 sm:left-auto"
      >
        {user.name || user.email ? (
          <div className="border-b border-white/15 px-4 pt-2 pb-4">
            {user.name ? (
              <p className="font-montserrat truncate text-[16px] font-medium text-gray-50">
                {user.name}
              </p>
            ) : null}
            {user.email ? (
              <p className="font-montserrat truncate text-[14px] text-gray-100">
                {user.email}
              </p>
            ) : null}
          </div>
        ) : null}

        <ul className="pt-2">
          {accountHref ? (
            <li>
              <Link
                href={accountHref}
                onClick={() => close()}
                className={itemClasses}
              >
                <MaskIcon src="/icons/person.svg" className="size-6" />
                Mon compte
              </Link>
            </li>
          ) : null}
          {bookingsHref ? (
            <li>
              <Link
                href={bookingsHref}
                onClick={() => close()}
                className={itemClasses}
              >
                <span aria-hidden className="size-6" />
                Mes réservations
              </Link>
            </li>
          ) : null}
          {status === 'admin' && adminHref ? (
            <li>
              <Link
                href={adminHref}
                onClick={() => close()}
                className={itemClasses}
              >
                <span aria-hidden className="size-6" />
                Administration
              </Link>
            </li>
          ) : null}
          {onSignOut ? (
            <li>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signOutState === 'pending'}
                aria-busy={signOutState === 'pending'}
                className={`${itemClasses} disabled:opacity-60`}
              >
                <MaskIcon src="/icons/logout.svg" className="size-6" />
                Se déconnecter
              </button>
            </li>
          ) : null}
        </ul>

        {signOutState === 'error' ? (
          <p
            role="alert"
            className="font-montserrat text-third-100 px-4 pt-1 pb-2 text-[14px]"
          >
            La déconnexion a échoué. Veuillez réessayer.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function AccountControl({ account, variant = 'overlay' }) {
  if (!account) return null;

  const triggerClasses = `rounded-pill font-montserrat text-label inline-flex size-11 items-center justify-center gap-2 border font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none lg:h-12 lg:w-full lg:px-3.5 ${tones[variant]}`;
  const { status } = account;

  if (status === 'member' || status === 'admin') {
    return <AccountMenu account={account} triggerClasses={triggerClasses} />;
  }

  if (status === 'guest' && account.signInHref) {
    return (
      <div className={slot}>
        <Link href={account.signInHref} className={triggerClasses}>
          <MaskIcon src="/icons/person.svg" className="size-6" />
          <Label>Se connecter</Label>
        </Link>
      </div>
    );
  }

  if (status === 'unavailable' && account.onRetry) {
    return (
      <div className={slot}>
        <button
          type="button"
          onClick={account.onRetry}
          className={triggerClasses}
          aria-label="Connexion indisponible, réessayer"
        >
          <MaskIcon src="/icons/person.svg" className="size-6 opacity-60" />
          <span aria-hidden className="hidden lg:inline">
            Réessayer
          </span>
        </button>
      </div>
    );
  }

  // 'loading' — the server HTML and the moment before Firebase has restored
  // the session. Both entries are rendered; the last known state
  // (<html data-account>, lib/auth/accountHint.js) shows the right one from
  // the first paint, so the label does not change once the session is
  // known. Default without a hint: «Se connecter».
  if (status === 'loading') {
    return (
      <div className={slot}>
        <Link
          href={account.signInHref ?? account.accountHref ?? '/compte'}
          className={`account-hint-guest ${triggerClasses}`}
        >
          <MaskIcon src="/icons/person.svg" className="size-6" />
          <Label>Se connecter</Label>
        </Link>
        <Link
          href={account.accountHref ?? '/compte'}
          className={`account-hint-member ${triggerClasses}`}
        >
          <MaskIcon src="/icons/person.svg" className="size-6" />
          <Label>Mon compte</Label>
        </Link>
      </div>
    );
  }

  // Unavailable without a retry: a neutral entry that claims nothing.
  return (
    <div className={slot}>
      <Link href={account.accountHref ?? '/compte'} className={triggerClasses}>
        <MaskIcon src="/icons/person.svg" className="size-6" />
        <Label>Espace personnel</Label>
      </Link>
    </div>
  );
}
