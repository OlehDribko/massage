'use client';

import { useId, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import { useAccountData } from '@/components/auth/useAccountData';
import BookingStatus from '@/components/booking/BookingStatus';
import PillButton from '@/components/ui/PillButton';
import { sortDayBookings } from '@/lib/booking/bookings';
import {
  adminNotificationLabel,
  bookingErrorMessage,
} from '@/lib/booking/labels';
import {
  addDays,
  formatLocalDate,
  formatTime,
  studioToday,
} from '@/lib/format';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const noopSubscribe = () => () => {};

// Studio-time minutes of an instant: "10:45" → 645.
const minuteOf = (instant) => {
  const [hours, minutes] = formatTime(instant).split(':').map(Number);
  return hours * 60 + minutes;
};
const HOUR_PX = 64;
const BREAK_MINUTES = 15; // docs/booking.md §2: one break after each session

/**
 * The day as a vertical timeline (studio time): each booking is a block
 * linking to its detail, followed by the 15-minute break the calendar
 * keeps free. Cancelled ones are drawn dashed. 09:00–20:00 at least,
 * widened to the day's bookings.
 */
function DayTimeline({ bookings, date }) {
  const spans = bookings.map((booking) => ({
    booking,
    start: minuteOf(booking.startsAt),
    end: minuteOf(booking.endsAt) || 24 * 60,
  }));
  const first = Math.min(9 * 60, ...spans.map((span) => span.start));
  const last = Math.max(
    20 * 60,
    ...spans.map((span) => span.end + BREAK_MINUTES)
  );
  const fromHour = Math.floor(first / 60);
  const toHour = Math.min(24, Math.ceil(last / 60));
  const top = (minute) => ((minute - fromHour * 60) / 60) * HOUR_PX;
  const hours = Array.from(
    { length: toHour - fromHour + 1 },
    (_, index) => fromHour + index
  );

  return (
    <div
      aria-hidden
      className="rounded-panel flex gap-3 border border-black/10 bg-white p-4 sm:p-6"
    >
      <div
        className="relative w-12 shrink-0"
        style={{ height: (toHour - fromHour) * HOUR_PX }}
      >
        {hours.map((hour) => (
          <span
            key={hour}
            className="font-montserrat absolute right-0 -translate-y-1/2 text-xs text-gray-800"
            style={{ top: top(hour * 60) }}
          >
            {String(hour).padStart(2, '0')}:00
          </span>
        ))}
      </div>
      <div
        className="relative flex-1 border-l border-black/10"
        style={{ height: (toHour - fromHour) * HOUR_PX }}
      >
        {hours.map((hour) => (
          <span
            key={hour}
            className="absolute inset-x-0 h-px bg-black/[0.08]"
            style={{ top: top(hour * 60) }}
          />
        ))}
        {spans.map(({ booking, start, end }) => {
          const cancelled = booking.status === 'cancelled';
          return (
            <div key={booking.id}>
              {!cancelled ? (
                <span
                  className="absolute inset-x-3 rounded bg-[repeating-linear-gradient(90deg,rgb(205_152_79/0.3)_0_4px,transparent_4px_8px)]"
                  style={{
                    top: top(end),
                    height: (BREAK_MINUTES / 60) * HOUR_PX,
                  }}
                />
              ) : null}
              <Link
                href={`/admin/reservations/${booking.id}?date=${date}`}
                tabIndex={-1}
                className={`font-montserrat absolute inset-x-3 flex flex-col gap-0.5 overflow-hidden rounded-xl px-3 py-1.5 text-xs transition-shadow hover:shadow-md ${
                  cancelled
                    ? 'z-0 border border-dashed border-gray-200 bg-white text-gray-800'
                    : 'bg-third-900 text-cream z-[1]'
                }`}
                style={{
                  top: top(start) + 1,
                  height: Math.max(((end - start) / 60) * HOUR_PX - 2, 24),
                }}
              >
                <span className="font-semibold">
                  {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
                  {cancelled ? ' · annulé' : ''}
                </span>
                <span className="truncate text-sm font-medium">
                  {booking.client.name ?? 'Nom non renseigné'}
                </span>
                <span
                  className={`truncate ${cancelled ? '' : 'text-secondary-200'}`}
                >
                  {booking.service.name}
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** "4 rendez-vous · 5 h réservées · 1 annulé". */
function daySummary(bookings) {
  const confirmed = bookings.filter((b) => b.status !== 'cancelled');
  const minutes = confirmed.reduce(
    (sum, b) => sum + (Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000,
    0
  );
  const cancelled = bookings.length - confirmed.length;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  const time = hours
    ? `${hours} h${rest ? ` ${String(rest).padStart(2, '0')}` : ''}`
    : `${rest} min`;
  return [
    `${confirmed.length} rendez-vous`,
    confirmed.length ? `${time} réservées` : null,
    cancelled ? `${cancelled} annulé${cancelled > 1 ? 's' : ''}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Latest email results of a booking: "Client : … · Cabinet : …". */
function lastNotification(notifications) {
  const last = notifications?.at(-1);
  if (!last) return null;
  return `Client : ${adminNotificationLabel(last.client)} · Cabinet : ${adminNotificationLabel(last.studio)}`;
}

function DayList({ date, enabled }) {
  const { status, data, error, reload } = useAccountData(
    `/api/admin/bookings?date=${date}`,
    { enabled }
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <p role="status" className="font-montserrat text-body text-gray-800">
        Chargement des rendez-vous…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <AdminError
        error={error}
        onRetry={reload}
        message={bookingErrorMessage(error)}
      />
    );
  }

  const bookings = sortDayBookings(data.bookings);
  if (!bookings.length) {
    return (
      <p className="font-montserrat text-body text-gray-800">
        Aucun rendez-vous ce jour-là.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-montserrat text-body-sm text-gray-800">
        {daySummary(bookings)}
      </p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
        <DayTimeline bookings={bookings} date={date} />
        <ul className="rounded-panel divide-y divide-black/10 border border-black/10 bg-white">
          {bookings.map((booking) => {
            const mail = lastNotification(booking.notifications);
            return (
              <li
                key={booking.id}
                className={`grid gap-3 px-5 py-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-start sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[6.5rem_minmax(0,1fr)_auto] ${booking.status === 'cancelled' ? 'opacity-70' : ''}`}
              >
                <p className="font-montserrat text-body font-semibold text-gray-900">
                  {formatTime(booking.startsAt)} – {formatTime(booking.endsAt)}
                </p>
                <div className="font-montserrat text-body-sm flex min-w-0 flex-col gap-1 text-gray-800">
                  <p className="text-body font-medium text-gray-900">
                    {booking.service.name}
                  </p>
                  <p className="break-words">
                    {booking.client.name ?? 'Nom non renseigné'}
                    {booking.client.phone ? (
                      <>
                        {' · '}
                        <a
                          href={`tel:${booking.client.phone}`}
                          className="hover:text-third-200 underline underline-offset-2"
                        >
                          {booking.client.phone}
                        </a>
                      </>
                    ) : null}
                  </p>
                  {booking.client.email ? (
                    <p className="break-all">{booking.client.email}</p>
                  ) : null}
                  {mail ? (
                    <p className="text-gray-800">E-mails — {mail}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <BookingStatus phase={booking.phase} />
                  <Link
                    href={`/admin/reservations/${booking.id}?date=${date}`}
                    className="font-montserrat text-label hover:text-third-200 font-medium text-gray-900 uppercase underline underline-offset-4"
                  >
                    Détails
                    <span className="sr-only">
                      {' '}
                      du rendez-vous de {formatTime(booking.startsAt)}
                    </span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * /admin/reservations?date=YYYY-MM-DD — bookings starting on one studio
 * date, all statuses (GET /api/admin/bookings?date=). Read-only list; the
 * only admin action on a booking (cancel) is on its detail page.
 */
export default function AdminDayBookings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useSyncExternalStore(noopSubscribe, studioToday, () => null);
  const asked = searchParams.get('date');
  const date = asked && DATE.test(asked) ? asked : today;
  const dateInputId = useId();

  const go = (next) => router.replace(`/admin/reservations?date=${next}`);

  return (
    <AdminShell
      title={
        <>
          Rendez-vous du <span className="heading-accent">jour</span>
        </>
      }
      current="reservations"
      returnTo="/admin/reservations"
    >
      {({ status }) =>
        date ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={dateInputId}
                  className="font-montserrat text-label-sm font-medium text-gray-800 uppercase"
                >
                  Date
                </label>
                <input
                  id={dateInputId}
                  type="date"
                  value={date}
                  onChange={(event) =>
                    DATE.test(event.target.value) && go(event.target.value)
                  }
                  className="font-montserrat text-body focus:border-third-200 border-b border-black/20 bg-transparent py-2 text-gray-900 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PillButton
                  variant="text"
                  underline={false}
                  onClick={() => go(addDays(date, -1))}
                >
                  ← Veille
                </PillButton>
                <PillButton
                  variant="text"
                  underline={false}
                  onClick={() => go(today)}
                  disabled={date === today}
                  className="disabled:opacity-40"
                >
                  Aujourd’hui
                </PillButton>
                <PillButton
                  variant="text"
                  underline={false}
                  onClick={() => go(addDays(date, 1))}
                >
                  Lendemain →
                </PillButton>
              </div>
            </div>
            <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight first-letter:uppercase">
              {formatLocalDate(date, { year: true })}
            </h2>
            <DayList date={date} enabled={status === 'admin'} />
          </div>
        ) : (
          <p role="status" className="font-montserrat text-body text-gray-800">
            Chargement…
          </p>
        )
      }
    </AdminShell>
  );
}
