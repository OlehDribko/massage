import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  agendaItems,
  applyBlockChange,
  blockDates,
  blockErrorMessage,
  blockSpanOn,
  blockTimeLabel,
  blockToForm,
  conflictsOf,
  createBlockIntent,
  createBody,
  fieldErrorsFrom,
  formBounds,
  isBlockOver,
  isOneDayBlock,
  layoutLanes,
  newBlockForm,
  patchBody,
  validateBlockForm,
} from '../../src/lib/admin/blocks.js';
import { validatorFor } from '../../src/lib/api/contract.js';
import { ApiError } from '../../src/lib/auth/session.js';

// API block, as in docs/openapi.json (ScheduleBlock).
const block = (overrides = {}) => ({
  id: 'b-1',
  title: 'Planity',
  note: null,
  start: '2027-03-03T14:00',
  end: '2027-03-03T15:00',
  startsAt: '2027-03-03T13:00:00.000Z',
  endsAt: '2027-03-03T14:00:00.000Z',
  createdAt: '2027-03-01T08:00:00.000Z',
  updatedAt: '2027-03-01T08:00:00.000Z',
  ...overrides,
});

const form = (overrides = {}) => ({
  ...newBlockForm('2027-03-03'),
  start: '14:00',
  end: '15:00',
  title: 'Planity',
  ...overrides,
});

// ---------------------------------------------------------------------------
// Contract of a block answer.

test('contract: block answers pass, a missing or mistyped field is reported by path', () => {
  const result = { timeZone: 'Europe/Paris', block: block() };
  assert.equal(validatorFor('scheduleBlock')(result), null);
  assert.equal(
    validatorFor('scheduleBlockUpdate')({ ...result, changed: true }),
    null
  );
  assert.equal(
    validatorFor('scheduleBlocks')({
      timeZone: 'Europe/Paris',
      blocks: [block(), block({ id: 'b-2', note: 'Texte' })],
    }),
    null
  );
  assert.equal(
    validatorFor('scheduleBlockDeleted')({ id: 'b-1', deleted: false }),
    null
  );

  const { start, ...withoutStart } = block();
  assert.ok(start);
  assert.deepEqual(
    validatorFor('scheduleBlock')({ ...result, block: withoutStart }),
    { path: 'block.start', expected: 'present' }
  );
  assert.deepEqual(
    validatorFor('scheduleBlock')({ ...result, block: block({ note: 3 }) }),
    { path: 'block.note', expected: 'string|null' }
  );
  assert.deepEqual(validatorFor('scheduleBlockUpdate')({ ...result }), {
    path: 'changed',
    expected: 'present',
  });
  assert.equal(
    validatorFor('scheduleBlockDeleted')({ id: 'b-1' })?.path,
    'deleted'
  );
});

test('contract: schedule days with blocks, and without them (API before the migration)', () => {
  const day = {
    date: '2027-03-03',
    weekday: 3,
    closed: false,
    source: 'weekly',
    intervals: [{ start: '09:00', end: '20:30' }],
    closure: null,
    effective: { open: true, intervals: [{ start: '09:00', end: '20:30' }] },
  };
  const check = validatorFor('scheduleDays');
  assert.equal(
    check({ timeZone: 'Europe/Paris', days: [{ ...day, blocks: [block()] }] }),
    null
  );
  assert.equal(check({ timeZone: 'Europe/Paris', days: [day] }), null);
  assert.equal(
    check({
      timeZone: 'Europe/Paris',
      days: [{ ...day, blocks: [{ id: 'x' }] }],
    })?.path,
    'days[0].blocks[0].title'
  );
});

// ---------------------------------------------------------------------------
// 24:00 and local bounds.

test('24:00: the API next date T00:00 is shown as 24:00 and saved as T24:00', () => {
  const midnight = block({
    start: '2027-03-03T20:00',
    end: '2027-03-04T00:00',
  });
  const values = blockToForm(midnight);
  assert.deepEqual(
    { date: values.date, start: values.start, end: values.end },
    { date: '2027-03-03', start: '20:00', end: '24:00' }
  );
  assert.equal(values.lockedBounds, null);
  assert.deepEqual(formBounds(values), {
    start: '2027-03-03T20:00',
    end: '2027-03-03T24:00',
  });
  // Opened and saved without a change: nothing to send.
  assert.deepEqual(patchBody(midnight, values), {});
  assert.equal(blockTimeLabel(midnight), '20:00–24:00');
  assert.deepEqual(blockDates(midnight), ['2027-03-03']);
  assert.deepEqual(validateBlockForm(values, '2027-03-01'), {});
});

test('24:00: a whole local day, also on a clock-change date', () => {
  for (const date of ['2027-03-28', '2027-10-31', '2027-06-01']) {
    const values = form({ date, start: '00:00', end: '24:00' });
    assert.deepEqual(validateBlockForm(values, '2027-03-01'), {});
    assert.deepEqual(formBounds(values), {
      start: `${date}T00:00`,
      end: `${date}T24:00`,
    });
  }
});

test('a block over midnight (made through the API) keeps its exact bounds', () => {
  const late = block({ start: '2027-03-03T22:00', end: '2027-03-04T02:00' });
  assert.equal(isOneDayBlock(late), false);
  const values = blockToForm(late);
  assert.deepEqual(values.lockedBounds, {
    start: '2027-03-03T22:00',
    end: '2027-03-04T02:00',
  });
  assert.deepEqual(patchBody(late, values), {});
  // Changing the title never moves it, even if time fields were touched.
  assert.deepEqual(
    patchBody(late, {
      ...values,
      title: 'Autre',
      end: '23:00',
      date: '2027-03-09',
    }),
    { title: 'Autre' }
  );
  assert.deepEqual(validateBlockForm(values, '2027-03-01'), {});
  assert.deepEqual(blockDates(late), ['2027-03-03', '2027-03-04']);
  assert.deepEqual(blockSpanOn(late, '2027-03-03'), { start: 1320, end: 1440 });
  assert.deepEqual(blockSpanOn(late, '2027-03-04'), { start: 0, end: 120 });
  assert.equal(blockSpanOn(late, '2027-03-05'), null);
  assert.equal(
    blockTimeLabel(late, '2027-03-03'),
    '22:00–24:00 (jusqu’au lendemain 02:00)'
  );
  assert.equal(
    blockTimeLabel(late, '2027-03-04'),
    '00:00–02:00 (depuis la veille)'
  );
});

test('bounds do not depend on the browser time zone', () => {
  const saved = process.env.TZ;
  const midnight = block({
    start: '2027-10-30T21:00',
    end: '2027-10-31T00:00',
    startsAt: '2027-10-30T19:00:00.000Z',
    endsAt: '2027-10-30T22:00:00.000Z',
  });
  const results = [];
  try {
    for (const zone of [
      'UTC',
      'America/Los_Angeles',
      'Pacific/Kiritimati',
      'Asia/Tokyo',
      'Europe/Paris',
    ]) {
      process.env.TZ = zone;
      const values = blockToForm(midnight);
      results.push({
        form: [values.date, values.start, values.end],
        bounds: formBounds(values),
        patch: patchBody(midnight, values),
        label: blockTimeLabel(midnight),
        body: createBody({ ...values, title: ' Planity ', note: '  ' }),
      });
    }
  } finally {
    if (saved === undefined) delete process.env.TZ;
    else process.env.TZ = saved;
  }
  for (const result of results) {
    assert.deepEqual(result, {
      form: ['2027-10-30', '21:00', '24:00'],
      bounds: { start: '2027-10-30T21:00', end: '2027-10-30T24:00' },
      patch: {},
      label: '21:00–24:00',
      body: {
        title: 'Planity',
        start: '2027-10-30T21:00',
        end: '2027-10-30T24:00',
      },
    });
  }
});

// ---------------------------------------------------------------------------
// Form checks and request bodies.

test('validateBlockForm: hints per field', () => {
  const today = '2027-03-01';
  assert.deepEqual(validateBlockForm(form(), today), {});
  assert.equal(
    validateBlockForm(form({ title: '  ' }), today).title,
    'Indiquez un titre.'
  );
  assert.match(
    validateBlockForm(form({ title: 'x'.repeat(101) }), today).title,
    /100/
  );
  assert.match(
    validateBlockForm(form({ note: 'x'.repeat(501) }), today).note,
    /500/
  );
  assert.match(validateBlockForm(form({ start: '14:03' }), today).start, /5/);
  assert.match(
    validateBlockForm(form({ start: '24:00' }), today).start,
    /HH:MM/
  );
  assert.match(validateBlockForm(form({ end: '9h' }), today).end, /HH:MM/);
  assert.match(
    validateBlockForm(form({ end: '14:10' }), today).end,
    /15 minutes/
  );
  assert.match(validateBlockForm(form({ end: '13:00' }), today).end, /après/);
  // One day only: no end after this date's midnight (no "next day" option).
  assert.match(
    validateBlockForm(form({ start: '22:00', end: '02:00' }), today).end,
    /même jour/
  );
  assert.match(validateBlockForm(form({ end: '24:05' }), today).end, /HH:MM/);
  assert.deepEqual(
    validateBlockForm(form({ start: '23:45', end: '24:00' }), today),
    {}
  );
  assert.equal('nextDay' in newBlockForm('2027-03-03'), false);
  assert.match(
    validateBlockForm(form({ date: '2027-02-28' }), today).date,
    /passée/
  );
  assert.match(
    validateBlockForm(form({ date: '2028-03-01' }), today).date,
    /365/
  );
  assert.deepEqual(validateBlockForm(form({ date: '2028-02-29' }), today), {});
  assert.match(validateBlockForm(form({ date: '' }), today).date, /date/);
});

test('createBody / patchBody: trimmed texts, only changed fields, null clears the note', () => {
  assert.deepEqual(createBody(form({ note: '  Client Planity  ' })), {
    title: 'Planity',
    note: 'Client Planity',
    start: '2027-03-03T14:00',
    end: '2027-03-03T15:00',
  });
  const withNote = block({ note: 'Texte' });
  assert.deepEqual(
    patchBody(withNote, { ...blockToForm(withNote), note: ' ' }),
    {
      note: null,
    }
  );
  assert.deepEqual(
    patchBody(block(), {
      ...blockToForm(block()),
      date: '2027-03-05',
      end: '16:00',
    }),
    { start: '2027-03-05T14:00', end: '2027-03-05T16:00' }
  );
  assert.deepEqual(
    patchBody(block(), { ...blockToForm(block()), end: '24:00' }),
    { end: '2027-03-03T24:00' }
  );
});

// ---------------------------------------------------------------------------
// Idempotency-Key of «create».

test('createBlockIntent: same body keeps its key until a definite answer', () => {
  let counter = 0;
  const intent = createBlockIntent(() => `key-${(counter += 1)}`);
  const body = createBody(form());
  assert.equal(intent.keyFor(body), 'key-1');
  intent.settle(new ApiError(503, 'CALENDAR_BUSY'));
  assert.equal(intent.keyFor(body), 'key-1', 'retry after 503 replays');
  intent.settle(new ApiError(0, 'TIMEOUT'));
  assert.equal(intent.keyFor({ ...body }), 'key-1');
  assert.equal(
    intent.keyFor({ ...body, end: '2027-03-03T16:00' }),
    'key-2',
    'another body is a new intent'
  );
  intent.settle(null); // 201 / 200
  assert.equal(intent.keyFor(body), 'key-3', 'next block, new key');
  intent.settle(new ApiError(409, 'BLOCK_CONFLICT'));
  assert.equal(intent.keyFor(body), 'key-4');
  intent.settle(new ApiError(410, 'BLOCK_DELETED'));
  assert.equal(intent.keyFor(body), 'key-5');
  intent.settle(new ApiError(422, 'IDEMPOTENCY_KEY_REUSED'));
  assert.equal(intent.keyFor(body), 'key-6');
});

// ---------------------------------------------------------------------------
// Server errors.

test('errors: field errors to fields, conflicts with their studio date, French messages', () => {
  const invalid = new ApiError(400, 'VALIDATION_FAILED', undefined, {
    errors: [
      { field: ['start'], message: 'Local time does not exist' },
      { field: ['end'], message: 'x' },
    ],
  });
  const fields = fieldErrorsFrom(invalid);
  assert.deepEqual(Object.keys(fields), ['start', 'end']);
  assert.match(fields.start, /changement d’heure/);
  assert.doesNotMatch(JSON.stringify(fields), /does not exist/);
  assert.ok(
    fieldErrorsFrom(
      new ApiError(400, 'VALIDATION_FAILED', undefined, {
        errors: [{ field: ['other'], message: 'x' }],
      })
    ).form
  );
  assert.deepEqual(fieldErrorsFrom(new ApiError(409, 'BLOCK_CONFLICT')), {});
  // The server refuses an end already passed: shown on the end field.
  const past = fieldErrorsFrom(
    new ApiError(400, 'VALIDATION_FAILED', undefined, {
      errors: [{ field: ['end'], message: 'must not be in the past' }],
    })
  );
  assert.deepEqual(Object.keys(past), ['end']);
  assert.match(past.end, /déjà passée/);

  const conflict = new ApiError(409, 'BLOCK_CONFLICT', undefined, {
    conflicts: [
      {
        bookingId: 'bk-1',
        startsAt: '2027-03-03T22:30:00.000Z', // 23:30 in Paris
        endsAt: '2027-03-03T23:30:00.000Z',
        serviceName: 'Massage',
      },
    ],
  });
  assert.deepEqual(conflictsOf(conflict), [
    { ...conflict.details.conflicts[0], date: '2027-03-03' },
  ]);
  for (const code of [
    'BLOCK_CONFLICT',
    'BLOCK_DELETED',
    'BLOCK_NOT_FOUND',
    'IDEMPOTENCY_KEY_REUSED',
    'CALENDAR_BUSY',
  ]) {
    assert.match(blockErrorMessage({ code }), /[a-zé]/);
    assert.doesNotMatch(blockErrorMessage({ code }), /Une erreur est survenue/);
  }
});

// ---------------------------------------------------------------------------
// Calendar data and layout.

const day = (date, blocks = []) => ({ date, blocks });

test('applyBlockChange: a moved block leaves the old date and joins the new one', () => {
  const days = [
    day('2027-03-03', [block()]),
    day('2027-03-04'),
    day('2027-03-05'),
  ];
  const moved = block({ start: '2027-03-05T09:00', end: '2027-03-05T10:00' });
  const after = applyBlockChange(days, { removedId: 'b-1', block: moved });
  assert.deepEqual(
    after.map((item) => item.blocks.map((b) => b.start)),
    [[], [], ['2027-03-05T09:00']]
  );
  assert.equal(after[1], days[1], 'untouched dates keep their object');

  const created = block({
    id: 'b-0',
    start: '2027-03-03T22:00',
    end: '2027-03-04T01:00',
  });
  const both = applyBlockChange(after, { block: created });
  assert.deepEqual(
    both.map((item) => item.blocks.map((b) => b.id)),
    [['b-0'], ['b-0'], ['b-1']]
  );
  const deleted = applyBlockChange(both, { removedId: 'b-0' });
  assert.deepEqual(
    deleted.map((item) => item.blocks.length),
    [0, 0, 1]
  );
  // An API without blocks: days stay as they are.
  assert.deepEqual(
    applyBlockChange([{ date: '2027-03-03' }], { removedId: 'x' }),
    [{ date: '2027-03-03' }]
  );
});

const booking = (id, startsAt, endsAt, status = 'confirmed') => ({
  id,
  status,
  startsAt,
  endsAt,
});

test('agendaItems: bookings and blocks in time order on their date', () => {
  const items = agendaItems(
    [
      booking('bk-2', '2027-03-03T15:15:00.000Z', '2027-03-03T16:15:00.000Z'), // 16:15
      booking('bk-1', '2027-03-03T08:00:00.000Z', '2027-03-03T09:00:00.000Z'), // 09:00
    ],
    [
      block(), // 14:00–15:00
      block({
        id: 'b-late',
        start: '2027-03-02T23:00',
        end: '2027-03-03T01:00',
      }),
    ],
    '2027-03-03'
  );
  assert.deepEqual(
    items.map((item) => [item.kind, item.id, item.start, item.end]),
    [
      ['block', 'b-late', 0, 60],
      ['booking', 'bk-1', 540, 600],
      ['block', 'b-1', 840, 900],
      ['booking', 'bk-2', 975, 1035],
    ]
  );
  // Same start: the block first.
  const tie = agendaItems(
    [
      booking(
        'bk',
        '2027-03-03T13:00:00.000Z',
        '2027-03-03T14:00:00.000Z',
        'cancelled'
      ),
    ],
    [block()],
    '2027-03-03'
  );
  assert.deepEqual(
    tie.map((item) => item.kind),
    ['block', 'booking']
  );
});

test('layoutLanes: overlapping events side by side, touching ones not', () => {
  const span = (id, start, end) => ({ kind: 'block', id, start, end });
  const placed = layoutLanes([
    span('a', 540, 600),
    span('b', 570, 660),
    span('c', 600, 630), // starts when a ends: reuses lane 0
    span('d', 660, 720), // touches b: new group, one lane
    span('e', 800, 900),
    span('f', 800, 900),
    span('g', 820, 840),
  ]);
  assert.deepEqual(
    placed.map((item) => [item.id, item.lane, item.lanes]),
    [
      ['a', 0, 2],
      ['b', 1, 2],
      ['c', 0, 2],
      ['d', 0, 1],
      ['e', 0, 3],
      ['f', 1, 3],
      ['g', 2, 3],
    ]
  );
  assert.deepEqual(layoutLanes([]), []);
});

test('isBlockOver: over once its UTC end is reached, editable while it lasts', () => {
  const b = block(); // 13:00Z–14:00Z
  assert.equal(isBlockOver(b, Date.parse('2027-03-03T13:30:00.000Z')), false);
  assert.equal(isBlockOver(b, Date.parse('2027-03-03T12:00:00.000Z')), false);
  assert.equal(isBlockOver(b, Date.parse('2027-03-03T14:00:00.000Z')), true);
  assert.equal(isBlockOver(b, Date.parse('2027-03-04T09:00:00.000Z')), true);
});
