import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  profileChanges,
  profileServerErrors,
  validateName,
  validatePhone,
} from '../../src/lib/account/profile.js';
import {
  splitBookings,
  sortDayBookings,
} from '../../src/lib/booking/bookings.js';
import {
  buildCatalog,
  findPrestation,
  hasActiveSale,
  lowestPrice,
} from '../../src/lib/booking/catalog.js';
import { SERVICE_GROUPS } from '../../src/content/services.js';
import {
  adminNotificationLabel,
  bookingErrorMessage,
  clientNotificationText,
  isRetryable,
  readinessSteps,
} from '../../src/lib/booking/labels.js';
import {
  hasErrors,
  toMinutes,
  validateDay,
  weeklyBody,
  weeklyByDay,
} from '../../src/lib/booking/schedule.js';
import {
  addDays,
  formatDuration,
  formatPrice,
  formatTime,
  localDateOf,
  saleLastDay,
} from '../../src/lib/format.js';

// Intl uses narrow no-break spaces in French: compare without them.
const plain = (text) => text.replace(/[  ]/g, ' ');

test('format: euro cents, durations', () => {
  assert.equal(plain(formatPrice(8500)), '85 €');
  assert.equal(plain(formatPrice(12750)), '127,50 €');
  assert.equal(formatDuration(45), '45 min');
  assert.equal(formatDuration(60), '1 h');
  assert.equal(formatDuration(90), '1 h 30');
  assert.equal(formatDuration(85), '1 h 25');
});

test('format: studio time in Europe/Paris across DST (docs: 08:00Z → 07:00Z)', () => {
  // 09:00 in Paris is 08:00Z before 28.03.2027 and 07:00Z after.
  assert.equal(formatTime('2027-03-26T08:00:00.000Z'), '09:00');
  assert.equal(formatTime('2027-03-29T07:00:00.000Z'), '09:00');
  // Late UTC evening is already the next day in Paris.
  assert.equal(localDateOf('2027-03-01T23:30:00.000Z'), '2027-03-02');
});

test('format: calendar arithmetic and sale last day', () => {
  assert.equal(addDays('2027-03-01', 45), '2027-04-15');
  assert.equal(addDays('2027-03-31', 1), '2027-04-01');
  // Ends 1 Dec 00:00 Paris (23:00Z) → valid until 30 November.
  assert.equal(saleLastDay('2026-11-30T23:00:00.000Z'), '2026-11-30');
  // Summer offset +2: ends 1 July 00:00 Paris.
  assert.equal(saleLastDay('2027-06-30T22:00:00.000Z'), '2027-06-30');
  // Ends at 18:00 Paris: that day is the last one.
  assert.equal(saleLastDay('2026-11-30T17:00:00.000Z'), '2026-11-30');
});

const svc = (name, durationMinutes, priceCents, sale = null, id) => ({
  id: id ?? `${name}-${durationMinutes}`,
  name,
  durationMinutes,
  priceCents,
  effectivePriceCents: sale?.price ?? priceCents,
  salePriceCents: sale?.price ?? null,
  saleEndsAt: sale?.endsAt ?? null,
  currency: 'EUR',
});

test('catalog: durations grouped by editorial ids, never by name alone', () => {
  const groups = [
    {
      key: 'sportif',
      serviceIds: ['s120', 's55', 'gone'],
      description: null,
      featured: true,
    },
    { key: 'endo', serviceIds: ['e45'], description: 'Texte validé' },
  ];
  const catalog = buildCatalog(
    [
      svc('Massage sportif', 120, 18500, null, 's120'),
      svc('Endosphères — demi-corps, une séance', 45, 11000, null, 'e45'),
      svc('Massage sportif', 55, 10000, null, 's55'),
      // Same name, but not listed in the layer: its own card.
      svc('Massage sportif', 30, 5000, null, 'new30'),
    ],
    groups
  );
  assert.deepEqual(
    catalog.map((p) => p.key),
    ['sportif', 'endo', 'new30']
  );
  assert.deepEqual(
    catalog[0].variants.map((s) => s.id),
    ['s55', 's120']
  );
  assert.equal(catalog[0].featured, true);
  assert.equal(catalog[1].description, 'Texte validé');
  assert.equal(lowestPrice(catalog[0]), 10000);
  assert.equal(findPrestation(catalog, 's120').key, 'sportif');
  assert.equal(findPrestation(catalog, 'nope'), null);
});

test('catalog: a renamed variant leaves its group', () => {
  const catalog = buildCatalog(
    [svc('A', 60, 1, null, 'a60'), svc('A (nouveau)', 90, 2, null, 'a90')],
    [{ key: 'a', serviceIds: ['a60', 'a90'], description: null }]
  );
  assert.deepEqual(
    catalog.map((p) => p.key),
    ['a', 'a90']
  );
});

test('editorial layer: 35 distinct ids in 18 prestations, no business data', () => {
  const ids = SERVICE_GROUPS.flatMap((group) => group.serviceIds);
  assert.equal(SERVICE_GROUPS.length, 18);
  assert.equal(ids.length, 35);
  assert.equal(new Set(ids).size, 35);
  for (const group of SERVICE_GROUPS) {
    assert.deepEqual(
      Object.keys(group).filter(
        (key) => !['key', 'serviceIds', 'description', 'featured'].includes(key)
      ),
      []
    );
  }
});

test('catalog: a sale only when the API reports one', () => {
  assert.equal(hasActiveSale(svc('A', 60, 8500)), false);
  assert.equal(
    hasActiveSale(
      svc('A', 60, 8500, { price: 6900, endsAt: '2026-11-30T23:00:00Z' })
    ),
    true
  );
});

test('readiness: documented blockers → steps that keep the booking context', () => {
  const steps = readinessSteps(
    [
      'anonymous_session',
      'email_not_verified',
      'name_missing',
      'phone_missing',
    ],
    { returnTo: '/prestations/x?creneau=2027-03-02T08:00:00Z' }
  );
  assert.equal(steps.length, 4);
  assert.match(
    steps[0].href,
    /^\/connexion\?retour=%2Fprestations%2Fx%3Fcreneau%3D/
  );
  assert.equal(steps[2].href.endsWith('#profil'), true);
  // Unknown blockers are ignored, not shown raw.
  assert.deepEqual(readinessSteps(['something_new']), []);
  assert.equal(readinessSteps(['not_a_client'])[0].href, undefined);
});

test('errors: French texts, never raw codes; retryable only when safe', () => {
  const slot = { code: 'SLOT_UNAVAILABLE', details: { reason: 'too_soon' } };
  assert.match(bookingErrorMessage(slot), /12 heures/);
  assert.doesNotMatch(bookingErrorMessage({ code: 'WHATEVER' }), /WHATEVER/);
  assert.equal(isRetryable({ code: 'CALENDAR_BUSY' }), true);
  assert.equal(isRetryable({ code: 'NETWORK_ERROR' }), true);
  assert.equal(isRetryable({ code: 'SLOT_UNAVAILABLE', status: 409 }), false);
});

test('notifications: client texts and admin labels', () => {
  assert.match(clientNotificationText({ status: 'accepted' }), /envoyé/);
  assert.match(
    clientNotificationText({
      event: 'cancelled',
      status: 'failed',
      reason: 'not_sent',
    }),
    /^L’annulation est bien enregistrée, mais/
  );
  assert.match(
    clientNotificationText({
      event: 'rescheduled',
      status: 'failed',
      reason: 'not_sent',
    }),
    /^Le nouvel horaire est bien enregistré/
  );
  assert.match(
    clientNotificationText({
      event: 'created',
      status: 'pending',
      reason: null,
    }),
    /en cours d’envoi/
  );
  assert.equal(clientNotificationText({ status: 'skipped' }), null);
  assert.equal(clientNotificationText(null), null);
  assert.equal(
    adminNotificationLabel({ status: 'failed', reason: 'no_valid_address' }),
    'Échec (adresse invalide)'
  );
  assert.equal(
    adminNotificationLabel({ status: 'failed', reason: 'brand_new_reason' }),
    'Échec (autre)'
  );
});

test('schedule: HH:MM up to 24:00, overlap and order checks', () => {
  assert.equal(toMinutes('24:00'), 1440);
  assert.equal(toMinutes('24:30'), null);
  assert.equal(toMinutes('9:00'), null);
  assert.deepEqual(
    validateDay([
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '20:30' },
    ]),
    {}
  );
  assert.ok(validateDay([{ start: '13:00', end: '09:00' }])[0]);
  const overlap = validateDay([
    { start: '09:00', end: '13:00' },
    { start: '12:00', end: '14:00' },
  ]);
  assert.ok(overlap[1]);
  const many = validateDay(
    Array.from({ length: 7 }, (_, i) => ({
      start: `${String(i * 2).padStart(2, '0')}:00`,
      end: `${String(i * 2 + 1).padStart(2, '0')}:00`,
    }))
  );
  assert.ok(many.day);
  assert.equal(hasErrors({ 1: {}, 2: { 0: 'x' } }), true);
});

test('schedule: API weekly list ↔ per-day editor round trip', () => {
  const weekly = [
    { weekday: 1, start: '14:00', end: '20:30' },
    { weekday: 1, start: '09:00', end: '13:00' },
    { weekday: 6, start: '10:00', end: '16:00' },
  ];
  const days = weeklyByDay(weekly);
  assert.deepEqual(
    days[1].map((i) => i.start),
    ['09:00', '14:00']
  );
  assert.deepEqual(days[7], []);
  assert.deepEqual(weeklyBody(days), {
    intervals: [
      { weekday: 1, start: '09:00', end: '13:00' },
      { weekday: 1, start: '14:00', end: '20:30' },
      { weekday: 6, start: '10:00', end: '16:00' },
    ],
  });
});

test('profile: same rules as the API, only changed fields, null clears', () => {
  assert.equal(validateName('Léa Martin-Dupont'), null);
  assert.equal(validateName("O'Neil Jr."), null);
  assert.ok(validateName('L3a'));
  assert.ok(validateName('x'.repeat(81)));
  assert.equal(validatePhone('+33 6 12 34 56 78'), null);
  assert.ok(validatePhone('06 12 34 56 78'));

  const profile = { name: 'Léa', phone: '+33612345678' };
  assert.equal(
    profileChanges(profile, { name: 'Léa', phone: '+33 6 12 34 56 78' }),
    null
  );
  assert.deepEqual(
    profileChanges(profile, { name: '', phone: '+33612345678' }),
    { name: null }
  );
  assert.deepEqual(
    profileChanges(profile, { name: 'Léa', phone: '+33700000000' }),
    {
      phone: '+33700000000',
    }
  );
  assert.deepEqual(
    Object.keys(
      profileServerErrors({
        details: { errors: [{ field: ['phone'], message: 'x' }] },
      })
    ),
    ['phone']
  );
});

test('bookings: upcoming soonest first, past latest first; admin day order', () => {
  const b = (id, startsAt, phase, status = 'confirmed') => ({
    id,
    startsAt,
    phase,
    status,
  });
  const { upcoming, past } = splitBookings([
    b('late', '2027-03-05T08:00:00Z', 'upcoming'),
    b('old', '2027-01-01T08:00:00Z', 'finished'),
    b('soon', '2027-03-02T08:00:00Z', 'upcoming'),
    b('gone', '2027-02-01T08:00:00Z', 'cancelled', 'cancelled'),
  ]);
  assert.deepEqual(
    upcoming.map((x) => x.id),
    ['soon', 'late']
  );
  assert.deepEqual(
    past.map((x) => x.id),
    ['gone', 'old']
  );
  assert.deepEqual(
    sortDayBookings([
      b('c', '2027-03-02T09:00:00Z', 'cancelled', 'cancelled'),
      b('a', '2027-03-02T09:00:00Z', 'upcoming'),
      b('z', '2027-03-02T08:00:00Z', 'upcoming'),
    ]).map((x) => x.id),
    ['z', 'a', 'c']
  );
});
