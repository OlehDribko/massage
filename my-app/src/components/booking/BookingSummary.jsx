'use client';

import { useFormat, useServiceName, useT } from '@/i18n/client';
import BookingStatus from '@/components/booking/BookingStatus';
import { cancelledByLabel } from '@/lib/booking/labels';

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
  const t = useT();
  const serviceName = useServiceName();
  const { formatDateTime, formatDuration, formatPrice, formatTime } =
    useFormat();
  const by = (who) =>
    admin
      ? who === 'admin'
        ? t('par le cabinet')
        : t('par le client')
      : cancelledByLabel(who, t);

  return (
    <div className="flex flex-col gap-6">
      <BookingStatus phase={booking.phase} />
      <dl className="divide-y divide-black/10 border-y border-black/10">
        <Row label={t('Date')}>
          <span className="first-letter:uppercase">
            {formatDateTime(booking.startsAt)} – {formatTime(booking.endsAt)}
          </span>
        </Row>
        <Row label={t('Prestation')}>
          {serviceName(booking.service)} ·{' '}
          {formatDuration(booking.service.durationMinutes)}
        </Row>
        <Row label={t('Tarif')}>
          {formatPrice(booking.service.priceCents, booking.service.currency)}{' '}
          <span className="text-gray-800">{t('· règlement sur place')}</span>
        </Row>
        {booking.cancellation ? (
          <Row label={t('Annulation')}>
            {t('Annulé {by} le {date}', {
              by: by(booking.cancellation.by),
              date: formatDateTime(booking.cancellation.at),
            })}
            {booking.cancellation.reason ? (
              <span className="block text-gray-800">
                {t('Motif : {reason}', {
                  reason: booking.cancellation.reason,
                })}
              </span>
            ) : null}
          </Row>
        ) : null}
      </dl>
    </div>
  );
}

// "mer. 11 nov., 09:15" — short enough for the move chips on phones.
const shortStamp = (intlLocale, instant) =>
  new Intl.DateTimeFormat(intlLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(instant));

const HISTORY_ICONS = {
  created: 'M5 12l5 5 9-10',
  rescheduled:
    'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  cancelled: 'M6 6l12 12M18 6L6 18',
};

const HISTORY_TONES = {
  created: 'bg-primary-200 text-on-gold',
  rescheduled: 'bg-third-900 text-cream',
  cancelled: 'bg-white text-error border border-error/40',
};

/**
 * History as a timeline: created, each move (old time → new time),
 * cancellation. Oldest first, the latest change at the bottom.
 */
export function BookingHistory({ history, admin = false }) {
  const t = useT();
  const { formatDateTime, intlLocale } = useFormat();
  const title = (entry) => {
    switch (entry.type) {
      case 'created':
        return t('Réservation créée');
      case 'rescheduled':
        return t('Rendez-vous déplacé');
      case 'cancelled':
        return admin
          ? t('Annulé {by}', {
              by:
                entry.by === 'admin' ? t('par le cabinet') : t('par le client'),
            })
          : t('Annulé {by}', { by: cancelledByLabel(entry.by, t) });
      default:
        return t('Modification');
    }
  };

  return (
    <ol className="flex flex-col">
      {history.map((entry, index) => {
        const last = index === history.length - 1;
        return (
          <li
            key={`${entry.type}-${entry.at}`}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!last ? (
              <span
                aria-hidden
                className="absolute top-9 bottom-0 left-[1.0625rem] w-px bg-black/10"
              />
            ) : null}
            <span
              aria-hidden
              className={`relative flex size-9 shrink-0 items-center justify-center rounded-full ${HISTORY_TONES[entry.type] ?? 'bg-secondary-100 text-third-900'}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
              >
                <path d={HISTORY_ICONS[entry.type] ?? 'M12 8v4l3 2'} />
              </svg>
            </span>
            <div className="font-montserrat flex min-w-0 flex-col gap-1.5 pt-1.5">
              <p className="text-body font-medium text-gray-900">
                {title(entry)}
              </p>
              <p className="text-body-sm text-gray-800 first-letter:uppercase">
                {formatDateTime(entry.at)}
              </p>
              {entry.type === 'rescheduled' ? (
                <p className="text-body-sm flex flex-wrap items-center gap-2">
                  <span className="bg-secondary-50 rounded-full px-3 py-1 whitespace-nowrap text-gray-800 line-through decoration-black/30">
                    {shortStamp(intlLocale, entry.from.startsAt)}
                  </span>
                  <span aria-hidden className="text-third-200">
                    →
                  </span>
                  <span className="sr-only">{t('vers')}</span>
                  <span className="bg-primary-50 text-third-900 rounded-full px-3 py-1 font-medium whitespace-nowrap">
                    {shortStamp(intlLocale, entry.to.startsAt)}
                  </span>
                </p>
              ) : null}
              {entry.type === 'cancelled' && entry.reason ? (
                <p className="text-body-sm bg-secondary-50 rounded-xl px-3 py-2 text-gray-800">
                  {t('Motif : {reason}', { reason: entry.reason })}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
