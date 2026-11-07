'use client';

import { useId, useState } from 'react';
import Link from 'next/link';

import MaskIcon from '@/components/ui/MaskIcon';
import { lowestPrice } from '@/lib/booking/catalog';
import { formatPrice } from '@/lib/format';

/** "60-90 min" (Figma) for the durations of a prestation. */
function durationRange(variants) {
  const first = variants[0].durationMinutes;
  const last = variants.at(-1).durationMinutes;
  return first === last ? `${first} min` : `${first}-${last} min`;
}

/**
 * Figma «Nos soins populaires» (704:1296): a numbered accordion, one item
 * open at a time (the first by default). The open item shows the approved
 * description (when one exists), the lowest current price and the
 * durations; its ↗ arrow books that prestation. Closed items show ↘.
 * `media` (the section photo) is shown under the open item below 1024 px.
 */
export default function PopularAccordion({ prestations, media }) {
  const [open, setOpen] = useState(0);
  const id = useId();

  return (
    <ul className="flex flex-col">
      {prestations.map((prestation, index) => {
        const isOpen = index === open;
        const panelId = `${id}-${index}`;
        const number = String(index + 1).padStart(2, '0');
        return (
          <li
            key={prestation.key}
            className="border-b border-black/7 py-6 last:border-b-0 max-sm:-mx-4 max-sm:px-4"
          >
            <div className="flex items-start justify-between gap-4">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="group focus-visible:outline-primary-200 flex min-w-0 flex-1 items-start gap-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 sm:gap-20"
              >
                <span
                  aria-hidden
                  className="font-faustina text-gold w-7 shrink-0 pt-0.5 text-[24px] font-light tracking-[-0.24px] italic"
                >
                  {number}
                </span>
                <span className="font-montserrat text-title-sm sm:text-service-title group-hover:text-third-200 font-normal text-gray-900 transition-colors motion-reduce:transition-none">
                  {prestation.name}
                </span>
                {!isOpen ? (
                  <MaskIcon
                    src="/icons/arrow-up-right.svg"
                    className="text-third-200 ml-auto size-7 shrink-0 rotate-90 sm:size-8"
                  />
                ) : null}
              </button>
              {isOpen ? (
                <Link
                  href={`/reserver/${prestation.variants[0].id}`}
                  aria-label={`Réserver — ${prestation.name}`}
                  className="text-third-200 hover:text-third-900 focus-visible:outline-primary-200 -m-1.5 shrink-0 p-1.5 transition-colors focus-visible:outline-2 motion-reduce:transition-none"
                >
                  <MaskIcon
                    src="/icons/arrow-up-right.svg"
                    className="size-7 sm:size-8"
                  />
                </Link>
              ) : null}
            </div>

            <div
              id={panelId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <div className="font-montserrat text-body flex max-w-[366px] flex-col pt-8 pl-[3.25rem] sm:pl-[6.75rem]">
                  {prestation.description ? (
                    <p className="text-gray-200">{prestation.description}</p>
                  ) : null}
                  <p className="flex items-center justify-between gap-4 pt-5 whitespace-nowrap">
                    <span className="font-semibold text-gray-800">
                      à partir de{' '}
                      {formatPrice(
                        lowestPrice(prestation),
                        prestation.variants[0].currency
                      )}
                    </span>
                    <span className="text-gray-200">
                      {durationRange(prestation.variants)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Phones (Figma 704:1465): the photo follows the open item. */}
            {media && index === (open < 0 ? 0 : open) ? (
              <div className="pt-6 lg:hidden">{media}</div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
