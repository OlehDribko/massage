import Header from '@/components/layout/Header';
import PillButton from '@/components/ui/PillButton';

// Next.js adds <meta name="robots" content="noindex"> to 404 responses itself.
export const metadata = {
  title: 'Page introuvable',
};

export default function NotFound() {
  return (
    <>
      {/* Dark band keeps the overlay header readable, as on the hero. */}
      <Header variant="overlay" />
      <main className="bg-secondary-900 px-page flex flex-1 flex-col pt-40 pb-24 lg:pt-56">
        <div className="max-w-content mx-auto flex w-full flex-col gap-6">
          <p className="font-montserrat text-[16px] tracking-[0.16px] text-gray-100">
            Erreur 404
          </p>
          <h1 className="text-section-title text-gray-50">
            Cette page est <span className="heading-accent">introuvable</span>
          </h1>
          <p className="font-montserrat max-w-xl text-[16px] leading-[1.5] text-gray-100">
            Le lien est peut-être incorrect ou la page a été déplacée.
          </p>
          <div className="sm:gap-actions-inline flex flex-col gap-4 sm:flex-row sm:items-center">
            <PillButton href="/">Retour à l&apos;accueil</PillButton>
            <PillButton variant="text" href="/reserver" tone="light">
              Prendre rendez-vous
            </PillButton>
          </div>
        </div>
      </main>
    </>
  );
}
