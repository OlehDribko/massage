import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  catalogDrift,
  localizeCatalog,
  localizedServiceName,
} from '../../src/lib/booking/catalogI18n.js';
import { buildCatalog } from '../../src/lib/booking/catalog.js';
import { SERVICE_GROUPS } from '../../src/content/services.js';
import { SERVICE_TEXTS } from '../../src/content/i18n/serviceTexts.js';
import { SERVICE_NAMES } from '../../src/content/i18n/serviceNames.js';
import { createFormat, formatDuration } from '../../src/lib/format.js';

const SPORT_55 = '11a5f7a9-4e3a-4fe1-bfcb-ad85073b7ec4';

// API services as the backend sends them (French), from the translation sources.
const apiServices = () =>
  Object.entries(SERVICE_TEXTS).map(([id, entry]) => ({
    id,
    name: SERVICE_NAMES[entry.group].fr,
    durationMinutes: entry.durationMinutes,
    priceCents: 6000,
    effectivePriceCents: 6000,
    currency: 'EUR',
    ...entry.fr,
  }));

test('every grouped service has its translations (names and texts)', () => {
  for (const group of SERVICE_GROUPS) {
    for (const lang of ['en', 'uk', 'ru']) {
      assert.ok(SERVICE_NAMES[group.key]?.[lang], `${group.key} name ${lang}`);
    }
    for (const id of group.serviceIds) {
      const entry = SERVICE_TEXTS[id];
      assert.ok(entry, id);
      for (const lang of ['en', 'uk', 'ru']) {
        assert.ok(entry[lang]?.description, `${id} ${lang}`);
        assert.equal(
          entry[lang].features.length,
          entry.fr.features.length,
          `${id} ${lang} features`
        );
      }
    }
  }
  assert.deepEqual(catalogDrift(apiServices()), []);
});

test('catalogue in another language: names and texts translated, prices untouched', () => {
  const catalog = buildCatalog(apiServices(), SERVICE_GROUPS);
  const uk = localizeCatalog(catalog, 'uk');
  const sport = uk.find((p) => p.key === 'sportif');
  assert.equal(sport.name, 'Спортивний масаж');
  const variant = sport.variants.find((v) => v.id === SPORT_55);
  assert.equal(variant.description, SERVICE_TEXTS[SPORT_55].uk.description);
  assert.equal(variant.effectivePriceCents, 6000);
  assert.equal(localizeCatalog(catalog, 'fr'), catalog);
});

test('a backend text changed since the translation: French is shown', () => {
  const services = apiServices().map((service) =>
    service.id === SPORT_55
      ? { ...service, description: 'Nouveau texte.', name: 'Massage sportif' }
      : service
  );
  const catalog = localizeCatalog(buildCatalog(services, SERVICE_GROUPS), 'en');
  const variant = catalog
    .find((p) => p.key === 'sportif')
    .variants.find((v) => v.id === SPORT_55);
  assert.equal(variant.description, 'Nouveau texte.');
  // Features unchanged: still translated.
  assert.deepEqual(variant.features, SERVICE_TEXTS[SPORT_55].en.features);
  assert.deepEqual(
    catalogDrift(services).map((d) => [d.id, d.field]),
    [[SPORT_55, 'description']]
  );
  assert.equal(
    localizedServiceName(
      { id: SPORT_55, name: 'Massage sportif (nouveau)' },
      'en'
    ),
    'Massage sportif (nouveau)'
  );
});

test('formats per language', () => {
  assert.equal(formatDuration(90), '1 h 30');
  assert.equal(createFormat('en').formatDuration(90), '1 h 30 min');
  assert.equal(createFormat('uk').formatDuration(60), '1 год');
  assert.equal(createFormat('ru').formatDuration(45), '45 мин');
  assert.match(createFormat('en').formatPrice(8500), /€85/);
  assert.match(
    createFormat('uk').formatDateTime('2027-03-02T09:15:00Z'),
    /о 10:15$/
  );
  assert.equal(createFormat('ru').formatWeekday('2027-03-02'), 'вторник');
});
