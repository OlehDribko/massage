/*
 * Admin calendar (Massage-backend docs/frontend-handoff.md §1–2): one
 * request for the schedule days and one for the bookings of the visible
 * range (a week, or the weeks covering a month: at most 62 dates).
 *
 * Three things the API keeps apart and so does the UI:
 * - the date's schedule (`closed`, `source`, `intervals`): what the date
 *   returns to after a reopening;
 * - `closure`: an extra closing for new bookings and moves;
 * - `effective`: the working hours in force. NOT free times — free starts
 *   come only from the public availability API.
 * Pure — tested with `node --test`.
 */

import { addDays, localDateOf } from '../format.js';

export const MAX_RANGE_DAYS = 62;
export const VIEWS = ['week', 'month'];

/** ISO weekday of a studio date: 1 = Monday … 7 = Sunday. */
export function weekdayOf(localDate) {
  const day = new Date(`${localDate}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/** Monday of the week holding `localDate`. */
export function startOfWeek(localDate) {
  return addDays(localDate, 1 - weekdayOf(localDate));
}

/** "2027-03-17" → "2027-03-01". */
export function startOfMonth(localDate) {
  return `${localDate.slice(0, 8)}01`;
}

/** First day of the next (delta 1) or previous (-1) month. */
export function shiftMonth(localDate, delta) {
  const [year, month] = localDate.split('-').map(Number);
  const index = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
}

/**
 * Dates shown for a view around `anchor`:
 * - week: Monday → Sunday (7 dates);
 * - month: full weeks covering the month (28–42 dates, under the 62 limit).
 * `{ from, to, dates, month }` (`month` = "YYYY-MM" of the month view).
 */
export function calendarRange(view, anchor) {
  if (view === 'month') {
    const first = startOfMonth(anchor);
    const last = addDays(shiftMonth(first, 1), -1);
    const from = startOfWeek(first);
    const to = addDays(startOfWeek(last), 6);
    return {
      from,
      to,
      dates: datesBetween(from, to),
      month: first.slice(0, 7),
    };
  }
  const from = startOfWeek(anchor);
  const to = addDays(from, 6);
  return { from, to, dates: datesBetween(from, to), month: null };
}

/** Anchor of the previous / next page of a view. */
export function shiftAnchor(view, anchor, delta) {
  return view === 'month'
    ? shiftMonth(anchor, delta)
    : addDays(startOfWeek(anchor), 7 * delta);
}

export function datesBetween(from, to) {
  const dates = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    dates.push(date);
    if (dates.length > MAX_RANGE_DAYS) break;
  }
  return dates;
}

/**
 * What a schedule day means for the admin:
 * - 'closed': closed for new bookings (closure), whatever its schedule;
 * - 'off': no working hours in its own schedule (day off);
 * - 'open': working hours in force (`hours` = effective intervals).
 * `scheduleOff` tells whether the date stays without hours after a reopen.
 */
export function dayState(day) {
  if (!day) return { kind: 'unknown', hours: [], scheduleOff: false };
  const scheduleOff = Boolean(day.closed) || !day.intervals?.length;
  if (day.closure) {
    return { kind: 'closed', hours: [], scheduleOff };
  }
  if (!day.effective?.open || !day.effective.intervals?.length) {
    return { kind: 'off', hours: [], scheduleOff: true };
  }
  return { kind: 'open', hours: day.effective.intervals, scheduleOff };
}

/** "09:00–13:00, 14:00–20:30". */
export function hoursLabel(intervals) {
  return (intervals ?? [])
    .map(({ start, end }) => `${start}–${end}`)
    .join(', ');
}

/** Bookings by studio date of their start, each list by start time. */
export function bookingsByDate(bookings, timeZone) {
  const byDate = new Map();
  for (const booking of bookings ?? []) {
    const date = localDateOf(booking.startsAt, timeZone);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(booking);
  }
  for (const list of byDate.values()) {
    list.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  }
  return byDate;
}

/** Days of a closure/reopen answer merged into the loaded ones. */
export function mergeDays(days, updated) {
  const byDate = new Map((updated ?? []).map((day) => [day.date, day]));
  return (days ?? []).map((day) => byDate.get(day.date) ?? day);
}

/**
 * Which of the selected dates a bulk action would change: closing skips
 * dates already closed, reopening skips dates without a closure. Both
 * requests are safe to repeat; this only makes the summary honest.
 */
export function selectionSummary(selected, daysByDate) {
  const dates = [...selected].sort();
  const closed = dates.filter((date) => daysByDate.get(date)?.closure);
  const open = dates.filter((date) => !daysByDate.get(date)?.closure);
  return { dates, closed, open };
}

/** Selectable for a bulk action: today or later (studio date). */
export function isSelectable(date, today) {
  return Boolean(today) && date >= today;
}
