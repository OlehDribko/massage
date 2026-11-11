/*
 * Dates, times, prices and durations for the booking screens. The studio
 * works in Europe/Paris; the API sends instants in UTC (…Z) and studio dates
 * as YYYY-MM-DD. Everything is formatted in the studio time zone, whatever
 * the visitor's own zone. Pure — tested with `node --test`.
 */

export const STUDIO_TIME_ZONE = 'Europe/Paris';

const LOCALE = 'fr-FR';

/** "85 €", "127,50 €" — euro cents as integers, as in the API. */
export function formatPrice(cents, currency = 'EUR') {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** "45 min", "1 h", "1 h 30". */
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0
    ? `${hours} h`
    : `${hours} h ${String(rest).padStart(2, '0')}`;
}

/** "09:15" in the studio time zone. */
export function formatTime(instant, timeZone = STUDIO_TIME_ZONE) {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(instant));
}

/** "mardi 2 mars 2027" for an instant, in the studio time zone. */
export function formatDate(instant, timeZone = STUDIO_TIME_ZONE) {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(instant));
}

/** "mardi 2 mars 2027 à 09:15". */
export function formatDateTime(instant, timeZone = STUDIO_TIME_ZONE) {
  return `${formatDate(instant, timeZone)} à ${formatTime(instant, timeZone)}`;
}

// A studio date (YYYY-MM-DD) has no time zone: format it as a calendar day.
function dateAtNoonUtc(localDate) {
  return new Date(`${localDate}T12:00:00Z`);
}

/** Studio date "2027-03-02" → "mardi 2 mars" (or with the year). */
export function formatLocalDate(localDate, options = {}) {
  const { year = false } = options;
  // An explicit `weekday: undefined` leaves the weekday out.
  const weekday = 'weekday' in options ? options.weekday : 'long';
  return new Intl.DateTimeFormat(LOCALE, {
    ...(weekday ? { weekday } : {}),
    day: 'numeric',
    month: 'long',
    ...(year ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(dateAtNoonUtc(localDate));
}

/** Studio date "2027-03-02" → "mars" short form: "mars", "nov.". */
export function formatMonthShort(localDate) {
  return new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    timeZone: 'UTC',
  }).format(dateAtNoonUtc(localDate));
}

/** Studio calendar date of an instant: "2027-03-02". */
export function localDateOf(instant, timeZone = STUDIO_TIME_ZONE) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(new Date(instant));
}

/** Today in the studio time zone. */
export function studioToday(now = new Date()) {
  return localDateOf(now);
}

/** "2027-03-02" + 3 → "2027-03-05" (calendar arithmetic, no time zone). */
export function addDays(localDate, days) {
  const date = dateAtNoonUtc(localDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Last day of a sale ending at `saleEndsAt` (UTC instant), in studio time:
 * an end at local midnight means "until the previous day included".
 */
export function saleLastDay(saleEndsAt) {
  const time = formatTime(saleEndsAt);
  const day = localDateOf(saleEndsAt);
  return time === '00:00' ? addDays(day, -1) : day;
}
