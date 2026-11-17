import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BLOCK_SOURCES,
  createBody,
  newBlockForm,
  patchBody,
  sourceOptions,
  validateBlockForm,
} from '../../src/lib/admin/blocks.js';
import {
  isCompleteTime,
  overwriteTimeDigit,
} from '../../src/lib/booking/schedule.js';

test('a digit replaces the one at the caret, the colon is skipped', () => {
  // 09:30, caret before 3, "4" → 09:40, caret after the 4.
  assert.deepEqual(overwriteTimeDigit('09:30', 3, 3, '4'), {
    value: '09:40',
    caret: 4,
  });
  // Caret right before the colon: writes the first minute digit.
  assert.deepEqual(overwriteTimeDigit('09:30', 2, 2, '4'), {
    value: '09:40',
    caret: 4,
  });
  // Second hour digit: the caret jumps over the colon.
  assert.deepEqual(overwriteTimeDigit('09:30', 1, 1, '8'), {
    value: '08:30',
    caret: 3,
  });
  assert.deepEqual(overwriteTimeDigit('09:30', 0, 0, '1'), {
    value: '19:30',
    caret: 1,
  });
  // Last digit: the caret ends at the end of the time.
  assert.deepEqual(overwriteTimeDigit('09:30', 4, 4, '5'), {
    value: '09:35',
    caret: 5,
  });
  // 24:00 stays reachable for an end.
  assert.equal(overwriteTimeDigit('20:00', 1, 1, '4').value, '24:00');
});

test('selection, paste, unfinished value or caret at the end: usual input', () => {
  assert.equal(overwriteTimeDigit('09:30', 0, 5, '1'), null);
  assert.equal(overwriteTimeDigit('09:30', 5, 5, '1'), null);
  assert.equal(overwriteTimeDigit('09:3', 1, 1, '1'), null);
  assert.equal(overwriteTimeDigit('09:30', 1, 1, '12'), null);
  assert.equal(overwriteTimeDigit('09:30', 1, 1, 'a'), null);
});

test('complete time: 24:00 only where midnight is allowed', () => {
  assert.equal(isCompleteTime('09:35'), true);
  assert.equal(isCompleteTime('09:3'), false);
  assert.equal(isCompleteTime('25:00'), false);
  assert.equal(isCompleteTime('24:00'), false);
  assert.equal(isCompleteTime('24:00', { allowMidnight: true }), true);
});

test('source: Treatwell or Planity, chosen explicitly, sent as the title', () => {
  assert.deepEqual(BLOCK_SOURCES, ['Treatwell', 'Planity']);
  assert.deepEqual(sourceOptions(''), ['Treatwell', 'Planity']);
  assert.deepEqual(sourceOptions('Planity'), ['Treatwell', 'Planity']);
  const form = {
    ...newBlockForm('2027-03-10', { start: '09:00', end: '10:00' }),
  };
  assert.equal(form.title, '');
  assert.equal(
    validateBlockForm(form, '2027-03-01').title,
    'Choisissez la source : Treatwell ou Planity.'
  );
  const body = createBody({ ...form, title: 'Treatwell', note: ' Marie D. ' });
  assert.equal(body.title, 'Treatwell');
  assert.equal(body.note, 'Marie D.');
});

test('an older free title stays until another source is picked', () => {
  const block = {
    id: 'k1',
    title: 'Rendez-vous personnel',
    note: null,
    start: '2027-03-10T09:00',
    end: '2027-03-10T10:00',
  };
  assert.deepEqual(sourceOptions(block.title), [
    'Rendez-vous personnel',
    'Treatwell',
    'Planity',
  ]);
  const kept = {
    date: '2027-03-10',
    start: '09:00',
    end: '10:00',
    title: 'Rendez-vous personnel',
    note: 'Client: Marie',
    lockedBounds: null,
  };
  assert.deepEqual(patchBody(block, kept), { note: 'Client: Marie' });
  assert.deepEqual(patchBody(block, { ...kept, note: '', title: 'Planity' }), {
    title: 'Planity',
  });
});
