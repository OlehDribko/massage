/*
 * Display helpers for the availability API (docs/booking.md §6): starts are
 * on a 15-minute grid, so a day can have 30+ of them — they are grouped by
 * part of the day in studio time. Pure — tested with `node --test`.
 */

import { formatTime, localDateOf } from '../format.js';

/** The picker shows one week (7 studio days) at a time. */
export const WEEK = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// Calendar days between two studio dates (both at noon UTC: no DST issue).
const daysBetween = (from, to) =>
  Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY_MS
  );

/**
 * Week (0 = the one starting today) that holds a start, for a restored
 * choice (`?creneau=`). A start in the past or without "today" → 0.
 */
export function weekOf(startsAt, today) {
  if (!startsAt || !today) return 0;
  const offset = daysBetween(today, localDateOf(startsAt));
  return offset > 0 ? Math.floor(offset / WEEK) : 0;
}

export const DAY_PERIODS = [
  { key: 'morning', label: 'Matin', until: 12 * 60 },
  { key: 'afternoon', label: 'Après-midi', until: 18 * 60 },
  { key: 'evening', label: 'Soir', until: 24 * 60 },
];

/** "09:15" → 555. */
function minutesOf(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Slots of one day → non-empty periods in order:
 * `[{ key, label, slots }]` (slots keep their API order).
 */
export function groupSlotsByPeriod(slots, timeZone) {
  const groups = DAY_PERIODS.map((period) => ({ ...period, slots: [] }));
  for (const slot of slots ?? []) {
    const minute = minutesOf(formatTime(slot.startsAt, timeZone));
    const group =
      groups.find((period) => minute < period.until) ?? groups.at(-1);
    group.slots.push(slot);
  }
  return groups
    .filter((group) => group.slots.length)
    .map(({ key, label, slots: list }) => ({ key, label, slots: list }));
}

/**
 * Day to show in a week: the visitor's own choice when it is in this week,
 * else the day holding the selected start, else the first day with slots,
 * else the first day. `null` for an empty week.
 */
export function pickDay(days, { selectedStart, current } = {}) {
  if (!days?.length) return null;
  if (current && days.some((day) => day.date === current)) return current;
  if (selectedStart) {
    const holder = days.find((day) =>
      day.slots.some((slot) => slot.startsAt === selectedStart)
    );
    if (holder) return holder.date;
  }
  return (days.find((day) => day.slots.length) ?? days[0]).date;
}
