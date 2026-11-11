'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/components/auth/AuthProvider';
import BookingReadiness from '@/components/booking/BookingReadiness';
import BookingSteps from '@/components/booking/BookingSteps';
import PriceTag from '@/components/booking/PriceTag';
import SlotPicker from '@/components/booking/SlotPicker';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { currentProfile } from '@/lib/auth/session';
import { bookingErrorMessage, isRetryable } from '@/lib/booking/labels';
import {
  formatDuration,
  formatLocalDate,
  formatMonthShort,
  formatTime,
  localDateOf,
} from '@/lib/format';

const DETAILS_STEP = 'coordonnees';

/** "mar. 24 nov." — fits the mobile bar. */
function shortDate(startsAt) {
  const date = localDateOf(startsAt);
  const weekday = formatLocalDate(date, { weekday: 'short' }).split(' ')[0];
  return `${weekday} ${Number(date.slice(8))} ${formatMonthShort(date)}`;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="text-primary-300 mt-0.5 size-4 shrink-0"
    >
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

/** Calendar tile + "Mardi · 10:45–11:45" for the chosen start. */
function SlotSummary({ startsAt, durationMinutes }) {
  const date = localDateOf(startsAt);
  const end = new Date(Date.parse(startsAt) + durationMinutes * 60_000);
  const label = formatLocalDate(date, { weekday: 'long' });
  return (
    <div className="bg-secondary-50 flex items-center gap-4 rounded-2xl p-4">
      <div className="bg-third-900 text-cream flex h-[3.75rem] w-14 shrink-0 flex-col items-center justify-center rounded-xl">
        <span className="text-primary-100 text-[0.6875rem] tracking-wider uppercase">
          {formatMonthShort(date)}
        </span>
        <span className="font-faustina text-2xl leading-none">
          {Number(date.slice(8))}
        </span>
      </div>
      <p className="font-montserrat text-body font-semibold text-gray-900 first-letter:uppercase">
        {label}
        <span className="block font-normal text-gray-800">
          {formatTime(startsAt)} – {formatTime(end)}
        </span>
      </p>
    </div>
  );
}

/**
 * Steps 2 and 3 of the booking (docs/booking.md §5–6), on one page:
 * - step 2: pick a time (public availability);
 * - step 3: only what `bookingReadiness.blockers` says is missing, inline
 *   (account, name and phone, email link). Sign-in comes back here with the
 *   chosen time (`?creneau=`) and the step (`?etape=coordonnees`);
 * - one Idempotency-Key per intent (service + time): a retry after a network
 *   error or CALENDAR_BUSY reuses it, so the server never books twice; a new
 *   choice gets a new key;
 * - price and end are decided by the server; the booking is confirmed at
 *   once, then the confirmation page is shown.
 */
export default function BookingPanel({ service, intro }) {
  const { enabled, controller, state, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slot, setSlot] = useState(() => {
    const startsAt = searchParams.get('creneau');
    return startsAt && !Number.isNaN(Date.parse(startsAt))
      ? { startsAt }
      : null;
  });
  const [stage, setStage] = useState(() =>
    slot && searchParams.get('etape') === DETAILS_STEP ? 'details' : 'time'
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const intent = useRef(null); // { serviceId, startsAt, key }
  const busyRef = useRef(false);
  const topRef = useRef(null);

  const view = currentProfile(state);
  const blockers = view?.bookingReadiness?.blockers ?? null;
  const base = `/reserver/${service.id}`;
  const returnTo = slot
    ? `${base}?creneau=${encodeURIComponent(slot.startsAt)}&etape=${DETAILS_STEP}`
    : base;

  const goTo = (next) => {
    setStage(next);
    setError(null);
    topRef.current?.scrollIntoView({ block: 'start' });
    topRef.current?.focus({ preventScroll: true });
  };

  const choose = (next) => {
    setSlot(next);
    setError(null);
  };

  // One key per intent (this service + this time), kept with its body.
  const keyFor = (startsAt) => {
    if (
      intent.current?.startsAt !== startsAt ||
      intent.current?.serviceId !== service.id
    ) {
      intent.current = {
        serviceId: service.id,
        startsAt,
        key: crypto.randomUUID(),
      };
    }
    return intent.current.key;
  };

  const book = async () => {
    if (!slot || busyRef.current) return;
    busyRef.current = true;
    setPending(true);
    setError(null);
    try {
      const { booking } = await controller.api('/api/bookings', {
        method: 'POST',
        headers: { 'Idempotency-Key': keyFor(slot.startsAt) },
        body: { serviceId: service.id, startsAt: slot.startsAt },
      });
      router.push(`/compte/reservations/${booking.id}?confirmee=1`);
      return; // keep the button disabled while leaving
    } catch (caught) {
      setError(caught);
      if (caught?.code === 'SLOT_UNAVAILABLE') {
        // Back to the times, refreshed; the message stays above them.
        setSlot(null);
        setStage('time');
        setRefreshKey((value) => value + 1);
      }
      if (caught?.code === 'BOOKING_NOT_READY') controller.retry();
      // Unknown outcome (network, timeout, 5xx, CALENDAR_BUSY): the same
      // key and body on the next try, so the server never books twice.
      // A definite refusal ends this intent: the next try is a new one.
      if (!isRetryable(caught)) intent.current = null;
    }
    busyRef.current = false;
    setPending(false);
  };

  // What the account allows, from the server profile only.
  let account; // 'off' | 'unavailable' | 'error' | 'loading' | 'ready' | 'missing'
  if (!enabled) account = 'off';
  else if (status === 'unavailable') account = 'unavailable';
  else if (
    blockers === null &&
    status !== 'guest' &&
    state.profile.status === 'error'
  ) {
    account = 'error'; // permanent account whose profile did not load
  } else if (
    status === 'loading' ||
    (blockers === null && status !== 'guest')
  ) {
    account = 'loading';
  } else if (blockers === null || blockers.length) account = 'missing';
  else account = 'ready';
  // A guest whose profile did not load yet: the documented first step.
  const missing = blockers ?? ['anonymous_session'];

  const confirmButton = ({
    className = '',
    size = 'md',
    label = 'Confirmer la réservation',
  } = {}) => (
    <PillButton
      onClick={book}
      size={size}
      disabled={!slot || pending || error?.code === 'SERVICE_NOT_BOOKABLE'}
      aria-busy={pending}
      className={`disabled:opacity-60 ${className || 'w-full'}`}
    >
      {pending
        ? 'Réservation…'
        : error && isRetryable(error)
          ? 'Réessayer'
          : label}
    </PillButton>
  );

  // The main action of the current stage (aside and mobile bar).
  let action = null;
  if (account === 'off') {
    action = (
      <Notice>
        La réservation en ligne n’est pas encore disponible. Vous pouvez
        réserver par la page de rendez-vous.
      </Notice>
    );
  } else if (account === 'unavailable' || account === 'error') {
    action = (
      <div className="flex flex-col gap-3">
        <Notice tone="error">
          {account === 'unavailable'
            ? 'Le service de connexion est momentanément indisponible.'
            : 'Votre profil n’a pas pu être chargé.'}
        </Notice>
        <PillButton
          variant="outline"
          tone="dark"
          onClick={() => controller.retry()}
          className="w-full"
        >
          Réessayer
        </PillButton>
      </div>
    );
  } else if (!slot) {
    action = (
      <button
        type="button"
        disabled
        className="rounded-pill font-montserrat text-label bg-secondary-100 min-h-[54px] w-full font-medium text-gray-800 uppercase"
      >
        Choisissez un horaire
      </button>
    );
  } else if (account === 'ready') {
    action = confirmButton();
  } else if (stage === 'time') {
    action = (
      <PillButton
        onClick={() => goTo('details')}
        disabled={account === 'loading'}
        className="w-full disabled:opacity-60"
      >
        Continuer
      </PillButton>
    );
  } else {
    action = (
      <p className="font-montserrat text-body-sm text-gray-800">
        {account === 'loading'
          ? 'Chargement de votre compte…'
          : 'Complétez les étapes ci-contre pour confirmer.'}
      </p>
    );
  }

  // Mobile: the summary and the next action stay at hand at the bottom.
  const showMobileBar =
    Boolean(slot) &&
    (account === 'ready' ||
      (stage === 'time' && (account === 'missing' || account === 'loading')));
  const errorNotice = error ? (
    <div role="alert">
      <Notice tone="error">{bookingErrorMessage(error)}</Notice>
    </div>
  ) : null;

  return (
    <div
      className={`flex flex-col gap-8 ${showMobileBar ? 'pb-28 xl:pb-0' : ''}`}
    >
      <div
        ref={topRef}
        tabIndex={-1}
        className="scroll-mt-6 focus:outline-none"
      >
        <BookingSteps
          current={stage === 'details' ? 3 : 2}
          links={['/reserver']}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start xl:gap-10">
        <div className="flex min-w-0 flex-col gap-6">
          {stage === 'time' ? (
            <>
              {intro}
              {errorNotice}
              <SlotPicker
                serviceId={service.id}
                value={slot?.startsAt}
                onChange={choose}
                refreshKey={refreshKey}
              />
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => goTo('time')}
                  className="font-montserrat text-body-sm hover:text-third-200 focus-visible:outline-third-200 flex min-h-11 items-center gap-1.5 self-start text-gray-800 underline-offset-4 hover:underline focus-visible:outline-2"
                >
                  ← Changer d’horaire
                </button>
                <h2 className="text-section-title text-third-900">
                  {account === 'ready' ? (
                    <>
                      Tout est <span className="heading-accent">prêt</span>
                    </>
                  ) : (
                    <>
                      Encore{' '}
                      <span className="heading-accent">
                        quelques informations
                      </span>
                    </>
                  )}
                </h2>
              </div>
              {errorNotice}
              {account === 'missing' ? (
                <BookingReadiness
                  blockers={missing}
                  view={view}
                  controller={controller}
                  returnTo={returnTo}
                />
              ) : account === 'ready' ? (
                <div className="rounded-panel flex flex-col gap-4 border border-black/10 bg-white p-6">
                  <p className="font-montserrat text-body text-gray-800">
                    Vérifiez le récapitulatif puis confirmez : le rendez-vous
                    est enregistré immédiatement.
                  </p>
                  {confirmButton({ className: 'w-full sm:w-fit' })}
                </div>
              ) : (
                <p
                  role="status"
                  className="font-montserrat text-body text-gray-800"
                >
                  Chargement de votre compte…
                </p>
              )}
            </>
          )}
        </div>

        <aside
          aria-label="Votre réservation"
          className="rounded-panel flex flex-col gap-5 border border-black/10 bg-white p-6 xl:sticky xl:top-6 xl:p-7"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight font-medium">
              Votre réservation
            </h2>
            {stage === 'details' ? (
              <button
                type="button"
                onClick={() => goTo('time')}
                className="font-montserrat text-body-sm text-third-900 hover:text-third-200 focus-visible:outline-third-200 min-h-11 font-medium underline underline-offset-4 focus-visible:outline-2"
              >
                Modifier
              </button>
            ) : null}
          </div>

          <div aria-live="polite">
            {slot ? (
              <SlotSummary
                startsAt={slot.startsAt}
                durationMinutes={service.durationMinutes}
              />
            ) : (
              <p className="bg-secondary-50 font-montserrat text-body-sm rounded-2xl p-4 text-gray-800">
                Aucun horaire choisi
              </p>
            )}
          </div>

          <dl className="font-montserrat text-body flex flex-col gap-3">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-800">Soin</dt>
              <dd className="text-right text-gray-900">
                {service.name} · {formatDuration(service.durationMinutes)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-black/10 pt-3">
              <dt className="text-gray-800">À régler sur place</dt>
              <dd className="font-faustina text-third-900 text-[1.625rem]">
                <PriceTag service={service} />
              </dd>
            </div>
          </dl>

          {action}

          <ul className="font-montserrat text-body-sm flex flex-col gap-2 text-gray-900">
            <li className="flex gap-2.5">
              <CheckIcon />
              Confirmation immédiate, sans acompte
            </li>
            <li className="flex gap-2.5">
              <CheckIcon />
              Report en ligne jusqu’à 12 h avant
            </li>
            <li className="flex gap-2.5">
              <CheckIcon />
              Annulation en ligne jusqu’au rendez-vous
            </li>
          </ul>
        </aside>
      </div>

      {showMobileBar ? (
        <div className="z-header fixed inset-x-0 bottom-0 flex items-center gap-3 border-t border-black/10 bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(26,15,8,0.06)] xl:hidden">
          <p className="font-montserrat text-body-sm min-w-0 flex-1 text-gray-900">
            <span className="block font-semibold first-letter:uppercase">
              {shortDate(slot.startsAt)} · {formatTime(slot.startsAt)}
            </span>
            <span className="block text-gray-800">
              {formatDuration(service.durationMinutes)} ·{' '}
              <PriceTag service={service} />
            </span>
          </p>
          <div className="shrink-0">
            {account === 'ready' ? (
              confirmButton({
                size: 'sm',
                className: 'w-auto',
                label: 'Confirmer',
              })
            ) : (
              <PillButton
                onClick={() => goTo('details')}
                disabled={account === 'loading'}
                size="sm"
                className="disabled:opacity-60"
              >
                Continuer
              </PillButton>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
