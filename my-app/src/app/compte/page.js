import { Suspense } from 'react';

import AccountPanel from '@/components/auth/AccountPanel';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

// The profile is fetched in the browser for the signed-in user only — the
// server HTML contains no personal data.
export const metadata = {
  title: 'Mon compte',
};

export default function ComptePage() {
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-10">
          <SectionEyebrow>Espace client</SectionEyebrow>
          {/* Reads ?retour= (browser only). */}
          <Suspense
            fallback={
              <p className="font-montserrat text-body text-gray-800">
                Chargement…
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
