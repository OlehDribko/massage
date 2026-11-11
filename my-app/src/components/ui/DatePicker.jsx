'use client';

import { useState } from 'react';

import { addDays, formatLocalDate } from '@/lib/format';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const WEEKDAY_NAMES = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
];

const monthLabel = (month) =>
  new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-15T12:00:00Z`));

function shiftMonth(month, delta) {
  const [year, index] = month.split('-').map(Number);
  const total = year * 12 + (index - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/** Monday-first grid of a month, padded with the neighbouring days. */
function monthGrid(month) {
  const first = `${month}-01`;
  const day = new Date(`${first}T12:00:00Z`).getUTCDay() || 7;
  const start = addDays(first, 1 - day);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function Chevron({ back = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      className="size-[18px]"
    >
      <path d={back ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}

const navButton =
  'flex size-10 items-center justify-center rounded-full border border-black/15 bg-white text-third-900 transition-colors hover:border-third-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-third-200 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none';

/**
 * Inline month calendar in the site's style (studio dates "YYYY-MM-DD").
 * `min`: earlier dates are disabled. `marked`: dates with a small dot
 * (e.g. existing exceptions). `today` comes from the parent (browser only).
 */
export default function DatePicker({
  value,
  onChange,
  today,
  min,
  marked,
  label = 'Choisir une date',
}) {
  const [month, setMonth] = useState(
    () => (value ?? today ?? '').slice(0, 7) || null
  );
  const shown = month ?? (value ?? today)?.slice(0, 7);
  if (!shown) return null;

  const days = monthGrid(shown);
  const minMonth = min?.slice(0, 7);

  return (
    <div
      role="group"
      aria-label={label}
      className="rounded-panel flex w-full max-w-sm flex-col gap-4 border border-black/10 bg-white p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(shown, -1))}
          disabled={Boolean(minMonth) && shown <= minMonth}
          aria-label="Mois précédent"
          className={navButton}
        >
          <Chevron back />
        </button>
        <p
          aria-live="polite"
          className="font-faustina text-third-900 text-xl first-letter:uppercase"
        >
          {monthLabel(shown)}
        </p>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(shown, 1))}
          aria-label="Mois suivant"
          className={navButton}
        >
          <Chevron />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((letter, index) => (
          <span
            key={WEEKDAY_NAMES[index]}
            title={WEEKDAY_NAMES[index]}
            className="font-montserrat text-[0.6875rem] font-semibold tracking-wider text-gray-800"
          >
            {letter}
          </span>
        ))}
        {days.map((date) => {
          const inMonth = date.startsWith(shown);
          const disabled = Boolean(min) && date < min;
          const selected = date === value;
          const isToday = date === today;
          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`${formatLocalDate(date, { year: true })}${isToday ? ' (aujourd’hui)' : ''}`}
              onClick={() => onChange(date)}
              className={`font-montserrat focus-visible:outline-third-200 relative mx-auto flex size-10 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
                selected
                  ? 'bg-third-900 text-cream font-semibold'
                  : disabled
                    ? 'cursor-not-allowed text-gray-800/30'
                    : `hover:bg-secondary-100 ${inMonth ? 'text-gray-900' : 'text-gray-800/50'}`
              } ${isToday && !selected ? 'ring-primary-200 font-semibold ring-1' : ''}`}
            >
              {Number(date.slice(8))}
              {marked?.has(date) && !selected ? (
                <span
                  aria-hidden
                  className="bg-third-200 absolute bottom-1 size-1 rounded-full"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
