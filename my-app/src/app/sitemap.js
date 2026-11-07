import { INDEXABLE_ROUTES, IS_INDEXABLE, SITE_URL } from '@/config/site';

export default function sitemap() {
  // No sitemap entries for preview builds or while the domain is unknown.
  if (!IS_INDEXABLE) return [];

  // lastModified is omitted on purpose: build time is not a real content date.
  return INDEXABLE_ROUTES.map((path) => ({
    url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
  }));
}
