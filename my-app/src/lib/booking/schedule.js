/*
 * Admin schedule editing (docs/booking.md §6, schedule.schema.ts): weekly
 * intervals `{ weekday 1–7, start, end }` in local "HH:MM" (00:00–24:00),
 * start < end, at most 6 non-overlapping intervals per day. The same checks
 * run here so mistakes are shown before sending; the server re-checks.
 * Pure — tested with `node --test`.
 */

export const WEEKDAYS = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 7, label: 'Dimanche' },
];

export const MAX_INTERVALS_PER_DAY = 6;

const HH_MM = /^(?:([01]\d|2[0-3]):([0-5]\d)|(24):(00))$/;

/**
 * What the admin typed → "HH:MM", without asking for the colon:
 * "12" → "12:00", "9" → "09:00", "930" → "09:30", "1200" → "12:00",
 * "9h30" / "9.30" / "9:3" → "09:30", "24" → "24:00". Anything that is not
 * a valid time comes back unchanged (the validation then shows it).
 */
export function normalizeTime(value) {
  if (typeof value !== 'string') return value;
  const text = value.trim().toLowerCase();
  let hours;
  let minutes;
  const parts = /^(\d{1,2})\s*[:h.,]\s*(\d{0,2})$/.exec(text);
  if (parts) {
    hours = parts[1];
    minutes = parts[2].length === 1 ? `${parts[2]}0` : parts[2] || '00';
  } else if (/^\d{1,4}$/.test(text)) {
    if (text.length <= 2) {
      hours = text;
      minutes = '00';
    } else {
      hours = text.slice(0, -2);
      minutes = text.slice(-2);
    }
  } else {
    return value;
  }
  const result = `${hours.padStart(2, '0')}:${minutes}`;
  return HH_MM.test(result) ? result : value;
}

/**
 * Mask while typing: digits only, the colon appears by itself after the
 * hours — "15" → "15", "150" → "15:0", "1500" → "15:00". A first digit
 * above 2 is an hour of one digit: "9" → "09", "93" → "09:3".
 */
export function maskTimeInput(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (/^[3-9]/.test(digits)) digits = `0${digits}`;
  digits = digits.slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}:${digits.slice(2)}`
    : digits;
}

/** "09:30" → 570; invalid → null. Accepts what normalizeTime() accepts. */
export function toMinutes(value) {
  const time = normalizeTime(value);
  if (typeof time !== 'string' || !HH_MM.test(time)) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Intervals with "HH:MM" times, sorted by start (what is sent). */
export function normalizeIntervals(intervals) {
  return (intervals ?? [])
    .map(({ start, end }) => ({
      start: normalizeTime(start),
      end: normalizeTime(end),
    }))
    .sort((a, b) => (toMinutes(a.start) ?? 0) - (toMinutes(b.start) ?? 0));
}

/** "2026-11-16" → 1 (Monday) … 7 (Sunday). */
export function isoWeekday(date) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/**
 * True when a specific date would get exactly the hours of the weekly
 * schedule for its weekday (same ranges, or a day off on a day off):
 * saving it would change nothing.
 */
export function sameAsWeekly(date, intervals, weekly) {
  if (!date) return false;
  const usual = weeklyByDay(weekly)[isoWeekday(date)] ?? [];
  const next = normalizeIntervals(intervals);
  return (
    usual.length === next.length &&
    usual.every(
      (item, index) =>
        toMinutes(item.start) === toMinutes(next[index].start) &&
        toMinutes(item.end) === toMinutes(next[index].end)
    )
  );
}

/** API weekly list → { 1: [{start, end}], …, 7: [] } sorted by start. */
export function weeklyByDay(intervals) {
  const days = Object.fromEntries(WEEKDAYS.map(({ value }) => [value, []]));
  for (const { weekday, start, end } of intervals ?? []) {
    days[weekday]?.push({ start, end });
  }
  for (const list of Object.values(days)) {
    list.sort((a, b) => (toMinutes(a.start) ?? 0) - (toMinutes(b.start) ?? 0));
  }
  return days;
}

/** { 1: [...], … } → API body `{ intervals: [{ weekday, start, end }] }`. */
export function weeklyBody(days) {
  return {
    intervals: WEEKDAYS.flatMap(({ value }) =>
      normalizeIntervals(days[value]).map(({ start, end }) => ({
        weekday: value,
        start,
        end,
      }))
    ),
  };
}

/**
 * Errors of one day's intervals, by index: `{ 0: 'message' }`; plus `day`
 * for errors of the whole day. Empty object when valid.
 */
export function validateDay(intervals) {
  const errors = {};
  const parsed = intervals.map(({ start, end }, index) => {
    const from = toMinutes(start);
    const to = toMinutes(end);
    if (from === null || to === null) {
      errors[index] =
        'Heure invalide : indiquez par exemple 9, 930 ou 09:30 (de 00:00 à 24:00).';
      return null;
    }
    if (from >= to) {
      errors[index] = 'L’heure de fin doit être après l’heure de début.';
      return null;
    }
    return { index, from, to };
  });

  if (intervals.length > MAX_INTERVALS_PER_DAY) {
    errors.day = `${MAX_INTERVALS_PER_DAY} plages au maximum par jour.`;
  }

  const valid = parsed.filter(Boolean).sort((a, b) => a.from - b.from);
  for (let i = 1; i < valid.length; i += 1) {
    if (valid[i].from < valid[i - 1].to) {
      errors[valid[i].index] =
        'Cette plage chevauche une autre plage du même jour.';
    }
  }
  return errors;
}

export function hasErrors(errorsByDay) {
  return Object.values(errorsByDay).some(
    (errors) => Object.keys(errors).length
  );
}
