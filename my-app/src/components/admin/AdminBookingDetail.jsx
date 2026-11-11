'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import { useAccountData } from '@/components/auth/useAccountData';
import BookingCard from '@/components/booking/BookingCard';
import BookingStatus from '@/components/booking/BookingStatus';
import { BookingHistory } from '@/components/booking/BookingSummary';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Notice from '@/components/ui/Notice';
import {
  ADMIN_NOTIFICATION_REASONS,
  ADMIN_NOTIFICATION_STATUS,
  NOTIFICATION_EVENTS,
  bookingErrorMessage,
} from '@/lib/booking/labels';
import { formatDateTime, localDateOf } from '@/lib/format';

const MAX_REASON = 500;

const MAIL_TONE = {
  accepted: 'bg-[#e6f2ea] text-[#1d6b3a]',
  failed: 'bg-error/10 text-error',
  interrupted: 'bg-error/10 text-error',
  skipped: 'bg-secondary-100 text-gray-800',
};

function MailResult({ who, result }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-body-sm text-gray-900">{who}</span>
      <span className="flex flex-col items-end gap-0.5 text-right">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${MAIL_TONE[result?.status] ?? 'bg-secondary-50 text-gray-900'}`}
        >
          {ADMIN_NOTIFICATION_STATUS[result?.status] ?? '—'}
        </span>
        {result?.reason || result?.attempts ? (
          <span className="text-xs text-gray-800">
            {[
              result.reason
                ? (ADMIN_NOTIFICATION_REASONS[result.reason] ??
                  ADMIN_NOTIFICATION_REASONS.other)
                : null,
              result.attempts
                ? `${result.attempts} tentative${result.attempts > 1 ? 's' : ''}`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function Notifications({ notifications }) {
  if (!notifications.length) {
    return (
      <p className="font-montserrat text-body-sm text-gray-800">
        Aucun e-mail enregistré (envoi désactivé sur ce serveur ou pas encore
        traité).
      </p>
    );
  }
  return (
    <ul className="font-montserrat flex flex-col gap-3">
      {notifications.map((entry) => (
        <li
          key={`${entry.event}-${entry.occurredAt}`}
          className="bg-secondary-50 flex flex-col gap-3 rounded-2xl p-4"
        >
          <p className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-body font-medium text-gray-900">
              {NOTIFICATION_EVENTS[entry.event] ?? 'Modification'}
            </span>
            <span className="text-xs text-gray-800 first-letter:uppercase">
              {formatDateTime(entry.occurredAt)}
            </span>
          </p>
          <MailResult who="Client" result={entry.client} />
          <MailResult who="Cabinet" result={entry.studio} />
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, eyebrow, children, className = '' }) {
  return (
    <section
      className={`rounded-panel flex flex-col gap-5 border border-black/10 bg-white p-6 sm:p-7 ${className}`}
    >
      <div className="flex flex-col gap-1">
        {eyebrow ? (
          <p className="font-montserrat text-label-sm text-primary-300 font-semibold uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-faustina text-third-900 text-[1.625rem] leading-tight break-words">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ContactRow({ href, icon, children }) {
  return (
    <a
      href={href}
      className="bg-secondary-50 hover:bg-secondary-100 focus-visible:outline-third-200 font-montserrat text-body flex min-h-12 items-center gap-3 rounded-xl px-4 break-all text-gray-900 transition-colors focus-visible:outline-2"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
        className="size-[18px] shrink-0"
      >
        {icon}
      </svg>
      {children}
    </a>
  );
}

function Detail({ bookingId, controller, enabled }) {
  const searchParams = useSearchParams();
  const { status, data, error, reload, replace } = useAccountData(
    `/api/admin/bookings/${encodeURIComponent(bookingId)}`,
    { enabled }
  );
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [done, setDone] = useState(null);
  const busyRef = useRef(false);
  const reasonId = useId();

  if (status === 'loading' || status === 'idle') {
    return (
      <p role="status" className="font-montserrat text-body text-gray-800">
        Chargement du rendez-vous…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <AdminError
        error={error}
        onRetry={error?.status === 404 ? undefined : reload}
        message={
          error?.status === 404
            ? 'Rendez-vous introuvable.'
            : bookingErrorMessage(error)
        }
      />
    );
  }

  const booking = data.booking;
  const day = searchParams.get('date') ?? localDateOf(booking.startsAt);

  const cancel = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(true);
    setActionError(null);
    try {
      const trimmed = reason.trim();
      const result = await controller.api(
        `/api/admin/bookings/${booking.id}/cancel`,
        { method: 'POST', body: trimmed ? { reason: trimmed } : {} }
      );
      replace({ booking: result.booking });
      setDone(
        result.changed
          ? 'Rendez-vous annulé.'
          : 'Ce rendez-vous était déjà annulé.'
      );
      setConfirming(false);
      setReason('');
    } catch (caught) {
      setActionError(caught);
      if (caught?.status === 409) reload();
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/admin/reservations?date=${day}`}
        className="font-montserrat text-body-sm hover:border-third-200 focus-visible:outline-third-200 flex min-h-11 w-fit items-center gap-2 rounded-full border border-black/15 bg-white px-5 text-gray-900 transition-colors focus-visible:outline-2"
      >
        <span aria-hidden>←</span> Agenda du jour
      </Link>

      <div role="status">{done ? <Notice>{done}</Notice> : null}</div>
      {actionError && !confirming ? (
        <div role="alert">
          <Notice tone="error">{bookingErrorMessage(actionError)}</Notice>
        </div>
      ) : null}

      <BookingCard booking={booking}>
        <div className="flex flex-wrap items-center gap-3">
          <BookingStatus phase={booking.phase} />
        </div>
        {booking.cancellation ? (
          <p className="font-montserrat text-body-sm mt-3 text-gray-800">
            Annulé{' '}
            {booking.cancellation.by === 'admin'
              ? 'par le cabinet'
              : 'par le client'}{' '}
            le {formatDateTime(booking.cancellation.at)}
            {booking.cancellation.reason
              ? ` — motif : ${booking.cancellation.reason}`
              : ''}
          </p>
        ) : null}
      </BookingCard>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <Panel
            eyebrow="Client"
            title={booking.client.name ?? 'Nom non renseigné'}
          >
            {booking.client.phone || booking.client.email ? (
              <div className="flex flex-col gap-2.5">
                {booking.client.phone ? (
                  <ContactRow
                    href={`tel:${booking.client.phone}`}
                    icon={
                      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                    }
                  >
                    {booking.client.phone}
                  </ContactRow>
                ) : null}
                {booking.client.email ? (
                  <ContactRow
                    href={`mailto:${booking.client.email}`}
                    icon={
                      <>
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 7l9 6 9-6" />
                      </>
                    }
                  >
                    {booking.client.email}
                  </ContactRow>
                ) : null}
              </div>
            ) : (
              <p className="font-montserrat text-body-sm text-gray-800">
                Aucune coordonnée renseignée.
              </p>
            )}
          </Panel>

          {booking.allowedActions.cancel ? (
            <Panel title="Annulation">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={reasonId}
                  className="font-montserrat text-body-sm font-medium text-gray-900"
                >
                  Motif d’annulation{' '}
                  <span className="font-normal text-gray-800">
                    (facultatif)
                  </span>
                </label>
                <textarea
                  id={reasonId}
                  value={reason}
                  maxLength={MAX_REASON}
                  rows={3}
                  onChange={(event) => setReason(event.target.value)}
                  className="font-montserrat text-body focus:border-third-200 focus:ring-third-200/30 resize-y rounded-xl border border-black/20 bg-white px-3.5 py-3 text-gray-900 focus:ring-2 focus:outline-none"
                />
                <p className="font-montserrat text-xs text-gray-800">
                  {reason.length} / {MAX_REASON}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setConfirming(true);
                }}
                className="font-montserrat text-label border-error text-error hover:bg-error/5 focus-visible:outline-error min-h-12 rounded-full border font-medium tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Annuler ce rendez-vous
              </button>
            </Panel>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Historique">
            <BookingHistory history={booking.history} admin />
          </Panel>
          <Panel title="E-mails">
            <Notifications notifications={booking.notifications} />
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Annuler ce rendez-vous ?"
        confirmLabel="Oui, annuler"
        cancelLabel="Garder"
        pending={pending}
        error={
          actionError && confirming ? bookingErrorMessage(actionError) : null
        }
        onConfirm={cancel}
        onClose={() => setConfirming(false)}
      >
        Le rendez-vous du {formatDateTime(booking.startsAt)} (
        {booking.client.name ?? 'client'}) sera annulé et l’horaire libéré. Le
        client est prévenu par e-mail si l’envoi est activé. Action définitive.
        {reason.trim() ? ` Motif : « ${reason.trim()} ».` : ''}
      </ConfirmDialog>
    </div>
  );
}

/** /admin/reservations/[id] — one booking with client, emails, cancel. */
export default function AdminBookingDetail({ bookingId }) {
  return (
    <AdminShell
      title={
        <>
          Détail du <span className="heading-accent">rendez-vous</span>
        </>
      }
      current="reservations"
      returnTo={`/admin/reservations/${bookingId}`}
    >
      {({ controller, status }) => (
        <Detail
          bookingId={bookingId}
          controller={controller}
          enabled={status === 'admin'}
        />
      )}
    </AdminShell>
  );
}
