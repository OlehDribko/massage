import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import BookingPanel from '@/components/booking/BookingPanel';
import PriceTag from '@/components/booking/PriceTag';
import Header from '@/components/layout/Header';
import Notice from '@/components/ui/Notice';
import { findPrestation, variantTexts } from '@/lib/booking/catalog';
import { loadCatalog } from '@/lib/booking/loadCatalog';
import { Link } from '@/i18n/client';
import { getFormat, getT, setRequestLocale } from '@/i18n/server';

// One bookable variant (service id). Not indexed: /reserver is the public,
// indexable entry; this step depends on the visitor's choice.
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang);
  return {
    title: t('Choisir un horaire'),
    robots: { index: false, follow: false },
  };
}

export default async function ReserverServicePage({ params }) {
  const { lang, serviceId } = await params;
  setRequestLocale(lang);
  const t = getT();
  const { formatDuration } = getFormat();
  const { catalog } = await loadCatalog({ locale: lang });
  const prestation = catalog ? findPrestation(catalog, serviceId) : null;
  // The API lists only bookable services: unknown or archived → 404.
  if (catalog && !prestation) notFound();
  const service = prestation?.variants.find((item) => item.id === serviceId);
  // Texts of THIS duration (the API has one per duration).
  const { description, features } = variantTexts(service);

  return (
    <>
      <Header variant="solid" />
      <main className="px-page bg-secondary-50 flex-1 py-10 sm:py-16">
        <div className="max-w-content mx-auto flex w-full flex-col gap-10">
          {!service ? (
            <>
              <Link
                href="/reserver"
                className="font-montserrat text-body-sm hover:text-third-200 self-start text-gray-800 underline underline-offset-4"
              >
                {t('← Toutes les prestations')}
              </Link>
              <Notice tone="error">
                {t(
                  'Cette prestation ne peut pas être affichée pour le moment. Réessayez dans quelques instants.'
                )}
              </Notice>
            </>
          ) : (
            <Suspense
              fallback={
                <p className="font-montserrat text-body text-gray-800">
                  {t('Chargement…')}
                </p>
              }
            >
              {/* Keyed: another duration starts a new choice and intent. */}
              <BookingPanel
                key={service.id}
                service={service}
                intro={
                  <div className="flex flex-col gap-4">
                    <h1 className="text-section-title text-third-900">
                      {prestation.name}
                    </h1>
                    {description ? (
                      <p className="font-montserrat text-body max-w-2xl text-gray-800">
                        {description}
                      </p>
                    ) : null}
                    {features.length ? (
                      <ul className="font-montserrat text-body-sm flex max-w-2xl list-disc flex-col gap-1 pl-5 text-gray-800">
                        {features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    ) : null}
                    {prestation.variants.length > 1 ? (
                      <nav
                        aria-label={t('Durée')}
                        className="max-w-full self-start"
                      >
                        <ul className="rounded-pill flex max-w-full [scrollbar-width:none] gap-1 overflow-x-auto border border-black/10 bg-white p-1">
                          {prestation.variants.map((variant) => {
                            const current = variant.id === service.id;
                            return (
                              <li key={variant.id} className="shrink-0">
                                <Link
                                  href={`/reserver/${variant.id}`}
                                  aria-current={current ? 'page' : undefined}
                                  replace
                                  scroll={false}
                                  className={`rounded-pill font-montserrat text-body-sm focus-visible:outline-third-200 flex min-h-11 items-center gap-2 px-4 font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
                                    current
                                      ? 'bg-third-900 text-cream'
                                      : 'hover:text-third-200 text-gray-900'
                                  }`}
                                >
                                  {formatDuration(variant.durationMinutes)}
                                  <span aria-hidden>·</span>
                                  <PriceTag service={variant} />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </nav>
                    ) : (
                      <p className="font-montserrat text-body-lg flex flex-wrap gap-x-3 text-gray-900">
                        <span>{formatDuration(service.durationMinutes)}</span>
                        <span aria-hidden>·</span>
                        <PriceTag service={service} showSaleEnd />
                      </p>
                    )}
                  </div>
                }
              />
            </Suspense>
          )}
        </div>
      </main>
    </>
  );
}
