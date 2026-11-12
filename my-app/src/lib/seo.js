import { BUSINESS, SITE, SITE_URL } from '@/config/site';
import { formatDuration, formatPrice } from '@/lib/format';

const openGraphBase = {
  type: 'website',
  siteName: SITE.name,
  locale: SITE.ogLocale,
  images: [SITE.ogImage],
};

/** Site-wide defaults for the root layout. */
export const rootOpenGraph = {
  ...openGraphBase,
  title: SITE.name,
  description: SITE.description,
};

/**
 * Per-page metadata: title, description, canonical and share preview.
 * Next.js merges metadata shallowly, so openGraph/twitter are rebuilt here
 * instead of relying on the layout's values.
 *
 * @param {object} options
 * @param {string} options.title - page title (the layout appends the brand)
 * @param {boolean} [options.absoluteTitle] - use `title` as is, without the brand suffix
 * @param {string} options.description
 * @param {string} options.path - route path, e.g. "/reserver"
 */
export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
}) {
  const shareTitle = absoluteTitle ? title : `${title} | ${SITE.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    // Without a confirmed domain a canonical would point at the wrong host.
    ...(SITE_URL && { alternates: { canonical: path } }),
    openGraph: {
      ...openGraphBase,
      title: shareTitle,
      description,
      ...(SITE_URL && { url: path }),
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [SITE.ogImage.url],
    },
  };
}

/**
 * The services and their current prices (API catalogue) as a schema.org
 * OfferCatalog: search engines and AI agents read the price list without
 * running the page. null without a catalogue (API down).
 */
function offerCatalog(catalog) {
  const offers = (catalog ?? []).flatMap((prestation) =>
    prestation.variants.map((service) => ({
      '@type': 'Offer',
      price: (service.effectivePriceCents / 100).toFixed(2),
      priceCurrency: 'EUR',
      itemOffered: {
        '@type': 'Service',
        name: `${prestation.name} — ${formatDuration(service.durationMinutes)}`,
      },
      ...(SITE_URL && {
        url: `${SITE_URL}/reserver/${encodeURIComponent(service.id)}`,
      }),
    }))
  );
  if (!offers.length) return null;
  const prices = (catalog ?? []).flatMap((prestation) =>
    prestation.variants.map((service) => service.effectivePriceCents)
  );
  return {
    priceRange: `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Massages et soins',
      itemListElement: offers,
    },
  };
}

/**
 * schema.org LocalBusiness data, built only from confirmed BUSINESS facts,
 * plus the price list when the catalogue is available.
 */
export function localBusinessJsonLd(catalog = null) {
  const { address, openingHours } = BUSINESS;

  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    ...(SITE_URL && {
      '@id': `${SITE_URL}/#business`,
      url: SITE_URL,
      image: `${SITE_URL}${SITE.ogImage.url}`,
    }),
    name: SITE.name,
    description: SITE.description,
    telephone: BUSINESS.phone.e164,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressCountry: address.country,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: openingHours.days,
        opens: openingHours.opens,
        closes: openingHours.closes,
      },
    ],
    areaServed: { '@type': 'City', name: address.city },
    currenciesAccepted: 'EUR',
    ...offerCatalog(catalog),
    sameAs: [
      ...new Set(
        [...Object.values(BUSINESS.socials), BUSINESS.bookingUrl].filter(
          Boolean
        )
      ),
    ],
  };
}
