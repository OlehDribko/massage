/*
 * Languages of the site. French is the main language and keeps the
 * unprefixed URLs (/reserver); the others live under a prefix
 * (/en/reserver, /uk/reserver, /ru/reserver). The administration exists in
 * French and Ukrainian only. Pure — used by proxy.js, the app and the tests.
 */

export const DEFAULT_LOCALE = 'fr';
export const LOCALES = ['fr', 'en', 'uk', 'ru'];
export const ADMIN_LOCALES = ['fr'];

/** Visitor's choice from the language switcher (public site). */
export const LOCALE_COOKIE = 'site_locale';
/** Choice of the administration's switcher, kept apart from the site's. */
export const ADMIN_LOCALE_COOKIE = 'admin_locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Intl locale per language (dates, numbers). */
export const INTL_LOCALES = {
  fr: 'fr-FR',
  en: 'en-GB',
  uk: 'uk-UA',
  ru: 'ru-RU',
};

/** Open Graph `og:locale` per language. */
export const OG_LOCALES = {
  fr: 'fr_FR',
  en: 'en_GB',
  uk: 'uk_UA',
  ru: 'ru_RU',
};

export const LANGUAGE_NAMES = {
  fr: 'Français',
  en: 'English',
  uk: 'Українська',
  ru: 'Русский',
};

export const isLocale = (value) => LOCALES.includes(value);

/** "/en/reserver?x=1" → { locale: 'en', path: '/reserver?x=1' }. */
export function splitLocale(pathname) {
  const match = /^\/([a-z]{2})(?=\/|$|\?|#)(.*)$/.exec(pathname ?? '');
  if (match && isLocale(match[1])) {
    const rest = match[2] || '/';
    return {
      locale: match[1],
      path: rest.startsWith('/') ? rest : `/${rest}`,
    };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/' };
}

/**
 * Internal path for a language: "/reserver" → "/en/reserver"; French stays
 * unprefixed. A path that already carries a language is rebuilt for the
 * target; absolute URLs, anchors ("#x") and mailto:/tel: stay unchanged.
 */
export function localizePath(locale, href) {
  if (
    typeof href !== 'string' ||
    !href.startsWith('/') ||
    href.startsWith('//')
  )
    return href;
  // A path that already carries a language is rebuilt for the target.
  const { path } = splitLocale(href);
  if (!locale || locale === DEFAULT_LOCALE) return path;
  if (path === '/') return `/${locale}`;
  // "/?x=1" and "/#about" keep the query / anchor right after the prefix.
  return /^\/[?#]/.test(path)
    ? `/${locale}${path.slice(1)}`
    : `/${locale}${path}`;
}

/** The same page in another language: "/en/reserver" → "/uk/reserver". */
export function switchLocalePath(pathname, locale) {
  return localizePath(locale, splitLocale(pathname).path);
}

/** True for /admin and its sub-pages (path without language prefix). */
export const isAdminPath = (path) => /^\/admin(?=\/|$|\?)/.test(path ?? '');
