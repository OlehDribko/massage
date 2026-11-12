import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  filterCatalog,
  matchingVariants,
} from '../../src/lib/booking/catalog.js';

const variant = (id, durationMinutes, effectivePriceCents) => ({
  id,
  durationMinutes,
  effectivePriceCents,
});

const CATALOG = [
  {
    key: 'tuina',
    category: 'chinois',
    featured: false,
    variants: [variant('t60', 60, 8500), variant('t90', 90, 12000)],
  },
  {
    key: 'dos',
    category: 'express',
    featured: false,
    variants: [variant('d30', 30, 5000)],
  },
  {
    key: 'sportif',
    category: 'specifiques',
    featured: true,
    variants: [variant('s55', 55, 10000), variant('s120', 120, 18500)],
  },
];

const keys = (list) => list.map((item) => item.key);

test('no filter: everything, popular first, otherwise in order', () => {
  assert.deepEqual(keys(filterCatalog(CATALOG)), ['sportif', 'tuina', 'dos']);
});

test('category and popular filters', () => {
  assert.deepEqual(keys(filterCatalog(CATALOG, { category: 'chinois' })), [
    'tuina',
  ]);
  assert.deepEqual(keys(filterCatalog(CATALOG, { popular: true })), [
    'sportif',
  ]);
});

test('duration and budget must match the same variant', () => {
  assert.deepEqual(keys(filterCatalog(CATALOG, { duration: '30' })), ['dos']);
  // 55 min counts as « 1 h ».
  assert.deepEqual(keys(filterCatalog(CATALOG, { duration: '60' })), [
    'sportif',
    'tuina',
  ]);
  // Sportif 1 h is 100 €: in « 60 – 100 € »; its 2 h is not.
  assert.deepEqual(
    keys(filterCatalog(CATALOG, { duration: '120', budget: '60-100' })),
    []
  );
  assert.deepEqual(keys(filterCatalog(CATALOG, { budget: 'moins-60' })), [
    'dos',
  ]);
});

test('matching variants pick the duration to open the card on', () => {
  assert.deepEqual(
    matchingVariants(CATALOG[0], { duration: '90' }).map((item) => item.id),
    ['t90']
  );
  assert.equal(matchingVariants(CATALOG[0], {}).length, 2);
});
