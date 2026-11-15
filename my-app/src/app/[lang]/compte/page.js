import { Suspense } from 'react';

import AccountPanel from '@/components/auth/AccountPanel';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';
import { getT, setRequestLocale } from '@/i18n/server';

// The profile is fetched in the browser for the signed-in user only — the
// server HTML contains no personal data.
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang);
  return {
    title: t('Mon compte'),
  };
}

export default async function ComptePage({ params }) {
  setRequestLocale((await params).lang);
  const t = getT();
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-10">
          <SectionEyebrow>{t('Espace client')}</SectionEyebrow>
          {/* Reads ?retour= (browser only). */}
          <Suspense
            fallback={
              <p className="font-montserrat text-body text-gray-800">
                {t('Chargement…')}
              </p>
            }
          >
            <AccountPanel />
          </Suspense>
        </div>
      </main>
    </>
  );
}
