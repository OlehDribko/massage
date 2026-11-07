'use client';

import { useId, useState } from 'react';

import PriceTag from '@/components/booking/PriceTag';
import MaskIcon from '@/components/ui/MaskIcon';
import PillButton from '@/components/ui/PillButton';
import { formatDuration } from '@/lib/format';

/**
 * One prestation of the catalogue as a card (no photo yet). Three separate
 * controls, nothing nested:
 * - the "Description" button opens/closes the approved text (only when one
 *   exists); the collapsed text stays in the HTML but is `inert`;
 * - the duration switch (radios) chooses the variant — id, duration, price;
 * - "Choisir l’horaire" goes to step 2 with exactly that variant.
 */
export default function ServiceCard({ prestation, headingLevel = 'h3' }) {
  const { name, description, variants } = prestation;
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(variants[0].id);
  const id = useId();
  const selected =
    variants.find((service) => service.id === selectedId) ?? variants[0];
  const Heading = headingLevel;

  return (
    <article className="rounded-panel flex h-full flex-col gap-5 border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-3">
        <Heading className="font-faustina text-third-900 text-[1.625rem] leading-tight font-medium">
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

      {variants.length === 1 ? (
        <p className="font-montserrat text-body-sm text-gray-800">
          Durée :{' '}
          <span className="font-medium text-gray-900">
            {formatDuration(selected.durationMinutes)}
          </span>
        </p>
      ) : (
        <fieldset className="flex flex-col gap-2">
          <legend className="font-montserrat text-body-sm mb-2 text-gray-800">
            Durée<span className="sr-only"> — {name}</span>
          </legend>
          <div className="rounded-pill bg-secondary-50 flex gap-1 p-1">
            {variants.map((service) => (
              <label
                key={service.id}
                className="rounded-pill font-montserrat text-body-sm has-checked:bg-third-900 has-checked:text-cream has-focus-visible:outline-third-200 hover:text-third-900 relative flex min-h-11 flex-1 cursor-pointer items-center justify-center px-3 font-medium whitespace-nowrap text-gray-900 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 motion-reduce:transition-none"
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
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-1">
        <p
          aria-live="polite"
          className="font-faustina text-third-900 text-[1.75rem] leading-none"
        >
          <PriceTag service={selected} />
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
export function ServiceList({ catalog, headingLevel = 'h3' }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {catalog.map((prestation) => (
        <li key={prestation.key}>
          <ServiceCard prestation={prestation} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
