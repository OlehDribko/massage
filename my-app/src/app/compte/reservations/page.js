import ClientBookings from '@/components/booking/ClientBookings';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

export const metadata = {
  title: 'Mes réservations',
};

export default function ReservationsPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="px-page bg-secondary-50 flex-1 py-12 sm:py-20">
        <div className="mx-auto flex w-full max-w-[56rem] flex-col gap-8">
          <SectionEyebrow>Espace client</SectionEyebrow>
          <ClientBookings />
        </div>
      </main>
    </>
  );
}
