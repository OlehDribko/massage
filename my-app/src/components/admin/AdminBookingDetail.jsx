'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import { useAccountData } from '@/components/auth/useAccountData';
import BookingSummary, {
  BookingHistory,
} from '@/components/booking/BookingSummary';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import {
  NOTIFICATION_EVENTS,
  adminNotificationLabel,
  bookingErrorMessage,
} from '@/lib/booking/labels';
import { formatDateTime, localDateOf } from '@/lib/format';

const MAX_REASON = 500;

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
    <div className="overflow-x-auto">
      <table className="font-montserrat text-body-sm w-full min-w-[36rem] border-collapse text-left">
        <thead>
          <tr className="text-label-sm border-b border-black/10 text-gray-800 uppercase">
            <th scope="col" className="py-2 pr-4 font-medium">
              Événement
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Client
            </th>
            <th scope="col" className="py-2 font-medium">
              Cabinet
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10">
          {notifications.map((entry) => (
            <tr
              key={`${entry.event}-${entry.occurredAt}`}
              className="align-top"
            >
              <td className="py-3 pr-4 text-gray-900">
                {NOTIFICATION_EVENTS[entry.event] ?? 'Modification'}
                <span className="block text-gray-800">
                  {formatDateTime(entry.occurredAt)}
                </span>
              </td>
              {[entry.client, entry.studio].map((result, index) => (
                <td
                  key={index}
                  className={`py-3 ${index ? '' : 'pr-4'} text-gray-900`}
                >
                  {adminNotificationLabel(result)}
                  {result?.attempts ? (
                    <span className="block text-gray-800">
                      {result.attempts} tentative
                      {result.attempts > 1 ? 's' : ''}
                    </span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="flex flex-col gap-10">
      <div role="status">{done ? <Notice>{done}</Notice> : null}</div>

      <BookingSummary booking={booking} admin />

      <section className="flex flex-col gap-4">
        <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight">
          Client
        </h2>
        <dl className="font-montserrat text-body flex flex-col gap-2 text-gray-900">
          <div>
            <dt className="text-label-sm font-medium text-gray-800 uppercase">
              Nom
            </dt>
            <dd>{booking.client.name ?? 'Non renseigné'}</dd>
          </div>
          <div>
            <dt className="text-label-sm font-medium text-gray-800 uppercase">
              Téléphone
            </dt>
            <dd>
              {booking.client.phone ? (
                <a
                  href={`tel:${booking.client.phone}`}
                  className="hover:text-third-200 underline underline-offset-2"
                >
                  {booking.client.phone}
                </a>
              ) : (
                'Non renseigné'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-label-sm font-medium text-gray-800 uppercase">
              E-mail
            </dt>
            <dd className="break-all">
              {booking.client.email ? (
                <a
                  href={`mailto:${booking.client.email}`}
                  className="hover:text-third-200 underline underline-offset-2"
                >
                  {booking.client.email}
                </a>
              ) : (
                'Non renseigné'
              )}
            </dd>
          </div>
        </dl>
      </section>

      {booking.allowedActions.cancel ? (
        <PillButton
          variant="outline"
          tone="dark"
          onClick={() => {
            setActionError(null);
            setConfirming(true);
          }}
          className="self-start"
        >
          Annuler le rendez-vous
        </PillButton>
      ) : null}
      {actionError && !confirming ? (
        <div role="alert">
          <Notice tone="error">{bookingErrorMessage(actionError)}</Notice>
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight">
          E-mails
        </h2>
        <Notifications notifications={booking.notifications} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight">
          Historique
        </h2>
        <BookingHistory history={booking.history} admin />
      </section>

      <Link
        href={`/admin/reservations?date=${day}`}
        className="font-montserrat text-body-sm hover:text-third-200 self-start text-gray-800 underline underline-offset-4"
      >
        ← Rendez-vous du jour
      </Link>

      <ConfirmDialog
        open={confirming}
        title="Annuler ce rendez-vous ?"
        confirmLabel="Annuler le rendez-vous"
        cancelLabel="Garder"
        pending={pending}
        error={
          actionError && confirming ? bookingErrorMessage(actionError) : null
        }
        onConfirm={cancel}
        onClose={() => setConfirming(false)}
      >
        <div className="flex flex-col gap-4">
          <p>
            Le rendez-vous du {formatDateTime(booking.startsAt)} (
            {booking.client.name ?? 'client'}) sera annulé et l’horaire libéré.
            Le client est prévenu par e-mail si l’envoi est activé. Action
            définitive.
          </p>
          <div className="flex flex-col gap-1">
            <label
              htmlFor={reasonId}
              className="text-label-sm font-medium text-gray-800 uppercase"
            >
              Motif (facultatif)
            </label>
            <textarea
              id={reasonId}
              value={reason}
              maxLength={MAX_REASON}
              rows={3}
              onChange={(event) => setReason(event.target.value)}
              className="rounded-card text-body focus:border-third-200 border border-black/20 bg-white p-3 text-gray-900 focus:outline-none"
            />
            <p className="text-body-sm text-gray-800">
              {reason.length} / {MAX_REASON}
            </p>
          </div>
        </div>
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
