'use client';

import { useId, useState } from 'react';

import { BUSINESS } from '@/config/site';
import { forfaitRows } from '@/content/forfaits';
import { formatPrice } from '@/lib/format';

/**
 * Session packages of a prestation, as information (content/forfaits.js):
 * not bookable online — bought at the studio, then each session is booked
 * here. Collapsed by default so the card keeps the grid's rhythm.
 */
export default function ForfaitsBlock({ forfaits, singlePriceCents, name }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rows = forfaitRows(forfaits, singlePriceCents);
  const best = Math.max(...rows.map((row) => row.savingCents ?? 0));
  const subject = encodeURIComponent(`Forfait ${name}`);

  return (
    <div className="bg-secondary-50 flex flex-col gap-3 rounded-2xl p-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => setOpen((value) => !value)}
        className="focus-visible:outline-third-200 flex items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span className="flex flex-col gap-0.5">
          <span className="font-montserrat text-body-sm font-semibold text-gray-900">
            Forfaits · {rows.length} formules
          </span>
          {best ? (
            <span className="font-montserrat text-third-200 text-xs font-medium">
              Jusqu’à {formatPrice(best)} d’économie
            </span>
          ) : null}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
          className={`text-third-200 size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={`${id}-list`}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : '-mt-3 grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
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
                    <span className="text-xs text-gray-800">
                      <s className="decoration-black/40">
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
          <p className="font-montserrat text-body-sm mt-2 text-gray-800">
            Forfaits réglés au cabinet, chaque séance se réserve ensuite en
            ligne. Pour en profiter :{' '}
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
      </div>
    </div>
  );
}
