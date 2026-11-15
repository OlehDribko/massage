import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  localizePath,
  splitLocale,
  switchLocalePath,
} from '../../src/i18n/config.js';
import { routeLocale } from '../../src/i18n/routing.js';

test('paths: French stays unprefixed, other languages get a prefix', () => {
  assert.equal(localizePath('fr', '/reserver'), '/reserver');
  assert.equal(localizePath('en', '/reserver'), '/en/reserver');
  assert.equal(localizePath('uk', '/'), '/uk');
  assert.equal(localizePath('ru', '/#about'), '/ru#about');
  assert.equal(localizePath('en', '/?x=1'), '/en?x=1');
  assert.equal(
    localizePath('en', '/compte?retour=%2F#profil'),
    '/en/compte?retour=%2F#profil'
  );
  // Already localized paths are rebuilt, external links untouched.
  assert.equal(localizePath('uk', '/en/reserver'), '/uk/reserver');
  assert.equal(localizePath('fr', '/ru/compte'), '/compte');
  assert.equal(
    localizePath('en', 'https://planity.com'),
    'https://planity.com'
  );
  assert.equal(localizePath('en', '#carte-cadeau'), '#carte-cadeau');
  assert.equal(localizePath('en', '//evil.example'), '//evil.example');
});

test('splitLocale / switchLocalePath', () => {
  assert.deepEqual(splitLocale('/en/reserver/abc'), {
    locale: 'en',
    path: '/reserver/abc',
  });
  assert.deepEqual(splitLocale('/ru'), { locale: 'ru', path: '/' });
  assert.deepEqual(splitLocale('/reserver'), {
    locale: 'fr',
    path: '/reserver',
  });
  // "/dev" is not a language prefix.
  assert.deepEqual(splitLocale('/dev/x'), { locale: 'fr', path: '/dev/x' });
  assert.equal(
    switchLocalePath('/en/compte/reservations', 'fr'),
    '/compte/reservations'
  );
  assert.equal(switchLocalePath('/reserver', 'uk'), '/uk/reserver');
});

test('proxy: prefixed languages are served, /fr redirects to the French URL', () => {
  assert.deepEqual(routeLocale('/en/reserver'), { type: 'next' });
  assert.deepEqual(routeLocale('/uk'), { type: 'next' });
  assert.deepEqual(routeLocale('/fr/reserver'), {
    type: 'redirect',
    pathname: '/reserver',
    status: 308,
  });
  assert.deepEqual(routeLocale('/fr'), {
    type: 'redirect',
    pathname: '/',
    status: 308,
  });
});

test('proxy: French URLs are rewritten; the cookie applies to page loads only', () => {
  assert.deepEqual(routeLocale('/reserver'), {
    type: 'rewrite',
    pathname: '/fr/reserver',
  });
  assert.deepEqual(routeLocale('/'), { type: 'rewrite', pathname: '/fr' });
  const cookies = { site_locale: 'uk' };
  assert.deepEqual(routeLocale('/reserver', { cookies, isPageLoad: true }), {
    type: 'redirect',
    pathname: '/uk/reserver',
    status: 307,
  });
  // Robots (no cookie) and client navigations keep the URL's language.
  assert.equal(routeLocale('/reserver', { isPageLoad: true }).type, 'rewrite');
  assert.equal(
    routeLocale('/reserver', { cookies, isPageLoad: false }).type,
    'rewrite'
  );
  // A chosen French or an unknown value changes nothing.
  assert.equal(
    routeLocale('/', { cookies: { site_locale: 'fr' }, isPageLoad: true }).type,
    'rewrite'
  );
  assert.equal(
    routeLocale('/', { cookies: { site_locale: 'de' }, isPageLoad: true }).type,
    'rewrite'
  );
});

test('proxy: administration in French and Ukrainian only, with its own cookie', () => {
  assert.deepEqual(routeLocale('/uk/admin/calendrier'), { type: 'next' });
  assert.deepEqual(routeLocale('/en/admin'), {
    type: 'redirect',
    pathname: '/admin',
    status: 307,
  });
  assert.deepEqual(routeLocale('/ru/admin/horaires'), {
    type: 'redirect',
    pathname: '/admin/horaires',
    status: 307,
  });
  // The site's choice does not move the administration…
  assert.equal(
    routeLocale('/admin', { cookies: { site_locale: 'en' }, isPageLoad: true })
      .type,
    'rewrite'
  );
  // …its own cookie does.
  assert.deepEqual(
    routeLocale('/admin', {
      cookies: { admin_locale: 'uk' },
      isPageLoad: true,
    }),
    {
      type: 'redirect',
      pathname: '/uk/admin',
      status: 307,
    }
  );
  assert.equal(
    routeLocale('/admin', { cookies: { admin_locale: 'ru' }, isPageLoad: true })
      .type,
    'rewrite'
  );
});
