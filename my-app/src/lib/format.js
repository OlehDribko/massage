/*
 * Dates, times, prices and durations for the booking screens. The studio
 * works in Europe/Paris; the API sends instants in UTC (…Z) and studio dates
 * as YYYY-MM-DD. Everything is formatted in the studio time zone, whatever
 * the visitor's own zone. Pure — tested with `node --test`.
 */

import { INTL_LOCALES } from '../i18n/config.js';

export const STUDIO_TIME_ZONE = 'Europe/Paris';

const LOCALE = 'fr-FR';

// Duration units per language: "1 h 30" (fr) · "1 h 30 min" (en) · …
const DURATION_UNITS = {
  fr: { h: 'h', min: 'min', mix: (h, m) => `${h} h ${m}` },
  en: { h: 'h', min: 'min', mix: (h, m) => `${h} h ${m} min` },
  uk: { h: 'год', min: 'хв', mix: (h, m) => `${h} год ${m} хв` },
  ru: { h: 'ч', min: 'мин', mix: (h, m) => `${h} ч ${m} мин` },
};
// "mardi 2 mars à 09:15": the word between date and time.
const AT = { fr: 'à', en: 'at', uk: 'о', ru: 'в' };

/** "85 €", "127,50 €" — euro cents as integers, as in the API. */
export function formatPrice(cents, currency = 'EUR', locale = LOCALE) {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    // "€" in every language (uk-UA would print "EUR").
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** "45 min", "1 h", "1 h 30". */
export function formatDuration(minutes, language = 'fr') {
  const units = DURATION_UNITS[language] ?? DURATION_UNITS.fr;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} ${units.min}`;
  return rest === 0
    ? `${hours} ${units.h}`
    : units.mix(hours, String(rest).padStart(2, '0'));
}

/** "09:15" in the studio time zone. */
export function formatTime(
  instant,
  timeZone = STUDIO_TIME_ZONE,
  locale = LOCALE
) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(instant));
}

/** "mardi 2 mars 2027" for an instant, in the studio time zone. */
export function formatDate(
  instant,
  timeZone = STUDIO_TIME_ZONE,
  locale = LOCALE
) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(instant));
}

/** "mardi 2 mars 2027 à 09:15". */
export function formatDateTime(
  instant,
  timeZone = STUDIO_TIME_ZONE,
  locale = LOCALE,
  at = 'à'
) {
  return `${formatDate(instant, timeZone, locale)} ${at} ${formatTime(instant, timeZone, locale)}`;
}

// A studio date (YYYY-MM-DD) has no time zone: format it as a calendar day.
function dateAtNoonUtc(localDate) {
  return new Date(`${localDate}T12:00:00Z`);
}

/** Studio date "2027-03-02" → "mardi 2 mars" (or with the year). */
export function formatLocalDate(localDate, options = {}, locale = LOCALE) {
  const { year = false } = options;
  // An explicit `weekday: undefined` leaves the weekday out.
  const weekday = 'weekday' in options ? options.weekday : 'long';
  return new Intl.DateTimeFormat(locale, {
    ...(weekday ? { weekday } : {}),
    day: 'numeric',
    month: 'long',
    ...(year ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(dateAtNoonUtc(localDate));
}

/** Studio date "2027-03-02" → weekday alone: "mardi" (long) / "mar." (short). */
export function formatWeekday(localDate, style = 'long', locale = LOCALE) {
  return new Intl.DateTimeFormat(locale, {
    weekday: style,
    timeZone: 'UTC',
  }).format(dateAtNoonUtc(localDate));
}

/** Studio date "2027-03-02" → "mars" short form: "mars", "nov.". */
export function formatMonthShort(localDate, locale = LOCALE) {
  return new Intl.DateTimeFormat(locale, {
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

/**
 * The formatters above bound to a site language ('fr' | 'en' | 'uk' | 'ru'):
 * `useFormat()` (client) and `getFormat()` (server) return this object.
 */
export function createFormat(language = 'fr') {
  const locale = INTL_LOCALES[language] ?? LOCALE;
  const at = AT[language] ?? AT.fr;
  return {
    language,
    intlLocale: locale,
    formatPrice: (cents, currency = 'EUR') =>
      formatPrice(cents, currency, locale),
    formatDuration: (minutes) => formatDuration(minutes, language),
    formatTime: (instant, timeZone) => formatTime(instant, timeZone, locale),
    formatDate: (instant, timeZone) => formatDate(instant, timeZone, locale),
    formatDateTime: (instant, timeZone) =>
      formatDateTime(instant, timeZone, locale, at),
    formatLocalDate: (localDate, options) =>
      formatLocalDate(localDate, options, locale),
    formatMonthShort: (localDate) => formatMonthShort(localDate, locale),
    formatWeekday: (localDate, style) =>
      formatWeekday(localDate, style, locale),
    localDateOf,
    studioToday,
    addDays,
    saleLastDay,
  };
}
