import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectKeys, missingKeys } from '../../scripts/i18n-keys.mjs';
import en from '../../src/i18n/messages/en.js';
import ru from '../../src/i18n/messages/ru.js';
import uk from '../../src/i18n/messages/uk.js';
import adminUk from '../../src/i18n/messages/admin.uk.js';
import { createTranslator, frenchT } from '../../src/i18n/translate.js';

test('every text of the code is translated (public: en/uk/ru, admin: uk)', async () => {
  const missing = await missingKeys();
  for (const [lang, keys] of Object.entries(missing)) {
    assert.deepEqual(keys, [], `${lang}: missing translations`);
  }
});

const placeholders = (text) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const tags = (text) => [...text.matchAll(/<(\w+)>/g)].map((m) => m[1]).sort();
const forms = (value) =>
  typeof value === 'string' ? [value] : Object.values(value);

test('translations keep the placeholders and markup of the French text', () => {
  for (const [name, dictionary] of Object.entries({ en, uk, ru, adminUk })) {
    for (const [key, value] of Object.entries(dictionary)) {
      for (const french of key.includes('|') && !key.includes(' | ')
        ? key.split('|')
        : [key]) {
        for (const form of forms(value)) {
          // {n} may be left out of a plural form ("one" without a number).
          const expected = placeholders(french).filter((p) => p !== 'n');
          const actual = placeholders(form).filter((p) => p !== 'n');
          assert.deepEqual(
            [...new Set(actual)],
            [...new Set(expected)],
            `${name}: ${JSON.stringify(key)}`
          );
          assert.deepEqual(
            tags(form),
            tags(french),
            `${name}: ${JSON.stringify(key)}`
          );
        }
      }
    }
  }
});

test('no stale translation: every dictionary key is used by the code', () => {
  const { public: publicKeys, admin } = collectKeys();
  const used = new Set([...publicKeys.keys(), ...admin.keys()]);
  // Texts of configuration objects, translated through t(variable).
  const config = Object.keys(en).filter((key) => !used.has(key));
  assert.ok(config.length <= 4, `unused keys: ${JSON.stringify(config)}`);
  for (const key of Object.keys(adminUk)) assert.ok(used.has(key), key);
});

test('translator: interpolation, plurals, French fallback', () => {
  const t = createTranslator('uk', uk);
  assert.equal(t('Prendre rendez-vous'), 'Записатися');
  assert.equal(t('{n} horaire|{n} horaires', { n: 1 }), '1 слот');
  assert.equal(t('{n} horaire|{n} horaires', { n: 3 }), '3 слоти');
  assert.equal(t('{n} horaire|{n} horaires', { n: 5 }), '5 слотів');
  assert.equal(t('Texte sans traduction'), 'Texte sans traduction');
  assert.equal(frenchT('{n} horaire|{n} horaires', { n: 1 }), '1 horaire');
  assert.equal(frenchT('{n} horaire|{n} horaires', { n: 2 }), '2 horaires');
  assert.equal(frenchT('Référence : {id}', { id: 'abc' }), 'Référence : abc');
  const tEn = createTranslator('en', en);
  assert.equal(tEn('{n} horaire|{n} horaires', { n: 1 }), '1 slot');
  assert.equal(tEn('{n} horaire|{n} horaires', { n: 2 }), '2 slots');
  const tRu = createTranslator('ru', ru);
  assert.equal(
    tRu('{n} avis vérifié|{n} avis vérifiés', { n: 34 }),
    '34 проверенных отзыва'
  );
});

test('admin Ukrainian: every admin key resolves in Ukrainian', () => {
  const t = createTranslator('uk', { ...uk, ...adminUk });
  assert.equal(
    t('Calendrier du <accent>cabinet</accent>'),
    'Календар <accent>кабінету</accent>'
  );
  assert.equal(
    t('{n} date sélectionnée|{n} dates sélectionnées', { n: 2 }),
    'Вибрано 2 дати'
  );
});
