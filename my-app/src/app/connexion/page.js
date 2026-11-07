import { Suspense } from 'react';

import SignInPanel from '@/components/auth/SignInPanel';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

// Private area: never indexed, not in the sitemap.
export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="mx-auto flex w-full max-w-[28rem] flex-col gap-10">
          <SectionEyebrow>Espace client</SectionEyebrow>
          {/* The form reads ?retour= and ?mode=, which exist only in the
              browser: everything above stays in the server HTML. */}
          <Suspense
            fallback={
              <p className="font-montserrat text-body text-gray-800">
                Chargement…
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
