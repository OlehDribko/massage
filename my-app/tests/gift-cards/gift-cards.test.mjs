import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  MAX_AMOUNT_CENTS,
  descriptionError,
  giftCardErrorMessage,
  giftReadinessSteps,
  historyTitle,
  keepsIdempotencyKey,
  listApiPath,
  listSearch,
  pageCount,
  parseEuroAmount,
  readListFilters,
  requestBody,
  statusAction,
} from '../../src/lib/giftCards.js';

test('amount in euros → integer cents, no float errors', () => {
  assert.deepEqual(parseEuroAmount('150'), { cents: 15000 });
  assert.deepEqual(parseEuroAmount('80,5'), { cents: 8050 });
  assert.deepEqual(parseEuroAmount('80.50'), { cents: 8050 });
  assert.deepEqual(parseEuroAmount('0,29'), { cents: 29 });
  assert.deepEqual(parseEuroAmount('1 500,00 €'), { cents: 150000 });
  assert.deepEqual(parseEuroAmount('1 500'), { cents: 150000 });
  assert.deepEqual(parseEuroAmount('19,99'), { cents: 1999 }); // 19.99*100 = 1998.99… in floats
  assert.deepEqual(parseEuroAmount('007'), { cents: 700 });
});

test('invalid amounts are refused before sending', () => {
  for (const value of [
    '',
    '  ',
    '0',
    '0,00',
    '-10',
    '10,555',
    'abc',
    '1e3',
    '10,',
    ',5',
  ]) {
    assert.ok(parseEuroAmount(value).error, `refused: "${value}"`);
  }
  assert.equal(
    parseEuroAmount(String(MAX_AMOUNT_CENTS / 100 + 1)).error,
    'Ce montant est trop élevé.'
  );
  assert.deepEqual(parseEuroAmount('21474836,47'), { cents: MAX_AMOUNT_CENTS });
  assert.ok(parseEuroAmount('21474836,48').error);
});

test('request body: documented fields only, never contacts', () => {
  assert.deepEqual(
    requestBody({
      amountCents: 8000,
      description: '  Pour ma sœur  ',
      channel: 'whatsapp',
    }),
    {
      amountCents: 8000,
      description: 'Pour ma sœur',
      preferredContactChannel: 'whatsapp',
    }
  );
  const empty = requestBody({
    amountCents: 8000,
    description: '   ',
    channel: 'email',
  });
  assert.deepEqual(empty, {
    amountCents: 8000,
    preferredContactChannel: 'email',
  });
  assert.equal('email' in empty || 'name' in empty || 'phone' in empty, false);
});

test('description: length and control characters', () => {
  assert.equal(descriptionError(''), null);
  assert.equal(descriptionError('Ligne 1\nLigne 2\tok'), null);
  assert.ok(descriptionError('x'.repeat(1001)));
  assert.equal(descriptionError('x'.repeat(1000)), null);
  assert.ok(descriptionError('bip\u0007'));
});

test('readiness steps include phone_invalid and keep the way back', () => {
  const steps = giftReadinessSteps(
    ['anonymous_session', 'phone_invalid', 'unknown'],
    {
      returnTo: '/#carte-cadeau',
    }
  );
  assert.deepEqual(
    steps.map((step) => step.blocker),
    ['anonymous_session', 'phone_invalid']
  );
  assert.equal(steps[0].href, '/connexion?retour=%2F%23carte-cadeau');
  assert.match(steps[1].text, /n’est pas valide/);
  assert.equal(steps[1].href, '/compte?retour=%2F%23carte-cadeau#profil');
});

test('idempotency key kept only when the outcome is unknown or retry is documented', () => {
  assert.equal(keepsIdempotencyKey({ code: 'NETWORK_ERROR', status: 0 }), true);
  assert.equal(
    keepsIdempotencyKey({ code: 'GIFT_CARD_REQUEST_BUSY', status: 503 }),
    true
  );
  assert.equal(keepsIdempotencyKey({ code: 'HTTP_502', status: 502 }), true);
  assert.equal(
    keepsIdempotencyKey({ code: 'GIFT_CARD_REQUEST_NOT_READY', status: 403 }),
    true
  );
  assert.equal(
    keepsIdempotencyKey({ code: 'VALIDATION_FAILED', status: 400 }),
    false
  );
  assert.equal(
    keepsIdempotencyKey({ code: 'IDEMPOTENCY_KEY_REUSED', status: 422 }),
    false
  );
});

test('messages never claim payment or an issued card', () => {
  const texts = [
    'GIFT_CARD_REQUEST_LIMIT_REACHED',
    'GIFT_CARD_REQUEST_BUSY',
    'GIFT_CARD_STATUS_TRANSITION_NOT_ALLOWED',
    'VALIDATION_FAILED',
  ].map((code) => giftCardErrorMessage({ code, retryAfterSeconds: 7200 }));
  assert.match(texts[0], /dans 2 heures/);
  for (const text of texts) assert.doesNotMatch(text, /payé|émise|délivrée/i);
  assert.doesNotMatch(
    statusAction('in_progress', 'completed').label,
    /pay|émis/i
  );
});

test('status actions and history titles', () => {
  assert.equal(statusAction('new', 'in_progress').label, 'Prendre en charge');
  assert.equal(statusAction('completed', 'in_progress').label, 'Rouvrir');
  assert.equal(statusAction('cancelled', 'in_progress').label, 'Rouvrir');
  assert.equal(statusAction('new', 'cancelled').tone, 'danger');
  assert.equal(
    historyTitle({ fromStatus: null, toStatus: 'new' }),
    'Demande reçue'
  );
  assert.equal(
    historyTitle({ fromStatus: 'new', toStatus: 'in_progress' }),
    'Nouvelle → en cours'
  );
  assert.match(
    historyTitle({ fromStatus: 'completed', toStatus: 'in_progress' }),
    /^Rouverte/
  );
});

test('admin list filters: address ↔ API query, invalid values dropped', () => {
  const filters = readListFilters(
    new URLSearchParams('statut=in_progress&du=2027-03-01&au=bad&page=3')
  );
  assert.deepEqual(filters, {
    status: 'in_progress',
    from: '2027-03-01',
    to: '',
    page: 3,
  });
  assert.deepEqual(
    readListFilters(new URLSearchParams('statut=paid&page=-2')),
    {
      status: '',
      from: '',
      to: '',
      page: 1,
    }
  );
  assert.equal(listSearch(filters), '?statut=in_progress&du=2027-03-01&page=3');
  assert.equal(listSearch({ status: '', from: '', to: '', page: 1 }), '');
  assert.equal(
    listApiPath(filters),
    '/api/admin/gift-card-requests?page=3&pageSize=20&status=in_progress&createdFrom=2027-03-01'
  );
  assert.equal(pageCount(0, 20), 1);
  assert.equal(pageCount(41, 20), 3);
});
