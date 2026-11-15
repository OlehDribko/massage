import {
  ADMIN_LOCALE_COOKIE,
  ADMIN_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  isAdminPath,
} from './config.js';

/*
 * Language routing, decided before rendering (src/proxy.js). Pure: takes
 * the path, the cookies and whether the request is a page load by a person,
 * returns what to do. Tested with `node --test` (tests/i18n).
 *
 * - "/en/…", "/uk/…", "/ru/…": served as is (app/[lang]).
 * - "/fr/…": permanent redirect to the unprefixed French URL (one URL per page).
 * - "/…" (French): served from app/[lang] with lang = fr (rewrite). A person
 *   whose language cookie (set by the switcher) names another language is
 *   sent to that language on a page load. Robots carry no cookie: they see
 *   the language of the URL. No redirect from the browser's language.
 * - Administration: French ("/admin") and Ukrainian ("/uk/admin") only, with
 *   its own cookie; "/en/admin" and "/ru/admin" go to "/admin".
 *
 * → { type: 'next' } | { type: 'rewrite', pathname } |
 *   { type: 'redirect', pathname, status }
 */
export function routeLocale(
  pathname,
  { cookies = {}, isPageLoad = false } = {}
) {
  const match = /^\/([a-z]{2})(\/.*)?$/.exec(pathname);
  const prefix = match && LOCALES.includes(match[1]) ? match[1] : null;
  const rest = prefix ? match[2] || '/' : pathname;

  if (prefix === DEFAULT_LOCALE) {
    return { type: 'redirect', pathname: rest, status: 308 };
  }

  if (prefix) {
    if (isAdminPath(rest) && !ADMIN_LOCALES.includes(prefix)) {
      return { type: 'redirect', pathname: rest, status: 307 };
    }
    return { type: 'next' };
  }

  const admin = isAdminPath(pathname);
  const allowed = admin ? ADMIN_LOCALES : LOCALES;
  const chosen = cookies[admin ? ADMIN_LOCALE_COOKIE : LOCALE_COOKIE];
  if (
    isPageLoad &&
    chosen &&
    chosen !== DEFAULT_LOCALE &&
    allowed.includes(chosen)
  ) {
    return {
      type: 'redirect',
      pathname: pathname === '/' ? `/${chosen}` : `/${chosen}${pathname}`,
      status: 307,
    };
  }
  return {
    type: 'rewrite',
    pathname:
      pathname === '/' ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`,
  };
}
