'use client';

import ForfaitsBlock from '@/components/booking/ForfaitsBlock';
import { FORFAITS, bestOffer, forfaitRows } from '@/content/forfaits';
import {
  hasActiveSale,
  shownVariant,
  variantTexts,
} from '@/lib/booking/catalog';
import { Link, useFormat, useT } from '@/i18n/client';

/** Gold « Promotion » tag of the mock-up (star, 11 px caps). */
export function PromoBadge({ className = '' }) {
  const t = useT();
  return (
    <span
      className={`font-montserrat bg-primary-200 text-on-gold inline-flex h-[22px] items-center gap-1 rounded-lg px-2 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase ${className}`}
    >
      <StarIcon className="size-3" />
      {t('Promotion')}
    </span>
  );
}

export function StarIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </svg>
  );
}

/** Price of the shown duration; during a sale, larger, with the old one. */
function RowPrice({ service }) {
  const t = useT();
  const { formatPrice } = useFormat();
  if (!hasActiveSale(service)) {
    return (
      <span className="text-[1.125rem] font-medium whitespace-nowrap text-gray-900">
        {formatPrice(service.effectivePriceCents, service.currency)}
      </span>
    );
  }
  return (
    <>
      <span className="text-secondary-900 text-[1.375rem] font-bold whitespace-nowrap">
        <span className="sr-only">{t('Prix promotionnel : ')}</span>
        {formatPrice(service.effectivePriceCents, service.currency)}
      </span>
      <span className="text-body-sm whitespace-nowrap text-gray-800">
        <span className="sr-only">{t('au lieu de ')} </span>
        <s>{formatPrice(service.priceCents, service.currency)}</s>
      </span>
    </>
  );
}

/**
 * One prestation of the catalogue as a row (designer mock-up « Choix du
 * soin »): name with its tags and the API description on the left; on the
 * right the duration · price of the shown duration (`shownVariant`: the
 * one on sale, else the one closest to 1 h) and « Choisir ». The other
 * durations are chosen on the next step (/reserver/[serviceId]).
 *
 * Layout: phone — one column, price and button under the text, right
 * aligned; tablet (md) — two columns, price above the button; desktop
 * (lg) — price and button side by side.
 * `categoryLabel`: shown under the name where the category is not the
 * section's title (« Promotions en cours »).
 */
export default function ServiceCard({
  prestation,
  headingLevel = 'h3',
  categoryLabel,
}) {
  const t = useT();
  const { formatDuration, formatPrice } = useFormat();
  const { name, variants } = prestation;
  const selected = shownVariant(prestation);
  const { description } = variantTexts(selected);
  const Heading = headingLevel;
  // Packages: a badge with the saving and the lowest price per session
  // (content/forfaits.js).
  const forfaits = FORFAITS[prestation.key]
    ? forfaitRows(FORFAITS[prestation.key], variants[0].priceCents)
    : null;
  const offer = forfaits ? bestOffer(forfaits) : null;

  return (
    <article className="font-montserrat relative grid grid-cols-[minmax(0,1fr)] items-start gap-3 border-b border-black/7 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8 md:py-6 lg:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <Heading className="text-base leading-[1.4] font-semibold tracking-[0.01em] text-gray-900 md:text-[1.125rem]">
            {name}
          </Heading>
          {hasActiveSale(selected) ? <PromoBadge /> : null}
          {offer?.maxPercent ? (
            <ForfaitsBlock
              rows={forfaits}
              name={name}
              percent={offer.maxPercent}
            />
          ) : null}
        </div>
        {categoryLabel ? (
          <p className="mt-0.5 text-xs text-gray-800">{categoryLabel}</p>
        ) : null}
        {description ? (
          <p className="text-body-sm mt-1.5 max-w-[640px] text-gray-800">
            {description}
          </p>
        ) : null}
        {offer?.minPerSessionCents ? (
          <p className="text-third-200 mt-1.5 text-xs font-semibold">
            {t('ou dès {price} / séance en forfait', {
              price: formatPrice(offer.minPerSessionCents),
            })}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-4 md:flex-col md:items-end md:gap-3 lg:flex-row lg:items-center lg:gap-6">
        <p className="flex flex-wrap items-baseline justify-end gap-2 text-right">
          <span className="text-body-sm whitespace-nowrap text-gray-800 after:ml-2 after:content-['·']">
            {formatDuration(selected.durationMinutes)}
          </span>
          <RowPrice service={selected} />
        </p>
        <Link
          href={`/reserver/${selected.id}`}
          className="rounded-pill hover:border-third-200 hover:text-third-200 focus-visible:outline-primary-300 inline-flex h-11 min-w-[120px] shrink-0 items-center justify-center border border-gray-900 px-6 text-[0.875rem] font-medium tracking-[0.05em] text-gray-900 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
        >
          {t('Choisir')}
          <span className="sr-only">
            {' '}
            — {name}, {formatDuration(selected.durationMinutes)}
          </span>
        </Link>
      </div>
    </article>
  );
}

/** Prestations as rows, one under the other (no section titles). */
export function ServiceList({ catalog, headingLevel = 'h3' }) {
  return (
    <ul className="flex flex-col border-t border-black/7">
      {catalog.map((prestation) => (
        <li key={prestation.key}>
          <ServiceCard prestation={prestation} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
