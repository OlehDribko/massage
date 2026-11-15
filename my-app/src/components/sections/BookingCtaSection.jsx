import PillButton from '@/components/ui/PillButton';
import { rich } from '@/i18n/rich';
import { getT } from '@/i18n/server';

/**
 * Closing call to book (replaces the former newsletter sign-up block of the
 * mock-up). Same dark band, no form: one action to the booking entry.
 */
export default function BookingCtaSection() {
  const t = getT();
  return (
    <section className="bg-secondary-900 px-page py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-3">
          <h2 className="text-section-title text-gray-50">
            {rich(t('Prenez <accent>rendez-vous</accent>'), {
              accent: (chunks) => (
                <span className="heading-accent">{chunks}</span>
              ),
            })}
          </h2>
          <p className="font-montserrat text-body text-gray-100">
            {t(
              'Choisissez votre soin, sa durée et l’horaire qui vous convient. La réservation est confirmée immédiatement ; le règlement se fait sur place, au cabinet.'
            )}
          </p>
        </div>
        <PillButton href="/reserver">{t('Prendre rendez-vous')}</PillButton>
      </div>
    </section>
  );
}
