import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BookingPanel from '@/components/booking/BookingPanel';
import PriceTag from '@/components/booking/PriceTag';
import Header from '@/components/layout/Header';
import Notice from '@/components/ui/Notice';
import { findPrestation } from '@/lib/booking/catalog';
import { loadCatalog } from '@/lib/booking/loadCatalog';
import { formatDuration } from '@/lib/format';

// One bookable variant (service id). Not indexed: /reserver is the public,
// indexable entry; this step depends on the visitor's choice.
export const metadata = {
  title: 'Choisir un horaire',
  robots: { index: false, follow: false },
};

export default async function ReserverServicePage({ params }) {
  const { serviceId } = await params;
  const { catalog } = await loadCatalog();
  const prestation = catalog ? findPrestation(catalog, serviceId) : null;
  // The API lists only bookable services: unknown or archived → 404.
  if (catalog && !prestation) notFound();
  const service = prestation?.variants.find((item) => item.id === serviceId);

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
                ← Toutes les prestations
              </Link>
              <Notice tone="error">
                Cette prestation ne peut pas être affichée pour le moment.
                Réessayez dans quelques instants.
              </Notice>
            </>
          ) : (
            <Suspense
              fallback={
                <p className="font-montserrat text-body text-gray-800">
                  Chargement…
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
                    {prestation.description ? (
                      <p className="font-montserrat text-body max-w-2xl text-gray-800">
                        {prestation.description}
                      </p>
                    ) : null}
                    {prestation.variants.length > 1 ? (
                      <nav aria-label="Durée" className="max-w-full self-start">
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
