import { IS_INDEXABLE, SITE_URL } from '@/config/site';

export default function robots() {
  // Crawling stays allowed everywhere: non-production builds are excluded via
  // the noindex meta tag, which robots can only read if they may fetch pages.
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    ...(IS_INDEXABLE && { sitemap: `${SITE_URL}/sitemap.xml` }),
  };
}
