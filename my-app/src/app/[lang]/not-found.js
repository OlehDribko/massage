import Header from '@/components/layout/Header';
import PillButton from '@/components/ui/PillButton';
import { SITE } from '@/config/site';
import { rich } from '@/i18n/rich';
import { getT } from '@/i18n/server';

// Next.js adds <meta name="robots" content="noindex"> to 404 responses
// itself. not-found has no params: the language is the one the [lang]
// layout set for this request; the title is rendered here (React hoists
// <title> into <head>).
export default function NotFound() {
  const t = getT();
  return (
    <>
      <title>{`${t('Page introuvable')} | ${SITE.name}`}</title>
      {/* Dark band keeps the overlay header readable, as on the hero. */}
      <Header variant="overlay" />
      <main className="bg-secondary-900 px-page flex flex-1 flex-col pt-40 pb-24 lg:pt-56">
        <div className="max-w-content mx-auto flex w-full flex-col gap-6">
          <p className="font-montserrat text-[16px] tracking-[0.16px] text-gray-100">
            {t('Erreur 404')}
          </p>
          <h1 className="text-section-title text-gray-50">
            {rich(t('Cette page est <accent>introuvable</accent>'), {
              accent: (chunks) => (
                <span className="heading-accent">{chunks}</span>
              ),
            })}
          </h1>
          <p className="font-montserrat max-w-xl text-[16px] leading-[1.5] text-gray-100">
            {t('Le lien est peut-être incorrect ou la page a été déplacée.')}
          </p>
          <div className="sm:gap-actions-inline flex flex-col gap-4 sm:flex-row sm:items-center">
            <PillButton href="/">{t('Retour à l’accueil')}</PillButton>
            <PillButton variant="text" href="/reserver" tone="light">
              {t('Prendre rendez-vous')}
            </PillButton>
          </div>
        </div>
      </main>
    </>
  );
}
