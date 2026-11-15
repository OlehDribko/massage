import { Suspense } from 'react';

import SignInPanel from '@/components/auth/SignInPanel';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';
import { getT, setRequestLocale } from '@/i18n/server';

// Private area: never indexed, not in the sitemap.
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang);
  return {
    title: t('Connexion'),
    robots: { index: false, follow: false },
  };
}

export default async function ConnexionPage({ params }) {
  setRequestLocale((await params).lang);
  const t = getT();
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-[28rem] flex-col gap-10">
          <SectionEyebrow>{t('Espace client')}</SectionEyebrow>
          {/* The form reads ?retour= and ?mode=, which exist only in the
              browser: everything above stays in the server HTML. */}
          <Suspense
            fallback={
              <p className="font-montserrat text-body text-gray-800">
                {t('Chargement…')}
              </p>
            }
          >
            <SignInPanel />
          </Suspense>
        </div>
      </main>
    </>
  );
}
