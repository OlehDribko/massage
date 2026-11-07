import BookingStatus from '@/components/booking/BookingStatus';
import { cancelledByLabel } from '@/lib/booking/labels';
import {
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from '@/lib/format';

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
      <dt className="font-montserrat text-label-sm font-medium text-gray-800 uppercase sm:w-44 sm:shrink-0 sm:pt-0.5">
        {label}
      </dt>
      <dd className="font-montserrat text-body min-w-0 break-words text-gray-900">
        {children}
      </dd>
    </div>
  );
}

/**
 * Booking facts shared by the client and admin views. The service, duration
 * and price are the snapshot agreed at booking time (never the current
 * catalogue). `admin` switches "par vous" to "par le client".
 */
export default function BookingSummary({ booking, admin = false }) {
  const by = (who) =>
    admin
      ? who === 'admin'
        ? 'par le cabinet'
        : 'par le client'
      : cancelledByLabel(who);

  return (
    <div className="flex flex-col gap-6">
      <BookingStatus phase={booking.phase} />
      <dl className="divide-y divide-black/10 border-y border-black/10">
        <Row label="Date">
          <span className="first-letter:uppercase">
            {formatDateTime(booking.startsAt)} – {formatTime(booking.endsAt)}
          </span>
        </Row>
        <Row label="Prestation">
          {booking.service.name} ·{' '}
          {formatDuration(booking.service.durationMinutes)}
        </Row>
        <Row label="Tarif">
          {formatPrice(booking.service.priceCents, booking.service.currency)}{' '}
          <span className="text-gray-800">· règlement sur place</span>
        </Row>
        {booking.cancellation ? (
          <Row label="Annulation">
            Annulé {by(booking.cancellation.by)} le{' '}
            {formatDateTime(booking.cancellation.at)}
            {booking.cancellation.reason ? (
              <span className="block text-gray-800">
                Motif : {booking.cancellation.reason}
              </span>
            ) : null}
          </Row>
        ) : null}
      </dl>
    </div>
  );
}

/** History: created, each move (from → to), cancellation. */
export function BookingHistory({ history, admin = false }) {
  const item = (entry) => {
    switch (entry.type) {
      case 'created':
        return 'Réservation créée';
      case 'rescheduled':
        return `Déplacé du ${formatDateTime(entry.from.startsAt)} au ${formatDateTime(entry.to.startsAt)}`;
      case 'cancelled':
        return admin
          ? `Annulé ${entry.by === 'admin' ? 'par le cabinet' : 'par le client'}`
          : `Annulé ${cancelledByLabel(entry.by)}`;
      default:
        return 'Modification';
    }
  };

  return (
    <ol className="font-montserrat text-body-sm flex flex-col gap-3 border-l border-black/10 pl-5">
      {history.map((entry) => (
        <li key={`${entry.type}-${entry.at}`} className="flex flex-col gap-0.5">
          <span className="text-gray-900">{item(entry)}</span>
          <span className="text-gray-800 first-letter:uppercase">
            {formatDateTime(entry.at)}
          </span>
        </li>
      ))}
    </ol>
  );
}
