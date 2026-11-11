'use client';

import { useId, useState } from 'react';

import ForfaitsBlock from '@/components/booking/ForfaitsBlock';
import PriceTag from '@/components/booking/PriceTag';
import MaskIcon from '@/components/ui/MaskIcon';
import PillButton from '@/components/ui/PillButton';
import { FORFAITS } from '@/content/forfaits';
import { CATEGORIES } from '@/content/services';
import { formatDuration } from '@/lib/format';

const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((category) => [category.key, category.label])
);

export function PopularBadge({ className = '' }) {
  return (
    <span
      className={`font-montserrat bg-primary-200 text-on-gold inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide uppercase ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-3 fill-current">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
      </svg>
      Populaire
    </span>
  );
}

/**
 * One prestation of the catalogue as a card, in the site's style: category
 * eyebrow and « Populaire » badge, Faustina title, durations as pills, the
 * price and « Choisir l’horaire » under a hairline.
 * - the "Description" button opens the approved text (only when one exists);
 * - the duration pills (radios) choose the variant — id, duration, price;
 *   `initialServiceId` opens the card on a duration (e.g. a filter);
 * - "Choisir l’horaire" goes to step 2 with exactly that variant.
 */
export default function ServiceCard({
  prestation,
  headingLevel = 'h3',
  initialServiceId,
}) {
  const { name, description, variants, featured, category } = prestation;
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(
    initialServiceId ?? variants[0].id
  );
  const id = useId();
  const selected =
    variants.find((service) => service.id === selectedId) ?? variants[0];
  const Heading = headingLevel;

  return (
    <article className="rounded-panel hover:border-primary-200 group flex h-full flex-col gap-6 border border-black/7 bg-white p-6 transition-[border-color,box-shadow] duration-200 hover:shadow-[0_18px_40px_-24px_rgba(26,15,8,0.35)] motion-reduce:transition-none sm:p-7">
      <div className="flex flex-col gap-3">
        <div className="flex min-h-7 items-center justify-between gap-3">
          <p className="font-montserrat text-label-sm text-third-200 font-medium tracking-[0.12em] uppercase">
            {CATEGORY_LABEL[category] ?? 'Soin'}
          </p>
          {featured ? <PopularBadge /> : null}
        </div>
        <Heading className="font-faustina text-third-900 text-[1.75rem] leading-[1.1] font-normal">
          {name}
        </Heading>
        {description ? (
          <>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`${id}-panel`}
              onClick={() => setOpen((value) => !value)}
              className="font-montserrat text-label-sm hover:text-third-200 focus-visible:outline-third-200 -m-1 flex w-fit items-center gap-1.5 p-1 font-medium text-gray-800 uppercase focus-visible:outline-2"
            >
              {open ? 'Masquer' : 'Description'}
              <MaskIcon
                src="/icons/arrow-up-right.svg"
                className={`text-third-200 size-5 transition-transform duration-200 motion-reduce:transition-none ${open ? '' : 'rotate-90'}`}
              />
            </button>
            <div
              id={`${id}-panel`}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : '-mt-3 grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <p className="font-montserrat text-body-sm text-gray-800">
                  {description}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="font-montserrat text-label-sm mb-2.5 font-medium text-gray-800 uppercase">
          Durée<span className="sr-only"> — {name}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((service) => (
            <label
              key={service.id}
              className="rounded-pill font-montserrat text-body-sm has-checked:border-third-900 has-checked:bg-third-900 has-checked:text-cream has-focus-visible:outline-third-200 hover:border-third-200 relative flex min-h-10 cursor-pointer items-center justify-center border border-black/15 px-4 font-medium whitespace-nowrap text-gray-900 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 motion-reduce:transition-none"
            >
              <input
                type="radio"
                name={`${id}-duration`}
                value={service.id}
                checked={service.id === selected.id}
                onChange={() => setSelectedId(service.id)}
                className="sr-only"
              />
              {formatDuration(service.durationMinutes)}
            </label>
          ))}
        </div>
      </fieldset>

      {FORFAITS[prestation.key] ? (
        <ForfaitsBlock
          forfaits={FORFAITS[prestation.key]}
          singlePriceCents={variants[0].priceCents}
          name={name}
        />
      ) : null}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-black/7 pt-5">
        <p aria-live="polite" className="flex flex-col gap-0.5">
          <span className="font-montserrat text-label-sm font-medium text-gray-800 uppercase">
            Tarif
          </span>
          <span className="font-faustina text-third-900 text-[1.875rem] leading-none">
            <PriceTag service={selected} />
          </span>
        </p>
        <PillButton href={`/reserver/${selected.id}`} size="sm">
          Choisir l’horaire
          <span className="sr-only">
            {' '}
            — {name}, {formatDuration(selected.durationMinutes)}
          </span>
        </PillButton>
      </div>
    </article>
  );
}

/** Catalogue as a grid of cards: 1 → 2 → 3 columns. */
export function ServiceList({ catalog, headingLevel = 'h3', initialIds }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
