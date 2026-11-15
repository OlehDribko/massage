/*
 * Translation function. Keys are the French texts themselves (gettext
 * style): French needs no dictionary, other languages map « texte français »
 * → translation (src/i18n/messages/*.js). A missing translation falls back to
 * French — `npm test` lists the missing keys (tests/i18n).
 *
 *   t('Prendre rendez-vous')
 *   t('Bonjour, {name}', { name })
 *   t('{n} séance|{n} séances', { n })   // plural: "one|other" in French,
 *                                        // { one, few, many, other } elsewhere
 *
 * Pure — no React, usable on the server, in the browser and in tests.
 */

import { DEFAULT_LOCALE, INTL_LOCALES } from './config.js';

const pluralRules = new Map();
function pluralCategory(locale, n) {
  if (!pluralRules.has(locale)) {
    pluralRules.set(
      locale,
      new Intl.PluralRules(INTL_LOCALES[locale] ?? locale)
    );
  }
  return pluralRules.get(locale).select(Number(n));
}

export function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name) =>
    vars[name] === undefined || vars[name] === null ? whole : String(vars[name])
  );
}

/** French plural key "un|plusieurs" → the right form for `n`. */
function frenchPlural(key, n) {
  const [one, other = one] = key.split('|');
  return pluralCategory(DEFAULT_LOCALE, n) === 'one' ? one : other;
}

function resolve(locale, messages, key, vars) {
  const value = messages?.[key];
  const isPlural = key.includes('|') && vars && 'n' in vars;
  if (value === undefined || value === null) {
    return isPlural ? frenchPlural(key, vars.n) : key;
  }
  if (typeof value === 'object') {
    const n = vars?.n ?? 0;
    return value[pluralCategory(locale, n)] ?? value.other ?? key;
  }
  return value;
}

/**
 * `t(key, vars)` for a language and its dictionary. `t.locale` is the
 * language; `t.has(key)` says whether a translation exists.
 */
export function createTranslator(locale, messages = {}) {
  const dictionary = locale === DEFAULT_LOCALE ? {} : (messages ?? {});
  const t = (key, vars) =>
    interpolate(resolve(locale, dictionary, key, vars), vars);
  t.locale = locale;
  t.has = (key) => locale === DEFAULT_LOCALE || key in dictionary;
  return t;
}

/** French as is: the default `t` of pure modules (lib/*) and their tests. */
export const frenchT = createTranslator(DEFAULT_LOCALE);

/**
 * Marks a French text to translate later (constants, lists): returns it
 * unchanged; the display site calls t(text). Lets `npm test` find every
 * key, as for t('…') (gettext's « noop »).
 */
export const msg = (text) => text;
