import { cache } from 'react';

import { DEFAULT_LOCALE, isLocale } from './config.js';
import { getMessages } from './messages/index.js';
import { createTranslator } from './translate.js';
import { createFormat } from '../lib/format.js';

/*
 * Server side of the translations. Every layout and page under app/[lang]
 * calls setRequestLocale(lang) first; server components below read the
 * language with getLocale() / getT() / getFormat() without prop drilling.
 * The store is per request (React cache).
 */

const store = cache(() => ({ locale: DEFAULT_LOCALE }));

export function setRequestLocale(locale) {
  store().locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export const getLocale = () => store().locale;

export function getT(locale = getLocale(), { admin = false } = {}) {
  return createTranslator(locale, getMessages(locale, { admin }));
}

export const getFormat = (locale = getLocale()) => createFormat(locale);
