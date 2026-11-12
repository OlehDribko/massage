import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  FORFAITS,
  bestOffer,
  forfaitRows,
} from '../../src/content/forfaits.js';

test('packages: per-session price and saving against the single price', () => {
  const rows = forfaitRows(FORFAITS.endospheres, 11000);
  const six = rows[0];
  assert.equal(six.perSessionCents, 10000);
  assert.equal(six.fullCents, 66000);
  assert.equal(six.savingCents, 6000);
  const twentyFour = rows[3];
  assert.equal(twentyFour.perSessionCents, 7000);
  assert.equal(twentyFour.savingCents, 264000 - 168000);
});

test('no comparison without a single session of the same kind', () => {
  const full = forfaitRows(FORFAITS.endospheres, 11000).at(-1);
  assert.equal(full.fullCents, null);
  assert.equal(full.savingCents, null);
  assert.equal(full.perSessionCents, 12500);
});

test('no saving shown when the package is not cheaper or price unknown', () => {
  const [row] = forfaitRows(
    [{ label: 'x', sessions: 2, priceCents: 30000 }],
    10000
  );
  assert.equal(row.savingCents, null);
  assert.equal(row.fullCents, null);
  assert.equal(forfaitRows(FORFAITS.endospheres, null)[0].savingCents, null);
});

test('best offer: biggest saving, its percent and the lowest session price', () => {
  const best = bestOffer(forfaitRows(FORFAITS.endospheres, 11000));
  assert.equal(best.maxSavingCents, 96000);
  assert.equal(best.maxPercent, 36); // 960 / 2640
  assert.equal(best.minPerSessionCents, 7000);
  assert.deepEqual(bestOffer([]), {
    maxSavingCents: 0,
    maxPercent: 0,
    minPerSessionCents: null,
  });
});
