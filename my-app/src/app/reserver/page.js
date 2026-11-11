import { Suspense } from 'react';

import BookingSteps from '@/components/booking/BookingSteps';
import CatalogBrowser from '@/components/booking/CatalogBrowser';
import Header from '@/components/layout/Header';
import { ServiceList } from '@/components/booking/ServiceCard';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { loadCatalog } from '@/lib/booking/loadCatalog';
import { pageMetadata } from '@/lib/seo';

// The single booking entry of the site: choose a prestation and its
// duration here, then a time on /reserver/[serviceId]. Prices come from the
// API at request time (sales start and end on their own).
export const metadata = pageMetadata({
  title: 'Réserver un massage à Bordeaux',
  description:
    'Prenez rendez-vous en ligne pour votre massage à Bordeaux, 23 rue Castéja : choisissez le soin et le créneau qui vous conviennent.',
  path: '/reserver',
});

export default async function ReserverPage() {
  const { catalog } = await loadCatalog();

  return (
    <>
      <Header variant="solid" />
      <main className="px-page bg-secondary-50 flex-1 py-10 sm:py-16">
        <div className="max-w-content mx-auto flex w-full flex-col gap-10">
          <BookingSteps current={1} />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-3xl flex-col gap-4">
              <h1 className="text-section-title text-third-900">
                Réserver un massage{' '}
                <span className="heading-accent">à Bordeaux</span>
              </h1>
              <p className="font-montserrat text-body text-gray-800">
                Choisissez votre soin et sa durée, puis l’horaire qui vous
                convient. Le règlement se fait sur place, au cabinet, 23 rue
                Castéja.
              </p>
            </div>
            <ul className="font-montserrat text-body-sm flex flex-wrap gap-x-6 gap-y-2 text-gray-900">
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="bg-primary-200 size-1.5 rounded-full"
                />
                Confirmation immédiate
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="bg-primary-200 size-1.5 rounded-full"
                />
                Paiement au cabinet
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="bg-primary-200 size-1.5 rounded-full"
                />
                Annulation en ligne
              </li>
            </ul>
          </div>

          {catalog === null ? (
            <div className="flex flex-col gap-4">
              <Notice tone="error">
                Les prestations ne peuvent pas être affichées pour le moment.
                Réessayez dans quelques instants.
              </Notice>
              <PillButton
                href="/reserver"
                variant="outline"
                tone="dark"
                className="self-start"
              >
                Réessayer
              </PillButton>
            </div>
          ) : catalog.length === 0 ? (
            <Notice>Aucune prestation n’est ouverte à la réservation.</Notice>
          ) : (
            // Filters read the URL: the plain list is the fallback while
            // the search params are not known (static render).
            <Suspense
              fallback={<ServiceList catalog={catalog} headingLevel="h2" />}
            >
              <CatalogBrowser catalog={catalog} />
            </Suspense>
          )}
        </div>
      </main>
    </>
  );
}
