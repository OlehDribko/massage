import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  bookingsByDate,
  calendarRange,
  dayState,
  hoursLabel,
  isSelectable,
  mergeDays,
  selectionSummary,
  shiftAnchor,
  startOfWeek,
} from '../../src/lib/admin/calendar.js';

const day = (date, patch = {}) => ({
  date,
  weekday: 1,
  closed: false,
  source: 'weekly',
  intervals: [{ start: '09:00', end: '20:30' }],
  closure: null,
  effective: { open: true, intervals: [{ start: '09:00', end: '20:30' }] },
  ...patch,
});

test('week view: Monday to Sunday around any date', () => {
  const range = calendarRange('week', '2027-03-10'); // Wednesday
  assert.equal(range.from, '2027-03-08');
  assert.equal(range.to, '2027-03-14');
  assert.equal(range.dates.length, 7);
  assert.equal(startOfWeek('2027-03-14'), '2027-03-08'); // Sunday
});

test('month view: whole weeks covering the month, within 62 dates', () => {
  const march = calendarRange('month', '2027-03-17');
  assert.equal(march.month, '2027-03');
  assert.equal(march.from, '2027-03-01'); // a Monday
  assert.equal(march.to, '2027-04-04');
  assert.equal(march.dates.length, 35);
  // A month spanning six weeks.
  const may = calendarRange('month', '2027-05-01'); // Saturday
  assert.equal(may.from, '2027-04-26');
  assert.equal(may.to, '2027-06-06');
  assert.equal(may.dates.length, 42);
  assert.ok(may.dates.length <= 62);
});

test('previous / next page', () => {
  assert.equal(shiftAnchor('week', '2027-03-10', 1), '2027-03-15');
  assert.equal(shiftAnchor('week', '2027-03-10', -1), '2027-03-01');
  assert.equal(shiftAnchor('month', '2027-01-20', -1), '2026-12-01');
  assert.equal(shiftAnchor('month', '2027-12-05', 1), '2028-01-01');
});

test('closure, schedule day off and working hours stay distinct', () => {
  // Closed for new bookings although its schedule has hours.
  const closed = dayState(
    day('2027-03-10', {
      closure: { closedAt: '2027-03-01T08:00:00.000Z' },
      effective: { open: false, intervals: [] },
    })
  );
  assert.equal(closed.kind, 'closed');
  assert.equal(closed.scheduleOff, false);

  // Day off by its own schedule, no closure.
  const off = dayState(
    day('2027-03-02', {
      closed: true,
      source: 'exception',
      intervals: [],
      effective: { open: false, intervals: [] },
    })
  );
  assert.equal(off.kind, 'off');

  // Closed AND off by schedule: reopening would not make it a working day.
  const both = dayState(
    day('2027-03-02', {
      closed: true,
      intervals: [],
      closure: { closedAt: '2027-03-01T08:00:00.000Z' },
      effective: { open: false, intervals: [] },
    })
  );
  assert.equal(both.kind, 'closed');
  assert.equal(both.scheduleOff, true);

  // Hours shown are the effective ones, not the schedule's.
  const open = dayState(
    day('2027-03-03', {
      intervals: [{ start: '09:00', end: '20:30' }],
      effective: {
        open: true,
        intervals: [
          { start: '09:00', end: '13:00' },
          { start: '14:00', end: '20:30' },
        ],
      },
    })
  );
  assert.equal(open.kind, 'open');
  assert.equal(hoursLabel(open.hours), '09:00–13:00, 14:00–20:30');
});

test('bookings grouped by their Paris start date, also on closed dates', () => {
  const byDate = bookingsByDate([
    { id: 'b', startsAt: '2027-03-10T15:00:00.000Z' },
    { id: 'a', startsAt: '2027-03-10T08:00:00.000Z' },
    // 23:30 UTC on the 10th = 00:30 on the 11th in Paris.
    { id: 'c', startsAt: '2027-03-10T23:30:00.000Z' },
  ]);
  assert.deepEqual(
    byDate.get('2027-03-10').map((booking) => booking.id),
    ['a', 'b']
  );
  assert.deepEqual(
    byDate.get('2027-03-11').map((booking) => booking.id),
    ['c']
  );
});

test('an action answer replaces only the dates it returns', () => {
  const days = [day('2027-03-10'), day('2027-03-11')];
  const merged = mergeDays(days, [
    day('2027-03-11', { closure: { closedAt: 'x' } }),
  ]);
  assert.equal(merged[0].closure, null);
  assert.deepEqual(merged[1].closure, { closedAt: 'x' });
});

test('selection summary and selectable dates', () => {
  const byDate = new Map([
    ['2027-03-10', day('2027-03-10', { closure: { closedAt: 'x' } })],
    ['2027-03-11', day('2027-03-11')],
  ]);
  const summary = selectionSummary(
    new Set(['2027-03-11', '2027-03-10']),
    byDate
  );
  assert.deepEqual(summary.dates, ['2027-03-10', '2027-03-11']);
  assert.deepEqual(summary.closed, ['2027-03-10']);
  assert.deepEqual(summary.open, ['2027-03-11']);
  assert.equal(isSelectable('2027-03-09', '2027-03-10'), false);
  assert.equal(isSelectable('2027-03-10', '2027-03-10'), true);
  assert.equal(isSelectable('2027-03-10', null), false);
});
