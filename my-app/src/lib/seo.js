import { BUSINESS, SITE, SITE_URL } from '@/config/site';
import {
  DEFAULT_LOCALE,
  LOCALES,
  OG_LOCALES,
  localizePath,
} from '@/i18n/config';
import { createTranslator, frenchT } from '@/i18n/translate';
import { getMessages } from '@/i18n/messages';
import { createFormat } from '@/lib/format';

const translatorFor = (locale) => createTranslator(locale, getMessages(locale));

function openGraphBase(locale) {
  const t = translatorFor(locale);
  return {
    type: 'website',
    siteName: SITE.name,
    locale: OG_LOCALES[locale] ?? SITE.ogLocale,
    alternateLocale: LOCALES.filter((other) => other !== locale).map(
      (other) => OG_LOCALES[other]
    ),
    images: [{ ...SITE.ogImage, alt: t(SITE.ogImage.alt) }],
  };
}

/** Site-wide defaults for the root layout. */
export function rootOpenGraph(locale = DEFAULT_LOCALE) {
  return {
    ...openGraphBase(locale),
    title: SITE.name,
    description: translatorFor(locale)(SITE.description),
  };
}

/**
 * hreflang links of a page: every language + x-default (French), and the
 * canonical URL of this language's version.
 */
export function languageAlternates(path, locale = DEFAULT_LOCALE) {
  return {
    canonical: localizePath(locale, path),
    languages: {
      ...Object.fromEntries(
        LOCALES.map((other) => [other, localizePath(other, path)])
      ),
      'x-default': localizePath(DEFAULT_LOCALE, path),
    },
  };
}

/**
 * Per-page metadata: title, description, canonical and share preview.
 * Next.js merges metadata shallowly, so openGraph/twitter are rebuilt here
 * instead of relying on the layout's values.
 *
 * @param {object} options
 * @param {string} options.title - page title (the layout appends the brand)
 * @param {boolean} [options.absoluteTitle] - use `title` as is, without the brand suffix
 * @param {string} options.description
 * @param {string} options.path - French route path, e.g. "/reserver"
 * @param {string} [options.locale] - language of this version ('fr' default)
 */
export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  locale = DEFAULT_LOCALE,
}) {
  const shareTitle = absoluteTitle ? title : `${title} | ${SITE.name}`;
  const ownPath = localizePath(locale, path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    // Without a confirmed domain a canonical would point at the wrong host.
    ...(SITE_URL && { alternates: languageAlternates(path, locale) }),
    openGraph: {
      ...openGraphBase(locale),
      title: shareTitle,
      description,
      ...(SITE_URL && { url: ownPath }),
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
function offerCatalog(catalog, t, format) {
  const { formatDuration, formatPrice } = format;
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
        url: `${SITE_URL}${localizePath(format.language, `/reserver/${encodeURIComponent(service.id)}`)}`,
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
      name: t('Massages et soins'),
      itemListElement: offers,
    },
  };
}

/**
 * schema.org LocalBusiness data, built only from confirmed BUSINESS facts,
 * plus the price list when the catalogue is available. `catalog` is
 * expected already translated (lib/booking/catalogI18n.js); `locale` sets
 * the language of the texts and URLs. The @id stays the same for every
 * language: one business.
 */
export function localBusinessJsonLd(catalog = null, locale = DEFAULT_LOCALE) {
  const { address, openingHours } = BUSINESS;
  const t = locale === DEFAULT_LOCALE ? frenchT : translatorFor(locale);
  const format = createFormat(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    ...(SITE_URL && {
      '@id': `${SITE_URL}/#business`,
      url: locale === DEFAULT_LOCALE ? SITE_URL : `${SITE_URL}/${locale}`,
      image: `${SITE_URL}${SITE.ogImage.url}`,
    }),
    name: SITE.name,
    description: t(SITE.description),
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
    ...offerCatalog(catalog, t, format),
    sameAs: [
      ...new Set(
        [...Object.values(BUSINESS.socials), BUSINESS.bookingUrl].filter(
          Boolean
        )
      ),
    ],
  };
}
