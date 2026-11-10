'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import AccountShell from '@/components/auth/AccountShell';
import { useAccountData } from '@/components/auth/useAccountData';
import BookingCard from '@/components/booking/BookingCard';
import { BookingHistory } from '@/components/booking/BookingSummary';
import BookingSteps from '@/components/booking/BookingSteps';
import BookingStatus from '@/components/booking/BookingStatus';
import SlotPicker from '@/components/booking/SlotPicker';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import GoogleLogo from '@/components/ui/GoogleLogo';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { BUSINESS, SITE } from '@/config/site';
import { currentProfile } from '@/lib/auth/session';
import {
  addressLine,
  directionsUrl,
  googleCalendarUrl,
} from '@/lib/booking/calendar';
import {
  bookingErrorMessage,
  cancelledByLabel,
  clientNotificationText,
} from '@/lib/booking/labels';
import { formatDateTime, formatLocalDate, localDateOf } from '@/lib/format';

const STUDIO = { name: SITE.name, address: BUSINESS.address };
// Moving is allowed only while more than 12 h remain (docs/booking.md §2).
const RESCHEDULE_NOTICE_MS = 12 * 60 * 60 * 1000;

function Icon({ path }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      className="text-primary-300 size-[22px] shrink-0"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  move: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  cancel: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6',
};

/**
 * "Ajouter à Google Agenda": opens a prefilled Google Calendar event in a
 * new tab (no file download). `size="sm"` for the detail actions row.
 */
function AddToCalendar({ booking, size = 'md' }) {
  const small = size === 'sm';
  return (
    <a
      href={googleCalendarUrl(booking, STUDIO)}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-pill font-montserrat focus-visible:outline-third-200 hover:border-third-200 flex items-center justify-center gap-3 border border-black/20 bg-white font-medium text-gray-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
        small ? 'text-body-sm min-h-11 px-5' : 'text-body min-h-[54px] px-7'
      }`}
    >
      <GoogleLogo className={small ? 'size-[18px]' : 'size-5'} />
      Ajouter à Google Agenda
      <span className="sr-only"> (nouvelle fenêtre)</span>
    </a>
  );
}

// Codes after which the booking itself may have changed: reload it.
const STALE = new Set([
  'SLOT_UNAVAILABLE',
  'RESCHEDULE_WINDOW_CLOSED',
  'CANCELLATION_WINDOW_CLOSED',
  'BOOKING_NOT_ACTIVE',
]);

function Detail({ bookingId, controller, enabled, firstName }) {
  const searchParams = useSearchParams();
  const justBooked = searchParams.get('confirmee') === '1';
  const { status, data, error, reload, replace } = useAccountData(
    `/api/bookings/${encodeURIComponent(bookingId)}`,
    { enabled }
  );
  const [moving, setMoving] = useState(false);
  const [newSlot, setNewSlot] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmMove, setConfirmMove] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [pending, setPending] = useState(null); // 'move' | 'cancel'
  const [actionError, setActionError] = useState(null);
  const [done, setDone] = useState(null); // text after a successful change
  const busyRef = useRef(false);

  if (status === 'loading' || status === 'idle') {
    return (
      <p role="status" className="font-montserrat text-body text-gray-800">
        Chargement du rendez-vous…
      </p>
    );
  }
  if (status === 'error') {
    const missing =
      error?.code === 'BOOKING_NOT_FOUND' || error?.status === 404;
    return (
      <div className="flex flex-col gap-4">
        <Notice tone="error">
          {missing ? 'Rendez-vous introuvable.' : bookingErrorMessage(error)}
        </Notice>
        {missing ? (
          <PillButton
            href="/compte/reservations"
            variant="outline"
            tone="dark"
            className="self-start"
          >
            Mes réservations
          </PillButton>
        ) : (
          <PillButton
            variant="outline"
            tone="dark"
            onClick={reload}
            className="self-start"
          >
            Réessayer
          </PillButton>
        )}
      </div>
    );
  }

  const booking = data.booking;
  const notification = clientNotificationText(booking.notification);

  // One write at a time; never repeated automatically.
  const write = async (kind, path, body, success) => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setPending(kind);
    setActionError(null);
    try {
      const result = await controller.api(path, { method: 'POST', body });
      replace({ booking: result.booking });
      setDone(success(result));
      return true;
    } catch (caught) {
      setActionError(caught);
      if (STALE.has(caught?.code)) {
        reload();
        setRefreshKey((value) => value + 1);
      }
      return false;
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };

  const move = async () => {
    const ok = await write(
      'move',
      `/api/bookings/${booking.id}/reschedule`,
      { startsAt: newSlot.startsAt },
      (result) =>
        result.changed
          ? `Rendez-vous déplacé au ${formatDateTime(result.booking.startsAt)}.`
          : 'Le rendez-vous est déjà à cet horaire.'
    );
    setConfirmMove(false);
    if (ok) {
      setMoving(false);
      setNewSlot(null);
    }
  };

  const cancel = async () => {
    const ok = await write(
      'cancel',
      `/api/bookings/${booking.id}/cancel`,
      {},
      () => 'Rendez-vous annulé.'
    );
    if (ok) setConfirmCancel(false);
  };

  const confirmation =
    justBooked &&
    booking.history.length === 1 &&
    booking.status === 'confirmed';
  const active = booking.status === 'confirmed' && booking.phase === 'upcoming';
  const moveDeadline = new Date(
    Date.parse(booking.startsAt) - RESCHEDULE_NOTICE_MS
  );
  const weekday = formatLocalDate(localDateOf(booking.startsAt)).split(' ')[0];

  const openMove = () => {
    setConfirmCancel(false);
    setActionError(null);
    setNewSlot(null);
    setMoving(true);
  };

  const facts = (
    <div className="grid gap-6 sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
      <div className="flex gap-3.5">
        <Icon path={ICONS.pin} />
        <div className="font-montserrat flex flex-col gap-1">
          <p className="text-body font-semibold text-gray-900">
            {addressLine(STUDIO.address)}
          </p>
          <a
            href={directionsUrl(STUDIO.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm text-third-900 hover:text-third-200 self-start underline underline-offset-4"
          >
            Itinéraire<span className="sr-only"> (nouvelle fenêtre)</span>
          </a>
        </div>
      </div>
      {active ? (
        <>
          <div className="flex gap-3.5">
            <Icon path={ICONS.move} />
            <div className="font-montserrat flex flex-col gap-1">
              <p className="text-body font-semibold text-gray-900">
                Report en ligne
              </p>
              <p className="text-body-sm text-gray-800">
                {booking.allowedActions.reschedule
                  ? `avant le ${formatDateTime(moveDeadline)}`
                  : 'n’est plus possible (moins de 12 h)'}
              </p>
            </div>
          </div>
          <div className="flex gap-3.5">
            <Icon path={ICONS.cancel} />
            <div className="font-montserrat flex flex-col gap-1">
              <p className="text-body font-semibold text-gray-900">
                Annulation en ligne
              </p>
              <p className="text-body-sm text-gray-800">
                jusqu’à l’heure du rendez-vous
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const actions =
    booking.allowedActions.reschedule || booking.allowedActions.cancel ? (
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {booking.allowedActions.reschedule ? (
          <PillButton
            size="sm"
            aria-expanded={moving}
            onClick={() => {
              if (moving) setMoving(false);
              else openMove();
            }}
          >
            {moving ? 'Fermer' : 'Déplacer'}
          </PillButton>
        ) : null}
        {booking.allowedActions.cancel ? (
          <PillButton
            variant="outline"
            tone="dark"
            size="sm"
            onClick={() => {
              setActionError(null);
              setConfirmCancel(true);
            }}
          >
            Annuler le rendez-vous
          </PillButton>
        ) : null}
        {active ? <AddToCalendar booking={booking} size="sm" /> : null}
      </div>
    ) : null;

  return (
    <div className="flex flex-col gap-8">
      <div role="status">{done ? <Notice>{done}</Notice> : null}</div>
      {actionError && !confirmMove && !confirmCancel ? (
        <div role="alert">
          <Notice tone="error">{bookingErrorMessage(actionError)}</Notice>
        </div>
      ) : null}

      {confirmation ? (
        <>
          <BookingSteps current={5} />
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="bg-primary-200 flex size-[4.5rem] items-center justify-center rounded-full">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden
                className="text-on-gold size-8"
              >
                <path d="M5 12l5 5 9-10" />
              </svg>
            </span>
            <h1 className="text-section-title text-third-900">
              À {weekday}
              {firstName ? (
                <>
                  , <span className="heading-accent">{firstName}</span>
                </>
              ) : null}
            </h1>
            <p className="font-montserrat text-body-lg max-w-xl text-gray-800">
              Votre rendez-vous est confirmé.{' '}
              {notification ?? 'Le règlement se fait sur place.'}
            </p>
          </div>
          <BookingCard booking={booking}>{facts}</BookingCard>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <AddToCalendar booking={booking} />
            <PillButton
              href={`/compte/reservations/${booking.id}`}
              variant="outline"
              tone="dark"
            >
              Gérer le rendez-vous
            </PillButton>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/compte/reservations"
              className="font-montserrat text-body-sm hover:text-third-200 flex min-h-11 items-center text-gray-800 underline-offset-4 hover:underline"
            >
              ← Mes réservations
            </Link>
            <BookingStatus phase={booking.phase} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
            <div className="flex min-w-0 flex-col gap-6">
              <BookingCard booking={booking}>
                <div className="flex flex-col gap-6">
                  {facts}
                  {actions ? (
                    <div className="border-t border-black/10 pt-6">
                      {actions}
                    </div>
                  ) : null}
                  {booking.cancellation ? (
                    <p className="font-montserrat text-body-sm text-gray-800">
                      Annulé {cancelledByLabel(booking.cancellation.by)} le{' '}
                      {formatDateTime(booking.cancellation.at)}
                      {booking.cancellation.reason
                        ? ` — motif : ${booking.cancellation.reason}`
                        : ''}
                    </p>
                  ) : null}
                  {notification ? (
                    <p className="font-montserrat text-body-sm text-gray-800">
                      {notification}
                    </p>
                  ) : null}
                </div>
              </BookingCard>

              {moving ? (
                <div className="flex flex-col gap-4">
                  <SlotPicker
                    serviceId={booking.service.id}
                    value={newSlot?.startsAt}
                    onChange={setNewSlot}
                    exclude={booking.startsAt}
                    refreshKey={refreshKey}
                    title="Choisissez un nouvel horaire"
                  />
                  <PillButton
                    onClick={() => {
                      setActionError(null);
                      setConfirmMove(true);
                    }}
                    disabled={!newSlot}
                    className="self-start disabled:opacity-60"
                  >
                    Choisir cet horaire
                  </PillButton>
                </div>
              ) : null}
            </div>

            <section
              aria-labelledby={`${booking.id}-history`}
              className="rounded-panel flex flex-col gap-4 border border-black/10 bg-white p-6"
            >
              <h2
                id={`${booking.id}-history`}
                className="font-montserrat text-label-sm font-semibold text-gray-800 uppercase"
              >
                Historique
              </h2>
              <BookingHistory history={booking.history} />
            </section>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmMove}
        title="Déplacer le rendez-vous ?"
        confirmLabel="Déplacer"
        pending={pending === 'move'}
        error={
          actionError && confirmMove ? bookingErrorMessage(actionError) : null
        }
        onConfirm={move}
        onClose={() => setConfirmMove(false)}
      >
        {newSlot ? (
          <>
            Nouvel horaire : {formatDateTime(newSlot.startsAt)}. La prestation
            et le tarif restent les mêmes.
          </>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmCancel}
        title="Annuler ce rendez-vous ?"
        confirmLabel="Oui, annuler"
        cancelLabel="Garder"
        secondaryLabel={
          booking.allowedActions.reschedule ? 'Plutôt déplacer' : undefined
        }
        onSecondary={openMove}
        pending={pending === 'cancel'}
        error={
          actionError && confirmCancel ? bookingErrorMessage(actionError) : null
        }
        onConfirm={cancel}
        onClose={() => setConfirmCancel(false)}
      >
        <span className="bg-secondary-50 mb-4 flex flex-col gap-1 rounded-2xl p-4">
          <span className="font-semibold text-gray-900 first-letter:uppercase">
            {formatDateTime(booking.startsAt)}
          </span>
          <span className="text-body-sm">{booking.service.name}</span>
        </span>
        L’horaire sera libéré pour quelqu’un d’autre. Cette action est
        définitive
        {booking.allowedActions.reschedule
          ? ' — vous pouvez aussi simplement le déplacer.'
          : '.'}
      </ConfirmDialog>
    </div>
  );
}

/** /compte/reservations/[id] — one own booking with its actions. */
export default function ClientBookingDetail({ bookingId }) {
  const searchParams = useSearchParams();
  // Right after booking, the page is the confirmation (its own h1, no tabs).
  const justBooked = searchParams.get('confirmee') === '1';
  return (
    <AccountShell
      title={
        justBooked ? null : (
          <>
            Mon <span className="heading-accent">rendez-vous</span>
          </>
        )
      }
      current={justBooked ? null : 'reservations'}
      returnTo={`/compte/reservations/${bookingId}`}
    >
      {({ controller, state, status }) => (
        <Detail
          bookingId={bookingId}
          controller={controller}
          enabled={status === 'member' || status === 'admin'}
          firstName={
            currentProfile(state)?.profile?.name?.trim().split(/\s+/)[0] ?? null
          }
        />
      )}
    </AccountShell>
  );
}
