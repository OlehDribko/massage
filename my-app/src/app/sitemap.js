import { INDEXABLE_ROUTES, IS_INDEXABLE, SITE_URL } from '@/config/site';
import { DEFAULT_LOCALE, LOCALES, localizePath } from '@/i18n/config';

const absolute = (path) => (path === '/' ? SITE_URL : `${SITE_URL}${path}`);

/**
 * Every indexable page in every language (French unprefixed, /en, /uk,
 * /ru), each entry with the hreflang alternates of the others and
 * x-default = French.
 */
export function sitemapEntries(routes = INDEXABLE_ROUTES) {
  return routes.flatMap((path) => {
    const languages = {
      ...Object.fromEntries(
        LOCALES.map((locale) => [locale, absolute(localizePath(locale, path))])
      ),
      'x-default': absolute(localizePath(DEFAULT_LOCALE, path)),
    };
    return LOCALES.map((locale) => ({
      url: absolute(localizePath(locale, path)),
      alternates: { languages },
    }));
  });
}

export default function sitemap() {
  // No sitemap entries for preview builds or while the domain is unknown.
  if (!IS_INDEXABLE) return [];

  // lastModified is omitted on purpose: build time is not a real content date.
  return sitemapEntries();
}
