'use client';

import { useId } from 'react';

import {
  MAX_INTERVALS_PER_DAY,
  maskTimeInput,
  normalizeTime,
} from '@/lib/booking/schedule';

export const DEFAULT_INTERVAL = { start: '09:00', end: '20:30' };

// Text inputs, not type="time": the API accepts "24:00" as an end (a day
// that ends at midnight), which time inputs cannot express. The colon is
// typed for you ("15" then "0" shows "15:0"); "15" alone becomes "15:00"
// on leaving the field.
function TimeBox({ label, value, onChange, invalid }) {
  return (
    <input
      aria-label={label}
      value={value}
      onChange={(event) => onChange(maskTimeInput(event.target.value))}
      onBlur={(event) => {
        const next = normalizeTime(event.target.value);
        if (next !== event.target.value) onChange(next);
      }}
      inputMode="numeric"
      placeholder="09:00"
      maxLength={5}
      aria-invalid={invalid || undefined}
      className={`font-montserrat text-body focus:border-third-200 focus:ring-third-200/30 h-10 w-[4.75rem] rounded-xl border bg-white text-center font-medium text-gray-900 tabular-nums transition-colors focus:ring-2 focus:outline-none ${
        invalid ? 'border-error text-error' : 'border-black/15'
      }`}
    />
  );
}

/** On / off switch (role="switch"). */
export function Switch({ checked, onChange, label, describedBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={`focus-visible:outline-third-200 relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
        checked ? 'bg-primary-200' : 'bg-black/15'
      }`}
    >
      <span
        aria-hidden
        className={`size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="hover:bg-secondary-100 hover:text-third-900 focus-visible:outline-third-200 flex size-9 shrink-0 items-center justify-center rounded-full text-gray-800 transition-colors focus-visible:outline-2"
    >
      {children}
    </button>
  );
}

/** The ranges of a day as chips: [09:00] – [13:00] ×. */
function Ranges({ intervals, errors, onChange, dayLabel }) {
  const set = (index, field) => (value) =>
    onChange(
      intervals.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap items-center gap-2">
        {intervals.map((interval, index) => (
          <li
            key={index}
            className={`bg-secondary-50 flex items-center gap-1.5 rounded-2xl border p-1.5 pl-2 ${
              errors[index] ? 'border-error/50' : 'border-transparent'
            }`}
          >
            <TimeBox
              label={`${dayLabel}, plage ${index + 1} : début`}
              value={interval.start}
              onChange={set(index, 'start')}
              invalid={Boolean(errors[index])}
            />
            <span aria-hidden className="text-gray-800">
              –
            </span>
            <TimeBox
              label={`${dayLabel}, plage ${index + 1} : fin`}
              value={interval.end}
              onChange={set(index, 'end')}
              invalid={Boolean(errors[index])}
            />
            {intervals.length > 1 ? (
              <IconButton
                label={`Retirer la plage ${index + 1}`}
                onClick={() =>
                  onChange(intervals.filter((_, i) => i !== index))
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                  className="size-4"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </IconButton>
            ) : null}
          </li>
        ))}
        {intervals.length < MAX_INTERVALS_PER_DAY ? (
          <li>
            <button
              type="button"
              onClick={() => onChange([...intervals, { start: '', end: '' }])}
              className="font-montserrat text-body-sm hover:border-third-200 hover:text-third-900 focus-visible:outline-third-200 flex h-[3.25rem] items-center gap-1.5 rounded-2xl border border-dashed border-black/20 px-4 text-gray-800 transition-colors focus-visible:outline-2"
            >
              <span aria-hidden className="text-lg leading-none">
                +
              </span>
              Plage
              <span className="sr-only"> pour {dayLabel}</span>
            </button>
          </li>
        ) : null}
      </ul>
      {[...new Set(Object.values(errors))].map((message) => (
        <p key={message} className="font-montserrat text-body-sm text-error">
          {message}
        </p>
      ))}
    </div>
  );
}

/**
 * Working hours of one day (weekly rule or a specific date): a switch
 * (open / day off) and, when open, its ranges. No ranges = day off.
 * - layout 'row': one line of the weekly table (day, switch, ranges);
 * - layout 'stack': the ranges alone, for the specific-date form.
 * `errors` from validateDay(): by index, plus `day`.
 */
export default function IntervalsEditor({
  label,
  intervals,
  errors = {},
  onChange,
  layout = 'row',
}) {
  const stateId = useId();
  const open = intervals.length > 0;

  if (layout === 'stack') {
    return (
      <Ranges
        intervals={intervals}
        errors={errors}
        onChange={onChange}
        dayLabel={label}
      />
    );
  }

  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[8.5rem_7.5rem_minmax(0,1fr)] sm:items-center sm:gap-4">
      <div className="flex items-center justify-between gap-3 sm:contents">
        <p className="font-montserrat text-body font-semibold text-gray-900">
          {label}
        </p>
        <div className="flex items-center gap-3">
          <Switch
            checked={open}
            label={`${label} ouvert`}
            describedBy={stateId}
            onChange={(next) => onChange(next ? [{ ...DEFAULT_INTERVAL }] : [])}
          />
          <span
            id={stateId}
            className={`font-montserrat text-body-sm ${open ? 'text-gray-900' : 'text-gray-800'}`}
          >
            {open ? 'Ouvert' : 'Repos'}
          </span>
        </div>
      </div>
      {open ? (
        <Ranges
          intervals={intervals}
          errors={errors}
          onChange={onChange}
          dayLabel={label}
        />
      ) : (
        <p className="font-montserrat text-body-sm text-gray-800 sm:py-3">
          Aucune réservation possible ce jour-là.
        </p>
      )}
    </div>
  );
}
