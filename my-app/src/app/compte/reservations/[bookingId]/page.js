import { Suspense } from 'react';

import ClientBookingDetail from '@/components/booking/ClientBookingDetail';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

export const metadata = {
  title: 'Mon rendez-vous',
};

export default async function ReservationPage({ params }) {
  const { bookingId } = await params;

  return (
    <>
      <Header variant="solid" />
      <main className="px-page bg-secondary-50 flex-1 py-12 sm:py-20">
        <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-8">
          <SectionEyebrow>Espace client</SectionEyebrow>
          {/* Reads ?confirmee= (browser only). */}
          <Suspense
            fallback={
              <p className="font-montserrat text-body text-gray-800">
                Chargement…
              </p>
            }
          >
            <ClientBookingDetail bookingId={bookingId} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
