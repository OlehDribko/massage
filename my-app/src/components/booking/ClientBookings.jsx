'use client';

import { useState } from 'react';
import Link from 'next/link';

import AccountShell from '@/components/auth/AccountShell';
import { useAccountData } from '@/components/auth/useAccountData';
import BookingCard from '@/components/booking/BookingCard';
import BookingStatus from '@/components/booking/BookingStatus';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { BUSINESS } from '@/config/site';
import { splitBookings } from '@/lib/booking/bookings';
import { directionsUrl } from '@/lib/booking/calendar';
import { bookingErrorMessage } from '@/lib/booking/labels';
import {
  addDays,
  formatDateTime,
  formatDuration,
  formatPrice,
  localDateOf,
  studioToday,
} from '@/lib/format';

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'finished', label: 'Passés' },
  { key: 'cancelled', label: 'Annulés' },
];

/** "Aujourd’hui", "Demain", "Dans 3 jours" (studio calendar days). */
function whenLabel(startsAt) {
  const today = studioToday();
  const date = localDateOf(startsAt);
  if (date === today) return 'Aujourd’hui';
  if (date === addDays(today, 1)) return 'Demain';
  const days = Math.round(
    (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) /
      86_400_000
  );
  return days > 1 ? `Dans ${days} jours` : null;
}

function BookingRow({ booking, rebook }) {
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
      <Link
        href={`/compte/reservations/${booking.id}`}
        className="group focus-visible:outline-third-200 flex min-w-0 flex-1 flex-col gap-1 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span className="font-montserrat text-body group-hover:text-third-200 font-semibold text-gray-900 first-letter:uppercase">
          {formatDateTime(booking.startsAt)}
        </span>
        <span className="font-montserrat text-body-sm text-gray-800">
          {booking.service.name} ·{' '}
          {formatDuration(booking.service.durationMinutes)} ·{' '}
          {formatPrice(booking.service.priceCents, booking.service.currency)}
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <BookingStatus phase={booking.phase} />
        {rebook ? (
          <Link
            href={`/reserver/${booking.service.id}`}
            className="font-montserrat text-body-sm text-third-900 hover:text-third-200 flex min-h-11 items-center font-medium whitespace-nowrap underline underline-offset-4"
          >
            Réserver à nouveau
            <span className="sr-only"> — {booking.service.name}</span>
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function SectionTitle({ id, children }) {
  return (
    <h2
      id={id}
      className="font-montserrat text-label-sm font-semibold text-gray-800 uppercase"
    >
      {children}
    </h2>
  );
}

function BookingsContent({ enabled }) {
  const { status, data, error, reload } = useAccountData('/api/bookings', {
    enabled,
  });
  const [filter, setFilter] = useState('all');

  if (status === 'loading' || status === 'idle') {
    return (
      <p role="status" className="font-montserrat text-body text-gray-800">
        Chargement de vos réservations…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <Notice tone="error">{bookingErrorMessage(error)}</Notice>
        <PillButton
          variant="outline"
          tone="dark"
          onClick={reload}
          className="self-start"
        >
          Réessayer
        </PillButton>
      </div>
    );
  }

  const { upcoming, past } = splitBookings(data.bookings);
  if (!upcoming.length && !past.length) {
    return (
      <div className="rounded-panel flex flex-col items-start gap-5 border border-black/10 bg-white p-8">
        <p className="font-faustina text-third-900 text-[1.75rem] leading-tight">
          Vous n’avez pas encore de réservation.
        </p>
        <PillButton href="/reserver">Réserver un soin</PillButton>
      </div>
    );
  }

  const [next, ...later] = upcoming;
  const shown = past.filter(
    (booking) => filter === 'all' || booking.phase === filter
  );

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="prochain" className="flex flex-col gap-4">
        <SectionTitle id="prochain">Prochain rendez-vous</SectionTitle>
        {next ? (
          <BookingCard
            booking={next}
            eyebrow={
              next.phase === 'in_progress'
                ? 'En cours'
                : whenLabel(next.startsAt)
            }
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PillButton href={`/compte/reservations/${next.id}`} size="sm">
                Gérer
              </PillButton>
              <PillButton
                href={directionsUrl(BUSINESS.address)}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                tone="dark"
                size="sm"
              >
                Itinéraire<span className="sr-only"> (nouvelle fenêtre)</span>
              </PillButton>
            </div>
          </BookingCard>
        ) : (
          <div className="rounded-panel flex flex-col items-start gap-4 border border-black/10 bg-white p-6">
            <p className="font-montserrat text-body text-gray-800">
              Aucun rendez-vous à venir.
            </p>
            <PillButton href="/reserver" size="sm">
              Réserver un soin
            </PillButton>
          </div>
        )}
      </section>

      {later.length ? (
        <section aria-labelledby="ensuite" className="flex flex-col gap-4">
          <SectionTitle id="ensuite">Ensuite</SectionTitle>
          <ul className="rounded-panel divide-y divide-black/10 border border-black/10 bg-white">
            {later.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </ul>
        </section>
      ) : null}

      {past.length ? (
        <section aria-labelledby="historique" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionTitle id="historique">Historique</SectionTitle>
            <div
              role="group"
              aria-label="Filtrer l’historique"
              className="rounded-pill flex gap-1 border border-black/10 bg-white p-1"
            >
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={filter === item.key}
                  onClick={() => setFilter(item.key)}
                  className={`rounded-pill font-montserrat text-body-sm focus-visible:outline-third-200 min-h-9 px-4 font-medium transition-colors focus-visible:outline-2 motion-reduce:transition-none ${
                    filter === item.key
                      ? 'bg-third-900 text-cream'
                      : 'hover:text-third-200 text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {shown.length ? (
            <ul className="rounded-panel divide-y divide-black/10 border border-black/10 bg-white">
              {shown.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  rebook={booking.phase === 'finished'}
                />
              ))}
            </ul>
          ) : (
            <p className="font-montserrat text-body-sm text-gray-800">
              Aucun rendez-vous dans cette catégorie.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}

/** /compte/reservations — own bookings (GET /api/bookings), all statuses. */
export default function ClientBookings() {
  return (
    <AccountShell
      title={
        <>
          Mes <span className="heading-accent">réservations</span>
        </>
      }
      current="reservations"
      returnTo="/compte/reservations"
    >
      {({ status }) => (
        <BookingsContent enabled={status === 'member' || status === 'admin'} />
      )}
    </AccountShell>
  );
}
