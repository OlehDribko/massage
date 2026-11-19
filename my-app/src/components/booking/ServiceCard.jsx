'use client';

import ForfaitsBlock from '@/components/booking/ForfaitsBlock';
import { FORFAITS, bestOffer, forfaitRows } from '@/content/forfaits';
import { hasActiveSale, variantTexts } from '@/lib/booking/catalog';
import { Link, useFormat, useT } from '@/i18n/client';

export function PopularBadge({ className = '' }) {
  const t = useT();
  return (
    <span
      className={`font-montserrat bg-primary-200 text-on-gold inline-flex h-[22px] items-center gap-1 rounded-lg px-2 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-3 fill-current">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
      </svg>
      {t('Populaire')}
    </span>
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
 * soin »): name with its badges and the API description on the left; on
 * the right the duration · price of the shown duration and « Choisir ».
 * The shown duration is the shortest one, or the one matching a duration /
 * budget filter (`initialServiceId`); the other durations are chosen on
 * the next step (/reserver/[serviceId] lists them).
 */
export default function ServiceCard({
  prestation,
  headingLevel = 'h3',
  initialServiceId,
}) {
  const t = useT();
  const { formatDuration, formatPrice } = useFormat();
  const { name, variants, featured } = prestation;
  const selected =
    variants.find((service) => service.id === initialServiceId) ?? variants[0];
  const { description } = variantTexts(selected);
  const Heading = headingLevel;
  // Packages: a badge with the saving and the lowest price per session
  // (content/forfaits.js).
  const forfaits = FORFAITS[prestation.key]
    ? forfaitRows(FORFAITS[prestation.key], variants[0].priceCents)
    : null;
  const offer = forfaits ? bestOffer(forfaits) : null;

  return (
    <article className="font-montserrat grid grid-cols-[minmax(0,1fr)] items-start gap-3 border-b border-black/7 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:py-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <Heading className="text-base leading-[1.4] font-semibold tracking-[0.01em] text-gray-900 sm:text-[1.125rem]">
            {name}
          </Heading>
          {featured ? <PopularBadge /> : null}
          {offer?.maxPercent ? (
            <ForfaitsBlock
              rows={forfaits}
              name={name}
              percent={offer.maxPercent}
            />
          ) : null}
        </div>
        {description ? (
          <p className="text-body-sm mt-1.5 max-w-[640px] tracking-[0.01em] text-gray-800">
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

      <div className="flex items-center justify-end gap-4 sm:gap-6">
        <p className="flex flex-wrap items-baseline justify-end gap-2 text-right">
          <span className="text-body-sm whitespace-nowrap text-gray-800 after:ml-2 after:content-['·']">
            {formatDuration(selected.durationMinutes)}
          </span>
          <RowPrice service={selected} />
        </p>
        <Link
          href={`/reserver/${selected.id}`}
          className="rounded-pill hover:border-third-200 hover:text-third-200 focus-visible:outline-third-200 inline-flex h-11 min-w-[120px] shrink-0 items-center justify-center border border-gray-900 px-6 text-[0.875rem] font-medium tracking-[0.05em] text-gray-900 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
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

/** Catalogue as a list of rows, one under the other. */
export function ServiceList({ catalog, headingLevel = 'h3', initialIds }) {
  return (
    <ul className="flex flex-col border-t border-black/7">
      {catalog.map((prestation) => (
        <li key={prestation.key}>
          <ServiceCard
            prestation={prestation}
            headingLevel={headingLevel}
            initialServiceId={initialIds?.get(prestation.key)}
          />
        </li>
      ))}
    </ul>
  );
}
