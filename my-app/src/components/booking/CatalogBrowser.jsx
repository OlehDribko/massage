'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

import CatalogSections from '@/components/booking/CatalogSections';
import { StarIcon } from '@/components/booking/ServiceCard';
import { useT } from '@/i18n/client';
import { rich } from '@/i18n/rich';
import { CATEGORIES } from '@/content/services';
import { POPULAR, PROMOTIONS, catalogSections } from '@/lib/booking/catalog';

gsap.registerPlugin(useGSAP, Flip);

const motionOk = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

// Category pill of the mock-up: 44 px, sand border, dark when chosen.
const pill =
  'rounded-pill font-montserrat text-body-sm focus-visible:outline-primary-300 inline-flex h-11 shrink-0 items-center gap-2 border px-4 font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none md:px-5';
const pillOn = 'border-secondary-900 bg-secondary-900 text-cream';
const pillOff = 'border-secondary-200 text-gray-900 hover:border-third-200';

/**
 * /reserver catalogue (designer mock-up « Choix du soin »): one pill
 * chosen at a time — « Promotions », « Populaires » (featured
 * prestations), « Toutes les prestations » or a
 * category (after the studio's Planity sections). Everything shows in
 * sections, one per category; « Promotions » gathers the prestations on
 * sale in one section. The choice lives in the URL (?categorie=) so a
 * filtered list can be shared; nothing is requested again — prices and
 * durations come from the catalogue already loaded on the server.
 *
 * Motion: the URL changes with history.replaceState (not a navigation, so
 * no page transition and no jump); rows and section titles then glide to
 * their new places (GSAP Flip), new ones fade in and the list height
 * follows smoothly. Nothing moves with reduced motion.
 */
export default function CatalogBrowser({ catalog }) {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const pendingFlip = useRef(null);
  const running = useRef([]);

  const categoriesInUse = CATEGORIES.filter((category) =>
    catalog.some((prestation) => prestation.category === category.key)
  );
  const asked = searchParams.get('categorie');
  const current =
    asked === PROMOTIONS ||
    asked === POPULAR ||
    categoriesInUse.some((category) => category.key === asked)
      ? asked
      : null;

  const sections = useMemo(
    () => catalogSections(catalog, CATEGORIES, current),
    [catalog, current]
  );
  const shown = sections.reduce(
    (sum, section) => sum + section.items.length,
    0
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

  const choose = (value) => {
    if (value === current) return;
    const params = new URLSearchParams(searchParams);
    if (value) params.set('categorie', value);
    else params.delete('categorie');
    navigate(params.toString());
  };

  const queryKey = current ?? '';

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

  // Arrival: the pills, then the rows, rise in.
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

  const pills = [
    { key: PROMOTIONS, label: t('Promotions'), icon: 'star' },
    { key: POPULAR, label: t('Populaires'), icon: 'heart' },
    { key: null, label: t('Toutes les prestations') },
    ...categoriesInUse.map((category) => ({
      key: category.key,
      label: t(category.label),
    })),
  ];

  return (
    <div ref={rootRef} className="flex flex-col">
      <div
        data-rise
        role="group"
        aria-label={t('Catégories de soins')}
        className="flex flex-wrap gap-2"
      >
        {pills.map((option) => {
          const active = option.key === current;
          return (
            <button
              key={option.key ?? 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => choose(option.key)}
              className={`${pill} ${active ? pillOn : pillOff}`}
            >
              {option.icon === 'star' ? (
                <StarIcon className="text-primary-200 size-5" />
              ) : null}
              {option.icon === 'heart' ? (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  fill="currentColor"
                  className="text-third-200 size-5"
                >
                  <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.1 4.5c2 0 3.4 1.1 4.9 2.9 1.5-1.8 2.9-2.9 4.9-2.9 3.5 0 5.6 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
                </svg>
              ) : null}
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        data-rise
        aria-live="polite"
        className="font-montserrat mt-6 flex flex-col gap-1 text-gray-900 md:mt-8 md:flex-row md:flex-wrap md:items-baseline md:justify-between md:gap-x-6"
      >
        <p className="text-body-sm">
          {rich(
            current === PROMOTIONS
              ? t(
                  '<b>{n}</b> prestation en promotion|<b>{n}</b> prestations en promotion',
                  { n: shown }
                )
              : t('<b>{n}</b> prestation|<b>{n}</b> prestations', {
                  n: shown,
                }),
            { b: (chunks) => <strong className="font-bold">{chunks}</strong> }
          )}
        </p>
        <p className="text-xs text-gray-800">
          {t(
            'Tarif affiché pour une séance d’1 h (ou la durée indiquée). D’autres durées sont proposées à l’étape suivante.'
          )}
        </p>
      </div>

      <div ref={listRef} className="mt-10 md:mt-12">
        {sections.length ? (
          <CatalogSections sections={sections} />
        ) : (
          <p
            data-flip-id="empty"
            className="rounded-panel bg-secondary-100 font-montserrat text-body p-6 text-gray-900 md:p-10"
          >
            {t(
              'Aucune promotion en cours pour le moment. Découvrez toutes nos prestations.'
            )}
          </p>
        )}
      </div>
    </div>
  );
}
