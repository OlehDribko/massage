/*
 * Single source of truth for site-wide data: domain, indexing, practice
 * details. Used by metadata, sitemap.xml, robots.txt, JSON-LD and the footer.
 *
 * Only put CONFIRMED facts here — everything below is rendered publicly and
 * mirrored in structured data.
 */

// Hosts that must never end up in canonical / sitemap / JSON-LD.
const FORBIDDEN_HOSTS = [
  /^localhost$/,
  /^127\./,
  /example\.(com|org|net)$/,
  /\.vercel\.app$/,
];

function resolveSiteUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const forbidden = FORBIDDEN_HOSTS.some((re) => re.test(url.hostname));
    if (url.protocol !== 'https:' || forbidden) {
      console.warn(
        `[site] NEXT_PUBLIC_SITE_URL ignored (not a production https domain): ${value}`
      );
      return null;
    }
    return url.origin;
  } catch {
    console.warn(`[site] NEXT_PUBLIC_SITE_URL is not a valid URL: ${value}`);
    return null;
  }
}

/**
 * Production origin, e.g. "https://www.example-massage.fr" (no trailing slash).
 * TODO before release: set NEXT_PUBLIC_SITE_URL in the production environment.
 * While it is missing the site stays noindex and canonical/sitemap/JSON-LD URLs
 * are omitted instead of pointing at a wrong host.
 */
export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

// On Vercel, VERCEL_ENV is "production" | "preview" | "development".
// Outside Vercel it is undefined and the build is treated as production.
const DEPLOY_ENV = process.env.VERCEL_ENV ?? 'production';

/** True only for the production deployment with a confirmed domain. */
export const IS_INDEXABLE = Boolean(SITE_URL) && DEPLOY_ENV === 'production';

if (
  !SITE_URL &&
  DEPLOY_ENV === 'production' &&
  process.env.NODE_ENV === 'production'
) {
  console.warn(
    '[site] NEXT_PUBLIC_SITE_URL is not set — the build is noindex.'
  );
}

export const SITE = {
  name: 'Massage by Stefania Ben',
  language: 'fr',
  ogLocale: 'fr_FR',
  description:
    'Cabinet de massage à Bordeaux : massages thérapeutiques et bien-être dans un cadre calme et confidentiel. Réservation en ligne.',
  ogImage: {
    url: '/images/hero-br.jpg',
    width: 1440,
    height: 960,
    alt: 'Massage du dos dans un cabinet de massage à Bordeaux',
  },
};

/**
 * Public, indexable pages. Add a route here only when it exists, is meant to
 * be indexed and has its own canonical URL.
 */
export const INDEXABLE_ROUTES = ['/', '/reserver'];

// Practice details as shown in the footer.
// TODO: confirm spelling of the name (Stefania / Stefaniia / Stefaniya) and the
// opening hours with the practitioner before release.
export const BUSINESS = {
  phone: { display: '+33 7 80 15 46 98', e164: '+33780154698' },
  email: 'benstefania02@gmail.com',
  address: {
    street: '23 rue Castéja',
    postalCode: '33000',
    city: 'Bordeaux',
    country: 'FR',
  },
  openingHours: {
    display: 'Mar – Dim, 10h – 19h',
    days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '10:00',
    closes: '19:00',
  },
  bookingUrl: process.env.NEXT_PUBLIC_PLANITY_BOOKING_URL || null,
};
