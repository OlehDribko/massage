import { Suspense } from 'react';

import AdminDayBookings from '@/components/admin/AdminDayBookings';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';
import { getT, setRequestLocale } from '@/i18n/server';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang, { admin: true });
  return { title: t('Agenda du jour — administration') };
}

export default async function AdminDayPage({ params }) {
  setRequestLocale((await params).lang);
  const t = getT(undefined, { admin: true });
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
            <AdminDayBookings />
          </Suspense>
        </div>
      </main>
    </>
  );
}
