'use client';

import { useId } from 'react';

import PillButton from '@/components/ui/PillButton';
import { MAX_INTERVALS_PER_DAY } from '@/lib/booking/schedule';

// Text inputs, not type="time": the API accepts "24:00" as an end (a day
// that ends at midnight), which time inputs cannot express.
function TimeInput({ label, value, onChange, invalid }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-0.5">
      <label
        htmlFor={id}
        className="font-montserrat text-label-sm font-medium text-gray-800 uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="numeric"
        placeholder="09:00"
        maxLength={5}
        aria-invalid={invalid || undefined}
        className={`font-montserrat text-body focus:border-third-200 w-24 border-b bg-transparent py-1.5 text-gray-900 focus:outline-none ${
          invalid ? 'border-error text-error' : 'border-black/20'
        }`}
      />
    </div>
  );
}

/**
 * Working ranges of one day (weekly rule or exception). `errors` from
 * validateDay(): by index, plus `day`. No ranges = closed.
 */
export default function IntervalsEditor({
  label,
  intervals,
  errors = {},
  onChange,
}) {
  const errorId = useId();
  const set = (index, field) => (value) =>
    onChange(
      intervals.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={errors.day ? errorId : undefined}
    >
      <legend className="font-montserrat text-body mb-2 font-semibold text-gray-900">
        {label}
      </legend>
      {intervals.length === 0 ? (
        <p className="font-montserrat text-body-sm text-gray-800">Fermé</p>
      ) : null}
      {intervals.map((interval, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-end gap-4">
            <TimeInput
              label="Début"
              value={interval.start}
              onChange={set(index, 'start')}
              invalid={Boolean(errors[index])}
            />
            <TimeInput
              label="Fin"
              value={interval.end}
              onChange={set(index, 'end')}
              invalid={Boolean(errors[index])}
            />
            <PillButton
              variant="text"
              underline={false}
              onClick={() => onChange(intervals.filter((_, i) => i !== index))}
            >
              Retirer<span className="sr-only"> la plage {index + 1}</span>
            </PillButton>
          </div>
          {errors[index] ? (
            <p className="font-montserrat text-body-sm text-error">
              {errors[index]}
            </p>
          ) : null}
        </div>
      ))}
      {errors.day ? (
        <p id={errorId} className="font-montserrat text-body-sm text-error">
          {errors.day}
        </p>
      ) : null}
      {intervals.length < MAX_INTERVALS_PER_DAY ? (
        <PillButton
          variant="text"
          onClick={() => onChange([...intervals, { start: '', end: '' }])}
          className="self-start"
        >
          + Ajouter une plage
        </PillButton>
      ) : null}
    </fieldset>
  );
}
