import {
  formatDuration,
  formatLocalDate,
  formatMonthShort,
  formatPrice,
  formatTime,
  localDateOf,
} from '@/lib/format';

/** Calendar tile: "NOV." over "10". */
export function DateTile({ startsAt, tone = 'light', size = 'md' }) {
  const date = localDateOf(startsAt);
  const big = size === 'lg';
  return (
    <div
      aria-hidden
      className={`flex shrink-0 flex-col items-center justify-center rounded-xl ${
        big ? 'h-[4.875rem] w-[4.5rem]' : 'h-[3.75rem] w-14'
      } ${tone === 'light' ? 'bg-cream text-third-900' : 'bg-third-900 text-cream'}`}
    >
      <span
        className={`text-[0.6875rem] font-semibold tracking-wider uppercase ${tone === 'light' ? 'text-primary-300' : 'text-primary-100'}`}
      >
        {formatMonthShort(date)}
      </span>
      <span
        className={`font-faustina leading-none ${big ? 'text-[2.125rem]' : 'text-2xl'}`}
      >
        {Number(date.slice(8))}
      </span>
    </div>
  );
}

/**
 * A booking as a dark band (date, time, service, agreed price). The
 * service, duration and price are the snapshot of the booking, never the
 * current catalogue. `eyebrow` is an optional line above the date.
 */
export default function BookingCard({ booking, eyebrow, children }) {
  const date = localDateOf(booking.startsAt);
  const cancelled = booking.status === 'cancelled';
  return (
    <div className="rounded-panel overflow-hidden border border-black/10 bg-white">
      <div
        className={`flex flex-wrap items-center gap-5 px-6 py-6 sm:px-8 ${
          cancelled
            ? 'bg-secondary-100 text-third-900'
            : 'bg-third-900 text-cream'
        }`}
      >
        <DateTile
          startsAt={booking.startsAt}
          tone={cancelled ? 'dark' : 'light'}
          size="lg"
        />
        <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
          {eyebrow ? (
            <p
              className={`font-montserrat text-label-sm font-semibold uppercase ${cancelled ? 'text-gray-800' : 'text-primary-100'}`}
            >
              {eyebrow}
            </p>
          ) : null}
          <p
            className={`font-faustina text-[1.75rem] leading-tight first-letter:uppercase sm:text-[1.875rem] ${cancelled ? 'line-through decoration-1' : ''}`}
          >
            {formatLocalDate(date)} · {formatTime(booking.startsAt)}
          </p>
          <p
            className={`font-montserrat text-body-sm ${cancelled ? 'text-gray-800' : 'text-secondary-200'}`}
          >
            {booking.service.name} ·{' '}
            {formatDuration(booking.service.durationMinutes)}, fin à{' '}
            {formatTime(booking.endsAt)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-0.5 sm:items-end">
          <span className="font-faustina text-[1.75rem] leading-none">
            {formatPrice(booking.service.priceCents, booking.service.currency)}
          </span>
          <span
            className={`font-montserrat text-xs ${cancelled ? 'text-gray-800' : 'text-secondary-200'}`}
          >
            à régler au cabinet
          </span>
        </div>
      </div>
      {children ? <div className="px-6 py-6 sm:px-8">{children}</div> : null}
    </div>
  );
}
