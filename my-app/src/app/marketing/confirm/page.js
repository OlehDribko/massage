import { Suspense } from 'react';

import Header from '@/components/layout/Header';
import MarketingLinkAction from '@/components/marketing/MarketingLinkAction';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

// Path fixed by the backend email links (${FRONTEND_URL}/marketing/confirm?token=…).
export const metadata = {
  title: 'Confirmer l’inscription',
  robots: { index: false, follow: false },
};

export default function MarketingConfirmPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-[36rem] flex-col gap-10">
          <SectionEyebrow>Newsletter</SectionEyebrow>
          <h1 className="text-section-title text-third-900">
            Confirmer votre <span className="heading-accent">inscription</span>
          </h1>
          <Suspense fallback={null}>
            <MarketingLinkAction action="confirm" />
          </Suspense>
        </div>
      </main>
    </>
  );
}
