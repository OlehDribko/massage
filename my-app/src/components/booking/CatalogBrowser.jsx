'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

import ServiceCard, { PopularBadge } from '@/components/booking/ServiceCard';
import { CATEGORIES } from '@/content/services';
import {
  BUDGET_FILTERS,
  DURATION_FILTERS,
  filterCatalog,
  matchingVariants,
} from '@/lib/booking/catalog';

gsap.registerPlugin(useGSAP, Flip);

const motionOk = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

const chip =
  'rounded-pill font-montserrat text-body-sm focus-visible:outline-third-200 inline-flex min-h-10 shrink-0 items-center gap-2 border px-4 font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none';
const chipOn = 'border-third-900 bg-third-900 text-cream';
const chipOff = 'border-black/15 bg-white text-gray-900 hover:border-third-200';

function ChipGroup({ label, options, value, onChange, scroll = false }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-montserrat text-label-sm font-medium text-gray-800 uppercase">
        {label}
      </p>
      <div
        role="group"
        aria-label={label}
        className={
          scroll
            ? '-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0'
            : 'flex flex-wrap gap-2'
        }
      >
        {options.map((option) => {
          const active = value === option.key;
          return (
            <button
              key={option.key ?? 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : option.key)}
              className={`${chip} ${active ? chipOn : chipOff}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const valid = (list, value) =>
  list.some((item) => item.key === value) ? value : null;

/**
 * /reserver catalogue with filters: category (after the studio's Planity
 * sections), duration, budget and « Populaires ». Filters live in the URL
 * (?categorie=&duree=&budget=&populaires=1) so a filtered list can be
 * shared; nothing is requested again — prices and durations come from the
 * catalogue already loaded on the server.
 *
 * Motion: the URL changes with history.replaceState (not a navigation, so
 * no page transition and no jump); cards then glide to their new places
 * (GSAP Flip), new ones fade in and the list height follows smoothly.
 * Cards and filters rise in on arrival. Nothing moves with reduced motion.
 */
export default function CatalogBrowser({ catalog }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const pendingFlip = useRef(null);
  const running = useRef([]);

  const filters = {
    category: valid(CATEGORIES, searchParams.get('categorie')),
    duration: valid(DURATION_FILTERS, searchParams.get('duree')),
    budget: valid(BUDGET_FILTERS, searchParams.get('budget')),
    popular: searchParams.get('populaires') === '1',
  };
  const active =
    Boolean(filters.category || filters.duration || filters.budget) ||
    filters.popular;

  const results = useMemo(
    () => filterCatalog(catalog, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, searchParams]
  );

  // Before the list changes: remember where every card is.
  const capture = () => {
    const list = listRef.current;
    if (!list || !motionOk()) return;
    // A previous glide still running ends at once, from its final layout.
    running.current.forEach((tween) => tween.progress(1).kill());
    running.current = [];
    pendingFlip.current = {
      state: Flip.getState(list.querySelectorAll('[data-flip-id]')),
      height: list.offsetHeight,
    };
  };

  const navigate = (query) => {
    capture();
    window.history.replaceState(
      null,
      '',
      query ? `${pathname}?${query}` : pathname
    );
  };

  const update = (name, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(name, value);
    else params.delete(name);
    navigate(params.toString());
  };

  const queryKey = searchParams.toString();

  // After the list changed: glide from the remembered places.
  useLayoutEffect(() => {
    const pending = pendingFlip.current;
    const list = listRef.current;
    pendingFlip.current = null;
    // No cleanup kill: in development React runs effects twice, and the
    // second run (pending already consumed) must not stop the first glide.
    if (!pending || !list) return;

    const height = list.offsetHeight;
    running.current = [
      gsap.fromTo(
        list,
        { height: pending.height, overflow: 'hidden' },
        {
          height,
          duration: 0.55,
          ease: 'power2.inOut',
          clearProps: 'height,overflow',
        }
      ),
      Flip.from(pending.state, {
        targets: list.querySelectorAll('[data-flip-id]'),
        duration: 0.55,
        ease: 'power2.inOut',
        stagger: 0.015,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { autoAlpha: 0, y: 28, scale: 0.97 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              delay: 0.12,
              stagger: 0.05,
              ease: 'power3.out',
            }
          ),
      }),
    ];
  }, [queryKey]);

  // Arrival: the filters, then the cards, rise in.
  useGSAP(
    () => {
      if (!motionOk()) return;
      gsap.from('[data-rise]', {
        y: 28,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
      });
      gsap.from(listRef.current?.querySelectorAll('[data-flip-id]') ?? [], {
        y: 36,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.05,
        delay: 0.15,
        ease: 'power3.out',
      });
    },
    { scope: rootRef }
  );

  const categoriesInUse = CATEGORIES.filter((category) =>
    catalog.some((prestation) => prestation.category === category.key)
  );

  return (
    <div ref={rootRef} className="flex flex-col gap-8">
      <section
        data-rise
        aria-label="Filtrer les soins"
        className="rounded-panel flex flex-col gap-6 border border-black/7 bg-white p-5 sm:p-7"
      >
        <ChipGroup
          label="Type de soin"
          scroll
          value={filters.category}
          onChange={(value) => update('categorie', value)}
          options={categoriesInUse}
        />
        <div className="grid gap-6 lg:grid-cols-[auto_auto_1fr] lg:items-start lg:gap-10">
          <ChipGroup
            label="Durée"
            value={filters.duration}
            onChange={(value) => update('duree', value)}
            options={DURATION_FILTERS}
          />
          <ChipGroup
            label="Budget"
            value={filters.budget}
            onChange={(value) => update('budget', value)}
            options={BUDGET_FILTERS}
          />
          <div className="flex flex-wrap items-center gap-3 lg:justify-end lg:self-end">
            <button
              type="button"
              aria-pressed={filters.popular}
              onClick={() => update('populaires', filters.popular ? null : '1')}
              className={`${chip} ${filters.popular ? chipOn : chipOff}`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className={`size-4 fill-current ${filters.popular ? 'text-primary-100' : 'text-primary-200'}`}
              >
                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
              </svg>
              Populaires
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          aria-live="polite"
          className="font-montserrat text-body text-gray-900"
        >
          <span className="font-semibold">{results.length}</span>{' '}
          {results.length > 1 ? 'soins' : 'soin'}
          {active ? ' correspondant à vos critères' : ' disponibles'}
        </p>
        {active ? (
          <button
            type="button"
            onClick={() => navigate('')}
            className="font-montserrat text-body-sm hover:text-third-200 focus-visible:outline-third-200 min-h-10 text-gray-800 underline underline-offset-4 focus-visible:outline-2"
          >
            Effacer les filtres
          </button>
        ) : (
          <p className="font-montserrat text-body-sm flex items-center gap-2 text-gray-800">
            <PopularBadge /> les soins les plus demandés
          </p>
        )}
      </div>

      <div ref={listRef}>
        {results.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((prestation) => {
              const initial =
                filters.duration || filters.budget
                  ? matchingVariants(prestation, filters)[0]?.id
                  : undefined;
              return (
                <li
                  key={`${prestation.key}:${initial ?? ''}`}
                  data-flip-id={prestation.key}
                >
                  <ServiceCard
                    prestation={prestation}
                    headingLevel="h2"
                    initialServiceId={initial}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <div
            data-flip-id="empty"
            className="rounded-panel bg-secondary-50 flex flex-col items-center gap-3 border border-dashed border-black/15 px-6 py-12 text-center"
          >
            <p className="font-faustina text-third-900 text-2xl">
              Aucun soin ne correspond
            </p>
            <p className="font-montserrat text-body-sm max-w-md text-gray-800">
              Essayez une autre durée ou un autre budget.
            </p>
            <button
              type="button"
              onClick={() => navigate('')}
              className={`${chip} ${chipOff}`}
            >
              Voir tous les soins
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
