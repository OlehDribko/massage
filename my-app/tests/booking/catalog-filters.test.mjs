import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  OTHERS,
  PROMOTIONS,
  catalogSections,
  hasPromotion,
  shownVariant,
} from '../../src/lib/booking/catalog.js';

const variant = (id, durationMinutes, priceCents, salePriceCents = null) => ({
  id,
  durationMinutes,
  priceCents,
  salePriceCents,
  saleEndsAt: salePriceCents ? '2026-12-01T00:00:00.000Z' : null,
  effectivePriceCents: salePriceCents ?? priceCents,
});

const CATEGORIES = [
  { key: 'chinois' },
  { key: 'specifiques' },
  { key: 'express' },
];

const CATALOG = [
  {
    key: 'tuina',
    category: 'chinois',
    variants: [
      variant('t30', 30, 5000),
      variant('t60', 60, 8500),
      variant('t90', 90, 12000),
    ],
  },
  {
    key: 'sportif',
    category: 'specifiques',
    variants: [variant('s55', 55, 10000), variant('s90', 90, 14000, 12000)],
  },
  {
    key: 'dos',
    category: 'express',
    variants: [variant('d30', 30, 5000)],
  },
  { key: 'api-only', category: null, variants: [variant('x45', 45, 7000)] },
];

const shape = (sections) =>
  sections.map((section) => [
    section.key,
    section.items.map((item) => item.key),
  ]);

test('everything: one section per category in order, then the others', () => {
  assert.deepEqual(shape(catalogSections(CATALOG, CATEGORIES)), [
    ['chinois', ['tuina']],
    ['specifiques', ['sportif']],
    ['express', ['dos']],
    [OTHERS, ['api-only']],
  ]);
  // An unknown filter shows everything too.
  assert.equal(catalogSections(CATALOG, CATEGORIES, 'nope').length, 4);
});

test('one category: only its section', () => {
  assert.deepEqual(shape(catalogSections(CATALOG, CATEGORIES, 'express')), [
    ['express', ['dos']],
  ]);
});

test('promotions: one section of the prestations on sale, or none', () => {
  assert.deepEqual(shape(catalogSections(CATALOG, CATEGORIES, PROMOTIONS)), [
    [PROMOTIONS, ['sportif']],
  ]);
  assert.deepEqual(catalogSections([CATALOG[0]], CATEGORIES, PROMOTIONS), []);
  assert.equal(hasPromotion(CATALOG[1]), true);
  assert.equal(hasPromotion(CATALOG[0]), false);
});

test('shown duration: the one on sale, else the closest to 1 h', () => {
  assert.equal(shownVariant(CATALOG[0]).id, 't60');
  assert.equal(shownVariant(CATALOG[1]).id, 's90');
  assert.equal(shownVariant(CATALOG[2]).id, 'd30');
  // 45 and 75 min are as close to 1 h: the shorter one.
  assert.equal(
    shownVariant({ variants: [variant('a', 45, 1), variant('b', 75, 1)] }).id,
    'a'
  );
});
