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

/* --- Phones: a window of consecutive days ---------------------------------- */

/** Days shown at once on a phone; buttons and swipes move it by one day. */
export const COMPACT_DAYS = 3;

/** `days` consecutive dates from `anchor` (may cross a week boundary). */
export function windowRange(anchor, days = COMPACT_DAYS) {
  const to = addDays(anchor, days - 1);
  return { from: anchor, to, dates: datesBetween(anchor, to), month: null };
}

/**
 * The page shown for a view: month, week (Monday → Sunday) or, on a phone
 * (`compact`), COMPACT_DAYS days from the anchor. The title, the columns
 * and both requests use this one range.
 */
export function visibleRange(view, anchor, compact = false) {
  return view === 'week' && compact
    ? windowRange(anchor)
    : calendarRange(view, anchor);
}

/** Anchor of the previous / next page: one day in the phone window. */
export function stepAnchor(view, anchor, delta, compact = false) {
  return view === 'week' && compact
    ? addDays(anchor, delta)
    : shiftAnchor(view, anchor, delta);
}

/* --- Time grid ------------------------------------------------------------- */

/** Rows of the grid (minutes). */
export const SLOT_MINUTES = 15;
/** docs/booking.md §2: one break kept free after each session. */
export const BREAK_MINUTES = 15;
/** Proposed length of a new busy time; shorter when the gap is shorter. */
export const SUGGESTED_MINUTES = 60;
/** Shortest busy time the API accepts (lib/admin/blocks.js MIN_MINUTES). */
export const SHORTEST_MINUTES = 15;
const DAY_MINUTES = 24 * 60;

/** "09:35" → 575 ("24:00" → 1440); null when not a time. */
export function toMinutes(time) {
  const match = /^(\d{2}):(\d{2})$/.exec(time ?? '');
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes <= DAY_MINUTES ? minutes : null;
}

/** 575 → "09:35" (1440 → "24:00"). */
export function minutesLabel(minutes) {
  const hours = Math.floor(minutes / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Minute of the day at `now` in the studio's time zone. */
export function studioMinute(now = new Date(), timeZone = 'Europe/Paris') {
  const [hours, minutes] = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  })
    .format(now)
    .split(':')
    .map(Number);
  return hours * 60 + minutes;
}

/** Parts of [from, to] (minutes) not covered by the working intervals. */
export function gapsOf(intervals, from, to) {
  const ranges = (intervals ?? [])
    .map(({ start, end }) => [toMinutes(start), toMinutes(end)])
    .filter(([a, b]) => a !== null && b !== null)
    .sort((x, y) => x[0] - y[0]);
  const gaps = [];
  let cursor = from;
  for (const [a, b] of ranges) {
    if (a > cursor) gaps.push([cursor, Math.min(a, to)]);
    cursor = Math.max(cursor, b);
  }
  if (cursor < to) gaps.push([cursor, to]);
  return gaps.filter(([a, b]) => b > a);
}

/**
 * Free parts of the working hours, as [start, end] minutes: without the
 * bookings (and the break after each one, cancelled ones ignored), the
 * busy times and, today, the time already past (`notBefore`). Parts
 * shorter than the shortest busy time are left out.
 * `items`: agendaItems() of the date.
 */
export function freeSegments(
  intervals,
  items,
  { notBefore = 0, breakMinutes = BREAK_MINUTES } = {}
) {
  const busy = (items ?? [])
    .filter(
      (entry) => entry.kind === 'block' || entry.item?.status !== 'cancelled'
    )
    .map((entry) => [
      entry.start,
      entry.kind === 'booking'
        ? Math.min(DAY_MINUTES, entry.end + breakMinutes)
        : entry.end,
    ])
    .sort((a, b) => a[0] - b[0]);
  const floor = Math.ceil(notBefore / 5) * 5;
  const segments = [];
  for (const { start, end } of intervals ?? []) {
    let from = toMinutes(start);
    const to = toMinutes(end);
    if (from === null || to === null) continue;
    from = Math.max(from, floor);
    let cursor = from;
    for (const [a, b] of busy) {
      if (b <= cursor || a >= to) continue;
      if (a > cursor) segments.push([cursor, a]);
      cursor = Math.max(cursor, b);
      if (cursor >= to) break;
    }
    if (cursor < to) segments.push([cursor, to]);
  }
  return segments.filter(([a, b]) => b - a >= SHORTEST_MINUTES);
}

/**
 * What a click at `minute` proposes: from the 15-minute row it falls in
 * (never before the free part starts) for SUGGESTED_MINUTES, cut at the
 * next booking, busy time or break. Near the end of a free part the start
 * moves back so the time keeps the shortest length. null outside the free
 * parts. → { start, end } in minutes.
 */
export function slotAt(minute, segments) {
  const segment = (segments ?? []).find(([a, b]) => minute >= a && minute < b);
  if (!segment) return null;
  const [from, to] = segment;
  let start = Math.max(from, Math.floor(minute / SLOT_MINUTES) * SLOT_MINUTES);
  if (to - start < SHORTEST_MINUTES) start = to - SHORTEST_MINUTES;
  if (start < from) return null;
  return { start, end: Math.min(to, start + SUGGESTED_MINUTES) };
}
