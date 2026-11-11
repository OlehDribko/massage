'use client';

import { useEffect, useId, useRef, useState } from 'react';

import DatePicker from '@/components/ui/DatePicker';
import { formatLocalDate } from '@/lib/format';

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      className="text-third-200 size-5 shrink-0"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

/**
 * A date shown as a pill button; a click opens the month calendar below
 * it. Escape or a click outside closes it; picking a date closes it too.
 */
export default function DateField({ value, onChange, today, min, label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="rounded-pill font-montserrat text-body hover:border-third-200 focus-visible:outline-third-200 flex min-h-12 w-full items-center gap-3 border border-black/15 bg-white px-5 text-left text-gray-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
      >
        <CalendarIcon />
        <span className="flex flex-col leading-tight">
          <span className="text-label-sm font-medium text-gray-800 uppercase">
            {label}
          </span>
          <span className="font-medium first-letter:uppercase">
            {value ? formatLocalDate(value, { year: true }) : 'Choisir'}
          </span>
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute top-full left-0 z-30 mt-2 w-[min(24rem,calc(100vw-2rem))] shadow-xl [&>div]:max-w-none"
        >
          <DatePicker
            value={value}
            today={today}
            min={min}
            label={label}
            onChange={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
