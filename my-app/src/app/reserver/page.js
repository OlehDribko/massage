import PlanityBooking from '@/components/integrations/planity/PlanityBooking';

export const metadata = {
  title: 'Réservation — Stefania',
  description: 'Réserver un massage chez Stefania à Bordeaux',
};

export default function ReserverPage() {
  return (
    <main className="planity-page mx-auto w-full max-w-4xl px-4 py-6">
      <h1 className="mb-2 text-center text-2xl font-semibold text-neutral-900">
        Réservation
      </h1>
      <p className="mb-6 text-center text-sm text-neutral-600">
        Stefania — 23 Rue Castéja, 33000 Bordeaux
      </p>
      <PlanityBooking />
    </main>
  );
}
