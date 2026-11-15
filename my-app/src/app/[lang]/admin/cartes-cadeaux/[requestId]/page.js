import { Suspense } from 'react';

import AdminGiftCardDetail from '@/components/admin/AdminGiftCardDetail';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';
import { getT, setRequestLocale } from '@/i18n/server';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang, { admin: true });
  return { title: t('Carte cadeau — administration') };
}

export default async function AdminGiftCardPage({ params }) {
  setRequestLocale((await params).lang);
  const t = getT(undefined, { admin: true });
  const { requestId } = await params;

  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="max-w-content mx-auto flex w-full flex-col gap-10">
          <SectionEyebrow>{t('Administration')}</SectionEyebrow>
          <Suspense
            fallback={
              <p className="font-montserrat text-body text-gray-800">
                {t('Chargement…')}
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
