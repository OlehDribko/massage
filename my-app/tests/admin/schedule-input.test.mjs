import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isoWeekday,
  maskTimeInput,
  normalizeIntervals,
  normalizeTime,
  sameAsWeekly,
  toMinutes,
  validateDay,
  weeklyBody,
} from '../../src/lib/booking/schedule.js';

test('times without a colon are understood', () => {
  const cases = {
    12: '12:00',
    9: '09:00',
    930: '09:30',
    1200: '12:00',
    '0900': '09:00',
    '9h30': '09:30',
    '12h': '12:00',
    '9.30': '09:30',
    '9:3': '09:30',
    '12:': '12:00',
    24: '24:00',
    ' 18 ': '18:00',
    '09:00': '09:00',
  };
  for (const [typed, expected] of Object.entries(cases)) {
    assert.equal(normalizeTime(typed), expected, typed);
  }
});

test('impossible times stay as typed and stay invalid', () => {
  for (const typed of ['25', '2430', '1260', 'abc', '', '12345']) {
    assert.equal(normalizeTime(typed), typed);
    assert.equal(toMinutes(typed), null, typed);
  }
});

test('the screenshot case: 09:00 – 1200 is valid and sent as 12:00', () => {
  assert.deepEqual(validateDay([{ start: '09:00', end: '1200' }]), {});
  assert.deepEqual(
    normalizeIntervals([
      { start: '14', end: '1830' },
      { start: '9', end: '12' },
    ]),
    [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '18:30' },
    ]
  );
  assert.deepEqual(weeklyBody({ 1: [{ start: '9', end: '1200' }] }).intervals, [
    { weekday: 1, start: '09:00', end: '12:00' },
  ]);
});

test('a date with the weekly hours of its weekday changes nothing', () => {
  const weekly = [
    { weekday: 1, start: '10:00', end: '13:00' },
    { weekday: 1, start: '14:00', end: '19:00' },
    { weekday: 2, start: '10:00', end: '19:00' },
  ];
  assert.equal(isoWeekday('2026-11-16'), 1); // Monday
  assert.equal(isoWeekday('2026-11-15'), 7); // Sunday
  assert.equal(
    sameAsWeekly(
      '2026-11-16',
      [
        { start: '14', end: '19' },
        { start: '10', end: '13' },
      ],
      weekly
    ),
    true
  );
  assert.equal(
    sameAsWeekly('2026-11-16', [{ start: '10:00', end: '19:00' }], weekly),
    false
  );
  // Sunday is a day off in this week: a day off changes nothing either.
  assert.equal(sameAsWeekly('2026-11-15', [], weekly), true);
  assert.equal(sameAsWeekly('2026-11-17', [], weekly), false);
  assert.equal(sameAsWeekly(null, [], weekly), false);
});

test('the colon appears while typing', () => {
  const steps = {
    1: '1',
    15: '15',
    150: '15:0',
    1500: '15:00',
    15000: '15:00',
  };
  for (const [typed, shown] of Object.entries(steps)) {
    assert.equal(maskTimeInput(typed), shown, typed);
  }
  assert.equal(maskTimeInput('9'), '09');
  assert.equal(maskTimeInput('930'), '09:30');
  assert.equal(maskTimeInput('15:'), '15'); // backspace over the colon
  assert.equal(maskTimeInput('12h3'), '12:3');
  assert.equal(normalizeTime(maskTimeInput('12h3')), '12:30');
  assert.equal(maskTimeInput('abc'), '');
});
