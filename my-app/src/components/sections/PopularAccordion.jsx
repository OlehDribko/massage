'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
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

/*
 * The two photos of the mock-up (variants 789:513 / 789:515 / 789:658):
 * the open item changes the photo. They alternate down the list.
 */
const PHOTOS = [
  {
    src: '/images/popular-neck.jpg',
    alt: 'Massage du cou, cliente allongée en cabine',
    position: 'object-[50%_62%]',
  },
  {
    src: '/images/popular-back.jpg',
    alt: 'Massage du dos et des épaules en cabine',
    position: 'object-[50%_35%]',
  },
];

const photoFor = (index) => PHOTOS[Math.max(index, 0) % PHOTOS.length];

/**
 * Figma «Nos soins populaires» (704:1296, tablet 704:2255, mobile
 * 704:1465): a numbered accordion, one item open at a time (the first by
 * default). A click on a row opens or closes it; the arrow only shows the
 * state (↗ open, ↘ closed). The open item shows the approved description
 * (when one exists), the lowest current price and the durations, and
 * « Réserver ce soin » books that prestation. The photo next to the list
 * follows the open item (from 1024 px); below, it sits inside the open
 * item.
 */
export default function PopularAccordion({ prestations }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  const shown = open < 0 ? 0 : open;

  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch">
      <ul className="flex min-w-0 flex-1 flex-col justify-center py-6 lg:py-[60px] lg:pr-[65px]">
        {prestations.map((prestation, index) => {
          const isOpen = index === open;
          const panelId = `${id}-${index}`;
          const number = String(index + 1).padStart(2, '0');
          const photo = photoFor(index);
          return (
            <li
              key={prestation.key}
              className="border-b border-black/7 py-6 last:border-b-0 max-sm:-mx-4 max-sm:px-4"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="group focus-visible:outline-primary-200 flex w-full min-w-0 items-start gap-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 sm:gap-20"
              >
                <span
                  aria-hidden
                  className="font-faustina text-gold w-7 shrink-0 pt-0.5 text-[24px] font-light tracking-[-0.24px] italic"
                >
                  {number}
                </span>
                <span className="font-montserrat text-title-sm sm:text-service-title group-hover:text-third-200 min-w-0 font-normal text-gray-900 transition-colors motion-reduce:transition-none">
                  {prestation.name}
                </span>
                <MaskIcon
                  src="/icons/arrow-up-right.svg"
                  className={`text-third-200 ml-auto size-7 shrink-0 transition-transform duration-300 motion-reduce:transition-none sm:size-8 ${isOpen ? '' : 'rotate-90'}`}
                />
              </button>

              <div
                id={panelId}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <div className="font-montserrat text-body flex flex-col pt-8 pl-[3.25rem] sm:pl-[6.75rem] lg:pr-[46px]">
                    {prestation.description ? (
                      <p className="text-gray-200">{prestation.description}</p>
                    ) : null}
                    <div
                      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 ${prestation.description ? 'pt-5' : ''}`}
                    >
                      <p className="flex items-center gap-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">
                          à partir de{' '}
                          {formatPrice(
                            lowestPrice(prestation),
                            prestation.variants[0].currency
                          )}
                        </span>
                        <span aria-hidden className="text-gray-200">
                          •
                        </span>
                        <span className="text-gray-200">
                          {durationRange(prestation.variants)}
                        </span>
                      </p>
                      <Link
                        href={`/reserver/${prestation.variants[0].id}`}
                        className="text-primary-200 hover:text-third-200 focus-visible:outline-primary-200 border-b-[1.2px] border-current text-[14px] font-medium tracking-[0.01em] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none"
                      >
                        Réserver ce soin
                      </Link>
                    </div>
                  </div>

                  {/* Phones and tablets (Figma 704:1465): the photo of the
                      open item, inside it. */}
                  <div className="relative mt-6 aspect-[358/398] w-full overflow-hidden rounded-[4px] sm:aspect-[4/3] lg:hidden">
                    {isOpen ? (
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 640px) 90vw, 100vw"
                        className={`object-cover ${photo.position}`}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* From 1024 px: the photo of the open item, cross-faded. */}
      <div className="relative hidden shrink-0 overflow-hidden lg:block lg:min-h-[703px] lg:w-[554px]">
        {PHOTOS.map((photo, index) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={index === shown % PHOTOS.length ? photo.alt : ''}
            aria-hidden={index === shown % PHOTOS.length ? undefined : true}
            fill
            sizes="554px"
            className={`object-cover ${photo.position} transition-opacity duration-500 motion-reduce:transition-none ${index === shown % PHOTOS.length ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
    </div>
  );
}
