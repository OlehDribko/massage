'use client';

import { useEffect, useRef, useState } from 'react';

import ProfileForm from '@/components/account/ProfileForm';
import SignInPanel from '@/components/auth/SignInPanel';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { authErrorMessage } from '@/lib/auth/session';
import { SIGN_IN_PROVIDERS } from '@/lib/booking/labels';

// A focus/visibility check of the email link at most this often.
const AUTO_CHECK_MS = 5000;

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden
      className="size-3.5"
    >
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

/** One step of the list: done (summary), active (open) or waiting. */
function Step({ number, state, title, summary, action, children }) {
  const active = state === 'active';
  return (
    <li
      aria-current={active ? 'step' : undefined}
      className={`rounded-panel flex flex-col gap-5 bg-white ${
        active
          ? 'border-third-900 border-2 p-5 sm:p-7'
          : 'border border-black/10 px-5 py-4 sm:px-7'
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            state === 'done'
              ? 'bg-secondary-100 text-third-900'
              : active
                ? 'bg-third-900 text-cream'
                : 'border border-gray-100 text-gray-800'
          }`}
        >
          {state === 'done' ? <CheckIcon /> : number}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3
            className={`font-montserrat text-body font-semibold ${state === 'waiting' ? 'text-gray-800' : 'text-gray-900'}`}
          >
            {title}
            {state === 'done' ? (
              <span className="sr-only"> (terminé)</span>
            ) : null}
          </h3>
          {summary ? (
            <p className="font-montserrat text-body-sm break-words text-gray-800">
              {summary}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {active ? children : null}
    </li>
  );
}

/** "Un lien vous attend…" + automatic re-check when the visitor comes back. */
function EmailVerification({ controller, email }) {
  const [pending, setPending] = useState(null); // 'refresh' | 'resend'
  const [message, setMessage] = useState(null);
  const lastCheck = useRef(0);
  const busyRef = useRef(false);

  const run = async (kind, task, { silent = false } = {}) => {
    if (busyRef.current) return;
    busyRef.current = true;
    if (!silent) {
      setPending(kind);
      setMessage(null);
    }
    try {
      await task();
    } catch (error) {
      if (!silent) {
        setMessage({ tone: 'error', text: authErrorMessage(error) });
      }
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };

  // The link opens in another tab: check again when this tab is back.
  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastCheck.current < AUTO_CHECK_MS) return;
      lastCheck.current = Date.now();
      run('refresh', () => controller.refreshVerification(), { silent: true });
    };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [controller]);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-montserrat text-body text-gray-800">
        Un lien de confirmation a été envoyé à{' '}
        <span className="font-medium break-all text-gray-900">{email}</span>.
        Ouvrez-le, puis revenez ici : cette page se met à jour toute seule.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PillButton
          size="sm"
          onClick={() =>
            run('refresh', async () => {
              await controller.refreshVerification();
            })
          }
          disabled={pending !== null}
          aria-busy={pending === 'refresh'}
          className="disabled:opacity-60"
        >
          {pending === 'refresh' ? 'Vérification…' : 'J’ai confirmé'}
        </PillButton>
        <PillButton
          variant="text"
          tone="primary"
          onClick={() =>
            run('resend', async () => {
              await controller.resendVerification();
              setMessage({
                tone: 'info',
                text: 'E-mail de confirmation renvoyé.',
              });
            })
          }
          disabled={pending !== null}
          className="text-third-900 self-start disabled:opacity-60 sm:self-auto"
        >
          {pending === 'resend' ? 'Envoi…' : 'Renvoyer l’e-mail'}
        </PillButton>
      </div>
      <div role="status">
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      </div>
    </div>
  );
}

/**
 * Step 3 of the booking, on the booking page itself: only what the server
 * says is missing (`bookingReadiness.blockers`, never a local rule), in the
 * documented order — account, then name and phone, then the email link.
 * The chosen time stays on the page; sign-in comes back to `returnTo`.
 */
export default function BookingReadiness({
  blockers,
  view,
  controller,
  returnTo,
}) {
  const missing = new Set(blockers);
  const profile = view?.profile ?? null;

  if (missing.has('not_a_client')) {
    return (
      <Notice>
        Un compte administrateur ne peut pas réserver pour lui-même.
        Connectez-vous avec un compte client.
      </Notice>
    );
  }

  const needsAccount = missing.has('anonymous_session') || !profile;
  const needsDetails =
    missing.has('name_missing') || missing.has('phone_missing');
  const needsEmail = missing.has('email_not_verified');

  const accountState = needsAccount ? 'active' : 'done';
  const detailsState = needsDetails
    ? needsAccount
      ? 'waiting'
      : 'active'
    : needsAccount
      ? 'waiting'
      : 'done';
  const emailState = needsEmail
    ? needsAccount || needsDetails
      ? 'waiting'
      : 'active'
    : needsAccount
      ? 'waiting'
      : 'done';

  const provider = profile?.signInProvider
    ? SIGN_IN_PROVIDERS[profile.signInProvider]
    : null;

  return (
    <ol className="flex flex-col gap-4">
      <Step
        number={1}
        state={accountState}
        title="Compte"
        summary={
          needsAccount
            ? 'Pour reporter ou annuler en ligne, votre rendez-vous est lié à un compte.'
            : [profile.email, provider].filter(Boolean).join(' · ')
        }
      >
        <SignInPanel returnTo={returnTo} embedded />
      </Step>

      <Step
        number={2}
        state={detailsState}
        title="Vos coordonnées"
        summary={
          detailsState === 'done'
            ? [profile.name, profile.phone].filter(Boolean).join(' · ')
            : 'Pour vous joindre en cas d’imprévu concernant le rendez-vous.'
        }
      >
        {profile ? (
          <ProfileForm
            profile={profile}
            onSave={(changes) => controller.updateProfile(changes)}
            submitLabel="Enregistrer et continuer"
          />
        ) : null}
      </Step>

      <Step
        number={3}
        state={emailState}
        title="Confirmer votre e-mail"
        summary={
          emailState === 'done'
            ? 'Adresse confirmée'
            : emailState === 'waiting'
              ? 'Un lien vous sera envoyé par e-mail.'
              : null
        }
      >
        {profile ? (
          <EmailVerification controller={controller} email={profile.email} />
        ) : null}
      </Step>
    </ol>
  );
}
