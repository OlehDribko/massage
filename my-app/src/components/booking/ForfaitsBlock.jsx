'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { BUSINESS } from '@/config/site';
import { formatPrice } from '@/lib/format';

/**
 * Session packages of a prestation, as information (content/forfaits.js).
 * The list opens as a dropdown OVER the card (positioned against the card,
 * which is `relative`), so neither this card nor the other cards of its row
 * change height. Escape or a click outside closes
 * it. Not bookable online: bought at the studio, then each session is
 * booked here.
 */
export default function ForfaitsBlock({ rows, name, percent }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const id = useId();
  const subject = encodeURIComponent(`Forfait ${name}`);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-label={`Voir les ${rows.length} forfaits — jusqu’à ${percent} % d’économie`}
        onClick={() => setOpen((value) => !value)}
        className="font-montserrat bg-third-200 hover:bg-third-900 focus-visible:outline-third-200 inline-flex items-center gap-1 rounded-full py-1 pr-1.5 pl-2.5 text-[0.6875rem] font-semibold tracking-wide text-white uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Forfaits −{percent} %
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden
          className={`size-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          id={`${id}-panel`}
          role="region"
          aria-label={`Forfaits — ${name}`}
          className="absolute inset-x-3 top-16 z-30 flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-4 text-left normal-case shadow-[0_24px_48px_-20px_rgba(26,15,8,0.35)] sm:inset-x-4"
        >
          <ul className="flex flex-col divide-y divide-black/7">
            {rows.map((row) => (
              <li
                key={row.label}
                className="font-montserrat flex items-start justify-between gap-3 py-2.5"
              >
                <span className="flex flex-col">
                  <span className="text-body-sm font-medium text-gray-900">
                    {row.label}
                  </span>
                  <span className="text-xs text-gray-800">
                    soit {formatPrice(row.perSessionCents)} / séance
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="font-faustina text-third-900 text-xl leading-tight">
                    {formatPrice(row.priceCents)}
                  </span>
                  {row.savingCents ? (
                    <span className="text-xs">
                      <s className="text-gray-800 decoration-black/40">
                        {formatPrice(row.fullCents)}
                      </s>{' '}
                      <span className="text-third-200 font-semibold">
                        −{formatPrice(row.savingCents)}
                      </span>
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          <p className="font-montserrat text-body-sm bg-secondary-50 rounded-xl px-3 py-2.5 text-gray-800">
            Forfait réglé au cabinet, chaque séance se réserve ensuite en ligne.
            Pour en profiter :{' '}
            <a
              href={`tel:${BUSINESS.phone.e164}`}
              className="hover:text-third-200 font-medium whitespace-nowrap text-gray-900 underline underline-offset-2"
            >
              {BUSINESS.phone.display}
            </a>{' '}
            ou{' '}
            <a
              href={`mailto:${BUSINESS.email}?subject=${subject}`}
              className="hover:text-third-200 font-medium text-gray-900 underline underline-offset-2"
            >
              par e-mail
            </a>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
