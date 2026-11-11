'use client';

import { useState } from 'react';

import {
  ClosureResult,
  Legend,
  MonthView,
  WeekView,
} from '@/components/admin/AdminCalendar';
import { bookingsByDate, calendarRange } from '@/lib/admin/calendar';

const TODAY = '2027-03-09';
const hours = [{ start: '09:00', end: '20:30' }];

function sampleDay(date) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay() || 7;
  const closedBySchedule = weekday === 1;
  const closure = ['2027-03-12', '2027-03-20'].includes(date)
    ? { closedAt: '2027-03-01T08:00:00.000Z' }
    : null;
  const intervals = closedBySchedule ? [] : hours;
  return {
    date,
    weekday,
    closed: closedBySchedule,
    source: closedBySchedule ? 'exception' : 'weekly',
    intervals,
    closure,
    effective:
      closure || closedBySchedule
        ? { open: false, intervals: [] }
        : { open: true, intervals },
  };
}

const booking = (
  id,
  startsAt,
  minutes,
  name,
  service,
  status = 'confirmed'
) => ({
  id,
  status,
  phase: status === 'cancelled' ? 'cancelled' : 'upcoming',
  startsAt,
  endsAt: new Date(Date.parse(startsAt) + minutes * 60000).toISOString(),
  service: { name: service },
  client: { name },
});

const BOOKINGS = [
  booking('a', '2027-03-10T09:00:00Z', 60, 'Léa Martin', 'Massage relaxant'),
  booking('b', '2027-03-10T13:30:00Z', 90, 'Paul Durand', 'Massage sportif'),
  booking('c', '2027-03-12T10:00:00Z', 60, 'Inès Petit', 'Tuina'),
  booking('d', '2027-03-11T15:00:00Z', 60, 'Marc Roux', 'Gua Sha', 'cancelled'),
  booking('e', '2027-03-20T08:00:00Z', 60, 'Anna Blanc', 'Massage relaxant'),
];

export default function CalendarPreview() {
  const [selected, setSelected] = useState(new Set(['2027-03-13']));
  const toggle = (date) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  const week = calendarRange('week', TODAY);
  const month = calendarRange('month', TODAY);
  const daysByDate = new Map(
    month.dates.map((date) => [date, sampleDay(date)])
  );
  const byDate = bookingsByDate(BOOKINGS);
  const common = {
    daysByDate,
    byDate,
    today: TODAY,
    selected,
    onToggle: toggle,
  };

  return (
    <main className="px-page bg-background flex flex-col gap-12 py-12">
      <section className="max-w-content mx-auto flex w-full flex-col gap-4">
        <h1 className="text-section-title text-third-900">Semaine</h1>
        <Legend />
        <WeekView dates={week.dates} selecting {...common} />
      </section>
      <section className="max-w-content mx-auto flex w-full flex-col gap-4">
        <h2 className="text-section-title text-third-900">Mois</h2>
        <MonthView
          dates={month.dates}
          month={month.month}
          selecting={false}
          {...common}
        />
      </section>
      <section className="max-w-content mx-auto flex w-full flex-col gap-4">
        <ClosureResult
          result={{
            kind: 'close',
            dates: ['2027-03-12'],
            bookings: [
              {
                bookingId: 'c',
                date: '2027-03-12',
                startsAt: '2027-03-12T10:00:00Z',
                serviceName: 'Tuina',
              },
            ],
          }}
          onDismiss={() => {}}
        />
      </section>
    </main>
  );
}
