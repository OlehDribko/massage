import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  addressLine,
  calendarStamp,
  directionsUrl,
  googleCalendarUrl,
  icsContent,
} from '../../src/lib/booking/calendar.js';
import { groupSlotsByPeriod, pickDay } from '../../src/lib/booking/slots.js';

const slot = (startsAt) => ({ startsAt, endsAt: startsAt });

test('slots are grouped by part of the day in Paris time', () => {
  // Winter: Paris = UTC+1.
  const groups = groupSlotsByPeriod([
    slot('2027-03-02T08:00:00.000Z'), // 09:00
    slot('2027-03-02T10:45:00.000Z'), // 11:45
    slot('2027-03-02T11:00:00.000Z'), // 12:00
    slot('2027-03-02T16:45:00.000Z'), // 17:45
    slot('2027-03-02T17:00:00.000Z'), // 18:00
  ]);
  assert.deepEqual(
    groups.map((group) => [group.label, group.slots.length]),
    [
      ['Matin', 2],
      ['Après-midi', 2],
      ['Soir', 1],
    ]
  );
});

test('empty periods are left out', () => {
  const groups = groupSlotsByPeriod([slot('2027-07-02T15:00:00.000Z')]); // 17:00 summer
  assert.deepEqual(
    groups.map((group) => group.key),
    ['afternoon']
  );
  assert.deepEqual(groupSlotsByPeriod([]), []);
});

test('pickDay prefers the visitor’s day, then the selected start, then the first open day', () => {
  const days = [
    { date: '2027-03-01', slots: [] },
    { date: '2027-03-02', slots: [slot('2027-03-02T08:00:00.000Z')] },
    { date: '2027-03-03', slots: [slot('2027-03-03T08:00:00.000Z')] },
  ];
  assert.equal(pickDay(days), '2027-03-02');
  assert.equal(pickDay(days, { current: '2027-03-01' }), '2027-03-01');
  assert.equal(
    pickDay(days, {
      selectedStart: '2027-03-03T08:00:00.000Z',
      current: '2027-03-02',
    }),
    '2027-03-02'
  );
  assert.equal(
    pickDay(days, { selectedStart: '2027-03-03T08:00:00.000Z' }),
    '2027-03-03'
  );
  assert.equal(pickDay(days, { current: '2027-04-01' }), '2027-03-02');
  assert.equal(pickDay([{ date: '2027-03-01', slots: [] }]), '2027-03-01');
  assert.equal(pickDay([]), null);
});

const booking = {
  id: 'b7e1',
  startsAt: '2027-03-02T08:00:00.000Z',
  endsAt: '2027-03-02T09:00:00.000Z',
  service: { name: 'Massage pierres chaudes' },
};
const business = {
  name: 'Massage by Stefania Ben',
  address: { street: '23 rue Castéja', postalCode: '33000', city: 'Bordeaux' },
};

test('calendar links carry the booking times in UTC', () => {
  assert.equal(calendarStamp(booking.startsAt), '20270302T080000Z');
  assert.equal(addressLine(business.address), '23 rue Castéja, 33000 Bordeaux');
  const url = new URL(googleCalendarUrl(booking, business));
  assert.equal(
    url.searchParams.get('dates'),
    '20270302T080000Z/20270302T090000Z'
  );
  assert.equal(
    url.searchParams.get('text'),
    'Massage pierres chaudes — Massage by Stefania Ben'
  );
  assert.equal(
    new URL(directionsUrl(business.address)).searchParams.get('destination'),
    '23 rue Castéja, 33000 Bordeaux'
  );
});

test('ics file is valid iCalendar text with escaped values', () => {
  const ics = icsContent(booking, business, new Date('2027-03-01T00:00:00Z'));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.includes('DTSTART:20270302T080000Z\r\n'));
  assert.ok(ics.includes('DTEND:20270302T090000Z\r\n'));
  assert.ok(ics.includes('LOCATION:23 rue Castéja\\, 33000 Bordeaux\r\n'));
  assert.ok(ics.includes('UID:b7e1@reservation\r\n'));
});
