import ClientBookings from '@/components/booking/ClientBookings';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';
import { getT, setRequestLocale } from '@/i18n/server';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang);
  return {
    title: t('Mes réservations'),
  };
}

export default async function ReservationsPage({ params }) {
  setRequestLocale((await params).lang);
  const t = getT();
  return (
    <>
      <Header variant="solid" />
      <main className="px-page bg-secondary-50 flex-1 py-12 sm:py-20">
        <div className="mx-auto flex w-full max-w-[56rem] flex-col gap-8">
          <SectionEyebrow>{t('Espace client')}</SectionEyebrow>
          <ClientBookings />
        </div>
      </main>
    </>
  );
}
