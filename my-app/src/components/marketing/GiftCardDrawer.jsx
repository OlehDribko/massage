'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/components/auth/AuthProvider';
import MaskIcon from '@/components/ui/MaskIcon';
import { BUSINESS } from '@/config/site';
import { currentProfile } from '@/lib/auth/session';
import { formatPrice } from '@/lib/format';
import {
  CONTACT_CHANNELS,
  MAX_DESCRIPTION,
  channelLabel,
  descriptionError,
  giftCardErrorMessage,
  giftReadinessSteps,
  keepsIdempotencyKey,
  parseEuroAmount,
  requestBody,
} from '@/lib/giftCards';

export const GIFT_CARD_HASH = '#carte-cadeau';
const RETURN_TO = `/${GIFT_CARD_HASH}`;

const LABEL =
  'font-montserrat text-label-sm font-medium tracking-[0.08em] text-gray-200 uppercase';
const INPUT =
  'font-montserrat text-body text-base-white focus:border-primary-200 w-full border-b bg-transparent py-2 tracking-[0.01em] placeholder:text-gray-900 focus:outline-none';

function FieldError({ id, children }) {
  return children ? (
    <p id={id} className="font-montserrat text-body-sm text-error pt-1">
      {children}
    </p>
  ) : null;
}

/** Light action on the dark panel (links of the readiness steps). */
function DarkLink({ href, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-pill font-montserrat text-label hover:border-primary-200 hover:text-primary-200 focus-visible:outline-primary-200 inline-flex min-h-11 w-fit items-center border border-white/30 px-5 font-medium tracking-[0.05em] text-gray-50 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
    </Link>
  );
}

const SUBMIT =
  'rounded-pill bg-primary-200 font-montserrat hover:shadow-button-hover focus-visible:outline-primary-200 min-h-[54px] px-10 text-[14px] font-medium tracking-[0.05em] text-[#131212] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60';

/** What is missing before a request can be sent, with the way to fix it. */
export function Readiness({ blockers, onLeave }) {
  // A guest first signs in; the other steps follow on the account page.
  const guest = blockers.includes('anonymous_session');
  const steps = giftReadinessSteps(guest ? ['anonymous_session'] : blockers, {
    returnTo: RETURN_TO,
  });
  return (
    <div className="flex flex-col gap-6">
      <p className="font-montserrat text-body text-gray-100">
        La demande se fait depuis votre compte client : nous utilisons votre
        nom, votre e-mail et votre téléphone pour vous recontacter.
        {guest
          ? ' Il vous faudra une adresse e-mail confirmée, votre nom et un numéro de téléphone.'
          : ''}
      </p>
      <ul className="flex flex-col gap-5">
        {steps.map((step) => (
          <li key={step.blocker} className="flex flex-col gap-3">
            <p className="font-montserrat text-body text-gray-50">
              {step.text}
            </p>
            {step.href ? (
              <DarkLink href={step.href} onClick={onLeave}>
                {step.action}
              </DarkLink>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Contacts of the profile, shown for information only (never sent). */
function ProfileContacts({ profile, onLeave }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4">
      <p className={LABEL}>Nous vous contacterons à</p>
      <dl className="font-montserrat text-body-sm grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-gray-100">
        <dt className="text-gray-800">Nom</dt>
        <dd className="break-words text-gray-50">{profile.name}</dd>
        <dt className="text-gray-800">E-mail</dt>
        <dd className="break-all text-gray-50">{profile.email}</dd>
        <dt className="text-gray-800">Téléphone</dt>
        <dd className="text-gray-50">{profile.phone}</dd>
      </dl>
      <Link
        href={`/compte?retour=${encodeURIComponent(RETURN_TO)}#profil`}
        onClick={onLeave}
        className="font-montserrat text-body-sm text-primary-200 hover:text-primary-100 w-fit underline underline-offset-4"
      >
        Modifier mon profil
      </Link>
    </div>
  );
}

/**
 * The request form (docs/frontend-handoff.md §5): amount in euros, an
 * optional message and the preferred way to be contacted. Contacts come
 * from the profile and are not sent. One Idempotency-Key per request the
 * visitor decided to send: an unknown outcome (network, 5xx, busy) is
 * retried with the same key and body, so the studio never gets it twice.
 */
export function RequestForm({
  controller,
  profile,
  onSent,
  onBlocked,
  onLeave,
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState('');
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [pending, setPending] = useState(false);
  const intent = useRef(null); // { fingerprint, key }
  const busyRef = useRef(false);
  const ids = {
    amount: useId(),
    description: useId(),
    channel: useId(),
  };

  const keyFor = (body) => {
    const fingerprint = JSON.stringify(body);
    if (intent.current?.fingerprint !== fingerprint) {
      intent.current = { fingerprint, key: crypto.randomUUID() };
    }
    return intent.current.key;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    const parsed = parseEuroAmount(amount);
    const found = {
      amount: parsed.error ?? null,
      description: descriptionError(description),
      channel: channel
        ? null
        : 'Choisissez comment vous préférez être contacté.',
    };
    setErrors(found);
    const first = ['amount', 'description', 'channel'].find((f) => found[f]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }

    const body = requestBody({
      amountCents: parsed.cents,
      description,
      channel,
    });
    busyRef.current = true;
    setPending(true);
    setFailure(null);
    try {
      const { giftCardRequest } = await controller.api(
        '/api/gift-card-requests',
        {
          method: 'POST',
          headers: { 'Idempotency-Key': keyFor(body) },
          body,
        }
      );
      intent.current = null;
      onSent(giftCardRequest);
      return;
    } catch (caught) {
      if (!keepsIdempotencyKey(caught)) intent.current = null;
      if (caught?.code === 'GIFT_CARD_REQUEST_NOT_READY') {
        onBlocked(caught.details?.blockers ?? []);
        controller.retry(); // refresh the profile and its readiness
      } else {
        setFailure(caught);
      }
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  const retryable = failure && keepsIdempotencyKey(failure);

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-10">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-0.5">
          <label htmlFor={ids.amount} className={LABEL}>
            Montant de la carte *
          </label>
          <div className="relative">
            <input
              id={ids.amount}
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="80"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                if (errors.amount) setErrors((e) => ({ ...e, amount: null }));
              }}
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={`${ids.amount}-hint${errors.amount ? ` ${ids.amount}-error` : ''}`}
              className={`${INPUT} pr-8 ${errors.amount ? 'border-error' : 'border-white/20'}`}
            />
            <span
              aria-hidden
              className="font-montserrat text-body absolute top-2 right-0 text-gray-200"
            >
              €
            </span>
          </div>
          <p
            id={`${ids.amount}-hint`}
            className="font-montserrat pt-1 text-xs text-gray-800"
          >
            Montant libre en euros, par exemple 80 ou 120,50.
          </p>
          <FieldError id={`${ids.amount}-error`}>{errors.amount}</FieldError>
        </div>

        <div className="flex flex-col gap-0.5">
          <label htmlFor={ids.description} className={LABEL}>
            Message — facultatif
          </label>
          <textarea
            id={ids.description}
            name="description"
            rows={3}
            maxLength={MAX_DESCRIPTION}
            placeholder="Pour l’anniversaire de ma sœur, un massage relaxant…"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (errors.description) {
                setErrors((e) => ({ ...e, description: null }));
              }
            }}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={
              errors.description ? `${ids.description}-error` : undefined
            }
            className={`${INPUT} resize-y ${errors.description ? 'border-error' : 'border-white/20'}`}
          />
          <p className="font-montserrat pt-1 text-right text-xs text-gray-800">
            {description.length} / {MAX_DESCRIPTION}
          </p>
          <FieldError id={`${ids.description}-error`}>
            {errors.description}
          </FieldError>
        </div>

        <fieldset
          className="flex flex-col gap-3"
          aria-describedby={errors.channel ? `${ids.channel}-error` : undefined}
        >
          <legend className={`${LABEL} mb-3`}>
            Comment préférez-vous être contacté ? *
          </legend>
          <div className="flex flex-wrap gap-2">
            {CONTACT_CHANNELS.map((option, index) => (
              <label
                key={option.value}
                className={`rounded-pill font-montserrat text-body-sm has-focus-visible:outline-primary-200 flex min-h-11 cursor-pointer items-center border px-5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 ${
                  channel === option.value
                    ? 'border-primary-200 bg-primary-200 text-[#131212]'
                    : 'border-white/25 text-gray-50 hover:border-white/60'
                }`}
              >
                <input
                  id={index === 0 ? ids.channel : undefined}
                  type="radio"
                  name="channel"
                  value={option.value}
                  checked={channel === option.value}
                  onChange={() => {
                    setChannel(option.value);
                    if (errors.channel) {
                      setErrors((e) => ({ ...e, channel: null }));
                    }
                  }}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          <FieldError id={`${ids.channel}-error`}>{errors.channel}</FieldError>
        </fieldset>

        <ProfileContacts profile={profile} onLeave={onLeave} />
      </div>

      <div className="flex flex-col gap-4">
        <div role="alert">
          {failure ? (
            <p className="font-montserrat text-body-sm text-error">
              {giftCardErrorMessage(failure)}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={SUBMIT}
        >
          {pending
            ? 'Envoi…'
            : retryable
              ? 'Réessayer l’envoi'
              : 'Envoyer la demande'}
        </button>
        <p className="font-montserrat text-xs text-gray-800">
          Pas de paiement en ligne : la praticienne vous recontacte pour
          convenir du règlement et de la remise de la carte.
        </p>
      </div>
    </form>
  );
}

/** Acknowledgement: the request is recorded — not paid, not issued. */
export function Sent({ request, onAgain }) {
  return (
    <div role="status" className="flex flex-col gap-6">
      <p className="font-faustina text-2xl text-gray-50">
        Demande n° {request.number} envoyée.
      </p>
      <p className="font-montserrat text-body text-gray-100">
        Nous vous contacterons pour la suite. La carte cadeau n’est ni réglée ni
        émise à ce stade : le règlement et la remise se font avec la
        praticienne.
      </p>
      <dl className="font-montserrat text-body-sm grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 rounded-2xl border border-white/10 p-4 text-gray-100">
        <dt className="text-gray-800">Montant</dt>
        <dd className="text-gray-50">{formatPrice(request.amountCents)}</dd>
        <dt className="text-gray-800">Contact</dt>
        <dd className="text-gray-50">
          {channelLabel(request.preferredContactChannel)}
        </dd>
        {request.description ? (
          <>
            <dt className="text-gray-800">Message</dt>
            <dd className="break-words whitespace-pre-line text-gray-50">
              {request.description}
            </dd>
          </>
        ) : null}
      </dl>
      <button
        type="button"
        onClick={onAgain}
        className="font-montserrat text-body-sm text-primary-200 self-start underline underline-offset-4"
      >
        Faire une autre demande
      </button>
    </div>
  );
}

/**
 * Figma «Carte cadeau — modal» (797:1821, mobile 799:1916): a dark panel on
 * the right (full screen on phones). The content follows the backend
 * contract (docs/gift-card-requests.md): only a registered client with a
 * verified email, a name and a phone may send a request; the studio
 * handles it by hand (no online payment, no card code, no WhatsApp
 * integration). Guests and incomplete accounts see what is missing.
 *
 * Opens from any link to #carte-cadeau and when the address carries that
 * hash (also after coming back from sign-in or the profile); native
 * <dialog>: focus stays inside, Escape and the backdrop close it.
 */
export default function GiftCardDrawer() {
  const dialogRef = useRef(null);
  const pathname = usePathname();
  const { enabled, controller, state, status } = useAuth();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(null);
  const [blocked, setBlocked] = useState(null);
  const leavingRef = useRef(false);
  const titleId = useId();
  const leave = () => {
    leavingRef.current = true;
    setOpen(false);
  };

  // Links to #carte-cadeau open the panel (captured before smooth-scroll
  // libraries try to scroll to a missing anchor).
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.('a[href$="#carte-cadeau"]');
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // The hash in the address opens it: on arrival and after a client-side
  // navigation back here (sign-in / profile `retour`).
  useEffect(() => {
    const check = () => {
      if (window.location.hash === GIFT_CARD_HASH) setOpen(true);
    };
    const frame = requestAnimationFrame(check);
    window.addEventListener('hashchange', check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', check);
    };
  }, [pathname]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) leavingRef.current = false;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    setOpen(false);
    // Leaving through a link (sign-in, profile): the navigation replaces
    // the address itself; touching history now would cancel it.
    if (leavingRef.current) return;
    if (window.location.hash === GIFT_CARD_HASH) {
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search
      );
    }
  };

  const view = currentProfile(state);
  const readiness = view?.bookingReadiness ?? null;
  // A server refusal wins until the profile says the account is ready.
  const blockers = readiness?.ready ? null : (blocked ?? readiness?.blockers);

  let content;
  if (!enabled || status === 'unavailable') {
    content = (
      <p className="font-montserrat text-body text-gray-100">
        La demande en ligne est momentanément indisponible. Contactez-nous
        directement (coordonnées ci-dessous).
      </p>
    );
  } else if (sent) {
    content = <Sent request={sent} onAgain={() => setSent(null)} />;
  } else if (status === 'guest') {
    content = (
      <Readiness
        blockers={readiness?.blockers ?? ['anonymous_session']}
        onLeave={leave}
      />
    );
  } else if (!view) {
    content =
      state.profile.status === 'error' ? (
        <div className="flex flex-col gap-4">
          <p className="font-montserrat text-body text-gray-100">
            Votre profil n’a pas pu être chargé.
          </p>
          <button
            type="button"
            onClick={() => controller.retry()}
            className="font-montserrat text-body-sm text-primary-200 self-start underline underline-offset-4"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <p role="status" className="font-montserrat text-body text-gray-100">
          Chargement de votre compte…
        </p>
      );
  } else if (blockers?.length) {
    content = <Readiness blockers={blockers} onLeave={leave} />;
  } else {
    content = (
      <RequestForm
        controller={controller}
        profile={view.profile}
        onSent={(request) => {
          setBlocked(null);
          setSent(request);
        }}
        onBlocked={setBlocked}
        onLeave={leave}
      />
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={close}
      onClick={(event) => {
        // A click on the backdrop (outside the panel) closes it.
        if (event.target === dialogRef.current) close();
      }}
      className="gift-drawer bg-secondary-900 m-0 ml-auto h-dvh max-h-none w-full max-w-none p-0 text-gray-100 backdrop:bg-[rgba(28,25,20,0.6)] sm:w-[545px]"
    >
      <div className="relative flex min-h-full flex-col justify-between gap-12 px-4 pt-24 pb-10 sm:px-12 sm:pt-24 sm:pb-12">
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="hover:text-base-white focus-visible:outline-primary-200 absolute top-6 right-4 flex size-11 items-center justify-center text-gray-800 transition-colors focus-visible:outline-2 sm:top-10 sm:right-10"
        >
          <MaskIcon src="/icons/close-modal.svg" className="size-7" />
        </button>

        <div className="flex flex-col gap-[60px]">
          <div className="flex flex-col gap-4">
            <p className="font-montserrat text-third-200 flex items-center gap-4 text-[11px] font-medium tracking-[0.2em] uppercase">
              Carte cadeau
              <span aria-hidden className="bg-third-200 h-px w-[54px]" />
            </p>
            <h2
              id={titleId}
              className="font-faustina text-[32px] leading-[1.15] text-gray-50 sm:text-[36px]"
            >
              Offrir une carte cadeau
            </h2>
            <p className="font-montserrat text-body-sm text-gray-100">
              Choisissez le montant, laissez un message si vous le souhaitez :
              notre praticienne vous contactera pour l’achat. Vous pouvez aussi
              nous joindre directement.
            </p>
          </div>

          {content}
        </div>

        <div className="flex flex-col gap-5 border-t border-white/10 pt-5">
          <p className="font-montserrat text-xs tracking-[0.01em] text-gray-800 uppercase">
            Ou directement
          </p>
          <div className="flex flex-col gap-2">
            <p className="font-montserrat text-primary-200 flex flex-wrap gap-x-6 gap-y-1 text-base">
              <a
                href={`tel:${BUSINESS.phone.e164}`}
                className="hover:text-primary-100"
              >
                {BUSINESS.phone.display}
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="hover:text-primary-100 break-all"
              >
                {BUSINESS.email}
              </a>
            </p>
            <p className="font-montserrat text-primary-200 flex gap-5 text-sm">
              <a
                href={BUSINESS.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-100 underline underline-offset-4"
              >
                Instagram
              </a>
              <a
                href={BUSINESS.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-100 underline underline-offset-4"
              >
                Facebook
              </a>
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
