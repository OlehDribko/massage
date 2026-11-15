import { Suspense } from 'react';

import AdminGiftCardDetail from '@/components/admin/AdminGiftCardDetail';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

export const metadata = {
  title: 'Carte cadeau — administration',
};

export default async function AdminGiftCardPage({ params }) {
  const { requestId } = await params;

  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="max-w-content mx-auto flex w-full flex-col gap-10">
          <SectionEyebrow>Administration</SectionEyebrow>
          <Suspense
            fallback={
              <p className="font-montserrat text-body text-gray-800">
                Chargement…
              </p>
            }
          >
            <AdminGiftCardDetail requestId={requestId} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
