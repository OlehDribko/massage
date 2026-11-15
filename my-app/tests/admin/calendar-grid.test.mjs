import assert from 'node:assert/strict';
import { test } from 'node:test';

import { newBlockForm } from '../../src/lib/admin/blocks.js';
import {
  freeSegments,
  gapsOf,
  minutesLabel,
  slotAt,
  stepAnchor,
  studioMinute,
  toMinutes,
  visibleRange,
  windowRange,
} from '../../src/lib/admin/calendar.js';

const hours = [
  { start: '09:00', end: '13:00' },
  { start: '14:00', end: '20:00' },
];
const booking = (start, end, status = 'confirmed') => ({
  kind: 'booking',
  id: `b-${start}`,
  start: toMinutes(start),
  end: toMinutes(end),
  item: { status },
});
const block = (start, end) => ({
  kind: 'block',
  id: `k-${start}`,
  start: toMinutes(start),
  end: toMinutes(end),
  item: {},
});

test('phone window: three days from the anchor, across the week end', () => {
  const range = windowRange('2027-03-06'); // Saturday
  assert.deepEqual(range.dates, ['2027-03-06', '2027-03-07', '2027-03-08']);
  assert.equal(range.from, '2027-03-06');
  assert.equal(range.to, '2027-03-08');
});

test('one range per view: week, phone window, month', () => {
  assert.equal(visibleRange('week', '2027-03-10').from, '2027-03-08');
  assert.equal(visibleRange('week', '2027-03-10', true).from, '2027-03-10');
  assert.equal(visibleRange('week', '2027-03-10', true).dates.length, 3);
  // The month view ignores the phone window.
  assert.equal(visibleRange('month', '2027-03-10', true).month, '2027-03');
});

test('step: a week on wide screens, a day on a phone, a month', () => {
  assert.equal(stepAnchor('week', '2027-03-10', 1), '2027-03-15');
  assert.equal(stepAnchor('week', '2027-03-10', -1), '2027-03-01');
  assert.equal(stepAnchor('week', '2027-03-07', 1, true), '2027-03-08');
  assert.equal(stepAnchor('week', '2027-03-08', -1, true), '2027-03-07');
  assert.equal(stepAnchor('month', '2027-03-10', 1, true), '2027-04-01');
});

test('times: minutes and labels', () => {
  assert.equal(toMinutes('09:35'), 575);
  assert.equal(toMinutes('24:00'), 1440);
  assert.equal(toMinutes('9:35'), null);
  assert.equal(minutesLabel(575), '09:35');
  assert.equal(minutesLabel(1440), '24:00');
  // 10:20 UTC in winter = 11:20 in Paris.
  assert.equal(studioMinute(new Date('2027-01-15T10:20:00Z')), 11 * 60 + 20);
});

test('gaps: time outside the working hours', () => {
  assert.deepEqual(gapsOf(hours, 8 * 60, 21 * 60), [
    [480, 540],
    [780, 840],
    [1200, 1260],
  ]);
});

test('free parts: bookings with their break, busy times, the lunch pause', () => {
  const items = [
    booking('10:00', '11:00'),
    block('15:00', '16:30'),
    booking('17:00', '18:00', 'cancelled'),
  ];
  assert.deepEqual(freeSegments(hours, items), [
    [540, 600], // 09:00–10:00
    [675, 780], // 11:15 (after the break) – 13:00
    [840, 900], // 14:00–15:00
    [990, 1200], // 16:30–20:00: the cancelled booking frees its time
  ]);
});

test('free parts: today starts after the current time, short gaps dropped', () => {
  assert.deepEqual(freeSegments(hours, [], { notBefore: 12 * 60 + 52 }), [
    [840, 1200], // 12:55–13:00 is shorter than 15 minutes
  ]);
  assert.deepEqual(
    freeSegments([{ start: '09:00', end: '10:00' }], [block('09:10', '10:00')]),
    []
  );
});

test('a click proposes one hour from its quarter, cut by the next event', () => {
  const segments = freeSegments(hours, [booking('10:30', '11:30')]);
  // 09:20 → the 09:15 row, for one hour, but the booking starts at 10:30.
  assert.deepEqual(slotAt(9 * 60 + 20, segments), { start: 555, end: 615 });
  assert.deepEqual(slotAt(10 * 60, segments), { start: 600, end: 630 });
  // Before the lunch pause: cut at 13:00.
  assert.deepEqual(slotAt(12 * 60 + 40, segments), { start: 750, end: 780 });
  // Last quarter of a part: the start moves back to keep 15 minutes.
  const tight = freeSegments([{ start: '09:00', end: '09:40' }], []);
  assert.deepEqual(slotAt(9 * 60 + 35, tight), { start: 565, end: 580 });
  // On a booking, its break or outside the hours: nothing to propose.
  assert.equal(slotAt(11 * 60, segments), null);
  assert.equal(slotAt(11 * 60 + 40, segments), null);
  assert.equal(slotAt(13 * 60 + 30, segments), null);
});

test('the proposed times fill the form, still editable', () => {
  assert.deepEqual(
    newBlockForm('2027-03-10', { start: '09:15', end: '10:15' }),
    {
      ...newBlockForm('2027-03-10'),
      start: '09:15',
      end: '10:15',
    }
  );
  assert.equal(newBlockForm('2027-03-10').start, '');
});
