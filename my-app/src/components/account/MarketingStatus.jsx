'use client';

import { useEffect, useId, useRef, useState } from 'react';

import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { MARKETING_CONSENT } from '@/config/marketing';
import {
  marketingErrorMessage,
  ownSubscriptionResult,
  subscriptionState,
  waitText,
} from '@/lib/marketing';

const STATE_TEXT = {
  none: 'Vous n’êtes pas inscrit·e à la newsletter.',
  pending:
    'Inscription en attente : ouvrez le lien de confirmation reçu par e-mail.',
  subscribed: 'Vous êtes inscrit·e à la newsletter.',
};

/**
 * Newsletter in the account (docs/frontend-handoff.md §4): a checkbox with
 * the consent text, saved only with the explicit button.
 * - ticked + saved → POST /api/me/marketing/subscription (own address from
 *   the token): a verified email is active at once; an unverified one gets
 *   a confirmation link;
 * - unticked + saved → DELETE (works even when newsletters are off);
 * - pending → "send the email again", respecting `retryAfterSeconds`.
 * `available`: 'on' | 'off' | 'unknown' — subscribing is offered only when
 * the loaded profile says 'on'.
 */
export default function MarketingStatus({
  marketing,
  available,
  emailVerified,
  onSubscribe,
  onUnsubscribe,
}) {
  const state = subscriptionState(marketing);
  const wanted = state === 'subscribed' || state === 'pending';
  // null = follow the saved state; a boolean = an unsaved change.
  const [draft, setDraft] = useState(null);
  const checked = draft ?? wanted;
  const [pending, setPending] = useState(null); // 'save' | 'resend'
  const [message, setMessage] = useState(null); // { tone, text }
  // Seconds the server asked to wait before "send again" (null = free).
  const [wait, setWait] = useState(null);
  const busyRef = useRef(false);
  const ids = { box: useId(), consent: useId() };

  // Re-enable "send again" once the server's delay is over (no API calls).
  useEffect(() => {
    if (!wait) return undefined;
    const timer = setTimeout(() => setWait(null), wait * 1000);
    return () => clearTimeout(timer);
  }, [wait]);
  const waiting = wait !== null;

  const run = async (kind, task) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(kind);
    setMessage(null);
    try {
      await task();
      setDraft(null);
    } catch (error) {
      if (error?.retryAfterSeconds) {
        setWait(error.retryAfterSeconds);
      }
      setMessage({ tone: 'error', text: marketingErrorMessage(error) });
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };

  const subscribe = (kind) =>
    run(kind, async () => {
      const result = await onSubscribe(MARKETING_CONSENT.version);
      const shown = ownSubscriptionResult(result);
      if (shown.retryAfterSeconds) {
        setWait(shown.retryAfterSeconds);
      }
      setMessage({
        tone: shown.tone === 'success' ? 'success' : 'info',
        text: shown.text,
      });
    });

  const unsubscribe = () =>
    run('save', async () => {
      await onUnsubscribe();
      setMessage({
        tone: 'success',
        text: 'Vous êtes désinscrit·e. Les e-mails liés à vos rendez-vous ne sont pas concernés.',
      });
    });

  const save = (event) => {
    event.preventDefault();
    if (checked === wanted) return;
    if (checked) subscribe('save');
    else unsubscribe();
  };

  const canSubscribe = available === 'on';
  // Unsubscribing needs a verified email (403 EMAIL_NOT_VERIFIED otherwise).
  const canUnsubscribe = wanted && emailVerified;
  const showForm = canSubscribe || canUnsubscribe;

  return (
    <div className="flex flex-col gap-5">
      <p className="font-montserrat text-body text-gray-900">
        {state
          ? STATE_TEXT[state]
          : 'Le statut de la newsletter s’affiche une fois votre adresse e-mail confirmée.'}
      </p>

      {available === 'off' && !wanted ? (
        <p className="font-montserrat text-body-sm text-gray-800">
          L’inscription à la newsletter n’est pas encore ouverte.
        </p>
      ) : null}

      {showForm ? (
        <form noValidate onSubmit={save} className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <input
              id={ids.box}
              type="checkbox"
              checked={checked}
              disabled={
                pending !== null ||
                (!checked && !canSubscribe) ||
                (checked && wanted && !canUnsubscribe)
              }
              onChange={(event) => {
                setDraft(
                  event.target.checked === wanted ? null : event.target.checked
                );
                setMessage(null);
              }}
              aria-describedby={ids.consent}
              className="accent-third-200 mt-1 size-5 shrink-0"
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor={ids.box}
                className="font-montserrat text-body font-medium text-gray-900"
              >
                Recevoir la newsletter du cabinet
              </label>
              <p
                id={ids.consent}
                className="font-montserrat text-body-sm text-gray-800"
              >
                {MARKETING_CONSENT.text}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <PillButton
              type="submit"
              size="sm"
              disabled={checked === wanted || pending !== null}
              aria-busy={pending === 'save'}
              className="disabled:opacity-60"
            >
              {pending === 'save' ? 'Enregistrement…' : 'Enregistrer'}
            </PillButton>
            {state === 'pending' && canSubscribe ? (
              <PillButton
                variant="text"
                onClick={() => subscribe('resend')}
                disabled={pending !== null || waiting}
                aria-busy={pending === 'resend'}
                className="self-start disabled:opacity-50 sm:self-auto"
              >
                {pending === 'resend'
                  ? 'Envoi…'
                  : 'Renvoyer l’e-mail de confirmation'}
              </PillButton>
            ) : null}
          </div>
          {waiting && state === 'pending' ? (
            <p className="font-montserrat text-body-sm text-gray-800">
              Nouvel envoi possible {waitText(wait)}.
            </p>
          ) : null}
        </form>
      ) : null}

      <div role="status" aria-live="polite">
        {message ? (
          <Notice tone={message.tone === 'error' ? 'error' : undefined}>
            {message.text}
          </Notice>
        ) : null}
      </div>
    </div>
  );
}
