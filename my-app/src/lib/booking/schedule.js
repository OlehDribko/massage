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

/** "09:30" → 570; invalid → null. */
export function toMinutes(value) {
  if (typeof value !== 'string' || !HH_MM.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
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
      (days[value] ?? []).map(({ start, end }) => ({
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
      errors[index] = 'Heure invalide (format HH:MM, de 00:00 à 24:00).';
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
