import { Suspense } from 'react';

import Header from '@/components/layout/Header';
import MarketingLinkAction from '@/components/marketing/MarketingLinkAction';
import SectionEyebrow from '@/components/ui/SectionEyebrow';
import { rich } from '@/i18n/rich';
import { getT, setRequestLocale } from '@/i18n/server';

// Path fixed by the backend email links (${FRONTEND_URL}/unsubscribe?token=…).
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang);
  return {
    title: t('Désabonnement'),
    robots: { index: false, follow: false },
  };
}

export default async function UnsubscribePage({ params }) {
  setRequestLocale((await params).lang);
  const t = getT();
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-[36rem] flex-col gap-10">
          <SectionEyebrow>{t('Newsletter')}</SectionEyebrow>
          <h1 className="text-section-title text-third-900">
            {rich(t('Se <accent>désabonner</accent>'), {
              accent: (chunks) => (
                <span className="heading-accent">{chunks}</span>
              ),
            })}
          </h1>
          <Suspense fallback={null}>
            <MarketingLinkAction action="unsubscribe" />
          </Suspense>
        </div>
      </main>
    </>
  );
}
